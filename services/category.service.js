const Category = require("../models/Category");
const category = require("../models/Category");
const Product = require("../models/Product");

const withProductCount = async (cat) => {
  const product_count = await Product.countDocuments({
    category_id: cat.category_id,
    status: "active",
  });
  return { ...cat, product_count };
};

const listCategories = async (status) => {
  const query = {};
  if (status) query.status = status;
  const categories = await Category.find(query).lean();
  return Promise.all(categories.map(withProductCount));
};

const getCategoryBySlug = async (slug) => {
  const cat = await Category.findOne({ slug }).lean();
  if (!cat) {
    const err = new Error("Category not found");
    err.status = 404;
    throw err;
  }

  return withProductCount(cat);
};

module.exports = { listCategories, getCategoryBySlug };