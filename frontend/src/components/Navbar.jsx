import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { BagIcon, UserIcon, LogOutIcon, ChevronDownIcon, PackageIcon, SlidersIcon } from "./Icons";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart, openCart } = useCart();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <>
      <div className="announcement-bar">
        <span>Free Delivery on all orders over <strong>$50.00</strong></span>
      </div>

      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand-group">
            <div className="brand-emblem">L</div>
            <div>
              <span className="brand-title">Ledger &amp; Co.</span>
              <span className="brand-sub">Workshop &amp; Paper Goods</span>
            </div>
          </Link>

          <nav className="nav-links">
            {!user?.is_admin && (
              <Link
                to="/products"
                className={`nav-item ${location.pathname === "/products" ? "active" : ""}`}
              >
                Shop Collection
              </Link>
            )}

            {user && (
              <Link
                to={user.is_admin ? "/admin?tab=orders" : "/orders"}
                className={`nav-item ${
                  user.is_admin
                    ? (location.pathname === "/orders" || (location.pathname === "/admin" && location.search.includes("tab=orders")))
                      ? "active"
                      : ""
                    : location.pathname === "/orders"
                    ? "active"
                    : ""
                }`}
              >
                Orders
              </Link>
            )}

            {user?.is_admin && (
              <Link
                to="/admin"
                className={`nav-item ${
                  location.pathname === "/admin" && !location.search.includes("tab=orders")
                    ? "active"
                    : ""
                }`}
              >
                Admin Suite
              </Link>
            )}
          </nav>

          <div className="nav-actions">
            {/* Quick slide-over cart trigger (only for customers) */}
            {!user?.is_admin && (
              <button
                type="button"
                className="cart-button"
                onClick={openCart}
                aria-label="Open shopping bag"
              >
                <BagIcon size={18} />
                <span>Bag</span>
                {itemCount > 0 && <span className="pill">{itemCount}</span>}
              </button>
            )}

            {/* User Profile / Auth */}
            {user ? (
              <div className="user-menu-wrapper" ref={menuRef}>
                <button
                  type="button"
                  className="user-button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  aria-expanded={userMenuOpen}
                >
                  <div className="user-avatar-circle">
                    {user.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span>{user.full_name?.split(" ")[0] || "Account"}</span>
                  <ChevronDownIcon size={14} />
                </button>

                {userMenuOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-name">{user.full_name}</div>
                      <div className="dropdown-email">{user.email}</div>
                    </div>

                    <Link
                      to={user.is_admin ? "/admin?tab=orders" : "/orders"}
                      className="dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <PackageIcon size={15} />
                      <span>{user.is_admin ? "Customer Orders" : "Order History"}</span>
                    </Link>

                    {user.is_admin && (
                      <Link
                        to="/admin"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <SlidersIcon size={15} />
                        <span>Store Administration</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      className="dropdown-item danger"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOutIcon size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline btn-sm">
                <UserIcon size={14} /> Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
