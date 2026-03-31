import express from "express";
import isAuthenticated from "../middleWare/isAuthenticated.js";
import isAdmin from "../middleWare/isAdmin.js";
import upload from "../middleWare/multer.js";
import {
  addProduct,
  deleteProdcut,
  getAllProcuts,
  getProductById,
  seedDemoProducts,
  updateProduct,
} from "../controller/productController.js";

const productRoutes = express.Router();

// Add Product (Admin only)
productRoutes.post(
  "/add-product",
  isAuthenticated,
  isAdmin,
  upload.array("productImages", 5),
  addProduct,
);

productRoutes.get("/get-all-products", getAllProcuts);
productRoutes.post("/seed-demo", seedDemoProducts);

productRoutes.delete(
  "/delete-product/:productId",
  isAuthenticated,
  isAdmin,
  deleteProdcut,
);

productRoutes.put(
  "/update-product/:productId",
  isAuthenticated,
  isAdmin,
  upload.array("productImages", 5),
  updateProduct,
);

productRoutes.get("/:id", getProductById);

export default productRoutes;
