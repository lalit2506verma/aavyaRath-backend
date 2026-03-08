const { v4: uuidv4 } = require("uuid");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Review = require("../models/Review");

// Attach category name/slug to a product object
const enrichProduct = async (product) => {
  const cat = await Category.findOne({
    category_id: product.category_id,
  }).lean();
  return {
    ...product,
    category_name: cat?.name || null,
    category_slug: cat?.slug || null,
  };
};

const notFound = () => {
  const e = new Error("Product not found");
  e.status = 404;
  return e;
};

const SORT_MAP = {
  newest: { created_at: -1 },
  oldest: { created_at: 1 },
  "price-low": { price: 1 },
  "price-high": { price: -1 },
  bestseller: { sales_count: -1 },
  rating: { rating_average: -1 },
};

const listProducts = async ({
  category,
  search,
  min_price,
  max_price,
  in_stock,
  sort,
  page,
  limit,
}) => {
  const query = { status: "active" };

  if (category) {
    const cat = await Category.findOne({ slug: category }).lean();
    if (cat) query.category_id = cat.category_id;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $in: [search.toLowerCase()] } },
    ];
  }

  if (min_price !== undefined || max_price !== undefined) {
    query.price = {};
    if (min_price !== undefined) query.price.$gte = min_price;
    if (max_price !== undefined) query.price.$lte = max_price;
  }

  if (in_stock) query.stock = { $gt: 0 };

  const skip = (page - 1) * limit;
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(SORT_MAP[sort] || SORT_MAP.newest)
    .skip(skip)
    .limit(limit)
    .lean();
  const enriched = await Promise.all(products.map(enrichProduct));

  return { products: enriched, total, page, pages: Math.ceil(total / limit) };
};

const getFeatured = async (limit) =>
  Promise.all(
    (
      await Product.find({ status: "active", is_featured: true })
        .limit(limit)
        .lean()
    ).map(enrichProduct),
  );

const getNewArrivals = async (limit) =>
  Promise.all(
    (
      await Product.find({ status: "active", is_new_arrival: true })
        .sort({ created_at: -1 })
        .limit(limit)
        .lean()
    ).map(enrichProduct),
  );

const getBestsellers = async (limit) =>
  Promise.all(
    (
      await Product.find({ status: "active" })
        .sort({ sales_count: -1 })
        .limit(limit)
        .lean()
    ).map(enrichProduct),
  );

const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug, status: "active" }).lean();
  if (!product) throw notFound();

  const [enriched, reviews] = await Promise.all([
    enrichProduct(product),
    Review.find({ product_id: product.product_id })
      .sort({ created_at: -1 })
      .limit(10)
      .lean(),
  ]);

  return { ...enriched, reviews };
};

const getRelated = async (product_id, limit) => {
  const product = await Product.findOne({ product_id }).lean();
  if (!product) throw notFound();

  return Product.find({
    category_id: product.category_id,
    product_id: { $ne: product_id },
    status: "active",
  })
    .limit(limit)
    .lean();
};

const createReview = async (product_id, user, { rating, title, body }) => {
  const product = await Product.findOne({ product_id });
  if (!product) throw notFound();

  const review_id = `review_${uuidv4().replace(/-/g, "").slice(0, 12)}`;

  try {
    await Review.create({
      review_id,
      product_id,
      user_id: user.user_id,
      user_name: user.name,
      rating,
      title,
      body,
    });
  } catch (err) {
    if (err.code === 11000) {
      const e = new Error("You have already reviewed this product");
      e.status = 409;
      throw e;
    }
    throw err;
  }

  // Recalculate average rating
  const all = await Review.find({ product_id });
  product.rating_average =
    Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) / 10;
  product.rating_count = all.length;
  await product.save();

  return { review_id };
};

module.exports = {
  listProducts,
  getFeatured,
  getNewArrivals,
  getBestsellers,
  getProductBySlug,
  getRelated,
  createReview,
};