const contentService = require("../services/content.service");

const submitContact = async (req, res) => {
  await contentService.submitContact(req.body);
  res.json({
    message: "Thank you for your message. We'll get back to you soon!",
  });
};

const subscribe = async (req, res) => {
  const { already } = await contentService.subscribe(req.body.email);
  res.json({
    message: already
      ? "You're already subscribed!"
      : "Thank you for subscribing!",
  });
};

const getFaqs = async (req, res) => {
  const faqs = await contentService.getFaqs();
  res.json(faqs);
};

const getBlogPosts = async (req, res) => {
  const { category, page = 1, limit = 9 } = req.query;
  const result = await contentService.getBlogPosts({
    category,
    page: Number(page),
    limit: Number(limit),
  });
  res.json(result);
};

const getBlogPost = async (req, res) => {
  const post = await contentService.getBlogPost(req.params.slug);
  res.json(post);
};

module.exports = {
  submitContact,
  subscribe,
  getFaqs,
  getBlogPosts,
  getBlogPost,
};