const User = require("../model/user");
const bigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const mailHelper = require("../utils/mailHelper");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
exports.signup = bigPromise(async (req, res, next) => {
  let result;
  if (!req.files) {
    return next(new CustomError("Please enter photo", 400));
  }

  let photo = req.files.photo;
  result = await cloudinary.uploader.upload(photo.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const { name, email, password } = req.body;
  if (!email || !name || !password) {
    return next(new CustomError("Name email and password are required", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });
  user.password = undefined;
  cookieToken(user, res);
});

exports.login = bigPromise(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new CustomError("Please send email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new CustomError("Email Not Registered", 400));
  }
  const isPasswordCorrect = await user.isValidatedPassword(password);
  if (!isPasswordCorrect) {
    return next(new CustomError("Password does not match"));
  }
  user.password = undefined;
  cookieToken(user, res);
});

exports.logout = bigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "logout success",
  });
});

exports.forgotpassword = bigPromise(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new CustomError("Please enter email", 400));
  }

  const user = await User.findOne({ email });

  const forgotToken = user.getForgotPasswordToken();
  await user.save({ validateBeforeSave: false });
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${forgotToken}`;
  const message = `Copy paste this link in your browser and hit enter \n\n ${myUrl}`;

  try {
    await mailHelper({
      email: user.email,
      subject: "LCO TStore password reset",
      message,
    });
    res.status(200).json({
      success: true,
      message: "Mail sent",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new CustomError(error.message, 400));
  }
});

exports.passwordreset = bigPromise(async (req, res, next) => {
  const token = req.params.token;
  const { password, confirmPassword } = req.body;
  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: encryptedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is invalid or expired", 400));
  }

  // if (password !== confirmPassword) {
  //   return next(
  //     new CustomError("Password and Confirm Password do not match", 400)
  //   );
  // }

  user.password = password;
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;
  await user.save({ validateBeforeSave: false });
  //send a json response or token
  cookieToken(user, res);
});

exports.getLoggedInUserDetails = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = bigPromise(async (req, res, next) => {
  const userId = req.user._id;
  const { password, newPassword } = req.body;

  const user = await User.findById(userId);

  const isValidPassword = user.isValidatedPassword(password);

  if (!isValidPassword) {
    return next(new CustomError("Old password is incorrect", 400));
  }

  user.password = newPassword;
  await user.save();

  cookieToken(user, res);
});

exports.updateUser = bigPromise(async (req, res, next) => {
  const userId = req.user._id;
  let newData = {};
  if ("email" in req.body) {
    newData.email = req.body.email;
  }
  if ("name" in req.body) {
    newData.name = req.body.name;
  }
  if (req.files) {
    let public_id = req.user.photo.id;
    let result = await cloudinary.uploader.destroy(public_id);
    let photo = req.files.photo;
    result = await cloudinary.uploader.upload(photo.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(userId, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

exports.adminAllUser = bigPromise(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminGetOneUser = bigPromise(async (req, res, next) => {
  const uid = req.params.id;

  const user = await User.findById(uid);
  if (!user) {
    return next(new CustomError("No user found", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminUpdateOneUser = bigPromise(async (req, res, next) => {
  const uid = req.params.id;
  let newData = {};
  newData = req.body;
  if (req.files) {
    const user = await User.findById(uid);
    let public_id = user.photo.id;
    let resp = await cloudinary.uploader.destroy(public_id);
    let result = await cloudinary.uploader.upload(photo.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  let user = await User.findByIdAndUpdate(uid, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminDeleteUser = bigPromise(async (req, res, next) => {
  const uid = req.params.id;

  const user = await User.findByIdAndDelete(uid);

  if (!user) {
    return next(new CustomError("No user found", 403));
  }

  let result = await cloudinary.uploader.destroy(user.photo.id);

  res.status(200).json({
    success: true,
    message: "User deleted",
    user,
  });
});

exports.managerAllUser = bigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" }, "name email");

  res.status(200).json({
    success: true,
    users,
  });
});
