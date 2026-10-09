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
    name: "J-001",
    category: "Light Zip-Up Jacket",
    price: 1500,
    size: "Medium",
    condition: "Excellent",
    color: "White",

    description:
      "A breezy, packable zip-up jacket with a crisp white finish and lightweight windbreaker construction.",

    images: [
      "j-001.front.jpg",
      "j-001.back.jpg",
      "j-001.macro.jpg",
      "j-001.measures.png"
    ],

    featured: true,
    added: "2026-10-09",
    available: true
  },

  {
    id: 2,
    name: "Classic Blue Denim",
    category: "denim",
    price: 1650,
    size: "Medium",
    condition: "Excellent",
    color: "Indigo",
    description:
      "Classic denim construction with a clean silhouette and subtle signs of wear.",

    images: [],

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
    color: "Black",
    description:
      "Minimal black bomber with a compact silhouette and lightweight flight-jacket feel.",

    images: [],

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
    color: "Stone",
    description:
      "Lightweight nylon shell with a practical outdoor character and relaxed fit.",

    images: [],

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
    color: "Natural",
    description:
      "Heavy canvas construction with visible character from years of use.",

    images: [],

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
    color: "Washed Black",
    description:
      "Classic trucker shape with a naturally faded black denim finish.",

    images: [],

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

  return products.find(
    product => product.id === Number(id)
  );

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

  const image =
    product.images &&
    product.images.length
      ? product.images[0]
      : "";

  if (image) {

    return `
      <img
        src="${image}"
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

    showToast(
      "This piece is already in your bag."
    );

    return;

  }


  /*
    One-of-one rule:
    A product can only appear once.
  */

  cart.push(product.id);

  saveCart();

  updateCart();

  showToast(
    `${product.name} added to your bag.`
  );

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

/* =========================
   PRODUCT MODAL
========================= */

.product-modal {
  width: min(900px, calc(100% - 30px));
  max-height: 90vh;
  overflow: hidden;
  border: 0;
  padding: 0;
  background: var(--paper);
  color: var(--ink);
}

.product-modal::backdrop {
  background: rgba(0, 0, 0, 0.55);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 5;
}

.modal-product {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  max-height: 90vh;
  min-height: 0;
  overflow: hidden;
}

/* LEFT COLUMN: MAIN PHOTO + THUMBNAILS */

.modal-image {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--card);
}

.modal-image #modalMainImage {
  display: block;
  width: 100%;
  height: min(62vh, 520px);
  min-height: 0;
  flex-shrink: 1;
  object-fit: contain;
  object-position: center;
}

/* Placeholder when no product photo exists */

.modal-image > .image-placeholder {
  min-height: 300px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* THUMBNAIL GALLERY */

.modal-gallery {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  padding: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  background: var(--card);
}

.modal-thumbnail {
  flex: 0 0 72px;
  width: 72px;
  height: 82px;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--paper);
  cursor: pointer;
}

.modal-thumbnail.active {
  border: 2px solid var(--accent);
}

.modal-thumbnail img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* RIGHT COLUMN: PRODUCT DETAILS */

.modal-info {
  min-width: 0;
  min-height: 0;
  padding: 60px 35px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.modal-info h2 {
  margin: 15px 0;
  font-size: clamp(32px, 5vw, 55px);
  line-height: 0.95;
  letter-spacing: -0.06em;
  overflow-wrap: anywhere;
}

.modal-description {
  margin: 15px 0 30px;
  color: var(--muted);
  font-size: 14px;
}

.modal-specs {
  border-top: 1px solid var(--line);
  margin-bottom: 30px;
}

.modal-spec {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
  font-family: "DM Mono", monospace;
  font-size: 10px;
}

/* PRICE + ADD TO BAG */

.modal-purchase {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: auto;
  padding-top: 20px;
}

.modal-price {
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 20px;
  white-space: nowrap;
}

.modal-add {
  flex: 1;
  border: 0;
  padding: 15px 12px;
  background: var(--ink);
  color: var(--paper);
  font-family: "DM Mono", monospace;
  font-size: 10px;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
}

/* MOBILE */

@media (max-width: 650px) {
  .product-modal {
    width: calc(100% - 20px);
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-product {
    grid-template-columns: minmax(0, 1fr);
    max-height: none;
    overflow: visible;
  }

  .modal-image {
    min-height: 0;
  }

  .modal-image #modalMainImage {
    width: 100%;
    height: 42vh;
    min-height: 220px;
    max-height: 380px;
    flex-shrink: 0;
    object-fit: contain;
  }

  .modal-image > .image-placeholder {
    min-height: 220px;
  }

  .modal-gallery {
    padding: 10px;
  }

  .modal-info {
    padding: 30px 24px;
    overflow: visible;
  }

  .modal-info h2 {
    font-size: clamp(32px, 9vw, 45px);
  }

  .modal-description {
    margin-bottom: 22px;
  }

  .modal-specs {
    margin-bottom: 22px;
  }
}


/* =========================================
   MODAL IMAGE SWITCHING
========================================= */

modalContent.addEventListener("click", event => {

  const thumbnail =
    event.target.closest(".modal-thumbnail");


  if (!thumbnail) {
    return;
  }


  const image =
    thumbnail.dataset.image;


  const mainImage =
    document.getElementById("modalMainImage");


  if (!mainImage) {
    return;
  }


  mainImage.src = image;


  modalContent
    .querySelectorAll(".modal-thumbnail")
    .forEach(item => {

      item.classList.remove("active");

    });


  thumbnail.classList.add("active");

});


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

    showToast(
      "Your bag is empty."
    );

    return;

  }


  const selectedProducts = cart
    .map(id => getProduct(id))
    .filter(Boolean);


  const total = selectedProducts.reduce(
    (sum, product) =>
      sum + product.price,
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
    Copy the prepared order message.
  */

  navigator.clipboard
    .writeText(message)

    .then(() => {

      showToast(
        "Order copied. Paste it into Messenger to send your request."
      );


      setTimeout(() => {

        window.open(
          CONTACT.messenger,
          "_blank"
        );

      }, 1000);

    })

    .catch(() => {

      window.open(
        CONTACT.messenger,
        "_blank"
      );


      showToast(
        "Messenger opened. Please copy your order from the bag."
      );

    });

}


/* =========================================
   EVENT LISTENERS
========================================= */


/*
  Product click
*/

productGrid.addEventListener(
  "click",
  event => {

    const card =
      event.target.closest(
        ".product-card"
      );


    if (!card) {
      return;
    }


    openProduct(
      card.dataset.productId
    );

  }
);


/*
  Modal add button
*/

modalContent.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-add-id]"
      );


    if (!button) {
      return;
    }


    addToCart(
      button.dataset.addId
    );

  }
);


/*
  Cart remove
*/

cartItems.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-remove-id]"
      );


    if (!button) {
      return;
    }


    removeFromCart(
      button.dataset.removeId
    );

  }
);


/*
  Open cart
*/

document
  .getElementById("openCart")
  .addEventListener(
    "click",
    openCart
  );


/*
  Close cart
*/

document
  .getElementById("closeCart")
  .addEventListener(
    "click",
    closeCart
  );


/*
  Overlay closes cart
*/

overlay.addEventListener(
  "click",
  closeCart
);


/*
  Modal close
*/

document
  .getElementById("closeModal")
  .addEventListener(
    "click",
    closeModal
  );


/*
  Sort
*/

document
  .getElementById("sortSelect")
  .addEventListener(
    "change",
    event => {

      activeSort =
        event.target.value;

      renderProducts();

    }
  );


/*
  Filters
*/

document
  .querySelectorAll(".filter")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".filter")
          .forEach(item => {

            item.classList.remove(
              "active"
            );

          });


        button.classList.add(
          "active"
        );


        activeFilter =
          button.dataset.filter;


        renderProducts();

      }
    );

  });


/*
  Checkout
*/

document
  .getElementById("checkoutButton")
  .addEventListener(
    "click",
    checkout
  );


/*
  Escape key
*/

document.addEventListener(
  "keydown",
  event => {

    if (event.key !== "Escape") {
      return;
    }

    closeCart();

  }
);


/* =========================================
   FOOTER YEAR
========================================= */

document.getElementById(
  "year"
).textContent =
  new Date().getFullYear();


/* =========================================
   INITIAL RENDER
========================================= */

renderProducts();

updateCart();
