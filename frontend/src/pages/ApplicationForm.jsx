import { useState } from "react";

const API = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ""
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.PROD ? "" : "http://localhost:5000");

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

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [apiError, setApiError] = useState("");

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
      const res = await fetch(`${API}/api/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Server returned ${res.status}`);
      }

      setSubmittedData({ ...formData });
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

          {/* Success Check Icon */}
          <div className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-5">
            <svg className="w-8 h-8 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Application Received!</h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
            Thank you, <span className="text-slate-900 font-semibold">{submittedData.fullName}</span>. We’re excited to review your profile.
          </p>

          <div className="mt-6 bg-slate-50/80 border border-slate-200/70 rounded-2xl p-5 text-left space-y-3">
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

          <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs sm:text-sm text-indigo-950 text-left flex items-start gap-3">
            <span className="text-base text-indigo-600 mt-0.5">✨</span>
            <div>
              <strong className="text-indigo-950 block font-semibold mb-0.5">What happens next?</strong>
              Our team will review your responses and connect with you on WhatsApp / Phone within 24 hours.
            </div>
          </div>

          <button
            onClick={handleReset}
            className="mt-7 w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition duration-150 shadow-sm text-sm cursor-pointer"
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
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              Fast-Track Candidate Application
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Start Your Journey with LevLox
            </h1>
            <p className="mt-2 text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
              Please fill out these few quick details so our team can evaluate your profile and reach out with the best opportunity.
            </p>
          </div>

          {apiError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>{apiError}</div>
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
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm transition outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 ${
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
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm transition outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 ${
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
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.12 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.07 16.3C4.24 14.98 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.05 3.68C14.25 3.68 16.32 4.54 17.88 6.1C19.44 7.66 20.29 9.72 20.29 11.92C20.28 16.46 16.59 20.16 12.05 20.16ZM16.57 14.36C16.32 14.23 15.1 13.63 14.87 13.55C14.65 13.46 14.48 13.42 14.32 13.67C14.15 13.92 13.68 14.48 13.53 14.64C13.39 14.81 13.25 14.83 13 14.71C12.75 14.58 11.95 14.32 11 13.48C10.26 12.82 9.77 12.01 9.62 11.76C9.48 11.51 9.61 11.38 9.73 11.25C9.84 11.14 9.98 10.96 10.11 10.81C10.23 10.66 10.28 10.55 10.36 10.39C10.44 10.22 10.4 10.08 10.34 9.95C10.28 9.83 9.78 8.6 9.58 8.09C9.37 7.6 9.17 7.66 9.02 7.66C8.87 7.65 8.71 7.65 8.54 7.65C8.38 7.65 8.11 7.71 7.89 7.96C7.66 8.21 7.03 8.79 7.03 10.01C7.03 11.23 7.92 12.4 8.04 12.57C8.17 12.73 9.78 15.22 12.24 16.28C12.83 16.53 13.28 16.68 13.64 16.79C14.23 16.98 14.76 16.96 15.19 16.89C15.67 16.82 16.67 16.29 16.88 15.71C17.08 15.14 17.08 14.65 17.02 14.54C16.96 14.44 16.82 14.48 16.57 14.36Z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm transition outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 ${
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
                          selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && (
                          <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
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
                        <div className="font-semibold text-sm flex items-center gap-1.5">
                          <span>{isPositive ? "⚡" : "⏳"}</span>
                          {opt.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 mt-0.5 transition ${
                          selected
                            ? isPositive
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-500 bg-slate-500 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && (
                          <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
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
                        <div className="font-semibold text-sm flex items-center gap-1.5">
                          <span>{isYes ? "💎" : "⏳"}</span>
                          {opt.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 mt-0.5 transition ${
                          selected
                            ? isYes
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-500 bg-slate-500 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && (
                          <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
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
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
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
