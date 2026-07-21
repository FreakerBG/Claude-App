# Momentum — Self-Improvement Tracker

A clean, installable **PWA** (progressive web app) to run your day and improve
yourself — one app for **tasks**, **expenses**, **habits**, **goals**, and a
**journal**. Installs on **iPhone** and **PC**, works **offline**, and stores
everything **privately on your device** (with a backup file you can move between
devices).

<!-- Live app: https://freakerbg.github.io/claude-app/ (after Pages is enabled — see below) -->

## Features

- **🏠 Home dashboard** — today's tasks, this month's spending, habit streaks,
  goal progress, and today's mood at a glance.
- **✅ Tasks** — a daily checklist you tick off, day-by-day navigation, filters,
  and one-tap carry-over of yesterday's unfinished tasks.
- **💸 Expenses** — log spending by category, monthly totals, a category donut
  chart, and per-category budgets with progress bars.
- **🔥 Habits** — build habits with current/best **streaks** and a last-7-days
  grid you can tap to fix missed days.
- **🎯 Goals** — progress bars toward numeric targets (save $2000, run 100 km…).
- **📓 Journal & mood** — a daily mood check-in + notes, with a history list.
- **⚙️ Settings** — name, currency, light/dark/system theme, editable expense
  categories & budgets, and **backup export/import**.

Your data never leaves your device — no account, no server, no tracking.

## Run it locally

```bash
npm install
npm run dev      # open the printed http://localhost:5173 URL
```

Build a production copy and preview it:

```bash
npm run build
npm run preview
```

## Install it as an app

The app is a PWA, so it installs from a web address with its own icon and
full-screen window — no App Store needed.

### On your PC (Chrome / Edge)

1. Open the app URL in Chrome or Edge.
2. Click the **Install** icon in the address bar (or menu → *Install Momentum*).
3. It opens in its own window and appears with the other desktop apps.

### On your iPhone (Safari)

> iOS only lets you "Add to Home Screen" from a real **https:// web address**,
> so the app has to be hosted first (see *Publish* below — it's free).

1. Open the app URL in **Safari**.
2. Tap the **Share** button → **Add to Home Screen**.
3. Tap **Add** — Momentum now has its own icon and launches full-screen.

## Publish (free hosting on GitHub Pages)

This repo includes a workflow (`.github/workflows/deploy.yml`) that builds and
publishes the app to GitHub Pages automatically.

**One-time setup:** in the repo on GitHub, go to **Settings → Pages** and set
**Source: GitHub Actions**. After that, every push to `main` (or this feature
branch) deploys the latest build to:

```
https://freakerbg.github.io/claude-app/
```

Open that URL on your iPhone and PC to install the app as described above.

## Moving your data between devices

Because data is stored locally per device, use **Settings → Backup & restore**:

1. On device A, tap **Export backup** — this downloads a `.json` file.
2. Send that file to device B (AirDrop, email, cloud, etc.).
3. On device B, tap **Import backup** and choose the file.

## Tech

- React + TypeScript + Vite
- `vite-plugin-pwa` (Workbox) for the manifest + offline service worker
- `react-router-dom` (HashRouter) for section routing
- `localStorage` for on-device persistence
- Dependency-free SVG charts and a dependency-free PNG icon generator
  (`npm run icons`)

## Renaming the app

"Momentum" is set in `vite.config.ts` (manifest), `index.html` (`<title>` and
Apple meta tags), and `src/components/Nav.tsx` (sidebar brand). Change it there;
regenerate icons with `npm run icons` if you swap the artwork.
