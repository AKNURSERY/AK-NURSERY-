// ========================================
// A.K NURSERY - WEBSITE SCRIPT
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

    try {

        grid.innerHTML = "<p>Loading products...</p>";

        const response = await fetch(
            SUPABASE_URL + "/rest/v1/products?select=*&order=id.desc",
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": "Bearer " + SUPABASE_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {

            const errorText = await response.text();

            console.error("Supabase Error:", errorText);

            grid.innerHTML =
                "<p>Products load nahi ho rahe. Supabase connection check karein.</p>";

            return;
        }

        const data = await response.json();

        console.log("Supabase Products:", data);

        products = data.map(function (p) {

            return {
                id: p.id,
                name: p.name || "Product",
                cat: p.cat || "Plants",
                price: Number(p.price) || 0,
                old: Number(p.old_price) || 0,
                stock: p.stock !== false,
                image: p.image_url || "",
                description: p.description || "",
                icon: "🌱"
            };

        });

        renderProducts();

    } catch (error) {

        console.error("Connection Error:", error);

        grid.innerHTML =
            "<p>Products load karne me problem aa rahi hai.</p>";
    }
}


// ========================================
// SHOW PRODUCTS
// ========================================

function renderProducts(list = products) {

    const grid = document.getElementById("productGrid");

    if (!grid) return;

    if (!list.length) {

        grid.innerHTML =
            "<p>No products available.</p>";

        return;
    }

    grid.innerHTML = list.map(function (p) {

        const imageHTML = p.image
            ? `
                <img
                    src="${p.image}"
                    alt="${p.name}"
                    loading="lazy"
                >
              `
            : `
                <div style="
                    font-size:75px;
                    display:grid;
                    place-items:center;
                    width:100%;
                    height:100%;
                ">
                    ${p.icon}
                </div>
              `;

        return `

        <article class="card">

            <div class="pic">
                ${imageHTML}
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
                    ? `<p>${p.description}</p>`
                    : ""
                }

                <div class="price">

                    ₹${p.price}

                    ${
                        p.old > 0
                        ? `<span class="old">₹${p.old}</span>`
                        : ""
                    }

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
                        disabled
                        style="background:#999;">
                        ❌ Out of Stock
                    </button>
                    `
                }

            </div>

        </article>

        `;

    }).join("");
}


// ========================================
// CATEGORY FILTER
// ========================================

function filterCat(cat) {

    const filter = document.getElementById("filter");

    if (filter) {
        filter.value = cat;
    }

    if (cat === "All") {

        renderProducts(products);

    } else {

        renderProducts(
            products.filter(function (p) {
                return p.cat === cat;
            })
        );

    }

    const section = document.getElementById("products");

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

    const product = products.find(function (p) {
        return p.id === id;
    });

    if (!product) return;

    if (!product.stock) {

        alert("Ye product Out of Stock hai.");

        return;
    }

    const existing = cart.find(function (p) {
        return p.id === id;
    });

    if (existing) {

        existing.qty++;

    } else {

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

function updateCart() {

    const count = document.getElementById("cartCount");
    const items = document.getElementById("cartItems");
    const total = document.getElementById("cartTotal");

    const cartCount = cart.reduce(
        function (sum, p) {
            return sum + p.qty;
        },
        0
    );

    const cartTotal = cart.reduce(
        function (sum, p) {
            return sum + (p.price * p.qty);
        },
        0
    );

    if (count) {
        count.textContent = cartCount;
    }

    if (total) {
        total.textContent = cartTotal;
    }

    if (items) {

        if (!cart.length) {

            items.innerHTML =
                "<p>Your cart is empty.</p>";

            return;
        }

        items.innerHTML = cart.map(function (p) {

            return `

            <div class="cartRow">

                <div style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                ">

                    ${
                        p.image
                        ?
                        `<img
                            src="${p.image}"
                            alt="${p.name}"
                            style="
                                width:55px;
                                height:55px;
                                object-fit:cover;
                                border-radius:8px;
                            "
                        >`
                        :
                        `<span style="font-size:30px;">🌱</span>`
                    }

                    <span>
                        ${p.name} × ${p.qty}
                    </span>

                </div>

                <b>
                    ₹${p.price * p.qty}
                </b>

            </div>

            `;

        }).join("");
    }
}


// ========================================
// OPEN CART
// ========================================

function openCart() {

    const modal = document.getElementById("cartModal");

    if (modal) {

        modal.classList.remove("hidden");

    }

    updateCart();
}


// ========================================
// CLOSE CART
// ========================================

function closeCart() {

    const modal = document.getElementById("cartModal");

    if (modal) {

        modal.classList.add("hidden");

    }
}


// ========================================
// WHATSAPP ORDER
// ========================================

function orderText(extra = "") {

    const lines = cart.map(function (p) {

        return `${p.name} x ${p.qty} = ₹${p.price * p.qty}`;

    }).join("\n");

    const total = cart.reduce(
        function (sum, p) {
            return sum + (p.price * p.qty);
        },
        0
    );

    const message =

`Namaste A.K Nursery,

${lines || "Website enquiry"}

Product Total: ₹${total}

Delivery charges extra.
Plant & Pot fixing charge extra.

${extra}`;

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

    window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${orderText()}`,
        "_blank"
    );
}


// ========================================
// CONTACT FORM
// ========================================

function sendOrder(e) {

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


// ========================================
// START
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    loadProducts();

    updateCart();

});

console.log("A.K Nursery script loaded successfully");
