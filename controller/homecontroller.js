const bigPromise = require("../middleware/bigPromise");

exports.home = bigPromise(async (req, res) => {
  res.status(200).json({ success: "True", greeting: "Hello from API" });
});

exports.homedummy = (req, res) => {
  res.status(200).json({ success: "True", msg: "Dummy route" });
};
