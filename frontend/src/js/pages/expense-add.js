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
// Referencias a elementos del DOM utilizados para el formulario y el autocompletado.
const searchInput = document.getElementById("searchMember");
const autocomplete = document.getElementById("autocomplete");
const chipsContainer = document.getElementById("chips");

let members = [];
let selectedParticipants = [];


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

    members = data.group.members;

    // Llenar select de pagador
    const paidBySelect = document.getElementById("paidBy");
    members.forEach(m => {
      const option = document.createElement("option");
      option.value = m._id;
      option.textContent = m.name;
      paidBySelect.appendChild(option);
    });

  } catch (err) {
    showModal("Error", "No se pudieron cargar los usuarios.", "error");
  }
}

loadMembers();

//  GUARDAR GASTO

// Envia el gasto al backend validando campos, adjuntando recibo y mostrando feedback.
async function saveExpense() {
  const description = document.getElementById("description").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const paidBy = document.getElementById("paidBy").value;
  const receiptFile = document.getElementById("receipt")?.files[0];

  if (!description || !amount || isNaN(amount) || amount <= 0 || !paidBy) {
    return showModal("Error", "Completa descripción, monto y quién pagó.", "error");
  }

  let participantsToSend = selectedParticipants;
  if (participantsToSend.length === 0) {
    const payer = members.find(m => m._id === paidBy);
    participantsToSend = payer ? [payer] : [];
  }
  if (participantsToSend.length === 0) {
    return showModal("Error", "Selecciona al menos un usuario.", "error");
  }

  const formData = new FormData();
  formData.append("groupId", groupId);
  formData.append("description", description);
  formData.append("amount", amount);
  formData.append("paidBy", paidBy);

  participantsToSend.forEach(p => {
    formData.append("participants", p._id);
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

    showModal(
      "Exito",
      "Gasto guardado correctamente.",
      "success",
      () => {
        window.location.href = "group-detail.html";
      }
    );

  } catch (err) {
    showModal("Error", "Error de conexión al guardar el gasto.", "error");
  }
}


//  AUTOCOMPLETADO

// Gestiona el autocompletado mientras el usuario escribe para añadir participantes manualmente.
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();

  if (query.length < 1) {
    autocomplete.innerHTML = "";
    autocomplete.style.display = "none";
    return;
  }

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(query) ||
    m.email.toLowerCase().includes(query)
  );

  autocomplete.innerHTML = "";
  autocomplete.style.display = "block";

  filtered.forEach(user => {
    const div = document.createElement("div");
    div.className = "participant-option";
    div.textContent = `${user.name} (${user.email})`;

    div.onclick = () => {
      if (!selectedParticipants.some(u => u._id === user._id)) {
        addChip(user);
        selectedParticipants.push(user);
      }
      searchInput.value = "";
      autocomplete.innerHTML = "";
      autocomplete.style.display = "none";
    };

    autocomplete.appendChild(div);
  });
});


//  CHIPS

// Crea un chip visual para cada participante seleccionado y permite eliminarlo facilmente.
function addChip(user) {
  const chip = document.createElement("div");
  chip.className = "chip";

  chip.innerHTML = `
    <span>${user.name}</span>
    <button>&times;</button>
  `;

  chip.querySelector("button").onclick = () => {
    chip.remove();
    selectedParticipants = selectedParticipants.filter(u => u._id !== user._id);
  };

  chipsContainer.appendChild(chip);
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





