# Hanan Portfolio — CMS-Powered Website

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hananph79/port)

A responsive, single-page creative strategist portfolio with a Supabase-powered Admin CMS. Built with Vite 5, React 18, TypeScript 5, Tailwind CSS 3, and Framer Motion 11. Fonts are self-hosted through Fontsource.

---

## 🚀 Deploy to Vercel

1. Click the **"Deploy with Vercel"** button above, or go to [vercel.com/new](https://vercel.com/new) and import this repository.
2. Vercel **auto-detects** the Vite framework — no manual framework/build settings needed.
3. Add these two **Environment Variables** in Vercel → Project Settings → Environment Variables:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase dashboard → your project → Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase dashboard → your project → Settings → API → `anon` public key |

4. Click **Deploy** — Vercel builds and publishes automatically on every `git push`. ✅

> **Note:** If you don't add Supabase credentials, the portfolio still works and shows the default resume data as a fallback.

---

## 🛠 Local Development

Requires Node.js 20+ and npm.

```sh
npm ci
npm run dev
```

## ✅ Build & Preview

```sh
npm run typecheck   # type-check only
npm run build       # production build → dist/
npm run preview     # preview the dist/ build locally
```

---

## 🗂 Admin CMS

- Go to `/auth` → log in with your Supabase email/password.
- Edit every section: Hero, About, Projects, Experience, Achievements, Skills, Tools, Contact.
- Changes reflect on the live portfolio immediately.

All resume content defaults are in `src/data/defaultPortfolioData.ts`.
The Supabase schema is in `supabase/schema.sql`.
