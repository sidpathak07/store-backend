const express = require("express");
const router = express.Router();
const {
  sendStripeKey,
  sendRazorpayKey,
  captureRazorpayPayment,
  captureStripePayment,
} = require("../controller/paymentController");
const { isLoggedIn } = require("../middleware/user");

router.route("/stripekey").get(isLoggedIn, sendStripeKey);
router.route("/razorpaykey").get(isLoggedIn, sendRazorpayKey);

router.route("/captureStripe").post(isLoggedIn, captureStripePayment);
router.route("/captureRazorpay").post(isLoggedIn, captureRazorpayPayment);

module.exports = router;
