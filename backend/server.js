const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const checkoutRoutes = require("./routes/checkout");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Routes — the frontend will call these URLs
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);

app.get("/", (req, res) => {
  res.send("Streamer World backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
