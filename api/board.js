const fs = require("fs");
const path = require("path");
const { renderBoardPage } = require("../lib/render");
const { fetchOffersFromSheet } = require("../lib/sheets");

function resolveMonthKey() {
  if (process.env.BOARD_MONTH) return process.env.BOARD_MONTH;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function loadFallbackOffers(monthKey) {
  const dataPath = path.join(process.cwd(), "data", `${monthKey}.json`);
  if (!fs.existsSync(dataPath)) return [];
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  return Array.isArray(raw) ? raw : raw.offers || [];
}

module.exports = async (req, res) => {
  const monthKey = resolveMonthKey();
  let offers;

  try {
    offers = await fetchOffersFromSheet();
  } catch (err) {
    console.error("Live sheet fetch failed, using bundled fallback data:", err.message);
    offers = loadFallbackOffers(monthKey);
  }

  const html = renderBoardPage(monthKey, offers);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=20, stale-while-revalidate=60");
  res.status(200).send(html);
};
