import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../api/client";
import { getProductMeta } from "../utils/productImages";
import { XIcon, PlusIcon, MinusIcon, TrashIcon, ArrowRightIcon, BagIcon, SparklesIcon } from "./Icons";

const FREE_SHIPPING_THRESHOLD_CENTS = 5000; // $50.00

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const totalCents = cart?.total_cents || 0;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - totalCents);
  const progressPercent = Math.min(100, Math.round((totalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100));

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  const handleViewCart = () => {
    closeCart();
    navigate("/cart");
  };

  return (
    <div className="drawer-overlay" onClick={closeCart}>
      <aside
        ref={drawerRef}
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
        role="dialog"
      >
        <div className="drawer-header">
          <div className="drawer-title-group">
            <BagIcon size={20} />
            <h2>Your Bag</h2>
            <span className="pill">{itemCount}</span>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Free shipping meter */}
        <div className="shipping-meter">
          <div className="shipping-meter-text">
            {amountNeeded > 0 ? (
              <>
                Add <strong>{formatPrice(amountNeeded)}</strong> for complimentary courier delivery
              </>
            ) : (
              <span className="free-shipping-unlocked">
                <SparklesIcon size={14} /> You have unlocked complimentary delivery!
              </span>
            )}
          </div>
          <div className="progress-track">
            <div
              className="progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart items */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="drawer-empty">
              <div className="drawer-empty-icon">
                <BagIcon size={36} strokeWidth={1.2} />
              </div>
              <h3>Your bag is currently empty</h3>
              <p>Discover our archival notebooks, fine fountain pens, and desk tools.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  closeCart();
                  navigate("/products");
                }}
              >
                Browse Shop
              </button>
            </div>
          ) : (
            <div className="drawer-items">
              {items.map((item) => {
                const meta = getProductMeta(item.product);
                const isMax = item.quantity >= item.product.stock;

                return (
                  <div key={item.id} className="drawer-item">
                    <img
                      src={meta.imageUrl}
                      alt={item.product.name}
                      className="drawer-item-img"
                    />
                    <div className="drawer-item-info">
                      <div className="drawer-item-head">
                        <Link
                          to={`/products/${item.product.slug}`}
                          onClick={closeCart}
                          className="drawer-item-title"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          className="btn-text-danger"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>

                      <div className="drawer-item-meta">
                        <span>{item.product.category?.name || "Stationery"}</span>
                        <span>·</span>
                        <span>{formatPrice(item.product.price_cents)} each</span>
                      </div>

                      <div className="drawer-item-actions">
                        <div className="qty-control qty-control-compact">
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon size={12} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            disabled={isMax}
                            aria-label="Increase quantity"
                          >
                            <PlusIcon size={12} />
                          </button>
                        </div>
                        <span className="drawer-item-total">
                          {formatPrice(item.product.price_cents * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer footer */}
        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-subtotal">
              <span className="subtotal-label">Subtotal</span>
              <span className="subtotal-amount">{formatPrice(totalCents)}</span>
            </div>
            <p className="drawer-tax-note">
              Shipping & taxes calculated at checkout. Handcrafted with care.
            </p>
            <div className="drawer-buttons">
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
                onClick={handleCheckout}
              >
                Checkout Now <ArrowRightIcon size={16} />
              </button>
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={handleViewCart}
              >
                View Full Bag
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
