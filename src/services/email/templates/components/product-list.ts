import type { CartItemEmailData } from "../../types";

export function productList(items: CartItemEmailData[]): string {
  if (items.length === 0) return "";

  const rows = items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #F3F4F6;vertical-align:middle;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            ${item.imageUrl ? `
            <td style="width:64px;padding-right:12px;vertical-align:middle;">
              <img src="${item.imageUrl}" alt="${item.name}" width="64" height="64"
                style="border-radius:6px;object-fit:cover;display:block;" />
            </td>` : ""}
            <td style="vertical-align:middle;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#1F2937;">${item.name}</p>
              ${item.color ? `<p style="margin:2px 0 0 0;font-size:12px;color:#6B7280;">Color: ${item.color}</p>` : ""}
              ${item.size  ? `<p style="margin:2px 0 0 0;font-size:12px;color:#6B7280;">Talla: ${item.size}</p>`  : ""}
            </td>
            <td style="vertical-align:middle;text-align:right;white-space:nowrap;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#154734;">${formatCOP(item.price)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tbody>${rows}</tbody>
  </table>`;
}

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}
