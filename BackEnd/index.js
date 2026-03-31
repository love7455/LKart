import express from "express";
import "dotenv/config";
import connectToDB from "./database/db.js";
import router from "./Routes/userRoutes.js";
import cors from "cors";
import productRoutes from "./Routes/productRoutes.js";
import cartRoutes from "./Routes/cardRoutes.js";
import paymentRoutes from "./Routes/paymentRoutes.js";
import orderRoutes from "./Routes/orderRoutes.js";
import supportRoutes from "./Routes/supportRoutes.js";
import multer from "multer";

const app = express();

const normalizedPort = Number.parseInt(String(process.env.PORT || "8000"), 10);
const PORT = Number.isNaN(normalizedPort) ? 8000 : normalizedPort;
app.use(
  cors({
    origin: (origin, callback) => {
      const extraOrigins = (process.env.CORS_ORIGINS || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        process.env.FRONTEND_URL,
        ...extraOrigins,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS blocked for this origin"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api/v1/user", router);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/support", supportRoutes);
app.get("/api/v1/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backend is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Image too large. Maximum file size is 5MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err?.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: err?.message || "Internal server error",
  });
});

connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
