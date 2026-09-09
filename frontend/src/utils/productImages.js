// Curated imagery and bespoke illustrations for Ledger & Co. stationery

export const PRODUCT_IMAGE_MAP = {
  "fieldbook-ruled": {
    url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
    badge: "Bestseller",
    material: "120gsm Swedish Paper · Saddle Stitched",
    rating: 4.9,
    reviewsCount: 38,
  },
  "ledger-journal-a5": {
    url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=80",
    badge: "Heritage Edition",
    material: "Linen Hardcover · 192 Dot-Grid Pages",
    rating: 5.0,
    reviewsCount: 52,
  },
  "fountain-pen-slate": {
    url: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=900&q=80",
    badge: "Craftsman Pick",
    material: "German Steel Nib · Matte Resin Barrel",
    rating: 4.8,
    reviewsCount: 29,
  },
  "bottled-ink-walnut": {
    url: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=900&q=80",
    badge: "Archival",
    material: "50ml Iron Gall · Fast Drying & Fade-Resistant",
    rating: 4.9,
    reviewsCount: 17,
  },
  "cotton-letter-paper": {
    url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=80",
    badge: "Pure Cotton",
    material: "100% Watermarked Rag Paper · 25 Sheets",
    rating: 4.7,
    reviewsCount: 22,
  },
  "kraft-envelopes-10": {
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80",
    badge: "Recycled",
    material: "Post-Consumer Kraft · Gummed European Flap",
    rating: 4.6,
    reviewsCount: 14,
  },
  "brass-letter-opener": {
    url: "https://images.unsplash.com/photo-1585336261026-7f09c646b3f7?auto=format&fit=crop&w=900&q=80",
    badge: "Solid Brass",
    material: "Turned Walnut Handle · Hand-Polished Brass",
    rating: 5.0,
    reviewsCount: 31,
  },
  "oak-pen-tray": {
    url: "https://images.unsplash.com/photo-1507842229451-77239c64d4be?auto=format&fit=crop&w=900&q=80",
    badge: "Artisan Wood",
    material: "Solid White Oak · Natural Beeswax Finish",
    rating: 4.9,
    reviewsCount: 26,
  },
};

export const CATEGORY_HERO_IMAGES = {
  notebooks: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=1200&q=80",
  pens: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1200&q=80",
  paper: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80",
  desk: "https://images.unsplash.com/photo-1507842229451-77239c64d4be?auto=format&fit=crop&w=1200&q=80",
};

export function getProductMeta(product) {
  if (!product) return {};
  const meta = PRODUCT_IMAGE_MAP[product.slug] || {};
  return {
    imageUrl: product.image_url || meta.url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    badge: meta.badge || (product.stock < 5 && product.stock > 0 ? "Low Stock" : "Handmade"),
    material: meta.material || "Workshop Crafted · Sourced Responsibly",
    rating: meta.rating || 4.9,
    reviewsCount: meta.reviewsCount || 19,
  };
}
