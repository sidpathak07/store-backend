const mongoose = require("mongoose");

const connectWithDb = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((res) => {
      console.log("DB CONNECTED");
    })
    .catch((err) => {
      console.log("DB CONNECTION FAIL");
      console.log(err);
      process.exit(1);
    });
};

module.exports = connectWithDb;
