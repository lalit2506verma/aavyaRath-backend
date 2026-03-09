const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");

const makeId = () => `user_${uuidv4().replace(/-/g, "").slice(0, 12)}`;

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    const err = new Error("Server misconfigured: JWT_SECRET is not set");
    err.status = 500;
    throw err;
  }
  return "dev_jwt_secret_change_me";
};

const createToken = (user_id, role) =>
  jwt.sign({ user_id, role }, getJwtSecret(), { expiresIn: "24h" });

const formatUser = (u) => ({
  user_id: u.user_id,
  email: u.email,
  name: u.name,
  role: u.role,
  profile_image: u.profile_image,
});

/**
 * register({ email, name, password, phone })
 * Creates a new customer account and returns a JWT.
 */
const register = async ({ email, name, password, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("This email is already registered");
    err.status = 409;
    throw err;
  }

  const user_id = makeId();
  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    user_id,
    email,
    name,
    phone,
    password_hash,
    role: "customer",
  });

  return { token: createToken(user_id, "customer"), user: formatUser(user) };
};

/**
 * login({ email, password })
 */
const login = async ({ email, password }) => {
  const normalizedEmail = (email || "").toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).lean();

  const valid =
    user && (await bcrypt.compare(password, user.password_hash || ""));
  if (!valid) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }
  if (!user.is_active) {
    const err = new Error("Account is suspended");
    err.status = 401;
    throw err;
  }

  return {
    token: createToken(user.user_id, user.role),
    user: formatUser(user),
  };
};

/**
 * exchangeSession(session_id)
 * Exchanges an Emergent OAuth session for an app JWT.
 */
const exchangeSession = async (session_id) => {
  let oauthData;
  try {
    const res = await axios.get(
      "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
      { headers: { "X-Session-ID": session_id } },
    );
    oauthData = res.data;
  } catch {
    const err = new Error("Invalid or expired session");
    err.status = 401;
    throw err;
  }

  const { email, name, picture } = oauthData;
  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    user = await User.create({
      user_id: makeId(),
      email,
      name,
      profile_image: picture,
      role: "customer",
    });
  } else if (picture && picture !== user.profile_image) {
    user.profile_image = picture;
    await user.save();
  }

  return {
    token: createToken(user.user_id, user.role),
    user: formatUser(user),
  };
};

module.exports = { register, login, exchangeSession };
