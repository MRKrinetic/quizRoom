# QuizRoom

Real-time quiz rooms for hosts and players. This repository contains the **frontend** for creating and running live quizzes with timed questions, live leaderboards, and Google OAuth sign-in.

## Features

- **Google OAuth sign-in** for hosts and players
- **Create or join** a room with a 6-digit code
- **Host controls** for building and sending questions
- **Question types**: MCQ, MSQ, and NAT (numeric/answer text)
- **Timed questions** with countdown
- **Live leaderboard** updates
- **Real-time sync** via WebSockets (SockJS + STOMP)
- **Responsive UI** built with Tailwind + shadcn/ui

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** (build tooling)
- **Tailwind CSS** + **shadcn/ui** + **Radix UI**
- **Zustand** (client state)
- **React Query** (async state)
- **React Router** (routing)
- **SockJS / STOMP** (real-time events)

## Getting Started

### Prerequisites

- **Node.js 18+**
- A running QuizRoom backend (REST + WebSocket)

### Install

```bash
npm ci
```

### Configure Environment

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8080
# Optional: retained for deployment/backend tooling compatibility.
VITE_BACKEND_URL=http://localhost:8080
```

- `VITE_API_URL` is used for REST endpoints and WebSocket handshake.
- `VITE_BACKEND_URL` is optional and is not read by the UI; some environments keep it for backend tooling compatibility.

### Run the App

```bash
npm run dev
```

Open the app at `http://localhost:5173` (default Vite port).

## Scripts

- `npm run dev` – start the development server
- `npm run build` – build for production
- `npm run build:dev` – build with development mode
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint

## Project Structure

```
src/
  components/        # UI building blocks and quiz components
  lib/               # State, types, and utilities
  pages/             # Route-level pages (Index, Host, Player)
  network.tsx        # API base + CSRF helper
```

## Backend Requirements

The frontend expects a backend that provides:

- OAuth login at `/oauth2/authorization/google`
- REST endpoints under `/api` for room creation, join, answers, and room state
- WebSocket endpoint at `/ws` with room topics at `/topic/room/{roomId}`

If your backend uses a different base URL, update `VITE_API_URL` in `.env`.

## License

All rights reserved. No license has been specified.
