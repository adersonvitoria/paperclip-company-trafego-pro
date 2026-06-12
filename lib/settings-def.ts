// Definição das configurações editáveis via tela, agrupadas por seção

export type SettingField = {
  key: string;
  label: string;
  secret?: boolean;
  required?: boolean;
  placeholder?: string;
  help?: string;
};

export type SettingSection = {
  title: string;
  description: string;
  fields: SettingField[];
};

export const SETTING_SECTIONS: SettingSection[] = [
  {
    title: 'Inteligência Artificial',
    description: 'Chave da API da Anthropic — obrigatória para os agentes executarem os pipelines.',
    fields: [
      { key: 'anthropic_api_key', label: 'Anthropic API Key', secret: true, required: true, placeholder: 'sk-ant-...', help: 'Crie em console.anthropic.com → API Keys. Precisa de créditos na conta.' },
    ],
  },
  {
    title: 'Google Ads API',
    description: 'Credenciais para integração futura com a conta Google Ads (leitura de métricas e publicação). Os pipelines geram blueprints mesmo sem isso.',
    fields: [
      { key: 'gads_customer_id', label: 'Customer ID', placeholder: '123-456-7890' },
      { key: 'gads_developer_token', label: 'Developer Token', secret: true },
      { key: 'gads_client_id', label: 'OAuth Client ID' },
      { key: 'gads_client_secret', label: 'OAuth Client Secret', secret: true },
      { key: 'gads_refresh_token', label: 'OAuth Refresh Token', secret: true },
    ],
  },
  {
    title: 'Mensuração',
    description: 'Identificadores usados pelo Engenheiro de Mensuração nos planos de tracking.',
    fields: [
      { key: 'ga4_property_id', label: 'GA4 Property ID', placeholder: '123456789' },
      { key: 'gtm_container_id', label: 'GTM Container ID', placeholder: 'GTM-XXXXXXX' },
      { key: 'site_url', label: 'URL do site / landing page', placeholder: 'https://...' },
    ],
  },
  {
    title: 'Negócio, Metas & Guardrails',
    description: 'Contexto que os agentes usam em todos os pipelines.',
    fields: [
      { key: 'empresa_nome', label: 'Nome do negócio / cliente' },
      { key: 'empresa_nicho', label: 'Nicho / produto principal' },
      { key: 'verba_mensal', label: 'Verba mensal de mídia (R$)', placeholder: '3000' },
      { key: 'cpa_alvo', label: 'CPA alvo (R$)', placeholder: '50' },
      { key: 'roas_alvo', label: 'ROAS alvo', placeholder: '4' },
      { key: 'geografia', label: 'Geografia alvo', placeholder: 'Vitória/ES e região' },
    ],
  },
];

export const ALL_SETTING_FIELDS: SettingField[] = SETTING_SECTIONS.flatMap((s) => s.fields);

export function isSecretKey(key: string): boolean {
  return ALL_SETTING_FIELDS.find((f) => f.key === key)?.secret === true;
}
