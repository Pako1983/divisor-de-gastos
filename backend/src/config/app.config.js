const FRONTEND_URL = process.env.FRONTEND_URL || "https://divisor-de-gastos.onrender.com";

const buildFrontendRedirectUrl = (params) => {
  const url = new URL(FRONTEND_URL);
  url.search = new URLSearchParams(params).toString();
  return url.toString();
};

module.exports = { FRONTEND_URL, buildFrontendRedirectUrl };
