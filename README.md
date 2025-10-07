# PollingApp

A real-time polling application that allows users (such as teachers and students) to interact, participate in live polls, and view results instantly. The system is built with a modern technology stack and provides both a web-based front-end and a scalable backend with real-time capabilities.

## Tech Stack

### Frontend

- **React** (with [TypeScript](https://www.typescriptlang.org/))
- **Vite** (for fast development and build tooling)
- **Tailwind CSS** (utility-first CSS framework)
- **React Router** (for page navigation)
- **Redux Toolkit** (for global state management)
- **Socket.IO Client** (for real-time communication)
- **Lucide-react** (icon library)

#### Main Features

- Live poll creation and participation
- Real-time chat between participants
- Dynamic timer for questions
- Role-based UI (Teacher/Student)
- Responsive design with Tailwind CSS
- ESLint with recommended rules for React, TypeScript, and Vite

### Backend

- **Node.js** (TypeScript)
- **Express** (HTTP server)
- **Socket.IO** (WebSocket server for live updates)
- **Redis** (for pub/sub and caching, enables scalable real-time event handling)

#### Main Features

- REST API for health check
- Socket.IO endpoints for real-time poll communication
- Redis connection for session, state, or caching

## Database

- **Redis**: Used for caching and fast, scalable pub/sub event handling. The backend connects to Redis (default: `redis://localhost:6379`), which is essential for scaling socket events and quick state access.

## Global State Management

- **Redux Toolkit**: The frontend uses Redux Toolkit for managing global state, such as timers, poll data, and results. Custom hooks like `useAppSelector` are implemented for accessing and manipulating Redux state.

## Project Structure

```
pollingApp/
├── backend/
│   ├── src/
│   │   ├── server.ts         # Express + Socket.IO server
│   │   ├── config/env.ts     # Environment variables and Redis config
│   │   └── utils/redis.ts    # Redis client setup
│   └── ...
├── client/
│   ├── src/
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # Entry point
│   │   ├── pages/            # Page components
│   │   ├── components/       # Shared & feature components
│   │   ├── context/          # Socket context
│   │   ├── hooks/            # Custom hooks (Redux etc.)
│   │   └── lib/              # Utility functions/types
│   ├── index.html            # HTML entry point
│   ├── vite.config.ts        # Vite + Tailwind config
│   ├── README.md             # Frontend notes
│   ├── eslint.config.js      # Linting (React, TS, Vite)
│   └── ...
└── ...
```

## How It Works

- **Teacher** creates a poll question with multiple options.
- **Students** join the room and participate in the poll.
- **Results** are calculated and shown in real-time using Socket.IO events.
- **Chat** feature allows communication between participants.
- **Timer** for each question is managed via global Redux state.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- Redis server running locally or on your cloud provider

### Installation

#### Backend

```bash
cd backend
npm install
# Configure .env as needed (SOCKET_PORT, REDIS_URL)
npm run start
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

### Environment Variables

Backend expects:

- `SOCKET_PORT` (default: 3000)
- `REDIS_URL` (default: redis://localhost:6379)



---

### Notes

- The project uses **Socket.IO** for all real-time events (poll voting, chat, presence).
- **Redis** is required for backend event propagation and state management.
- **Redux Toolkit** is used for global state in the frontend (`useAppSelector`, reducers, and slices).
- ESLint is set up for best practices in React, TypeScript, and Vite.
