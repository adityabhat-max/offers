const crypto = require("crypto");

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

let cachedToken = null; // { accessToken, expiresAt }

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function normalizePrivateKey(key) {
  const trimmed = (key || "").trim();
  if (trimmed.startsWith("-----BEGIN")) {
    return trimmed.includes("\\n") ? trimmed.replace(/\\n/g, "\n") : trimmed;
  }
  // Not raw PEM — assume it's the base64-encoded PEM (safe to paste as a
  // single line into env var UIs with no risk of newline/escaping mangling).
  return Buffer.from(trimmed, "base64").toString("utf8");
}

function buildAssertion(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claimSet))}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey).toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${unsigned}.${signature}`;
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30000) {
    return cachedToken.accessToken;
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "");
  if (!clientEmail || !privateKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY not set");
  }

  const assertion = buildAssertion(clientEmail, privateKey);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.accessToken;
}

async function fetchSheetRows(spreadsheetId, range) {
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets API request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.values || [];
}

function rowsToOffers(rows) {
  return rows
    .slice(1) // skip header row
    .map((row) => {
      const priceRaw = (row[3] || "").toString().trim();
      const price = priceRaw && !Number.isNaN(Number(priceRaw)) ? Number(priceRaw) : null;
      return {
        name: (row[0] || "").trim(),
        detail: (row[1] || "").trim(),
        subCategory: (row[2] || "").trim(),
        price,
      };
    })
    .filter((offer) => offer.name);
}

async function fetchOffersFromSheet() {
  const spreadsheetId = process.env.SHEET_ID;
  const range = process.env.SHEET_RANGE || "A:D";
  if (!spreadsheetId) {
    throw new Error("SHEET_ID not set");
  }
  const rows = await fetchSheetRows(spreadsheetId, range);
  return rowsToOffers(rows);
}

module.exports = { fetchOffersFromSheet, buildAssertion, rowsToOffers, getAccessToken };
