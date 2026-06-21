import { Router } from "express";
import { Product } from "../models/Product";
import { Review } from "../models/Review";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

router.get("/products", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const query: Record<string, unknown> = {};
    if (search) query.$text = { $search: search as string };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) (query.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (query.price as Record<string, number>).$lte = Number(maxPrice);
    }

    let sortOption: Record<string, number> = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "top_rated") sortOption = { createdAt: -1 };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    const productsWithRatings = await Promise.all(
      products.map(async (p) => {
        const reviews = await Review.find({ productId: p._id });
        const avgRating = reviews.length
          ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
          : null;
        return { ...p.toObject(), avgRating, reviewCount: reviews.length };
      })
    );

    res.json({ products: productsWithRatings, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/products/featured", async (_req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(12);
    const productsWithRatings = await Promise.all(
      products.map(async (p) => {
        const reviews = await Review.find({ productId: p._id });
        const avgRating = reviews.length
          ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
          : null;
        return { ...p.toObject(), avgRating, reviewCount: reviews.length };
      })
    );
    res.json(productsWithRatings);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/products/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const reviews = await Review.find({ productId: product._id });
    const avgRating = reviews.length
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : null;
    res.json({ ...product.toObject(), avgRating, reviewCount: reviews.length });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/products", adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/products/:productId", adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.productId, req.body, { new: true });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/products/:productId", adminAuth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.productId);
    res.json({ success: true, message: "Product deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
