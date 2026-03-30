const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const cartFile = path.join(__dirname, "../data/cart.json");
const ordersFile = path.join(__dirname, "../data/orders.json");

function getCart() {
  return JSON.parse(fs.readFileSync(cartFile, "utf-8"));
}

function getOrders() {
  return JSON.parse(fs.readFileSync(ordersFile, "utf-8"));
}

function saveOrders(orders) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

function clearCart() {
  fs.writeFileSync(cartFile, JSON.stringify([]));
}

// POST /api/checkout
// Places an order using the current cart contents
// Body: { "name": "John Doe", "email": "john@example.com", "address": "123 Main St" }
router.post("/", (req, res) => {
  const { name, email, address } = req.body;

  if (!name || !email || !address) {
    return res.status(400).json({ error: "name, email, and address are required" });
  }

  const cart = getCart();

  if (cart.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    orderId: "ORD-" + Date.now(),
    customer: { name, email, address },
    items: cart,
    total: parseFloat(total.toFixed(2)),
    date: new Date().toISOString(),
    status: "confirmed",
  };

  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  clearCart();

  res.status(201).json({
    message: "Order placed successfully!",
    order,
  });
});

// GET /api/checkout/orders
// Returns all past orders (useful for an admin view)
router.get("/orders", (req, res) => {
  const orders = getOrders();
  res.json(orders);
});

module.exports = router;
