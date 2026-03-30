const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const productsFile = path.join(__dirname, "../data/products.json");

function getProducts() {
  return JSON.parse(fs.readFileSync(productsFile, "utf-8"));
}

// GET /api/products
// Returns all products. Optional filters: ?level=Beginner&category=Camera
router.get("/", (req, res) => {
  let products = getProducts();

  if (req.query.level) {
    products = products.filter(
      (p) => p["Skill Level"].toLowerCase() === req.query.level.toLowerCase()
    );
  }

  if (req.query.category) {
    products = products.filter(
      (p) => p["Category"].toLowerCase() === req.query.category.toLowerCase()
    );
  }

  res.json(products);
});

// GET /api/products/:id
// Returns a single product by its Product ID (e.g. SW001)
router.get("/:id", (req, res) => {
  const products = getProducts();
  const product = products.find((p) => p["Product ID"] === req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

module.exports = router;
