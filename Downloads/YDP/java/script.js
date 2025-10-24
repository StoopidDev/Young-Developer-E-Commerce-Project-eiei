const container = document.getElementById("product-container");
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const overlay = document.getElementById("overlay");
const cartIcon = document.getElementById("cart-icon");
const cartPopup = document.getElementById("cart-popup");
const closeCartBtn = document.getElementById("close-cart");
const clearCartBtn = document.getElementById("clear-cart");

// ✅ เพิ่ม elements สำหรับ filter
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortFilter = document.getElementById("sort-filter");

// ✅ เก็บข้อมูลสินค้าทั้งหมดไว้
let allProducts = [];

// โหลดสินค้า
async function fetchProducts() {
  try {
    const res = await fetch("https://fakestoreapi.com/products");
    const data = await res.json();
    allProducts = data; // เก็บไว้ใช้ filter
    displayProducts(allProducts);
  } catch (error) {
    console.error("มีปัญหาครับ:", error);
    container.innerHTML = "<p>LOAD MAI DAI NA KUB 😭</p>";
  }
}

// ✅ แสดงสินค้า (แยกออกมาเป็น function)
function displayProducts(products) {
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p style='text-align:center; width:100%; padding:40px;'>No products found 😢</p>";
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title.substring(0, 50)}...</h3>
      <p>$${product.price}</p>
      <button class="add-btn">Add to Cart</button>
    `;
    const btn = card.querySelector(".add-btn");
    btn.addEventListener("click", () => addToCart(product));
    container.appendChild(card);
  });
}

// ✅ ฟังก์ชัน Filter และ Search
function filterProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const sortBy = sortFilter.value;

  // 1. กรองตาม search
  let filtered = allProducts.filter(product => 
    product.title.toLowerCase().includes(searchTerm)
  );

  // 2. กรองตาม category
  if (category !== "all") {
    filtered = filtered.filter(product => product.category === category);
  }

  // 3. เรียงลำดับ
  if (sortBy === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name-asc") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  displayProducts(filtered);
}

// ✅ Event Listeners สำหรับ filter
if (searchInput) {
  searchInput.addEventListener("input", filterProducts);
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", filterProducts);
}

if (sortFilter) {
  sortFilter.addEventListener("change", filterProducts);
}

// ระบบตะกร้า
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const found = cart.find((item) => item.id === product.id);
  if (found) {
    found.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  updateCartUI();
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== id);
  saveCart(cart);
  updateCartUI();
}

function increaseQuantity(id) {
  const cart = getCart();
  const item = cart.find((item) => item.id === id);
  if (item) {
    item.quantity++;
    saveCart(cart);
    updateCartUI();
  }
}

function decreaseQuantity(id) {
  const cart = getCart();
  const item = cart.find((item) => item.id === id);
  if (item) {
    if (item.quantity > 1) {
      item.quantity--;
      saveCart(cart);
      updateCartUI();
    } else {
      removeFromCart(id);
    }
  }
}

function updateCartUI() {
  const cart = getCart();
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}">
        <div class="cart-item-details">
          <h4>${item.title.substring(0, 30)}...</h4>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
          <div class="quantity-controls">
            <button class="qty-btn minus" data-id="${item.id}">➖</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn plus" data-id="${item.id}">➕</button>
          </div>
        </div>
        <button class="remove-btn" data-id="${item.id}">🗑️</button>
      </div>
    `;

    const minusBtn = li.querySelector(".minus");
    const plusBtn = li.querySelector(".plus");
    const removeBtn = li.querySelector(".remove-btn");

    minusBtn.addEventListener("click", () => decreaseQuantity(item.id));
    plusBtn.addEventListener("click", () => increaseQuantity(item.id));
    removeBtn.addEventListener("click", () => removeFromCart(item.id));

    cartItems.appendChild(li);
    total += item.price * item.quantity;
  });

  cartCount.textContent = cart.length;
  cartTotal.textContent = total.toFixed(2);
}

function openCart() {
  cartPopup.classList.add("active");
  overlay.classList.add("active");
}

function closeCart() {
  cartPopup.classList.remove("active");
  overlay.classList.remove("active");
}

if (cartIcon) {
  cartIcon.addEventListener("click", openCart);
} else {
  console.error("❌ ไม่พบ element id='cart-icon' ใน HTML!");
}

if (closeCartBtn) {
  closeCartBtn.addEventListener("click", closeCart);
}

if (overlay) {
  overlay.addEventListener("click", closeCart);
}

if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    if (confirm("Are you sure to delete All?")) {
      localStorage.removeItem("cart");
      updateCartUI();
    }
  });
}

fetchProducts();
updateCartUI();