// ========================================
// A.K NURSERY WEBSITE
// FINAL SCRIPT.JS
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

  try{

    grid.innerHTML = `
      <p class="loading">Loading products...</p>
    `;

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/products?select=id,created_at,name,image_url,stock,cat,description,old_price,colors,images,price&order=id.desc",
      {
        method: "GET",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    console.log("SUPABASE PRODUCTS:", data);

    if(!response.ok){

      console.error("SUPABASE ERROR:", data);

      grid.innerHTML = `
        <p>
          Products load nahi ho rahe.<br>
          Supabase error check karo.
        </p>
      `;

      return;
    }


    products = data.map(p => {

      // PRICE
      let priceValue = p.price;

      if(
        typeof priceValue === "string"
      ){
        priceValue =
          priceValue.replace(/[₹,\s]/g,"");
      }

      const price =
        Number(priceValue) || 0;


      // OLD PRICE
      let oldValue = p.old_price;

      if(
        typeof oldValue === "string"
      ){
        oldValue =
          oldValue.replace(/[₹,\s]/g,"");
      }

      const oldPrice =
        Number(oldValue) || 0;


      // IMAGE
      let image = "";

      if(
        p.image_url &&
        typeof p.image_url === "string"
      ){
        image = p.image_url.trim();
      }


      // EXTRA IMAGES
      let extraImages = [];

      if(Array.isArray(p.images)){
        extraImages = p.images;
      }
      else if(typeof p.images === "string"){
        try{
          const parsed =
            JSON.parse(p.images);

          if(Array.isArray(parsed)){
            extraImages = parsed;
          }
        }catch(e){}
      }


      return {

        id: p.id,

        name:
          p.name ||
          "Product",

        cat:
          p.cat ||
          "Plants",

        price: price,

        old: oldPrice,

        stock:
          p.stock !== false,

        image: image,

        images: extraImages,

        colors:
          p.colors || "",

        description:
          p.description || "",

        icon: "🌱"

      };

    });


    console.log(
      "FINAL PRODUCTS:",
      products
    );


    renderProducts();


  }catch(error){

    console.error(
      "PRODUCT LOADING ERROR:",
      error
    );

    grid.innerHTML = `
      <p>
        Products load nahi ho rahe.
        Internet/Supabase connection check karo.
      </p>
    `;

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

    grid.innerHTML = `
      <p class="loading">
        No products available.
      </p>
    `;

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
            src="${p.image}"
            alt="${escapeHTML(p.name)}"
            loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='grid';"
          >

          <div
            class="imageFallback"
            style="display:none;"
          >
            🌱
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

          `
          <p>
            ${escapeHTML(p.description)}
          </p>
          `

          :

          ""
        }


        ${
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

          ""
        }


        <div class="price">

          ₹${formatPrice(p.price)}

          ${
            p.old > 0

            ?

            `
            <span class="old">
              ₹${formatPrice(p.old)}
            </span>
            `

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
          >
            ❌ Out of Stock
          </button>
          `
        }

      </div>

    </article>

  `).join("");

}


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

      qty: 1

    });

  }


  updateCart();

  openCart();

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


  // COUNT

  if(count){

    count.textContent =
      cart.reduce(
        (sum,p) =>
          sum + p.qty,
        0
      );

  }


  // ITEMS

  if(items){

    if(!cart.length){

      items.innerHTML = `
        <p>Your cart is empty.</p>
      `;

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
                  src="${p.image}"
                  alt="${escapeHTML(p.name)}"
                  class="cartImage"
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
                  × ${p.qty}
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


  // TOTAL

  if(total){

    const cartTotal =
      cart.reduce(
        (sum,p) =>
          sum +
          (p.price * p.qty),
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

    modal.classList.remove(
      "hidden"
    );

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

    modal.classList.add(
      "hidden"
    );

  }

}


// ========================================
// WHATSAPP ORDER
// ========================================

function orderText(extra = ""){

  const lines =
    cart.map(p => {

      return `
${p.name} x ${p.qty}
Price: ₹${formatPrice(
  p.price * p.qty
)}
Photo: ${p.image || "Not available"}
`;

    }).join("\n");


  const total =
    cart.reduce(
      (sum,p) =>
        sum +
        (p.price * p.qty),
      0
    );


  const message = `

🌱 A.K NURSERY & WALL COMPOUND

🛒 ORDER

${lines}

━━━━━━━━━━━━━━

Product Total: ₹${formatPrice(total)}

🚚 Delivery charges extra
🪴 Plant & Pot fixing charge extra

${extra}

Thank you for choosing
A.K Nursery.

`;


  return encodeURIComponent(
    message
  );

}


// ========================================
// CHECKOUT
// ========================================

function checkout(){

  if(!cart.length){

    alert(
      "Cart is empty."
    );

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
// START
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadProducts();

    updateCart();

  }
);
