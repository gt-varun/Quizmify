# Quizmify — MERN Stack

AI-powered quiz platform converted from Supabase/Lovable to a full MERN stack.

## Stack

| Layer | Technology |
|-------|-----------|
| Database | **MongoDB** (Mongoose ODM) |
| Backend | **Express** + Node.js |
| Frontend | **React** + Vite |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI | Anthropic Claude API |
| Styling | Tailwind CSS |

---

## Project Structure

```
quizmify-mern/
├── server/                  # Express + Node backend
│   ├── models/
│   │   ├── User.js          # User schema
│   │   ├── Quiz.js          # Quiz schema
│   │   ├── Question.js      # Question schema
│   │   └── Participant.js   # Participant schema
│   ├── routes/
│   │   ├── auth.js          # Register / Login / Me
│   │   ├── quizzes.js       # Create, get, user's quizzes
│   │   ├── questions.js     # Get questions by quiz code
│   │   ├── participants.js  # Join, update, leaderboard, history
│   │   └── ai.js            # AI question generation (Anthropic)
│   ├── middleware/
│   │   └── auth.js          # JWT protect / optionalAuth
│   ├── index.js             # Entry point
│   ├── .env.example         # Environment variables template
│   └── package.json
│
└── client/                  # React + Vite frontend
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx   # Auth state (JWT)
    │   ├── lib/
    │   │   └── api.js            # Axios instance with auth header
    │   ├── pages/
    │   │   ├── Index.jsx         # Landing page
    │   │   ├── Auth.jsx          # Login / Register
    │   │   ├── Dashboard.jsx     # User dashboard
    │   │   ├── Create.jsx        # Create quiz
    │   │   ├── Join.jsx          # Join quiz by code
    │   │   ├── Quiz.jsx          # Lobby / participant list
    │   │   ├── Play.jsx          # Quiz gameplay
    │   │   ├── Results.jsx       # Individual results
    │   │   └── HostResults.jsx   # Host analytics
    │   ├── components/
    │   │   ├── quiz-creation/
    │   │   │   ├── AIQuestionGenerator.jsx
    │   │   │   └── ManualQuestionCreator.jsx
    │   │   └── quiz/
    │   │       └── PowerBoosters.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js        # Proxy /api → localhost:5000
    └── package.json
```

---

## Setup

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- An [Anthropic API key](https://console.anthropic.com/) for AI question generation

### 2. Server setup

```bash
cd server
cp .env.example .env
# Edit .env with your values:
#   MONGODB_URI — MongoDB connection string
#   JWT_SECRET  — any random secret string
#   ANTHROPIC_API_KEY — your Anthropic key
npm install
npm run dev      # starts on http://localhost:5000
```

### 3. Client setup

```bash
cd client
npm install
npm run dev      # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

---

## Key Features

- **Auth** — JWT-based register/login, optional auth for guests
- **AI Quiz Generation** — Uses `claude-haiku-4-5` to generate multiple-choice questions
- **Manual Questions** — Add your own questions with the manual creator
- **Power Boosters** — 6 booster types: 2x Points, Double Jeopardy, Time Freeze, Streak Freeze, Eraser, 50/50
- **Live Leaderboard** — Polls every 3 seconds during play
- **Comprehensive Results** — Time analysis, peer comparison, question-by-question review
- **Host Dashboard** — Leaderboard, question analysis, individual reports, class insights
- **Dashboard** — Quiz history, created quizzes, stats

---

## Environment Variables

### Server `.env`

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI generation |
| `CLIENT_URL` | Frontend URL for CORS (default: http://localhost:5173) |

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (protected)

### Quizzes
- `POST /api/quizzes` — Create quiz
- `GET /api/quizzes/:code` — Get quiz + participants
- `GET /api/quizzes/:code/stats` — Get quiz stats
- `GET /api/quizzes/user/created` — User's created quizzes (protected)

### Questions
- `GET /api/questions/:quizCode` — Get all questions for a quiz

### Participants
- `POST /api/participants/join` — Join a quiz
- `GET /api/participants/:id` — Get participant
- `PATCH /api/participants/:id` — Update score/answers/boosters
- `GET /api/participants/quiz/:quizCode/leaderboard` — Live leaderboard
- `GET /api/participants/user/history` — User's quiz history (protected)

### AI
- `POST /api/ai/generate-questions` — Generate questions via Claude

---

## Differences from Original (Supabase → MERN)

| Original | MERN Version |
|----------|-------------|
| Supabase Auth | JWT + bcrypt |
| Supabase Realtime | Polling (3s interval) |
| Supabase Edge Functions | Express routes |
| Lovable AI Gateway | Direct Anthropic API |
| PostgreSQL | MongoDB |
| TypeScript | JavaScript |
| shadcn/ui | Custom Tailwind components |
