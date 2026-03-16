// URL publica del frontend que se utiliza para construir enlaces dentro de los correos.
const FRONTEND_URL = process.env.FRONTEND_URL || "https://divisor-de-gastos.onrender.com";

// Genera un enlace completo que incluye los parametros de redirección necesarios para el SPA.
const buildFrontendRedirectUrl = (params) => {
  const url = new URL(FRONTEND_URL);
  url.search = new URLSearchParams(params).toString();
  return url.toString();
};

module.exports = { FRONTEND_URL, buildFrontendRedirectUrl };
