// ========================================
// A.K NURSERY - FINAL SCRIPT.JS
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

    console.log("SUPABASE:",data);

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

      return {

        id:p.id,

        name:p.name || "Product",

        cat:p.cat || "Plants",

        price:Number.isFinite(price) ? price : 0,

        old:Number.isFinite(oldPrice) ? oldPrice : 0,

        image:
          typeof p.image_url === "string"
          ? p.image_url.trim()
          : "",

        stock:p.stock !== false,

        description:p.description || "",

        colors:p.colors || "",

        icon:"🌱"

      };

    });

    console.log("FINAL PRODUCTS:",products);

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


  grid.innerHTML = list.map(p => `

    <article class="card">

      <div class="pic">

        ${
          p.image

          ?

          `
          <img
            src="${escapeHTML(p.image)}"
            alt="${escapeHTML(p.name)}"
            class="productImage"
            loading="lazy"
            onclick="openProductImage('${escapeJS(p.image)}','${escapeJS(p.name)}')"
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

  `).join("");

}


// ========================================
// FULL SCREEN PRODUCT PHOTO
// ========================================

function openProductImage(image,name){

  const viewer =
    document.getElementById("imageViewer");

  const viewerImage =
    document.getElementById("viewerImage");

  if(!viewer || !viewerImage) return;

  viewerImage.src = image;

  viewerImage.alt = name || "Product";

  viewer.classList.remove("hidden");

}


// ========================================
// CLOSE FULL SCREEN PHOTO
// ========================================

function closeProductImage(){

  const viewer =
    document.getElementById("imageViewer");

  const viewerImage =
    document.getElementById("viewerImage");

  if(viewer){

    viewer.classList.add("hidden");

  }

  if(viewerImage){

    viewerImage.src = "";

  }

}


// ========================================
// CLOSE PHOTO WITH ESCAPE
// ========================================

document.addEventListener("keydown",function(e){

  if(e.key === "Escape"){

    closeProductImage();

  }

});


// ========================================
// PRICE FORMAT
// ========================================

function formatPrice(value){

  const number = Number(value);

  if(!Number.isFinite(number)) return "0";

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
    .replace(/"/g,"&quot;")

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
    products.find(p => p.id === id);

  if(!product) return;


  if(!product.stock){

    alert("Ye product abhi Out of Stock hai.");

    return;

  }


  const existing =
    cart.find(p => p.id === id);


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
    cart.filter(p => p.id !== id);

  updateCart();

}


// ========================================
// CHANGE QUANTITY
// ========================================

function changeQty(id,change){

  const item =
    cart.find(p => p.id === id);

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
        (sum,p) => sum + p.qty,
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
    document.getElementById("name").value.trim();


  const phone =
    document.getElementById("phone").value.trim();


  const address =
    document.getElementById("address").value.trim();


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

    loadProducts();

    updateCart();

  }
);
