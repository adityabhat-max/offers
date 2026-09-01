const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
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
  const total = offers.length;

  const statTiles = `
      <div class="stat-tile">
        <div class="stat-label">Total Offers</div>
        <div class="stat-value">${total}</div>
      </div>`;

  const approvalTiers = APPROVAL_TIERS.map((tier) => `
      <div class="approval-tier">
        <div class="approval-range">${escapeHtml(tier.range)}</div>
        <div class="approval-role">${escapeHtml(tier.role)}</div>
      </div>`).join("");

  const cards = offers.map((offer) => {
    const subCategoryTag = offer.subCategory
      ? `<div class="offer-subcategory">${escapeHtml(offer.subCategory)}</div>`
      : "";
    return `
      <div class="offer-card">
        ${subCategoryTag}
        <div class="offer-name">${escapeHtml(offer.name)}</div>
        <div class="offer-detail-row">
          <div class="offer-detail-label">Details</div>
          <div class="offer-detail">${escapeHtml(offer.detail)}</div>
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
  .offers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(258px, 1fr)); gap: 24px; align-items: start; }
  .offer-card { background: var(--card-bg); border: 1px solid var(--hairline); border-radius: 22px; box-shadow: var(--shadow-md); padding: 26px 26px 22px; transition: transform 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s cubic-bezier(0.4,0,0.2,1); }
  .offer-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
  .offer-subcategory { display: inline-block; font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--maroon-soft); background: var(--tag-bg); border-radius: 999px; padding: 4px 12px; margin-bottom: 12px; }
  .offer-name { font-family: var(--font-display); font-weight: 600; font-size: 18.5px; line-height: 1.35; }
  .offer-detail-row { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--hairline); }
  .offer-detail-label { font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--label); margin-bottom: 6px; }
  .offer-detail { font-size: 15px; font-weight: 600; line-height: 1.45; color: var(--maroon); }
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

module.exports = { renderBoardPage, monthLabel, escapeHtml };
