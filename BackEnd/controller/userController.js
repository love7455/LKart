import express from "express";
import { User } from "../database/Models/usermodel.js";
import { Session } from "../database/Models/session.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendOTPEmail from "../verifyEmail/sendOtp.js";
import Cart from "../database/Models/cart.js";
import cloudinary from "../utils/cloudinary.js";
import ProductModel from "../database/Models/product.js";

// create  new user
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email }).populate("wishlist");

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
    });
    sendOTPEmail(otp, newUser).catch((mailError) => {
      console.error("OTP email send failed after signup:", mailError.message);
    });

    return res.status(200).json({
      success: true,
      message: "User registered. OTP sent to your email",
      email: newUser.email,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
//email verification
const verifyUser = async (req, res) => {
  const { email, otp } = req.body || {};

  if (email && otp) {
    try {
      const verifiedUser = await User.findOne({ email });

      if (!verifiedUser) {
        return res.status(400).json({
          success: false,
          message: "User Not Found",
        });
      }

      if (verifiedUser.isVerified) {
        return res.status(200).json({
          success: true,
          message: "Account already verified",
        });
      }

      if (!verifiedUser.otp || !verifiedUser.otpExpiry) {
        return res.status(400).json({
          success: false,
          message: "OTP is not generated or already verified",
        });
      }

      if (Date.now() > verifiedUser.otpExpiry) {
        return res.status(400).json({
          success: false,
          message: "OTP is Expired",
        });
      }

      if (verifiedUser.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid Otp",
        });
      }

      verifiedUser.otp = null;
      verifiedUser.otpExpiry = null;
      verifiedUser.token = null;
      verifiedUser.isVerified = true;
      await verifiedUser.save();

      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  const token = req.headers.authorization;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Auth token is missing",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    if (error.message == "jwt expired") {
      return res.status(400).json({
        success: false,
        message: "Auth token is Expired",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Token Vefication Failed",
    });
  }

  console.log(decoded);
  const verifiedUser = await User.findById(decoded.id);
  if (!verifiedUser) {
    return res.status(400).json({
      success: false,
      message: "User Not Found",
    });
  }

  if (verifiedUser.isVerified) {
    return res.status(400).json({
      success: true,
      message: "Account already verified",
    });
  }
  verifiedUser.token = null;
  verifiedUser.isVerified = true;

  await verifiedUser.save();

  return res.status(200).json({
    success: true,
    message: "Email Verified",
    verifiedUser,
  });
};

//SENT EMAIL AGAIN FOR VERIFICATION
const reVerify = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not Found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;
    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();
    sendOTPEmail(otp, user).catch((mailError) => {
      console.error("OTP email send failed on reverify:", mailError.message);
    });
    return res.status(200).json({
      success: true,
      message: "Verification OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//login controller

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message: "Wrong Password",
      });
    }

    if (user.isVerified === false) {
      return res.status(400).json({
        success: false,
        message: "Verify your account first",
      });
    }

    // 🔹 Tokens
    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });

    const refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    user.isLoggedIn = true;

    // 🔹 Remove old session
    const existingSession = await Session.findOne({ userId: user._id });
    if (existingSession) {
      await Session.deleteOne({ userId: user._id });
    }

    // 🔹 Create new session
    await Session.create({ userId: user._id });

    await user.save();

    // 🔹 Get Cart
    const cart = await Cart.findOne({ userId: user._id }).populate(
      "items.productId",
    );

    res.status(200).json({
      success: true,
      message: "Logged in Successfully",
      user,
      accessToken,
      refreshToken,
      accessTokenExpiresIn: 10 * 60,
      cart: cart ? cart.items : [], // ?? send cart items
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default login;
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken =
      req.headers["x-refresh-token"] ||
      req.body?.refreshToken ||
      req.headers.authorization;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing",
        code: "REFRESH_TOKEN_MISSING",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or expired",
        code: "REFRESH_TOKEN_INVALID",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isLoggedIn) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again",
        code: "SESSION_EXPIRED",
      });
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
      accessToken,
      accessTokenExpiresIn: 10 * 60,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//logout controller
const logOut = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    const refreshToken =
      req.headers["x-refresh-token"] || req.body?.refreshToken;

    let userId = null;

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.SECRET_KEY, {
          ignoreExpiration: true,
        });
        userId = decoded?.id || null;
      } catch (error) {
        userId = null;
      }
    }

    if (!userId && refreshToken) {
      try {
        const decodedRefresh = jwt.verify(refreshToken, process.env.SECRET_KEY);
        userId = decodedRefresh?.id || null;
      } catch (error) {
        userId = null;
      }
    }

    if (userId) {
      await Session.deleteMany({ userId });
      await User.findByIdAndUpdate(userId, { isLoggedIn: false });
    }

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//forgetPassword controller
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        sucecss: false,
        message: "Please Enter Email Id",
      });
    }

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(400).json({
        sucecss: false,
        message: "User Not Found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    existingUser.otp = otp;
    existingUser.otpExpiry = expiry;

    await existingUser.save();

    sendOTPEmail(otp, existingUser).catch((mailError) => {
      console.error("OTP email send failed on forget-password:", mailError.message);
    });

    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
    });
  } catch (error) {
    res.status(500).json({
      sucecss: false,
      message: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email } = req.params;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "Otp is required",
      });
    }

    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return res.status(400).json({
        sucecss: false,
        message: "User not found",
      });
    }

    if (existingUser.otp != otp) {
      return res.status(400).json({
        sucecss: false,
        message: "Invalid Otp",
      });
    }

    if (!existingUser.otp || !existingUser.otpExpiry) {
      return res.status(400).json({
        sucecss: false,
        message: "OTP is not generated or already verified",
      });
    }
    if (Date.now() > existingUser.otpExpiry) {
      return res.status(400).json({
        sucecss: false,
        message: "OTP is Expired",
      });
    }

    existingUser.otp = null;
    existingUser.otpExpiry = null;

    await existingUser.save();
    return res.status(200).json({
      success: true,
      message: "OTP verified",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { email } = req.params;

    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not Found",
      });
    }
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password != confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password do not matched",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;

    await existingUser.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const allUser = await User.find();
    res.status(200).json({
      success: false,
      message: "Oone",
      allUser,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "-password -otp -otpExpiry -token",
    ); // property thats we want to hide
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      sucecss: true,
      message: "Done",
      user,
    });
  } catch (error) {
    res.status(200).json({
      sucecss: true,
      message: error.message,
    });
  }
};

//update profile pic controller
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profilePicUrl = user.profilePic;
    let profilePicId = user.profilePicId;

    // If new image uploaded
    if (req.file) {
      // Upload new image first, then delete old image
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "ecommerce_profiles" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        stream.end(req.file.buffer);
      });

      profilePicUrl = result.secure_url;
      profilePicId = result.public_id;

      if (user.profilePicId) {
        await cloudinary.uploader.destroy(user.profilePicId);
      }
    }

    // Update user

    // 3️⃣ Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...req.body,
        profilePic: profilePicUrl,
        profilePicId: profilePicId,
      },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyExists = user.wishlist.some(
      (itemId) => itemId.toString() === productId,
    );

    if (alreadyExists) {
      user.wishlist = user.wishlist.filter(
        (itemId) => itemId.toString() !== productId,
      );
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    await user.populate("wishlist");

    return res.status(200).json({
      success: true,
      message: alreadyExists
        ? "Product removed from wishlist"
        : "Product added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  registerUser,
  verifyUser,
  reVerify,
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
};

