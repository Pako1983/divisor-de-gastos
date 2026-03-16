import { showModal, showConfirmModal, showLogoutModal, showSuccessAndRedirect, showError } from "../components/modal.js";
import { API_URL, FILES_URL } from "../config.js";



//  VALIDACIÓN DE SESIÓN
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

let userId = null;
try {
  userId = JSON.parse(atob(token.split(".")[1])).userId;
} catch {
  localStorage.clear();
  window.location.href = "login.html";
}

const urlParams = new URLSearchParams(window.location.search);
const urlGroupId = urlParams.get("groupId");
if (urlGroupId) {
  localStorage.setItem("currentGroup", urlGroupId);
}

const groupId = localStorage.getItem("currentGroup");
if (!groupId) window.location.href = "profile.html";



//  ELEMENTOS NUEVOS
const searchInput = document.getElementById("searchInput");
const autocomplete = document.getElementById("autocomplete");
const selectedUsersContainer = document.getElementById("selectedUsers");
const addUserBtn = document.getElementById("addUserBtn");

let selectedUsers = [];



//  FUNCIÓN: CHIP VISUAL
function addChip(user) {
  const chip = document.createElement("div");
  chip.className = "chip";
  chip.textContent = `${user.name} (${user.email})`;

  const removeBtn = document.createElement("span");
  removeBtn.textContent = "×";
  removeBtn.className = "chip-remove";

  removeBtn.onclick = () => {
    selectedUsers = selectedUsers.filter(u => u._id !== user._id);
    chip.remove();
  };

  chip.appendChild(removeBtn);
  selectedUsersContainer.appendChild(chip);
}



//  AUTOCOMPLETADO
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();

  if (query.length < 2) {
    autocomplete.style.display = "none";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/groups/search-users?q=${query}`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (res.status === 401) {
      localStorage.clear();
      return (window.location.href = "login.html");
    }

    const data = await res.json();

    autocomplete.innerHTML = "";
    autocomplete.style.display = "block";

    data.users.forEach(user => {
      const div = document.createElement("div");
      div.className = "autocomplete-item";
      div.textContent = `${user.name} (${user.email})`;

      div.onclick = () => {
        if (!selectedUsers.some(u => u._id === user._id)) {
          addChip(user);
          selectedUsers.push(user);
        }
        searchInput.value = "";
        autocomplete.style.display = "none";
      };

      autocomplete.appendChild(div);
    });

  } catch (err) {
    showModal("Error", "No se pudo buscar usuarios", "error");
  }
});



//  AÑADIR USUARIO AL GRUPO
addUserBtn.onclick = async () => {
  if (selectedUsers.length === 0) {
    return showModal("Aviso", "Selecciona un usuario primero.");
  }

  const user = selectedUsers[0]; // solo uno a la vez

  try {
    const res = await fetch(`${API_URL}/groups/${groupId}/add-member`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ userId: user._id })
    });

    const data = await res.json();

    if (!data.ok) return showModal("Error", data.message, "error");

    // Modal SIN botón cancelar
    showModal("Éxito", "Usuario añadido correctamente.", "info");

    selectedUsers = [];
    selectedUsersContainer.innerHTML = "";
    loadGroup();

  } catch (err) {
    showModal("Error", "No se pudo añadir el usuario", "error");
  }
};



//  ELIMINAR USUARIO DEL GRUPO
async function removeUserFromGroup(userToRemoveId) {
  try {
    const res = await fetch(`${API_URL}/groups/${groupId}/remove-member/${userToRemoveId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();

    if (!data.ok) return showModal("Error", data.message, "error");

    // Modal SIN botón cancelar
    showModal("Usuario eliminado", "El usuario ha sido eliminado del grupo.");

    loadGroup();

  } catch (err) {
    showModal("Error", "No se pudo eliminar el usuario", "error");
  }
}


//  CARGAR DETALLES DEL GRUPO
async function loadGroup() {
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

    const group = data.group;

    document.getElementById("groupName").textContent = group.name;

    // Mostrar botón eliminar grupo solo si es el creador
    document.getElementById("deleteGroupBtn").style.display =
      group.createdBy && group.createdBy._id === userId ? "block" : "none";

    // Mostrar miembros
    const membersList = document.getElementById("membersList");
    membersList.innerHTML = "";

    group.members.forEach(member => {
      const div = document.createElement("div");
      div.className = "member-card";

      div.innerHTML = `
        <strong>${member.name}</strong>
        <span>${member.email}</span>
      `;

      // Botón eliminar usuario (solo creador)
      if (group.createdBy._id === userId && member._id !== userId) {
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Eliminar";
        removeBtn.className = "btn btn-danger member-remove-btn";

        removeBtn.onclick = () => {
          showConfirmModal(
            "Eliminar usuario",
            `¿Seguro que deseas eliminar a ${member.name}?`,
            () => removeUserFromGroup(member._id)
          );
        };

        div.appendChild(removeBtn);
      }

      membersList.appendChild(div);
    });

  } catch (err) {
    showModal("Error", "No se pudo cargar el grupo", "error");
  }
}



//  CARGAR GASTOS DEL GRUPO
async function loadExpenses() {
  try {
    const res = await fetch(`${API_URL}/expenses/${groupId}`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (res.status === 401) {
      localStorage.clear();
      return (window.location.href = "login.html");
    }

    const data = await res.json();

    const expensesContainer = document.getElementById("expensesContainer");
    expensesContainer.innerHTML = "";

    if (!data.ok || data.expenses.length === 0) {
      expensesContainer.innerHTML = "<p>No hay gastos registrados</p>";
      return;
    }

    data.expenses.forEach(exp => {
      const div = document.createElement("div");
      div.className = "expense-card";

      const receiptButton = exp.receipt
        ? `<button class="receipt-btn">Ver recibo</button>`
        : "";

      const deleteButton = exp.paidBy._id === userId
        ? `<button class="delete-expense-btn">Eliminar</button>`
        : "";

      div.innerHTML = `
        <strong>${exp.description}</strong><br>
        <span>Monto: ${exp.amount.toFixed(2)}€</span><br>
        <span>Pagado por: ${exp.paidBy.name}</span><br>
        <span>Participantes: ${exp.participants.map(p => p.name).join(", ")}</span><br>
        ${receiptButton}
        ${deleteButton}
      `;

      // Evento para ver recibo
      if (exp.receipt) {
        const btn = div.querySelector(".receipt-btn");
        btn.addEventListener("click", () => openReceiptModal(exp.receipt));
      }

      // Evento para eliminar gasto
      if (exp.paidBy._id === userId) {
        const delBtn = div.querySelector(".delete-expense-btn");
        delBtn.addEventListener("click", () => {
          showConfirmModal(
            "Eliminar gasto",
            "¿Seguro que quieres eliminar este gasto?",
            async () => {
              const res = await fetch(`${API_URL}/expenses/${exp._id}`, {
                method: "DELETE",
                headers: { Authorization: "Bearer " + token }
              });

              const data = await res.json();

              if (data.ok) {
                showModal("Eliminado", "El gasto ha sido eliminado.", "success");
                loadExpenses();
                loadBalances();
              } else {
                showModal("Error", data.message, "error");
              }
            }
          );
        });
      }

      expensesContainer.appendChild(div);
    });

  } catch (err) {
    showModal("Error", "No se pudieron cargar los gastos", "error");
  }
}



//  CARGAR BALANCES
async function loadBalances() {
  try {
    const res = await fetch(`${API_URL}/expenses/${groupId}/balances`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (res.status === 401) {
      localStorage.clear();
      return (window.location.href = "login.html");
    }

    const data = await res.json();

    const balancesContainer = document.getElementById("balancesContainer");
    balancesContainer.innerHTML = "";

    if (!data.ok || !Array.isArray(data.balances) || data.balances.length === 0) {
      balancesContainer.innerHTML = "<p>No hay deudas pendientes</p>";
      return;
    }

    data.balances.forEach(b => {
      const div = document.createElement("div");
      div.className = "balance-card";

      div.innerHTML = `
        <strong>${b.from.name}</strong> debe 
        <strong>${b.amount.toFixed(2)}€</strong> a 
        <strong>${b.to.name}</strong>
      `;

      balancesContainer.appendChild(div);
    });

  } catch (err) {
    showModal("Error", "No se pudieron cargar los balances.", "error");
  }
}


//  MODAL DE RECIBO
function openReceiptModal(receiptPath) {
  const modal = document.getElementById("receiptModal");
  const viewer = document.getElementById("receiptViewer");
  const closeBtn = document.getElementById("closeReceiptModal");
  const url = `${FILES_URL}${receiptPath}`;
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(receiptPath);

  if (isImage) {
    viewer.innerHTML = `<img src="${url}" alt="Recibo" class="receipt-image" />`;
  } else {
    viewer.innerHTML = `<a href="${url}" target="_blank" rel="noopener" class="receipt-link">Ver o descargar archivo</a>`;
  }

  modal.classList.remove("hidden");

  const close = () => {
    modal.classList.add("hidden");
    viewer.innerHTML = "";
  };

  closeBtn.onclick = close;
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}




//  EVENTOS DE BOTONES
document.getElementById("deleteGroupBtn").onclick = () => {
  showConfirmModal(
    "Eliminar grupo",
    "¿Seguro que quieres eliminar este grupo?",
    async () => {
      const res = await fetch(`${API_URL}/groups/${groupId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });

      const data = await res.json();

      if (data.ok) {
        // AVISO → solo botón Aceptar + redirección automática
        showSuccessAndRedirect("El grupo ha sido eliminado.", "profile.html");
      } else {
        showError(data.message);
      }
    }
  );
};

document.getElementById("backBtn").onclick = () => window.location.href = "profile.html";
document.getElementById("addExpenseBtn").onclick = () => window.location.href = "expense-add.html";
document.getElementById("logoutBtn").onclick = () => showLogoutModal();




//  EJECUCIÓN INICIAL
loadGroup();
loadExpenses();
loadBalances();












