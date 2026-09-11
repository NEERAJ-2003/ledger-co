"""Run with: python -m app.seed
Creates categories, products, and an admin user for local development.
"""
from .database import SessionLocal, Base, engine
from . import models
from .security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if not db.query(models.Category).first():
    categories = {
        "notebooks": models.Category(name="Notebooks", slug="notebooks"),
        "pens": models.Category(name="Pens & Ink", slug="pens"),
        "paper": models.Category(name="Loose Paper", slug="paper"),
        "desk": models.Category(name="Desk Goods", slug="desk"),
    }
    db.add_all(categories.values())
    db.commit()
    print(f"Seeded {len(categories)} categories. Catalog ready for admin additions.")
else:
    print("Categories already exist.")

if not db.query(models.User).filter(models.User.email == "admin@ledger.co").first():
    admin = models.User(
        email="admin@ledger.co",
        full_name="Store Admin",
        hashed_password=hash_password("admin123"),
        is_admin=True,
    )
    db.add(admin)
    db.commit()
    print("Seeded admin user: admin@ledger.co / admin123")
else:
    print("Admin user already exists.")

db.close()
