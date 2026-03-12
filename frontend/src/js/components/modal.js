/// ===============================
// OBTENER ELEMENTOS UNA SOLA VEZ
// ===============================
const modal = document.getElementById("globalModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const acceptBtn = document.getElementById("modalAccept");
const cancelBtn = document.getElementById("modalCancel");


// ===============================
// MODAL SIMPLE (INFO / AVISO)
// ===============================
export function showModal(title, message, type = "info", onAccept = null, onCancel = null) {
  modalTitle.textContent = title;
  modalMessage.innerHTML = message;

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  // Mostrar SIEMPRE el botón Aceptar
  acceptBtn.style.display = "inline-block";

  // Si NO hay onAccept → es un aviso → ocultar Cancelar
  if (!onAccept) {
    cancelBtn.style.display = "none";
  } else {
    cancelBtn.style.display = "inline-block";
  }

  // Limpiar eventos anteriores
  acceptBtn.onclick = null;
  cancelBtn.onclick = null;

  acceptBtn.onclick = () => {
    if (onAccept) onAccept();
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  };

  cancelBtn.onclick = () => {
    if (onCancel) onCancel();
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  };
}


// ===============================
// ÉXITO + REDIRECCIÓN AUTOMÁTICA
// ===============================
export function showSuccessAndRedirect(message, url, delay = 300) {
  showSuccess(message);

  setTimeout(() => {
    window.location.href = url;
  }, delay);
}


// ===============================
// ATAJOS PARA MODALES SIMPLES
// ===============================
export function showSuccess(message) {
  showModal("Éxito", message, "success");
}

export function showError(message) {
  showModal("Error", message, "error");
}

export function showWarning(message) {
  showModal("Aviso", message, "warning");
}

export function showInfo(message) {
  showModal("Información", message, "info");
}



// ===============================
// MODAL DE CONFIRMACIÓN (PREGUNTAS)
// ===============================
export function showConfirmModal(title, message, onConfirm) {
  modalTitle.textContent = title;
  modalMessage.innerHTML = message;

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  acceptBtn.style.display = "inline-block";
  cancelBtn.style.display = "inline-block";

  acceptBtn.onclick = null;
  cancelBtn.onclick = null;

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  };

  acceptBtn.onclick = () => {
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
    onConfirm();
  };
}



// ===============================
// MODAL PARA INPUT (EDITAR NOMBRE)
// ===============================
export function showInputModal(title, placeholder, callback) {
  modalTitle.textContent = title;

  modalMessage.innerHTML = `
    <input 
      id="modalInput" 
      type="text" 
      placeholder="${placeholder}" 
      class="modal-input"
    >
  `;

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  const input = document.getElementById("modalInput");

  acceptBtn.style.display = "inline-block";
  cancelBtn.style.display = "inline-block";

  acceptBtn.onclick = async () => {
    const value = input.value.trim();

    if (!value) {
      input.classList.add("input-error");
      return;
    }

    try {
      await callback(value);
      modal.classList.add("hidden");
      document.body.classList.remove("modal-open");
    } catch (err) {
      console.error("Error en callback:", err);
    }
  };

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  };
}



// ===============================
// MODAL PARA CAMBIAR CONTRASEÑA
// ===============================
export function showPasswordModal(callback) {
  modalTitle.textContent = "Cambiar contraseña";

  modalMessage.innerHTML = `
    <input id="currentPass" type="password" placeholder="Contraseña actual" class="modal-input">
    <input id="newPass" type="password" placeholder="Nueva contraseña" class="modal-input">
  `;

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  const currentPass = document.getElementById("currentPass");
  const newPass = document.getElementById("newPass");

  acceptBtn.style.display = "inline-block";
  cancelBtn.style.display = "inline-block";

  acceptBtn.onclick = async () => {
    const currentPassword = currentPass.value.trim();
    const newPassword = newPass.value.trim();

    if (!currentPassword || !newPassword) {
      currentPass.classList.add("input-error");
      newPass.classList.add("input-error");
      return;
    }

    try {
      await callback(currentPassword, newPassword);
      modal.classList.add("hidden");
      document.body.classList.remove("modal-open");
    } catch (err) {
      console.error("Error en callback:", err);
    }
  };

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  };
}



// ===============================
// MODAL PARA CERRAR SESIÓN
// ===============================
export function showLogoutModal() {
  showConfirmModal(
    "Cerrar sesión",
    "¿Seguro que quieres salir?",
    () => {
      localStorage.clear();
      window.location.href = "login.html";
    }
  );
}






