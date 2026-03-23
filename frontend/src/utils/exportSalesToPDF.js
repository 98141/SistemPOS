import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportSalesToPdf = (sales = []) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Historial de ventas", 14, 16);

  const rows = sales.map((sale) => [
    sale.saleNumber,
    new Date(sale.date).toLocaleString("es-CO"),
    sale.paymentMethod,
    sale.items.length,
    Number(sale.subtotal).toFixed(2),
    Number(sale.discount).toFixed(2),
    Number(sale.total).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 24,
    head: [[
      "Número",
      "Fecha",
      "Pago",
      "Items",
      "Subtotal",
      "Descuento",
      "Total",
    ]],
    body: rows,
  });

  doc.save("historial-ventas.pdf");
};