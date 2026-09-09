import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatPrice } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getProductMeta } from "../utils/productImages";
import { StarIcon, PlusIcon, BagIcon, AlertCircleIcon } from "./Icons";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { cart, addToCart, openCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const meta = getProductMeta(product);
  const inCart = cart?.items?.find((i) => i.product.id === product.id)?.quantity || 0;
  const remaining = Math.max(0, product.stock - inCart);
  const isOutOfStock = product.stock === 0;
  const isCartMax = remaining === 0 && !isOutOfStock;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please sign in to add items to your bag.");
      navigate("/login");
      return;
    }

    if (isOutOfStock) {
      toast.error("This edition is currently out of stock.");
      return;
    }

    if (isCartMax) {
      toast.error(`You have reserved all ${product.stock} available units.`);
      return;
    }

    setAdding(true);
    try {
      await addToCart(product.id, 1);
      toast.success(`Added “${product.name}” to your bag.`);
      openCart();
    } catch (err) {
      toast.error(err.message || "Failed to update bag.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.slug}`}>
        <div className="product-card-image-wrap">
          <img
            src={meta.imageUrl}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
          {meta.badge && (
            <div className="product-card-badge">
              <span className="badge badge-brass">{meta.badge}</span>
            </div>
          )}
        </div>

        <div className="product-card-category">
          {product.category?.name || "Stationery"}
        </div>

        <div className="product-card-rating">
          <StarIcon filled size={13} />
          <strong style={{ color: "var(--ink)" }}>{meta.rating}</strong>
          <span>({meta.reviewsCount})</span>
        </div>

        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-material">{meta.material}</p>

        <div className="product-card-bottom">
          <div className="product-card-price">
            {formatPrice(product.price_cents)}
          </div>
          <div className="stock-indicator">
            {isOutOfStock ? (
              <span className="stock-indicator out">Sold Out</span>
            ) : product.stock <= 5 ? (
              <span className="stock-indicator low">Only {product.stock} left</span>
            ) : (
              <span className="stock-indicator in">{product.stock} in stock</span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        className={`btn btn-block ${isOutOfStock ? "btn-outline" : "btn-primary"}`}
        onClick={handleAdd}
        disabled={adding || isOutOfStock || isCartMax}
      >
        {isOutOfStock ? (
          "Out of Stock"
        ) : isCartMax ? (
          "All in Bag"
        ) : adding ? (
          "Adding..."
        ) : (
          <>
            <BagIcon size={15} /> Add to Bag
          </>
        )}
      </button>
    </div>
  );
}
