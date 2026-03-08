const { v4: uuidv4 } = require("uuid");
const { Contact, Newsletter, FAQ, BlogPost } = require("../models/misc");

const submitContact = async (data) => {
  await Contact.create({
    contact_id: `contact_${uuidv4().replace(/-/g, "").slice(0, 12)}`,
    ...data,
    status: "new",
  });
};

const subscribe = async (email) => {
  const existing = await Newsletter.findOne({ email });
  if (existing) return { already: true };
  await Newsletter.create({ email });
  return { already: false };
};

const getFaqs = () => FAQ.find().lean();

const getBlogPosts = async ({ category, page, limit }) => {
  const query = { status: "published" };
  if (category) query.category = category;
  const skip = (page - 1) * limit;
  const [total, posts] = await Promise.all([
    BlogPost.countDocuments(query),
    BlogPost.find(query)
      .sort({ published_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);
  return { posts, total, page, pages: Math.ceil(total / limit) };
};

const getBlogPost = async (slug) => {
  const post = await BlogPost.findOne({ slug }).lean();
  if (!post) {
    const e = new Error("Post not found");
    e.status = 404;
    throw e;
  }
  return post;
};

module.exports = {
  submitContact,
  subscribe,
  getFaqs,
  getBlogPosts,
  getBlogPost,
};
