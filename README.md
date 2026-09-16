# CocoWallet 🐼💸

> Production-grade, AI-powered personal finance tracker — Track expenses, manage budgets, and ask natural language questions about your money.

Built with **Node.js • Express 5 • TypeScript • MySQL (Aiven) • Google Gemini 2.0 Flash • React 18 • Vite 6**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.2-black?logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-Aiven-4479A1?logo=mysql)](https://aiven.io/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?logo=google)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-54%20passing-brightgreen?logo=jest)](./server)
[![License](https://img.shields.io/badge/License-ISC-yellow)](./server/package.json)

---

## ✨ Features

### 🔐 Authentication & Security
- JWT **access (15m) + refresh (7d) rotation** — revoke on logout, HttpOnly-ready
- `bcryptjs` 12 rounds, Zod validation, Helmet, HPP, CORS, rate-limit (100/15m) + auth limiter (10/15m) + slow-down
- Request ID tracing (`cls-rtracer`), structured Pino logs, centralized `AppError` hierarchy

### 💰 Expenses
- **CRUD** with pagination (`page`/`limit`), search (description/category), filters (`category`, `startDate`, `endDate`), sort (`date`/`amount`)
- **Bulk CSV import** — up to **1000** expenses in one request via `PapaParse` + preview
- **Stats** — total spent, count, avg/transaction, top 10 categories
- Distinct **categories** endpoint for combobox

### 🔄 Recurring Expenses
- **Flexible frequencies** — Daily, Weekly, Monthly, Yearly
- **Manual or automated** — "Run Now" button + ready for cron
- **Upcoming preview** — See next 30 days at a glance

### 🎯 Savings Goals
- **Visual progress rings** — See completion percentage instantly
- **Auto-allocate surplus** — Set % of monthly surplus to flow into goals
- **Milestone alerts** — 25%, 50%, 75%, 100% notifications
- **Allocation history** — Track every contribution with source

### 🔔 Smart Alerts (In-App)
- **Budget warnings** — 80% (warning) → 100% (exceeded)
- **Anomaly detection** — Unusual spending spikes (Z-score > 2)
- **Recurring due** — Never miss a subscription payment
- **Goal milestones** — Celebrate progress automatically

### 📦 Data Portability
- **Full export** — JSON (complete) or CSV (spreadsheet-ready)
- **Selective filters** — Date range, categories, modules
- **Import & restore** — Drag-drop backup file to restore
- **Audit trail** — Export history with record counts

### 📊 Budgets
- Monthly budgets per category (`month: YYYY-MM`) with **upsert** (`UK user+category+month`)
- **`GET /budgets/spending/:month`** — real spending vs limit → `{spent, remaining, percentage, status: under|warning|over}`

### 🤖 AI (Google Gemini 2.0 Flash)
| Endpoint | Input | Output |
|---|---|---|
| `POST /ai/categorize` | `description`, `amount?` | `{category, confidence, reasoning}` — 12 categories, fallback `Other` |
| `POST /ai/suggest-budgets` | `months?=3` | Analyzes last N months avg → `[{category, suggestedLimit, reasoning, averageMonthlySpend}]` |
| `POST /ai/query` | `query` | Natural language answer over last 500 expenses (`You spent $X on...`) |

Prompts enforce strict JSON (`\{...\}`/`\[...\]` regex) with deterministic `temp 0.3`; mocked in tests.

### 🎨 Frontend (React)
- **Auth** — RHF + zodResolver, Zustand persist, axios interceptor auto-refresh on 401
- **Dashboard** — stats cards, Recharts Bar (top categories) + Pie (split), budget progress, recent 5
- **Expenses** — table, AI categorize inline, edit/delete, CSV import dialog
- **Budgets** — month picker, cards with % bars, AI suggest modal → apply all
- **AI Assistant** — 3-tab (categorize / suggest / chat) powered by same backend

---

## 🏗️ Architecture

```
client/ (Vite + React)  ──axios Bearer──►  server/src (Express)
                                               ├─ app.ts (helmet/cors/limiter/compression/morgan/requestId/docs/health/routes/404/errorHandler)
                                               ├─ config/{env (Zod), database (pool 10), logger (Pino), swagger}
                                               ├─ common/{errors, middleware/auth|validate|errorHandler|rateLimiter, types, utils/apiResponse|asyncHandler}
                                               └─ modules/{auth, expenses, budgets, ai}/*.{routes,controller,service,repository,schema,types}
                                                      │
MySQL (Aiven) ◄──────── mysql2/promise pool ──────────┘
Gemini API ◄──────── fetch ───────── ai.service.ts
```

**ERD**
```
users 1──∞ expenses (user_id CASCADE)  idx(user_id,date/category)
users 1──∞ budgets  (user_id CASCADE)  UNIQUE(user,category,month)
users 1──∞ refresh_tokens
```

API prefix: `/api/v1` — Swagger at `/api/docs`, health at `/health`.

---

## 🚀 Quick Start

### Prerequisites
- Node 20+ · MySQL 8 (Aiven or local) · Gemini API key

### 1. Clone
```bash
git clone https://github.com/VirajxD0/CocoWallet.git
cd CocoWallet
```

### 2. Backend
```bash
cd server
cp .env.example .env   # fill DB_* , JWT_*, GEMINI_API_KEY
npm install --legacy-peer-deps

# create DB then run migration
mysql -h $DB_HOST -u $DB_USER -p < supabase/migrations/001_initial.sql

npm run dev    # http://localhost:3001  docs → /api/docs
```

**`server/.env.example`**
```env
NODE_ENV=development
PORT=3001
API_VERSION=v1
FRONTEND_URL=http://localhost:5173
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=***
DB_NAME=defaultdb
DB_SSL=true
JWT_SECRET=at-least-32-chars-random-string!!
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another-32-char-random-string!!
JWT_REFRESH_EXPIRES_IN=7d
GEMINI_API_KEY=***
```

### 3. Frontend
```bash
cd ../client
cp .env.example .env
npm install
npm run dev    # http://localhost:5173  proxy /api → 3001
```

**`client/.env.example`**
```env
VITE_API_URL=http://localhost:3001
VITE_API_VERSION=v1
```

### 4. Verify
```bash
curl http://localhost:3001/health
# → {"status":"ok",...}
```

---

## 📖 API Reference

### Auth
| Method | Endpoint | Auth | Body | Resp |
|---|---|---|---|---|
| POST | `/api/v1/auth/signup` | - | `{email, password(8+ upper/lower/number), name}` | `201 {user,tokens}` |
| POST | `/api/v1/auth/login` | - | `{email,password}` | `200 {user,tokens}` |
| POST | `/api/v1/auth/refresh` | - | `{refreshToken}` | `200 {accessToken}` (rotates) |
| POST | `/api/v1/auth/logout` | Bearer | - | `200` revokes all |
| GET | `/api/v1/auth/me` | Bearer | - | `200 {user}` |

### Expenses (Bearer required)
| Method | Endpoint | Query/Body |
|---|---|---|
| GET | `/expenses` | `?page=1&limit=20&search=coffee&category=Food&startDate=2026-01-01&sortBy=date&sortOrder=desc` → `{data,meta}` |
| GET | `/expenses/:id` |  |
| POST | `/expenses` | `{amount>0, description, category?, date? YYYY-MM-DD, receipt_url?}` |
| PUT | `/expenses/:id` | partial |
| DELETE | `/expenses/:id` |  |
| POST | `/expenses/import` | `{expenses: [{amount,description} x1..1000]}` |
| GET | `/expenses/stats` | `?startDate&endDate` → `{totalSpent,totalTransactions,averagePerTransaction,topCategories}` |
| GET | `/expenses/categories` | `→ string[]` |

### Budgets
| Method | Endpoint |  |
|---|---|---|
| GET | `/budgets?month=2026-09` |  |
| GET | `/budgets/spending/:month` | `YYYY-MM` → `BudgetWithSpending[]` |
| POST | `/budgets` | `{category, monthly_limit, month}` upsert |
| PUT | `/budgets/:id` | `{monthly_limit}` |
| DELETE | `/budgets/:id` |  |

### Recurring Expenses (Bearer required)
| Method | Endpoint | Body/Query |
|---|---|---|
| GET | `/recurring` | `?page&limit&is_active` |
| POST | `/recurring` | `{amount, description, category?, frequency, start_date, end_date?}` |
| PUT | `/recurring/:id` | partial |
| DELETE | `/recurring/:id` | |
| POST | `/recurring/:id/run` | Creates expense for this occurrence |
| GET | `/recurring/upcoming` | `?days=30` — next 30 days preview |

### Goals (Bearer required)
| Method | Endpoint | Body |
|---|---|---|
| GET | `/goals` | `?page&limit&include_completed` |
| GET | `/goals/with-progress` | All goals with progress % |
| POST | `/goals` | `{name, target_amount, current_amount?, target_date?, category?, icon?, color?, auto_allocate_pct?}` |
| PUT | `/goals/:id` | partial |
| DELETE | `/goals/:id` | |
| POST | `/goals/:id/allocate` | `{amount, source?}` — manual/auto_surplus/recurring |
| GET | `/goals/surplus` | `?month=YYYY-MM` — monthly surplus calc |
| POST | `/goals/auto-allocate` | `?month=YYYY-MM` — auto allocate surplus |

### Alerts (Bearer required)
| Method | Endpoint |
|---|---|
| GET | `/alerts` | `?page&limit&is_read&type` |
| GET | `/alerts/unread-count` | |
| PUT | `/alerts/:id/read` | |
| PUT | `/alerts/read-all` | |
| POST | `/alerts/check` | Triggers budget/anomaly/recurring/goal checks |

### Export/Import (Bearer required)
| Method | Endpoint | Query/Body |
|---|---|---|
| GET | `/export` | `?format=json|csv&startDate&endDate&includeExpenses&includeBudgets&includeRecurring&includeGoals&includeAllocations` |
| GET | `/export/history` | |
| GET | `/export/download/:jobId` | Direct file download |
| POST | `/export/import` | multipart/form-data `file` + `format` + `skipExisting` |

### AI
| Method | Endpoint |  |
|---|---|---|
| POST | `/ai/categorize` | `{description, amount?}` |
| POST | `/ai/suggest-budgets` | `{months?=3}` |
| POST | `/ai/query` | `{query}` |

Full spec + try-it at **`/api/docs`** (swagger-jsdoc).

**Postman** — import `CocoWallet.postman_collection.json` + `CocoWallet.postman_environment.json`.

---

## 🧪 Testing

```bash
cd server
npm test                # 54 tests — unit + integration (supertest + mocked DB/fetch)
npm run test:unit
npm run test:integration
npm run test:coverage  # → coverage/lcov-report/index.html
npm run typecheck && npm run build && npm run lint
```

- `jest.config.js` — `ts-jest`, `tests/setup.ts` loads `.env.test` (dummy creds, not real secrets)
- Integration mocks `src/config/database` + `global.fetch` Gemini → no real DB/API needed
- Fixed Express 5 `req.query` getter-only via `Object.defineProperty` in `validate.ts`

```bash
cd client
npm run typecheck
npm run build  # tsc + vite → dist/ (840kB → 245kB gzip)
```

---

## 🐳 Deployment

**Docker** (`server/Dockerfile`)
```bash
docker build -t cocowallet-api ./server
docker run -p 3001:3001 --env-file server/.env cocowallet-api
```
Frontend: `client/dist` → Vercel/Netlify/Nginx. Set `VITE_API_URL` at build.

Env validation crashes on missing keys — never runs with undefined secrets.

---

## 📁 Project Structure

```
.
├── client/
│   ├── src/
│   │   ├── lib/{api,utils,types}
│   │   ├── stores/authStore (Zustand)
│   │   ├── components/{ui,layout/AppShell}
│   │   └── pages/{Login,Signup,Dashboard,Expenses,Budgets,Recurring,Goals,Alerts,AIAssistant,Settings}
│   ├── vite.config.ts + tailwind + postcss
│   └── dist/ (build)
└── server/
    ├── src/{app,server,config,database|env|logger|swagger,common,modules/{auth,expenses,budgets,recurring,goals,alerts,export,ai}}
    ├── supabase/migrations/001_initial.sql
    ├── tests/{unit,integration,setup.ts}
    ├── jest.config.js + .eslintrc.json
    └── dist/ (tsc)
```

---

## 🔒 Security Notes

- `server/.env` is `.gitignore`'d — never commit. `server/.env.test` contains **dummy** placeholders for CI (push protection will block real `AVNS_...` / `AQ. ...` keys).
- If you accidentally committed real keys (as in `81f1ac` before `1c02fc0`), **rotate** Aiven password + Gemini key immediately and purge via `git reflog expire && git gc`.

---

## 🤝 Contributing

PRs welcome — run `npm run lint && npm test` before push.

## 📄 License

ISC — see `server/package.json`

---

<p align="center">Built with ❤️ — CocoWallet meets personal finance.</p>
