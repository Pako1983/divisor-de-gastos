const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM = process.env.BREVO_FROM || process.env.EMAIL_USER;
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME || "Divisor de Gastos";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM || process.env.EMAIL_USER;

const buildContent = (html, text) => {
  const contents = [];

  if (text) {
    contents.push({ type: "text/plain", value: text });
  }

  if (html) {
    contents.push({ type: "text/html", value: html });
  }

  if (!contents.length) {
    contents.push({ type: "text/plain", value: "Divisor de Gastos" });
  }

  return contents;
};

const sendViaBrevo = async (to, subject, html, text = "") => {
  if (!BREVO_API_KEY) {
    return { ok: false, skipped: true, provider: "brevo", reason: "BREVO_API_KEY not set" };
  }

  if (!BREVO_FROM) {
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
};

const sendViaSendGrid = async (to, subject, html, text = "") => {
  if (!SENDGRID_API_KEY) {
    return { ok: false, skipped: true, provider: "sendgrid", reason: "SENDGRID_API_KEY not set" };
  }

  if (!SENDGRID_FROM) {
    return { ok: false, skipped: true, provider: "sendgrid", reason: "SENDGRID_FROM not set" };
  }

  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: SENDGRID_FROM },
    subject,
    content: buildContent(html, text)
  };

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + SENDGRID_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error("SendGrid " + response.status + " " + response.statusText + ": " + body);
  }

  console.log("[SendGrid] Email enviado a:", to);
  return { ok: true, provider: "sendgrid" };
};

const sendEmail = async (to, subject, html, text = "") => {
  try {
    if (BREVO_API_KEY) {
      return await sendViaBrevo(to, subject, html, text);
    }

    if (SENDGRID_API_KEY) {
      return await sendViaSendGrid(to, subject, html, text);
    }

    console.warn("Skipping email send: no email provider configured");
    return { ok: false, skipped: true, reason: "No email provider configured" };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { ok: false, error };
  }
};

module.exports = { sendEmail };
