import nodemailer from "nodemailer";

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let transporter;
const getTransporter = () => {
  const user = process.env.GMAIL_USER || "levlox@gmail.com";
  const pass = process.env.GMAIL_APP_PASSWORD;
  return (transporter ||= nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  }));
};

const formatRecruiter = (r = "") => {
  const clean = String(r || "").trim();
  if (!clean) return "Kalam";
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const rows = (d) => [
  ["Recruiter / Source", formatRecruiter(d.recruiter)],
  ["Full Name", d.fullName],
  ["Email Address", d.email],
  ["Phone / WhatsApp", d.phone],
  ["Work Experience", d.experience],
  ["Ready to spend 2 hrs daily?", d.spendDailyHours],
  ["Ready to invest in yourself?", d.readyToInvest],
].filter(([, v]) => v);

const adminHtml = (d) => {
  const cleanPhone = String(d.phone).replace(/[^0-9]/g, "");
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const isInvestYes = d.readyToInvest === "Yes";
  const isTimeYes = d.spendDailyHours.startsWith("Yes");
  const recruiter = formatRecruiter(d.recruiter);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:20px;background-color:#f1f5f9;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.08),0 8px 10px -6px rgba(0,0,0,0.04);border:1px solid #e2e8f0;">
    
    <!-- Header Banner -->
    <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:28px 32px;color:#ffffff;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td>
            <div style="display:inline-block;padding:5px 14px;background:rgba(255,255,255,0.22);border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;">
              👤 Recruiter: ${esc(recruiter)}
            </div>
            <h1 style="margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">${esc(d.fullName)}</h1>
            <p style="margin:6px 0 0;font-size:14px;color:#e0e7ff;">Submitted via LevLox portal &bull; Form assigned to <strong>${esc(recruiter)}</strong></p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Quick Highlights -->
    <div style="padding:20px 28px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
      <table style="width:100%;border-collapse:separate;border-spacing:6px 0;">
        <tr>
          <td style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;padding:10px 12px;text-align:center;width:25%;">
            <div style="font-size:10px;color:#4f46e5;font-weight:700;text-transform:uppercase;">Recruiter</div>
            <div style="font-size:13px;font-weight:800;color:#3730a3;margin-top:3px;">${esc(recruiter)}</div>
          </td>
          <td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;text-align:center;width:25%;">
            <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;">Experience</div>
            <div style="font-size:12px;font-weight:700;color:#0f172a;margin-top:3px;">${esc(d.experience)}</div>
          </td>
          <td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;text-align:center;width:25%;">
            <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;">2h Daily?</div>
            <div style="font-size:12px;font-weight:700;color:${isTimeYes ? "#059669" : "#dc2626"};margin-top:3px;">${esc(d.spendDailyHours)}</div>
          </td>
          <td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;text-align:center;width:25%;">
            <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;">Invest?</div>
            <div style="font-size:12px;font-weight:700;color:${isInvestYes ? "#4f46e5" : "#64748b"};margin-top:3px;">${esc(d.readyToInvest)}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Detailed Table -->
    <div style="padding:24px 32px;">
      <h3 style="margin:0 0 14px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;color:#475569;font-weight:700;">Candidate Details</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="border-bottom:1px solid #e0e7ff;background:#f5f3ff;">
          <td style="padding:12px 10px;color:#4338ca;font-weight:700;width:170px;">Assigned Recruiter</td>
          <td style="padding:12px 10px;color:#3730a3;font-weight:800;font-size:15px;">👤 ${esc(recruiter)}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 10px;color:#64748b;font-weight:600;">Full Name</td>
          <td style="padding:12px 10px;color:#0f172a;font-weight:700;">${esc(d.fullName)}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 10px;color:#64748b;font-weight:600;">Email Address</td>
          <td style="padding:12px 10px;"><a href="mailto:${esc(d.email)}" style="color:#4f46e5;text-decoration:none;font-weight:600;">${esc(d.email)}</a></td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 10px;color:#64748b;font-weight:600;">Phone / WhatsApp</td>
          <td style="padding:12px 10px;"><a href="tel:${esc(cleanPhone)}" style="color:#0f172a;text-decoration:none;font-weight:700;">+${esc(cleanPhone)}</a></td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 10px;color:#64748b;font-weight:600;">Work Experience</td>
          <td style="padding:12px 10px;color:#0f172a;font-weight:600;">${esc(d.experience)}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 10px;color:#64748b;font-weight:600;">Spend 2 Hours Daily</td>
          <td style="padding:12px 10px;color:#0f172a;font-weight:600;">${esc(d.spendDailyHours)}</td>
        </tr>
        <tr>
          <td style="padding:12px 10px;color:#64748b;font-weight:600;">Ready to Invest</td>
          <td style="padding:12px 10px;color:#0f172a;font-weight:600;">${esc(d.readyToInvest)}</td>
        </tr>
      </table>

      <!-- Quick Action Buttons -->
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f1f5f9;">
        <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:12px;">⚡ Connect with Candidate:</div>
        <table style="width:100%;border-collapse:separate;border-spacing:8px 0;">
          <tr>
            <td style="width:50%;">
              <a href="https://wa.me/${esc(waPhone)}" target="_blank" style="display:block;text-align:center;background:#25D366;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:700;font-size:14px;box-shadow:0 2px 6px rgba(37,211,102,0.25);">
                💬 Open WhatsApp
              </a>
            </td>
            <td style="width:50%;">
              <a href="mailto:${esc(d.email)}" style="display:block;text-align:center;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:700;font-size:14px;box-shadow:0 2px 6px rgba(79,70,229,0.25);">
                ✉️ Reply Email
              </a>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:12px;">
      Received on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST • LevLox Recruitment Engine
    </div>
  </div>
</body>
</html>`;
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { fullName, email, phone, experience, spendDailyHours, readyToInvest, recruiter, website } = req.body || {};

  // Honeypot check
  if (website) {
    return res.status(200).json({ ok: true });
  }

  if (!fullName || !email || !phone || !experience || !spendDailyHours || !readyToInvest) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  const TO_EMAIL = process.env.TO_EMAIL || "levlox@gmail.com";
  const GMAIL_USER = process.env.GMAIL_USER || "levlox@gmail.com";
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const RESEND_FROM = process.env.RESEND_FROM || "LevLox Tech <onboarding@resend.dev>";
  const recruiterName = formatRecruiter(recruiter);

  try {
    if (RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [TO_EMAIL],
          subject: `[${recruiterName}] New Application: ${fullName} (${experience}) — LevLox`,
          html: adminHtml(req.body),
          reply_to: email,
        }),
      });
      if (!response.ok) {
        throw new Error(`Resend error: ${await response.text()}`);
      }
    } else if (GMAIL_APP_PASSWORD && !GMAIL_APP_PASSWORD.includes("xxxx")) {
      await getTransporter().sendMail({
        from: `"LevLox Tech" <${GMAIL_USER}>`,
        to: TO_EMAIL,
        subject: `[${recruiterName}] New Application: ${fullName} (${experience}) — LevLox`,
        html: adminHtml(req.body),
        replyTo: email,
      });
    } else {
      console.log("📨 [DEV / MOCK MODE] Email sent to:", TO_EMAIL);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Mail send error:", err);
    return res.status(500).json({ message: "Failed to send application. Please try again." });
  }
}
