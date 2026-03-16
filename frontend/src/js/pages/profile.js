import { showModal, showInputModal, showPasswordModal, showLogoutModal } from "../components/modal.js";
import { API_URL, FILES_URL } from "../config.js";



//  VALIDACIÓN DE SESIÓN
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const user = JSON.parse(localStorage.getItem("user"));


//  MOSTRAR DATOS DEL USUARIO
document.getElementById("userName").textContent = user.name;
document.getElementById("userEmail").textContent = user.email;

document.getElementById("avatar").src = user.avatar
  ? `${FILES_URL}${user.avatar}`
  : "../assets/img/default-avatar.png";


//  CARGAR GRUPOS DEL USUARIO
async function loadGroups() {
  try {
    const res = await fetch(`${API_URL}/users/groups`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (res.status === 401) {
      localStorage.clear();
      return (window.location.href = "login.html");
    }

    const data = await res.json();
    if (!data.ok) return;

    const container = document.getElementById("groupsList");
    container.innerHTML = "";

    data.groups.forEach(group => {
      const div = document.createElement("div");
      div.className = "group-card";
      div.textContent = group.name;

      div.onclick = () => {
        localStorage.setItem("currentGroup", group._id);
        window.location.href = "group-detail.html";
      };

      container.appendChild(div);
    });

  } catch (error) {
    showModal("Error", "No se pudieron cargar los grupos", "error");
  }
}

loadGroups();


//  CREAR GRUPO
document.getElementById("createGroupBtn").onclick = () => {
  window.location.href = "group-create.html";
};

//  EDITAR NOMBRE
document.getElementById("editNameBtn").onclick = () => {
  showInputModal("Editar nombre", "Nuevo nombre...", async (newName) => {

    const res = await fetch(`${API_URL}/users/update-name`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ name: newName })
    });

    if (res.status === 401) {
      localStorage.clear();
      return (window.location.href = "login.html");
    }

    const data = await res.json();

    if (!data.ok) return showModal("Error", data.message, "error");

    localStorage.setItem("user", JSON.stringify(data.user));
    document.getElementById("userName").textContent = data.user.name;

    showModal("Éxito", "Nombre actualizado correctamente");
  });
};


//  CAMBIAR CONTRASEÑA
document.getElementById("editPasswordBtn").onclick = () => {
  showPasswordModal(async (currentPassword, newPassword) => {

    const res = await fetch(`${API_URL}/users/update-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (res.status === 401) {
      localStorage.clear();
      return (window.location.href = "login.html");
    }

    const data = await res.json();

    if (!data.ok) return showModal("Error", data.message, "error");

    showModal("Éxito", "Contraseña actualizada correctamente");
  });
};


//  CAMBIAR AVATAR
document.getElementById("editAvatarBtn").onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch(`${API_URL}/users/update-avatar`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
      body: formData
    });

    if (res.status === 401) {
      localStorage.clear();
      return (window.location.href = "login.html");
    }

    const data = await res.json();

    if (!data.ok) return showModal("Error", data.message, "error");

    localStorage.setItem("user", JSON.stringify(data.user));
    document.getElementById("avatar").src = `${FILES_URL}${data.user.avatar}`;

    showModal("Éxito", "Avatar actualizado correctamente");
  };

  input.click();
};


//  CERRAR SESIÓN
document.getElementById("logoutBtn").onclick = () => {
  showLogoutModal();
};


