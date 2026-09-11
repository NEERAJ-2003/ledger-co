import { useEffect, useState, useMemo } from "react";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import { SearchIcon, XIcon, SlidersIcon, RefreshIcon } from "../components/Icons";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (search) params.q = search;

    api
      .listProducts(params)
      .then((data) => {
        setProducts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  // Client-side sorting & in-stock filter
  const displayedProducts = useMemo(() => {
    let result = [...products];

    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price_cents - b.price_cents);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price_cents - a.price_cents);
    } else if (sortBy === "name-az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, sortBy, inStockOnly]);

  const handleReset = () => {
    setActiveCategory(null);
    setSearch("");
    setSortBy("featured");
    setInStockOnly(false);
  };

  return (
    <div className="container" style={{ paddingBottom: "72px" }}>
      {/* Page Header */}
      <div className="section-heading" style={{ marginTop: "40px" }}>
        <div>
          <h2>The Atelier Catalog</h2>
          <p className="section-sub">
            Milled rag papers, hand-bound journals, and solid desk tools.
          </p>
        </div>

        {/* Search input with icon */}
        <div className="search-input-box">
          <span className="search-icon">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            placeholder="Search products or materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--ink-muted)",
              }}
              aria-label="Clear search"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Control bar: Category filters, In-stock toggle, Sorting */}
      <div className="catalog-bar">
        <div className="filter-chips">
          <button
            type="button"
            className={`filter-chip ${!activeCategory ? "active" : ""}`}
            onClick={() => setActiveCategory(null)}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`filter-chip ${activeCategory === c.slug ? "active" : ""}`}
              onClick={() => setActiveCategory(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13.5px",
              cursor: "pointer",
              userSelect: "none",
              color: "var(--ink-soft)",
            }}
          >
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "var(--forest)" }}
            />
            <span>In stock only</span>
          </label>

          <div className="sort-select-box">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-az">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product count & active filter summary */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "13px",
          color: "var(--ink-muted)",
          marginBottom: "20px",
        }}
      >
        <span>
          Showing <strong>{displayedProducts.length}</strong> {displayedProducts.length === 1 ? "edition" : "editions"}
          {activeCategory && ` in ${categories.find((c) => c.slug === activeCategory)?.name}`}
          {search && ` matching “${search}”`}
        </span>

        {(activeCategory || search || inStockOnly || sortBy !== "featured") && (
          <button
            type="button"
            className="btn-text"
            onClick={handleReset}
            style={{ fontSize: "12.5px" }}
          >
            <RefreshIcon size={12} /> Reset filters
          </button>
        )}
      </div>

      {/* Grid or Empty State */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-muted)" }}>
          Loading catalog...
        </div>
      ) : displayedProducts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "var(--paper-card)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📖</div>
          <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>No matching pieces found</h3>
          <p style={{ maxWidth: "42ch", margin: "0 auto 20px", fontSize: "14px" }}>
            We couldn't find any stationery matching your current filter criteria.
          </p>
          <button type="button" className="btn btn-outline" onClick={handleReset}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {displayedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
