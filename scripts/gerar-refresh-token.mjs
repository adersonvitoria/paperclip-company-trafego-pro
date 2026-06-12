#!/usr/bin/env node
// Gera o OAuth Refresh Token da Google Ads API (fluxo "app para computador").
//
// Uso:
//   node scripts/gerar-refresh-token.mjs <CLIENT_ID> <CLIENT_SECRET>
//
// O script abre uma URL de autorização (faça login com a conta Google dona do
// Google Ads), recebe o código de volta em http://localhost:8585 e imprime o
// refresh token — cole-o no console TráfegoPRO em Configurações → Google Ads API.
//
// Sem dependências externas: usa apenas os módulos nativos do Node 18+.

import http from 'node:http';
import { exec } from 'node:child_process';

const [clientId, clientSecret] = process.argv.slice(2);
if (!clientId || !clientSecret) {
  console.error('Uso: node scripts/gerar-refresh-token.mjs <CLIENT_ID> <CLIENT_SECRET>');
  process.exit(1);
}

const PORT = 8585;
const REDIRECT_URI = `http://localhost:${PORT}`;
const SCOPE = 'https://www.googleapis.com/auth/adwords';

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth' +
  `?client_id=${encodeURIComponent(clientId)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  '&response_type=code' +
  `&scope=${encodeURIComponent(SCOPE)}` +
  '&access_type=offline' +
  '&prompt=consent';

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', REDIRECT_URI);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.end(`Autorização negada: ${error}. Pode fechar esta aba.`);
    console.error(`\n❌ Autorização negada: ${error}`);
    server.close();
    process.exit(1);
  }
  if (!code) {
    res.end('Aguardando autorização...');
    return;
  }

  res.end('✅ Autorizado! Pode fechar esta aba e voltar ao terminal.');
  server.close();

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await resp.json();

  if (!resp.ok || !data.refresh_token) {
    console.error('\n❌ Falha ao trocar o código por tokens:');
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log('✅ REFRESH TOKEN (cole no console TráfegoPRO):');
  console.log('\n' + data.refresh_token + '\n');
  console.log('══════════════════════════════════════════════════');
  console.log('Guarde com segurança — ele dá acesso à sua conta Google Ads.');
  process.exit(0);
});

server.listen(PORT, () => {
  console.log('1. Abrindo o navegador para autorizar (faça login com a conta do Google Ads)...');
  console.log('   Se não abrir sozinho, copie e cole esta URL:\n');
  console.log(authUrl + '\n');
  console.log(`2. Aguardando o retorno em ${REDIRECT_URI} ...`);
  const opener = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${opener} "${authUrl.replaceAll('"', '%22')}"`);
});
