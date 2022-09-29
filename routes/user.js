const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotpassword,
  passwordreset,
  getLoggedInUserDetails,
  changePassword,
  updateUser,
  adminAllUser,
  managerAllUser,
  adminGetOneUser,
  adminUpdateOneUser,
  adminDeleteUser,
} = require("../controller/userController");
const { isLoggedIn, customRole } = require("../middleware/user");

//user only routes
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotpassword);
router.route("/password/reset/:token").post(passwordreset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUser);

//admin only routes
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUser);
router
  .route("/admin/users/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUser)
  .delete(isLoggedIn, customRole("admin"), adminDeleteUser);

//manager only routes
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUser);

module.exports = router;
