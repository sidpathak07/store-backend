const express = require("express");
const {
  createOrder,
  getOneOrder,
  getLoggedInOrders,
  adminGetAllOrders,
  adminDeleteOrder,
} = require("../controller/orderController");
const { adminDeleteOneProduct } = require("../controller/productController");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middleware/user");

router.route("/createorder").post(isLoggedIn, createOrder);
router.route("/myorders").get(isLoggedIn, getLoggedInOrders);
router.route("/getOneOrder/:id").get(isLoggedIn, getOneOrder);

//admin routes
router
  .route("/adminGetAllOrders")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrders);

router
  .route("/adminDeleteOrder")
  .delete(isLoggedIn, customRole("admin"), adminDeleteOrder);

module.exports = router;
