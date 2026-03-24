export const printSaleReceipt = (sale) => {
  if (!sale) return;

  const itemsHtml = sale.items
    .map(
      (item) => `
        <tr>
          <td>${item.skuSnapshot}</td>
          <td>${item.nameSnapshot}</td>
          <td>${item.quantity}</td>
          <td>$${Number(item.unitPrice).toFixed(2)}</td>
          <td>$${Number(item.subtotal).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  const printWindow = window.open("", "_blank", "width=900,height=700");

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Comprobante ${sale.saleNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
            color: #111827;
          }
          h1, h2, p {
            margin: 0 0 10px;
          }
          .header {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 10px;
            text-align: left;
            font-size: 14px;
          }
          .totals {
            margin-top: 20px;
            width: 320px;
            margin-left: auto;
          }
          .totals div {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Comprobante de venta</h1>
          <p><strong>Número:</strong> ${sale.saleNumber}</p>
          <p><strong>Fecha:</strong> ${new Date(sale.date).toLocaleString("es-CO")}</p>
          <p><strong>Método de pago:</strong> ${sale.paymentMethod}</p>
          <p><strong>Observaciones:</strong> ${sale.notes || "-"}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div><strong>Subtotal</strong><span>$${Number(sale.subtotal).toFixed(2)}</span></div>
          <div><strong>Descuento</strong><span>$${Number(sale.discount).toFixed(2)}</span></div>
          <div><strong>Total</strong><span>$${Number(sale.total).toFixed(2)}</span></div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};