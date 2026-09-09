import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, formatPrice } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getProductMeta } from "../utils/productImages";
import ProductCard from "../components/ProductCard";
import {
  StarIcon,
  PlusIcon,
  MinusIcon,
  BagIcon,
  CheckIcon,
  ChevronRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "../components/Icons";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("specs");
  const [adding, setAdding] = useState(false);

  const { user } = useAuth();
  const { cart, addToCart, openCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    setProduct(null);
    api
      .getProduct(slug)
      .then((data) => {
        setProduct(data);
        // Load related items in same category
        if (data.category?.slug) {
          api
            .listProducts({ category: data.category.slug })
            .then((list) => setRelated(list.filter((item) => item.id !== data.id).slice(0, 4)));
        }
      })
      .catch(() => setProduct(false));
  }, [slug]);

  if (product === false) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2>Product not found</h2>
        <p style={{ margin: "12px 0 24px" }}>
          The stationery piece you are looking for may have been archived or retired.
        </p>
        <Link to="/products" className="btn btn-primary">
          Return to Catalog
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center", color: "var(--ink-muted)" }}>
        Loading stationery piece...
      </div>
    );
  }

  const meta = getProductMeta(product);
  const inCart = cart?.items?.find((i) => i.product.id === product.id)?.quantity || 0;
  const remaining = Math.max(0, product.stock - inCart);
  const isOutOfStock = product.stock === 0;

  const bumpQty = (delta) => {
    const next = qty + delta;
    if (delta > 0 && next > remaining) {
      toast.error(`Only ${remaining} units remaining for reservation.`);
      return;
    }
    setQty(Math.max(1, next));
  };

  const handleAdd = async () => {
    if (!user) {
      toast.info("Please sign in to add items to your bag.");
      navigate("/login");
      return;
    }
    if (remaining <= 0 || qty > remaining) {
      toast.error("No additional units available in stock.");
      return;
    }

    setAdding(true);
    try {
      await addToCart(product.id, qty);
      toast.success(`Added ${qty} × “${product.name}” to your bag.`);
      setQty(1);
      openCart();
    } catch (err) {
      toast.error(err.message || "Failed to update bag.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: "80px" }}>
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRightIcon size={12} />
        <Link to="/products">Shop</Link>
        {product.category && (
          <>
            <ChevronRightIcon size={12} />
            <Link to={`/products`}>{product.category.name}</Link>
          </>
        )}
        <ChevronRightIcon size={12} />
        <span style={{ color: "var(--ink)" }}>{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="product-detail-layout">
        {/* Left Column: Image Gallery */}
        <div className="product-detail-gallery">
          <div className="detail-main-img-box">
            <img
              src={meta.imageUrl}
              alt={product.name}
              className="detail-main-img"
            />
            {meta.badge && (
              <div style={{ position: "absolute", top: "18px", left: "18px" }}>
                <span className="badge badge-brass" style={{ fontSize: "12px", padding: "4px 12px" }}>
                  {meta.badge}
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 8px",
              fontSize: "13px",
              color: "var(--ink-muted)",
            }}
          >
            <span>Hand-finished in small workshops</span>
            <span>Ref: {product.slug}</span>
          </div>
        </div>

        {/* Right Column: Info & Purchasing */}
        <div className="product-detail-info">
          <div className="detail-category-tag">
            {product.category?.name || "Artisanal Stationery"}
          </div>

          <h1>{product.name}</h1>

          <div className="detail-reviews-strip">
            <div style={{ display: "flex", gap: "2px", color: "var(--brass)" }}>
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} filled size={15} />
              ))}
            </div>
            <strong style={{ color: "var(--ink)" }}>{meta.rating}</strong>
            <span style={{ color: "var(--ink-muted)" }}>
              · {meta.reviewsCount} collector reviews
            </span>
          </div>

          <div className="detail-price">{formatPrice(product.price_cents)}</div>

          <p className="detail-desc">{product.description}</p>

          {/* Stock Availability */}
          <div className="detail-stock-status">
            {isOutOfStock ? (
              <span className="stock-indicator out">
                ● Currently Sold Out · Restocking next cycle
              </span>
            ) : product.stock <= 5 ? (
              <span className="stock-indicator low">
                ● Limited Stock: Only {product.stock} pieces available ({inCart > 0 ? `${inCart} in your bag` : ""})
              </span>
            ) : (
              <span className="stock-indicator in">
                ● In Stock &amp; Ready for Courier Dispatch {inCart > 0 && `(${inCart} in bag)`}
              </span>
            )}
          </div>

          {/* Quantity and Add to Cart Row */}
          {!isOutOfStock && (
            <div className="detail-actions-row">
              <div className="qty-control" style={{ height: "46px" }}>
                <button
                  type="button"
                  onClick={() => bumpQty(-1)}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  style={{ width: "42px", height: "46px" }}
                >
                  <MinusIcon size={14} />
                </button>
                <span style={{ minWidth: "40px", fontSize: "15px" }}>{qty}</span>
                <button
                  type="button"
                  onClick={() => bumpQty(1)}
                  disabled={qty >= remaining}
                  aria-label="Increase quantity"
                  style={{ width: "42px", height: "46px" }}
                >
                  <PlusIcon size={14} />
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={handleAdd}
                disabled={adding || remaining <= 0}
              >
                {remaining <= 0 ? (
                  "All Reserved in Bag"
                ) : adding ? (
                  "Adding..."
                ) : (
                  <>
                    <BagIcon size={18} /> Add to Bag — {formatPrice(product.price_cents * qty)}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Guarantee highlights */}
          <div
            style={{
              background: "var(--paper-warm)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-sm)",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "13.5px",
              color: "var(--ink-soft)",
              marginBottom: "32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <TruckIcon size={17} style={{ color: "var(--forest)" }} />
              <span>Complimentary courier tracking on orders over $50</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldCheckIcon size={17} style={{ color: "var(--forest)" }} />
              <span>30-Day Tactile Commitment: effortless exchanges</span>
            </div>
          </div>

          {/* Tabbed Specifications & Craft Story */}
          <div className="tabs-header">
            <button
              type="button"
              className={`tab-btn ${activeTab === "specs" ? "active" : ""}`}
              onClick={() => setActiveTab("specs")}
            >
              Specifications
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "story" ? "active" : ""}`}
              onClick={() => setActiveTab("story")}
            >
              Craftsmanship
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "shipping" ? "active" : ""}`}
              onClick={() => setActiveTab("shipping")}
            >
              Care &amp; Delivery
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "specs" && (
              <table className="spec-table">
                <tbody>
                  <tr>
                    <td>Materials</td>
                    <td>{meta.material}</td>
                  </tr>
                  <tr>
                    <td>Category</td>
                    <td>{product.category?.name || "Workshop Item"}</td>
                  </tr>
                  <tr>
                    <td>Binding / Finish</td>
                    <td>Lies 180° flat, Smyth-sewn / Hand-buffed</td>
                  </tr>
                  <tr>
                    <td>Paper Weight</td>
                    <td>120gsm Archival Swedish Rag (Bleed-free)</td>
                  </tr>
                  <tr>
                    <td>Origin</td>
                    <td>Artisan Partner Workshops (EU / UK / JP)</td>
                  </tr>
                </tbody>
              </table>
            )}

            {activeTab === "story" && (
              <div>
                <p style={{ marginBottom: "12px" }}>
                  Every Ledger &amp; Co. piece begins in small family-owned workshops.
                  We select mills that still process rag paper using traditional watermarks,
                  ensuring your pen glides effortlessly without ink bleed or feathering.
                </p>
                <p>
                  No synthetic plastics or petroleum glues are used in our bindings.
                  Our books are stitched with unbleached cotton threads and treated
                  with organic beeswax.
                </p>
              </div>
            )}

            {activeTab === "shipping" && (
              <div>
                <p style={{ marginBottom: "12px" }}>
                  <strong>Courier Dispatch:</strong> Orders are hand-wrapped in recycled
                  parchment and packed in rigid protective cartons. Shipped within 24 hours
                  of confirmation.
                </p>
                <p>
                  <strong>Paper Care:</strong> Store in a cool, dry room away from prolonged
                  direct sunlight. Compatible with fountain inks, graphite, and gouache.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section style={{ marginTop: "48px", paddingTop: "40px", borderTop: "1px solid var(--line)" }}>
          <div className="section-heading" style={{ marginTop: 0 }}>
            <div>
              <h2>Complementary Pieces</h2>
              <p className="section-sub">Tools frequently paired with this edition.</p>
            </div>
            <Link to="/products" className="btn-text">
              Browse all
            </Link>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
