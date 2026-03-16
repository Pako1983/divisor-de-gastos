module.exports = (err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  // Si el error ya tiene un código de estado
  const status = err.statusCode || 500;

  res.status(status).json({
    ok: false,
    message: err.message || "Error interno del servidor"
  });
};
