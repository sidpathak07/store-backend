const bigPromise = require("../middleware/bigPromise");
const Product = require("../model/product");
const CustomError = require("../utils/customError");
const WhereClause = require("../utils/WhereClause");
const cloudinary = require("cloudinary").v2;

// exports.addProduct = bigPromise(async (req, res, next) => {
//   let productImages = req.files.productImages;
//   let photos = [];
//   const prom = [];
//   if (!req.files) {
//     next(new CustomError("Images required", 400));
//   }
//   for (let i = 0; i < productImages.length; i++) {
//     const uploadtask = cloudinary.uploader.upload(
//       productImages[i].tempFilePath,
//       {
//         folder: "productImages",
//       }
//     );
//     prom.push(uploadtask);
//     uploadtask
//       .then((result) => {
//         let data = {
//           id: result.public_id,
//           secure_url: result.secure_url,
//         };
//         photos.push(data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
//   Promise.all(prom)
//     .then(() => {
//       delete req.body.productImages;
//       req.body.photos = photos;
//       Product.create(req.body)
//         .then((user) => {
//           res.status(200).json({
//             success: true,
//             user,
//           });
//         })
//         .catch((err) => next(new CustomError(err, 400)));
//     })
//     .catch((err) => {
//       console.log("ERROR", err);
//     });
// });

exports.addProduct = bigPromise(async (req, res, next) => {
  //
  let photos = [];
  if (req.files) {
    for (let i = 0; i < req.files.photos.length; i++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[i].tempFilePath,
        {
          folder: "Product Images",
        }
      );
      let data = {
        id: result.public_id,
        secure_url: result.secure_url,
      };
      photos.push(data);
    }
  }
  console.log(photos);
  req.body.photos = photos;

  let product = await Product.create(req.body);
  if (!product) {
    return next(new CustomError("Failed to create product", 400));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProducts = bigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const totalCountProduct = await Product.countDocuments();

  let productObj = new WhereClause(Product.find(), req.query).search().filter();

  let products = await productObj.base;
  const filteredProductCount = products.length;
  productObj.pager(resultPerPage);
  products = await productObj.base.clone();
  res.status(200).json({
    products,
    filteredProductCount,
  });
});

exports.getSingleProduct = bigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params._id);

  if (!product) {
    return next(new CustomError("No product found", 401));
  }

  res.status(200).json({
    product,
  });
});

exports.addReview = bigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  let product = await Product.findById(productId);
  console.log(req.user._id);
  let review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  let alreadyReviewed = product.reviews.find(
    (rev) => rev.user.toString() == req.user._id.toString()
  );

  if (alreadyReviewed) {
    product.reviews.forEach((revi) => {
      if (revi.user.toString() == req.user._id.toString()) {
        revi.comment = comment;
        revi.rating = Number(rating);
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.numberOfReviews.length;
  }

  product.ratings =
    product.reviews.reduce((avg, item) => avg + item.rating, 0) /
    product.reviews.length;

  //save
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

exports.deleteReview = bigPromise(async (req, res, next) => {
  const { productId } = req.params;
  const userid = req.user._id;
  // console.log(req.user._id);
  let product = await Product.findById(productId);
  if (product) {
    let reviews = product.reviews.filter(
      (rev) => rev.user.toString() != userid.toString()
    );
    let numberOfReviews = reviews.length;

    let rating =
      product.reviews.reduce((avg, rev) => avg + rev.rating, 0) /
      product.reviews.length;
    product = await Product.findByIdAndUpdate(
      productId,
      {
        reviews,
        numberOfReviews,
        rating,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
    res.status(200).json({
      success: true,
    });
  } else {
    return next(new CustomError("Product Not Found", 401));
  }
});

exports.getOnlyReviewsForOneProduct = bigPromise(async (req, res, next) => {
  let { productId } = req.params;

  let productReviews = await Product.findById(productId, "reviews");

  res.status(200).json({
    success: true,
    reviews: productReviews,
  });
});

//admin only controllers
exports.adminGetAllProducts = bigPromise(async (req, res, next) => {
  let products = await Product.find();
  res.status(200).json({
    products,
  });
});

exports.adminUpdateOneProduct = bigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params._id);
  if (!product) {
    return next(new CustomError("Product Not Found", 400));
  }
  let photos = product.photos;
  console.log("Before update", photos.length);
  if (req.body.delPhotos) {
    let delPhotos = req.body.delPhotos;
    delPhotos = delPhotos.replace("[", "");
    delPhotos = delPhotos.replace("]", "");
    delPhotos = delPhotos.split(",");
    console.log(delPhotos);

    for (let i = 0; i < delPhotos.length; i++) {
      let result = await cloudinary.uploader.destroy(delPhotos[i]);
      console.log(result.result, delPhotos[i]);
      if (result.result == "ok")
        photos = photos.filter((photo) => photo.id != delPhotos[i]);
    }
  }

  if (req.files) {
    for (let i = 0; i < req.files.photos.length; i++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[i].tempFilePath,
        {
          folder: "Product Images",
        }
      );
      let data = {
        id: result.public_id,
        secure_url: result.secure_url,
      };
      photos.push(data);
    }
  }
  req.body.photos = photos;
  console.log(photos.length);
  product = await Product.findByIdAndUpdate(req.params._id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    product,
  });
});

exports.adminDeleteOneProduct = bigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params._id);
  if (!product) {
    return next(new CustomError("No product found", 401));
  }
  let photos = product.photos;

  for (let i = 0; i < photos.length; i++) {
    let result = await cloudinary.uploader.destroy(photos[i].id);
  }

  let prod = await Product.findByIdAndDelete(req.params._id);
  console.log(prod);
  res.status(200).json({
    success: true,
    message: "Product Deleted!!",
  });
});
