# kiro-database

Every KIRO database table: schemas, migrations, data models and database policies (PostgreSQL on Neon).

Part of KIRO (Kitchen Intelligence & Restaurant Operations). Owner: @kirotick. Migrated with full history from `kirotick/KIRO_POS` (commit `252de09`), see kiro-documentation/governance/REPOSITORY_MIGRATION_PLAN.md.

## What this repository owns
- `migrations/core/` (businesses, users, items, stock, sales; used by kiro-backend)
- `migrations/payments/` (gateways, bills, webhook events; used by kiro-payments)
- Migration runner `scripts/migrate.js` and read-only `scripts/db-info.js`

Nothing here may be copied into another KIRO repository; other repositories use it by version or through its API.

## Depends on
- Neon project **kiro**: branches `production`, `qa` (wiped by tests), `dev` (developer logins)

## Build
`npm ci`, then `DATABASE_URL=... npm run migrate` (or `migrate:core` / `migrate:payments`). Migrations only create what is missing: safe to repeat.

## Test
`npm test` with TEST_DATABASE_URL (Neon qa branch): applies on an empty database, re-applies with no change, checks the groups.

## Branches, reviews and releases
`main` is production and protected: changes arrive only by pull request with passing checks (see CONTRIBUTING.md). Versions follow semantic versioning; every release is a git tag `vMAJOR.MINOR.PATCH` with notes in CHANGELOG.md, so each deployment maps to one exact commit. Rollback = redeploy the previous tag.

## Security
See SECURITY.md. Never commit secrets: `.env` files are ignored, and secret scanning with push protection plus gitleaks in CI block them.
