# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build (tsc project references + vite build)
npm run lint      # ESLint over the whole repo
npm run preview   # Preview the production build locally
```

There is no test suite configured in this project (no test runner/dependency present).

TypeScript is checked via project references (`tsconfig.json` → `tsconfig.app.json` for `src/`, `tsconfig.node.json` for Vite config). There is no standalone `tsc --noEmit` script; type errors surface during `npm run build` or in-editor.

## Architecture

This is a client-only React + TypeScript + Vite single-page app (originally scaffolded via Bolt: `bolt-vite-react-ts` template, see `.bolt/`). **There is no backend** — all persistence is simulated through `localStorage`, and all async operations (`login`, `addBook`, `createRequest`, etc.) are faked with `setTimeout` delays to mimic network latency.

### Data layer (`src/hooks/`, `src/contexts/`)

- `AuthContext` (`src/contexts/AuthContext.tsx`) — reducer-based auth state. `login()` does **not** validate credentials; it looks up or auto-creates a user by email in `localStorage['users']`. Session is persisted as `localStorage['token']` + `localStorage['user']`.
- `useBooks` (`src/hooks/useBooks.ts`) — owns the book catalog in `localStorage['books']`, seeded with two hardcoded default books on first run. Provides `searchBooks`, `addBook`, `updateBook`, `deleteBook`, `toggleFavorite` (favorites in `localStorage['favorites']`), `getUserBooks`.
- `useRequests` (`src/hooks/useRequests.ts`) — manages swap/borrow requests in `localStorage['bookRequests']`. Depends on `useBooks` to resolve `getReceivedRequests` (requests against books the current user owns).

Because these hooks each hold their own local component state backed by the same `localStorage` keys, **state is not globally synchronized across components** — every call site that uses `useBooks()`/`useRequests()` re-reads from `localStorage` independently. Keep this in mind when adding features that need cross-component consistency (e.g., a book updated in one place won't reactively update another mounted instance of the hook).

### Domain model (`src/types/index.ts`)

Central types: `User`, `Book`, `BookRating`, `BookRequest`, `Chat`/`Message`, `Exchange`, `Review`, `SearchFilters`. Several types (e.g. `Chat`, `Exchange`, `Review`) are defined but not yet wired into any hook/page — they represent planned functionality beyond the current localStorage-backed implementation.

Key enums to respect when adding books/requests:
- `Book.condition`: `'new' | 'like-new' | 'good' | 'fair' | 'poor'`
- `Book.availability`: `'sell' | 'swap' | 'borrow' | 'donate'`
- `Book.status`: `'available' | 'pending' | 'exchanged' | 'removed'`
- `BookRequest.status`: `'pending' | 'accepted' | 'declined' | 'expired' | 'completed'`

### App structure

- `src/App.tsx` — routes, wrapped in `ThemeProvider` → `AuthProvider` → `Router`. `ProtectedRoute` is currently a no-op passthrough (does not actually check `isAuthenticated`/redirect) — routes like `/add-book`, `/requests`, `/profile` are not truly access-gated yet.
- `src/pages/` — one component per route (`HomePage`, `SearchPage`, `AddBookPage`, `BookDetailPage`, `RequestsPage`, `ProfilePage`).
- `src/components/auth/`, `src/components/books/`, `src/components/common/` — feature-grouped UI components (e.g. `BookCard`, `SearchFilters`, `BookRating`, `Header`, `LocationPicker`, `BookLocationMap`).

### Styling

Tailwind CSS with class-based dark mode driven by `ThemeContext` toggling the `dark` class on `document.documentElement` (theme preference persisted in `localStorage['theme']`, defaulting to OS preference). Follow the existing pattern of pairing every color utility with a `dark:` variant (see `Header.tsx`) rather than relying on a separate dark stylesheet. Icons come from `lucide-react` exclusively — do not introduce another icon library.
