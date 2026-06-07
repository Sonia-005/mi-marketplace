// Verifica que el usuario autenticado tenga el rol requerido
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Acceso denegado: se requiere rol ${roles.join(' o ')}` });
    }
    next();
  };
};

module.exports = roleMiddleware;
