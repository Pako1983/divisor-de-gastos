import { showModal, showLogoutModal } from "../components/modal.js";
import { API_URL } from "../config.js";



//  VALIDACIÓN DE SESIÓN
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";


//  ELEMENTOS DEL DOM
const searchInput = document.getElementById("userSearch");
const autocomplete = document.getElementById("autocomplete");
const chipsContainer = document.getElementById("chips");

let selectedUsers = [];


//  AUTOCOMPLETADO DE USUARIOS
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


//  CREAR CHIP VISUAL
function addChip(user) {
  const chip = document.createElement("div");
  chip.className = "chip";

  chip.innerHTML = `
    <span>${user.name}</span>
    <button>&times;</button>
  `;

  chip.querySelector("button").onclick = () => {
    chip.remove();
    selectedUsers = selectedUsers.filter(u => u._id !== user._id);
  };

  chipsContainer.appendChild(chip);
}


//  CREAR GRUPO
document.getElementById("createGroupBtn").onclick = async () => {
  const name = document.getElementById("groupName").value.trim();

  if (!name) {
    return showModal("Error", "El nombre del grupo es obligatorio", "error");
  }

  const members = selectedUsers.map(u => u._id);

  try {
    const res = await fetch(`${API_URL}/groups/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ name, members })
    });

    if (res.status === 401) {
      localStorage.clear();
      return (window.location.href = "login.html");
    }

    const data = await res.json();

    if (!data.ok) {
      return showModal("Error", data.message, "error");
    }

    showModal("Éxito", "Grupo creado correctamente");

    setTimeout(() => {
      window.location.href = "profile.html";
    }, 1500);

  } catch (err) {
    showModal("Error", "No se pudo crear el grupo", "error");
  }
};


//  VOLVER AL PERFIL
document.getElementById("backBtn").onclick = () => {
  window.location.href = "profile.html";
};


//  CERRAR SESIÓN
document.getElementById("logoutBtn").onclick = () => {
  showLogoutModal();
};



