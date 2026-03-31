import express from "express";
import {
  createSupportTicket,
  getAllSupportTickets,
  getMySupportTickets,
  updateSupportTicketStatus,
} from "../controller/supportController.js";
import isAuthenticated from "../middleWare/isAuthenticated.js";
import isAdmin from "../middleWare/isAdmin.js";

const supportRoutes = express.Router();

supportRoutes.post("/contact", createSupportTicket);
supportRoutes.get("/my-tickets", isAuthenticated, getMySupportTickets);
supportRoutes.get("/admin/tickets", isAuthenticated, isAdmin, getAllSupportTickets);
supportRoutes.put(
  "/admin/tickets/:id/status",
  isAuthenticated,
  isAdmin,
  updateSupportTicketStatus,
);

export default supportRoutes;
