import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import { z } from "zod";

const {
  PORT = 5000, CLIENT_ORIGINS = "", TO_EMAIL = "levlox@gmail.com",
  GMAIL_USER, GMAIL_APP_PASSWORD, RESEND_API_KEY,
  RESEND_FROM = "LevLox Tech <onboarding@resend.dev>", SEND_CONFIRMATION = "false",
} = process.env;

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "20kb" }));

const allowed = CLIENT_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => (!origin || allowed.includes(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS"))),
  methods: ["POST", "GET"],
}));

app.use("/api/apply", rateLimit({
  windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { message: "Too many submissions. Please try again later." },
}));

const opt = z.string().trim().max(500).optional().default("");
const schema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(120),
  phone: z.string().trim().min(7, "Please enter a valid contact number").max(20),
  experience: z.string().trim().min(1, "Please select your work experience"),
  spendDailyHours: z.string().trim().min(1, "Please answer if you can commit 2 hours daily"),
  readyToInvest: z.string().trim().min(1, "Please select your investment preference"),
  message: opt,
  website: z.string().max(0).optional().default(""),
});

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const rows = (d) => [
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
            <div style="display:inline-block;padding:4px 12px;background:rgba(255,255,255,0.2);border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px;">
              ✨ New Candidate Lead
            </div>
            <h1 style="margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">${esc(d.fullName)}</h1>
            <p style="margin:6px 0 0;font-size:14px;color:#e0e7ff;">Submitted application via LevLox portal</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Quick Highlights -->
    <div style="padding:24px 32px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
      <table style="width:100%;border-collapse:separate;border-spacing:8px 0;">
        <tr>
          <td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;text-align:center;width:33%;">
            <div style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;">Experience</div>
            <div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:4px;">${esc(d.experience)}</div>
          </td>
          <td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;text-align:center;width:33%;">
            <div style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;">2h Daily?</div>
            <div style="font-size:13px;font-weight:700;color:${isTimeYes ? "#059669" : "#dc2626"};margin-top:4px;">${esc(d.spendDailyHours)}</div>
          </td>
          <td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;text-align:center;width:33%;">
            <div style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;">Ready to Invest?</div>
            <div style="font-size:13px;font-weight:700;color:${isInvestYes ? "#4f46e5" : "#64748b"};margin-top:4px;">${esc(d.readyToInvest)}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Detailed Table -->
    <div style="padding:24px 32px;">
      <h3 style="margin:0 0 14px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;color:#475569;font-weight:700;">Candidate Details</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 0;color:#64748b;font-weight:600;width:170px;">Full Name</td>
          <td style="padding:12px 0;color:#0f172a;font-weight:700;">${esc(d.fullName)}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 0;color:#64748b;font-weight:600;">Email Address</td>
          <td style="padding:12px 0;"><a href="mailto:${esc(d.email)}" style="color:#4f46e5;text-decoration:none;font-weight:600;">${esc(d.email)}</a></td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 0;color:#64748b;font-weight:600;">Phone / WhatsApp</td>
          <td style="padding:12px 0;"><a href="tel:${esc(cleanPhone)}" style="color:#0f172a;text-decoration:none;font-weight:700;">+${esc(cleanPhone)}</a></td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 0;color:#64748b;font-weight:600;">Work Experience</td>
          <td style="padding:12px 0;color:#0f172a;font-weight:600;">${esc(d.experience)}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 0;color:#64748b;font-weight:600;">Spend 2 Hours Daily</td>
          <td style="padding:12px 0;color:#0f172a;font-weight:600;">${esc(d.spendDailyHours)}</td>
        </tr>
        <tr>
          <td style="padding:12px 0;color:#64748b;font-weight:600;">Ready to Invest</td>
          <td style="padding:12px 0;color:#0f172a;font-weight:600;">${esc(d.readyToInvest)}</td>
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

const confirmHtml = (d) => `
<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e0e7ff;border-radius:12px;overflow:hidden;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#ffffff;padding:24px 28px;">
    <h2 style="margin:0;font-size:20px;">Hi ${esc(d.fullName)},</h2>
    <p style="margin:6px 0 0;font-size:14px;color:#e0e7ff;">Thank you for applying to LevLox!</p>
  </div>
  <div style="padding:24px 28px;color:#334155;line-height:1.6;font-size:15px;">
    <p>We've received your details and our team is currently reviewing your profile.</p>
    <p>We will get in touch with you shortly via WhatsApp or call on <b>${esc(d.phone)}</b>.</p>
    <p style="margin-top:24px;">Best regards,<br><strong style="color:#4f46e5;">Team LevLox</strong></p>
  </div>
</div>`;

let transporter;
const getTransporter = () => (transporter ||= nodemailer.createTransport({
  service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
}));

async function sendMail({ to, subject, html, replyTo }) {
  if (RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html, reply_to: replyTo }),
    });
    if (!res.ok) throw new Error(`Resend error: ${await res.text()}`);
    return;
  }
  if (!GMAIL_APP_PASSWORD || GMAIL_APP_PASSWORD.includes("xxxx")) {
    console.log("📨 [DEV MODE] Email credentials not configured. Application received:");
    console.log({ to, subject, replyTo });
    return;
  }
  await getTransporter().sendMail({ from: `"LevLox Tech" <${GMAIL_USER}>`, to, subject, html, replyTo });
}

app.get("/", (_req, res) => res.send("LevLox form API running"));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/apply", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid form data" });
  }
  const d = parsed.data;
  if (d.website) return res.json({ ok: true }); // honeypot: silently drop bots

  try {
    await sendMail({
      to: TO_EMAIL,
      subject: `New Application: ${d.fullName} (${d.experience}) — LevLox`,
      html: adminHtml(d),
      replyTo: d.email,
    });
    if (SEND_CONFIRMATION === "true") {
      sendMail({ to: d.email, subject: "We received your application — LevLox", html: confirmHtml(d) })
        .catch((e) => console.error("Confirmation failed:", e.message));
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Mail error:", err.message);
    res.status(500).json({ message: "Could not send your application. Please try again." });
  }
});

app.use((err, _req, res, _next) => res.status(err.message === "Not allowed by CORS" ? 403 : 500).json({ message: err.message }));

app.listen(PORT, () => console.log(`API on :${PORT}`));
