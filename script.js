// ========================================
// CONFIG & GLOBAL VARIABLES
// ========================================
const WHATSAPP_NUMBER = "919555322038";
const SUPABASE_URL = "https://mudpcroftnctbbdqxisj.supabase.co";
const SUPABASE_KEY = "sb_publishable_YaAB-Uf3OpSI5gpKdmqvSQ_TwHTtyLs";

let products = [];
let categories = [];
let cart = [];

// Helper Function for Escaping HTML
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ========================================
// START WEBSITE ON LOAD
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadProducts();
  updateCart();
  setupImageModal(); // Image Zoom Preview listener setup
});

// ========================================
// 1. LOAD CATEGORIES (17 Dynamic Categories)
// ========================================
async function loadCategories() {
  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/categories?select=*",
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY,
          Range: "0-99"
        }
      }
    );

    if (!response.ok) return;

    categories = await response.json();

    renderCategoriesGrid();
    updateCategoryFilterMenu();

    if (typeof renderCategoriesAdmin === "function") {
      renderCategoriesAdmin();
    }
  } catch (error) {
    console.error("CATEGORY ERROR:", error);
  }
}

// ========================================
// 2. RENDER CATEGORIES GRID
// ========================================
function renderCategoriesGrid() {
  const box = document.querySelector(".categories") || document.getElementById("categories-box");
  if (!box) return;

  box.innerHTML = ""; // Clear duplicates

  if (!categories || categories.length === 0) {
    box.innerHTML = "<p>No categories found.</p>";
    return;
  }

  box.innerHTML = categories
    .map(
      (c) => `
      <div class="cat-card" onclick="filterByCategory('${escapeHTML(c.name)}')">
        <div class="cat-card-img">
          ${
            c.image_url
              ? `<img src="${escapeHTML(c.image_url)}" alt="${escapeHTML(c.name)}" loading="lazy">`
              : `<div class="cat-image-placeholder">${c.icon || "🌱"}</div>`
          }
        </div>
        <div class="cat-badge-icon">${c.icon || "🌱"}</div>
        <h4>${escapeHTML(c.name)}</h4>
        <p>Explore Products →</p>
      </div>
    `
    )
    .join("");
}

// ========================================
// 3. UPDATE CATEGORY FILTER MENU
// ========================================
function updateCategoryFilterMenu() {
  const filterSelect = document.getElementById("filter");
  if (filterSelect) {
    filterSelect.innerHTML = `
      <option value="All">All Products</option>
      ${categories.map((c) => `<option value="${escapeHTML(c.name)}">${escapeHTML(c.name)}</option>`).join("")}
    `;
  }
}

// Filter function when clicking category card
function filterByCategory(catName) {
  const filterSelect = document.getElementById("filter");
  if (filterSelect) {
    filterSelect.value = catName;
    filterCat(catName);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  }
}

// ========================================
// 4. LOAD PRODUCTS
// ========================================
async function loadProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = '<p class="loading">Loading products...</p>';

  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/products?select=*",
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY
        }
      }
    );

    if (!response.ok) return;

    const data = await response.json();
    products = data;
    renderProducts(products);
  } catch (error) {
    console.error("PRODUCT ERROR:", error);
  }
}

// ========================================
// 5. RENDER PRODUCTS GRID & CLICKABLE IMAGE
// ========================================
function renderProducts(items) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (items.length === 0) {
    grid.innerHTML = "<p>No products available.</p>";
    return;
  }

  grid.innerHTML = items
    .map(
      (p) => `
    <div class="card">
      <div class="pic">
        <img src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.name)}" class="productImage" onclick="openImageModal('${escapeHTML(p.image_url)}', '${escapeHTML(p.name)}')">
      </div>
      <div class="cardBody">
        <span class="tag">${escapeHTML(p.category || "General")}</span>
        <h3>${escapeHTML(p.name)}</h3>
        <div class="price">
          ₹${p.price} ${p.old_price ? `<span class="old">₹${p.old_price}</span>` : ""}
        </div>
        <button class="btn-cart-grid" onclick="addToCart(${p.id})">🛒 Add to Cart</button>
      </div>
    </div>
  `
    )
    .join("");
}

// ========================================
// 6. FILTER PRODUCTS
// ========================================
function filterCat(selectedCat) {
  if (selectedCat === "All") {
    renderProducts(products);
  } else {
    const filtered = products.filter((p) => p.category === selectedCat);
    renderProducts(filtered);
  }
}

// ========================================
// 7. IMAGE ENLARGE MODAL (PHOTO BADI KRNE KA LOGIC)
// ========================================
function setupImageModal() {
  if (!document.getElementById("imgZoomModal")) {
    const modalHTML = `
      <div id="imgZoomModal" class="modal hidden" onclick="closeImageModal()">
        <div class="modal-content" style="background:transparent; text-align:center; max-width:90vw;" onclick="event.stopPropagation()">
          <button class="close-btn" onclick="closeImageModal()" style="color:#fff; font-size:30px;">&times;</button>
          <img id="zoomedImg" src="" style="max-width:100%; max-height:80vh; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.8);">
          <h3 id="zoomedTitle" style="color:#fff; margin-top:10px;"></h3>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }
}

function openImageModal(imgSrc, title) {
  const modal = document.getElementById("imgZoomModal");
  const img = document.getElementById("zoomedImg");
  const t = document.getElementById("zoomedTitle");
  if (modal && img) {
    img.src = imgSrc;
    if (t) t.innerText = title;
    modal.classList.remove("hidden");
  }
}

function closeImageModal() {
  const modal = document.getElementById("imgZoomModal");
  if (modal) modal.classList.add("hidden");
}

// ========================================
// 8. CART & WHATSAPP CHECKOUT
// ========================================
function addToCart(id) {
  const prod = products.find((p) => p.id === id);
  if (prod) {
    cart.push(prod);
    updateCart();
    alert(prod.name + " added to cart!");
  }
}

function updateCart() {
  const count = document.getElementById("cartCount");
  if (count) count.innerText = cart.length;
}

function openCart() {
  const modal = document.getElementById("cartModal");
  const itemsContainer = document.getElementById("cartItems");
  const totalElem = document.getElementById("cartTotal");

  if (!modal) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    if (totalElem) totalElem.innerText = "0";
  } else {
    let total = 0;
    itemsContainer.innerHTML = cart
      .map((item) => {
        total += Number(item.price || 0);
        return `<div style="display:flex; justify-between; margin-bottom:8px;">
          <span>${escapeHTML(item.name)}</span>
          <b>₹${item.price}</b>
        </div>`;
      })
      .join("");
    if (totalElem) totalElem.innerText = total;
  }

  modal.classList.remove("hidden");
}

function closeCart() {
  const modal = document.getElementById("cartModal");
  if (modal) modal.classList.add("hidden");
}

function checkout() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }
  let text = "Hello A.K Nursery, I want to order:\n";
  cart.forEach((item, i) => {
    text += `${i + 1}. ${item.name} - ₹${item.price}\n`;
  });
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
}
