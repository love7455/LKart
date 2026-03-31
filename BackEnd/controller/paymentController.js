import crypto from "crypto";
import Cart from "../database/Models/cart.js";
import Order from "../database/Models/order.js";

const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials are missing in the backend environment",
    );
  }

  if (
    keyId === "your_key_id" ||
    keySecret === "your_key_secret" ||
    keyId.includes("your_key") ||
    keySecret.includes("your_key")
  ) {
    throw new Error(
      "Add your real Razorpay test keys in BackEnd/.env before checkout",
    );
  }

  return { keyId, keySecret };
};

const createRazorpayAuthHeader = () => {
  const { keyId, keySecret } = getRazorpayCredentials();
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
};

const getUserCart = async (userId) =>
  Cart.findOne({ userId }).populate("items.productId");

export const createOrder = async (req, res) => {
  try {
    const cart = await getUserCart(req.user._id);

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const amount = Math.round(cart.totalPrice * 100);

    if (amount < 1000) {
      return res.status(400).json({
        success: false,
        message: "Minimum Razorpay order amount is Rs. 10",
      });
    }

    const receipt = `lkart_${req.user._id}_${Date.now()}`.slice(0, 40);

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: createRazorpayAuthHeader(),
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt,
        notes: {
          userId: req.user._id.toString(),
          cartItems: String(cart.items.length),
        },
      }),
    });

    const data = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      return res.status(razorpayResponse.status).json({
        success: false,
        message: data.error?.description || "Failed to create Razorpay order",
      });
    }

    return res.status(200).json({
      success: true,
      order: data,
      key: getRazorpayCredentials().keyId,
      amount,
      currency: "INR",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details",
      });
    }

    if (orderId !== razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Order mismatch detected",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", getRazorpayCredentials().keySecret)
      .update(`${orderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId",
    );

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        success: false,
        message: "No cart items found to create an order",
      });
    }

    const orderNumber = `LK${Date.now().toString().slice(-8)}${Math.floor(
      Math.random() * 900 + 100,
    )}`;

    const items = cart.items.map((item) => ({
      productId: item.productId?._id || item.productId,
      productName: item.productId?.productName || "Product",
      productImage: item.productId?.productImages?.[0]?.url || "",
      price: item.price,
      quantity: item.quantity,
    }));

    const createdOrder = await Order.create({
      userId: req.user._id,
      orderNumber,
      razorpayOrderId: orderId,
      razorpayPaymentId: razorpayPaymentId,
      amount: cart.totalPrice,
      currency: "INR",
      status: "Placed",
      items,
    });

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpayPaymentId,
      orderId,
      order: createdOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
