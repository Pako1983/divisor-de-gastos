# Backend - Divisor de Gastos

## Requisitos previos
- Node.js 18+ (compatible con npm 10+)
- MongoDB accesible desde la red (URI en `MONGO_URI`)

## Configuración
1. `cd backend`
2. Copia `.env.example` y rellena los valores reales de producción (JWT_SECRET, MongoDB, SMTP, FRONTEND_URL, etc.).
3. Ejecuta `npm ci` para instalar dependencias.

## Scripts disponibles
- `npm run dev`: arranca con `nodemon` y recarga automática (ideal en desarrollo).
- `npm start`: ejecuta el servidor con Node puro para producción.

## Infraestructura mínima
- El servidor escucha en `PORT` (por defecto 4000) y expone `/api/*`.
- Las rutas protegidas requieren token JWT válido (`Authorization: Bearer ...`).
- Los uploads se guardan en `src/uploads` y se sirven estáticos desde `/uploads`.

Asegúrate de tener KMZ y correos configurados correctamente antes de hacer deploy a producción.
