# Offer Monthwise

A monthly "notice board" of Isaac Wellness offers, deployed on Vercel as a plain Node serverless function (no framework, no npm dependencies, no login).

The board reads live from a Google Sheet on every page load — edit the sheet and the change shows up on the site within about 20–60 seconds, no redeploy or manual pull needed. If the live fetch ever fails (bad credentials, sheet unreachable), it falls back to a bundled snapshot so the page never breaks.

## How it works

- `api/board.js` — serves the notice board at `/`. Tries a live sheet fetch first, falls back to `data/<YYYY-MM>.json` on error.
- `lib/sheets.js` — authenticates as a Google service account (JWT Bearer flow, signed with Node's built-in `crypto`, no dependencies) and reads the sheet via the Sheets API.
- `lib/render.js` — the HTML/CSS for the page (cream-and-maroon design system), including category grouping and the live search box.
- `data/<YYYY-MM>.json` — fallback snapshot only, used when the live fetch fails.
- `vercel.json` — routes `/` to `api/board.js`.

## Environment variables

| Variable | Purpose |
|---|---|
| `SHEET_ID` | The Google Sheet's spreadsheet ID (from its URL) |
| `SHEET_RANGE` | Optional, defaults to `A:C`. Use `"Tab Name!A:C"` if the sheet has multiple tabs |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | The service account's `client_email` (see setup below) |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | The service account's `private_key`, pasted as-is including the `BEGIN/END PRIVATE KEY` lines |
| `BOARD_MONTH` | Optional. Which `data/<YYYY-MM>.json` to use as the fallback snapshot, and what the page heading shows. Defaults to the current calendar month |

Set all of these in **Vercel → Project Settings → Environment Variables**, and in a local `.env` (gitignored) for `vercel dev`. Until `SHEET_ID`/`GOOGLE_SERVICE_ACCOUNT_*` are set, the board just uses the bundled fallback data — nothing breaks.

## Live sync setup (one-time, ~10 minutes)

The sheet stays private to your team — no "anyone with the link" sharing needed. Instead, a dedicated Google service account gets read-only access to just this sheet.

1. Go to [console.cloud.google.com](https://console.cloud.google.com), create a project (or reuse one).
2. **APIs & Services → Library** → search "Google Sheets API" → **Enable**.
3. **APIs & Services → Credentials → Create Credentials → Service Account**. Give it any name (e.g. "offers-board-reader"). No IAM roles needed — access is granted by sharing the sheet directly with it, not via project roles.
4. Open the new service account → **Keys → Add Key → Create new key → JSON**. This downloads a `.json` file containing `client_email` and `private_key`.
5. Open the Google Sheet → **Share** → add the service account's `client_email` (looks like `name@project-id.iam.gserviceaccount.com`) as **Viewer**.
6. In Vercel, add the four environment variables above using values from that JSON file, plus the sheet's ID from its URL.
7. **Deployments → latest → ⋯ → Redeploy** so the new env vars take effect.

From then on, editing that sheet updates the live board automatically — no further steps.

## Pointing at a new month's sheet

Each month has historically been its own Google Sheet (following the existing naming pattern — "April Offers", "July offers 2026", "August Offers", "September - Offers"). When a new one is created:

1. Share the new sheet with the same service account email (step 5 above) — the service account itself doesn't need to be recreated.
2. Update `SHEET_ID` (and `BOARD_MONTH`, if set) in Vercel to the new sheet's ID / month.
3. Redeploy.

If the new sheet's shape changes again, update `lib/sheets.js`'s column mapping and `lib/render.js`'s card markup to match — see "Sheet schema" below.

## Local development

```
npm install -g vercel   # one-time
cp .env.example .env    # fill in real values for live sync (optional for local testing)
vercel dev
```

Open `http://localhost:3000`.

## Deploying

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), "Add New… → Project" → import the GitHub repo.
3. Add the environment variables above (or skip them to run on fallback data only).
4. Deploy. Every future `git push` to the main branch redeploys automatically.

## Sheet schema

One row per offer, three columns — **Offer | Details | (sub-category)**. `Details` is free text: sometimes a price (`₹300`), sometimes a pricing rule (`Minimum ₹20,000`, `₹12,000 per session`), sometimes an approval note (`Approval required; reach out for approval`). The third column is blank for most rows; where filled in (e.g. `LHR` for the laser package rows), the board groups those offers into their own labeled section instead of one flat list. `lib/render.js`'s `CATEGORY_LABELS` map expands known codes (`LHR` → "Laser Hair Removal (LHR)"); unrecognized codes just display as-is.

This has varied between months (August's sheet used a different 3-column Treatment/Sessions/Price format) — if a future sheet changes shape again, update `lib/sheets.js`'s `rowsToOffers`, the fallback `data/<YYYY-MM>.json`, and `lib/render.js`'s card markup to match rather than forcing it into the old shape.

## Fallback data file format

`data/<YYYY-MM>.json` — only used when the live sheet fetch fails:

```json
{
  "offers": [
    { "name": "Botox", "detail": "₹300" },
    { "name": "42K – 1 Year Platinium / Titanium", "detail": "Can be approved at your end; no need to reach out for approval", "subCategory": "LHR" }
  ]
}
```

## Discount approval matrix

Shown as a banner on the board itself, for staff reference:

| Discount | Approval required |
|---|---|
| Up to 30% | Sales Manager |
| 31–50% | Clinic Head |
| Above 50% | Regional Director (RD) |
