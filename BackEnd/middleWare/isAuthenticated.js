import jwt from "jsonwebtoken";
import { User } from "../database/Models/usermodel.js";

const isAuthenticated = async (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).json({
      success: false,
      message: "Token is missing",
      code: "TOKEN_MISSING",
    });
  }
  let decoded;
  try {
    decoded = jwt.verify(authToken, process.env.SECRET_KEY);
  } catch (error) {
    if (error.message == "jwt expired") {
      return res.status(401).json({
        success: false,
        message: "Token is Expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
      code: "TOKEN_INVALID",
    });
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User Not Found",
      code: "USER_NOT_FOUND",
    });
  }

  req.id = user._id;
  req.user = user;
  next();
};

export default isAuthenticated;
