## TuneFlow — A Modern Music App

TuneFlow is a modern, responsive music web app built with Next.js. It features fast search, playlists, theming, a mobile-friendly player, and offline-friendly PWA capabilities. The app leverages a clean UI with Radix UI components and Tailwind CSS, global state via Redux Toolkit, and optional auth with NextAuth.

### Key Features
- Fast music search and browsing
- Playlists and queue management
- Modern audio player with seek/volume/loop/shuffle
- Dark/light theme with system preference support
- Installable PWA with offline caching for core assets
- Responsive design across desktop and mobile

### Tech Stack
- Framework: Next.js 15, React 18
- Styling: Tailwind CSS, tailwind-merge, tailwindcss-animate
- UI: Radix UI primitives, lucide-react icons, vaul
- State: Redux Toolkit, React Redux
- Data/HTTP: axios, idb (IndexedDB helpers), lodash
- Auth: NextAuth (optional)
- PWA: next-pwa

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm (or yarn/pnpm/bun)

### Installation
```bash
npm install
```

### Development
Start the dev server with Turbopack:
```bash
npm run dev
```
Then open `http://localhost:3000` in your browser.

### Production build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

---

## Configuration

### Environment variables
If authentication or external services are enabled, create a `.env.local` in the project root (values depend on your setup):
```
# NEXTAUTH_URL=...
# NEXTAUTH_SECRET=...
# DATABASE_URL=...
```

### External API configuration
If you use external music APIs, you may keep configuration or endpoints in `jiosaavn-api.json`. Update it to match your environment or proxy setup.

> Note: Utility helpers live in `lib/utils.js`.

---

## Project Scripts
Available scripts from `package.json`:
- `dev`: Next.js dev server with Turbopack
- `build`: Production build
- `start`: Start production server
- `lint`: Run ESLint

---

## Project Structure (high-level)
- `app/` — App Router pages and layouts
- `components/` — Reusable UI components
- `lib/` — Utilities (see `lib/utils.js`)
- `public/` — Static assets
- `styles/` — Global styles (if present)

Folder names may vary slightly depending on ongoing development.

---

## PWA
The app is configured with `next-pwa` to enable installability and offline caching for core assets. When running in production (`npm run build && npm start`), open the app and use your browser’s install prompt to add it.

---

### Watch your favourite song even offline

---

## Contributing
1. Create a new branch from `main`
2. Make your changes with clear commit messages
3. Ensure `npm run lint` passes
4. Open a Pull Request with a concise description

---

## License
This project is provided as-is for educational and personal use. See repository for details.
