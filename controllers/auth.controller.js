const authService = require("../services/auth.service");

const register = async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
};

const login = async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
};

const getMe = (req, res) => {
  const u = req.user;
  res.json({
    user_id: u.user_id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    role: u.role,
    profile_image: u.profile_image,
    saved_addresses: u.saved_addresses || [],
  });
};

const exchangeSession = async (req, res) => {
  const { session_id } = req.body;
  if (!session_id)
    return res.status(400).json({ detail: "session_id is required" });
  const result = await authService.exchangeSession(session_id);
  res.json(result);
};

const forgotPassword = async (req, res) => {
  // TODO: generate reset token, save to DB, email the user a link
  res.json({
    message: "If this email is registered, you will receive a reset link.",
  });
};

const resetPassword = async (req, res) => {
  // TODO: verify token, update password
  res.json({ message: "Password reset successfully" });
};

module.exports = {
  register,
  login,
  getMe,
  exchangeSession,
  forgotPassword,
  resetPassword,
};
