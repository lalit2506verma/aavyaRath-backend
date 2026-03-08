const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Category = require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const { FAQ } = require("../models/misc");

router.post("/", async (req, res) => {
  try {
    const existing = await Category.countDocuments();
    if (existing > 0) return res.json({ message: "Already seeded" });

    await Category.insertMany([
      {
        category_id: "cat_resin",
        name: "Resin Art",
        slug: "resin-art",
        description: "Handcrafted resin art pieces for your home",
        image: "https://images.unsplash.com/photo-1628072380604-22bcabb71740",
        status: "active",
      },
      {
        category_id: "cat_toys",
        name: "Wooden Toys",
        slug: "wooden-toys",
        description: "Safe, sustainable wooden toys for children",
        image: "https://images.unsplash.com/photo-1707256787102-47c91967ca36",
        status: "active",
      },
      {
        category_id: "cat_vases",
        name: "Flower Vases",
        slug: "flower-vases",
        description: "Elegant wooden and ceramic flower vases",
        image: "https://images.unsplash.com/photo-1618441079655-28413f13113d",
        status: "active",
      },
      {
        category_id: "cat_wall",
        name: "Wall Decor",
        slug: "wall-decor",
        description: "Unique wall art and decorations",
        image: "https://images.unsplash.com/photo-1628072380604-22bcabb71740",
        status: "active",
      },
      {
        category_id: "cat_gifts",
        name: "Gift Sets",
        slug: "gift-sets",
        description: "Curated gift collections for every occasion",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
        status: "active",
      },
    ]);

    await Product.insertMany([
      {
        product_id: "prod_001",
        name: "Ocean Wave Resin Coasters",
        slug: "ocean-wave-resin-coasters",
        sku: "RES-COAST-001",
        short_description: "Set of 4 handcrafted ocean-inspired resin coasters",
        images: [
          "https://images.unsplash.com/photo-1628072380604-22bcabb71740",
        ],
        category_id: "cat_resin",
        tags: ["coasters", "ocean", "resin"],
        price: 1299,
        compare_at_price: 1599,
        stock: 25,
        specifications: [
          { key: "Material", value: "Epoxy Resin" },
          { key: "Set Contains", value: "4 Coasters" },
        ],
        status: "active",
        is_featured: true,
        is_new_arrival: true,
        is_sale: true,
        rating_average: 4.8,
        rating_count: 24,
        sales_count: 156,
      },
      {
        product_id: "prod_002",
        name: "Wooden Stacking Rainbow",
        slug: "wooden-stacking-rainbow",
        sku: "TOY-RAIN-001",
        short_description: "Montessori-style wooden rainbow stacker",
        images: [
          "https://images.unsplash.com/photo-1707256787102-47c91967ca36",
        ],
        category_id: "cat_toys",
        tags: ["montessori", "wooden", "rainbow"],
        price: 1899,
        stock: 18,
        specifications: [
          { key: "Material", value: "Beechwood" },
          { key: "Age", value: "1+ years" },
        ],
        status: "active",
        is_featured: true,
        rating_average: 4.9,
        rating_count: 42,
        sales_count: 234,
      },
      {
        product_id: "prod_003",
        name: "Minimalist Wooden Vase",
        slug: "minimalist-wooden-vase",
        sku: "VASE-WOOD-001",
        short_description: "Hand-turned mango wood vase",
        images: [
          "https://images.unsplash.com/photo-1618441079655-28413f13113d",
        ],
        category_id: "cat_vases",
        tags: ["vase", "wooden", "minimalist"],
        price: 2499,
        compare_at_price: 2999,
        stock: 12,
        status: "active",
        is_featured: true,
        is_new_arrival: true,
        is_sale: true,
        rating_average: 4.7,
        rating_count: 18,
        sales_count: 89,
      },
      {
        product_id: "prod_004",
        name: "Macrame Wall Hanging",
        slug: "macrame-wall-hanging",
        sku: "WALL-MAC-001",
        short_description: "Handwoven bohemian macrame wall art",
        images: [
          "https://images.unsplash.com/photo-1628072380604-22bcabb71740",
        ],
        category_id: "cat_wall",
        tags: ["macrame", "bohemian"],
        price: 1799,
        stock: 8,
        status: "active",
        is_new_arrival: true,
        rating_average: 4.6,
        rating_count: 31,
        sales_count: 167,
      },
      {
        product_id: "prod_005",
        name: "Wooden Animal Puzzle Set",
        slug: "wooden-animal-puzzle-set",
        sku: "TOY-PUZ-001",
        short_description: "5-piece chunky wooden animal puzzles",
        images: [
          "https://images.unsplash.com/photo-1707256787102-47c91967ca36",
        ],
        category_id: "cat_toys",
        tags: ["puzzle", "toddler"],
        price: 999,
        compare_at_price: 1299,
        stock: 32,
        status: "active",
        is_featured: true,
        is_sale: true,
        rating_average: 4.8,
        rating_count: 56,
        sales_count: 312,
      },
      {
        product_id: "prod_006",
        name: "Geode Resin Tray",
        slug: "geode-resin-tray",
        sku: "RES-TRAY-001",
        short_description: "Large agate-inspired resin serving tray",
        images: [
          "https://images.unsplash.com/photo-1628072380604-22bcabb71740",
        ],
        category_id: "cat_resin",
        tags: ["tray", "geode", "gold"],
        price: 3499,
        stock: 6,
        status: "active",
        is_featured: true,
        is_new_arrival: true,
        rating_average: 5.0,
        rating_count: 12,
        sales_count: 45,
      },
      {
        product_id: "prod_007",
        name: "Artisan Gift Box",
        slug: "artisan-gift-box",
        sku: "GIFT-BOX-001",
        short_description: "Curated gift set with coasters, candle, and soap",
        images: [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
        ],
        category_id: "cat_gifts",
        tags: ["gift", "candle"],
        price: 2299,
        compare_at_price: 2799,
        stock: 15,
        status: "active",
        is_featured: true,
        is_sale: true,
        rating_average: 4.9,
        rating_count: 38,
        sales_count: 189,
      },
      {
        product_id: "prod_008",
        name: "Terracotta Wall Planters Set",
        slug: "terracotta-wall-planters-set",
        sku: "WALL-PLANT-001",
        short_description: "Set of 3 handmade terracotta wall planters",
        images: [
          "https://images.unsplash.com/photo-1618441079655-28413f13113d",
        ],
        category_id: "cat_wall",
        tags: ["planter", "terracotta"],
        price: 1599,
        stock: 20,
        status: "active",
        is_new_arrival: true,
        rating_average: 4.5,
        rating_count: 22,
        sales_count: 98,
      },
    ]);

    await FAQ.insertMany([
      {
        faq_id: "faq_001",
        category: "Orders",
        question: "How can I track my order?",
        answer:
          "Once your order is shipped, you'll receive an email with your tracking number and courier partner details.",
      },
      {
        faq_id: "faq_002",
        category: "Shipping",
        question: "What are the shipping charges?",
        answer:
          "Free shipping on orders above ₹999. Flat ₹99 for orders below that.",
      },
      {
        faq_id: "faq_003",
        category: "Returns",
        question: "What is your return policy?",
        answer:
          "We accept returns within 7 days of delivery for unused items in original packaging.",
      },
      {
        faq_id: "faq_004",
        category: "Products",
        question: "Are your products eco-friendly?",
        answer:
          "Yes! We use sustainably sourced wood, eco-friendly resins, and recyclable packaging.",
      },
      {
        faq_id: "faq_005",
        category: "Payments",
        question: "What payment methods do you accept?",
        answer: "UPI, credit/debit cards, net banking, and cash on delivery.",
      },
    ]);

    await User.create({
      user_id: "user_admin001",
      email: "admin@artisanhome.com",
      name: "Admin",
      phone: "9999999999",
      password_hash: await bcrypt.hash("Admin@123", 10),
      role: "superadmin",
    });

    await Coupon.create({
      coupon_id: "coupon_welcome",
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      min_order_value: 500,
      max_discount_cap: 200,
      usage_limit: 100,
      valid_from: new Date(),
      valid_to: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      is_active: true,
    });

    res.json({ message: "Database seeded successfully" });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ detail: "Seeding failed", error: err.message });
  }
});

module.exports = router;