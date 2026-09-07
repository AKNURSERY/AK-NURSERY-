// ========================================
// A.K NURSERY - FINAL SCRIPT.JS
// MULTI PHOTO PRODUCT GALLERY
// ========================================

const WHATSAPP_NUMBER = "919555322038";

const SUPABASE_URL =
"https://mudpcroftnctbbdqxisj.supabase.co";

const SUPABASE_KEY =
"sb_publishable_YaAB-Uf3OpSI5gpKdmqvSQ_TwHTtyLs";

let products = [];
let categories = [];
let cart = [];


// ========================================
// PRODUCT GALLERY STATE
// ========================================

let galleryImages = [];
let galleryIndex = 0;

// ========================================
// LOAD CATEGORIES FROM SUPABASE
// ========================================

async function loadCategories(){

  try{

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/categories?select=*&active=eq.true&order=sort_order.asc",
      {
        method:"GET",
        headers:{
          "apikey":SUPABASE_KEY,
          "Authorization":"Bearer " + SUPABASE_KEY
        }
      }
    );

    const data = await response.json();

    if(!response.ok){
      console.error("CATEGORY ERROR:", data);
      return;
    }

    categories = data;

    renderCategories();
    updateCategoryFilter();

  }catch(error){

    console.error("CATEGORY ERROR:", error);

  }

}


// ========================================
// SHOW CATEGORIES
// ========================================

function renderCategories(){

  const box =
    document.querySelector(".categories");

  if(!box) return;

  box.innerHTML = categories.map(c => `

    <button onclick="filterCat('${escapeJS(c.name)}')">

      ${c.icon || "🌱"}

      ${escapeHTML(c.name)}

    </button>

  `).join("");

}


// ========================================
// UPDATE PRODUCT FILTER
// ========================================

function updateCategoryFilter(){

  const filter =
    document.getElementById("filter");

  if(!filter) return;

  filter.innerHTML = `

    <option value="All">
      All Products
    </option>

    ${
      categories.map(c => `

        <option value="${escapeHTML(c.name)}">
          ${escapeHTML(c.name)}
        </option>

      `).join("")
    }

  `;

}
// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts(){

  const grid = document.getElementById("productGrid");

  if(!grid) return;

  grid.innerHTML =
    `<p class="loading">Loading products...</p>`;

  try{

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/products?select=*&order=id.desc",
      {
        method:"GET",
        headers:{
          "apikey":SUPABASE_KEY,
          "Authorization":"Bearer " + SUPABASE_KEY
        }
      }
    );

    const data = await response.json();

    console.log("SUPABASE PRODUCTS:", data);

    if(!response.ok){

      console.error(data);

      grid.innerHTML =
        `<p>Products load nahi ho rahe.</p>`;

      return;
    }


    products = data.map(p => {

      let price = Number(
        String(p.price ?? "")
          .replace(/[₹,\s]/g,"")
      );

      let oldPrice = Number(
        String(p.old_price ?? "")
          .replace(/[₹,\s]/g,"")
      );


      // ====================================
      // GET ALL PRODUCT PHOTOS
      // ====================================

      let allImages = [];


      // images column
      if(Array.isArray(p.images)){

        allImages = p.images
          .filter(x => typeof x === "string" && x.trim())
          .map(x => x.trim());

      }


      // images column may sometimes be JSON text
      else if(typeof p.images === "string"){

        try{

          const parsed = JSON.parse(p.images);

          if(Array.isArray(parsed)){

            allImages = parsed
              .filter(x => typeof x === "string" && x.trim())
              .map(x => x.trim());

          }

        }catch(e){

          console.log("Images JSON parse skipped");

        }

      }


      // image_url ko bhi gallery me add karo
      if(
        typeof p.image_url === "string" &&
        p.image_url.trim()
      ){

        const mainImage =
          p.image_url.trim();

        if(!allImages.includes(mainImage)){

          allImages.unshift(mainImage);

        }

      }


      return {

        id:p.id,

        name:p.name || "Product",

        cat:p.cat || "Plants",

        price:
          Number.isFinite(price)
          ? price
          : 0,

        old:
          Number.isFinite(oldPrice)
          ? oldPrice
          : 0,

        image:
          allImages[0] || "",

        images:
          allImages,

        stock:
          p.stock !== false,

        description:
          p.description || "",

        colors:
          p.colors || "",

        icon:"🌱"

      };

    });


    console.log(
      "FINAL PRODUCTS WITH GALLERY:",
      products
    );


    renderProducts();


  }catch(error){

    console.error("PRODUCT ERROR:",error);

    grid.innerHTML =
      `<p>Products load nahi ho rahe. Internet check karo.</p>`;

  }

}


// ========================================
// RENDER PRODUCTS
// ========================================

function renderProducts(list = products){

  const grid =
    document.getElementById("productGrid");

  if(!grid) return;


  if(!list.length){

    grid.innerHTML =
      `<p class="loading">No products available.</p>`;

    return;

  }


  grid.innerHTML = list.map(p => {

    const images =
      Array.isArray(p.images)
      ? p.images
      : p.image
        ? [p.image]
        : [];


    const firstImage =
      images[0] || "";


    return `

      <article class="card">

        <div class="pic">

          ${
            firstImage

            ?

            `
            <img
              src="${escapeHTML(firstImage)}"
              alt="${escapeHTML(p.name)}"
              class="productImage"
              loading="lazy"
              onclick="openProductGallery(${p.id})"
              onerror="this.style.display='none';this.nextElementSibling.style.display='grid';"
            >

            <div
              class="imageFallback"
              style="display:none;">
              ${p.icon}
            </div>
            `

            :

            `
            <div class="imageFallback">
              ${p.icon}
            </div>
            `
          }


          ${
            images.length > 1

            ?

            `
            <div
              style="
                position:absolute;
                bottom:10px;
                right:10px;
                background:#064b2a;
                color:#fff;
                padding:6px 10px;
                border-radius:15px;
                font-size:13px;
                font-weight:700;
                z-index:2;
              ">
              📷 ${images.length} Photos
            </div>
            `

            :

            ""
          }

        </div>


        <div class="cardBody">

          <span class="tag">
            ${escapeHTML(p.cat)}
          </span>


          <h3>
            ${escapeHTML(p.name)}
          </h3>


          ${
            p.description

            ?

            `<p>${escapeHTML(p.description)}</p>`

            :

            ""
          }


          <div class="price">

            ₹${formatPrice(p.price)}

            ${
              p.old > 0

              ?

              `<span class="old">
                ₹${formatPrice(p.old)}
              </span>`

              :

              ""
            }

          </div>


          <div class="extraCharges">

            🚚 Delivery charges extra

            <br>

            🪴 Plant & Pot fixing charge extra

          </div>


          ${
            p.stock

            ?

            `
            <button
              class="btn"
              onclick="addToCart(${p.id})">
              🛒 Add to Cart
            </button>
            `

            :

            `
            <button
              class="btn"
              disabled>
              ❌ Out of Stock
            </button>
            `
          }

        </div>

      </article>

    `;

  }).join("");


  // Make photo container relative
  document
    .querySelectorAll(".pic")
    .forEach(pic => {

      pic.style.position = "relative";

    });

}


// ========================================
// OPEN PRODUCT GALLERY
// ========================================

function openProductGallery(id){

  const product =
    products.find(
      p => String(p.id) === String(id)
    );


  if(!product) return;


  galleryImages =
    Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : product.image
      ? [product.image]
      : [];


  if(!galleryImages.length){

    return;

  }


  galleryIndex = 0;


  createGalleryViewer();


  updateGalleryViewer(product.name);

}


// ========================================
// CREATE GALLERY VIEWER
// ========================================

function createGalleryViewer(){

  let viewer =
    document.getElementById("productGalleryViewer");


  if(viewer) return;


  viewer =
    document.createElement("div");


  viewer.id =
    "productGalleryViewer";


  viewer.style.cssText = `

    position:fixed;
    inset:0;
    background:rgba(0,0,0,.94);
    z-index:99999;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;

  `;


  viewer.innerHTML = `

    <button
      id="galleryClose"
      onclick="closeProductGallery()"
      style="
        position:absolute;
        top:15px;
        right:18px;
        width:45px;
        height:45px;
        border:0;
        border-radius:50%;
        background:#fff;
        color:#111;
        font-size:30px;
        cursor:pointer;
        z-index:5;
      ">
      ×
    </button>


    <button
      id="galleryPrev"
      onclick="previousGalleryImage()"
      style="
        position:absolute;
        left:15px;
        top:50%;
        transform:translateY(-50%);
        width:48px;
        height:48px;
        border:0;
        border-radius:50%;
        background:#fff;
        color:#064b2a;
        font-size:28px;
        font-weight:bold;
        cursor:pointer;
        z-index:5;
      ">
      ‹
    </button>


    <div
      style="
        width:100%;
        height:100%;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:12px;
      ">

      <img
        id="galleryMainImage"
        src=""
        alt="Product"
        style="
          max-width:92%;
          max-height:82vh;
          width:auto;
          height:auto;
          object-fit:contain;
          display:block;
        ">


      <div
        id="galleryCounter"
        style="
          color:#fff;
          font-size:15px;
          font-weight:700;
          background:rgba(0,0,0,.55);
          padding:7px 12px;
          border-radius:15px;
        ">
      </div>

    </div>


    <button
      id="galleryNext"
      onclick="nextGalleryImage()"
      style="
        position:absolute;
        right:15px;
        top:50%;
        transform:translateY(-50%);
        width:48px;
        height:48px;
        border:0;
        border-radius:50%;
        background:#fff;
        color:#064b2a;
        font-size:28px;
        font-weight:bold;
        cursor:pointer;
        z-index:5;
      ">
      ›
    </button>

  `;


  document.body.appendChild(viewer);

}


// ========================================
// UPDATE GALLERY VIEWER
// ========================================

function updateGalleryViewer(name="Product"){

  const viewer =
    document.getElementById("productGalleryViewer");

  const image =
    document.getElementById("galleryMainImage");

  const counter =
    document.getElementById("galleryCounter");

  const prev =
    document.getElementById("galleryPrev");

  const next =
    document.getElementById("galleryNext");


  if(!viewer || !image) return;


  viewer.style.display = "flex";


  image.src =
    galleryImages[galleryIndex];


  image.alt =
    name || "Product";


  if(counter){

    counter.textContent =
      `${galleryIndex + 1} / ${galleryImages.length}`;

  }


  // One photo = no arrows
  if(galleryImages.length <= 1){

    if(prev) prev.style.display = "none";
    if(next) next.style.display = "none";

  }else{

    if(prev) prev.style.display = "block";
    if(next) next.style.display = "block";

  }

}


// ========================================
// NEXT PHOTO
// ========================================

function nextGalleryImage(){

  if(galleryImages.length <= 1) return;


  galleryIndex++;

  if(galleryIndex >= galleryImages.length){

    galleryIndex = 0;

  }


  updateGalleryViewer();

}


// ========================================
// PREVIOUS PHOTO
// ========================================

function previousGalleryImage(){

  if(galleryImages.length <= 1) return;


  galleryIndex--;

  if(galleryIndex < 0){

    galleryIndex =
      galleryImages.length - 1;

  }


  updateGalleryViewer();

}


// ========================================
// CLOSE GALLERY
// ========================================

function closeProductGallery(){

  const viewer =
    document.getElementById("productGalleryViewer");


  if(viewer){

    viewer.remove();

  }


  galleryImages = [];

  galleryIndex = 0;

}


// ========================================
// OLD IMAGE VIEWER SUPPORT
// ========================================

function openProductImage(image,name){

  const product =
    products.find(
      p =>
        p.image === image ||
        (
          Array.isArray(p.images) &&
          p.images.includes(image)
        )
    );


  if(product){

    openProductGallery(product.id);

    return;

  }


  galleryImages = [image];

  galleryIndex = 0;

  createGalleryViewer();

  updateGalleryViewer(name || "Product");

}


// ========================================
// CLOSE OLD VIEWER
// ========================================

function closeProductImage(){

  closeProductGallery();

}


// ========================================
// KEYBOARD GALLERY CONTROLS
// ========================================

document.addEventListener(
  "keydown",
  function(e){

    const viewer =
      document.getElementById("productGalleryViewer");


    if(!viewer) return;


    if(e.key === "Escape"){

      closeProductGallery();

    }


    if(e.key === "ArrowRight"){

      nextGalleryImage();

    }


    if(e.key === "ArrowLeft"){

      previousGalleryImage();

    }

  }
);


// ========================================
// PRICE FORMAT
// ========================================

function formatPrice(value){

  const number =
    Number(value);

  if(!Number.isFinite(number)){

    return "0";

  }

  return number.toLocaleString("en-IN");

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value){

  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


// ========================================
// ESCAPE JAVASCRIPT
// ========================================

function escapeJS(value){

  return String(value)
    .replace(/\\/g,"\\\\")
    .replace(/'/g,"\\'")
    .replace(/"/g,'\\"')
    .replace(/\n/g,"\\n")
    .replace(/\r/g,"\\r");

}


// ========================================
// CATEGORY FILTER
// ========================================

function filterCat(cat){

  const filter =
    document.getElementById("filter");


  if(filter){

    filter.value = cat;

  }


  if(cat === "All"){

    renderProducts(products);

  }else{

    renderProducts(

      products.filter(

        p =>
          String(p.cat).toLowerCase() ===
          String(cat).toLowerCase()

      )

    );

  }


  const section =
    document.getElementById("products");


  if(section){

    section.scrollIntoView({

      behavior:"smooth"

    });

  }

}


// ========================================
// ADD TO CART
// ========================================

function addToCart(id){

  const product =
    products.find(
      p => p.id === id
    );


  if(!product) return;


  if(!product.stock){

    alert(
      "Ye product abhi Out of Stock hai."
    );

    return;

  }


  const existing =
    cart.find(
      p => p.id === id
    );


  if(existing){

    existing.qty++;

  }else{

    cart.push({

      ...product,

      qty:1

    });

  }


  updateCart();

  openCart();

}


// ========================================
// REMOVE FROM CART
// ========================================

function removeFromCart(id){

  cart =
    cart.filter(
      p => p.id !== id
    );

  updateCart();

}


// ========================================
// CHANGE QUANTITY
// ========================================

function changeQty(id,change){

  const item =
    cart.find(
      p => p.id === id
    );


  if(!item) return;


  item.qty += change;


  if(item.qty <= 0){

    removeFromCart(id);

    return;

  }


  updateCart();

}


// ========================================
// UPDATE CART
// ========================================

function updateCart(){

  const count =
    document.getElementById("cartCount");

  const items =
    document.getElementById("cartItems");

  const total =
    document.getElementById("cartTotal");


  if(count){

    count.textContent =
      cart.reduce(
        (sum,p) =>
          sum + p.qty,
        0
      );

  }


  if(items){

    if(!cart.length){

      items.innerHTML =
        `<p>Your cart is empty.</p>`;

    }else{

      items.innerHTML =

        cart.map(p => `

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
                    onclick="changeQty(${p.id},-1)">
                    −
                  </button>


                  <span>
                    ${p.qty}
                  </span>


                  <button
                    onclick="changeQty(${p.id},1)">
                    +
                  </button>


                  <button
                    onclick="removeFromCart(${p.id})">
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

        `).join("");

    }

  }


  if(total){

    const cartTotal =
      cart.reduce(

        (sum,p) =>
          sum + (p.price * p.qty),

        0

      );


    total.textContent =
      formatPrice(cartTotal);

  }

}


// ========================================
// OPEN CART
// ========================================

function openCart(){

  const modal =
    document.getElementById("cartModal");


  if(modal){

    modal.classList.remove("hidden");

  }


  updateCart();

}


// ========================================
// CLOSE CART
// ========================================

function closeCart(){

  const modal =
    document.getElementById("cartModal");


  if(modal){

    modal.classList.add("hidden");

  }

}


// ========================================
// WHATSAPP ORDER TEXT
// ========================================

function orderText(extra = ""){

  const lines =

    cart.map(p => {

      return `

🌱 ${p.name}

Quantity: ${p.qty}

Price: ₹${formatPrice(
  p.price * p.qty
)}

Product Photo:
${p.image || "Photo not available"}

`;

    }).join("\n");


  const total =

    cart.reduce(

      (sum,p) =>
        sum + (p.price * p.qty),

      0

    );


  const message = `

🌱 A.K NURSERY & WALL COMPOUND

🛒 NEW ORDER

${lines}

━━━━━━━━━━━━━━

Product Total: ₹${formatPrice(total)}

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

function checkout(){

  if(!cart.length){

    alert("Cart is empty.");

    return;

  }


  window.open(

    `https://wa.me/${WHATSAPP_NUMBER}?text=${orderText()}`,

    "_blank"

  );

}


// ========================================
// CONTACT FORM
// ========================================

function sendOrder(e){

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

    `https://wa.me/${WHATSAPP_NUMBER}?text=${orderText(extra)}`,

    "_blank"

  );

}


// ========================================
// START WEBSITE
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  function(){

    loadCategories();
loadProducts();
updateCart();

    

  }
);
