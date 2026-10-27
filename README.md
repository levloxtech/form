# LevLox Application Form

## Frontend (Vercel)
1. Copy `frontend/src/pages/ApplicationForm.jsx` into your React project's `src/pages/`.
2. Add the route in your router:
   ```jsx
   import ApplicationForm from "./pages/ApplicationForm";
   <Route path="/apply" element={<ApplicationForm />} />
   ```
3. Link to it anywhere: `<Link to="/apply">Apply Now</Link>`
4. Vercel env var: `VITE_API_URL=https://<your-render-service>.onrender.com`
5. For React Router on Vercel add `vercel.json`:
   `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`

## Backend (Render)
1. Push `backend/` to GitHub. Render -> New -> Web Service.
2. Build: `npm install`   Start: `npm start`
3. Environment variables: copy from `.env.example`.
   - `CLIENT_ORIGINS` = your Vercel URL (no trailing slash)
   - Gmail: enable 2-Step Verification, then create an App Password at https://myaccount.google.com/apppasswords
   - Render free tier blocks SMTP -> use `RESEND_API_KEY` (resend.com, free) or a paid Render plan.
4. Test: open `https://<service>.onrender.com/health`
