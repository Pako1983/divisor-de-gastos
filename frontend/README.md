# Frontend - Divisor de Gastos

## Cómo ejecutar en desarrollo
1. `cd frontend`
2. `npm install` (o `npm ci`).
3. `npm start` lanzará `live-server` en el puerto 3000 y abrirá `index.html`.

## Producción
- Transpila/empaca los archivos en `src/templates`, `src/css` y `src/js` como prefieras (no hay bundler por defecto).
- Puedes sobreescribir los endpoints de producción definiendo `window.APP_CONFIG` antes de cargar cualquier módulo. Ejemplo:

```html
<script>
  window.APP_CONFIG = {
    API_URL: "https://api.tu-dominio.com",
    FILES_URL: "https://assets.tu-dominio.com"
  };
</script>
```

- Si no defines `window.APP_CONFIG`, `frontend/src/js/config.js` usará `https://[tu-dominio].com/api` y `https://[tu-dominio].com` como valores por defecto (que puedes adaptar posteriormente).
- Copia las plantillas finales (`src/templates/*.html`) al servidor estático y mantén los assets en `src/assets`.

## Nota de seguridad
- El frontend asume que el backend devuelve JWTs y que los archivos (avatares/recibos) se sirven desde el mismo dominio especificado en `FILES_URL`.
