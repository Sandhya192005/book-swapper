# Book Swapper

A web app for listing, discovering, and exchanging books with other readers — sell, swap, borrow, or donate. Built with React, TypeScript, and Tailwind CSS.

## Features

- Browse and search books with filters
- List a book for sale, swap, borrow, or donation, with a condition rating (new to poor)
- Book detail pages with location info
- Send and track swap/borrow requests
- Favorites and star ratings
- Light/dark theme toggle

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- lucide-react (icons)

## Getting Started

```
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

Other scripts:

- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build

## How Data Is Stored

This is a client-only prototype — there is no backend. Books, requests, and user data are all persisted to `localStorage`, and network calls (login, adding a book, creating a request, etc.) are simulated with artificial delays. Authentication does not verify credentials; it's a UI demo, not real security.

## Project Structure

```
src/
  pages/        Home, Search, Add Book, Book Detail, Requests, Profile
  components/
    auth/        login / register forms
    books/       book card, rating, search filters
    common/      header, location picker/map, loading spinner
  contexts/      AuthContext, ThemeContext
  hooks/         useBooks, useRequests
  types/         shared domain types (Book, BookRequest, Exchange, ...)
```
