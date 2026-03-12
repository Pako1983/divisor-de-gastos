const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Validar formato correcto: "Bearer token"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      message: "No autorizado"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardar el ID como string
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: "Token inválido"
    });
  }
};



