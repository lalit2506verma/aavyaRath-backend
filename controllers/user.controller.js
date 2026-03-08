const userService = require("../services/user.service");

const getProfile = (req, res) => res.json(userService.getProfile(req.user));

const updateProfile = async (req, res) => {
  await userService.updateProfile(req.user.user_id, req.body);
  res.json({ message: "Profile updated" });
};

const getAddresses = async (req, res) => {
  const addresses = await userService.getAddresses(req.user.user_id);
  res.json({ addresses });
};

const addAddress = async (req, res) => {
  const result = await userService.addAddress(req.user.user_id, req.body);
  res.status(201).json({ message: "Address added", ...result });
};

const deleteAddress = async (req, res) => {
  await userService.deleteAddress(req.user.user_id, req.params.address_id);
  res.json({ message: "Address deleted" });
};

const changePassword = async (req, res) => {
  await userService.changePassword(
    req.user.user_id,
    req.body.old_password,
    req.body.new_password,
  );
  res.json({ message: "Password changed successfully" });
};

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  deleteAddress,
  changePassword,
};
