import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
  EditIcon,
  UploadIcon,
  ImageIcon,
} from "../components/Icons";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price_cents: "",
  stock: "0",
  category_id: "",
  image_url: "",
};

const STATUS_LABELS = {
  placed: "Placed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = searchParams.get("tab") === "orders" ? "orders" : "inventory";
  const [activeTab, setActiveTabState] = useState(currentTabParam);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [savingEdit, setSavingEdit] = useState(false);

  // File input refs
  const addFileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [confirmStatusChange, setConfirmStatusChange] = useState(null);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (tab === "orders") {
      setSearchParams({ tab: "orders" });
    } else {
      setSearchParams({});
    }
  };

  useEffect(() => {
    const tab = searchParams.get("tab") === "orders" ? "orders" : "inventory";
    setActiveTabState(tab);
  }, [searchParams]);

  const toast = useToast();

  const loadProducts = useCallback(() => {
    api.listProducts().then((data) => {
      setProducts(Array.isArray(data) ? data : []);
    }).catch((err) => {
      console.error(err);
      setProducts([]);
    });
  }, []);

  const loadOrders = useCallback(() => {
    setLoadingOrders(true);
    api.listAllOrders()
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load customer orders:", err);
        setOrders([]);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, []);

  useEffect(() => {
    loadProducts();
    api.listCategories().then((data) => {
      setCategories(Array.isArray(data) ? data : []);
    }).catch(console.error);
    loadOrders();
  }, [loadProducts, loadOrders]);

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

  const updateEditField = (field) => (e) => {
    const value = e.target.value;
    setEditForm((f) => ({ ...f, [field]: value }));
  };

  // Image Upload Handlers
  const handleImageFile = (file, isEdit = false) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP, etc.).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file should be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (isEdit) {
        setEditForm((prev) => ({ ...prev, image_url: dataUrl }));
      } else {
        setForm((prev) => ({ ...prev, image_url: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
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

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price_cents: product.price_cents ? (product.price_cents / 100).toFixed(2) : "",
      stock: String(product.stock ?? 0),
      category_id: product.category ? String(product.category.id) : (product.category_id ? String(product.category_id) : ""),
      image_url: product.image_url || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.slug || editForm.price_cents === "") {
      toast.error("Name, slug, and price are required.");
      return;
    }

    setSavingEdit(true);
    try {
      await api.updateProduct(editingProduct.id, {
        name: editForm.name,
        slug: editForm.slug,
        description: editForm.description,
        price_cents: Math.round(Number(editForm.price_cents) * 100),
        stock: editForm.stock === "" ? 0 : Number(editForm.stock),
        category_id: editForm.category_id === "" ? null : Number(editForm.category_id),
        image_url: editForm.image_url.trim() || null,
      });
      toast.success(`Successfully updated “${editForm.name}”!`);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      toast.error(err.message || "Failed to update product.");
    } finally {
      setSavingEdit(false);
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

  const executeStatusChange = async () => {
    if (!confirmStatusChange) return;
    const { orderId, newStatus } = confirmStatusChange;
    setUpdatingOrderId(orderId);
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
      toast.success(
        `Order #${orderId} status updated to “${STATUS_LABELS[newStatus] || newStatus}”.`
      );
      setConfirmStatusChange(null);
    } catch (err) {
      toast.error(err.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
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
          <PlusIcon size={16} /> Add Item
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs-nav">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          <PackageIcon size={16} /> Product Catalog ({products.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("orders");
            loadOrders();
          }}
        >
          <SlidersIcon size={16} /> Customer Orders ({orders.length})
        </button>
      </div>

      {activeTab === "inventory" ? (
        <>
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
                          <span
                            style={{
                              fontFamily: "var(--sans)",
                              fontWeight: 600,
                              fontSize: "14px",
                              color: isLow ? "var(--amber)" : "var(--ink)",
                              minWidth: "24px",
                            }}
                          >
                            {p.stock}
                          </span>
                          {isLow && (
                            <span
                              style={{
                                color: p.stock === 0 ? "var(--error)" : "var(--amber)",
                                fontSize: "11px",
                                fontWeight: 600,
                                background: p.stock === 0 ? "var(--error-light)" : "var(--amber-light)",
                                padding: "2px 6px",
                                borderRadius: "var(--radius-full)",
                              }}
                            >
                              {p.stock === 0 ? "OUT" : "LOW"}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => openEditModal(p)}
                            title="Edit product details"
                          >
                            <EditIcon size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setConfirmDelete(p)}
                            disabled={deletingId === p.id}
                            title="Delete product"
                          >
                            <TrashIcon size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Orders & Purchases View */
        <div style={{ marginTop: "32px" }}>
          {/* Order Metrics */}
          <div className="admin-metrics-grid" style={{ marginTop: 0 }}>
            <div className="metric-card">
              <span className="metric-label">Total Orders Received</span>
              <span className="metric-number">{orders.length}</span>
              <span className="metric-sub">From registered customers</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Total Revenue</span>
              <span className="metric-number">
                {formatPrice(orders.reduce((sum, o) => sum + (o.total_cents || 0), 0))}
              </span>
              <span className="metric-sub">Customer purchases to date</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Pending / In Prep</span>
              <span className="metric-number" style={{ color: "var(--amber)" }}>
                {orders.filter((o) => o.status === "placed").length}
              </span>
              <span className="metric-sub">Orders awaiting dispatch</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Delivered / Cancelled</span>
              <span className="metric-number" style={{ color: "var(--forest)" }}>
                {orders.filter((o) => o.status !== "placed").length}
              </span>
              <span className="metric-sub">Fulfilled workshop dispatches</span>
            </div>
          </div>

          <div className="admin-catalog-card">
            <div className="admin-catalog-head">
              <div>
                <h3 style={{ fontSize: "19px", margin: 0 }}>
                  Customer Orders &amp; Dispatches ({orders.length})
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--ink-muted)" }}>
                  Track what customers bought, delivery destinations, and fulfillment status.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={loadOrders}
                disabled={loadingOrders}
              >
                {loadingOrders ? "Refreshing..." : "Refresh Orders"}
              </button>
            </div>

            {loadingOrders ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--ink-muted)" }}>
                Loading customer orders...
              </div>
            ) : orders.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--ink-muted)" }}>
                <PackageIcon size={36} style={{ marginBottom: "12px", opacity: 0.6 }} />
                <h4 style={{ fontSize: "17px", color: "var(--ink)", marginBottom: "4px" }}>No customer orders placed yet</h4>
                <p style={{ fontSize: "13.5px" }}>When users buy stationery, their order details will appear here immediately.</p>
              </div>
            ) : (
              <div className="admin-orders-list">
                {orders.map((o) => {
                  const dateStr = new Date(o.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const customerName = o.owner?.full_name || "Customer";
                  const customerEmail = o.owner?.email || "Unknown email";
                  const isUpdating = updatingOrderId === o.id;
                  const totalItemsCount = o.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0;

                  return (
                    <div key={o.id} className="admin-order-card">
                      {/* Order Header */}
                      <div className="admin-order-head">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          <span
                            style={{
                              fontFamily: "var(--serif)",
                              fontSize: "19px",
                              fontWeight: 700,
                              color: "var(--ink)",
                            }}
                          >
                            Order #{o.id}
                          </span>
                          <span style={{ fontSize: "13px", color: "var(--ink-soft)" }}>
                            Placed on {dateStr}
                          </span>
                          <span className="badge badge-brass" style={{ fontSize: "11.5px" }}>
                            {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink-soft)" }}>
                            Fulfillment:
                          </span>
                          {o.status === "delivered" ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12.5px",
                                padding: "4px 12px",
                                fontWeight: 600,
                                borderRadius: "var(--radius-full)",
                                background: "var(--forest-light)",
                                color: "var(--forest)",
                                border: "1px solid rgba(34, 59, 41, 0.25)",
                              }}
                              title="Delivered orders are completed and cannot be modified"
                            >
                              <CheckIcon size={13} /> Delivered (Final)
                            </span>
                          ) : o.status === "cancelled" ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12.5px",
                                padding: "4px 12px",
                                fontWeight: 600,
                                borderRadius: "var(--radius-full)",
                                background: "var(--error-light)",
                                color: "var(--error)",
                                border: "1px solid rgba(168, 50, 50, 0.25)",
                              }}
                              title="Cancelled orders are closed and cannot be modified"
                            >
                              <XIcon size={13} /> Cancelled (Closed)
                            </span>
                          ) : (
                            <select
                              className="admin-order-status-select"
                              value={o.status}
                              onChange={(e) => {
                                const nextVal = e.target.value;
                                if (nextVal !== o.status) {
                                  setConfirmStatusChange({
                                    orderId: o.id,
                                    oldStatus: o.status,
                                    newStatus: nextVal,
                                    customerName: o.owner?.full_name || "Customer",
                                  });
                                }
                              }}
                              disabled={isUpdating || updatingOrderId === o.id}
                              style={{
                                borderColor:
                                  o.status === "shipped"
                                    ? "var(--brass)"
                                    : "var(--amber)",
                              }}
                            >
                              {o.status === "placed" && (
                                <option value="placed">Placed</option>
                              )}
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}
                        </div>
                      </div>

                      {/* Customer & Destination Details */}
                      <div className="admin-order-details-grid">
                        <div className="admin-order-info-block">
                          <span className="admin-order-block-title">Customer Account &amp; Identity</span>
                          <div className="admin-customer-info">
                            <div className="admin-customer-avatar">
                              {customerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <strong style={{ fontSize: "15px", color: "var(--ink)" }}>{customerName}</strong>
                                <span className="badge badge-brass" style={{ fontSize: "10.5px", padding: "1px 6px" }}>
                                  Verified Client
                                </span>
                              </div>
                              <div style={{ fontSize: "13px", color: "var(--ink-muted)", marginTop: "2px" }}>
                                Email: <span style={{ color: "var(--ink)", fontWeight: 500 }}>{customerEmail}</span>
                              </div>
                              {o.owner?.id && (
                                <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginTop: "1px" }}>
                                  Customer ID: #{o.owner.id}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="admin-order-info-block">
                          <span className="admin-order-block-title">Delivery &amp; Shipping Address</span>
                          <div
                            style={{
                              fontSize: "13.5px",
                              color: "var(--ink)",
                              lineHeight: 1.5,
                              background: "var(--paper-dim)",
                              padding: "10px 14px",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--line)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                              <strong style={{ fontSize: "13px", color: "var(--ink)" }}>Recipient: {customerName}</strong>
                            </div>
                            <div style={{ color: "var(--ink-soft)" }}>
                              {o.shipping_address || "Standard Atelier Shipping Address"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ordered Products with Full Product Details */}
                      <div style={{ marginTop: "16px" }}>
                        <span className="admin-order-block-title">Purchased Stationery Items</span>
                        <table className="admin-order-items-table">
                          <thead>
                            <tr>
                              <th>Ordered Piece &amp; Details</th>
                              <th>Category</th>
                              <th style={{ textAlign: "center" }}>Stock On Hand</th>
                              <th style={{ textAlign: "center" }}>Qty</th>
                              <th style={{ textAlign: "right" }}>Unit Price</th>
                              <th style={{ textAlign: "right" }}>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.items?.map((item) => {
                              const p = item.product;
                              const meta = getProductMeta(p || { name: item.product_name, image_url: p?.image_url });

                              return (
                                <tr key={item.id}>
                                  <td>
                                    <div className="admin-table-item-cell">
                                      <img
                                        src={meta.imageUrl}
                                        alt={item.product_name}
                                        className="admin-item-thumb"
                                      />
                                      <div>
                                        {p?.slug ? (
                                          <Link
                                            to={`/products/${p.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              fontWeight: 600,
                                              color: "var(--ink)",
                                              textDecoration: "none",
                                            }}
                                            title="View product details page"
                                          >
                                            {item.product_name} ↗
                                          </Link>
                                        ) : (
                                          <strong style={{ color: "var(--ink)" }}>{item.product_name}</strong>
                                        )}
                                        {p?.slug && (
                                          <span style={{ fontSize: "11.5px", color: "var(--ink-muted)", display: "block" }}>
                                            /{p.slug}
                                          </span>
                                        )}
                                        {p?.description && (
                                          <span
                                            style={{
                                              fontSize: "12px",
                                              color: "var(--ink-soft)",
                                              display: "-webkit-box",
                                              WebkitLineClamp: 1,
                                              WebkitBoxOrient: "vertical",
                                              overflow: "hidden",
                                              maxWidth: "280px",
                                            }}
                                          >
                                            {p.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  <td>
                                    <span className="badge badge-gray">
                                      {p?.category?.name || "Stationery"}
                                    </span>
                                  </td>

                                  <td style={{ textAlign: "center" }}>
                                    {p ? (
                                      p.stock === 0 ? (
                                        <span
                                          style={{
                                            color: "var(--error)",
                                            fontSize: "11.5px",
                                            fontWeight: 600,
                                            background: "var(--error-light)",
                                            padding: "2px 8px",
                                            borderRadius: "var(--radius-full)",
                                          }}
                                        >
                                          Sold Out (0 left)
                                        </span>
                                      ) : p.stock <= 5 ? (
                                        <span
                                          style={{
                                            color: "var(--amber)",
                                            fontSize: "11.5px",
                                            fontWeight: 600,
                                            background: "var(--amber-light)",
                                            padding: "2px 8px",
                                            borderRadius: "var(--radius-full)",
                                          }}
                                        >
                                          Low: {p.stock} left
                                        </span>
                                      ) : (
                                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--forest)" }}>
                                          {p.stock} in warehouse
                                        </span>
                                      )
                                    ) : (
                                      <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>—</span>
                                    )}
                                  </td>

                                  <td style={{ textAlign: "center", fontWeight: 600, fontSize: "14px" }}>
                                    {item.quantity}
                                  </td>

                                  <td style={{ textAlign: "right", fontFamily: "var(--serif)", fontSize: "14.5px" }}>
                                    {formatPrice(item.unit_price_cents)}
                                  </td>

                                  <td style={{ textAlign: "right", fontWeight: 600, fontFamily: "var(--serif)", fontSize: "14.5px" }}>
                                    {formatPrice(item.unit_price_cents * item.quantity)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Order Total & Status Summary */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          paddingTop: "16px",
                          marginTop: "8px",
                          borderTop: "1px solid var(--line-subtle)",
                        }}
                      >
                        <span style={{ fontSize: "13px", color: "var(--ink-muted)" }}>
                          Total items: <strong>{totalItemsCount}</strong>
                        </span>

                        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                          <span
                            style={{
                              fontSize: "13px",
                              color: "var(--ink-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Order Grand Total:
                          </span>
                          <strong
                            style={{
                              fontFamily: "var(--serif)",
                              fontSize: "20px",
                              color: "var(--ink)",
                            }}
                          >
                            {formatPrice(o.total_cents)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Product Modal Overlay */}
      {showAddModal && (
        <div className="drawer-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="checkout-box modal-scroll-hidden"
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
                <label htmlFor="modal-name">Item Name</label>
                <input
                  id="modal-name"
                  type="text"
                  value={form.name}
                  onChange={updateField("name")}
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

              {/* Direct Image Add Option */}
              <div className="field">
                <label>Product Image</label>
                <input
                  type="file"
                  ref={addFileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFile(file, false);
                  }}
                />

                {form.image_url ? (
                  <div className="image-upload-preview">
                    <img src={form.image_url} alt="Selected preview" />
                    <div className="image-preview-info">
                      <strong>Image Selected</strong>
                      <span className="upload-sub-text">Ready to be published with edition</span>
                      <div className="image-preview-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => addFileInputRef.current?.click()}
                        >
                          Replace Image
                        </button>
                        <button
                          type="button"
                          className="btn btn-text-danger btn-sm"
                          onClick={() => setForm((prev) => ({ ...prev, image_url: "" }))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="image-upload-dropzone"
                    onClick={() => addFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("drag-over");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("drag-over");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("drag-over");
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleImageFile(file, false);
                    }}
                  >
                    <div className="upload-icon-circle">
                      <UploadIcon size={20} />
                    </div>
                    <div className="upload-prompt-text">
                      <strong>Click to browse</strong> or drag &amp; drop product photo
                    </div>
                    <div className="upload-sub-text">PNG, JPG, WEBP up to 5MB</div>
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor="modal-description">Description</label>
                <textarea
                  id="modal-description"
                  rows={3}
                  value={form.description}
                  onChange={updateField("description")}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={saving}
              >
                {saving ? "Adding Items..." : "Add item to store"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal Overlay */}
      {editingProduct && (
        <div className="drawer-overlay" onClick={() => setEditingProduct(null)}>
          <div
            className="checkout-box modal-scroll-hidden"
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
              <div>
                <h2 style={{ fontSize: "22px", margin: 0 }}>Edit Stationery Piece</h2>
                <span style={{ fontSize: "13px", color: "var(--ink-muted)" }}>
                  Updating “{editingProduct.name}”
                </span>
              </div>
              <button type="button" className="btn-icon" onClick={() => setEditingProduct(null)}>
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="field">
                <label htmlFor="edit-name">Item Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editForm.name}
                  onChange={updateEditField("name")}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="edit-slug">URL Slug</label>
                <input
                  id="edit-slug"
                  type="text"
                  value={editForm.slug}
                  onChange={updateEditField("slug")}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  value={editForm.category_id}
                  onChange={updateEditField("category_id")}
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
                  <label htmlFor="edit-price">Price in USD ($)</label>
                  <input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price_cents}
                    onChange={updateEditField("price_cents")}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="edit-stock">Stock Level</label>
                  <input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={updateEditField("stock")}
                    required
                  />
                </div>
              </div>

              {/* Direct Image Add/Edit Option */}
              <div className="field">
                <label>Product Image</label>
                <input
                  type="file"
                  ref={editFileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFile(file, true);
                  }}
                />

                {editForm.image_url ? (
                  <div className="image-upload-preview">
                    <img
                      src={editForm.image_url}
                      alt="Selected preview"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <div className="image-preview-info">
                      <strong>Current Photo</strong>
                      <span className="upload-sub-text">Click below to change or remove</span>
                      <div className="image-preview-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => editFileInputRef.current?.click()}
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          className="btn btn-text-danger btn-sm"
                          onClick={() => setEditForm((prev) => ({ ...prev, image_url: "" }))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="image-upload-dropzone"
                    onClick={() => editFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("drag-over");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("drag-over");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("drag-over");
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleImageFile(file, true);
                    }}
                  >
                    <div className="upload-icon-circle">
                      <UploadIcon size={20} />
                    </div>
                    <div className="upload-prompt-text">
                      <strong>Click to browse</strong> or drag &amp; drop product photo
                    </div>
                    <div className="upload-sub-text">PNG, JPG, WEBP up to 5MB</div>
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  rows={3}
                  value={editForm.description}
                  onChange={updateEditField("description")}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving Changes..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-block btn-lg"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="drawer-overlay" onClick={() => setConfirmDelete(null)}>
          <div
            className="checkout-box modal-scroll-hidden"
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

      {/* Confirm Order Status Change Dialog */}
      {confirmStatusChange && (
        <div className="drawer-overlay" onClick={() => setConfirmStatusChange(null)}>
          <div
            className="checkout-box modal-scroll-hidden"
            style={{ maxWidth: "460px", width: "100%", margin: "auto", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background:
                  confirmStatusChange.newStatus === "cancelled"
                    ? "var(--error-light)"
                    : confirmStatusChange.newStatus === "delivered"
                    ? "var(--forest-light)"
                    : "var(--amber-light)",
                color:
                  confirmStatusChange.newStatus === "cancelled"
                    ? "var(--error)"
                    : confirmStatusChange.newStatus === "delivered"
                    ? "var(--forest)"
                    : "var(--amber)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <AlertCircleIcon size={24} />
            </div>

            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>
              Update Order #{confirmStatusChange.orderId} Status?
            </h3>

            <p style={{ fontSize: "14px", color: "var(--ink-soft)", marginBottom: "16px", lineHeight: 1.5 }}>
              Are you sure you want to change the fulfillment status for{" "}
              <strong style={{ color: "var(--ink)" }}>{confirmStatusChange.customerName}</strong>?
            </p>

            <div
              style={{
                background: "var(--paper-dim)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                marginBottom: "24px",
                fontSize: "14px",
              }}
            >
              <span style={{ color: "var(--ink-muted)", textDecoration: "line-through" }}>
                {STATUS_LABELS[confirmStatusChange.oldStatus] || confirmStatusChange.oldStatus}
              </span>
              <span style={{ color: "var(--ink-muted)" }}>&rarr;</span>
              <strong
                style={{
                  color:
                    confirmStatusChange.newStatus === "cancelled"
                      ? "var(--error)"
                      : confirmStatusChange.newStatus === "delivered"
                      ? "var(--forest)"
                      : "var(--brass)",
                }}
              >
                {STATUS_LABELS[confirmStatusChange.newStatus] || confirmStatusChange.newStatus}
              </strong>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                className={`btn btn-block ${
                  confirmStatusChange.newStatus === "cancelled" ? "btn-danger" : "btn-primary"
                }`}
                onClick={executeStatusChange}
                disabled={updatingOrderId === confirmStatusChange.orderId}
              >
                {updatingOrderId === confirmStatusChange.orderId ? "Updating..." : "Yes, Update Status"}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => setConfirmStatusChange(null)}
                disabled={updatingOrderId === confirmStatusChange.orderId}
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
