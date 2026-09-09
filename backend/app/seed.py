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

    products = [
        models.Product(name="Fieldbook, Ruled", slug="fieldbook-ruled", description="Pocket-sized ruled notebook with a stitched brown cover.", price_cents=1400, stock=42, category=categories["notebooks"]),
        models.Product(name="Ledger Journal A5", slug="ledger-journal-a5", description="Dot-grid A5 journal bound in cloth, 192 pages.", price_cents=2800, stock=30, category=categories["notebooks"]),
        models.Product(name="Fountain Pen, Slate", slug="fountain-pen-slate", description="Fine-nib fountain pen in matte slate resin.", price_cents=4500, stock=18, category=categories["pens"]),
        models.Product(name="Bottled Ink, Walnut", slug="bottled-ink-walnut", description="50ml bottle of iron gall ink in walnut brown.", price_cents=1600, stock=60, category=categories["pens"]),
        models.Product(name="Cotton Letter Paper", slug="cotton-letter-paper", description="25-sheet pack of 100% cotton writing paper.", price_cents=1200, stock=75, category=categories["paper"]),
        models.Product(name="Kraft Envelopes (Set of 10)", slug="kraft-envelopes-10", description="Recycled kraft envelopes, European flap.", price_cents=900, stock=90, category=categories["paper"]),
        models.Product(name="Brass Letter Opener", slug="brass-letter-opener", description="Solid brass letter opener with a walnut handle.", price_cents=2200, stock=25, category=categories["desk"]),
        models.Product(name="Oak Pen Tray", slug="oak-pen-tray", description="Solid white oak tray for pens and small tools.", price_cents=3200, stock=15, category=categories["desk"]),
    ]
    db.add_all(products)
    db.commit()
    print(f"Seeded {len(categories)} categories and {len(products)} products.")
else:
    print("Categories already exist, skipping product seed.")

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
