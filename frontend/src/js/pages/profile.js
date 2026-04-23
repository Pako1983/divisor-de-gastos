import { showModal, showInputModal, showPasswordModal, showLogoutModal } from "../components/modal.js";
import { API_URL, FILES_URL } from "../config.js";



//  VALIDACIÓN DE SESIÓN
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const user = JSON.parse(localStorage.getItem("user"));
const DEFAULT_AVATAR =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#1b222c"/>
      <circle cx="60" cy="46" r="22" fill="#4aa3ff"/>
      <path d="M26 102c5-20 19-30 34-30s29 10 34 30" fill="#4aa3ff"/>
      <text x="60" y="116" text-anchor="middle" font-family="Arial" font-size="12" fill="#c9d4e5">Avatar</text>
    </svg>
  `);

const avatarImg = document.getElementById("avatar");
const setAvatarSrc = (avatarPath) => {
  const normalizedPath = !avatarPath
    ? DEFAULT_AVATAR
    : avatarPath.startsWith("data:")
      ? avatarPath
      : avatarPath.startsWith("http")
        ? avatarPath
        : `${FILES_URL}${avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`}`;

  avatarImg.onerror = () => {
    avatarImg.onerror = null;
    avatarImg.src = DEFAULT_AVATAR;
  };

  avatarImg.src = normalizedPath;
};


//  MOSTRAR DATOS DEL USUARIO
document.getElementById("userName").textContent = user.name;
document.getElementById("userEmail").textContent = user.email;

setAvatarSrc(user.avatar);


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
    setAvatarSrc(data.user.avatar);

    showModal("Éxito", "Avatar actualizado correctamente");
  };

  input.click();
};


//  CERRAR SESIÓN
document.getElementById("logoutBtn").onclick = () => {
  showLogoutModal();
};


