const express = require("express");
const router = express.Router();

const {
  addProduct,
  getAllProducts,
  adminGetAllProducts,
  getSingleProduct,
  adminDeleteOneProduct,
  adminUpdateOneProduct,
  addReview,
  deleteReview,
  getOnlyReviewsForOneProduct,
} = require("../controller/productController");

const { isLoggedIn, customRole } = require("../middleware/user");

router.route("/products").get(getAllProducts);
router.route("/products/:_id").get(getSingleProduct);
router.route("/productReview/:productId").put(isLoggedIn, addReview);
router.route("/productReview/:productId").delete(isLoggedIn, deleteReview);
router.route("/productReview/:productId").get(getOnlyReviewsForOneProduct);

//admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);

router
  .route("/admin/product/all")
  .get(isLoggedIn, customRole("admin"), adminGetAllProducts);

router
  .route("/admin/product/:_id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneProduct);

module.exports = router;
