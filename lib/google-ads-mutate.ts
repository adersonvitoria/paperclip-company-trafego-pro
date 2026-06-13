import 'server-only';
import { API_VERSION, getAccessToken, getGoogleAdsConfig, type GoogleAdsConfig } from './google-ads';

// Publicação de campanhas Search na Google Ads API (v23) via mutate atômico.
// A campanha é criada SEMPRE como PAUSED — nada gasta até revisão humana no
// Google Ads. validateOnly=true faz preview (valida sem aplicar).
// Docs: https://developers.google.com/google-ads/api/rest/common/mutating

export type MatchType = 'BROAD' | 'PHRASE' | 'EXACT';

export type CampaignPlan = {
  campaignName: string;
  dailyBudgetBRL: number;
  defaultCpcBidBRL: number; // lance de CPC manual padrão por grupo
  finalUrl: string;
  adGroups: Array<{
    name: string;
    cpcBidBRL?: number;
    keywords: Array<{ text: string; matchType: MatchType }>;
    negativeKeywords?: Array<{ text: string; matchType: MatchType }>;
    headlines: string[];   // 3–15, ≤30 chars
    descriptions: string[]; // 2–4, ≤90 chars
    path1?: string;
    path2?: string;
  }>;
};

const brlToMicros = (brl: number): number => Math.round(brl * 1_000_000);

export type PlanIssue = { level: 'error' | 'warn'; message: string };

// Valida o plano contra as regras do Google Ads (limites de RSA, match types, etc.)
export function validatePlan(plan: CampaignPlan): PlanIssue[] {
  const issues: PlanIssue[] = [];
  if (!plan.campaignName?.trim()) issues.push({ level: 'error', message: 'campaignName vazio.' });
  if (!(plan.dailyBudgetBRL > 0)) issues.push({ level: 'error', message: 'dailyBudgetBRL deve ser > 0.' });
  if (!(plan.defaultCpcBidBRL > 0)) issues.push({ level: 'error', message: 'defaultCpcBidBRL deve ser > 0.' });
  if (!/^https?:\/\//i.test(plan.finalUrl ?? '')) issues.push({ level: 'error', message: 'finalUrl deve começar com http(s)://.' });
  if (!plan.adGroups?.length) issues.push({ level: 'error', message: 'Nenhum grupo de anúncio.' });

  plan.adGroups?.forEach((ag, i) => {
    const tag = `Grupo ${i + 1} "${ag.name ?? ''}"`;
    if (!ag.name?.trim()) issues.push({ level: 'error', message: `${tag}: nome vazio.` });
    if (!ag.keywords?.length) issues.push({ level: 'error', message: `${tag}: sem keywords.` });
    const h = (ag.headlines ?? []).filter((x) => x?.trim());
    const d = (ag.descriptions ?? []).filter((x) => x?.trim());
    if (h.length < 3) issues.push({ level: 'error', message: `${tag}: RSA exige ≥3 headlines (tem ${h.length}).` });
    if (h.length > 15) issues.push({ level: 'warn', message: `${tag}: >15 headlines — só as 15 primeiras serão usadas.` });
    if (d.length < 2) issues.push({ level: 'error', message: `${tag}: RSA exige ≥2 descriptions (tem ${d.length}).` });
    if (d.length > 4) issues.push({ level: 'warn', message: `${tag}: >4 descriptions — só as 4 primeiras serão usadas.` });
    h.forEach((x) => { if (x.length > 30) issues.push({ level: 'error', message: `${tag}: headline >30 chars: "${x}".` }); });
    d.forEach((x) => { if (x.length > 90) issues.push({ level: 'error', message: `${tag}: description >90 chars: "${x}".` }); });
    [ag.path1, ag.path2].forEach((p) => { if (p && p.length > 15) issues.push({ level: 'error', message: `${tag}: path >15 chars: "${p}".` }); });
  });
  return issues;
}

// Monta as operações do mutate atômico usando resource names temporários (IDs negativos).
export function buildMutateOperations(customerId: string, plan: CampaignPlan): unknown[] {
  const cid = customerId;
  const rn = (entity: string, tempId: number) => `customers/${cid}/${entity}/${tempId}`;
  const ops: unknown[] = [];

  const BUDGET = rn('campaignBudgets', -1);
  const CAMPAIGN = rn('campaigns', -2);

  ops.push({
    campaignBudgetOperation: {
      create: {
        resourceName: BUDGET,
        name: `${plan.campaignName} — Orçamento`,
        amountMicros: brlToMicros(plan.dailyBudgetBRL),
        deliveryMethod: 'STANDARD',
        explicitlyShared: false,
      },
    },
  });

  ops.push({
    campaignOperation: {
      create: {
        resourceName: CAMPAIGN,
        name: plan.campaignName,
        status: 'PAUSED', // SEGURANÇA: nada veicula até revisão humana
        advertisingChannelType: 'SEARCH',
        campaignBudget: BUDGET,
        manualCpc: { enhancedCpcEnabled: false },
        networkSettings: {
          targetGoogleSearch: true,
          targetSearchNetwork: false,
          targetContentNetwork: false,
          targetPartnerSearchNetwork: false,
        },
      },
    },
  });

  let temp = -100;
  plan.adGroups.forEach((ag) => {
    const AG = rn('adGroups', temp--);
    ops.push({
      adGroupOperation: {
        create: {
          resourceName: AG,
          name: ag.name,
          campaign: CAMPAIGN,
          status: 'ENABLED',
          type: 'SEARCH_STANDARD',
          cpcBidMicros: brlToMicros(ag.cpcBidBRL ?? plan.defaultCpcBidBRL),
        },
      },
    });

    ag.keywords.forEach((kw) => {
      ops.push({
        adGroupCriterionOperation: {
          create: { adGroup: AG, status: 'ENABLED', keyword: { text: kw.text, matchType: kw.matchType } },
        },
      });
    });

    (ag.negativeKeywords ?? []).forEach((kw) => {
      ops.push({
        adGroupCriterionOperation: {
          create: { adGroup: AG, negative: true, keyword: { text: kw.text, matchType: kw.matchType } },
        },
      });
    });

    const ad: Record<string, unknown> = {
      finalUrls: [plan.finalUrl],
      responsiveSearchAd: {
        headlines: ag.headlines.slice(0, 15).map((t) => ({ text: t })),
        descriptions: ag.descriptions.slice(0, 4).map((t) => ({ text: t })),
        ...(ag.path1 ? { path1: ag.path1 } : {}),
        ...(ag.path2 ? { path2: ag.path2 } : {}),
      },
    };
    ops.push({ adGroupAdOperation: { create: { adGroup: AG, status: 'ENABLED', ad } } });
  });

  return ops;
}

export type PublishResult = {
  ok: boolean;
  validateOnly: boolean;
  operations: number;
  resourceNames?: string[];
  error?: string;
};

// Executa o mutate atômico. validateOnly=true valida sem aplicar (preview real na API).
export async function publishCampaign(
  plan: CampaignPlan,
  opts: { validateOnly: boolean },
  cfgOverride?: GoogleAdsConfig,
): Promise<PublishResult> {
  const cfg = cfgOverride ?? (await getGoogleAdsConfig());
  if (!cfg) throw new Error('Credenciais do Google Ads incompletas — preencha em Configurações → Google Ads API.');

  const issues = validatePlan(plan);
  const errors = issues.filter((i) => i.level === 'error');
  if (errors.length) {
    return { ok: false, validateOnly: opts.validateOnly, operations: 0, error: 'Plano inválido: ' + errors.map((e) => e.message).join(' | ') };
  }

  const operations = buildMutateOperations(cfg.customerId, plan);
  const accessToken = await getAccessToken(cfg);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': cfg.developerToken,
    'Content-Type': 'application/json',
  };
  if (cfg.loginCustomerId) headers['login-customer-id'] = cfg.loginCustomerId;

  const resp = await fetch(
    `https://googleads.googleapis.com/${API_VERSION}/customers/${cfg.customerId}/googleAds:mutate`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        mutateOperations: operations,
        validateOnly: opts.validateOnly,
        responseContentType: 'RESOURCE_NAME_ONLY',
      }),
      cache: 'no-store',
    },
  );
  const data = await resp.json();

  if (!resp.ok) {
    const detail =
      data?.error?.details?.[0]?.errors?.[0]?.message ??
      data?.error?.message ??
      JSON.stringify(data).slice(0, 400);
    if (String(detail).toLowerCase().includes('test accounts')) {
      return { ok: false, validateOnly: opts.validateOnly, operations: operations.length, error: 'Developer Token ainda em modo TESTE — aguardando aprovação do acesso básico do Google. ' + detail };
    }
    return { ok: false, validateOnly: opts.validateOnly, operations: operations.length, error: `Google Ads API ${resp.status}: ${detail}` };
  }

  const resourceNames: string[] = (data.mutateOperationResponses ?? [])
    .map((r: any) => r?.campaignResult?.resourceName ?? r?.campaignBudgetResult?.resourceName)
    .filter(Boolean);

  return { ok: true, validateOnly: opts.validateOnly, operations: operations.length, resourceNames };
}
