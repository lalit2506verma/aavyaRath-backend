const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    contact_id: { type: String, unique: true },
    name: String,
    email: String,
    subject: String,
    message: String,
    status: { type: String, default: "new" },
  },
  { timestamps: { createdAt: "created_at" } },
);

const NewsletterSchema = new mongoose.Schema(
  { email: { type: String, required: true, unique: true, lowercase: true } },
  { timestamps: { createdAt: "subscribed_at" } },
);

const FAQSchema = new mongoose.Schema(
  {
    faq_id: { type: String, unique: true },
    category: String,
    question: String,
    answer: String,
  },
  { _id: false },
);

const BlogPostSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: String,
    excerpt: String,
    content: String,
    featured_image: String,
    category: String,
    status: { type: String, default: "published" },
  },
  { timestamps: { createdAt: "published_at", updatedAt: "updated_at" } },
);

module.exports = {
  Contact: mongoose.model("Contact", ContactSchema),
  Newsletter: mongoose.model("Newsletter", NewsletterSchema),
  FAQ: mongoose.model("FAQ", FAQSchema),
  BlogPost: mongoose.model("BlogPost", BlogPostSchema),
};
