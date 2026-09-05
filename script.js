// ====== A.K NURSERY WEBSITE SETTINGS ======
const WHATSAPP_NUMBER = "919555322028"; // Replace with your WhatsApp number, e.g. 919999999999

const products = [
 {id:1,name:"Areca Palm Plant",cat:"Plants",price:299,old:399,icon:"🌴"},
 {id:2,name:"Snake Plant",cat:"Plants",price:249,old:349,icon:"🌿"},
 {id:3,name:"Rose Plant",cat:"Plants",price:199,old:299,icon:"🌹"},
 {id:4,name:"12 Inch Nursery Pot",cat:"Pots",price:35,old:50,icon:"🪴"},
 {id:5,name:"Vermicompost 5 Kg",cat:"Vermicompost",price:100,old:200,icon:"♻️"},
 {id:6,name:"Wall Compound",cat:"Wall Compound",price:65,old:0,icon:"🧱"}
];

let cart = [];

function renderProducts(list=products){
 const grid=document.getElementById("productGrid");
 grid.innerHTML=list.map(p=>`<article class="card">
  <div class="pic">${p.icon}</div><div class="cardBody"><span class="tag">${p.cat}</span>
  <h3>${p.name}</h3><div class="price">₹${p.price}${p.old?` <span class="old">₹${p.old}</span>`:""}</div>
  <button class="btn" onclick="addToCart(${p.id})">Add to Cart</button></div></article>`).join("");
}
function filterCat(cat){
 document.getElementById("filter").value=cat;
 renderProducts(cat==="All"?products:products.filter(p=>p.cat===cat));
 document.getElementById("products").scrollIntoView({behavior:"smooth"});
}
function addToCart(id){
 const p=products.find(x=>x.id===id), found=cart.find(x=>x.id===id);
 if(found) found.qty++; else cart.push({...p,qty:1});
 updateCart(); openCart();
}
function updateCart(){
 document.getElementById("cartCount").textContent=cart.reduce((s,p)=>s+p.qty,0);
 document.getElementById("cartItems").innerHTML=cart.length?cart.map(p=>`<div class="cartRow"><span>${p.icon} ${p.name} × ${p.qty}</span><b>₹${p.price*p.qty}</b></div>`).join(""):"<p>Your cart is empty.</p>";
 document.getElementById("cartTotal").textContent=cart.reduce((s,p)=>s+p.price*p.qty,0);
}
function openCart(){document.getElementById("cartModal").classList.remove("hidden");updateCart()}
function closeCart(){document.getElementById("cartModal").classList.add("hidden")}
function orderText(extra=""){
 const lines=cart.map(p=>`${p.name} x ${p.qty} = ₹${p.price*p.qty}`).join("\n");
 const total=cart.reduce((s,p)=>s+p.price*p.qty,0);
 return `Namaste A.K Nursery,%0A%0A${lines||"Website enquiry"}%0A%0ATotal: ₹${total}%0A${extra}`;
}
function checkout(){
 if(!cart.length) return alert("Cart is empty.");
 if(WHATSAPP_NUMBER.includes("X")) return alert("Please add your WhatsApp number in script.js first.");
 window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${orderText()}`,"_blank");
}
function sendOrder(e){
 e.preventDefault();
 if(WHATSAPP_NUMBER.includes("X")) return alert("Please add your WhatsApp number in script.js first.");
 const extra=`Name: ${document.getElementById("name").value}%0AMobile: ${document.getElementById("phone").value}%0AAddress: ${document.getElementById("address").value}`;
 window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${orderText(extra)}`,"_blank");
}
renderProducts(); updateCart();
