# Ledgerly Frontend

A React + TypeScript + Vite frontend built specifically around the current Ledgerly backend.

## What is included

- JWT login/register
- Overview dashboard
- Accounts CRUD
- Categories CRUD
- Budgets create/list/delete
- Double-entry journal transaction form
- Recent journal history
- Responsive dark UI

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Default API target:

`http://localhost:3000/api`

## Backend CORS

The current Ledgerly backend package already includes `cors`, but the packed backend shown in the Repomix does not currently call `app.use(cors(...))`.

For local development, enable CORS in `src/app.ts` before the routes:

```ts
import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
```

## Important Ledgerly domain note

The transaction form intentionally exposes the backend's actual journal contract: two balanced ledger entries, with an optional category attached to the debit entry. It does not invent an accounting model that is not present in the backend.

## API mapping

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET/POST/PATCH/DELETE /api/account`
- `GET/POST/PATCH/DELETE /api/category`
- `GET/POST/PATCH/DELETE /api/budget`
- `GET/POST /api/journal`
- `GET /api/journal/:id`
