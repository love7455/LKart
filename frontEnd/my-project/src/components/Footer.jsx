import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      id="contact"
      className="mt-10 border-t border-amber-200/70 bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-50 py-10 text-slate-700"
    >
      <div className="container mx-auto grid grid-cols-1 gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h4 className="mb-4 text-lg font-semibold text-slate-900">About LKart</h4>
          <div className="mb-3 flex items-center gap-2 text-2xl font-bold text-amber-600">
            <ShoppingCart />
            Kart
          </div>
          <p className="text-slate-600">
            LKart is your go-to store for quality products and a smooth shopping
            experience.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-lg font-semibold text-slate-900">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/home" className="transition hover:text-amber-700">Home</Link></li>
            <li><Link to="/products" className="transition hover:text-amber-700">Products</Link></li>
            <li><Link to="/cart" className="transition hover:text-amber-700">Cart</Link></li>
            <li><Link to="/wishlist" className="transition hover:text-amber-700">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-lg font-semibold text-slate-900">Support</h4>
          <ul className="space-y-2">
            <li><Link to="/orders" className="transition hover:text-amber-700">Orders</Link></li>
            <li><Link to="/profile" className="transition hover:text-amber-700">Account Settings</Link></li>
            <li><Link to="/contact-us" className="transition hover:text-amber-700">Contact Us</Link></li>
            <li><Link to="/help-center" className="transition hover:text-amber-700">Help Center</Link></li>
            <li><Link to="/admin/products" className="transition hover:text-amber-700">Manage Products</Link></li>
            <li><Link to="/admin/support" className="transition hover:text-amber-700">Admin Support</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-lg font-semibold text-slate-900">Contact</h4>
          <p>Email: support@lkart.com</p>
          <p>Phone: +91 98765 43210</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="transition hover:text-amber-700">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="transition hover:text-amber-700">Instagram</a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="transition hover:text-amber-700">X</a>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-slate-500">
        Copyright 2026 LKart. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
