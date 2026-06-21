import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7ZonCymxV3alN3mpN0E0tw7sJeaDxdro",
  authDomain: "roselyne-s-nook.firebaseapp.com",
  projectId: "roselyne-s-nook",
  storageBucket: "roselyne-s-nook.firebasestorage.app",
  messagingSenderId: "426832372488",
  appId: "1:426832372488:web:7d211c6208d5f7908c42bd",
  measurementId: "G-5MR4X2X9YX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let products = [];
let cart = [];

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const searchInput = document.getElementById("searchInput");

function peso(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

function makeOrderNumber() {
  return "RN-" + Date.now();
}

async function loadProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (products.length === 0) {
    productGrid.innerHTML = `<p class="empty-message">No dresses yet. Add products in Firestore.</p>`;
    return;
  }

  renderProducts();
}

function renderProducts() {
  const search = searchInput.value.toLowerCase();

  const filtered = products.filter(product =>
    (product.name || "").toLowerCase().includes(search) ||
    (product.category || "").toLowerCase().includes(search)
  );

  productGrid.innerHTML = filtered.map(product => {
    const stock = Number(product.stock || 0);

    return `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.description || "Elegant dress from Roselyne's Nook."}</p>
          <div class="price">${peso(product.price)}</div>
          <div class="stock">${stock > 0 ? stock + " in stock" : "Out of stock"}</div>
          <button class="main-btn" ${stock === 0 ? "disabled" : ""} data-add="${product.id}">
            ${stock === 0 ? "Unavailable" : "Add to Cart"}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product || Number(product.stock) <= 0) return;

  const existing = cart.find(item => item.id === productId);

  if (existing) {
    if (existing.quantity < Number(product.stock)) {
      existing.quantity++;
    } else {
      alert("Maximum stock reached.");
    }
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1
    });
  }

  renderCart();
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = `<p>Your cart is empty.</p>`;
    cartTotal.textContent = peso(0);
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-line">
        <strong>${item.name}</strong>
        <span>${peso(item.price * item.quantity)}</span>
      </div>
      <small>Quantity: ${item.quantity}</small>
      <div class="cart-actions">
        <button data-minus="${item.id}">−</button>
        <button data-plus="${item.id}">+</button>
        <button data-remove="${item.id}">Remove</button>
      </div>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = peso(total);
}

async function placeOrder(event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Please add a dress to your cart first.");
    return;
  }

  const customerName = document.getElementById("customerName").value.trim();
  const customerEmail = document.getElementById("customerEmail").value.trim();
  const customerPhone = document.getElementById("customerPhone").value.trim();
  const customerAddress = document.getElementById("customerAddress").value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;
  const paymentReference = document.getElementById("paymentReference").value.trim();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderNumber = "RN-" + Date.now();

  try {
    await addDoc(collection(db, "orders"), {
      orderNumber: orderNumber,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      paymentMethod: paymentMethod,
      paymentReference: paymentReference,
      items: cart,
      total: total,
      status: "Pending Verification",
      paid: false,
      createdAt: serverTimestamp()
    });

    alert("Order placed successfully! Your order number is " + orderNumber);

    cart = [];
    renderCart();
    event.target.reset();

  } catch (error) {
    alert("Order failed. Please check your Firebase rules.");
    console.error(error);
  }
}

productGrid.addEventListener("click", event => {
  const id = event.target.dataset.add;
  if (id) addToCart(id);
});

cartItems.addEventListener("click", event => {
  const plus = event.target.dataset.plus;
  const minus = event.target.dataset.minus;
  const remove = event.target.dataset.remove;

  if (plus) addToCart(plus);

  if (minus) {
    const item = cart.find(cartItem => cartItem.id === minus);
    if (item) item.quantity--;
    cart = cart.filter(cartItem => cartItem.quantity > 0);
    renderCart();
  }

  if (remove) {
    cart = cart.filter(cartItem => cartItem.id !== remove);
    renderCart();
  }
});

searchInput.addEventListener("input", renderProducts);
document.getElementById("orderForm").addEventListener("submit", placeOrder);

loadProducts();
renderCart();
