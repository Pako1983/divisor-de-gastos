// Detecta si estás trabajando en local (puedes ampliar la lista si usas hosts personalizados)
const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);

const LOCAL_API = "http://localhost:4000/api";
const LOCAL_FILES = "http://localhost:4000";

// Valores por defecto para producción (reemplázalos o inyecta `window.APP_CONFIG`)
const PROD_API = "https://[tu-dominio].com/api";
const PROD_FILES = "https://[tu-dominio].com";

const APP_CONFIG = window.APP_CONFIG ?? {};

// URL base de la API
export const API_URL =
  APP_CONFIG.API_URL || (isLocal ? LOCAL_API : PROD_API);

// URL base para cargar archivos (recibos, avatares, etc.)
export const FILES_URL =
  APP_CONFIG.FILES_URL || (isLocal ? LOCAL_FILES : PROD_FILES);
