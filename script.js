// ========================================
// A.K NURSERY — FINAL SCRIPT.JS
// ========================================

const WHATSAPP_NUMBER = "919555322038";

const SUPABASE_URL =
  "https://mudpcroftnctbbdqxisj.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_YaAB-Uf3OpSI5gpKdmqvSQ_TwHTtyLs";

let products = [];
let cart = [];


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

  const grid = document.getElementById("productGrid");

  if (!grid) return;

  grid.innerHTML =
    '<p class="loading">Loading products...</p>';

  try {

    const url =
      SUPABASE_URL +
      "/rest/v1/products?select=id,name,image_url,stock,cat,description,old_price,colors,images,price&order=id.desc";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    console.log("SUPABASE RESPONSE:", data);

    if (!response.ok) {

      grid.innerHTML =
        "<p>Products load nahi ho rahe.</p>";

      console.error("Supabase Error:", data);

      return;
    }

    if (!Array.isArray(data)) {

      grid.innerHTML =
        "<p>Products data galat format me hai.</p>";

      return;
    }


    // ========================================
    // CONVERT PRODUCTS
    // ========================================

    products = data.map(function (p) {

      let price = Number(p.price);

      if (!Number.isFinite(price)) {
        price = 0;
      }


      let oldPrice = Number(p.old_price);

      if (!Number.isFinite(oldPrice)) {
        oldPrice = 0;
      }


      let image = "";

      if (
        p.image_url &&
        typeof p.image_url === "string"
      ) {
        image = p.image_url.trim();
      }


      return {

        id: p.id,

        name:
          p.name ||
          "Product",

        cat:
          p.cat ||
          "Plants",

        description:
          p.description ||
          "",

        price: price,

        old: oldPrice,

        stock:
          p.stock !== false,

        image: image,

        colors:
          p.colors ||
          "",

        images:
          p.images ||
          "",

        icon:
          "🌱"

      };

    });


    console.log(
      "PRODUCTS READY:",
      products
    );


    renderProducts(products);

  }

  catch (error) {

    console.error(
      "PRODUCT LOADING ERROR:",
      error
    );

    grid.innerHTML =
      "<p>Products load nahi ho rahe. Supabase connection check karo.</p>";

  }

}


// ========================================
// RENDER PRODUCTS
// ========================================

function renderProducts(list) {

  const grid =
    document.getElementById("productGrid");

  if (!grid) return;


  if (!list || !list.length) {

    grid.innerHTML =
      '<p class="loading">No products available.</p>';

    return;
  }


  grid.innerHTML =
    list.map(function (p) {

      const imageHTML =
        p.image

        ?

        `
        <img
          src="${escapeHTML(p.image)}"
          alt="${escapeHTML(p.name)}"
          class="productImage"
          loading="lazy"
          onclick="openProductImage('${escapeHTML(p.image)}')"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
        >

        <div
          class="imageFallback"
          style="display:none;"
        >
          ${p.icon}
        </div>
        `

        :

        `
        <div class="imageFallback">
          ${p.icon}
        </div>
        `;


      const oldPriceHTML =
        p.old > 0

        ?

        `
        <span class="old">
          ₹${formatPrice(p.old)}
        </span>
        `

        :

        "";


      const descriptionHTML =
        p.description

        ?

        `
        <p>
          ${escapeHTML(p.description)}
        </p>
        `

        :

        "";


      const colorHTML =
        p.colors

        ?

        `
        <div class="productColors">
          🎨 ${escapeHTML(
            Array.isArray(p.colors)
              ? p.colors.join(", ")
              : p.colors
          )}
        </div>
        `

        :

        "";


      const buttonHTML =
        p.stock

        ?

        `
        <button
          class="btn"
          onclick="addToCart(${p.id})"
        >
          🛒 Add to Cart
        </button>
        `

        :

        `
        <button
          class="btn"
          disabled
          style="background:#999;"
        >
          ❌ Out of Stock
        </button>
        `;


      return `

        <article class="card">

          <div class="pic">

            ${imageHTML}

          </div>


          <div class="cardBody">

            <span class="tag">
              ${escapeHTML(p.cat)}
            </span>


            <h3>
              ${escapeHTML(p.name)}
            </h3>


            ${descriptionHTML}


            ${colorHTML}


            <div class="price">

              ₹${formatPrice(p.price)}

              ${oldPriceHTML}

            </div>


            <div class="extraCharges">

              🚚 Delivery charges extra

              <br>

              🪴 Plant & Pot fixing charge extra

            </div>


            ${buttonHTML}

          </div>

        </article>

      `;

    }).join("");

}


// ========================================
// FULL PRODUCT IMAGE
// ========================================

function openProductImage(image) {

  if (!image) return;

  const viewer =
    document.getElementById("imageViewer");

  const viewerImage =
    document.getElementById("viewerImage");

  if (viewer && viewerImage) {

    viewerImage.src = image;

    viewer.classList.remove("hidden");

  }

}


// ========================================
// CLOSE IMAGE
// ========================================

function closeProductImage() {

  const viewer =
    document.getElementById("imageViewer");

  if (viewer) {

    viewer.classList.add("hidden");

  }

}


// ========================================
// PRICE FORMAT
// ========================================

function formatPrice(value) {

  const number =
    Number(value);

  if (!Number.isFinite(number)) {

    return "0";

  }

  return number.toLocaleString("en-IN");

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


// ========================================
// CATEGORY FILTER
// ========================================

function filterCat(cat) {

  const filter =
    document.getElementById("filter");

  if (filter) {

    filter.value = cat;

  }


  if (cat === "All") {

    renderProducts(products);

  }

  else {

    const filtered =
      products.filter(function (p) {

        return String(p.cat)
          .trim()
          .toLowerCase() ===
          String(cat)
            .trim()
            .toLowerCase();

      });

    renderProducts(filtered);

  }


  const section =
    document.getElementById("products");

  if (section) {

    section.scrollIntoView({
      behavior: "smooth"
    });

  }

}


// ========================================
// ADD TO CART
// ========================================

function addToCart(id) {

  const product =
    products.find(function (p) {

      return p.id === id;

    });


  if (!product) {

    alert("Product nahi mila.");

    return;

  }


  if (!product.stock) {

    alert(
      "Ye product abhi Out of Stock hai."
    );

    return;

  }


  const existing =
    cart.find(function (p) {

      return p.id === id;

    });


  if (existing) {

    existing.qty++;

  }

  else {

    cart.push({

      ...product,

      qty: 1

    });

  }


  updateCart();

  openCart();

}


// ========================================
// REMOVE FROM CART
// ========================================

function removeFromCart(id) {

  cart =
    cart.filter(function (p) {

      return p.id !== id;

    });

  updateCart();

}


// ========================================
// CHANGE QUANTITY
// ========================================

function changeQty(id, change) {

  const item =
    cart.find(function (p) {

      return p.id === id;

    });


  if (!item) return;


  item.qty += change;


  if (item.qty <= 0) {

    removeFromCart(id);

    return;

  }


  updateCart();

}


// ========================================
// UPDATE CART
// ========================================

function updateCart() {

  const count =
    document.getElementById("cartCount");

  const items =
    document.getElementById("cartItems");

  const total =
    document.getElementById("cartTotal");


  // COUNT

  if (count) {

    count.textContent =
      cart.reduce(
        function (sum, p) {

          return sum + p.qty;

        },
        0
      );

  }


  // ITEMS

  if (items) {

    if (!cart.length) {

      items.innerHTML =
        "<p>Your cart is empty.</p>";

    }

    else {

      items.innerHTML =
        cart.map(function (p) {

          return `

            <div class="cartRow">

              <div class="cartProduct">

                ${
                  p.image

                  ?

                  `
                  <img
                    src="${escapeHTML(p.image)}"
                    class="cartImage"
                    alt="${escapeHTML(p.name)}"
                  >
                  `

                  :

                  `
                  <div class="cartImageFallback">
                    ${p.icon}
                  </div>
                  `
                }


                <div>

                  <strong>
                    ${escapeHTML(p.name)}
                  </strong>

                  <div>
                    ₹${formatPrice(p.price)}
                  </div>


                  <div class="qtyControls">

                    <button
                      onclick="changeQty(${p.id},-1)"
                    >
                      −
                    </button>

                    <span>
                      ${p.qty}
                    </span>

                    <button
                      onclick="changeQty(${p.id},1)"
                    >
                      +
                    </button>

                    <button
                      onclick="removeFromCart(${p.id})"
                    >
                      🗑️
                    </button>

                  </div>

                </div>

              </div>


              <b>

                ₹${formatPrice(
                  p.price * p.qty
                )}

              </b>

            </div>

          `;

        }).join("");

    }

  }


  // TOTAL

  if (total) {

    const cartTotal =
      cart.reduce(
        function (sum, p) {

          return sum +
            p.price * p.qty;

        },
        0
      );

    total.textContent =
      formatPrice(cartTotal);

  }

}


// ========================================
// OPEN CART
// ========================================

function openCart() {

  const modal =
    document.getElementById("cartModal");

  if (modal) {

    modal.classList.remove("hidden");

  }

  updateCart();

}


// ========================================
// CLOSE CART
// ========================================

function closeCart() {

  const modal =
    document.getElementById("cartModal");

  if (modal) {

    modal.classList.add("hidden");

  }

}


// ========================================
// WHATSAPP ORDER
// ========================================

function orderText(extra = "") {

  const lines =
    cart.map(function (p) {

      return `

🌿 ${p.name}

Quantity: ${p.qty}

Price: ₹${formatPrice(
        p.price * p.qty
      )}

Photo:
${p.image || "Photo available on website"}

`;

    }).join("\n");


  const total =
    cart.reduce(
      function (sum, p) {

        return sum +
          p.price * p.qty;

      },
      0
    );


  const message = `

🌱 A.K NURSERY & WALL COMPOUND

🛒 NEW ORDER

${lines}

━━━━━━━━━━━━━━

Product Total:
₹${formatPrice(total)}

🚚 Delivery charges extra

🪴 Plant & Pot fixing charge extra

${extra}

Thank you.

A.K Nursery
Sonipat, Haryana

`;


  return encodeURIComponent(message);

}


// ========================================
// CHECKOUT
// ========================================

function checkout() {

  if (!cart.length) {

    alert("Cart is empty.");

    return;

  }


  const url =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    orderText();


  window.open(
    url,
    "_blank"
  );

}


// ========================================
// CONTACT FORM
// ========================================

function sendOrder(e) {

  e.preventDefault();


  const name =
    document
      .getElementById("name")
      .value
      .trim();


  const phone =
    document
      .getElementById("phone")
      .value
      .trim();


  const address =
    document
      .getElementById("address")
      .value
      .trim();


  const extra = `

👤 Customer Name:
${name}

📱 Mobile:
${phone}

📍 Address:
${address}

`;


  window.open(

    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    orderText(extra),

    "_blank"

  );

}


// ========================================
// START WEBSITE
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadProducts();

    updateCart();

  }
);
