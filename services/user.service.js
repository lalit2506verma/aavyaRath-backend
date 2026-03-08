const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");

const getProfile = (user) => ({
  user_id: user.user_id,
  email: user.email,
  name: user.name,
  phone: user.phone,
  role: user.role,
  profile_image: user.profile_image,
  saved_addresses: user.saved_addresses || [],
});

const updateProfile = async (user_id, updates) => {
  const allowed = ["name", "phone", "date_of_birth"];
  const data = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) data[key] = updates[key];
  }
  await User.updateOne({ user_id }, { $set: data });
};

const getAddresses = async (user_id) => {
  const user = await User.findOne({ user_id }).lean();
  return user?.saved_addresses || [];
};

const addAddress = async (user_id, addressData) => {
  const address_id = `addr_${uuidv4().replace(/-/g, "").slice(0, 8)}`;
  await User.updateOne(
    { user_id },
    { $push: { saved_addresses: { address_id, ...addressData } } },
  );
  return { address_id };
};

const deleteAddress = async (user_id, address_id) => {
  await User.updateOne(
    { user_id },
    { $pull: { saved_addresses: { address_id } } },
  );
};

const changePassword = async (user_id, old_password, new_password) => {
  const user = await User.findOne({ user_id });
  if (user.password_hash) {
    const valid = await bcrypt.compare(old_password, user.password_hash);
    if (!valid) {
      const e = new Error("Current password is incorrect");
      e.status = 400;
      throw e;
    }
  }
  user.password_hash = await bcrypt.hash(new_password, 10);
  await user.save();
};

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  deleteAddress,
  changePassword,
};
