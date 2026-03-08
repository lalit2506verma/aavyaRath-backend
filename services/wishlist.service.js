const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const getWishlist = async (user_id) => {
  const wishlist = await Wishlist.findOne({ user_id }).lean();
  if (!wishlist) return [];

  const products = await Promise.all(
    wishlist.product_ids.map((id) =>
      Product.findOne({ product_id: id, status: "active" }).lean(),
    ),
  );
  return products.filter(Boolean);
};

const addToWishlist = async (user_id, product_id) => {
  const product = await Product.findOne({ product_id });
  if (!product) {
    const e = new Error("Product not found");
    e.status = 404;
    throw e;
  }
  await Wishlist.updateOne({ user_id }, { $addToSet: { product_ids: product_id } }, { upsert: true });
};

const removeFromWishlist = async (user_id, product_id) => {
  await Wishlist.updateOne({ user_id }, { $pull: { product_ids: product_id } });
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
