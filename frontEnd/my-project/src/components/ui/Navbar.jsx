import { Heart, Menu, Moon, ShoppingCart, Sun, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "@/lib/api";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { clearCart, setWishlist } from "@/redux/ProductSlice";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const Navbar = () => {
  const user = useSelector((state) => state.User.user);
  const cart = useSelector((state) => state.Product.cart);
  const wishlist = useSelector((state) => state.Product.wishlist);
  const { theme, setTheme } = useTheme();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const clearLocalSession = useCallback(
    (shouldToast = false, redirectTo = "/login") => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch(setUser(null));
      dispatch(clearCart());
      dispatch(setWishlist([]));

      if (shouldToast) {
        toast.error("Session expired. Please login again.");
      }

      navigate(redirectTo);
    },
    [dispatch, navigate],
  );

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/logout",
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
            authorization: accessToken,
            "x-refresh-token": refreshToken,
          },
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);
        clearLocalSession(false, "/");
      }
    } catch (error) {
      clearLocalSession(false, "/");
      toast.error(error.response?.data?.message || "Logged out locally");
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?._id) {
        dispatch(setWishlist([]));
        return;
      }

      try {
        const res = await axios.get("http://localhost:8000/api/v1/user/wishlist", {
          headers: {
            "Content-Type": "application/json",
            authorization: localStorage.getItem("accessToken"),
          },
        });

        if (res.data.success) {
          dispatch(setWishlist(res.data.wishlist || []));
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchWishlist();
  }, [user?._id, dispatch]);

  useEffect(() => {
    const onAuthLogout = () => clearLocalSession(true);
    window.addEventListener("auth:logout", onAuthLogout);

    return () => window.removeEventListener("auth:logout", onAuthLogout);
  }, [clearLocalSession]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || !user?._id) return;

    const [, payload] = token.split(".");
    if (!payload) return;

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(atob(payload));
    } catch (error) {
      return;
    }

    const expiry = parsedPayload?.exp ? parsedPayload.exp * 1000 : 0;
    const msLeft = expiry - Date.now();

    if (msLeft <= 0) {
      clearLocalSession(true);
      return;
    }

    const timer = setTimeout(() => clearLocalSession(true), msLeft);
    return () => clearTimeout(timer);
  }, [user?._id, clearLocalSession]);

  return (
    <nav
      className={`sticky top-0 z-40 border-b backdrop-blur transition-all duration-300 ${
        isScrolled
          ? "border-amber-300/70 bg-background/90 shadow-lg shadow-amber-200/40"
          : "border-border bg-background/80"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl">
          <ShoppingCart className="text-amber-500" />
          Kart
        </div>

        <div className="hidden items-center space-x-4 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/home" className="transition hover:text-foreground">Home</Link>
          <Link to="/products" className="transition hover:text-foreground">Products</Link>
          {user && <Link to="/orders" className="transition hover:text-foreground">Orders</Link>}

          {user?.role === "admin" && (
            <>
              <Link to="/admin/products" className="transition hover:text-foreground">Manage Products</Link>
              <Link to="/admin/support" className="transition hover:text-foreground">Admin Support</Link>
            </>
          )}

          <Link to="/wishlist" className="relative transition hover:text-foreground">
            <Heart className="h-5 w-5" />
            <span className="absolute -top-3 -right-3 rounded-full bg-amber-500 px-1.5 text-[10px] text-slate-900">
              {wishlist?.length || 0}
            </span>
          </Link>

          {user && <Link to="/profile" className="transition hover:text-foreground">Hello, {user.firstName}</Link>}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>

          <div className="relative cursor-pointer text-foreground" onClick={() => navigate("/cart")}>
            <ShoppingCart />
            <span className="absolute -top-2 -right-2 rounded-full bg-amber-500 px-2 text-xs text-slate-900">
              {cart?.length || 0}
            </span>
          </div>

          {user ? (
            <Button onClick={handleLogout} className="bg-amber-500 text-slate-900 hover:bg-amber-400">
              Logout
            </Button>
          ) : (
            <Button onClick={() => navigate("/login")} className="bg-amber-500 text-slate-900 hover:bg-amber-400">
              Login
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <div className="relative cursor-pointer text-foreground" onClick={() => navigate("/cart")}>
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 rounded-full bg-amber-500 px-1.5 text-[10px] text-slate-900">
              {cart?.length || 0}
            </span>
          </div>
          <button
            className="rounded-md border border-amber-200 bg-white/80 p-2 text-slate-700"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-amber-200 bg-background/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
            <Link to="/home" onClick={closeMobile}>Home</Link>
            <Link to="/products" onClick={closeMobile}>Products</Link>
            {user && <Link to="/orders" onClick={closeMobile}>Orders</Link>}
            <Link to="/wishlist" onClick={closeMobile}>Wishlist ({wishlist?.length || 0})</Link>
            {user && <Link to="/profile" onClick={closeMobile}>Profile</Link>}
            {user?.role === "admin" && (
              <>
                <Link to="/admin/products" onClick={closeMobile}>Manage Products</Link>
                <Link to="/admin/support" onClick={closeMobile}>Admin Support</Link>
              </>
            )}
            <Button
              variant="outline"
              className="justify-start border-amber-300 text-amber-700"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </Button>
            {user ? (
              <Button
                onClick={(e) => {
                  closeMobile();
                  handleLogout(e);
                }}
                className="bg-amber-500 text-slate-900 hover:bg-amber-400"
              >
                Logout
              </Button>
            ) : (
              <Button
                onClick={() => {
                  closeMobile();
                  navigate("/login");
                }}
                className="bg-amber-500 text-slate-900 hover:bg-amber-400"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
