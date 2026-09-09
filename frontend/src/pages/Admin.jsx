import { useEffect, useState, useCallback, useMemo } from "react";
import { api, formatPrice } from "../api/client";
import { useToast } from "../context/ToastContext";
import { getProductMeta } from "../utils/productImages";
import {
  SlidersIcon,
  PackageIcon,
  AlertCircleIcon,
  PlusIcon,
  TrashIcon,
  SearchIcon,
  CheckIcon,
  XIcon,
} from "../components/Icons";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price_cents: "",
  stock: "25",
  category_id: "",
  image_url: "",
};

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stockDrafts, setStockDrafts] = useState({});
  const [savingStockId, setSavingStockId] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const toast = useToast();

  const loadProducts = useCallback(() => {
    api.listProducts().then((data) => {
      setProducts(data);
      const drafts = {};
      data.forEach((p) => {
        drafts[p.id] = String(p.stock);
      });
      setStockDrafts(drafts);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    loadProducts();
    api.listCategories().then(setCategories).catch(console.error);
  }, [loadProducts]);

  // Executive Metrics
  const totalStockUnits = useMemo(
    () => products.reduce((sum, p) => sum + p.stock, 0),
    [products]
  );
  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock <= 5).length,
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (!searchFilter.trim()) return products;
    const q = searchFilter.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
    );
  }, [products, searchFilter]);

  const updateField = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "name" && !slugTouched) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleSlugChange = (e) => {
    setSlugTouched(true);
    setForm((f) => ({ ...f, slug: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug || form.price_cents === "") {
      toast.error("Name, slug, and price are required.");
      return;
    }

    setSaving(true);
    try {
      await api.createProduct({
        name: form.name,
        slug: form.slug,
        description: form.description,
        price_cents: Math.round(Number(form.price_cents) * 100),
        stock: form.stock === "" ? 0 : Number(form.stock),
        category_id: form.category_id === "" ? null : Number(form.category_id),
        image_url: form.image_url.trim() || undefined,
      });
      toast.success(`Successfully added “${form.name}” to catalog!`);
      setForm(emptyForm);
      setSlugTouched(false);
      setShowAddModal(false);
      loadProducts();
    } catch (err) {
      toast.error(err.message || "Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    setDeletingId(product.id);
    try {
      await api.deleteProduct(product.id);
      toast.success(`Deleted “${product.name}”.`);
      setConfirmDelete(null);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      toast.error(err.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const saveStock = async (product) => {
    const nextStock = Number(stockDrafts[product.id]);
    if (Number.isNaN(nextStock) || nextStock < 0) {
      toast.error("Stock must be a positive integer.");
      return;
    }
    if (nextStock === product.stock) return;

    setSavingStockId(product.id);
    try {
      const updated = await api.updateProduct(product.id, { stock: nextStock });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: updated.stock } : p))
      );
      toast.success(`Updated stock for “${product.name}” to ${updated.stock} units.`);
    } catch (err) {
      toast.error(err.message || "Failed to update stock.");
      setStockDrafts((d) => ({ ...d, [product.id]: String(product.stock) }));
    } finally {
      setSavingStockId(null);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 28px 80px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2>Store Administration &amp; Inventory</h2>
          <p className="section-sub">
            Monitor atelier inventory levels, edit stock availability, and curate editions.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon size={16} /> Add New Edition
        </button>
      </div>

      {/* KPI Metrics Grid */}
      <div className="admin-metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Active Catalog Pieces</span>
          <span className="metric-number">{products.length}</span>
          <span className="metric-sub">Across all workshop categories</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Total Units On Hand</span>
          <span className="metric-number">{totalStockUnits}</span>
          <span className="metric-sub">Physical pieces in warehouse</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Low Stock Alerts</span>
          <span className="metric-number" style={{ color: lowStockCount > 0 ? "var(--amber)" : "var(--forest)" }}>
            {lowStockCount}
          </span>
          <span className="metric-sub">Editions with &le; 5 units remaining</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Active Categories</span>
          <span className="metric-number">{categories.length}</span>
          <span className="metric-sub">Curated stationery collections</span>
        </div>
      </div>

      {/* Catalog Table Card */}
      <div className="admin-catalog-card">
        <div className="admin-catalog-head">
          <h3 style={{ fontSize: "19px", margin: 0 }}>
            Inventory Management ({filteredProducts.length})
          </h3>

          <div className="search-input-box" style={{ width: "260px" }}>
            <span className="search-icon">
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Edition</th>
              <th>Category</th>
              <th>Price</th>
              <th style={{ textAlign: "center" }}>Stock Level</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const meta = getProductMeta(p);
              const isSaving = savingStockId === p.id;
              const isLow = p.stock <= 5;

              return (
                <tr key={p.id}>
                  <td>
                    <div className="admin-table-item-cell">
                      <img
                        src={meta.imageUrl}
                        alt={p.name}
                        className="admin-item-thumb"
                      />
                      <div>
                        <strong style={{ color: "var(--ink)", display: "block" }}>{p.name}</strong>
                        <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>/{p.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-gray">
                      {p.category?.name || "Uncategorized"}
                    </span>
                  </td>

                  <td style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "15px" }}>
                    {formatPrice(p.price_cents)}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <input
                        className={`stock-edit-input ${isLow ? "stock-low" : ""}`}
                        type="number"
                        min="0"
                        value={stockDrafts[p.id] ?? p.stock}
                        onChange={(e) => setStockDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                        onBlur={() => saveStock(p)}
                        onKeyDown={(e) => e.key === "Enter" && saveStock(p)}
                        disabled={isSaving}
                        title="Click to edit stock and press Enter or click outside"
                      />
                      {isLow && (
                        <span style={{ color: "var(--amber)", fontSize: "12px", fontWeight: 600 }}>
                          {p.stock === 0 ? "OUT" : "LOW"}
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirmDelete(p)}
                      disabled={deletingId === p.id}
                    >
                      <TrashIcon size={14} /> Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal Overlay */}
      {showAddModal && (
        <div className="drawer-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="checkout-box"
            style={{
              maxWidth: "580px",
              width: "100%",
              margin: "auto",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "22px", margin: 0 }}>Add New Stationery Piece</h2>
              <button type="button" className="btn-icon" onClick={() => setShowAddModal(false)}>
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="modal-name">Edition Name</label>
                <input
                  id="modal-name"
                  type="text"
                  value={form.name}
                  onChange={updateField("name")}
                  placeholder="E.g., Architect Grid Folio"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="modal-slug">URL Slug</label>
                <input
                  id="modal-slug"
                  type="text"
                  value={form.slug}
                  onChange={handleSlugChange}
                  placeholder="architect-grid-folio"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="modal-category">Category</label>
                <select
                  id="modal-category"
                  value={form.category_id}
                  onChange={updateField("category_id")}
                >
                  <option value="">No Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="modal-price">Price in USD ($)</label>
                  <input
                    id="modal-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price_cents}
                    onChange={updateField("price_cents")}
                    placeholder="28.00"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="modal-stock">Initial Stock</label>
                  <input
                    id="modal-stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={updateField("stock")}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="modal-image">Image URL (Optional)</label>
                <input
                  id="modal-image"
                  type="url"
                  value={form.image_url}
                  onChange={updateField("image_url")}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {form.image_url && (
                <div style={{ marginBottom: "18px", textAlign: "center" }}>
                  <img
                    src={form.image_url}
                    alt="Preview"
                    style={{ maxHeight: "120px", margin: "0 auto", borderRadius: "6px" }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}

              <div className="field">
                <label htmlFor="modal-description">Artisanal Story &amp; Description</label>
                <textarea
                  id="modal-description"
                  rows={3}
                  value={form.description}
                  onChange={updateField("description")}
                  placeholder="Describe the materials, paper weight, and hand-binding techniques..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={saving}
              >
                {saving ? "Publishing Edition..." : "Publish to Catalog"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="drawer-overlay" onClick={() => setConfirmDelete(null)}>
          <div
            className="checkout-box"
            style={{ maxWidth: "440px", width: "100%", margin: "auto", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--error-light)",
                color: "var(--error)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <TrashIcon size={24} />
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>
              Archive “{confirmDelete.name}”?
            </h3>
            <p style={{ fontSize: "14px", color: "var(--ink-soft)", marginBottom: "24px" }}>
              This will permanently remove this piece from the catalog. Customers will no longer be able to purchase it.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                className="btn btn-danger btn-block"
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
              >
                {deletingId === confirmDelete.id ? "Archiving..." : "Yes, Delete Piece"}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
