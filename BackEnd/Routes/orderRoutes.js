import express from "express";
import isAuthenticated from "../middleWare/isAuthenticated.js";
import { getMyOrders } from "../controller/orderController.js";

const orderRoutes = express.Router();

orderRoutes.get("/my-orders", isAuthenticated, getMyOrders);

export default orderRoutes;
