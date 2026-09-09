// ========================================
// A.K NURSERY - FINAL SCRIPT.JS
// DYNAMIC GRID & GALLERY
// ========================================

const WHATSAPP_NUMBER = "919555322038";

const SUPABASE_URL = "https://mudpcroftnctbbdqxisj.supabase.co";
const SUPABASE_KEY = "sb_publishable_YaAB-Uf3OpSI5gpKdmqvSQ_TwHTtyLs";

let products = [];
let categories = [];
let cart = [];

// GALLERY VIEWER STATE
let galleryImages = [];
let galleryIndex = 0;

// ========================================
// START WEBSITE
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  loadCategories();
  loadProducts();
  updateCart();
});

// ========================================
// LOAD CATEGORIES FROM SUPABASE
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

    categories = await response.json();

    if (typeof renderCategoriesGrid === "function") {
      renderCategoriesGrid();
    }
    if (typeof updateCategoryFilterMenu === "function") {
      updateCategoryFilterMenu();
    }
  } catch (error) {
    console.error("CATEGORY ERROR:", error);
  }
}



// ========================================
// RENDER CATEGORIES AS GRID CARDS (FIXED LAYOUT)
// ========================================
function renderCategoriesGrid() {
  const box = document.querySelector(".categories");
  if (!box) return;

  // Render as card grid using exact structure from Image 3
  box.innerHTML = categories
    .map(
      (c) => `
    <div class="cat-card" onclick="filterCat('${escapeJS(c.name)}')">
      <div class="cat-card-img">
        ${
          c.image_url
            ? `<img src="${escapeHTML(c.image_url)}" alt="${escapeHTML(
                c.name
              )}" loading="lazy">`
            : `<div class="cat-image-placeholder">${c.icon || "🌱"}</div>`
        }
        <div class="cat-badge-icon">${c.icon || "🌱"}</div>
      </div>
      <h4>${escapeHTML(c.name)}</h4>
      <p>Explore Products →</p>
    </div>
  `
    )
    .join("");
}

// UPDATE CATEGORY FILTER MENU
function updateCategoryFilterMenu() {
  const filter = document.getElementById("filter");
  if (!filter) return;
  filter.innerHTML = `
    <option value="All">All Products</option>
    ${categories
      .map((c) => `<option value="${escapeHTML(c.name)}">${escapeHTML(c.name)}</option>`)
      .join("")}
  `;
}

// ========================================
// LOAD PRODUCTS
// ========================================
async function loadProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = `<p class="loading">Loading products...</p>`;

  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/products?select=*&order=id.desc",
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY,
        },
      }
    );

    const data = await response.json();

    products = data.map((p) => {
      const price = Number(
        String(p.price ?? "").replace(/[₹,\s]/g, "")
      );
      const oldPrice = Number(
        String(p.old_price ?? "").replace(/[₹,\s]/g, "")
      );

      let allImages = [];
      if (Array.isArray(p.images)) {
        allImages = p.images.filter((x) => typeof x === "string").map((x) => x.trim());
      } else if (typeof p.images === "string") {
        try {
          const parsed = JSON.parse(p.images);
          if (Array.isArray(parsed)) {
            allImages = parsed.filter((x) => typeof x === "string").map((x) => x.trim());
          }
        } catch (e) {}
      }
      if (typeof p.image_url === "string" && p.image_url.trim()) {
        const main = p.image_url.trim();
        if (!allImages.includes(main)) allImages.unshift(main);
      }

      return {
        id: p.id,
        name: p.name || "Product",
        cat: p.cat || "Plants",
        price: Number.isFinite(price) ? price : 0,
        old: Number.isFinite(oldPrice) ? oldPrice : 0,
        image: allImages[0] || "",
        images: allImages,
        stock: p.stock !== false,
        badge: p.old_price && price < oldPrice ? "Best Seller" : "New",
        rating: 5,
      };
    });

    renderProductsGrid(); 
  } catch (error) {
    console.error("PRODUCT ERROR:", error);
    grid.innerHTML = `<p>Error loading products.</p>`;
  }
}

// ========================================
// RENDER PRODUCTS GRID AS E-COMMERCE CARDS
// ========================================
function renderProductsGrid(list = products) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `<p>No products available.</p>`;
    return;
  }

  // Exact UI match for Image 3 layout card grid
  grid.innerHTML = list
    .map(
      (p) => `
    <article class="card">
      <div class="pic">
        <img src="${escapeHTML(p.image)}" alt="${escapeHTML(
        p.name
      )}" class="productImage" loading="lazy" onclick="openProductGallery(${
        p.id
      })">
        <div class="card-tag">${p.badge || "New"}</div>
        <button class="wishlist-btn"><i class="fa-regular fa-heart"></i></button>
      </div>
      <div class="cardBody">
        <span class="tag">${escapeHTML(p.cat)}</span>
        <h3>${escapeHTML(p.name)}</h3>
        <div class="rating">
          ${renderRating(p.rating)}
        </div>
        <div class="price">
          ₹${formatPrice(p.price)}
          ${p.old > 0 ? `<span class="old">₹${formatPrice(p.old)}</span>` : ""}
        </div>
        <div class="extraCharges">
          🚚 Delivery charges extra<br>🪴 Fixing charge extra
        </div>
        ${
          p.stock
            ? `<button class="btn btn-cart-grid" onclick="addToCart(${p.id})">🛒 Add to Cart</button>`
            : `<button class="btn btn-cart-grid" disabled>❌ Out of Stock</button>`
        }
      </div>
    </article>
  `
    )
    .join("");
}

// Helper: Format rating stars
function renderRating(rating) {
  const stars = new Array(5).fill("☆");
  return stars.map((_, i) => (i < rating ? "★" : "☆")).join("");
}

// Gallery Viewer Functions
function openProductGallery(id) {
  const product = products.find((p) => String(p.id) === String(id));
  if (!product || !product.images.length) return;
  galleryImages = product.images.filter(Boolean);
  galleryIndex = 0;
  createGalleryViewer();
  updateGalleryViewer(product.name);
}

function checkout() {
  if (!cart.length) return;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${orderText()}`, "_blank");
}
// Include all remaining utility and cart functions (addToCart, removeFromCart, changeQty, updateCart, openCart, etc.)
// ... (Cart logic unchanged)

function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return number.toLocaleString("en-IN");
}
function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function escapeJS(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"');
}
function filterCat(cat) {
  if (cat === "All") {
    renderProductsGrid(products);
  } else {
    renderProductsGrid(
      products.filter(
        (p) => String(p.cat).toLowerCase() === String(cat).toLowerCase()
      )
    );
  }
  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
}
