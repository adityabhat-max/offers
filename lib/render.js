const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const APPROVAL_TIERS = [
  { range: "Up to 30%", role: "Sales Manager" },
  { range: "31–50%", role: "Clinic Head" },
  { range: "Above 50%", role: "Regional Director (RD)" },
];

const FONT_LINKS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;

const SHARED_STYLES = `
  :root {
    --bg-1: #f9f3ea;
    --bg-2: #f0e2d3;
    --card-bg: #fffdfb;
    --maroon: #7a1f38;
    --maroon-soft: #a3495f;
    --tag-bg: #f4e5df;
    --label: #9c8f80;
    --text: #2b2420;
    --hairline: rgba(122, 31, 56, 0.10);
    --shadow-md: 0 14px 34px -10px rgba(58, 32, 20, 0.16), 0 2px 8px rgba(58, 32, 20, 0.05);
    --shadow-lg: 0 26px 48px -14px rgba(58, 32, 20, 0.22), 0 6px 16px rgba(58, 32, 20, 0.08);
    --font-display: "Fraunces", Georgia, "Times New Roman", serif;
    --font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    background: radial-gradient(circle at 18% -8%, var(--bg-1) 0%, var(--bg-2) 72%);
    font-family: var(--font-body);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }`;

function renderBoardPage(monthKey, offers) {
  const label = monthLabel(monthKey);
  const prices = offers.map((o) => o.price);
  const total = offers.length;
  const priceRange = total > 0
    ? `${formatPrice(Math.min(...prices))} – ${formatPrice(Math.max(...prices))}`
    : "—";

  const statTiles = `
      <div class="stat-tile">
        <div class="stat-label">Total Offers</div>
        <div class="stat-value">${total}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-label">Price Range</div>
        <div class="stat-value">${priceRange}</div>
      </div>`;

  const approvalTiers = APPROVAL_TIERS.map((tier) => `
      <div class="approval-tier">
        <div class="approval-range">${escapeHtml(tier.range)}</div>
        <div class="approval-role">${escapeHtml(tier.role)}</div>
      </div>`).join("");

  const cards = offers.map((offer) => {
    const typeTag = offer.type
      ? `<div class="offer-type">${escapeHtml(offer.type)}</div>`
      : "";
    return `
      <div class="offer-card">
        <div class="offer-card-top">
          ${typeTag}
          <div class="offer-name">${escapeHtml(offer.name)}</div>
        </div>
        <div class="offer-price-row">
          <div class="offer-price-label">Price</div>
          <div class="offer-price">${formatPrice(offer.price)}</div>
        </div>
      </div>`;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(label)} Offers — Isaac Wellness</title>
${FONT_LINKS}
<style>
${SHARED_STYLES}
  body { padding: 56px 32px 72px; }
  .page { max-width: 1160px; margin: 0 auto; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 40px; }
  .eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--maroon-soft); margin-bottom: 12px; }
  .page-title { font-family: var(--font-display); font-weight: 600; font-size: clamp(30px, 4vw, 40px); line-height: 1.15; margin: 0 0 10px; text-wrap: balance; }
  .page-subtitle { font-size: 14.5px; color: var(--label); margin: 0; }
  .logout-link { font-size: 13px; font-weight: 600; color: var(--maroon-soft); text-decoration: none; border: 1px solid var(--hairline); border-radius: 999px; padding: 8px 16px; white-space: nowrap; transition: background 0.2s ease; }
  .logout-link:hover { background: var(--tag-bg); }
  .stats-row { display: flex; flex-wrap: wrap; gap: 18px; margin-bottom: 24px; }
  .stat-tile { background: var(--card-bg); border: 1px solid var(--hairline); border-radius: 18px; box-shadow: var(--shadow-md); padding: 20px 28px; min-width: 190px; }
  .stat-label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--label); margin-bottom: 10px; }
  .stat-value { font-size: 26px; font-weight: 700; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; color: var(--maroon); }
  .approval-banner { background: var(--card-bg); border: 1px solid var(--hairline); border-radius: 20px; box-shadow: var(--shadow-md); padding: 22px 28px; margin-bottom: 44px; }
  .approval-banner-title { font-size: 11.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--label); margin-bottom: 18px; }
  .approval-tiers { display: flex; flex-wrap: wrap; }
  .approval-tier { flex: 1 1 180px; padding: 0 26px; border-left: 1px solid var(--hairline); }
  .approval-tier:first-child { border-left: none; padding-left: 0; }
  .approval-range { font-family: var(--font-display); font-weight: 600; font-size: 19px; color: var(--maroon); margin-bottom: 4px; }
  .approval-role { font-size: 13.5px; color: var(--text); }
  .offers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(258px, 1fr)); gap: 24px; }
  .offer-card { display: flex; flex-direction: column; min-height: 156px; background: var(--card-bg); border: 1px solid var(--hairline); border-radius: 22px; box-shadow: var(--shadow-md); padding: 26px 26px 22px; transition: transform 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s cubic-bezier(0.4,0,0.2,1); }
  .offer-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
  .offer-type { display: inline-block; font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--maroon-soft); background: var(--tag-bg); border-radius: 999px; padding: 4px 12px; margin-bottom: 12px; }
  .offer-name { font-family: var(--font-display); font-weight: 600; font-size: 18.5px; line-height: 1.35; }
  .offer-price-row { margin-top: auto; padding-top: 16px; border-top: 1px solid var(--hairline); }
  .offer-price-label { font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--label); margin-bottom: 4px; }
  .offer-price { font-size: 23px; font-weight: 700; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; color: var(--maroon); }
  @media (prefers-reduced-motion: reduce) { .offer-card { transition: none; } }
  @media (max-width: 520px) { .approval-tier { flex: 1 1 100%; border-left: none; border-top: 1px solid var(--hairline); padding: 14px 0 0; margin-top: 14px; } .approval-tier:first-child { border-top: none; margin-top: 0; padding-top: 0; } }
</style>
</head>
<body>
  <div class="page">
    <div class="page-header">
      <div>
        <div class="eyebrow">Isaac Wellness</div>
        <h1 class="page-title">${escapeHtml(label)} Offers</h1>
        <p class="page-subtitle">Notice board generated from the monthly offers sheet</p>
      </div>
      <a class="logout-link" href="/logout">Log out</a>
    </div>
    <div class="stats-row">${statTiles}
    </div>
    <div class="approval-banner">
      <div class="approval-banner-title">Discount Approval Matrix</div>
      <div class="approval-tiers">${approvalTiers}
      </div>
    </div>
    <div class="offers-grid">${cards}
    </div>
  </div>
</body>
</html>
`;
}

function renderLoginPage({ error } = {}) {
  const errorBlock = error
    ? `<div class="error">${escapeHtml(error)}</div>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign In — Isaac Wellness</title>
${FONT_LINKS}
<style>
${SHARED_STYLES}
  body { display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card { width: 100%; max-width: 380px; background: var(--card-bg); border: 1px solid var(--hairline); border-radius: 24px; box-shadow: var(--shadow-lg); padding: 40px 36px; }
  .eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--maroon-soft); margin-bottom: 12px; text-align: center; }
  .title { font-family: var(--font-display); font-weight: 600; font-size: 26px; margin: 0 0 8px; text-align: center; }
  .subtitle { font-size: 13.5px; color: var(--label); margin: 0 0 28px; text-align: center; }
  label { display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--label); margin-bottom: 8px; }
  input { width: 100%; font-family: var(--font-body); font-size: 15px; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--hairline); background: #fff; color: var(--text); margin-bottom: 20px; }
  input:focus { outline: 2px solid var(--maroon-soft); outline-offset: 1px; }
  button { width: 100%; font-family: var(--font-body); font-size: 15px; font-weight: 600; color: #fff; background: var(--maroon); border: none; border-radius: 12px; padding: 13px; cursor: pointer; transition: background 0.2s ease; }
  button:hover { background: var(--maroon-soft); }
  .error { background: var(--tag-bg); color: var(--maroon); border-radius: 10px; padding: 10px 14px; font-size: 13.5px; margin-bottom: 20px; text-align: center; }
</style>
</head>
<body>
  <form class="card" method="POST" action="/login">
    <div class="eyebrow">Isaac Wellness</div>
    <div class="title">Offers Notice Board</div>
    <p class="subtitle">Sign in to view this month's offers</p>
    ${errorBlock}
    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="username" required>
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required>
    <button type="submit">Sign in</button>
  </form>
</body>
</html>
`;
}

module.exports = { renderBoardPage, renderLoginPage, monthLabel, formatPrice, escapeHtml };
