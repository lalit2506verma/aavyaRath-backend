const paymentService = require("../services/payment.service");

const createOrder = async (req, res) => {
  const result = await paymentService.createPaymentOrder(req.body);
  res.json(result);
};

const verifyPayment = async (req, res) => {
  await paymentService.verifyPayment({
    ...req.body,
    user_id: req.user.user_id,
  });
  res.json({ status: "success", message: "Payment verified" });
};

module.exports = { createOrder, verifyPayment };