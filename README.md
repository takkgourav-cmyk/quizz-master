# Quizly

Full-stack quiz platform built with the MERN stack.

| Layer    | Tools                                             |
| -------- | ------------------------------------------------- |
| Frontend | Next.js 14, Tailwind CSS, React Icons, Toastify   |
| Admin    | React (Vite), Tailwind CSS, React Icons, Toastify |
| Backend  | Node.js, Express.js (MVC pattern)                 |
| Database | MongoDB with Mongoose                             |
| Auth     | JSON Web Tokens, role-based authorisation         |

## Features

- Learner app: category and difficulty filters, search, pagination, randomised questions, timed MCQ attempts, instant scoring, result review (correct, incorrect, skipped, percentage), leaderboard, personal progress.
- Quiz library: 20 seeded quizzes across science, geography, technology, history, maths, environment, finance, language, arts, sports, food, logic and culture; each built-in quiz includes ten questions.
- Motion and visuals: warm ivory, charcoal and burnt orange editorial theme with a Three.js hero scene, restrained GSAP and ScrollTrigger reveals, reduced-motion support, and responsive navigation.
- Admin panel: secure login, analytics dashboard, quiz CRUD, question CRUD, category management, user management with roles, attempt reports filtered by quiz.
- API: REST endpoints, JWT middleware, role guard, input sanitising, indexes, lean queries, response compression, rate limiting, helmet.

## Backend structure

```
backend/src
  config/        database connection
  models/        Mongoose schemas
  controllers/   request handling and business logic
  routes/        REST route definitions
  middlewares/   auth, role guard, error handling
  utils/         helpers
```

## Setup

```
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev

cd admin
cp .env.example .env
npm install
npm run dev

cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Ports: API 5000, learner app 3000, admin panel 5173.
Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME` before running the full seed to configure the seeded admin account. To seed or safely extend the built-in quiz catalogue without changing admin credentials, run `node src/seed.js --quizzes-only` from `backend`; it also corrects the seeded admin display name from “Gorav” to “Gourav”. To add the curated follow-up questions to a running instance through the admin API, set the admin credentials and optionally `QUIZLY_API_URL`, then run `npm run populate-quiz-questions` from `backend`.

The backend defaults to local MongoDB at `mongodb://127.0.0.1:27017/quizly` and permits the local frontend and admin origins. Copy `backend/.env.example` to `backend/.env` and set private `JWT_SECRET` and `PASSWORD_RESET_SECRET` values. Password reset email uses Nodemailer with SMTP; for Gmail, enable 2-Step Verification and use a Gmail App Password for `SMTP_PASS`. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and optionally `SMTP_FROM`. Admins can verify SMTP configuration with `/api/admin/email/test` and `{ "to": "recipient@example.com" }`.

## Production

Set a strong `JWT_SECRET`, a hosted `MONGO_URI` and your real domains in `CORS_ORIGINS`.
Use `npm start` for the API, `npm run build && npm start` for the learner app and `npm run build` for the admin panel (serve `dist`).
Set `NEXT_PUBLIC_API_URL` and `VITE_API_URL` to the deployed API URL. Set `NEXT_PUBLIC_SITE_URL` to the learner app's public HTTPS origin so canonical metadata, Open Graph links, `robots.txt`, and `sitemap.xml` use the production domain.
Portfolio link in the footer: `frontend/lib/config.js`.
