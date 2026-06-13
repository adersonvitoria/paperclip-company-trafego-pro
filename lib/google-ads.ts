import 'server-only';
import { prisma } from './db';

// Cliente mínimo da Google Ads API (REST, v23) usando as credenciais salvas em Configurações.
// Docs: https://developers.google.com/google-ads/api/rest/overview

const API_VERSION = 'v23';

export type GoogleAdsConfig = {
  customerId: string;       // conta filha (onde as campanhas rodam)
  loginCustomerId: string;  // MCC (conta administradora) — vazio se acesso direto
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

export type CampaignRow = {
  id: string;
  name: string;
  status: string;
  channel: string;
  impressions: number;
  clicks: number;
  costBRL: number;
  conversions: number;
  conversionsValue: number;
};

export type AccountSnapshot = {
  customerId: string;
  period: string;
  campaigns: CampaignRow[];
  totals: {
    impressions: number;
    clicks: number;
    costBRL: number;
    conversions: number;
    conversionsValue: number;
    ctr: number;
    cpcBRL: number;
    cpaBRL: number | null;
    roas: number | null;
  };
};

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export async function getGoogleAdsConfig(): Promise<GoogleAdsConfig | null> {
  const keys = ['gads_customer_id', 'gads_login_customer_id', 'gads_developer_token', 'gads_client_id', 'gads_client_secret', 'gads_refresh_token'];
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const map = new Map(rows.map((r) => [r.key, r.value.trim()]));
  const cfg: GoogleAdsConfig = {
    customerId: onlyDigits(map.get('gads_customer_id') ?? ''),
    loginCustomerId: onlyDigits(map.get('gads_login_customer_id') ?? ''),
    developerToken: map.get('gads_developer_token') ?? '',
    clientId: map.get('gads_client_id') ?? '',
    clientSecret: map.get('gads_client_secret') ?? '',
    refreshToken: map.get('gads_refresh_token') ?? '',
  };
  if (!cfg.customerId || !cfg.developerToken || !cfg.clientId || !cfg.clientSecret || !cfg.refreshToken) {
    return null;
  }
  return cfg;
}

async function getAccessToken(cfg: GoogleAdsConfig): Promise<string> {
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    refresh_token: cfg.refreshToken,
    grant_type: 'refresh_token',
  });
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  });
  const data = await resp.json();
  if (!resp.ok || !data.access_token) {
    throw new Error(`OAuth falhou (${resp.status}): ${data.error_description ?? data.error ?? 'sem detalhe'}. Verifique Client ID/Secret e Refresh Token em Configurações.`);
  }
  return data.access_token as string;
}

export async function gaqlSearch(cfg: GoogleAdsConfig, query: string): Promise<any[]> {
  const accessToken = await getAccessToken(cfg);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': cfg.developerToken,
    'Content-Type': 'application/json',
  };
  if (cfg.loginCustomerId) headers['login-customer-id'] = cfg.loginCustomerId;

  const resp = await fetch(
    `https://googleads.googleapis.com/${API_VERSION}/customers/${cfg.customerId}/googleAds:search`,
    { method: 'POST', headers, body: JSON.stringify({ query }), cache: 'no-store' },
  );
  const data = await resp.json();
  if (!resp.ok) {
    const detail =
      data?.error?.details?.[0]?.errors?.[0]?.message ??
      data?.error?.message ??
      JSON.stringify(data).slice(0, 300);
    if (String(detail).includes('DEVELOPER_TOKEN_NOT_APPROVED') || String(detail).toLowerCase().includes('test accounts')) {
      throw new Error(
        'O Developer Token ainda está em modo de TESTE — só acessa contas de teste até o Google aprovar o acesso básico (Central de API da MCC). Detalhe: ' + detail,
      );
    }
    throw new Error(`Google Ads API ${resp.status}: ${detail}`);
  }
  return data.results ?? [];
}

const micros = (v: unknown): number => Number(v ?? 0) / 1_000_000;

export async function fetchAccountSnapshot(days: 30 | 7 = 30): Promise<AccountSnapshot> {
  const cfg = await getGoogleAdsConfig();
  if (!cfg) throw new Error('Credenciais do Google Ads incompletas — preencha em Configurações → Google Ads API.');

  const during = days === 7 ? 'LAST_7_DAYS' : 'LAST_30_DAYS';
  const results = await gaqlSearch(
    cfg,
    `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
            metrics.impressions, metrics.clicks, metrics.cost_micros,
            metrics.conversions, metrics.conversions_value
     FROM campaign
     WHERE segments.date DURING ${during}
     ORDER BY metrics.cost_micros DESC`,
  );

  const campaigns: CampaignRow[] = results.map((r: any) => ({
    id: String(r.campaign?.id ?? ''),
    name: String(r.campaign?.name ?? ''),
    status: String(r.campaign?.status ?? ''),
    channel: String(r.campaign?.advertisingChannelType ?? ''),
    impressions: Number(r.metrics?.impressions ?? 0),
    clicks: Number(r.metrics?.clicks ?? 0),
    costBRL: micros(r.metrics?.costMicros),
    conversions: Number(r.metrics?.conversions ?? 0),
    conversionsValue: Number(r.metrics?.conversionsValue ?? 0),
  }));

  const sum = (fn: (c: CampaignRow) => number) => campaigns.reduce((acc, c) => acc + fn(c), 0);
  const impressions = sum((c) => c.impressions);
  const clicks = sum((c) => c.clicks);
  const costBRL = sum((c) => c.costBRL);
  const conversions = sum((c) => c.conversions);
  const conversionsValue = sum((c) => c.conversionsValue);

  return {
    customerId: cfg.customerId,
    period: days === 7 ? 'últimos 7 dias' : 'últimos 30 dias',
    campaigns,
    totals: {
      impressions,
      clicks,
      costBRL,
      conversions,
      conversionsValue,
      ctr: impressions > 0 ? clicks / impressions : 0,
      cpcBRL: clicks > 0 ? costBRL / clicks : 0,
      cpaBRL: conversions > 0 ? costBRL / conversions : null,
      roas: costBRL > 0 ? conversionsValue / costBRL : null,
    },
  };
}

const brl = (v: number) => `R$ ${v.toFixed(2)}`;

// Resumo em markdown para injetar no contexto dos agentes
export function snapshotToMarkdown(s: AccountSnapshot): string {
  const t = s.totals;
  const lines = [
    `Conta ${s.customerId} — ${s.period} (dados reais via Google Ads API):`,
    `- Impressões: ${t.impressions} | Cliques: ${t.clicks} | CTR: ${(t.ctr * 100).toFixed(2)}%`,
    `- Custo: ${brl(t.costBRL)} | CPC médio: ${brl(t.cpcBRL)}`,
    `- Conversões: ${t.conversions}${t.cpaBRL !== null ? ` | CPA: ${brl(t.cpaBRL)}` : ''}${t.roas !== null ? ` | ROAS: ${t.roas.toFixed(2)}` : ''}`,
    '',
    'Campanhas:',
    ...(s.campaigns.length === 0
      ? ['(nenhuma campanha com atividade no período)']
      : s.campaigns.map(
          (c) =>
            `- [${c.status}] ${c.name} (${c.channel}): ${c.impressions} impr., ${c.clicks} cliques, ${brl(c.costBRL)}, ${c.conversions} conv.`,
        )),
  ];
  return lines.join('\n');
}
