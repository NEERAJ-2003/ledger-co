from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, products, categories, cart, orders

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ledger & Co. API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(cart.router)
app.include_router(orders.router)


@app.get("/")
def root():
    return {"service": "Ledger & Co. API", "docs": "/docs"}
