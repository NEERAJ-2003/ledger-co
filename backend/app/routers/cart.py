from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])


def _ensure_in_stock(product: models.Product, quantity: int) -> None:
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")
    if product.stock <= 0 or quantity > product.stock:
        raise HTTPException(status_code=400, detail="No products left")


def _cart_out(db: Session, user_id: int) -> schemas.CartOut:
    items = (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.user_id == user_id)
        .all()
    )
    total = sum(item.product.price_cents * item.quantity for item in items)
    return schemas.CartOut(items=items, total_cents=total)


@router.get("", response_model=schemas.CartOut)
def get_cart(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return _cart_out(db, current_user.id)


@router.post("", response_model=schemas.CartOut, status_code=201)
def add_to_cart(
    payload: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.is_admin:
        raise HTTPException(status_code=403, detail="Administrators cannot purchase items. Please log in as a customer.")

    product = db.query(models.Product).filter(models.Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.user_id == current_user.id,
            models.CartItem.product_id == payload.product_id,
        )
        .first()
    )
    next_qty = (existing.quantity if existing else 0) + payload.quantity
    _ensure_in_stock(product, next_qty)

    if existing:
        existing.quantity = next_qty
    else:
        db.add(models.CartItem(user_id=current_user.id, product_id=payload.product_id, quantity=payload.quantity))
    db.commit()
    return _cart_out(db, current_user.id)


@router.patch("/{item_id}", response_model=schemas.CartOut)
def update_cart_item(
    item_id: int,
    payload: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.id == item_id, models.CartItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if payload.quantity <= 0:
        db.delete(item)
    else:
        _ensure_in_stock(item.product, payload.quantity)
        item.quantity = payload.quantity
    db.commit()
    return _cart_out(db, current_user.id)


@router.delete("/{item_id}", response_model=schemas.CartOut)
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id, models.CartItem.user_id == current_user.id)
        .first()
    )
    if item:
        db.delete(item)
        db.commit()
    return _cart_out(db, current_user.id)
