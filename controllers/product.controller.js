const productService = require("../services/product.service");

const list = async (req, res) => {
  const result = await productService.listProducts(req.query);
  res.json(result);
};

const featured = async (req, res) => {
  const products = await productService.getFeatured(
    Number(req.query.limit) || 8,
  );
  res.json(products);
};

const newArrivals = async (req, res) => {
  const products = await productService.getNewArrivals(
    Number(req.query.limit) || 8,
  );
  res.json(products);
};

const bestsellers = async (req, res) => {
  const products = await productService.getBestsellers(
    Number(req.query.limit) || 8,
  );
  res.json(products);
};

const getBySlug = async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  res.json(product);
};

const related = async (req, res) => {
  const products = await productService.getRelated(
    req.params.product_id,
    Number(req.query.limit) || 6,
  );
  res.json(products);
};

const submitReview = async (req, res) => {
  const result = await productService.createReview(
    req.params.product_id,
    req.user,
    req.body,
  );
  res.status(201).json({ message: "Review submitted successfully", ...result });
};

module.exports = {
  list,
  featured,
  newArrivals,
  bestsellers,
  getBySlug,
  related,
  submitReview,
};
