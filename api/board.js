const fs = require("fs");
const path = require("path");
const { renderBoardPage } = require("../lib/render");

function resolveMonthKey() {
  if (process.env.BOARD_MONTH) return process.env.BOARD_MONTH;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

module.exports = (req, res) => {
  const monthKey = resolveMonthKey();
  const dataPath = path.join(process.cwd(), "data", `${monthKey}.json`);

  let offers = [];
  if (fs.existsSync(dataPath)) {
    const raw = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    offers = Array.isArray(raw) ? raw : raw.offers || [];
  }

  const html = renderBoardPage(monthKey, offers);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
};
