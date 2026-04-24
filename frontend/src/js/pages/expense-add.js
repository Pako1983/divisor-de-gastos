import { showModal, showLogoutModal } from "../components/modal.js";
import { API_URL } from "../config.js";

//  VALIDACIÓN DE SESIÓN
// Verifica la sesión existente; sin token redirige al login.
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

// Recupera el grupo actualmente activo; el perfil debe existir para continuar.
const groupId = localStorage.getItem("currentGroup");
if (!groupId) window.location.href = "profile.html";

//  ELEMENTOS DEL DOM
const paidBySelect = document.getElementById("paidBy");
const participantsList = document.getElementById("participantsList");
const selectAllParticipants = document.getElementById("selectAllParticipants");
const expenseDateInput = document.getElementById("expenseDate");

let members = [];
let selectedParticipantIds = new Set();

if (expenseDateInput) {
  expenseDateInput.value = new Date().toISOString().split("T")[0];
}

//  CARGAR MIEMBROS DEL GRUPO
// Carga los miembros del grupo y rellena el selector de pagadores disponibles.
async function loadMembers() {
  try {
    const res = await fetch(`${API_URL}/groups/${groupId}`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (res.status === 401) {
      localStorage.clear();
      return (window.location.href = "login.html");
    }

    const data = await res.json();
    if (!data.ok) return showModal("Error", data.message, "error");

    members = data.group.members || [];
    renderPaidByOptions();
    renderParticipantsChecklist();
  } catch (err) {
    showModal("Error", "No se pudieron cargar los usuarios.", "error");
  }
}

function renderPaidByOptions() {
  paidBySelect.innerHTML = "";

  // Cada miembro del grupo puede aparecer como persona que pago el gasto.
  members.forEach((member) => {
    const option = document.createElement("option");
    option.value = member._id;
    option.textContent = member.name;
    paidBySelect.appendChild(option);
  });
}

function renderParticipantsChecklist() {
  participantsList.innerHTML = "";
  selectedParticipantIds = new Set();
  selectAllParticipants.checked = false;

  // Creamos una fila seleccionable por miembro para repartir el gasto.
  members.forEach((member) => {
    const row = document.createElement("label");
    row.className = "participant-check";
    row.innerHTML = `
      <input type="checkbox" class="participant-checkbox" value="${member._id}">
      <span class="participant-info">
        <strong>${member.name}</strong>
        <small>${member.email}</small>
      </span>
    `;

    const checkbox = row.querySelector("input");
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedParticipantIds.add(member._id);
      } else {
        selectedParticipantIds.delete(member._id);
      }

      syncSelectAllState();
    });

    participantsList.appendChild(row);
  });
}

function syncSelectAllState() {
  // Mantiene sincronizado el checkbox general con los participantes marcados.
  const allSelected = members.length > 0 && selectedParticipantIds.size === members.length;
  selectAllParticipants.checked = allSelected;
}

selectAllParticipants.addEventListener("change", () => {
  const shouldSelectAll = selectAllParticipants.checked;
  selectedParticipantIds = new Set();

  document.querySelectorAll(".participant-checkbox").forEach((checkbox) => {
    checkbox.checked = shouldSelectAll;
    if (shouldSelectAll) {
      selectedParticipantIds.add(checkbox.value);
    }
  });

  syncSelectAllState();
});

loadMembers();

//  GUARDAR GASTO
// Envia el gasto al backend validando campos, adjuntando recibo y mostrando feedback.
async function saveExpense() {
  const description = document.getElementById("description").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const expenseDate = expenseDateInput?.value;
  const paidBy = paidBySelect.value;
  const receiptFile = document.getElementById("receipt")?.files[0];

  if (!description || !amount || isNaN(amount) || amount <= 0 || !paidBy || !expenseDate) {
    return showModal("Error", "Completa descripción, monto, fecha y quién pagó.", "error");
  }

  const participantsToSend = Array.from(selectedParticipantIds);

  if (participantsToSend.length === 0) {
    return showModal(
      "Error",
      "Selecciona al menos un participante o marca 'Seleccionar a todos'.",
      "error"
    );
  }

  const formData = new FormData();
  formData.append("groupId", groupId);
  formData.append("description", description);
  formData.append("amount", amount);
  formData.append("expenseDate", expenseDate);
  formData.append("paidBy", paidBy);

  participantsToSend.forEach((participantId) => {
    formData.append("participants", participantId);
  });

  if (receiptFile) {
    formData.append("receipt", receiptFile);
  }

  try {
    const res = await fetch(`${API_URL}/expenses/create`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData
    });

    if (res.status === 401) {
      localStorage.clear();
      return (window.location.href = "login.html");
    }

    const data = await res.json();

    if (!data.ok) {
      return showModal("Error", data.message || "No se pudo guardar el gasto.", "error");
    }

    showModal("Éxito", "Gasto guardado correctamente.", "success", () => {
      window.location.href = "group-detail.html";
    });
  } catch (err) {
    showModal("Error", "Error de conexión al guardar el gasto.", "error");
  }
}

//  BOTONES
document.getElementById("backBtn").onclick = () => {
  window.location.href = "group-detail.html";
};

document.getElementById("saveExpenseBtn").onclick = () => {
  saveExpense();
};

document.getElementById("logoutBtn").onclick = () => {
  showLogoutModal();
};
