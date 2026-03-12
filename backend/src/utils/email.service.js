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

// =========================
//  ENVÍO DE EMAIL (SendGrid API)
// =========================
const sendEmail = async (to, subject, html, text = "") => {
  if (!SENDGRID_API_KEY) {
    console.warn("Skipping email send: SENDGRID_API_KEY not set");
    return;
  }

  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: SENDGRID_FROM },
    subject,
    content: buildContent(html, text)
  };

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + SENDGRID_API_KEY + "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error("SendGrid " + response.status + " " + response.statusText + ": " + body);
    }

    console.log("Email enviado a:", to);
  } catch (error) {
    console.error("Error enviando email:", error);
  }
};

module.exports = { sendEmail };
