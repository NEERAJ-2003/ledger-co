import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../api/client";
import { useToast } from "../context/ToastContext";
import { getProductMeta } from "../utils/productImages";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowRightIcon,
  BagIcon,
  ShieldCheckIcon,
  TruckIcon,
  SparklesIcon,
  AlertCircleIcon,
} from "../components/Icons";

const FREE_SHIPPING_THRESHOLD_CENTS = 5000; // $50.00
const STANDARD_SHIPPING_CENTS = 600; // $6.00

export default function Cart() {
  const { user } = useAuth();
  const { cart, updateItem, removeItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [busyId, setBusyId] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const items = cart?.items || [];
  const subtotalCents = cart?.total_cents || 0;
  const isFreeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const shippingCents = items.length === 0 || isFreeShipping ? 0 : STANDARD_SHIPPING_CENTS;
  const discountCents = Math.round((subtotalCents * discountPercent) / 100);
  const grandTotalCents = Math.max(0, subtotalCents - discountCents + shippingCents);

  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
  const progressPercent = Math.min(100, Math.round((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100));

  if (user?.is_admin) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <div
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            padding: "48px 32px",
            background: "var(--paper-card)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "var(--brass-light)",
              color: "var(--brass)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertCircleIcon size={28} />
          </div>
          <h2>Admin Account</h2>
          <p style={{ margin: "12px 0 24px", color: "var(--ink-soft)", fontSize: "14.5px" }}>
            Administrators manage inventory and customer orders. Only registered customer accounts can make purchases.
          </p>
          <Link to="/admin" className="btn btn-primary">
            Go to Admin Suite
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <div
          style={{
            maxWidth: "460px",
            margin: "0 auto",
            padding: "48px 32px",
            background: "var(--paper-card)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "var(--paper-dim)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "var(--ink-muted)",
            }}
          >
            <BagIcon size={30} strokeWidth={1.3} />
          </div>
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Your bag is empty</h2>
          <p style={{ fontSize: "14.5px", color: "var(--ink-soft)", marginBottom: "24px" }}>
            Explore our curated selection of bound notebooks, fine fountain pens, and workshop desk tools.
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore Collection <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const changeQty = async (item, nextQty) => {
    if (nextQty > item.product.stock) {
      toast.error(`Only ${item.product.stock} units available in stock.`);
      return;
    }
    if (nextQty <= 0) {
      handleRemove(item.id, item.product.name);
      return;
    }

    setBusyId(item.id);
    try {
      await updateItem(item.id, nextQty);
      toast.success("Bag updated.");
    } catch (err) {
      toast.error(err.message || "Failed to update item quantity.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (itemId, name) => {
    setBusyId(itemId);
    try {
      await removeItem(itemId);
      toast.info(`Removed “${name}” from your bag.`);
    } catch (err) {
      toast.error(err.message || "Failed to remove item.");
    } finally {
      setBusyId(null);
    }
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "ATELIER10") {
      setDiscountPercent(10);
      toast.success("10% Atelier connoisseur discount applied!");
    } else {
      toast.error("Invalid voucher code. Try “ATELIER10”");
    }
  };

  return (
    <div className="container cart-layout">
      {/* Left Column: Items List */}
      <div>
        <div className="cart-items-card">
          <div className="cart-items-head">
            <h2>Your Shopping Bag</h2>
            <span style={{ fontSize: "14px", color: "var(--ink-muted)" }}>
              {items.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          {/* Free shipping progress banner */}
          <div
            style={{
              background: "var(--paper-warm)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-sm)",
              padding: "14px 18px",
              margin: "16px 0 24px",
            }}
          >
            <div style={{ fontSize: "13.5px", marginBottom: "8px" }}>
              {amountNeeded > 0 ? (
                <>
                  Add <strong>{formatPrice(amountNeeded)}</strong> more for complimentary courier shipping!
                </>
              ) : (
                <span className="free-shipping-unlocked">
                  <SparklesIcon size={16} /> Complimentary Courier Shipping unlocked!
                </span>
              )}
            </div>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Cart Table Rows */}
          <div>
            {items.map((item) => {
              const meta = getProductMeta(item.product);
              const isMax = item.quantity >= item.product.stock;

              return (
                <div className="cart-table-row" key={item.id}>
                  <img
                    src={meta.imageUrl}
                    alt={item.product.name}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--line)",
                    }}
                  />

                  <div>
                    <Link
                      to={`/products/${item.product.slug}`}
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: "16.5px",
                        fontWeight: 500,
                        color: "var(--ink)",
                      }}
                    >
                      {item.product.name}
                    </Link>
                    <div style={{ fontSize: "12.5px", color: "var(--ink-muted)", margin: "4px 0" }}>
                      {item.product.category?.name || "Stationery"} · {formatPrice(item.product.price_cents)} each
                    </div>
                    {item.product.stock <= 5 && (
                      <span className="stock-indicator low" style={{ fontSize: "11.5px" }}>
                        Only {item.product.stock} available
                      </span>
                    )}
                  </div>

                  <div className="qty-control">
                    <button
                      type="button"
                      onClick={() => changeQty(item, item.quantity - 1)}
                      disabled={busyId === item.id}
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon size={13} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(item, item.quantity + 1)}
                      disabled={busyId === item.id || isMax}
                      aria-label="Increase quantity"
                    >
                      <PlusIcon size={13} />
                    </button>
                  </div>

                  <div style={{ fontFamily: "var(--serif)", fontSize: "16px", fontWeight: 600 }}>
                    {formatPrice(item.product.price_cents * item.quantity)}
                  </div>

                  <button
                    type="button"
                    className="btn-text-danger"
                    onClick={() => handleRemove(item.id, item.product.name)}
                    disabled={busyId === item.id}
                    title="Remove item"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promo code & Back to shop */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <Link to="/products" className="btn btn-outline">
            &larr; Continue Shopping
          </Link>

          <form onSubmit={handleApplyPromo} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Promo code (try ATELIER10)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-sm)",
                background: "var(--paper-card)",
                fontSize: "13.5px",
                width: "210px",
              }}
            />
            <button type="submit" className="btn btn-outline btn-sm">
              Apply
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="cart-order-summary-box">
        <h3 className="summary-heading">Order Summary</h3>

        <div className="summary-row">
          <span>Item Subtotal</span>
          <span>{formatPrice(subtotalCents)}</span>
        </div>

        {discountPercent > 0 && (
          <div className="summary-row" style={{ color: "var(--forest)" }}>
            <span>Special Atelier Discount ({discountPercent}%)</span>
            <span>-{formatPrice(discountCents)}</span>
          </div>
        )}

        <div className="summary-row">
          <span>Estimated Delivery</span>
          <span>{isFreeShipping ? "FREE" : formatPrice(shippingCents)}</span>
        </div>

        <div className="summary-row">
          <span>Sales Tax</span>
          <span>Included</span>
        </div>

        <div className="summary-total-row">
          <span>Estimated Total</span>
          <span>{formatPrice(grandTotalCents)}</span>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block btn-lg"
          onClick={() => navigate("/checkout")}
        >
          Proceed to Checkout <ArrowRightIcon size={16} />
        </button>

        <div
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid var(--line)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            fontSize: "12.5px",
            color: "var(--ink-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheckIcon size={15} style={{ color: "var(--forest)" }} />
            <span>256-bit TLS encrypted bank-level checkout</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TruckIcon size={15} style={{ color: "var(--forest)" }} />
            <span>Hand-packaged in protective rigid cartons</span>
          </div>
        </div>
      </div>
    </div>
  );
}
