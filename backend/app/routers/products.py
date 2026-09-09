from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_admin

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[schemas.ProductOut])
def list_products(
    q: Optional[str] = Query(None, description="Search by name"),
    category: Optional[str] = Query(None, description="Filter by category slug"),
    db: Session = Depends(get_db),
):
    query = db.query(models.Product).options(joinedload(models.Product.category))
    if q:
        query = query.filter(models.Product.name.ilike(f"%{q}%"))
    if category:
        query = query.join(models.Category).filter(models.Category.slug == category)
    return query.order_by(models.Product.created_at.desc()).all()


@router.get("/{slug}", response_model=schemas.ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = (
        db.query(models.Product)
        .options(joinedload(models.Product.category))
        .filter(models.Product.slug == slug)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=schemas.ProductOut, status_code=201)
def create_product(
    payload: schemas.ProductCreate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    if db.query(models.Product).filter(models.Product.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="Slug already in use")
    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    payload: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return None
