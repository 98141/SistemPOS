export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Ruta no encontrada: ${req.originalUrl}`));
};