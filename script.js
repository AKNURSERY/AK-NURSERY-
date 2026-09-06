// ====== A.K NURSERY WEBSITE SETTINGS ======

const WHATSAPP_NUMBER = "919555322038";

const SUPABASE_URL =
"https://mudpcroftnctbbdqxisj.supabase.co";

const SUPABASE_KEY =
"sb_publishable_YaAB-Uf3OpSI5gpKdmqvSQ_TwHTtyLs";

let products = [];
let cart = [];


// ================================
// LOAD PRODUCTS FROM SUPABASE
// ================================

async function loadProducts(){

 try{

  const r = await fetch(
   SUPABASE_URL +
   "/rest/v1/products?select=*&order=id.desc",
   {
    headers:{
     "apikey":SUPABASE_KEY
    }
   }
  );

  const data = await r.json();

  if(!r.ok){

   console.error("Supabase Error:",data);

   document.getElementById("productGrid").innerHTML =
   "<p>Products load nahi ho rahe.</p>";

   return;
  }

  products = data.map(p => ({

   id:p.id,

   name:p.name || "Product",

   cat:p.cat || "Plants",

   price:Number(p.price) || 0,

   old:Number(p.old_price) || 0,

   stock:p.stock !== false,

   image:p.image_url || "",

   icon:"🌱",

   description:p.description || ""

  }));

  renderProducts();

 }catch(error){

  console.error("Product loading error:",error);

 }

}


// ================================
// SHOW PRODUCTS
// ================================

function renderProducts(list=products){

 const grid =
 document.getElementById("productGrid");

 if(!grid) return;

 if(!list.length){

  grid.innerHTML =
  "<p>No products available.</p>";

  return;
 }

 grid.innerHTML = list.map(p=>`

 <article class="card">

  <div class="pic">

   ${
    p.image
    ?
    `<img
      src="${p.image}"
      alt="${p.name}"
      style="width:100%;height:100%;object-fit:cover;border-radius:10px;"
    >`
    :
    p.icon
   }

  </div>

  <div class="cardBody">

   <span class="tag">
    ${p.cat}
   </span>

   <h3>
    ${p.name}
   </h3>

   ${
    p.description
    ?
    `<p>${p.description}</p>`
    :
    ""
   }

   <div class="price">

    ₹${p.price}

    ${
     p.old > 0
     ?
     `<span class="old">₹${p.old}</span>`
     :
     ""
    }

   </div>

   ${
    p.stock
    ?

    `<button
      class="btn"
      onclick="addToCart(${p.id})">
      🛒 Add to Cart
    </button>`

    :

    `<button
      class="btn"
      disabled
      style="background:#999;cursor:not-allowed;">
      ❌ Out of Stock
    </button>`

   }

  </div>

 </article>

 `).join("");

}


// ================================
// CATEGORY FILTER
// ================================

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
   products.filter(p => p.cat === cat)
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


// ================================
// ADD TO CART
// ================================

function addToCart(id){

 const p =
 products.find(x => x.id === id);

 if(!p) return;

 // Stock check

 if(!p.stock){

  alert("Ye product abhi Out of Stock hai.");

  return;

 }

 const found =
 cart.find(x => x.id === id);

 if(found){

  found.qty++;

 }else{

  cart.push({

   ...p,

   qty:1

  });

 }

 updateCart();

 openCart();

}


// ================================
// UPDATE CART
// ================================

function updateCart(){

 const count =
 document.getElementById("cartCount");

 const items =
 document.getElementById("cartItems");

 const total =
 document.getElementById("cartTotal");


 // Cart count

 if(count){

  count.textContent =
  cart.reduce(
   (sum,p)=>sum+p.qty,
   0
  );

 }


 // Cart items

 if(items){

  if(!cart.length){

   items.innerHTML =
   "<p>Your cart is empty.</p>";

  }else{

   items.innerHTML = cart.map(p=>`

    <div class="cartRow">

     <span>

      ${p.icon}
      ${p.name}
      × ${p.qty}

     </span>

     <b>

      ₹${p.price * p.qty}

     </b>

    </div>

   `).join("");

  }

 }


 // Total

 if(total){

  total.textContent =
  cart.reduce(
   (sum,p)=>sum + p.price*p.qty,
   0
  );

 }

}


// ================================
// OPEN CART
// ================================

function openCart(){

 const modal =
 document.getElementById("cartModal");

 if(modal){

  modal.classList.remove("hidden");

 }

 updateCart();

}


// ================================
// CLOSE CART
// ================================

function closeCart(){

 const modal =
 document.getElementById("cartModal");

 if(modal){

  modal.classList.add("hidden");

 }

}


// ================================
// WHATSAPP ORDER TEXT
// ================================

function orderText(extra=""){

 const lines =
 cart.map(p =>

  `${p.name} x ${p.qty} = ₹${p.price*p.qty}`

 ).join("\n");


 const total =
 cart.reduce(
  (sum,p)=>sum+p.price*p.qty,
  0
 );


 const message =
 `Namaste A.K Nursery,

${lines || "Website enquiry"}

Total: ₹${total}

${extra}`;


 return encodeURIComponent(message);

}


// ================================
// CHECKOUT
// ================================

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


// ================================
// CONTACT FORM ORDER
// ================================

function sendOrder(e){

 e.preventDefault();


 const name =
 document.getElementById("name").value.trim();


 const phone =
 document.getElementById("phone").value.trim();


 const address =
 document.getElementById("address").value.trim();


 const extra =

 `Name: ${name}

Mobile: ${phone}

Address: ${address}`;


 window.open(

  `https://wa.me/${WHATSAPP_NUMBER}?text=${orderText(extra)}`,

  "_blank"

 );

}


// ================================
// START WEBSITE
// ================================

loadProducts();

updateCart();
