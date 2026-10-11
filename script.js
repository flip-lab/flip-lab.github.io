
/* =========================================
   flip-lab — Jacket flipping storefront
   Inventory source: Google Sheets API
========================================= */

/* CONTACT SETTINGS */

const CONTACT = {
  messenger: "https://m.me/61594702000948",
  whatsapp: ""
};

/* GOOGLE SHEETS API */

const INVENTORY_API =
  "https://script.google.com/macros/s/AKfycbz-yq0NLlbD6ywh2fq_0cFKKEStHEztLnexivJIhS-38Ob-3nmcGE8bqDiH0EnlzIZH/exec";

/* PRODUCT DATA — LOADED FROM GOOGLE SHEETS */

let products = [];

/* STATE */

let activeFilter = "all";
let activeSort = "featured";
let cart = [];

/* ELEMENTS */

const productGrid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const productModal = document.getElementById("productModal");
const modalContent = document.getElementById("modalContent");
const toast = document.getElementById("toast");

/* HELPERS */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(price);
}

function getProduct(id) {
  return products.find(
    product => product.id === String(id)
  );
}

function saveCart() {
  localStorage.setItem("flipCart", JSON.stringify(cart));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("active");

  setTimeout(() => {
    toast.classList.remove("active");
  }, 2200);
}

/* LOAD AND NORMALIZE INVENTORY */

function normalizeProduct(item) {
  const images = [
    item.image_front,
    item.image_back,
    item.image_detail,
    item.image_measurements
  ]
    .map(value => String(value ?? "").trim())
    .filter(Boolean);

  const status = String(item.status ?? "")
    .trim()
    .toLowerCase();

  return {
    id: String(item.id ?? "").trim(),
    name: String(item.name ?? "").trim(),
    price: Number(item.price),
    category: String(item.category ?? "").trim(),
    size: String(item.size ?? "").trim(),
    condition: String(item.condition ?? "").trim(),
    color: String(item.color ?? "").trim(),
    description: String(item.description ?? "").trim(),
    images,
    featured:
      item.featured === true ||
      String(item.featured).toLowerCase() === "true",
    added: item.added
      ? String(item.added).slice(0, 10)
      : "",
    available: status === "available"
  };
}

async function loadInventory() {
  productGrid.innerHTML = `
    <div class="empty-state">LOADING INVENTORY...</div>
  `;

  try {
    const response = await fetch(INVENTORY_API);

    if (!response.ok) {
      throw new Error("Inventory request failed.");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(
        data.error || "Unexpected inventory response."
      );
    }

    products = data
      .map(normalizeProduct)
      .filter(product =>
        product.id &&
        product.name &&
        Number.isFinite(product.price) &&
        product.price >= 0
      );

    /* Remove unavailable products from the active cart.
       Keep only valid string IDs from the new inventory. */

    try {
      const savedCart = JSON.parse(
        localStorage.getItem("flipCart") || "[]"
      );

      cart = Array.isArray(savedCart)
        ? [...new Set(
            savedCart
              .filter(id => typeof id === "string")
              .filter(id => {
                const product = getProduct(id);
                return product && product.available;
              })
          )]
        : [];
    } catch {
      cart = [];
    }

    saveCart();
    renderProducts();
    updateCart();

  } catch (error) {
    console.error("flip-lab inventory error:", error);

    productGrid.innerHTML = `
      <div class="empty-state">
        INVENTORY COULD NOT BE LOADED.
        PLEASE REFRESH AND TRY AGAIN.
      </div>
    `;
  }
}

/* PRODUCT IMAGE */

function productImage(product, className = "") {
  const image = product.images[0];

  if (image) {
    return `
      <img
        src="${escapeHTML(image)}"
        alt="${escapeHTML(product.name)}"
        class="${escapeHTML(className)}"
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

/* FILTER + SORT */

function getVisibleProducts() {
  let visible = products.filter(product => {
    if (!product.available) return false;

    if (activeFilter === "all") return true;

    return product.category.toLowerCase() ===
      activeFilter.toLowerCase();
  });

  if (activeSort === "low") {
    visible.sort((a, b) => a.price - b.price);
  }

  if (activeSort === "high") {
    visible.sort((a, b) => b.price - a.price);
  }

  if (activeSort === "newest") {
    visible.sort(
      (a, b) => new Date(b.added || 0) -
                new Date(a.added || 0)
    );
  }

  if (activeSort === "featured") {
    visible.sort(
      (a, b) => Number(b.featured) - Number(a.featured)
    );
  }

  return visible;
}

/* RENDER PRODUCTS */

function renderProducts() {
  const visible = getVisibleProducts();

  if (!visible.length) {
    productGrid.innerHTML = `
      <div class="empty-state">NO JACKETS FOUND.</div>
    `;
    return;
  }

  productGrid.innerHTML = visible.map(product => `
    <article
      class="product-card"
      data-product-id="${escapeHTML(product.id)}"
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
            ${escapeHTML(product.name)}
          </div>

          <div class="product-meta">
            ${escapeHTML(product.category)} ·
            ${escapeHTML(product.size)} ·
            ${escapeHTML(product.condition)}
          </div>
        </div>

        <div class="product-price">
          ${formatPrice(product.price)}
        </div>
      </div>
    </article>
  `).join("");
}

/* PRODUCT MODAL */

function openProduct(id) {
  const product = getProduct(id);

  if (!product || !product.available) return;

  const images = product.images;
  const mainImage = images[0] || "";

  const imageMarkup = mainImage
    ? `
      <img
        id="modalMainImage"
        src="${escapeHTML(mainImage)}"
        alt="${escapeHTML(product.name)}"
      />
    `
    : `
      <div class="image-placeholder">
        Photo coming soon
      </div>
    `;

  const galleryMarkup = images.length > 1
    ? `
      <div class="modal-gallery">
        ${images.map((image, index) => `
          <button
            class="modal-thumbnail ${
              index === 0 ? "active" : ""
            }"
            type="button"
            data-image="${escapeHTML(image)}"
            aria-label="View photo ${index + 1}"
            aria-pressed="${index === 0}"
          >
            <img
              src="${escapeHTML(image)}"
              alt="${escapeHTML(product.name)} photo ${index + 1}"
              loading="lazy"
            />
          </button>
        `).join("")}
      </div>
    `
    : "";

  modalContent.innerHTML = `
    <div class="modal-product">

      <div class="modal-image">
        ${imageMarkup}
        ${galleryMarkup}
      </div>

      <div class="modal-info">

        <div class="product-meta">
          CURATED · INSPECTED · CLEANED
        </div>

        <h2>${escapeHTML(product.name)}</h2>

        <div class="modal-category">
          ${escapeHTML(product.category)}
        </div>

        <p class="modal-description">
          ${escapeHTML(product.description)}
        </p>

        <div class="modal-specs">
          <div class="modal-spec">
            <span>SIZE</span>
            <span>${escapeHTML(product.size)}</span>
          </div>

          <div class="modal-spec">
            <span>CONDITION</span>
            <span>${escapeHTML(product.condition)}</span>
          </div>

          <div class="modal-spec">
            <span>COLOR</span>
            <span>${escapeHTML(product.color)}</span>
          </div>

          <div class="modal-spec">
            <span>AVAILABILITY</span>
            <span>One of one</span>
          </div>
        </div>

        <div class="modal-purchase">
          <div class="modal-price">
            ${formatPrice(product.price)}
          </div>

          <button
            class="modal-add"
            type="button"
            data-add-id="${escapeHTML(product.id)}"
          >
            Add to Bag
          </button>
        </div>

      </div>
    </div>
  `;

  productModal.showModal();
}

/* MODAL IMAGE SWITCHING + ADD TO BAG */

modalContent.addEventListener("click", event => {
  const thumbnail = event.target.closest(".modal-thumbnail");

  if (thumbnail) {
    const mainImage =
      document.getElementById("modalMainImage");

    if (!mainImage) return;

    mainImage.src = thumbnail.dataset.image;

    modalContent
      .querySelectorAll(".modal-thumbnail")
      .forEach(item => {
        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");
      });

    thumbnail.classList.add("active");
    thumbnail.setAttribute("aria-pressed", "true");
  }

  const addButton = event.target.closest("[data-add-id]");

  if (addButton) {
    addToCart(addButton.dataset.addId);
  }
});

function closeModal() {
  if (productModal.open) {
    productModal.close();
  }
}

/* CART */

function updateCart() {
  cartCount.textContent = cart.length;

  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="empty-state">YOUR BAG IS EMPTY.</div>
    `;

    cartTotal.textContent = formatPrice(0);
    return;
  }

  let total = 0;

  cartItems.innerHTML = cart.map(id => {
    const product = getProduct(id);

    if (!product || !product.available) return "";

    total += product.price;

    return `
      <div class="cart-item">
        <div class="cart-item-image">
          ${productImage(product)}
        </div>

        <div class="cart-item-info">
          <h3>${escapeHTML(product.name)}</h3>
          <p>
            ${escapeHTML(product.size)} ·
            ${formatPrice(product.price)}
          </p>
        </div>

        <button
          class="remove-item"
          type="button"
          data-remove-id="${escapeHTML(product.id)}"
        >
          Remove
        </button>
      </div>
    `;
  }).join("");

  cartTotal.textContent = formatPrice(total);
}

/* ADD TO CART */

function addToCart(id) {
  const product = getProduct(id);

  if (!product || !product.available) return;

  if (cart.includes(product.id)) {
    showToast("This piece is already in your bag.");
    return;
  }

  cart.push(product.id);

  saveCart();
  updateCart();

  showToast(`${product.name} added to your bag.`);

  closeModal();
  openCart();
}

/* REMOVE FROM CART */

function removeFromCart(id) {
  cart = cart.filter(
    productId => productId !== String(id)
  );

  saveCart();
  updateCart();
}

/* CART DRAWER */

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

/* CHECKOUT */

function checkout() {
  if (!cart.length) {
    showToast("Your bag is empty.");
    return;
  }

  const selectedProducts = cart
    .map(id => getProduct(id))
    .filter(product => product && product.available);

  if (!selectedProducts.length) {
    showToast("No available jackets in your bag.");
    return;
  }

  const total = selectedProducts.reduce(
    (sum, product) => sum + product.price,
    0
  );

  const productList = selectedProducts
    .map(product =>
      `• ${product.name} (${product.id}) — ${
        formatPrice(product.price)
      }`
    )
    .join("\n");

  const message = `
Hi flip-lab!

I'd like to buy:

${productList}

Total: ${formatPrice(total)}

Please let me know if these pieces are still available.

Thank you!
  `.trim();

  navigator.clipboard.writeText(message)
    .then(() => {
      showToast(
        "Order copied. Paste it into Messenger to send your request."
      );

      setTimeout(() => {
        window.open(CONTACT.messenger, "_blank");
      }, 1000);
    })
    .catch(() => {
      window.open(CONTACT.messenger, "_blank");

      showToast(
        "Messenger opened. Please prepare your order message."
      );
    });
}

/* EVENT LISTENERS */

/* Product click */

productGrid.addEventListener("click", event => {
  const card = event.target.closest(".product-card");

  if (!card) return;

  openProduct(card.dataset.productId);
});

/* Cart remove */

cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-remove-id]");

  if (!button) return;

  removeFromCart(button.dataset.removeId);
});

/* Open cart */

document
  .getElementById("openCart")
  .addEventListener("click", openCart);

/* Close cart */

document
  .getElementById("closeCart")
  .addEventListener("click", closeCart);

/* Overlay closes cart */

overlay.addEventListener("click", closeCart);

/* Close modal */

document
  .getElementById("closeModal")
  .addEventListener("click", closeModal);

/* Sort */

document
  .getElementById("sortSelect")
  .addEventListener("change", event => {
    activeSort = event.target.value;
    renderProducts();
  });

/* Filters */

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    activeFilter = button.dataset.filter;

    renderProducts();
  });
});

/* Checkout */

document
  .getElementById("checkoutButton")
  .addEventListener("click", checkout);

/* Escape key */

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
  }
});

/* FOOTER YEAR */

document.getElementById("year").textContent =
  new Date().getFullYear();

/* INITIALIZE */

loadInventory();
