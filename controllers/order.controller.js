const orderService = require("../services/order.service");

const placeOrder = async (req, res) => {
  const result = await orderService.placeOrder(req.user, req.body);
  res.status(201).json(result);
};

const listOrders = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const result = await orderService.getOrders(req.user.user_id, {
    status,
    page: Number(page),
    limit: Number(limit),
  });
  res.json(result);
};

const getOrder = async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.order_id,
    req.user.user_id,
  );
  res.json(order);
};

/**
 * getTracking — public endpoint
 * Buyer can check status + tracking number without logging in.
 * Accepts order_id OR order_number in the URL param.
 */
const getTracking = async (req, res) => {
  const result = await orderService.getTracking(req.params.order_id);
  res.json(result);
};

module.exports = { placeOrder, listOrders, getOrder, getTracking };