import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { api, formatPrice } from "../api/client";
import {
  PackageIcon,
  TruckIcon,
  CheckIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "../components/Icons";

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const location = useLocation();
  const justPlacedId = location.state?.justPlaced;

  useEffect(() => {
    api.listOrders().then(setOrders).catch(console.error);
  }, []);

  if (orders === null) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center", color: "var(--ink-muted)" }}>
        Loading order records...
      </div>
    );
  }

  if (orders.length === 0) {
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
              width: "60px",
              height: "60px",
              background: "var(--paper-dim)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "var(--ink-muted)",
            }}
          >
            <PackageIcon size={28} />
          </div>
          <h2>No orders yet</h2>
          <p style={{ fontSize: "14.5px", margin: "8px 0 24px" }}>
            When you place an order for our artisanal stationery, its crafting and tracking status will appear here.
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore Collection <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "48px 28px 80px", maxWidth: "880px" }}>
      {/* Newly placed order banner */}
      {justPlacedId && (
        <div
          style={{
            background: "var(--forest-light)",
            border: "1px solid rgba(34, 59, 41, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "20px 24px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--forest)",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <SparklesIcon size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "17px", color: "var(--forest)", margin: 0 }}>
              Order #{justPlacedId} successfully placed!
            </h3>
            <p style={{ fontSize: "13.5px", margin: "2px 0 0", color: "var(--ink-soft)" }}>
              Our workshop team has begun hand-packing your items. A confirmation has been recorded.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "28px" }}>
        <div>
          <h2>Your Orders</h2>
          <p className="section-sub">Track dispatch status, packaging notes, and receipts.</p>
        </div>
        <Link to="/products" className="btn-text">
          Browse more stationery &rarr;
        </Link>
      </div>

      {orders.map((order) => {
        const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const isDelivered = order.status === "delivered";
        const isShipped = order.status === "shipped" || isDelivered;
        const isPacked = isShipped; // Placed orders are packing/ready

        return (
          <div className="order-card" key={order.id}>
            <div className="order-card-header">
              <div className="order-id-date">
                <span className="order-id-text">Order #{order.id}</span>
                <span className="order-date-text">Placed on {orderDate}</span>
              </div>
              <div>
                <span
                  className="badge badge-forest"
                  style={{ textTransform: "capitalize", fontSize: "12px", padding: "4px 12px" }}
                >
                  Status: {order.status}
                </span>
              </div>
            </div>

            {/* Tracking Progress Bar */}
            <div className="order-timeline">
              <div className="order-timeline-step completed">
                <div className="timeline-dot" />
                <div className="timeline-label">Placed</div>
              </div>
              <div className={`order-timeline-step ${isPacked ? "completed" : ""}`}>
                <div className="timeline-dot" />
                <div className="timeline-label">Hand-Packed</div>
              </div>
              <div className={`order-timeline-step ${isShipped ? "completed" : ""}`}>
                <div className="timeline-dot" />
                <div className="timeline-label">In Transit</div>
              </div>
              <div className={`order-timeline-step ${isDelivered ? "completed" : ""}`}>
                <div className="timeline-dot" />
                <div className="timeline-label">Delivered</div>
              </div>
            </div>

            {/* Destination summary */}
            <div
              style={{
                fontSize: "13px",
                color: "var(--ink-soft)",
                background: "var(--paper-warm)",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <TruckIcon size={16} style={{ color: "var(--forest)" }} />
              <span>
                <strong>Shipping to:</strong> {order.shipping_address}
              </span>
            </div>

            {/* Items List */}
            <div className="order-items-list">
              {order.items.map((item) => (
                <div className="order-item-row" key={item.id}>
                  <span>
                    <strong>{item.quantity} ×</strong> {item.product_name}
                  </span>
                  <span style={{ fontFamily: "var(--serif)", fontWeight: 500 }}>
                    {formatPrice(item.unit_price_cents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer / Total and Actions */}
            <div className="order-footer-strip">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => window.print()}
              >
                Print Receipt
              </button>

              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "14px", color: "var(--ink-soft)" }}>Total Amount Paid:</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: "20px", fontWeight: 600, color: "var(--ink)" }}>
                  {formatPrice(order.total_cents)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
