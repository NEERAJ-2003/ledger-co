import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, formatPrice } from "../api/client";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getProductMeta } from "../utils/productImages";
import {
  ShieldCheckIcon,
  TruckIcon,
  CheckIcon,
  ArrowRightIcon,
  BagIcon,
} from "../components/Icons";

export default function Checkout() {
  const { cart, refresh } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    street: "108 Craftsmans Way",
    suite: "Studio 4B",
    city: "Bangalore",
    state: "Karnataka",
    postal_code: "560001",
    country: "India",
  });
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "•••• •••• •••• 4242",
    expiry: "12/28",
    cvc: "888",
  });
  const [orderNotes, setOrderNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const items = cart?.items || [];
  const subtotalCents = cart?.total_cents || 0;

  if (!cart || items.length === 0) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2>Your bag is empty</h2>
        <p style={{ margin: "12px 0 24px" }}>Add items to your bag before checking out.</p>
        <Link to="/products" className="btn btn-primary">
          Browse Shop
        </Link>
      </div>
    );
  }

  const shippingCostCents =
    shippingMethod === "express"
      ? 1200
      : subtotalCents >= 5000
      ? 0
      : 600;

  const totalCents = subtotalCents + shippingCostCents;

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.street.trim() || !form.city.trim()) {
      toast.error("Please provide your complete shipping street address and city.");
      return;
    }

    const fullShippingAddress = [
      form.street,
      form.suite,
      `${form.city}, ${form.state} ${form.postal_code}`,
      form.country,
      orderNotes ? `[Notes: ${orderNotes}]` : null,
    ]
      .filter(Boolean)
      .join(", ");

    setLoading(true);
    try {
      const order = await api.checkout(fullShippingAddress);
      await refresh();
      toast.success(`Order #${order.id} placed successfully! Thank you.`);
      navigate("/orders", { state: { justPlaced: order.id } });
    } catch (err) {
      toast.error(err.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container checkout-layout">
      {/* Left Column: Checkout Forms */}
      <div>
        <form onSubmit={handleSubmit}>
          {/* Shipping Address Box */}
          <div className="checkout-box" style={{ marginBottom: "28px" }}>
            <h2 className="checkout-section-title">
              <TruckIcon size={20} /> 1. Shipping Destination
            </h2>

            <div className="field">
              <label htmlFor="street">Street Address</label>
              <input
                id="street"
                type="text"
                value={form.street}
                onChange={updateField("street")}
                placeholder="123 Artisan Way"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="suite">Apartment, Studio, or Suite (Optional)</label>
              <input
                id="suite"
                type="text"
                value={form.suite}
                onChange={updateField("suite")}
                placeholder="Apt 4B, Studio 12"
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={updateField("city")}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="state">State / Province</label>
                <input
                  id="state"
                  type="text"
                  value={form.state}
                  onChange={updateField("state")}
                  required
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="postal_code">Postal / ZIP Code</label>
                <input
                  id="postal_code"
                  type="text"
                  value={form.postal_code}
                  onChange={updateField("postal_code")}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  type="text"
                  value={form.country}
                  onChange={updateField("country")}
                  required
                />
              </div>
            </div>
          </div>

          {/* Shipping Speed Selection */}
          <div className="checkout-box" style={{ marginBottom: "28px" }}>
            <h2 className="checkout-section-title">
              <TruckIcon size={20} /> 2. Delivery Method
            </h2>

            <div className="delivery-options-grid">
              <div
                className={`delivery-option-card ${shippingMethod === "standard" ? "selected" : ""}`}
                onClick={() => setShippingMethod("standard")}
              >
                <div className="delivery-option-head">
                  <span>Standard Workshop Courier</span>
                  <span>{subtotalCents >= 5000 ? "FREE" : "$6.00"}</span>
                </div>
                <div className="delivery-option-sub">
                  3–5 business days · Carbon-neutral ground
                </div>
              </div>

              <div
                className={`delivery-option-card ${shippingMethod === "express" ? "selected" : ""}`}
                onClick={() => setShippingMethod("express")}
              >
                <div className="delivery-option-head">
                  <span>Expedited Priority Air</span>
                  <span>$12.00</span>
                </div>
                <div className="delivery-option-sub">
                  1–2 business days · Priority atelier packaging
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-box" style={{ marginBottom: "28px" }}>
            <h2 className="checkout-section-title">
              <ShieldCheckIcon size={20} /> 3. Payment Method
            </h2>

            <div className="payment-method-selector">
              <button
                type="button"
                className={`payment-pill ${paymentMethod === "card" ? "active" : ""}`}
                onClick={() => setPaymentMethod("card")}
              >
                Credit / Debit Card
              </button>
              <button
                type="button"
                className={`payment-pill ${paymentMethod === "apple" ? "active" : ""}`}
                onClick={() => setPaymentMethod("apple")}
              >
                Apple Pay / Digital Wallet
              </button>
              <button
                type="button"
                className={`payment-pill ${paymentMethod === "cod" ? "active" : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                Cash on Courier
              </button>
            </div>

            {paymentMethod === "card" && (
              <div>
                <div className="field">
                  <label htmlFor="card_number">Card Number</label>
                  <input
                    id="card_number"
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails((p) => ({ ...p, number: e.target.value }))}
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="expiry">Expiration Date</label>
                    <input
                      id="expiry"
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails((p) => ({ ...p, expiry: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="cvc">Security Code (CVC)</label>
                    <input
                      id="cvc"
                      type="password"
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails((p) => ({ ...p, cvc: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "apple" && (
              <div
                style={{
                  padding: "16px",
                  background: "var(--paper-warm)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "14px",
                  textAlign: "center",
                  color: "var(--ink-soft)",
                }}
              >
                Biometric Apple Pay authentication will trigger when you place the order.
              </div>
            )}

            {paymentMethod === "cod" && (
              <div
                style={{
                  padding: "16px",
                  background: "var(--paper-warm)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "14px",
                  textAlign: "center",
                  color: "var(--ink-soft)",
                }}
              >
                Payment will be collected in cash upon courier delivery at your doorstep.
              </div>
            )}

            <div className="field" style={{ marginTop: "20px" }}>
              <label htmlFor="notes">Order Notes or Packaging Instructions (Optional)</label>
              <textarea
                id="notes"
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="E.g., Leave with concierge, include gift slip without price..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? "Confirming Order..." : `Place Order · ${formatPrice(totalCents)}`}
          </button>
        </form>
      </div>

      {/* Right Column: Order Recap */}
      <div className="cart-order-summary-box">
        <h3 className="summary-heading">Review Your Order ({items.length})</h3>

        {/* Thumbnail Preview List */}
        <div
          style={{
            maxHeight: "260px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            paddingBottom: "16px",
            marginBottom: "16px",
            borderBottom: "1px solid var(--line-subtle)",
          }}
        >
          {items.map((item) => {
            const meta = getProductMeta(item.product);
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "13.5px",
                }}
              >
                <img
                  src={meta.imageUrl}
                  alt={item.product.name}
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "cover",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--line)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: "var(--ink)" }}>{item.product.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
                    Qty: {item.quantity} × {formatPrice(item.product.price_cents)}
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontFamily: "var(--serif)" }}>
                  {formatPrice(item.product.price_cents * item.quantity)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="summary-row">
          <span>Items Subtotal</span>
          <span>{formatPrice(subtotalCents)}</span>
        </div>

        <div className="summary-row">
          <span>Shipping</span>
          <span>{shippingCostCents === 0 ? "FREE" : formatPrice(shippingCostCents)}</span>
        </div>

        <div className="summary-row">
          <span>Taxes</span>
          <span>Included</span>
        </div>

        <div className="summary-total-row">
          <span>Final Total</span>
          <span>{formatPrice(totalCents)}</span>
        </div>

        <div
          style={{
            padding: "12px 14px",
            background: "var(--forest-light)",
            border: "1px solid rgba(34, 59, 41, 0.15)",
            borderRadius: "var(--radius-sm)",
            fontSize: "12.5px",
            color: "var(--forest)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ShieldCheckIcon size={16} />
          <span>Backed by our 30-day tactile satisfaction commitment.</span>
        </div>
      </div>
    </div>
  );
}
