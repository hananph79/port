# Peerzada Abdul Hanan — Golden Pulse

A responsive, single-page editorial portfolio using the supplied resume. Built with Vite 5, React 18, TypeScript 5, Tailwind CSS 3, and Framer Motion 11. Fonts are self-hosted through Fontsource.

## Develop

Requires Node.js 20.19+ (validated with Node 24.19.0) and npm.

```sh
npm ci
npm run dev -- --port 5173
```

## Validate and publish

```sh
npm run typecheck
npm run build
npm run preview -- --port 4173
```

Deploy the generated `dist/` directory to a static host. No backend, API keys, or environment variables are required. The contact form validates locally and opens a prefilled `mailto:` draft; it does not send messages automatically. Users can also contact Hanan directly by email, phone, or LinkedIn.

All resume content is in `src/content.ts`. The original downloadable resume is in `public/peerzada-abdul-hanan-resume.pdf`. No portrait was supplied, so the hero uses an editorial initials composition. All experience responsibilities, achievements, skills, tools, degrees, certifications, languages, and interests are included.

The layout supports mobile navigation with keyboard focus management, skip navigation, visible focus states, accessible form errors, and reduced-motion preferences. Runtime processes must be restarted in fresh cloud tasks; use the existing isolated checkout rather than creating a Git worktree.
