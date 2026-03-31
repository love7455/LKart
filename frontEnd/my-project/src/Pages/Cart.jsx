import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { addToCart } from "@/redux/ProductSlice";
import {
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Cart = () => {
  const user = useSelector((state) => state.User.user);
  const accessToken = localStorage.getItem("accessToken");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (user?._id) {
      getCartItems();
      return;
    }

    setLoading(false);
    setCartItems([]);
  }, [user]);

  const getCartItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/v1/cart/get-cart/${user._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        },
      );

      if (res.data.success) {
        setCartItems(res.data.cart.items || []);
        dispatch(addToCart(res.data.cart.items || []));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load cart");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setUpdatingId(productId);
      const res = await axios.put(
        "/api/v1/cart/update-quantity",
        {
          productId,
          quantity,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        },
      );

      if (res.data.success) {
        setCartItems(res.data.cart.items || []);
        dispatch(addToCart(res.data.cart.items || []));
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const verifyPayment = async (paymentResponse, orderId) => {
    const res = await axios.post(
      "/api/v1/payment/verify-payment",
      {
        orderId,
        ...paymentResponse,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
      },
    );

    return res.data;
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Unable to load Razorpay checkout right now");
        return;
      }

      const orderRes = await axios.post(
        "/api/v1/payment/create-order",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        },
      );

      if (!orderRes.data.success) {
        toast.error(orderRes.data.message || "Failed to start checkout");
        return;
      }

      const { order, key, amount, currency } = orderRes.data;

      const options = {
        key,
        amount,
        currency,
        name: "LKart",
        description: "Cart checkout",
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await verifyPayment(response, order.id);
            if (verifyRes.success) {
              setCartItems([]);
              dispatch(addToCart([]));
              toast.success(
                `Payment successful. Order ${verifyRes.order?.orderNumber || ""} confirmed.`,
              );
              navigate("/orders");
            }
          } catch (error) {
            console.log(error);
            toast.error(
              error.response?.data?.message || "Payment verification failed",
            );
          }
        },
        prefill: {
          name: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
          email: user?.email || "",
          contact: user?.phoneNo || "",
        },
        notes: {
          userId: user?._id || "",
        },
        theme: {
          color: document.documentElement.classList.contains("dark")
            ? "#f59e0b"
            : "#f59e0b",
        },
        modal: {
          ondismiss: () => {
            toast.message("Checkout closed before payment completion");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", (response) => {
        toast.error(
          response.error?.description || "Payment failed. Please try again.",
        );
      });
      paymentObject.open();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const increaseQty = (item) => {
    updateQuantity(item.productId._id, item.quantity + 1);
  };

  const decreaseQty = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.productId._id, item.quantity - 1);
    } else {
      updateQuantity(item.productId._id, 0);
    }
  };

  const removeItem = (item) => {
    updateQuantity(item.productId._id, 0);
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const totalUnits = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (!user?._id) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full bg-amber-100 p-4 text-amber-700">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-foreground">
          Sign in to view your cart
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Your cart is waiting for you. Log in to sync items, update quantities,
          and continue shopping.
        </p>
        <Button className="mt-6 bg-amber-500 text-slate-900 hover:bg-amber-400" onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full bg-amber-100 p-4 text-amber-700">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-foreground">
          Your cart is empty
        </h2>
        <p className="mt-3 text-muted-foreground">
          Add a few products and they will show up here instantly.
        </p>
        <Button className="mt-6 bg-amber-500 text-slate-900 hover:bg-amber-400" onClick={() => navigate("/products")}>
          Browse products
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-6 md:grid-cols-3">
      <div className="space-y-4 md:col-span-2">
        {cartItems.map((item) => (
          <Card
            key={item._id}
            className="flex flex-col gap-4 border border-amber-200/70 bg-white/85 p-4 sm:flex-row sm:items-center"
          >
            <img
              src={item.productId.productImages?.[0]?.url}
              alt={item.productId.productName}
              className="h-24 w-24 rounded-lg object-cover"
            />

            <CardContent className="flex-1 p-0">
              <h3 className="text-lg font-semibold">
                {item.productId.productName}
              </h3>

              <p className="text-muted-foreground">Rs. {item.price}</p>

              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => decreaseQty(item)}
                  disabled={updatingId === item.productId._id || checkoutLoading}
                >
                  <Minus />
                </Button>

                <span className="min-w-8 text-center font-medium">
                  {item.quantity}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => increaseQty(item)}
                  disabled={updatingId === item.productId._id || checkoutLoading}
                >
                  <Plus />
                </Button>
              </div>
            </CardContent>

            <Button
              variant="outline"
              onClick={() => removeItem(item)}
              disabled={updatingId === item.productId._id || checkoutLoading}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {updatingId === item.productId._id ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Trash2 />
              )}
              Remove
            </Button>
          </Card>
        ))}
      </div>

      <Card className="h-fit border border-amber-200/70 bg-white/90 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

        <div className="mb-2 flex justify-between">
          <span>Total Products</span>
          <span>{cartItems.length}</span>
        </div>

        <div className="mb-2 flex justify-between">
          <span>Total Units</span>
          <span>{totalUnits}</span>
        </div>

        <div className="mb-4 flex justify-between">
          <span>Total Price</span>
          <span className="font-bold">Rs. {totalPrice}</span>
        </div>

        <Button
          className="w-full rounded-xl bg-amber-500 text-slate-900 hover:bg-amber-400"
          onClick={handleCheckout}
          disabled={checkoutLoading || loading || !cartItems.length}
        >
          {checkoutLoading ? (
            <>
              <Loader2 className="mr-2 animate-spin" /> Processing
            </>
          ) : (
            <>
              <CreditCard className="mr-2" /> Checkout with Razorpay
            </>
          )}
        </Button>
      </Card>
    </div>
  );
};

export default Cart;


