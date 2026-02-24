const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No token",
        success: false
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  

    req.user = decoded;             
    req.schoolId = decoded.schoolId; 
    req.role = decoded.role;     

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        message: "Unauthorized - Token expired or invalid",
        success: false
      });
    }
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};

exports.refreshTokenMidddlware = (req, res, next) => {
  try {
    const token = req.cookies.refresh_token;
   

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No Refresh-token",
        success: false
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.user = decoded;
    req.refreshToken = token;

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        message: "Unauthorized - Refresh Token expired or invalid",
        success: false
      });
    }
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};




exports.tenant = (req, res, next) => {
  if (req.role === "SUPER_ADMIN") {
    return next();
  }

  if (!req.schoolId) {
    return res.status(403).json({
      success: false,
      message: "School context missing"
    });
  }

  next();
};


exports.allow = (role) => {
  return (req, res, next) => {
    if (req.role !== 'SUPER_ADMIN') { 
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}


