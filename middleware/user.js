const User = require("../model/user");
const CustomError = require("../utils/customError");
const bigPromise = require("./bigPromise");
const jwt = require("jsonwebtoken");
exports.isLoggedIn = bigPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization").replace("Bearer ", "");
  if (!token) {
    return next(new CustomError("Login to access page", 401));
  }

  const decode = await jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decode.id);
  req.user = user;

  next();
});

exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError(`You are not allowed to access this resource`, 403)
      );
    }
    next();
  };
};
