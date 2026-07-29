# Braun Portal production deployment

Target architecture:

- Public website: `braunblinds.com`
- Private business portal: `portal.braunblinds.com`
- Shipping center: `portal.braunblinds.com/shipping`
- Source: GitHub `main`
- Runtime: Cloudflare Workers

## Required GitHub repository secrets

Add these under **Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `SHIPPO_API_TOKEN`

The Cloudflare token should have permission to edit Workers. The Shippo token must stay server-side and must never be added to browser code.

## First deployment

1. Add all three repository secrets.
2. Open **Actions → Deploy Braun Portal**.
3. Choose **Run workflow**.
4. Confirm the generated Cloudflare Worker URL works.
5. In Cloudflare, attach `portal.braunblinds.com` as a custom domain.
6. Keep the current ChatGPT Sites portal available until the new portal is verified.

## DNS migration

Do not replace the public `braunblinds.com` website during the first release. Add a new DNS record for `portal.braunblinds.com` and point only that subdomain to the new Cloudflare Worker. After login, data, calculators, invoices, shipping, and mobile use are confirmed, update the public site's “智能门户” button to the new portal URL.

## Rollback

If the new portal has a problem, restore the “智能门户” link to the existing ChatGPT Sites URL. The public website and old private portal remain unchanged during the staged migration.
