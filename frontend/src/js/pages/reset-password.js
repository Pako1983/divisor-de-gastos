import { showModal } from "../components/modal.js";
import { API_URL } from "../config.js";

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (!token) {
  showModal("Error", "El enlace de recuperación no es válido o ha caducado.", "error");
}

document.getElementById("resetPasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!token) {
    return;
  }

  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (newPassword.length < 6) {
    return showModal("Error", "La contraseña debe tener al menos 6 caracteres.", "error");
  }

  if (newPassword !== confirmPassword) {
    return showModal("Error", "Las contraseñas no coinciden.", "error");
  }

  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword })
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      return showModal("Error", data?.message || "No se pudo cambiar la contraseña", "error");
    }

    showModal("Contraseña actualizada", data.message || "La contraseña se ha cambiado correctamente");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    showModal("Error", "No se pudo conectar con el servidor", "error");
  }
});
