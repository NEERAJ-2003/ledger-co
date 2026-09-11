const BASE_URL = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("ledger_token");
}

async function request(path, { method = "GET", body, auth = false, form = false } = {}) {
  const headers = {};
  if (!form) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: form ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const data = await res.json();
      if (typeof data.detail === "string") detail = data.detail;
      else if (Array.isArray(data.detail)) {
        detail = data.detail.map((d) => d.msg || String(d)).join(" ");
      }
    } catch (_) {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    return request("/auth/login", { method: "POST", body: form, form: true });
  },
  me: () => request("/auth/me", { auth: true }),

  listProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getProduct: (slug) => request(`/products/${slug}`),
  createProduct: (payload) => request("/products", { method: "POST", auth: true, body: payload }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: "PATCH", auth: true, body: payload }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE", auth: true }),

  listCategories: () => request("/categories"),

  getCart: () => request("/cart", { auth: true }),
  addToCart: (productId, quantity = 1) =>
    request("/cart", { method: "POST", auth: true, body: { product_id: productId, quantity } }),
  updateCartItem: (itemId, quantity) =>
    request(`/cart/${itemId}`, { method: "PATCH", auth: true, body: { quantity } }),
  removeCartItem: (itemId) => request(`/cart/${itemId}`, { method: "DELETE", auth: true }),

  checkout: (shippingAddress) =>
    request("/orders", { method: "POST", auth: true, body: { shipping_address: shippingAddress } }),
  listOrders: () => request("/orders", { auth: true }),
  listAllOrders: () => request("/orders/admin/all", { auth: true }),
  updateOrderStatus: (orderId, status) =>
    request(`/orders/${orderId}/status`, { method: "PATCH", auth: true, body: { status } }),
};

export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
