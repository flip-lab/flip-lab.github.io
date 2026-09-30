/* =========================================
   flip-lab
   Jacket flipping storefront
========================================= */


/* =========================================
   CONTACT SETTINGS
========================================= */

const CONTACT = {
  messenger: "https://m.me/61594702000948",
  whatsapp: ""
};


/* =========================================
   PRODUCT DATA
========================================= */

const products = [

  {
    id: 1,
    name: "Faded Utility Jacket",
    category: "workwear",
    price: 1450,
    size: "Large",
    condition: "Very Good",
    year: "1990s–2000s",
    color: "Washed Olive",
    description:
      "A worn-in utility jacket with a naturally faded finish and practical workwear construction.",
    image: "",
    featured: true,
    added: "2026-09-01",
    available: true
  },

  {
    id: 2,
    name: "Classic Blue Denim",
    category: "denim",
    price: 1650,
    size: "Medium",
    condition: "Excellent",
    year: "2000s",
    color: "Indigo",
    description:
      "Classic denim construction with a clean silhouette and subtle signs of wear.",
    image: "",
    featured: true,
    added: "2026-09-03",
    available: true
  },

  {
    id: 3,
    name: "Black Flight Bomber",
    category: "bomber",
    price: 1850,
    size: "Large",
    condition: "Excellent",
    year: "2000s",
    color: "Black",
    description:
      "Minimal black bomber with a compact silhouette and lightweight flight-jacket feel.",
    image: "",
    featured: true,
    added: "2026-09-05",
    available: true
  },

  {
    id: 4,
    name: "Nylon Trail Shell",
    category: "windbreaker",
    price: 1250,
    size: "Medium",
    condition: "Very Good",
    year: "1990s",
    color: "Stone",
    description:
      "Lightweight nylon shell with a practical outdoor character and relaxed fit.",
    image: "",
    featured: false,
    added: "2026-08-25",
    available: true
  },

  {
    id: 5,
    name: "Heavy Canvas Chore Coat",
    category: "workwear",
    price: 1950,
    size: "XL",
    condition: "Good",
    year: "1980s–1990s",
    color: "Natural",
    description:
      "Heavy canvas construction with visible character from years of use.",
    image: "",
    featured: false,
    added: "2026-08-18",
    available: true
  },

  {
    id: 6,
    name: "Washed Black Trucker",
    category: "denim",
    price: 1550,
    size: "Medium",
    condition: "Good",
    year: "1990s–2000s",
    color: "Washed Black",
    description:
      "Classic trucker shape with a naturally faded black denim finish.",
    image: "",
    featured: false,
    added: "2026-08-12",
    available: true
  }

];


/* =========================================
   STATE
========================================= */

let activeFilter = "all";
let activeSort = "featured";

let cart = JSON.parse(
  localStorage.getItem("flipCart") || "[]"
);


/* =========================================
   ELEMENTS
========================================= */

const productGrid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");

const productModal = document.getElementById("productModal");
const modalContent = document.getElementById("modalContent");

const toast = document.getElementById("toast");


/* =========================================
   HELPERS
========================================= */

function formatPrice(price) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(price);
}


function getProduct(id) {
  return products.find(product => product.id === Number(id));
}


function saveCart() {
  localStorage.setItem(
    "flipCart",
    JSON.stringify(cart)
  );
}


function showToast(message) {
  toast.textContent = message;

  toast.classList.add("active");

  setTimeout(() => {
    toast.classList.remove("active");
  }, 2200);
}


/* =========================================
   PRODUCT IMAGE
========================================= */

function productImage(product, className = "") {

  if (product.image) {
    return `
      <img
        src="${product.image}"
        alt="${product.name}"
        class="${className}"
        loading="lazy"
      />
    `;
  }

  return `
    <div class="image-placeholder">
      Photo coming soon
    </div>
  `;
}


/* =========================================
   FILTER + SORT
========================================= */

function getVisibleProducts() {

  let visible = products.filter(product => {

    if (!product.available) {
      return false;
    }

    if (activeFilter === "all") {
      return true;
    }

    return product.category === activeFilter;
  });


  if (activeSort === "low") {

    visible.sort((a, b) => {
      return a.price - b.price;
    });

  }


  if (activeSort === "high") {

    visible.sort((a, b) => {
      return b.price - a.price;
    });

  }


  if (activeSort === "newest") {

    visible.sort((a, b) => {
      return new Date(b.added) - new Date(a.added);
    });

  }


  if (activeSort === "featured") {

    visible.sort((a, b) => {
      return Number(b.featured) - Number(a.featured);
    });

  }


  return visible;
}


/* =========================================
   RENDER PRODUCTS
========================================= */

function renderProducts() {

  const visible = getVisibleProducts();

  if (!visible.length) {

    productGrid.innerHTML = `
      <div class="empty-state">
        NO JACKETS FOUND.
      </div>
    `;

    return;
  }


  productGrid.innerHTML = visible.map(product => {

    return `
      <article
        class="product-card"
        data-product-id="${product.id}"
      >

        <div class="product-image">

          ${productImage(product)}

          ${
            product.featured
              ? `<span class="product-badge">Featured</span>`
              : ""
          }

        </div>

        <div class="product-info">

          <div>
            <div class="product-name">
              ${product.name}
            </div>

            <div class="product-meta">
              ${product.category}
              ·
              ${product.size}
              ·
              ${product.condition}
            </div>
          </div>

          <div class="product-price">
            ${formatPrice(product.price)}
          </div>

        </div>

      </article>
    `;

  }).join("");
}


/* =========================================
   CART
========================================= */

function updateCart() {

  cartCount.textContent = cart.length;


  if (!cart.length) {

    cartItems.innerHTML = `
      <div class="empty-state">
        YOUR BAG IS EMPTY.
      </div>
    `;

    cartTotal.textContent = "₱0";

    return;
  }


  let total = 0;


  cartItems.innerHTML = cart.map(id => {

    const product = getProduct(id);

    if (!product) {
      return "";
    }

    total += product.price;


    return `
      <div class="cart-item">

        <div class="cart-item-image">
          ${productImage(product)}
        </div>

        <div class="cart-item-info">

          <h3>
            ${product.name}
          </h3>

          <p>
            ${product.size} · ${formatPrice(product.price)}
          </p>

        </div>

        <button
          class="remove-item"
          data-remove-id="${product.id}"
        >
          Remove
        </button>

      </div>
    `;

  }).join("");


  cartTotal.textContent = formatPrice(total);
}


/* =========================================
   ADD TO CART
========================================= */

function addToCart(id) {

  const product = getProduct(id);

  if (!product || !product.available) {
    return;
  }


  if (cart.includes(product.id)) {

    showToast("This piece is already in your bag.");

    return;
  }


  /*
    One-of-one rule:
    A product can only appear once.
  */

  cart.push(product.id);

  saveCart();

  updateCart();

  showToast(`${product.name} added to your bag.`);

  closeModal();

  openCart();
}


/* =========================================
   REMOVE FROM CART
========================================= */

function removeFromCart(id) {

  cart = cart.filter(
    productId => productId !== Number(id)
  );

  saveCart();

  updateCart();
}


/* =========================================
   CART DRAWER
========================================= */

function openCart() {

  cartDrawer.classList.add("active");
  overlay.classList.add("active");

  document.body.style.overflow = "hidden";
}


function closeCart() {

  cartDrawer.classList.remove("active");
  overlay.classList.remove("active");

  document.body.style.overflow = "";
}


/* =========================================
   PRODUCT MODAL
========================================= */

function openProduct(id) {

  const product = getProduct(id);

  if (!product) {
    return;
  }


  modalContent.innerHTML = `

    <div class="modal-product">

      <div class="modal-image">
        ${productImage(product)}
      </div>

      <div class="modal-info">

        <p class="eyebrow">
          ${product.category}
        </p>

        <h2>
          ${product.name}
        </h2>

        <p class="modal-description">
          ${product.description}
        </p>

        <div class="modal-specs">

          <div class="modal-spec">
            <span>SIZE</span>
            <span>${product.size}</span>
          </div>

          <div class="modal-spec">
            <span>CONDITION</span>
            <span>${product.condition}</span>
          </div>

          <div class="modal-spec">
            <span>ERA</span>
            <span>${product.year}</span>
          </div>

          <div class="modal-spec">
            <span>COLOR</span>
            <span>${product.color}</span>
          </div>

        </div>

        <div class="modal-purchase">

          <div class="modal-price">
            ${formatPrice(product.price)}
          </div>

          <button
            class="modal-add"
            data-add-id="${product.id}"
          >
            Add to Bag
          </button>

        </div>

      </div>

    </div>
  `;


  productModal.showModal();
}


function closeModal() {

  if (productModal.open) {
    productModal.close();
  }
}


/* =========================================
   CHECKOUT
========================================= */

function checkout() {

  if (!cart.length) {

    showToast("Your bag is empty.");

    return;
  }


  const selectedProducts = cart
    .map(id => getProduct(id))
    .filter(Boolean);


  const total = selectedProducts.reduce(
    (sum, product) => sum + product.price,
    0
  );


  const productList = selectedProducts
    .map(product => {
      return `• ${product.name} — ${formatPrice(product.price)}`;
    })
    .join("\n");


  const message = `

Hi flip-lab!

I'd like to buy:

${productList}

Total: ${formatPrice(total)}

Please let me know if these pieces are still available.

Thank you!
`.trim();


  /*
    WhatsApp takes priority if configured.
  */

  if (CONTACT.whatsapp) {

    const phone = CONTACT.whatsapp.replace(/\D/g, "");

    const url =
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");

    return;
  }


  /*
    Messenger fallback.
  */

  if (
    CONTACT.messenger &&
    !CONTACT.messenger.includes("YOURPAGE")
  ) {

    window.open(CONTACT.messenger, "_blank");

    return;
  }


  /*
    If no contact method has been configured,
    copy the message so it can be pasted manually.
  */

  navigator.clipboard
    .writeText(message)
    .then(() => {

      showToast(
        "Order message copied. Add your Messenger or WhatsApp link."
      );

    })
    .catch(() => {

      showToast(
        "Add your Messenger or WhatsApp link in script.js."
      );

    });
}


/* =========================================
   EVENT LISTENERS
========================================= */


/*
  Product click
*/

productGrid.addEventListener("click", event => {

  const card = event.target.closest(".product-card");

  if (!card) {
    return;
  }

  openProduct(card.dataset.productId);
});


/*
  Modal add button
*/

modalContent.addEventListener("click", event => {

  const button = event.target.closest("[data-add-id]");

  if (!button) {
    return;
  }

  addToCart(button.dataset.addId);
});


/*
  Cart remove
*/

cartItems.addEventListener("click", event => {

  const button = event.target.closest("[data-remove-id]");

  if (!button) {
    return;
  }

  removeFromCart(button.dataset.removeId);
});


/*
  Open cart
*/

document
  .getElementById("openCart")
  .addEventListener("click", openCart);


/*
  Close cart
*/

document
  .getElementById("closeCart")
  .addEventListener("click", closeCart);


/*
  Overlay closes cart
*/

overlay.addEventListener("click", closeCart);


/*
  Modal close
*/

document
  .getElementById("closeModal")
  .addEventListener("click", closeModal);


/*
  Sort
*/

document
  .getElementById("sortSelect")
  .addEventListener("change", event => {

    activeSort = event.target.value;

    renderProducts();
  });


/*
  Filters
*/

document.querySelectorAll(".filter").forEach(button => {

  button.addEventListener("click", () => {

    document
      .querySelectorAll(".filter")
      .forEach(item => {
        item.classList.remove("active");
      });


    button.classList.add("active");

    activeFilter = button.dataset.filter;

    renderProducts();
  });

});


/*
  Checkout
*/

document
  .getElementById("checkoutButton")
  .addEventListener("click", checkout);


/*
  Escape key
*/

document.addEventListener("keydown", event => {

  if (event.key !== "Escape") {
    return;
  }

  closeCart();
});


/* =========================================
   FOOTER YEAR
========================================= */

document.getElementById("year").textContent =
  new Date().getFullYear();


/* =========================================
   INITIAL RENDER
========================================= */

renderProducts();

updateCart();
