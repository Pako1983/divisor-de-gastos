import { showModal } from "../components/modal.js";
import { API_URL } from "../config.js";

const pendingRedirect = JSON.parse(localStorage.getItem("pendingRedirect") || "null");


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
