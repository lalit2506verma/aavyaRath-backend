const { v4: uuidv4 } = require("uuid");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const makeCartId = () => `cart_${uuidv4().replace(/-/g, "").slice(0, 12)}`;

// Populate cart items with live product data and calculate subtotal
const buildResponse = async (cart) => {
  let subtotal = 0;
  const items = [];

  for (const item of cart.items) {
    const product = await Product.findOne({
      product_id: item.product_id,
    }).lean();
    if (!product) continue;
    const total = product.price * item.quantity;
    items.push({
      product_id: product.product_id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || null,
      price: product.price,
      quantity: item.quantity,
      total,
      stock: product.stock,
    });
    subtotal += total;
  }

  return { cart_id: cart.cart_id, items, subtotal };
};

const findCart = async (user_id, cart_id) => {
  if (user_id) return Cart.findOne({ user_id });
  if (cart_id) return Cart.findOne({ cart_id });
  return null;
};

const getCart = async (user_id, cart_id) => {
  const cart = await findCart(user_id, cart_id);
  if (!cart) return { cart_id: null, items: [], subtotal: 0 };
  return buildResponse(cart);
};

const addItem = async (user_id, guest_cart_id, { product_id, quantity }) => {
  const product = await Product.findOne({ product_id });
  if (!product) {
    const e = new Error("Product not found");
    e.status = 404;
    throw e;
  }
  if (product.stock < quantity) {
    const e = new Error(`Only ${product.stock} units available`);
    e.status = 400;
    throw e;
  }

  let cart = await findCart(user_id, guest_cart_id);
  if (!cart) {
    cart = await Cart.create({
      cart_id: makeCartId(),
      user_id: user_id || null,
      items: [],
    });
  }

  const idx = cart.items.findIndex((i) => i.product_id === product_id);
  if (idx >= 0) {
    const newQty = cart.items[idx].quantity + quantity;
    if (newQty > product.stock) {
      const e = new Error(`Cannot exceed available stock (${product.stock})`);
      e.status = 400;
      throw e;
    }
    cart.items[idx].quantity = newQty;
  } else {
    cart.items.push({ product_id, quantity });
  }

  await cart.save();
  return { cart_id: cart.cart_id };
};

const updateItem = async (user_id, product_id, quantity) => {
  const cart = await Cart.findOne({ user_id });
  if (!cart) {
    const e = new Error("Cart not found");
    e.status = 404;
    throw e;
  }

  const idx = cart.items.findIndex((i) => i.product_id === product_id);
  if (idx >= 0) {
    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      const product = await Product.findOne({ product_id });
      if (product && quantity > product.stock) {
        const e = new Error(`Only ${product.stock} units available`);
        e.status = 400;
        throw e;
      }
      cart.items[idx].quantity = quantity;
    }
  }

  await cart.save();
};

const removeItem = async (user_id, product_id) => {
  const cart = await Cart.findOne({ user_id });
  if (!cart) {
    const e = new Error("Cart not found");
    e.status = 404;
    throw e;
  }
  cart.items = cart.items.filter((i) => i.product_id !== product_id);
  await cart.save();
};

module.exports = { getCart, addItem, updateItem, removeItem };