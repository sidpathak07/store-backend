const cookieParser = require("cookie-parser");
const express = require("express");
const morgan = require("morgan");
const app = express();
const fileupload = require("express-fileupload");

app.set("view engine", "ejs");

//regular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookies and fileupload middleware
app.use(cookieParser());
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

//morgran middleware
app.use(morgan("tiny"));

//import all routes here
const home = require("./routes/home");
const user = require("./routes/user");
const product = require("./routes/product");
const payment = require("./routes/payment");
const order = require("./routes/order");
//router middleware
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", payment);
app.use("/api/v1", order);

app.get("/signuptest", (req, res) => {
  res.render("signup");
});

module.exports = app;
