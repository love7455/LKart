const isAdmin = async (req, res, next) => {
  if (req.user && req.user.role == "admin") {
    next();
  } else {
    res.status(500).json({
      success: false,
      message: "Access denied",
    });
  }
};

export default isAdmin;
