import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import {
  ArrowRightIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  PackageIcon,
  CheckIcon,
} from "../components/Icons";
import { useToast } from "../context/ToastContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api
      .listProducts()
      .then((data) => setProducts(data.slice(0, 4)))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast.success("Thank you for joining the Ledger & Co. Journal dispatch.");
    setEmail("");
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-tag">
            <SparklesIcon size={14} /> Archival Grade Goods · Est. Workshop
          </div>
          <h1>Paper goods built for daily use, not display.</h1>
          <p>
            Notebooks, fountain pens, and solid desk tools sourced from small
            studios who still care about the stitch, grain, and balance. Every
            piece is designed to age gracefully alongside your work.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore The Shop <ArrowRightIcon size={16} />
            </Link>
            <a
              href="#values"
              className="btn btn-outline btn-lg"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("values")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              The Atelier Ethos
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-head">
            <span className="stamp">
              <SparklesIcon size={13} /> Workshop Atelier
            </span>
            <span style={{ fontSize: "12.5px", letterSpacing: "0.08em", opacity: 0.8 }}>
              NO. 082-C
            </span>
          </div>

          <div className="hero-stats-grid">
            <div className="hero-stat-item">
              <div className="stat-num">120<span style={{ fontSize: "20px" }}>gsm</span></div>
              <div className="stat-desc">Milled Swedish rag paper, bleed-proof with fountain nibs</div>
            </div>
            <div className="hero-stat-item">
              <div className="stat-num">180&deg;</div>
              <div className="stat-desc">Smyth-sewn binding designed to lay flat on any desk</div>
            </div>
            <div className="hero-stat-item">
              <div className="stat-num">8</div>
              <div className="stat-desc">Signature workshop lines, restocked monthly in small batches</div>
            </div>
            <div className="hero-stat-item">
              <div className="stat-num">100%</div>
              <div className="stat-desc">FSC-certified cotton &amp; non-toxic vegetable-based dyes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Proposition Strip */}
      <section id="values" className="values-strip">
        <div className="value-card">
          <div className="value-icon-box">
            <PackageIcon size={20} />
          </div>
          <div>
            <h3 className="value-title">Smyth-Sewn Binding</h3>
            <p className="value-desc">
              Every notebook opens completely flat with no cracking or torn spines.
            </p>
          </div>
        </div>

        <div className="value-card">
          <div className="value-icon-box">
            <ShieldCheckIcon size={20} />
          </div>
          <div>
            <h3 className="value-title">Archival &amp; Acid-Free</h3>
            <p className="value-desc">
              Preserve your notes, sketches, and ledgers for decades without yellowing.
            </p>
          </div>
        </div>

        <div className="value-card">
          <div className="value-icon-box">
            <TruckIcon size={20} />
          </div>
          <div>
            <h3 className="value-title">Courier Delivery</h3>
            <p className="value-desc">
              Complimentary expedited tracking on all stationery orders over $50.
            </p>
          </div>
        </div>

        <div className="value-card">
          <div className="value-icon-box">
            <SparklesIcon size={20} />
          </div>
          <div>
            <h3 className="value-title">Tactile Guarantee</h3>
            <p className="value-desc">
              If the paper weight and pen balance do not delight you, returns are effortless.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section style={{ padding: "16px 0 32px" }}>
        <div className="section-heading">
          <div>
            <h2>Atelier Editions</h2>
            <p className="section-sub">
              Carefully chosen companions for thoughtful handwriting and desk architecture.
            </p>
          </div>
          <Link to="/products" className="btn-text">
            View full catalog ({products.length > 0 ? "8 editions" : "loading"}) <ArrowRightIcon size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--ink-muted)" }}>
            Loading stationery pieces...
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Press & Connoisseur Acclaim */}
      <section className="press-strip">
        <div className="press-title">Critical Acclaim &amp; Connoisseur Notes</div>
        <div className="press-grid">
          <div className="press-card">
            <blockquote>“The tactile antidote to endless digital fatigue. An absolute pleasure to write in.”</blockquote>
            <div className="press-author">— The Financial Times</div>
          </div>
          <div className="press-card">
            <blockquote>“Stitching and paper weight that would make 19th-century master bookbinders proud.”</blockquote>
            <div className="press-author">— Monocle Magazine</div>
          </div>
          <div className="press-card">
            <blockquote>“An essential anchor for deliberate desk architecture and daily clarity.”</blockquote>
            <div className="press-author">— Minimalissimo Design</div>
          </div>
        </div>
      </section>

      {/* Newsletter / Journal Dispatch */}
      <section
        style={{
          background: "var(--paper-card)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          padding: "48px 36px",
          margin: "24px 0 72px",
          textAlign: "center",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <span className="badge badge-brass" style={{ marginBottom: "16px" }}>
          The Ledger Dispatch
        </span>
        <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>
          Notes on Craft, Paper, and Permanence
        </h2>
        <p style={{ maxWidth: "52ch", margin: "0 auto 24px", fontSize: "15px" }}>
          Receive quarterly essays on bookbinding techniques, newly restocked limited editions,
          and behind-the-scenes glimpses into our maker workshops.
        </p>

        {subscribed ? (
          <div className="success-text" style={{ justifyContent: "center", fontSize: "15px" }}>
            <CheckIcon size={18} /> You are subscribed to The Ledger Dispatch.
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            style={{
              display: "flex",
              gap: "10px",
              maxWidth: "460px",
              margin: "0 auto",
              flexWrap: "wrap",
            }}
          >
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                flex: "1 1 240px",
                padding: "11px 16px",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-sm)",
                background: "var(--paper-warm)",
                fontSize: "14px",
              }}
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
