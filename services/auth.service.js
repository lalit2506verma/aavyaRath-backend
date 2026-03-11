const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
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
 * googleAuth({ id_token })
 *
 * Verifies a Google ID token issued by the frontend (e.g. via
 * @react-oauth/google or accounts.google.com/gsi/client).
 *
 * Flow:
 *   1. Frontend calls Google Sign-In → receives credential (id_token)
 *   2. Frontend POSTs { id_token } to POST /api/auth/google
 *   3. Backend verifies token with google-auth-library
 *   4. Creates user if first login, otherwise updates profile picture
 *   5. Returns app JWT — same shape as email/password login
 *
 * Required env var: GOOGLE_CLIENT_ID
 */
const googleAuth = async ({ id_token }) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    const err = new Error("Server misconfigured: GOOGLE_CLIENT_ID is not set");
    err.status = 500;
    throw err;
  }

  // Verify the token against your Google client ID
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    const err = new Error("Invalid or expired Google token");
    err.status = 401;
    throw err;
  }

  const { email, name, picture, email_verified } = payload;

  if (!email_verified) {
    const err = new Error("Google account email is not verified");
    err.status = 401;
    throw err;
  }

  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // First time Google login — create account (no password_hash)
    user = await User.create({
      user_id: makeId(),
      email: email.toLowerCase(),
      name,
      profile_image: picture,
      role: "customer",
    });
  } else {
    // Returning user — keep profile picture in sync if it changed
    if (picture && picture !== user.profile_image) {
      user.profile_image = picture;
      await user.save();
    }
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

module.exports = { register, login, googleAuth };
