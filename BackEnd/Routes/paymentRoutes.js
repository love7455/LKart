import express from "express";
import isAuthenticated from "../middleWare/isAuthenticated.js";
import { createOrder, verifyPayment } from "../controller/paymentController.js";

const paymentRoutes = express.Router();

paymentRoutes.post("/create-order", isAuthenticated, createOrder);
paymentRoutes.post("/verify-payment", isAuthenticated, verifyPayment);

export default paymentRoutes;
