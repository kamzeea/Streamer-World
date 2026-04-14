const { useState, useEffect, useCallback } = React;

const API = "/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_ICONS = {
  "Camera": "📷",
  "Audio": "🎙️",
  "Controller": "🎮",
  "Lighting": "💡",
  "Capture Card": "📹",
  "Accessory": "🔧",
};

// Products marked as deals: { productId: discountPercent }
const DEALS = {
  "SW004": 15,    // Blue Yeti
  "SW007": 10,    // Key Light Air
  "SW0010": 20,   // Live Gamer Mini
};

// Curated starter kits aligned with $500–$1000 budget range from proposal
const STARTER_KITS = [
  {
    id: "starter",
    name: "Beginner Setup",
    tagline: "Everything you need to go live for the first time",
    budget: "$490",
    color: "#10b981",
    items: [
      { id: "SW001", name: "HD Pro Webcam C920", price: 79.99 },
      { id: "SW004", name: "Blue Yeti Microphone", price: 129.99 },
      { id: "SW007", name: "Key Light Air", price: 129.99 },
      { id: "SW005", name: "Stream Deck MK.2", price: 149.99 },
    ],
  },
  {
    id: "creator",
    name: "Creator Bundle",
    tagline: "Step up your stream quality with intermediate gear",
    budget: "$690",
    color: "#7c3aed",
    items: [
      { id: "SW002", name: "Facecam MK.2", price: 149.99 },
      { id: "SW003", name: "Wave:3 Microphone", price: 159.99 },
      { id: "SW008", name: "Ring Light 18\"", price: 99.99 },
      { id: "SW005", name: "Stream Deck MK.2", price: 149.99 },
      { id: "SW0010", name: "Live Gamer Mini", price: 129.99 },
    ],
  },
  {
    id: "pro",
    name: "Pro Streamer Kit",
    tagline: "Professional-grade setup for serious creators",
    budget: "$890",
    color: "#f59e0b",
    items: [
      { id: "SW002", name: "Facecam MK.2", price: 149.99 },
      { id: "SW003", name: "Wave:3 Microphone", price: 159.99 },
      { id: "SW007", name: "Key Light Air", price: 129.99 },
      { id: "SW006", name: "Stream Deck XL", price: 249.99 },
      { id: "SW009", name: "Capture Card HD60 X", price: 199.99 },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function skillClass(level) {
  const l = level.toLowerCase();
  if (l === "beginner") return "beginner";
  if (l === "intermediate") return "intermediate";
  return "advanced";
}

function skillLabel(level) {
  if (level.toLowerCase() === "advanced") return "Pro";
  return level;
}

function fmt(n) {
  return "$" + Number(n).toFixed(2);
}

function discountedPrice(price, pct) {
  return price * (1 - pct / 100);
}

// ── StarterKits ───────────────────────────────────────────────────────────────

function StarterKits({ onAddBundle }) {
  const [flashId, setFlashId] = useState(null);

  async function handleAddBundle(kit) {
    await onAddBundle(kit.items.map(i => i.id));
    setFlashId(kit.id);
    setTimeout(() => setFlashId(null), 1200);
  }

  return (
    <div className="kits-section">
      <div className="kits-header">
        <h2 className="kits-title">Not Sure Where to Start?</h2>
        <p className="kits-sub">
          We've put together curated kits based on your budget and skill level — just add the whole bundle to your cart.
        </p>
      </div>
      <div className="kits-grid">
        {STARTER_KITS.map(kit => {
          const total = kit.items.reduce((s, i) => s + i.price, 0);
          return (
            <div key={kit.id} className="kit-card" style={{ "--kit-color": kit.color }}>
              <div className="kit-badge" style={{ background: kit.color }}>{kit.name}</div>
              <div className="kit-budget">{kit.budget} bundle</div>
              <p className="kit-tagline">{kit.tagline}</p>
              <ul className="kit-items">
                {kit.items.map(item => (
                  <li key={item.id}>
                    <span className="kit-check">✓</span> {item.name}
                  </li>
                ))}
              </ul>
              <div className="kit-total">Bundle total: {fmt(total)}</div>
              <button
                className={`kit-btn ${flashId === kit.id ? "kit-btn-added" : ""}`}
                style={flashId !== kit.id ? { background: kit.color } : {}}
                onClick={() => handleAddBundle(kit)}
              >
                {flashId === kit.id ? "✓ Added to Cart!" : "Add Bundle to Cart"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ProductsPage ──────────────────────────────────────────────────────────────

function ProductsPage({ onAddToCart, onAddBundle }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [search, setSearch] = useState("");
  const [flashIds, setFlashIds] = useState({});

  const categories = ["All", "Camera", "Audio", "Controller", "Lighting", "Capture Card", "Accessory"];
  const levels = ["All", "Beginner", "Intermediate", "Pro"];

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    // Map "Pro" back to "Advanced" for the API
    if (level !== "All") params.set("level", level === "Pro" ? "Advanced" : level);
    fetch(`${API}/products?${params}`)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => { setError("Failed to load products."); setLoading(false); });
  }, [category, level]);

  const filtered = products.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p["Name"].toLowerCase().includes(q) ||
      p["Brand"].toLowerCase().includes(q) ||
      p["Category"].toLowerCase().includes(q) ||
      p["Description"].toLowerCase().includes(q)
    );
  });

  async function handleAdd(product) {
    await onAddToCart(product["Product ID"]);
    setFlashIds(prev => ({ ...prev, [product["Product ID"]]: true }));
    setTimeout(() => setFlashIds(prev => { const n = { ...prev }; delete n[product["Product ID"]]; return n; }), 1000);
  }

  const dealsProducts = products.filter(p => DEALS[p["Product ID"]]);

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-eyebrow">Built for streamers, by streamers</div>
        <h1>Find the Right Gear to <span>Start Streaming</span></h1>
        <p>
          New to streaming? Not sure what to buy? We've organized everything by skill level so you can
          build the perfect setup — whether you're just starting out or ready to go pro.
        </p>
        <div className="hero-stats">
          <div className="hero-stat"><strong>15+</strong><span>Products</span></div>
          <div className="hero-stat"><strong>6</strong><span>Categories</span></div>
          <div className="hero-stat"><strong>3</strong><span>Skill Levels</span></div>
        </div>
      </div>

      {/* Starter Kits */}
      <StarterKits onAddBundle={onAddBundle} />

      {/* Deals */}
      {dealsProducts.length > 0 && (
        <div className="deals-section">
          <div className="deals-header">
            <span className="deals-badge">🔥 Deals</span>
            <h2 className="deals-title">Featured Deals</h2>
          </div>
          <div className="deals-grid">
            {dealsProducts.map(p => {
              const pct = DEALS[p["Product ID"]];
              const sale = discountedPrice(p["Price"], pct);
              return (
                <div key={p["Product ID"]} className="deal-card">
                  <div className="deal-discount-badge">-{pct}% OFF</div>
                  <div className="deal-icon">{CATEGORY_ICONS[p["Category"]] || "📦"}</div>
                  <div className="deal-name">{p["Name"]}</div>
                  <div className="deal-brand">{p["Brand"]}</div>
                  <div className="deal-pricing">
                    <span className="deal-original">{fmt(p["Price"])}</span>
                    <span className="deal-sale">{fmt(sale)}</span>
                  </div>
                  <button
                    className={`add-to-cart-btn ${flashIds[p["Product ID"]] ? "added-flash" : ""}`}
                    onClick={() => handleAdd(p)}
                  >
                    {flashIds[p["Product ID"]] ? "✓ Added!" : "Add to Cart"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="shop-section">
        <h2 className="section-heading">Browse All Products</h2>

        <div className="search-bar-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-bar"
            type="text"
            placeholder="Search by name, brand, or category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        <div className="filters">
          <span className="filter-label">Category:</span>
          <div className="filter-group">
            {categories.map(c => (
              <button key={c} className={`filter-btn ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
                {c !== "All" && CATEGORY_ICONS[c] ? `${CATEGORY_ICONS[c]} ` : ""}{c}
              </button>
            ))}
          </div>
        </div>

        <div className="filters">
          <span className="filter-label">Skill Level:</span>
          <div className="filter-group">
            {levels.map(l => (
              <button key={l} className={`filter-btn ${level === l ? "active" : ""}`} onClick={() => setLevel(l)}>{l}</button>
            ))}
          </div>
        </div>

        {!loading && !error && (
          <p className="results-info">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
            {search && ` for "${search}"`}
          </p>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            Loading products…
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <h2>No products found</h2>
            <p>Try a different search or filter.</p>
          </div>
        )}

        <div className="product-grid">
          {filtered.map(p => {
            const isDeal = !!DEALS[p["Product ID"]];
            const discPct = DEALS[p["Product ID"]];
            const salePrice = isDeal ? discountedPrice(p["Price"], discPct) : null;
            return (
              <div key={p["Product ID"]} className={`product-card ${isDeal ? "product-card-deal" : ""}`}>
                {isDeal && <div className="product-deal-ribbon">-{discPct}% OFF</div>}
                <div className="product-image-placeholder">
                  <span className="product-icon">{CATEGORY_ICONS[p["Category"]] || "📦"}</span>
                </div>
                <div className="product-card-top">
                  <span className="category-tag">{p["Category"]}</span>
                  <span className={`skill-tag ${skillClass(p["Skill Level"])}`}>{skillLabel(p["Skill Level"])}</span>
                </div>
                <div>
                  <div className="product-name">{p["Name"]}</div>
                  <div className="product-brand">{p["Brand"]}</div>
                </div>
                <div className="product-desc">{p["Description"]}</div>
                <div className="product-features">{p["Key Features"]}</div>
                <div className="product-footer">
                  <div>
                    {isDeal ? (
                      <div className="product-price-wrap">
                        <span className="product-price-original">{fmt(p["Price"])}</span>
                        <span className="product-price product-price-sale">{fmt(salePrice)}</span>
                      </div>
                    ) : (
                      <div className="product-price">{fmt(p["Price"])}</div>
                    )}
                    <div className={`availability ${p["Availability"] === "In Stock" ? "in-stock" : "limited"}`}>
                      {p["Availability"]}
                    </div>
                  </div>
                </div>
                <button
                  className={`add-to-cart-btn ${flashIds[p["Product ID"]] ? "added-flash" : ""}`}
                  onClick={() => handleAdd(p)}
                >
                  {flashIds[p["Product ID"]] ? "✓ Added!" : "Add to Cart"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── CartPage ──────────────────────────────────────────────────────────────────

function CartPage({ cart, onUpdateQty, onRemove, onClear, onCheckout, onShop }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="empty-state">
        <h2>Your cart is empty</h2>
        <p>Add some gear to get started!</p>
        <button className="btn-outline" onClick={onShop}>Browse Products</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.productId} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{fmt(item.price)} each</div>
              </div>
              <div className="cart-item-controls">
                <button className="qty-btn" onClick={() => onUpdateQty(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                <span className="qty-display">{item.quantity}</span>
                <button className="qty-btn" onClick={() => onUpdateQty(item.productId, item.quantity + 1)}>+</button>
                <button className="remove-btn" onClick={() => onRemove(item.productId)}>Remove</button>
              </div>
              <div className="cart-item-subtotal">{fmt(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-title">Order Summary</div>
          <div className="summary-row">
            <span>Items ({itemCount})</span>
            <span>{fmt(total)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: "#10b981" }}>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
          <button className="checkout-btn" onClick={onCheckout}>Proceed to Checkout</button>
          <button className="clear-cart-btn" onClick={onClear}>Clear Cart</button>
        </div>
      </div>
    </div>
  );
}

// ── CheckoutPage ──────────────────────────────────────────────────────────────

function CheckoutPage({ cart, onBack, onOrderPlaced }) {
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      onOrderPlaced(data.order);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const isValid = form.name.trim() && form.email.trim() && form.address.trim();

  return (
    <div>
      <button className="back-link" onClick={onBack}>← Back to Cart</button>
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Shipping Information</h2>
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
          </div>
          <div className="form-group">
            <label>Shipping Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} placeholder="123 Main St, City, State, ZIP" required />
          </div>
          <button className="place-order-btn" type="submit" disabled={!isValid || loading}>
            {loading ? "Placing Order…" : `Place Order · ${fmt(total)}`}
          </button>
        </form>

        <div className="cart-summary">
          <div className="summary-title">Order Summary</div>
          {cart.map(item => (
            <div key={item.productId} className="summary-row">
              <span>{item.name} × {item.quantity}</span>
              <span>{fmt(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: "#10b981" }}>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── OrderConfirmed ────────────────────────────────────────────────────────────

function OrderConfirmed({ order, onContinue }) {
  return (
    <div className="order-confirmed">
      <div className="check-icon">✓</div>
      <h1>Order Confirmed!</h1>
      <p>Thanks {order.customer.name}! We've received your order and will ship it soon.</p>

      <div className="order-details-card">
        <h3>Order Details</h3>
        <div className="order-meta">
          <div><span>Order ID: </span><strong>{order.orderId}</strong></div>
          <div><span>Email: </span><strong>{order.customer.email}</strong></div>
          <div><span>Ship to: </span><strong>{order.customer.address}</strong></div>
        </div>
        <div className="order-items-list">
          {order.items.map(item => (
            <div key={item.productId} className="order-item-row">
              <span>{item.name} × {item.quantity}</span>
              <strong>{fmt(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="order-total-row">
            <span>Total</span>
            <span>{fmt(order.total)}</span>
          </div>
        </div>
      </div>

      <button className="btn-outline" onClick={onContinue}>Continue Shopping</button>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  const [page, setPage] = useState("shop");
  const [cart, setCart] = useState([]);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const fetchCart = useCallback(() => {
    fetch(`${API}/cart`)
      .then(r => r.json())
      .then(setCart)
      .catch(() => {});
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  async function handleAddToCart(productId) {
    await fetch(`${API}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    fetchCart();
  }

  async function handleAddBundle(productIds) {
    for (const productId of productIds) {
      await fetch(`${API}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
    }
    fetchCart();
  }

  async function handleUpdateQty(productId, quantity) {
    if (quantity < 1) return;
    await fetch(`${API}/cart/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    fetchCart();
  }

  async function handleRemove(productId) {
    await fetch(`${API}/cart/${productId}`, { method: "DELETE" });
    fetchCart();
  }

  async function handleClear() {
    await fetch(`${API}/cart`, { method: "DELETE" });
    fetchCart();
  }

  function handleOrderPlaced(order) {
    setConfirmedOrder(order);
    setCart([]);
    setPage("confirmed");
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <header>
        <button className="logo" onClick={() => setPage("shop")} style={{ background: "none", border: "none" }}>
          🎮 <span>Streamer</span>World
        </button>
        <div className="header-right">
          <button className="nav-link" onClick={() => setPage("shop")}>Shop</button>
          <button className="cart-btn" onClick={() => setPage("cart")}>
            🛒 Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      <main>
        {page === "shop" && (
          <ProductsPage onAddToCart={handleAddToCart} onAddBundle={handleAddBundle} />
        )}
        {page === "cart" && (
          <CartPage
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
            onClear={handleClear}
            onCheckout={() => setPage("checkout")}
            onShop={() => setPage("shop")}
          />
        )}
        {page === "checkout" && (
          <CheckoutPage
            cart={cart}
            onBack={() => setPage("cart")}
            onOrderPlaced={handleOrderPlaced}
          />
        )}
        {page === "confirmed" && confirmedOrder && (
          <OrderConfirmed
            order={confirmedOrder}
            onContinue={() => setPage("shop")}
          />
        )}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
