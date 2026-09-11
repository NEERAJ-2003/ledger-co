# Ledger & Co. — Full-Stack E-Commerce Starter

A complete e-commerce store: **FastAPI** backend (JWT auth, products, cart, orders)
+ **React/Vite** frontend, styled as a specialty stationery shop.

## Structure

```
ledger-co/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── database.py      # SQLite engine/session
│   │   ├── security.py      # JWT + password hashing
│   │   ├── dependencies.py  # auth dependencies
│   │   ├── seed.py          # sample data + admin user
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── products.py
│   │       ├── categories.py
│   │       ├── cart.py
│   │       └── orders.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/client.js         # fetch wrapper for the API
    │   ├── context/              # Auth + Cart global state
    │   ├── components/           # Navbar, ProductCard, Footer
    │   ├── pages/                # Home, Products, Cart, Checkout, Orders, Login, Register
    │   ├── App.jsx, main.jsx, index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Run the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

python -m app.seed            # creates sample products + admin@ledger.co / admin123
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## What's included

- **Auth**: register/login with JWT (OAuth2 password flow), `/auth/me`
- **Products**: list with search + category filter, detail page, admin create/update/delete
- **Categories**: list, admin create
- **Cart**: per-user cart stored server-side, add/update/remove
- **Orders**: checkout converts cart → order, decrements stock, order history
- **Admin**: `is_admin` flag on users gates product/category writes (no admin UI included —
  use `/docs` or a REST client to manage the catalog as the seeded admin)

## Notes / next steps

- `SECRET_KEY` in `backend/app/security.py` is a dev placeholder — set a real one via
  environment variable before deploying.
- Database is SQLite (`ledger.db`) for zero-config local dev — swap the URL in
  `database.py` for Postgres in production.
- No payment processor is wired in; checkout just records the order.
- CORS is locked to `http://localhost:5173` — update `main.py` if you deploy the frontend elsewhere.
