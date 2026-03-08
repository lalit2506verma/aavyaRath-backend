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
