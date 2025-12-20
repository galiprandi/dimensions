# Dimensions – Candidate Evaluation UI

Dimensions is a React + TypeScript single-page application for managing interview evaluations. It integrates with a GraphQL back office, surfaces interview lists/details, and helps create structured conclusions per evaluation dimension.

## Tech stack
- Vite + React 19 + TypeScript
- React Router for navigation
- @tanstack/react-query for data fetching and caching
- shadcn/ui + Radix primitives for UI
- sonner for toast notifications

## Getting started
1. Install dependencies  
   ```bash
   npm install
   ```
2. Run the dev server  
   ```bash
   npm run dev
   ```
3. Open the app at the URL shown in the terminal (Vite defaults to http://localhost:5173).

## Available scripts
- `npm run dev` – Start the development server.
- `npm run build` – Type-check and build the production bundle to `dist/`.
- `npm run preview` – Serve the built app locally.
- `npm run lint` – Run ESLint.

## Deployment (GitHub Pages)
This project is configured to deploy to GitHub Pages under the repository path `/dimensions/`.

### How it works
- `vite.config.ts` sets `base: '/dimensions/'` to ensure assets resolve correctly on Pages.
- A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the site and publishes `dist/` to Pages.

### Manual trigger or on push to `main`
Deploys run automatically on pushes to `main` or via **Run workflow** in the GitHub Actions UI.

### Local preview of the production build
```bash
npm run build
npm run preview
```

## Favicon and title
The HTML entry (`index.html`) uses `Dimensions | Candidate Evaluations` as the title and a custom favicon at `public/favicon-dimensions.svg`.
