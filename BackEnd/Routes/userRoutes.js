import express from "express";
import {
  registerUser,
  reVerify,
  verifyUser,
  login,
  refreshAccessToken,
  logOut,
  forgetPassword,
  verifyOtp,
  changePassword,
  getAllUser,
  getUserById,
  updateProfile,
  getWishlist,
  toggleWishlist,
} from "../controller/userController.js";
import isAuthenticated from "../middleWare/isAuthenticated.js";
import isAdmin from "../middleWare/isAdmin.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/verify", verifyUser);

router.post("/reverify", reVerify);

router.post("/login", login);

router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logOut);

router.post("/forget-password", forgetPassword);

router.post("/verify-otp/:email", verifyOtp);

router.post("/change-password/:email", changePassword);

router.get("/all-user-data", isAuthenticated, isAdmin, getAllUser);

router.get("/getById/:id", getUserById);

router.put(
  "/update-profile",
  isAuthenticated,
  upload.single("profilePic"), // we use uplaod.array("products") if we uplaod multiple images
  updateProfile,
);
router.get("/wishlist", isAuthenticated, getWishlist);
router.post("/wishlist/toggle", isAuthenticated, toggleWishlist);

export default router;
