// ====== A.K NURSERY WEBSITE SETTINGS ======

const WHATSAPP_NUMBER = "919555322038";

const SUPABASE_URL =
"https://mudpcroftnctbbdqxisj.supabase.co";

const SUPABASE_KEY =
"sb_publishable_YaAB-Uf3OpSI5gpKdmqvSQ_TwHTtyLs";

let products = [];
let cart = [];


// ====== LOAD PRODUCTS FROM SUPABASE ======

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

   return;
  }

  products = data.map(p => ({
   id:p.id,
   name:p.name,
   cat:p.cat || "Plants",
   price:Number(p.price) || 0,
   old:Number(p.old_price) || 0,
   icon:"🌱",
   image:p.image_url || "",
   description:p.description || ""
  }));

  renderProducts();

 }catch(error){

  console.error("Product loading error:",error);

 }

}


// ====== SHOW PRODUCTS ======

function renderProducts(list=products){

 const grid=document.getElementById("productGrid");

 if(!grid) return;

 if(!list.length){

  grid.innerHTML="<p>No products available.</p>";

  return;
 }

 grid.innerHTML=list.map(p=>`

 <article class="card">

  <div class="pic">

   ${
    p.image
    ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">`
    : p.icon
   }

  </div>

  <div class="cardBody">

   <span class="tag">${p.cat}</span>

   <h3>${p.name}</h3>

   ${
    p.description
    ? `<p>${p.description}</p>`
    : ""
   }

   <div class="price">

    ₹${p.price}

    ${
     p.old
     ? `<span class="old">₹${p.old}</span>`
     : ""
    }

   </div>

   <button class="btn" onclick="addToCart(${p.id})">
    Add to Cart
   </button>

  </div>

 </article>

 `).join("");

}


// ====== CATEGORY FILTER ======

function filterCat(cat){

 const filter=document.getElementById("filter");

 if(filter) filter.value=cat;

 if(cat==="All"){

  renderProducts(products);

 }else{

  renderProducts(
   products.filter(p=>p.cat===cat)
  );

 }

 const section=document.getElementById("products");

 if(section){

  section.scrollIntoView({
   behavior:"smooth"
  });

 }

}


// ====== CART ======

function addToCart(id){

 const p=products.find(x=>x.id===id);

 if(!p) return;

 const found=cart.find(x=>x.id===id);

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


function updateCart(){

 const count=document.getElementById("cartCount");

 const items=document.getElementById("cartItems");

 const total=document.getElementById("cartTotal");

 if(count){

  count.textContent=
   cart.reduce((s,p)=>s+p.qty,0);

 }

 if(items){

  items.innerHTML=cart.length

   ? cart.map(p=>`

    <div class="cartRow">

     <span>
      ${p.icon} ${p.name} × ${p.qty}
     </span>

     <b>
      ₹${p.price*p.qty}
     </b>

    </div>

   `).join("")

   : "<p>Your cart is empty.</p>";

 }

 if(total){

  total.textContent=
   cart.reduce(
    (s,p)=>s+p.price*p.qty,
    0
   );

 }

}


// ====== CART OPEN/CLOSE ======

function openCart(){

 const modal=document.getElementById("cartModal");

 if(modal){

  modal.classList.remove("hidden");

 }

 updateCart();

}


function closeCart(){

 const modal=document.getElementById("cartModal");

 if(modal){

  modal.classList.add("hidden");

 }

}


// ====== WHATSAPP ORDER ======

function orderText(extra=""){

 const lines=cart.map(p=>
  `${p.name} x ${p.qty} = ₹${p.price*p.qty}`
 ).join("\n");

 const total=cart.reduce(
  (s,p)=>s+p.price*p.qty,
  0
 );

 return `Namaste A.K Nursery,%0A%0A${lines || "Website enquiry"}%0A%0ATotal: ₹${total}%0A${extra}`;

}


function checkout(){

 if(!cart.length){

  return alert("Cart is empty.");

 }

 window.open(
  `https://wa.me/${WHATSAPP_NUMBER}?text=${orderText()}`,
  "_blank"
 );

}


function sendOrder(e){

 e.preventDefault();

 const name=
  document.getElementById("name").value;

 const phone=
  document.getElementById("phone").value;

 const address=
  document.getElementById("address").value;

 const extra=
  `Name: ${encodeURIComponent(name)}%0A`+
  `Mobile: ${encodeURIComponent(phone)}%0A`+
  `Address: ${encodeURIComponent(address)}`;

 window.open(
  `https://wa.me/${WHATSAPP_NUMBER}?text=${orderText(extra)}`,
  "_blank"
 );

}


// ====== START WEBSITE ======

loadProducts();
updateCart();
