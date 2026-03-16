import { showModal } from "../components/modal.js";
import { API_URL } from "../config.js";

// Captura el submit del formulario de registro y prepara los datos para enviarlos a la API.
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Extrae los campos del formulario.
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const avatar = document.getElementById("avatar").files[0];

  // Creamos el FormData para enviar el multipart/form-data (avatar opcional).
  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", password);

  if (avatar) {
    formData.append("avatar", avatar);
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      body: formData
    });

    // Si la API responde con error HTTP mostramos el mensaje correspondiente.
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return showModal("Error", errorData?.message || "Error en el servidor", "error");
    }

    const data = await res.json();

    if (!data.ok) {
      return showModal("Error", data.message, "error");
    }

    showModal("Registro exitoso", "Tu cuenta ha sido creada correctamente");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

  } catch (error) {
    showModal("Error", "No se pudo conectar con el servidor", "error");
  }
});
