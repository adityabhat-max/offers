# Offer Monthwise

A login-gated monthly "notice board" of Isaac Wellness offers, deployed on Vercel as plain Node serverless functions (no framework, no npm dependencies).

Each month has its own Google Sheet (following the existing naming pattern — "April Offers", "July offers 2026", "August Offers", etc.). Claude pulls that sheet's data into this repo, and the board renders it dynamically — no build step needed.

## How it works

- `api/board.js` — serves the notice board at `/`. Checks for a valid session cookie; redirects to `/login` if missing/expired.
- `api/login.js` — serves the login form at `/login` (GET) and validates credentials (POST), setting a signed session cookie on success.
- `api/logout.js` — clears the session cookie.
- `lib/auth.js` — session cookie signing/verification (HMAC-SHA256) and constant-time credential checks. Nothing is stored server-side; the cookie itself carries a signed expiry.
- `lib/render.js` — the HTML/CSS for both pages (shared cream-and-maroon design system).
- `data/<YYYY-MM>.json` — one file per month, the source of truth for that month's offers.
- `vercel.json` — routes `/`, `/login`, `/logout` to the functions above.

## Required environment variables

Set these in **Vercel → Project Settings → Environment Variables** before deploying, and in a local `.env` (gitignored) for `vercel dev`:

| Variable | Purpose |
|---|---|
| `AUTH_EMAIL` | The login email, e.g. `ITsupport@isaac-wellness.com` |
| `AUTH_PASSWORD` | The login password |
| `AUTH_SECRET` | Random string used to sign session cookies — keep it secret |
| `BOARD_MONTH` | Optional. Pins the board to a specific month (`2026-09`) instead of the current calendar month |

See `.env.example` for the template. **Never commit `.env`** — it's already in `.gitignore`.

## Local development

```
npm install -g vercel   # one-time
cp .env.example .env    # then fill in real values
vercel dev
```

Open `http://localhost:3000` — you'll be redirected to `/login`.

## Deploying

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), "Add New… → Project" → import the GitHub repo.
3. Add the three environment variables above in the import screen (or afterwards in Project Settings).
4. Deploy. Every future `git push` to the main branch redeploys automatically.

## Monthly refresh flow

1. Create/update the Google Sheet for the month (e.g. "September Offers"), following the schema below.
2. Share it with `aalimsh@isaac-wellness.com` (or set link sharing to "Anyone with the link").
3. Ask Claude to pull it — it reads the sheet via connected Google Drive access and writes/overwrites `data/<YYYY-MM>.json`.
4. Commit and push — Vercel redeploys automatically, or run `vercel dev` locally first to preview.
5. If `BOARD_MONTH` is set in Vercel's env vars, update it to the new month; otherwise the board auto-follows the current calendar month.

## Sheet schema

One row per offer/treatment. Matches the format already used in the existing monthly sheets:

| Column | Example |
|---|---|
| Treatment / Service Name | `Sculptra - Filler` |
| Sessions / Type (optional, often blank) | `10 sessions`, `Injectable` |
| Selling Price | `35999` |

If a future sheet adds more columns (category, MRP for a discount comparison, validity dates), extend `data/<YYYY-MM>.json`, the offer object shape, and `lib/render.js`'s card markup to surface them rather than dropping them.

## Data file format

`data/<YYYY-MM>.json`:

```json
{
  "offers": [
    { "name": "Sculptra - Filler", "type": "Injectable", "price": 35999 },
    { "name": "Msculpt Neo", "type": "10 sessions", "price": 110000 }
  ]
}
```

`type` may be an empty string when the sheet doesn't specify sessions/type for that row.

> `data/2026-09.json` currently holds **placeholder data** copied from the real "August Offers" sheet, just to preview the design. Replace it with the real September data once that sheet is accessible.

## Discount approval matrix

Shown as a banner on the board itself, for staff reference:

| Discount | Approval required |
|---|---|
| Up to 30% | Sales Manager |
| 31–50% | Clinic Head |
| Above 50% | Regional Director (RD) |
