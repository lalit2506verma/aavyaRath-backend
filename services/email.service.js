const transporter = require("../config/email");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const BRAND_COLOR = "#8B5E3C";

// ── Shared HTML wrapper ──────────────────────────────────
const wrap = (content) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:${BRAND_COLOR};padding:28px 40px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">🏡 Artisan Home</h1>
        <p style="margin:4px 0 0;color:#f0e6dc;font-size:12px;letter-spacing:2px;">HANDCRAFTED WITH LOVE</p>
      </td></tr>
      <tr><td style="background:#fff;padding:40px;border-radius:0 0 8px 8px;">${content}</td></tr>
      <tr><td style="padding:20px;text-align:center;">
        <p style="margin:0;color:#999;font-size:12px;">© ${new Date().getFullYear()} Artisan Home &nbsp;·&nbsp; <a href="${FRONTEND_URL}" style="color:${BRAND_COLOR};">Visit our store</a></p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;

// Status badge colour map
const STATUS_COLORS = {
  pending: { bg: "#FFF3CD", text: "#856404" },
  processing: { bg: "#D1ECF1", text: "#0C5460" },
  shipped: { bg: "#CCE5FF", text: "#004085" },
  delivered: { bg: "#D4EDDA", text: "#155724" },
  cancelled: { bg: "#F8D7DA", text: "#721C24" },
};

const badge = (status) => {
  const c = STATUS_COLORS[status] || { bg: "#e9ecef", text: "#495057" };
  return `<span style="background:${c.bg};color:${c.text};padding:4px 14px;border-radius:20px;font-size:13px;font-weight:bold;">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
};

const itemsTable = (items) => `
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
  <thead><tr style="background:#f9f5f1;border-bottom:2px solid #e8ddd4;">
    <th style="text-align:left;padding:10px 12px;font-size:13px;color:#666;">Item</th>
    <th style="text-align:center;padding:10px 12px;font-size:13px;color:#666;">Qty</th>
    <th style="text-align:right;padding:10px 12px;font-size:13px;color:#666;">Amount</th>
  </tr></thead>
  <tbody>${items
    .map(
      (i) => `
    <tr style="border-bottom:1px solid #f0ebe5;">
      <td style="padding:12px;font-size:14px;color:#333;">${i.name}</td>
      <td style="padding:12px;font-size:14px;color:#333;text-align:center;">${i.quantity}</td>
      <td style="padding:12px;font-size:14px;color:#333;text-align:right;">₹${i.total.toFixed(2)}</td>
    </tr>`,
    )
    .join("")}
  </tbody>
</table>`;

const totalsTable = (order) => `
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding:5px 0;font-size:14px;color:#666;">Subtotal</td><td style="text-align:right;font-size:14px;color:#333;">₹${order.subtotal.toFixed(2)}</td></tr>
  <tr><td style="padding:5px 0;font-size:14px;color:#666;">Shipping</td><td style="text-align:right;font-size:14px;color:#333;">${order.shipping_cost === 0 ? "Free" : `₹${order.shipping_cost.toFixed(2)}`}</td></tr>
  <tr><td style="padding:5px 0;font-size:14px;color:#666;">Tax (GST 18%)</td><td style="text-align:right;font-size:14px;color:#333;">₹${order.tax.toFixed(2)}</td></tr>
  ${order.discount > 0 ? `<tr><td style="padding:5px 0;font-size:14px;color:#28a745;">Discount</td><td style="text-align:right;font-size:14px;color:#28a745;">- ₹${order.discount.toFixed(2)}</td></tr>` : ""}
  <tr style="border-top:2px solid #e8ddd4;">
    <td style="padding:12px 0 5px;font-size:16px;font-weight:bold;color:#333;">Total</td>
    <td style="text-align:right;font-size:16px;font-weight:bold;color:${BRAND_COLOR};padding:12px 0 5px;">₹${order.total.toFixed(2)}</td>
  </tr>
</table>`;

// ── Email templates ──────────────────────────────────────

const templates = {
  orderConfirmation: ({ user, order }) => ({
    subject: `Order Confirmed! #${order.order_number} 🎉`,
    html: wrap(`
      <h2 style="margin:0 0 8px;color:#333;">Thank you for your order!</h2>
      <p style="color:#666;font-size:15px;">Hi ${user.name}, we've received your order and are getting it ready.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5f1;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <tr><td><p style="margin:0;font-size:12px;color:#888;">ORDER NUMBER</p><p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:#333;">${order.order_number}</p></td>
        <td style="text-align:right;">${badge(order.fulfillment_status)}</td></tr>
      </table>
      <h3 style="font-size:14px;color:#555;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Your Items</h3>
      ${itemsTable(order.items)}
      ${totalsTable(order)}
      <h3 style="font-size:14px;color:#555;text-transform:uppercase;letter-spacing:1px;margin:20px 0 8px;">Shipping To</h3>
      <p style="font-size:14px;color:#444;line-height:1.7;">
        ${order.shipping_address.full_name}<br/>
        ${order.shipping_address.line1}${order.shipping_address.line2 ? ", " + order.shipping_address.line2 : ""}<br/>
        ${order.shipping_address.city}, ${order.shipping_address.state} – ${order.shipping_address.pincode}<br/>
        📱 ${order.shipping_address.phone}
      </p>
      <div style="text-align:center;margin:32px 0 8px;">
        <a href="${FRONTEND_URL}/orders/${order.order_id}" style="background:${BRAND_COLOR};color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:15px;display:inline-block;">View Your Order</a>
      </div>
      <p style="text-align:center;color:#999;font-size:13px;">We'll email you when your order ships.</p>
    `),
  }),

  orderStatusUpdate: ({ user, order }) => {
    const messages = {
      processing: {
        headline: "We're preparing your order 📦",
        body: "Your order is being processed and will be packed shortly.",
      },
      shipped: {
        headline: "Your order is on its way! 🚚",
        body: "Your order has been dispatched and is heading to you.",
      },
      delivered: {
        headline: "Your order has been delivered! 🎁",
        body: "We hope you love your new piece! Share your thoughts with a review.",
      },
      cancelled: {
        headline: "Your order has been cancelled",
        body: "If you paid online, a refund will be initiated within 5–7 business days.",
      },
    };
    const msg = messages[order.fulfillment_status] || {
      headline: "Order Update",
      body: "Your order status has been updated.",
    };

    return {
      subject: `Order Update: ${msg.headline} — #${order.order_number}`,
      html: wrap(`
        <h2 style="margin:0 0 8px;color:#333;">${msg.headline}</h2>
        <p style="color:#666;font-size:15px;">Hi ${user.name}, ${msg.body}</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5f1;border-radius:8px;padding:16px 20px;margin:20px 0;">
          <tr><td><p style="margin:0;font-size:12px;color:#888;">ORDER NUMBER</p><p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:#333;">${order.order_number}</p></td>
          <td style="text-align:right;">${badge(order.fulfillment_status)}</td></tr>
        </table>
        ${
          order.tracking_number
            ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#EBF5FB;border-radius:8px;padding:16px 20px;margin:0 0 20px;border-left:4px solid #3498DB;">
          <tr><td>
            <p style="margin:0;font-size:12px;color:#2471A3;">TRACKING INFORMATION</p>
            <p style="margin:8px 0 4px;font-size:15px;color:#333;"><strong>Tracking Number:</strong> ${order.tracking_number}</p>
            ${order.courier_partner ? `<p style="margin:0;font-size:15px;color:#333;"><strong>Courier Partner:</strong> ${order.courier_partner}</p>` : ""}
            ${order.estimated_delivery ? `<p style="margin:4px 0 0;font-size:14px;color:#555;"><strong>Estimated Delivery:</strong> ${new Date(order.estimated_delivery).toDateString()}</p>` : ""}
          </td></tr>
        </table>`
            : ""
        }
        <h3 style="font-size:14px;color:#555;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Order Summary</h3>
        ${itemsTable(order.items)}
        <div style="text-align:center;margin:32px 0 8px;">
          <a href="${FRONTEND_URL}/orders/${order.order_id}" style="background:${BRAND_COLOR};color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:15px;display:inline-block;">Track Your Order</a>
        </div>
      `),
    };
  },
};

// ── Send helper ──────────────────────────────────────────
/**
 * sendEmail({ to, subject, html })
 * Silently skips if SMTP credentials are not configured (dev mode).
 * Errors are caught and logged — never crash the API response.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(
      `[Email skipped — no SMTP config]\nTo: ${to}\nSubject: ${subject}`,
    );
    return;
  }
  try {
    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM || '"Artisan Home" <no-reply@artisanhome.com>',
      to,
      subject,
      html,
    });
    console.log(`✉️  Email sent → ${to} (${info.messageId})`);
  } catch (err) {
    console.error(`❌ Email failed → ${to}:`, err.message);
  }
};

module.exports = { sendEmail, templates };
