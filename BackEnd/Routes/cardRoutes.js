import express from "express";
import isAuthenticated from "../middleWare/isAuthenticated.js";

import {
  getCart,
  addToCart,
  updateQuantity,
} from "../controller/cartController.js";

const cartRoutes = express.Router();

cartRoutes.get("/get-cart/:id", isAuthenticated, getCart);
cartRoutes.post("/add-to-cart", isAuthenticated, addToCart);
cartRoutes.put("/update-quantity", isAuthenticated, updateQuantity);

export default cartRoutes;
