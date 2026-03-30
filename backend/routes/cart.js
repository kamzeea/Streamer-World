const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const cartFile = path.join(__dirname, "../data/cart.json");
const productsFile = path.join(__dirname, "../data/products.json");

function getCart() {
  return JSON.parse(fs.readFileSync(cartFile, "utf-8"));
}

function saveCart(cart) {
  fs.writeFileSync(cartFile, JSON.stringify(cart, null, 2));
}

function getProducts() {
  return JSON.parse(fs.readFileSync(productsFile, "utf-8"));
}

// GET /api/cart
// Returns all items currently in the cart
router.get("/", (req, res) => {
  const cart = getCart();
  res.json(cart);
});

// POST /api/cart
// Adds a product to the cart
// Body: { "productId": "SW001", "quantity": 2 }
router.post("/", (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ error: "productId and a positive quantity are required" });
  }

  const products = getProducts();
  const product = products.find((p) => p["Product ID"] === productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const cart = getCart();
  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product["Product ID"],
      name: product["Name"],
      price: product["Price"],
      quantity: quantity,
    });
  }

  saveCart(cart);
  res.json({ message: "Item added to cart", cart });
});

// PUT /api/cart/:productId
// Updates the quantity of an item in the cart
// Body: { "quantity": 3 }
router.put("/:productId", (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "A positive quantity is required" });
  }

  const cart = getCart();
  const item = cart.find((i) => i.productId === req.params.productId);

  if (!item) {
    return res.status(404).json({ error: "Item not in cart" });
  }

  item.quantity = quantity;
  saveCart(cart);
  res.json({ message: "Cart updated", cart });
});

// DELETE /api/cart/:productId
// Removes a specific item from the cart
router.delete("/:productId", (req, res) => {
  let cart = getCart();
  const exists = cart.find((i) => i.productId === req.params.productId);

  if (!exists) {
    return res.status(404).json({ error: "Item not in cart" });
  }

  cart = cart.filter((i) => i.productId !== req.params.productId);
  saveCart(cart);
  res.json({ message: "Item removed from cart", cart });
});

// DELETE /api/cart
// Clears the entire cart
router.delete("/", (req, res) => {
  saveCart([]);
  res.json({ message: "Cart cleared" });
});

module.exports = router;
