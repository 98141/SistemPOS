export const getMovementTypeLabel = (type) => {
  const labels = {
    purchase: "Compra",
    sale: "Venta",
    manual_adjustment: "Ajuste manual",
  };

  return labels[type] || type;
};

export const getPaymentMethodLabel = (method) => {
  const labels = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    nequi: "Nequi",
    daviplata: "Daviplata",
    tarjeta: "Tarjeta",
    mixto: "Mixto",
  };

  return labels[method] || method;
};

export const getCustomOrderStatusLabel = (status) => {
  const labels = {
    pending: "Pendiente",
    in_progress: "En proceso",
    completed: "Completado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  return labels[status] || status;
};