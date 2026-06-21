const defaultProducts = [
  {
    name: "Scarlet Midi Dress",
    price: 1299,
    stock: 12,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "White Sunday Dress",
    price: 999,
    stock: 8,
    image: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Rose Evening Dress",
    price: 1599,
    stock: 5,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Minimal Red Slip Dress",
    price: 1199,
    stock: 10,
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Cream Linen Dress",
    price: 899,
    stock: 15,
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Ruby Formal Dress",
    price: 1899,
    stock: 3,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80"
  }
];

let products = JSON.parse(localStorage.getItem("rnProducts")) || defaultProducts;
let cart = JSON.parse(localStorage.getItem("rnCart")) || [];
let orders = JSON.parse(localStorage.getItem("rnOrders")) || [];

function saveData() {
  localStorage.setItem("rnProducts", JSON.stringify(products));
  localStorage.setItem("rnCart", JSON.stringify(cart));
  localStorage.setItem("rnOrders", JSON.stringify(orders));
}

function formatPeso(amount) {
  return "₱" + Number(amount).toLocaleString("en-PH");
}

function showTab(tabName) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.getElementById(tabName).classList.add("active");
  renderCart();
  renderOrders();
}

function renderProducts() {
  const grid = document.getElementById("products");
  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const sort = document.getElementById("sortSelect")?.value || "default";

  let list = products
    .map((product, index) => ({ ...product, index }))
    .filter(product => product.name.toLowerCase().includes(search));

  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  if (sort === "stock") list.sort((a, b) => b.stock - a.stock);

  grid.innerHTML = list.map(product => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-body">
        <div class="product-top">
          <h3>${product.name}</h3>
          <span class="price">${formatPeso(product.price)}</span>
        </div>
        <p class="stock ${product.stock === 0 ? "out" : ""}">${product.stock > 0 ? product.stock + " in stock" : "Out of stock"}</p>
        <div class="product-actions">
          <input id="qty-${product.index}" type="number" min="1" max="${product.stock}" value="1" ${product.stock === 0 ? "disabled" : ""}>
          <button class="primary" onclick="addToCart(${product.index})" ${product.stock === 0 ? "disabled" : ""}>Add to cart</button>
        </div>
      </div>
    </article>
  `).join("");

  updateCartCount();
}

function addToCart(index) {
  const qty = Number(document.getElementById(`qty-${index}`).value);
  if (qty < 1 || qty > products[index].stock) {
    alert("Please choose a valid quantity.");
    return;
  }

  const existing = cart.find(item => item.index === index);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ index, qty });
  }

  saveData();
  updateCartCount();
  alert("Dress added to cart.");
}

function updateCartCount() {
  document.getElementById("cartCount").textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const totalText = document.getElementById("cartTotal");
  if (!container || !totalText) return;

  if (cart.length === 0) {
    container.innerHTML = "<p class='muted'>Your cart is empty.</p>";
    totalText.textContent = "₱0";
    return;
  }

  let total = 0;
  container.innerHTML = cart.map((item, cartIndex) => {
    const product = products[item.index];
    const subtotal = product.price * item.qty;
    total += subtotal;
    return `
      <div class="cart-item">
        <strong>${product.name}</strong>
        <p>${item.qty} × ${formatPeso(product.price)} = ${formatPeso(subtotal)}</p>
        <button onclick="removeFromCart(${cartIndex})">Remove</button>
      </div>
    `;
  }).join("");
  totalText.textContent = formatPeso(total);
}

function removeFromCart(cartIndex) {
  cart.splice(cartIndex, 1);
  saveData();
  renderCart();
  updateCartCount();
}

function placeOrder(event) {
  event.preventDefault();
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  for (const item of cart) {
    if (item.qty > products[item.index].stock) {
      alert("One of the items has low stock. Please check your cart.");
      return;
    }
  }

  const order = {
    customer: document.getElementById("customerName").value,
    email: document.getElementById("customerEmail").value,
    phone: document.getElementById("customerPhone").value,
    address: document.getElementById("customerAddress").value,
    note: document.getElementById("customerNote").value,
    date: new Date().toLocaleString(),
    items: cart.map(item => ({ name: products[item.index].name, qty: item.qty, price: products[item.index].price }))
  };

  cart.forEach(item => products[item.index].stock -= item.qty);
  orders.unshift(order);
  cart = [];
  saveData();
  event.target.reset();
  renderProducts();
  renderCart();
  alert("Order placed successfully.");
  showTab("admin");
}

function addProduct(event) {
  event.preventDefault();
  products.push({
    name: document.getElementById("productName").value,
    price: Number(document.getElementById("productPrice").value),
    stock: Number(document.getElementById("productStock").value),
    image: document.getElementById("productImage").value
  });
  saveData();
  event.target.reset();
  renderProducts();
  alert("New dress added.");
}

function renderOrders() {
  const container = document.getElementById("ordersList");
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = "<p class='muted'>No orders yet.</p>";
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="order-item">
      <strong>${order.customer}</strong>
      <p class="muted">${order.date}</p>
      <p>${order.email} • ${order.phone}</p>
      <p>${order.address}</p>
      <ul>${order.items.map(item => `<li>${item.qty} × ${item.name} - ${formatPeso(item.price)}</li>`).join("")}</ul>
      <p><em>${order.note || "No notes"}</em></p>
    </div>
  `).join("");
}

renderProducts();
renderCart();
renderOrders();
