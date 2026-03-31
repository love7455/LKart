import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Navbar from "./components/ui/Navbar";
import Home from "./Pages/Home";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import Verify from "./Pages/verify";
import VerifyEmail from "./Pages/VerifyEmail";
import ForgetPassword from "./Pages/ForgetPassword";
import ProfilePage from "./Pages/Profile";
import Products from "./Pages/Products";
import ProductDetails from "./Pages/ProductDetail";
import Cart from "./Pages/Cart";
import Wishlist from "./Pages/Wishlist";
import Orders from "./Pages/Orders";
import HelpCenter from "./Pages/HelpCenter";
import ContactUs from "./Pages/ContactUs";
import AdminSupport from "./Pages/AdminSupport";
import AdminProducts from "./Pages/AdminProducts";
import ScrollGlow from "./components/ui/ScrollGlow";

function App() {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <Navbar />
          <Home />
        </>
      ),
    },
    {
      path: "/home",
      element: (
        <>
          <Navbar />
          <Home />
        </>
      ),
    },
    {
      path: "/signup",
      element: (
        <>
          <Signup />
        </>
      ),
    },
    {
      path: "/login",
      element: (
        <>
          <Login />
        </>
      ),
    },
    {
      path: "/verify",
      element: (
        <>
          <Verify />
        </>
      ),
    },
    {
      path: "/verify/:token",
      element: (
        <>
          <VerifyEmail />
        </>
      ),
    },
    {
      path: "/forget-password",
      element: (
        <>
          <ForgetPassword />
        </>
      ),
    },
    {
      path: "/profile",
      element: (
        <>
          <Navbar />
          <ProfilePage />
        </>
      ),
    },
    {
      path: "/products",
      element: (
        <>
          <Navbar />
          <Products />
        </>
      ),
    },
    {
      path: "/product/:id",
      element: (
        <>
          <Navbar />
          <ProductDetails />
        </>
      ),
    },
    {
      path: "/cart",
      element: (
        <>
          <Navbar />
          <Cart />
        </>
      ),
    },
    {
      path: "/wishlist",
      element: (
        <>
          <Navbar />
          <Wishlist />
        </>
      ),
    },
    {
      path: "/orders",
      element: (
        <>
          <Navbar />
          <Orders />
        </>
      ),
    },
    {
      path: "/help-center",
      element: (
        <>
          <Navbar />
          <HelpCenter />
        </>
      ),
    },
    {
      path: "/contact-us",
      element: (
        <>
          <Navbar />
          <ContactUs />
        </>
      ),
    },
    {
      path: "/admin/support",
      element: (
        <>
          <Navbar />
          <AdminSupport />
        </>
      ),
    },
    {
      path: "/admin/products",
      element: (
        <>
          <Navbar />
          <AdminProducts />
        </>
      ),
    },
  ]);

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors">
      <ScrollGlow />
      <div className="relative z-10">
      <RouterProvider router={routes} />
      </div>
    </div>
  );
}

export default App;
