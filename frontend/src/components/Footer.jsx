import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>Ledger &amp; Co.</h3>
            <p>
              Handcrafted journals, fountain pens, and desk instruments crafted by
              independent artisans. Built for tactile daily use, permanence, and
              lifelong writing.
            </p>
          </div>

          <div className="footer-col">
            <h4>The Atelier</h4>
            <ul className="footer-links">
              <li><Link to="/products">All Stationery</Link></li>
              <li><Link to="/products">Bound Notebooks</Link></li>
              <li><Link to="/products">Fine Inks &amp; Pens</Link></li>
              <li><Link to="/products">Solid Brass Tools</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Client Care</h4>
            <ul className="footer-links">
              <li><Link to="/orders">Order Tracking</Link></li>
              <li><a href="#guarantee" onClick={(e) => e.preventDefault()}>Tactile Guarantee</a></li>
              <li><a href="#shipping" onClick={(e) => e.preventDefault()}>Worldwide Shipping</a></li>
              <li><a href="#care" onClick={(e) => e.preventDefault()}>Paper &amp; Nib Care</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Craft Ethics</h4>
            <p style={{ fontSize: "13.5px", color: "rgba(250, 247, 242, 0.65)", lineHeight: 1.6 }}>
              All papers are sustainably milled from 100% FSC-certified cotton and recycled
              linters. Every ledger is sewn by hand to lie completely flat on your desk.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Ledger &amp; Co. All rights reserved.</span>
          <span>Built by Neeraj · 2026</span>
        </div>
      </div>
    </footer>
  );
}
