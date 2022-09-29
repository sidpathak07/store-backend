const bigPromise = require("../middleware/bigPromise");
const Product = require("../model/product");
const Order = require("../model/order");
const CustomError = require("../utils/customError");

exports.createOrder = bigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;
  const user = req.user._id;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(new CustomError("Please check order id", 401));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

exports.getLoggedInOrders = bigPromise(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

//admin controllers
exports.adminGetAllOrders = bigPromise(async (req, res, next) => {
  const orders = await Order.find({ orderStatus: { $ne: "delivered" } });

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === "delivered") {
    return next(new CustomError("Order is delivered", 401));
  }

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (item) => {
    updateStock(item.product, item.quantity);
  });

  res.status(200).json({
    success: true,
    orders,
  });
});

const updateStock = async (productId, quantity) => {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
};

exports.adminDeleteOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  order.orderItems.forEach(async (item) => {
    updateStockAfterDeleteOrder(item.product, item.quantity);
  });

  let deletedOrder = await Order.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    deletedOrder,
  });
});

const updateStockAfterDeleteOrder = async (productId, quantity) => {
  const product = await Product.findById(productId);

  product.stock = product.stock + quantity;

  await product.save({ validateBeforeSave: false });
};
