const categoryService = require("../services/category.service");

const list = async (req, res) => {
  const categories = await categoryService.listCategories(req.query.status);
  res.json(categories);
};

const getBySlug = async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  res.json(category);
};

module.exports = { list, getBySlug };