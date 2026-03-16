// Detecta si la app está en local para ajustar automáticamente las URLs de la API y los archivos.
const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);

const LOCAL_API = "http://localhost:4000/api";
const LOCAL_FILES = "http://localhost:4000"; // URLs para pruebas locales con el backend en el puerto 4000.

// Valores por defecto para producción (puedes sobrescribirlos con window.APP_CONFIG).
const PROD_API = "https://divisor-de-gastos-backend.onrender.com/api";
const PROD_FILES = "https://divisor-de-gastos-backend.onrender.com";

const APP_CONFIG = window.APP_CONFIG ?? {};

// URL base de la API que consume todo el frontend.
export const API_URL =
  APP_CONFIG.API_URL || (isLocal ? LOCAL_API : PROD_API);

// URL base para cargar recursos est?ticos alojados en el backend y servir recibos/avatares.
export const FILES_URL =
  APP_CONFIG.FILES_URL || (isLocal ? LOCAL_FILES : PROD_FILES);



