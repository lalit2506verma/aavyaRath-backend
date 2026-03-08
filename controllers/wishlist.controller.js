const wishlistService = require("../services/wishlist.service");

const getWishlist = async (req, res) => {
  const items = await wishlistService.getWishlist(req.user.user_id);
  res.json({ items });
};

const addToWishlist = async (req, res) => {
  await wishlistService.addToWishlist(req.user.user_id, req.params.product_id);
  res.json({ message: "Added to wishlist" });
};

const removeFromWishlist = async (req, res) => {
  await wishlistService.removeFromWishlist(
    req.user.user_id,
    req.params.product_id,
  );
  res.json({ message: "Removed from wishlist" });
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };