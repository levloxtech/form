import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ""
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.PROD ? "" : "http://localhost:5000");

export const TEAM_MEMBERS = [
  { id: "kalam", name: "Kalam", role: "Team Lead", avatar: "👑", isDefault: true, path: "/" },
  { id: "asmi", name: "Asmi", role: "Talent Specialist", avatar: "💼", isDefault: false, path: "/asmi" },
  { id: "sudhan", name: "Sudhan", role: "Career Advisor", avatar: "🚀", isDefault: false, path: "/sudhan" },
  { id: "sathik", name: "Sathik", role: "Acquisition Lead", avatar: "🎯", isDefault: false, path: "/sathik" },
];

export const RECRUITERS_BY_ID = Object.fromEntries(TEAM_MEMBERS.map((m) => [m.id, m]));
export const DEFAULT_RECRUITER = RECRUITERS_BY_ID.kalam;

export function resolveRecruiter() {
  if (typeof window === "undefined") return DEFAULT_RECRUITER;

  // 1. Check URL query params (?user=asmi or ?ref=asmi or ?recruiter=asmi)
  const searchParams = new URLSearchParams(window.location.search);
  const q = (searchParams.get("user") || searchParams.get("ref") || searchParams.get("recruiter") || searchParams.get("u") || "").toLowerCase().trim();
  if (q && RECRUITERS_BY_ID[q]) {
    return RECRUITERS_BY_ID[q];
  }

  // 2. Check path segments (e.g. /asmi, /users/asmi, /sudhan, /sathik, /kalam)
  const segments = window.location.pathname.toLowerCase().split("/").filter(Boolean);
  for (const seg of segments) {
    if (RECRUITERS_BY_ID[seg]) {
      return RECRUITERS_BY_ID[seg];
    }
  }

  return DEFAULT_RECRUITER;
}

const EXPERIENCE_OPTIONS = [
  { id: "Above 1 Year Experience", label: "Above 1 Year Experience", desc: "1 to 3 years of practical work experience" },
  { id: "3 - 5 Years Experience", label: "3 - 5 Years Experience", desc: "Mid-level professional experience" },
  { id: "Above 5 Years Experience", label: "Above 5 Years Experience", desc: "Senior-level working professional" },
  { id: "10+ Years Experience", label: "10+ Years Experience", desc: "Lead, managerial, or leadership experience" },
];

const DAILY_HOURS_OPTIONS = [
  { id: "Yes, absolutely", label: "Yes, absolutely", desc: "I can comfortably dedicate 2+ hours daily" },
  { id: "No, difficult currently", label: "No / Difficult currently", desc: "My current schedule doesn't permit 2 hours" },
];

const INVEST_OPTIONS = [
  { id: "Yes", label: "Yes", desc: "Ready to invest in myself" },
  { id: "No", label: "No", desc: "Not ready to invest" },
];

export default function ApplicationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    experience: "",
    spendDailyHours: "",
    readyToInvest: "",
    website: "", // honeypot
  });

  const [activeRecruiter, setActiveRecruiter] = useState(resolveRecruiter);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const handleLocationChange = () => {
      setActiveRecruiter(resolveRecruiter());
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errs.fullName = "Please enter your full name";
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      errs.phone = "Please enter a valid contact / WhatsApp number";
    }
    if (!formData.experience) {
      errs.experience = "Please select your experience level";
    }
    if (!formData.spendDailyHours) {
      errs.spendDailyHours = "Please let us know if you can dedicate 2 hours daily";
    }
    if (!formData.readyToInvest) {
      errs.readyToInvest = "Please choose the option that best reflects your preference";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) {
      const firstError = document.querySelector(".has-error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        recruiter: activeRecruiter.name,
      };

      const res = await fetch(`${API}/api/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Server returned ${res.status}`);
      }

      setSubmittedData({ ...payload });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setApiError(err.message || "Failed to submit application. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      experience: "",
      spendDailyHours: "",
      readyToInvest: "",
      website: "",
    });
    setErrors({});
    setApiError("");
    setSubmittedData(null);
  };

  // SUCCESS STATE (Clean, elegant light theme)
  if (submittedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 text-slate-800 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(79,70,229,0.08)] text-center relative overflow-hidden">
          {/* Top subtle highlight bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

          {/* Clean transparent logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/logo_transparent.png"
              alt="LevLox"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider rounded-full border border-emerald-200 mb-4">
            Application Submitted
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Application Received!</h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
            Thank you, <span className="text-slate-900 font-semibold">{submittedData.fullName}</span>. We’re excited to review your profile.
          </p>

          <div className="mt-6 bg-slate-50/80 border border-slate-200/70 rounded-2xl p-5 text-left space-y-3">
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-slate-200/60 pb-2.5">
              <span className="text-slate-500 font-medium">Assigned Recruiter:</span>
              <span className="text-indigo-700 font-bold">
                {submittedData.recruiter || activeRecruiter.name}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-slate-200/60 pb-2.5">
              <span className="text-slate-500 font-medium">Email:</span>
              <span className="text-slate-900 font-medium">{submittedData.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-slate-200/60 pb-2.5">
              <span className="text-slate-500 font-medium">WhatsApp / Phone:</span>
              <span className="text-slate-900 font-medium">{submittedData.phone}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-slate-200/60 pb-2.5">
              <span className="text-slate-500 font-medium">Experience Level:</span>
              <span className="text-indigo-600 font-semibold">{submittedData.experience}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-slate-200/60 pb-2.5">
              <span className="text-slate-500 font-medium">2 Hours Daily Commitment:</span>
              <span className="text-emerald-700 font-semibold">{submittedData.spendDailyHours}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-500 font-medium">Ready to Invest:</span>
              <span className="text-indigo-700 font-semibold">{submittedData.readyToInvest}</span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs sm:text-sm text-indigo-950 text-left">
            <strong className="text-indigo-950 block font-semibold mb-0.5">What happens next?</strong>
            Our team will review your responses and connect with you on WhatsApp / Phone within 24 hours.
          </div>

          <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-600 font-medium">Course Agenda:</span>
            <a
              href="/20_days_agenda.pdf"
              download="20_days_agenda.pdf"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200 transition"
            >
              Download 20-Day Agenda (PDF)
            </a>
          </div>

          <button
            onClick={handleReset}
            className="mt-6 w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition duration-150 shadow-sm text-sm cursor-pointer"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  // MAIN FORM (Crisp, High-End Modern Light Theme)
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-[#f8fafc] to-indigo-50/20 text-slate-800 flex flex-col justify-between py-10 sm:py-16 px-4">
      <div className="max-w-xl w-full mx-auto">
        {/* Main Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-[0_15px_40px_-10px_rgba(79,70,229,0.07)] relative">
          
          {/* Header with Transparent Logo */}
          <div className="text-center mb-8 pb-6 border-b border-slate-100">
            <div className="flex justify-center mb-5">
              <img
                src="/logo_transparent.png"
                alt="LevLox"
                className="h-11 sm:h-13 w-auto object-contain"
              />
            </div>
            
            {/* Recruiter Badge (Determined purely by URL path) */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border bg-slate-50 border-slate-200">
                <span className="text-slate-500">Form assigned to:</span>
                <span className="text-indigo-900 font-bold">{activeRecruiter.name}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Start Your Journey with LevLox
            </h1>
            <p className="mt-2 text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
              Please fill out these few quick details so our team can evaluate your profile and reach out with the best opportunity.
            </p>
          </div>

          {/* 20-Day Agenda PDF Download Banner */}
          <div className="mb-7 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50/50 to-white border border-indigo-100 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600" />

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                  Course Curriculum
                </span>
                <span className="text-xs text-slate-500 font-medium">20 Days &bull; 7+ Hands-On Projects</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                Course Curriculum & Projects Agenda
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Deep Learning &bull; Attention &bull; Transformers &bull; LLM Fundamentals &bull; RAG
              </p>
            </div>

            {/* Action buttons row */}
            <div className="mt-4 pt-3.5 border-t border-slate-200/60 flex items-center gap-2.5">
              <a
                href="/20_days_agenda.pdf"
                download="20_days_agenda.pdf"
                className="flex-1 inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-sm shadow-indigo-600/20 transition duration-150 cursor-pointer"
              >
                Download 20-Day Agenda (PDF)
              </a>
              <a
                href="/20_days_agenda.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition"
                title="View PDF in new tab"
              >
                View PDF
              </a>
            </div>
          </div>

          {apiError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Honeypot field */}
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={(e) => handleChange("website", e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            {/* 1. Full Name */}
            <div className={`space-y-1.5 ${errors.fullName ? "has-error" : ""}`}>
              <label className="block text-sm font-semibold text-slate-800">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm transition outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 ${
                    errors.fullName ? "border-rose-400 bg-rose-50/20" : "border-slate-200 hover:border-slate-300"
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
            </div>

            {/* 2. Email Address */}
            <div className={`space-y-1.5 ${errors.email ? "has-error" : ""}`}>
              <label className="block text-sm font-semibold text-slate-800">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm transition outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 ${
                    errors.email ? "border-rose-400 bg-rose-50/20" : "border-slate-200 hover:border-slate-300"
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
            </div>

            {/* 3. Phone / WhatsApp Number */}
            <div className={`space-y-1.5 ${errors.phone ? "has-error" : ""}`}>
              <label className="block text-sm font-semibold text-slate-800">
                Phone Number / WhatsApp Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm transition outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 ${
                    errors.phone ? "border-rose-400 bg-rose-50/20" : "border-slate-200 hover:border-slate-300"
                  }`}
                />
              </div>
              <p className="text-[12px] text-slate-500">We will use this number to contact you on WhatsApp / Phone Call.</p>
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
            </div>

            {/* 4. Work Experience (Featuring Above 1 Year Experience) */}
            <div className={`space-y-2 pt-1 ${errors.experience ? "has-error" : ""}`}>
              <div className="flex justify-between items-baseline">
                <label className="block text-sm font-semibold text-slate-800">
                  Work Experience <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400">Select one</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EXPERIENCE_OPTIONS.map((opt) => {
                  const selected = formData.experience === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleChange("experience", opt.id)}
                      className={`text-left p-3.5 rounded-2xl border transition duration-150 cursor-pointer flex items-start justify-between ${
                        selected
                          ? "bg-indigo-50/70 border-indigo-600 shadow-sm text-indigo-950 ring-1 ring-indigo-600/30"
                          : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/60 text-slate-700"
                      }`}
                    >
                      <div>
                        <div className={`font-semibold text-sm ${selected ? "text-indigo-950" : "text-slate-800"}`}>
                          {opt.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 mt-0.5 transition ${
                          selected ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.experience && <p className="text-xs text-rose-500 mt-1">{errors.experience}</p>}
            </div>

            {/* 5. Are you ready to spend 2 hours daily? */}
            <div className={`space-y-2 pt-1 ${errors.spendDailyHours ? "has-error" : ""}`}>
              <label className="block text-sm font-semibold text-slate-800">
                Are you ready to spend 2 hours daily? <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DAILY_HOURS_OPTIONS.map((opt) => {
                  const selected = formData.spendDailyHours === opt.id;
                  const isPositive = opt.id.startsWith("Yes");
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleChange("spendDailyHours", opt.id)}
                      className={`text-left p-3.5 rounded-2xl border transition duration-150 cursor-pointer flex items-start justify-between ${
                        selected
                          ? isPositive
                            ? "bg-emerald-50/70 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600/30"
                            : "bg-slate-100 border-slate-400 text-slate-800"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm">
                          {opt.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 mt-0.5 transition ${
                          selected
                            ? isPositive
                              ? "border-emerald-600 bg-emerald-600"
                              : "border-slate-500 bg-slate-500"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.spendDailyHours && <p className="text-xs text-rose-500 mt-1">{errors.spendDailyHours}</p>}
            </div>

            {/* 6. Are you ready to invest in yourself? */}
            <div className={`space-y-2 pt-1 ${errors.readyToInvest ? "has-error" : ""}`}>
              <label className="block text-sm font-semibold text-slate-800">
                Are you ready to invest in yourself? <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INVEST_OPTIONS.map((opt) => {
                  const selected = formData.readyToInvest === opt.id;
                  const isYes = opt.id === "Yes";
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleChange("readyToInvest", opt.id)}
                      className={`text-left p-3.5 rounded-2xl border transition duration-150 cursor-pointer flex items-start justify-between ${
                        selected
                          ? isYes
                            ? "bg-indigo-50/80 border-indigo-600 text-indigo-950 ring-1 ring-indigo-600/30"
                            : "bg-slate-100 border-slate-400 text-slate-800"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm">
                          {opt.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 mt-0.5 transition ${
                          selected
                            ? isYes
                              ? "border-indigo-600 bg-indigo-600"
                              : "border-slate-500 bg-slate-500"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.readyToInvest && <p className="text-xs text-rose-500 mt-1">{errors.readyToInvest}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:via-indigo-800 hover:to-purple-700 active:scale-[0.99] transition duration-150 shadow-lg shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-base cursor-pointer tracking-wide"
              >
                {submitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <span>Submit Application</span>
                )}
              </button>
            </div>


          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} LevLox. All rights reserved.
      </footer>
    </div>
  );
}
