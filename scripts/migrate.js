'use strict';
// Applies KIRO database migrations in filename order. Each file only creates what is missing, so it is safe to
// run on every deploy. Usage: DATABASE_URL=postgres://... node scripts/migrate.js
//   KIRO_MIGRATE_ONLY=core      only migrations/core     (run by kiro-backend)
//   KIRO_MIGRATE_ONLY=payments  only migrations/payments (run by kiro-payments)
//   (unset)                     everything
const fs = require('fs'); const path = require('path'); const { Client } = require('pg');
(async () => {
  const url = process.env.DATABASE_URL; if (!url) { console.error('DATABASE_URL is not set'); process.exit(1); }
  const only = process.env.KIRO_MIGRATE_ONLY;
  const root = path.join(__dirname, '../migrations');
  const groups = fs.readdirSync(root).filter((g) => fs.statSync(path.join(root, g)).isDirectory() && (!only || g === only));
  if (only && !groups.length) { console.error(`no migrations/${only} folder`); process.exit(1); }
  const files = groups.flatMap((g) => fs.readdirSync(path.join(root, g)).filter((x) => /^\d+_.*\.sql$/.test(x)).map((x) => ({ g, x })))
    .sort((a, b) => a.x.localeCompare(b.x));
  const ssl = /localhost|127\.0\.0\.1/.test(url) || process.env.PGSSLMODE === 'disable' ? undefined : { rejectUnauthorized: false };
  const c = new Client({ connectionString: url, ssl }); await c.connect();
  try {
    for (const { g, x } of files) {
      process.stdout.write(`migration ${g}/${x} ... `); await c.query(fs.readFileSync(path.join(root, g, x), 'utf8')); console.log('ok');
    }
  } finally { await c.end(); }
})().catch((e) => { console.error('migration failed:', e.message); process.exit(1); });