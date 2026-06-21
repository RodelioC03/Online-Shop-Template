let defaultProducts = [
  {
    id: 1,
    name: "Minimal Tote Bag",
    price: 299,
    stock: 14,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    name: "Classic Cotton Shirt",
    price: 349,
    stock: 9,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    name: "Cream Coffee Tumbler",
    price: 499,
    stock: 5,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 4,
    name: "Desk Organizer",
    price: 199,
    stock: 3,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
  }
];

let products = JSON.parse(localStorage.getItem("products")) || defaultProducts;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];

function peso(amount) {
  return "₱" + Number(amount).toLocaleString("en-PH");
}

function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("orders", JSON.stringify(orders));
}

function updateStats() {
  document.getElementById("productCount").textContent = products.length;
  document.getElementById("orderCount").textContent = orders.length;
  document.getElementById("cartBadge").textContent = cart.reduce(function(total, item) {
    return total + item.quantity;
  }, 0);
}

function showProducts() {
  let productList = document.getElementById("productList");
  let searchText = document.getElementById("searchInput").value.toLowerCase();
  productList.innerHTML = "";

  let filteredProducts = products.filter(function(product) {
    return product.name.toLowerCase().includes(searchText);
  });

  if (filteredProducts.length === 0) {
    productList.innerHTML = `<div class="empty-state">No products found.</div>`;
    return;
  }

  filteredProducts.forEach(function(product) {
    let stockClass = "";
    let stockText = product.stock + " in stock";

    if (product.stock === 0) {
      stockClass = "out-stock";
      stockText = "Out of stock";
    } else if (product.stock <= 5) {
      stockClass = "low-stock";
      stockText = "Only " + product.stock + " left";
    }

    let card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=900&q=80'">
        <span class="stock-pill ${stockClass}">${stockText}</span>
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="price-row">
          <span class="price">${peso(product.price)}</span>
        </div>
        <div class="card-actions">
          <button class="primary-btn" onclick="addToCart(${product.id})" ${product.stock === 0 ? "disabled" : ""}>
            ${product.stock === 0 ? "Unavailable" : "Add to Cart"}
          </button>
          <button class="delete-link" onclick="deleteProduct(${product.id})">Delete</button>
        </div>
      </div>
    `;

    productList.appendChild(card);
  });

  updateStats();
}

function addToCart(productId) {
  let product = products.find(function(item) {
    return item.id === productId;
  });

  if (!product || product.stock <= 0) {
    alert("This item is out of stock.");
    return;
  }

  let cartItem = cart.find(function(item) {
    return item.id === productId;
  });

  if (cartItem) {
    if (cartItem.quantity < product.stock) {
      cartItem.quantity++;
    } else {
      alert("Not enough stock available.");
      return;
    }
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  saveData();
  showCart();
}

function showCart() {
  let cartList = document.getElementById("cartList");
  let cartTotal = document.getElementById("cartTotal");
  cartList.innerHTML = "";

  let total = 0;

  if (cart.length === 0) {
    cartList.innerHTML = `<div class="empty-state">Your cart is empty. Add products first.</div>`;
  }

  cart.forEach(function(item) {
    let itemTotal = item.price * item.quantity;
    total += itemTotal;

    let div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div>
        <h3>${item.name}</h3>
        <p>${peso(item.price)} each • Subtotal: <strong>${peso(itemTotal)}</strong></p>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">−</button>
          <strong>${item.quantity}</strong>
          <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="delete-link" onclick="removeFromCart(${item.id})">Remove</button>
    `;
    cartList.appendChild(div);
  });

  cartTotal.textContent = peso(total);
  updateStats();
}

function changeQuantity(productId, amount) {
  let cartItem = cart.find(function(item) {
    return item.id === productId;
  });
  let product = products.find(function(item) {
    return item.id === productId;
  });

  if (!cartItem || !product) return;

  if (amount === 1 && cartItem.quantity >= product.stock) {
    alert("Not enough stock available.");
    return;
  }

  cartItem.quantity += amount;

  if (cartItem.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveData();
  showCart();
}

function removeFromCart(productId) {
  cart = cart.filter(function(item) {
    return item.id !== productId;
  });

  saveData();
  showCart();
}

function clearCart() {
  cart = [];
  saveData();
  showCart();
}

document.getElementById("orderForm").addEventListener("submit", function(event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  for (let i = 0; i < cart.length; i++) {
    let product = products.find(function(item) {
      return item.id === cart[i].id;
    });

    if (!product || cart[i].quantity > product.stock) {
      alert("Some products do not have enough stock.");
      return;
    }
  }

  cart.forEach(function(item) {
    let product = products.find(function(product) {
      return product.id === item.id;
    });
    product.stock -= item.quantity;
  });

  let order = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    name: document.getElementById("customerName").value,
    email: document.getElementById("customerEmail").value,
    phone: document.getElementById("customerPhone").value,
    address: document.getElementById("customerAddress").value,
    items: cart,
    total: cart.reduce(function(sum, item) {
      return sum + item.price * item.quantity;
    }, 0)
  };

  orders.push(order);
  cart = [];
  document.getElementById("orderForm").reset();

  saveData();
  showProducts();
  showCart();
  showOrders();

  alert("Order submitted successfully! You can now view it in the admin panel.");
});

document.getElementById("productForm").addEventListener("submit", function(event) {
  event.preventDefault();

  let product = {
    id: Date.now(),
    name: document.getElementById("productName").value,
    price: Number(document.getElementById("productPrice").value),
    stock: Number(document.getElementById("productStock").value),
    image: document.getElementById("productImage").value
  };

  products.push(product);
  document.getElementById("productForm").reset();

  saveData();
  showProducts();
  updateStats();
});

function showOrders() {
  let orderList = document.getElementById("orderList");
  orderList.innerHTML = "";

  if (orders.length === 0) {
    orderList.innerHTML = `<div class="empty-state">No orders yet.</div>`;
    updateStats();
    return;
  }

  orders.slice().reverse().forEach(function(order) {
    let div = document.createElement("div");
    div.className = "order-card";

    let itemText = order.items.map(function(item) {
      return `${item.name} x ${item.quantity}`;
    }).join(", ");

    div.innerHTML = `
      <h3>Order #${order.id}</h3>
      <p><strong>Date:</strong> ${order.date}</p>
      <p><strong>Name:</strong> ${order.name}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Address:</strong> ${order.address}</p>
      <p><strong>Items:</strong> ${itemText}</p>
      <p><strong>Total:</strong> ${peso(order.total)}</p>
    `;

    orderList.appendChild(div);
  });

  updateStats();
}

function deleteProduct(productId) {
  let confirmDelete = confirm("Delete this product?");
  if (!confirmDelete) return;

  products = products.filter(function(product) {
    return product.id !== productId;
  });

  cart = cart.filter(function(item) {
    return item.id !== productId;
  });

  saveData();
  showProducts();
  showCart();
}

function clearOrders() {
  let confirmClear = confirm("Clear all orders?");
  if (!confirmClear) return;

  orders = [];
  saveData();
  showOrders();
}

function resetProducts() {
  let confirmReset = confirm("Reset the whole demo shop?");
  if (!confirmReset) return;

  localStorage.clear();
  products = defaultProducts;
  cart = [];
  orders = [];
  saveData();
  showProducts();
  showCart();
  showOrders();
}

document.getElementById("searchInput").addEventListener("input", showProducts);

showProducts();
showCart();
showOrders();
