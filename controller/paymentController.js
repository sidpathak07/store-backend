const bigPromise = require("../middleware/bigPromise");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.sendStripeKey = bigPromise(async (req, res, next) => {
  res.status(200).json({
    stripeKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

exports.sendRazorpayKey = bigPromise(async (req, res, next) => {
  res.status(200).json({
    stripeKey: process.env.RAZORPAY_API_KEY,
  });
});

exports.captureStripePayment = bigPromise(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",

    //optional
    metadata: { integration_check: "accept_a_payment" },
  });

  res.status(200).json({
    success: true,
    client_id: paymentIntent.client_secret,
  });
});

exports.captureRazorpayPayment = bigPromise(async (req, res, next) => {
  var instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  var options = {
    amount: req.body.amount, // amount in the smallest currency unit
    currency: "INR",
  };
  let order = instance.orders.create(options);

  res.status(200).json({
    success: true,
    order,
    amount: req.body.amount,
  });
});
