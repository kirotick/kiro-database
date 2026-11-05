'use strict';
// Migration tests on a real PostgreSQL (TEST_DATABASE_URL, Neon branch "qa"; skipped without it):
// every migration applies on an empty database, applying again changes nothing, and core and payment
// tables are created by their own group only.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { execFileSync } = require('child_process');
const url = process.env.TEST_DATABASE_URL;
if (url && process.env.DATABASE_URL && url.trim() === process.env.DATABASE_URL.trim()) throw new Error('TEST_DATABASE_URL must not be production');

test('migrations: apply, re-apply, groups', { skip: !url }, async () => {
  const { Client } = require('pg');
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } }); await c.connect();
  const tables = async () => (await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1")).rows.map((r) => r.table_name);
  const run = (only) => execFileSync(process.execPath, [path.join(__dirname, '../scripts/migrate.js')], { env: { ...process.env, DATABASE_URL: url, KIRO_MIGRATE_ONLY: only || '' }, encoding: 'utf8' });
  try {
    await c.query('DROP TABLE IF EXISTS sale_line_lots, sale_lines, sales, stock_lots, items, users, businesses, phonepe_webhook_events, bills, merchant_payment_gateways CASCADE');
    run('core');
    const core = await tables();
    for (const t of ['businesses', 'users', 'items', 'stock_lots', 'sales', 'sale_lines', 'sale_line_lots']) assert.ok(core.includes(t), 'core table ' + t);
    assert.ok(!core.includes('bills'), 'core group does not create payment tables');
    run('payments');
    for (const t of ['bills', 'merchant_payment_gateways', 'phonepe_webhook_events']) assert.ok((await tables()).includes(t), 'payment table ' + t);
    const before = await tables();
    run(''); run('');
    assert.deepEqual(await tables(), before, 'applying twice changes nothing');
  } finally { await c.end(); }
});