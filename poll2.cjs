const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
for (const line of fs.readFileSync('.env.local','utf8').split(/\r?\n/)) {
  const m = line.match(/^DATABASE_URL="?([^"]+)"?$/); if (m) process.env.DATABASE_URL = m[1];
}
const p = new PrismaClient();
p.pipelineRun.findUnique({ where: { id: 'cmqbnth9v0000la046s22qxae' } }).then(r => {
  const steps = JSON.parse(r.steps);
  console.log(`auto=${r.auto} steps=${steps.length} status=${r.status} erro=${r.error ? r.error.slice(0,100) : 'nenhum'}`);
  return p.$disconnect();
});
