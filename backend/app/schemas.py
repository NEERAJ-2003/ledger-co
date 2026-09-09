from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional, List


# ---------- Auth / User ----------

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: str
    is_admin: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Category ----------

class CategoryCreate(BaseModel):
    name: str
    slug: str


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str


# ---------- Product ----------

class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    price_cents: int
    image_url: Optional[str] = None
    stock: int = 0
    category_id: Optional[int] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_cents: Optional[int] = None
    image_url: Optional[str] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    description: str
    price_cents: int
    image_url: Optional[str]
    stock: int
    category: Optional[CategoryOut] = None


# ---------- Cart ----------

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    quantity: int
    product: ProductOut


class CartOut(BaseModel):
    items: List[CartItemOut]
    total_cents: int


# ---------- Orders ----------

class CheckoutRequest(BaseModel):
    shipping_address: str


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_name: str
    unit_price_cents: int
    quantity: int


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    total_cents: int
    shipping_address: str
    created_at: datetime
    items: List[OrderItemOut]
