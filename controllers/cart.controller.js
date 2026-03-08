const cartService = require("../services/cart.service");

const getCart = async (req, res) => {
  const result = await cartService.getCart(
    req.user?.user_id,
    req.query.cart_id,
  );
  res.json(result);
};

const addItem = async (req, res) => {
  const result = await cartService.addItem(
    req.user?.user_id,
    req.query.cart_id,
    req.body,
  );
  res.json({ message: "Item added to cart", ...result });
};

const updateItem = async (req, res) => {
  await cartService.updateItem(
    req.user.user_id,
    req.params.product_id,
    req.body.quantity,
  );
  res.json({ message: "Cart updated" });
};

const removeItem = async (req, res) => {
  await cartService.removeItem(req.user.user_id, req.params.product_id);
  res.json({ message: "Item removed from cart" });
};

module.exports = { getCart, addItem, updateItem, removeItem };