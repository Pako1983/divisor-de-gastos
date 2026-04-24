const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM = process.env.BREVO_FROM || process.env.EMAIL_USER;
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME || "Divisor de Gastos";

// Envia correos usando la API HTTP de Brevo. Si falta configuracion, no rompe
// la accion principal de la app y devuelve un resultado controlado.
const sendEmail = async (to, subject, html, text = "") => {
  if (!BREVO_API_KEY) {
    console.warn("Skipping email send: BREVO_API_KEY not set");
    return { ok: false, skipped: true, provider: "brevo", reason: "BREVO_API_KEY not set" };
  }

  if (!BREVO_FROM) {
    console.warn("Skipping email send: BREVO_FROM not set");
    return { ok: false, skipped: true, provider: "brevo", reason: "BREVO_FROM not set" };
  }

  const payload = {
    sender: {
      name: BREVO_FROM_NAME,
      email: BREVO_FROM
    },
    to: [{ email: to }],
    subject
  };

  if (html) {
    payload.htmlContent = html;
  }

  if (text) {
    payload.textContent = text;
  }

  if (!payload.htmlContent && !payload.textContent) {
    payload.textContent = "Divisor de Gastos";
  }

  try {
    // Usamos fetch nativo de Node para evitar dependencias extra y mantener el backend simple.
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error("Brevo " + response.status + " " + response.statusText + ": " + body);
    }

    console.log("[Brevo] Email enviado a:", to);
    return { ok: true, provider: "brevo" };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { ok: false, provider: "brevo", error };
  }
};

module.exports = { sendEmail };
