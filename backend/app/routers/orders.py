from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, get_current_admin

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=schemas.OrderOut, status_code=201)
def checkout(
    payload: schemas.CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.is_admin:
        raise HTTPException(status_code=403, detail="Administrators cannot place orders. Please log in as a customer.")

    cart_items = (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product))
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    for item in cart_items:
        if item.quantity > item.product.stock:
            raise HTTPException(status_code=400, detail="No products left")

    total = sum(item.product.price_cents * item.quantity for item in cart_items)
    order = models.Order(
        user_id=current_user.id,
        total_cents=total,
        shipping_address=payload.shipping_address,
    )
    db.add(order)
    db.flush()  # get order.id before commit

    for item in cart_items:
        db.add(models.OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=item.product.name,
            unit_price_cents=item.product.price_cents,
            quantity=item.quantity,
        ))
        item.product.stock -= item.quantity
        db.delete(item)

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=List[schemas.OrderOut])
def list_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )


@router.get("/admin/all", response_model=List[schemas.OrderOut])
def list_all_orders(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items).joinedload(models.OrderItem.product).joinedload(models.Product.category),
            joinedload(models.Order.owner),
        )
        .order_by(models.Order.created_at.desc())
        .all()
    )


@router.patch("/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items).joinedload(models.OrderItem.product).joinedload(models.Product.category),
            joinedload(models.Order.owner),
        )
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Business rule: Delivered and Cancelled orders are terminal and cannot be modified
    if order.status == "delivered":
        raise HTTPException(
            status_code=400,
            detail="This order has already been delivered and its status cannot be modified."
        )
    if order.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="This order has been cancelled and its status cannot be modified."
        )

    # Business rule: If order is shipped, it cannot be turned back into placed
    if order.status == "shipped" and payload.status == "placed":
        raise HTTPException(
            status_code=400,
            detail="A shipped order cannot be turned back to 'Placed'."
        )

    if payload.status not in ["placed", "shipped", "delivered", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid order status.")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(models.Order.id == order_id, models.Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
