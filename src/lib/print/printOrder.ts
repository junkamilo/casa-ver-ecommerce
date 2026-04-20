/**
 * printOrder — utilidad global para imprimir / guardar como PDF un pedido.
 *
 * Uso (admin y cliente):
 *   import { printOrder, type PrintableOrder } from "@/lib/print/printOrder";
 *   printOrder({ orderNumber, date, status, customer, shipping, payment, items, subtotal, shippingCost, discount, total });
 *
 * Abre una ventana limpia con el recibo formateado y dispara el diálogo
 * de impresión del navegador. El usuario elige "Guardar como PDF" en ese diálogo.
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PrintableOrderItem {
  name: string;
  qty: number;
  unitPrice: number;
}

export interface PrintableOrder {
  orderNumber: string;
  date: string;
  status: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    cedula?: string;
  };
  shipping: {
    address: string;
  };
  payment: {
    method: string;
  };
  items: PrintableOrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export interface PrintableCustomer {
  orderNumber: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  cedula?: string;
  address: string;
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

const BRAND_GREEN = "#154734";
const BRAND_GOLD  = "#C19A6B";

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function buildItemRows(items: PrintableOrderItem[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td class="cell">${item.name}</td>
          <td class="cell center">${item.qty}</td>
          <td class="cell right">${formatCOP(item.unitPrice)}</td>
          <td class="cell right bold">${formatCOP(item.unitPrice * item.qty)}</td>
        </tr>`
    )
    .join("");
}

function buildDiscountRow(discount: number): string {
  if (discount <= 0) return "";
  return `
    <tr>
      <td colspan="3" class="tfoot-label">Descuento</td>
      <td class="tfoot-value" style="color:#c53030;">−${formatCOP(discount)}</td>
    </tr>`;
}

function buildShippingValue(cost: number): string {
  return cost === 0
    ? `<span style="color:#276749;">Gratis</span>`
    : formatCOP(cost);
}

// ─── Plantilla HTML ───────────────────────────────────────────────────────────

function buildDocument(order: PrintableOrder): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Pedido ${order.orderNumber} — Casa Verde</title>
  <style>
    /* Reset */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #1a1a1a;
      background: #fff;
      padding: 48px 56px;
      max-width: 760px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 2px solid ${BRAND_GREEN};
      margin-bottom: 32px;
    }
    .brand-name {
      font-size: 28px;
      font-weight: 700;
      color: ${BRAND_GREEN};
      letter-spacing: 2px;
    }
    .brand-url { font-size: 11px; color: #999; margin-top: 4px; }
    .order-meta { text-align: right; }
    .order-meta .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .order-meta .order-number { font-size: 20px; font-weight: 700; color: ${BRAND_GREEN}; margin-top: 2px; }
    .order-meta .order-date  { font-size: 11px; color: #888; margin-top: 4px; }

    /* ── Sección de dos columnas ── */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 10px;
      font-weight: 700;
      color: ${BRAND_GOLD};
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 10px;
    }
    .info-name  { font-size: 14px; font-weight: 600; color: #1a1a1a; }
    .info-line  { font-size: 12px; color: #555; margin-top: 4px; }
    .info-value { font-weight: 600; color: #1a1a1a; }

    /* ── Tabla de productos ── */
    .products-title { margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: ${BRAND_GREEN}; }
    thead th {
      padding: 10px 14px;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    thead th:first-child { text-align: left; }
    thead th:nth-child(2) { text-align: center; }
    thead th:nth-child(3),
    thead th:nth-child(4) { text-align: right; }

    .cell { padding: 10px 14px; font-size: 12px; border-bottom: 1px solid #eee; }
    .center { text-align: center; }
    .right  { text-align: right; }
    .bold   { font-weight: 600; }

    /* ── Totales ── */
    .tfoot-label {
      padding: 7px 14px;
      text-align: right;
      font-size: 12px;
      color: #666;
    }
    .tfoot-value {
      padding: 7px 14px;
      text-align: right;
      font-size: 12px;
    }
    .total-row td {
      padding: 14px 14px 6px;
      border-top: 2px solid ${BRAND_GREEN};
    }
    .total-label {
      text-align: right;
      font-size: 14px;
      font-weight: 700;
    }
    .total-value {
      text-align: right;
      font-size: 18px;
      font-weight: 700;
      color: ${BRAND_GREEN};
    }

    /* ── Pie ── */
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
    }
    .footer-thanks { font-size: 13px; color: ${BRAND_GREEN}; font-weight: 600; }
    .footer-url    { font-size: 11px; color: #bbb; margin-top: 4px; }

    /* ── Solo impresión ── */
    @media print {
      body { padding: 20px 28px; }
    }
  </style>
</head>
<body>

  <!-- Encabezado -->
  <div class="header">
    <div>
      <div class="brand-name">CASA VERDE</div>
      <div class="brand-url">casaverdeoficial.com</div>
    </div>
    <div class="order-meta">
      <div class="label">Pedido</div>
      <div class="order-number">${order.orderNumber}</div>
      <div class="order-date">${order.date}</div>
    </div>
  </div>

  <!-- Cliente + Pago -->
  <div class="two-col">
    <div>
      <div class="section-title">Datos del Cliente</div>
      <div class="info-name">${order.customer.name}</div>
      <div class="info-line">${order.customer.email}</div>
      <div class="info-line">${order.customer.phone}</div>
      ${order.customer.cedula ? `<div class="info-line">Cédula: <span class="info-value">${order.customer.cedula}</span></div>` : ""}
      <div class="info-line" style="margin-top:10px;">${order.shipping.address}</div>
    </div>
    <div>
      <div class="section-title">Pago y Estado</div>
      <div class="info-line">Método: <span class="info-value">${order.payment.method}</span></div>
      <div class="info-line" style="margin-top:6px;">Estado: <span class="info-value" style="color:${BRAND_GREEN};">${order.status}</span></div>
    </div>
  </div>

  <!-- Tabla de productos -->
  <div class="section-title products-title">Productos</div>
  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th>Cant.</th>
        <th>Precio Unit.</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${buildItemRows(order.items)}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" class="tfoot-label">Subtotal</td>
        <td class="tfoot-value">${formatCOP(order.subtotal)}</td>
      </tr>
      <tr>
        <td colspan="3" class="tfoot-label">Envío</td>
        <td class="tfoot-value">${buildShippingValue(order.shippingCost)}</td>
      </tr>
      ${buildDiscountRow(order.discount)}
      <tr class="total-row">
        <td colspan="3" class="total-label">Total</td>
        <td class="total-value">${formatCOP(order.total)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- Pie de página -->
  <div class="footer">
    <div class="footer-thanks">Gracias por tu compra en Casa Verde</div>
    <div class="footer-url">casaverdeoficial.com</div>
  </div>

  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`;
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Abre una ventana con el recibo del pedido y dispara el diálogo de impresión.
 * El usuario puede elegir "Guardar como PDF" en ese diálogo.
 *
 * @param order  Datos del pedido en formato `PrintableOrder`.
 */
export function printOrder(order: PrintableOrder): void {
  const html = buildDocument(order);

  const win = window.open("", "_blank", "width=840,height=720");
  if (!win) {
    alert("Permite ventanas emergentes en este sitio para poder descargar el PDF.");
    return;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();
}

// ─── PDF solo datos del cliente ───────────────────────────────────────────────

function buildCustomerDocument(c: PrintableCustomer): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Datos del Cliente — ${c.orderNumber} — Casa Verde</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #1a1a1a;
      background: #fff;
      padding: 48px 56px;
      max-width: 560px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 2px solid ${BRAND_GREEN};
      margin-bottom: 28px;
    }
    .brand-name { font-size: 24px; font-weight: 700; color: ${BRAND_GREEN}; letter-spacing: 2px; }
    .brand-url  { font-size: 11px; color: #999; margin-top: 4px; }
    .order-meta { text-align: right; }
    .order-meta .label       { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .order-meta .order-number{ font-size: 18px; font-weight: 700; color: ${BRAND_GREEN}; margin-top: 2px; }
    .order-meta .order-date  { font-size: 11px; color: #888; margin-top: 4px; }

    .section-title {
      font-size: 10px;
      font-weight: 700;
      color: ${BRAND_GOLD};
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 16px;
    }
    .card {
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px 24px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 13px;
    }
    .row:last-child { border-bottom: none; }
    .row .key   { color: #6b7280; }
    .row .val   { font-weight: 600; color: #111; text-align: right; max-width: 60%; }
    .address-row {
      padding: 12px 0 0;
      font-size: 13px;
    }
    .address-row .key { color: #6b7280; margin-bottom: 4px; }
    .address-row .val { font-weight: 600; color: #111; line-height: 1.5; }

    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      text-align: center;
    }
    .footer-thanks { font-size: 12px; color: ${BRAND_GREEN}; font-weight: 600; }
    .footer-url    { font-size: 11px; color: #bbb; margin-top: 4px; }

    @media print { body { padding: 20px 28px; } }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="brand-name">CASA VERDE</div>
      <div class="brand-url">casaverdeoficial.com</div>
    </div>
    <div class="order-meta">
      <div class="label">Pedido</div>
      <div class="order-number">${c.orderNumber}</div>
      <div class="order-date">${c.date}</div>
    </div>
  </div>

  <div class="section-title">Datos del Cliente</div>
  <div class="card">
    <div class="row"><span class="key">Nombre</span><span class="val">${c.name}</span></div>
    <div class="row"><span class="key">Email</span><span class="val">${c.email}</span></div>
    <div class="row"><span class="key">Teléfono</span><span class="val">${c.phone}</span></div>
    ${c.cedula ? `<div class="row"><span class="key">Cédula</span><span class="val">${c.cedula}</span></div>` : ""}
    <div class="address-row">
      <div class="key">Dirección de Entrega</div>
      <div class="val">${c.address}</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-thanks">Gracias por tu compra en Casa Verde</div>
    <div class="footer-url">casaverdeoficial.com</div>
  </div>

  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`;
}

/**
 * Abre una ventana solo con los datos del cliente y dispara el diálogo de impresión.
 */
export function printCustomer(customer: PrintableCustomer): void {
  const html = buildCustomerDocument(customer);

  const win = window.open("", "_blank", "width=680,height=560");
  if (!win) {
    alert("Permite ventanas emergentes en este sitio para poder descargar el PDF.");
    return;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();
}
