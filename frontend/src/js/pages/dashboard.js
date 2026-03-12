import { showModal, showConfirmModal } from "../components/modal.js";
import { API_URL } from "../config.js";


// Verificar token
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const user = JSON.parse(localStorage.getItem("user"));

const currentUserId = user?.id ?? user?._id;


// ===============================
//  CARGAR GRUPOS
// ===============================
async function loadGroups() {
  try {
    const res = await fetch(`${API_URL}/users/groups`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (res.status === 401) {
      localStorage.clear();
      return (window.location.href = "login.html");
    }

    if (!res.ok) {
      return showModal("Error", "No se pudieron cargar los grupos", "error");
    }

    const data = await res.json();
    if (!data.ok) return;

    const groups = data.groups;
    const container = document.getElementById("groupsList");
    container.innerHTML = "";

    let totalOwedToYou = 0;
    let totalYouOwe = 0;

    for (const group of groups) {
      // Obtener balances del grupo
      const resBal = await fetch(`${API_URL}/expenses/${group._id}/balances`, {
        headers: { Authorization: "Bearer " + token }
      });

      if (!resBal.ok) continue;

      const balData = await resBal.json();
      if (!balData.ok) continue;

      // Calcular cuánto debe o le deben al usuario
      const balanceEntries = Array.isArray(balData.balances) ? balData.balances : [];
      balanceEntries.forEach(b => {
        const toId = b.to?._id ?? b.to?.id;
        const fromId = b.from?._id ?? b.from?.id;

        if (toId && toId === currentUserId) {
          totalOwedToYou += b.amount;
        }
        if (fromId && fromId === currentUserId) {
          totalYouOwe += b.amount;
        }
      });

      // Crear tarjeta del grupo
      const div = document.createElement("div");
      div.className = "group-card";
      div.textContent = group.name;

      div.onclick = () => {
        localStorage.setItem("currentGroup", group._id);
        window.location.href = "group-detail.html";
      };

      container.appendChild(div);
    }

    // Mostrar estadísticas
    document.getElementById("owedToYou").textContent = "€" + totalOwedToYou.toFixed(2);
    document.getElementById("youOwe").textContent = "€" + totalYouOwe.toFixed(2);
    document.getElementById("totalBalance").textContent = "€" + (totalOwedToYou - totalYouOwe).toFixed(2);

  } catch (error) {
    showModal("Error", "No se pudo conectar con el servidor", "error");
  }
}

loadGroups();


// ===============================
//  BOTÓN VOLVER
// ===============================
document.getElementById("backBtn").onclick = () => {
  window.location.href = "profile.html";
};


// ===============================
//  CERRAR SESIÓN (CORREGIDO)
// ===============================
document.getElementById("logoutBtn").onclick = () => {
  showConfirmModal(
    "Cerrar sesión",
    "¿Seguro que quieres salir?",
    () => {
      localStorage.clear();
      window.location.href = "login.html";
    }
  );
};


