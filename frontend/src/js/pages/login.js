import { showModal } from "../components/modal.js";
import { API_URL } from "../config.js";
// Ruta guardada por otros flujos para redireccionar despues del login.
const pendingRedirect = JSON.parse(localStorage.getItem("pendingRedirect") || "null");

// Captura el submit del formulario, valida credenciales y consume la API de login.
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    // Si el servidor devuelve un error HTTP
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return showModal("Error", errorData?.message || "Error en el servidor", "error");
    }

    const data = await res.json();

    if (!data.ok) {
      return showModal("Error", data.message, "error");
    }

    // Guardar token y usuario
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    showModal("Bienvenido", "Inicio de sesión exitoso");

    setTimeout(() => {
      if (pendingRedirect?.url) {
        localStorage.removeItem("pendingRedirect");
        window.location.href = pendingRedirect.url;
        return;
      }
      window.location.href = "profile.html";
    }, 1500);

  } catch (error) {
    showModal("Error", "No se pudo conectar con el servidor", "error");
  }
});

// Solicita la recuperacion de contraseña desde el enlace del login.
document.getElementById("forgotPassword").addEventListener("click", (e) => {
  e.preventDefault();

  const email = window.prompt("Introduce tu correo electrónico para recuperar la contraseña");

  if (!email) {
    return;
  }

  fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() })
  })
    .then((res) => res.json().catch(() => null).then((data) => ({ res, data })))
    .then(({ res, data }) => {
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "No se pudo enviar el correo");
      }

      showModal(
        "Revisa tu correo",
        "Si el correo existe, recibirás un enlace para restablecer tu contraseña."
      );
    })
    .catch(() => {
      showModal("Error", "No se pudo enviar el correo de recuperación", "error");
    });
});
