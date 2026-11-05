(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const products = {
    "orbita-cero": { name: "Órbita cero, Vol. 1", author: "Leo Vidal", category: "Cómic europeo", price: 24, displayPrice: "24,00 €" },
    "jardin-dias": { name: "El jardín de los días", author: "Marta Soler", category: "Novela gráfica", price: 22.5, displayPrice: "22,50 €" },
    "despues-medianoche": { name: "Después de medianoche", author: "Ren Aoki", category: "Manga", price: 26, displayPrice: "26,00 €" },
    "gato-nubes": { name: "Un gato en las nubes, T. 1", author: "Nora Kim", category: "Infantil y juvenil", price: 9.95, displayPrice: "9,95 €" }
  };

  const readStore = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  let cart = readStore("vineta-cart", []);
  let favorites = readStore("vineta-favorites", []);

  const save = () => {
    localStorage.setItem("vineta-cart", JSON.stringify(cart));
    localStorage.setItem("vineta-favorites", JSON.stringify(favorites));
  };


  const toast = document.createElement("div");
  toast.className = "app-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.append(toast);
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }


  const cartPanel = document.createElement("aside");
  cartPanel.className = "cart-panel";
  cartPanel.id = "cart-panel";
  cartPanel.setAttribute("aria-label", "Carrito de compra");
  cartPanel.setAttribute("aria-hidden", "true");
  cartPanel.innerHTML = `
    <div class="cart-panel__head"><div><small>VIÑETA</small><h2>Tu carrito</h2></div>
      <button type="button" class="icon-button" data-close-cart aria-label="Cerrar carrito">×</button></div>
    <div class="cart-panel__items"></div>
    <div class="cart-panel__foot"><p class="cart-panel__total"></p>
      <button type="button" class="cart-checkout">Continuar <span>↗</span></button>
      <small>Demo de interfaz: el pago no está conectado.</small></div>`;
  const overlay = document.createElement("div");
  overlay.className = "app-overlay";
  overlay.hidden = true;
  document.body.append(cartPanel, overlay);

  function cartCount() { return cart.reduce((sum, item) => sum + item.qty, 0); }
  function updateCart() {
    const badge = $(".header__actions .badge");
    if (badge) badge.textContent = cartCount();
    const list = $(".cart-panel__items");
    const total = cart.reduce((sum, item) => sum + products[item.id].price * item.qty, 0);
    list.innerHTML = cart.length ? cart.map(item => {
      const product = products[item.id];
      return `<div class="cart-line"><div><strong>${product.name}</strong><small>${product.displayPrice}</small></div>
        <div class="cart-line__actions"><button data-qty="${item.id}" data-change="-1" aria-label="Restar">−</button>
        <span>${item.qty}</span><button data-qty="${item.id}" data-change="1" aria-label="Sumar">＋</button>
        <button data-remove="${item.id}" aria-label="Eliminar">×</button></div></div>`;
    }).join("") : '<p class="cart-empty">Tu carrito está esperando una buena historia.</p>';
    $(".cart-panel__total").textContent = `Total: ${total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}`;
    save();
  }
  function openCart() {
    updateCart();
    cartPanel.classList.add("is-open");
    cartPanel.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    document.body.classList.add("cart-open");
    $("[data-close-cart]", cartPanel).focus();
  }
  function closeCart() {
    cartPanel.classList.remove("is-open");
    cartPanel.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    document.body.classList.remove("cart-open");
  }
  function addToCart(id) {
    if (!products[id]) return;
    const existing = cart.find(item => item.id === id);
    existing ? existing.qty++ : cart.push({ id, qty: 1 });
    updateCart();
    notify(`${products[id].name} añadido al carrito.`);
  }


  const modal = document.createElement("dialog");
  modal.className = "product-dialog";
  document.body.append(modal);
  function openProduct(id) {
    const product = products[id];
    if (!product) return;
    modal.innerHTML = `<button class="product-dialog__close" type="button" aria-label="Cerrar">×</button>
      <p class="eyebrow">FICHA DEL PRODUCTO</p><h2>${product.name}</h2>
      <p>${product.author} · ${product.category}</p><strong>${product.displayPrice}</strong>
      <button class="btn" type="button" data-modal-add="${id}">Añadir al carrito ↗</button>`;
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  }

  
  function normalize(value) {
    return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }
  function applyFilter(value) {
    const filter = normalize(value || "all");
    let visible = 0;
    $$(".book-card").forEach(card => {
      const category = normalize($(".book-category", card)?.textContent || "");
      const show = filter === "all" || category.includes(filter) ||
        (filter === "comic europeo" && category.includes("comic")) ||
        (filter === "infantil" && category.includes("infantil"));
      card.hidden = !show;
      if (show) visible++;
    });
    $$(".filter").forEach(link => link.classList.toggle("is-active", normalize(link.dataset.filter || "") === filter));
    const grid = $(".book-grid");
    let empty = $(".empty-results");
    if (!visible) {
      if (!empty) {
        empty = document.createElement("p");
        empty.className = "empty-results";
        grid.after(empty);
      }
      empty.textContent = "Todavía no hay títulos en esta categoría. Prueba con otra.";
    } else if (empty) empty.remove();
  }

 
  const searchInput = $("#search-input");
  function searchBooks(query) {
    const term = normalize(query);
    let visible = 0;
    $$(".book-card").forEach(card => {
      const text = normalize(card.textContent);
      const show = !term || text.includes(term);
      card.hidden = !show;
      if (show) visible++;
    });
    let empty = $(".empty-results");
    if (!visible) {
      if (!empty) {
        empty = document.createElement("p");
        empty.className = "empty-results";
        $(".book-grid").after(empty);
      }
      empty.textContent = "No encontramos resultados. Prueba con otro título, autor o género.";
    } else if (empty) empty.remove();
  }

 
  document.addEventListener("click", event => {
    const add = event.target.closest("[data-add-cart], [data-modal-add]");
    if (add) {
      event.preventDefault();
      addToCart(add.dataset.addCart || add.dataset.modalAdd);
      if (modal.open) modal.close();
      return;
    }

    const productLink = event.target.closest("[data-product]");
    if (productLink) {
      event.preventDefault();
      openProduct(productLink.dataset.product);
      return;
    }

    const favorite = event.target.closest(".heart");
    if (favorite) {
      event.preventDefault();
      const card = favorite.closest("[data-product-card]");
      const id = card?.dataset.productCard;
      if (!id) return;
      favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
      favorite.classList.toggle("is-favorite", favorites.includes(id));
      favorite.textContent = favorites.includes(id) ? "♥" : "♡";
      save();
      notify(favorites.includes(id) ? "Guardado en favoritos." : "Eliminado de favoritos.");
      return;
    }

    const filterLink = event.target.closest("[data-filter]");
    if (filterLink) {
      event.preventDefault();
      applyFilter(filterLink.dataset.filter);
      $("#novedades")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (event.target.closest("[data-cart-toggle]")) {
      event.preventDefault();
      openCart();
      return;
    }
    if (event.target.closest("[data-close-cart]") || event.target === overlay) {
      closeCart();
      return;
    }

    const qtyButton = event.target.closest("[data-qty]");
    if (qtyButton) {
      const item = cart.find(entry => entry.id === qtyButton.dataset.qty);
      if (item) {
        item.qty += Number(qtyButton.dataset.change);
        if (item.qty <= 0) cart = cart.filter(entry => entry.id !== item.id);
        updateCart();
      }
      return;
    }
    const removeButton = event.target.closest("[data-remove]");
    if (removeButton) {
      cart = cart.filter(item => item.id !== removeButton.dataset.remove);
      updateCart();
      return;
    }
    if (event.target.closest(".cart-checkout")) {
      notify("El carrito está listo. Para cobrar necesitas conectar una pasarela de pago.");
      return;
    }
    if (event.target.closest(".product-dialog__close")) modal.close();
    if (event.target.closest("[data-account-link]")) {
      event.preventDefault();
      notify("La sección de cuenta estará disponible cuando conectes el registro de usuarios.");
    }
    if (event.target.closest("[data-privacy-link]")) {
      event.preventDefault();
      notify("Añade aquí tu página de política de privacidad.");
    }
  });

 
  $("#site-search")?.addEventListener("submit", event => {
    event.preventDefault();
    searchBooks(searchInput.value);
    $("#novedades")?.scrollIntoView({ behavior: "smooth" });
  });
  searchInput?.addEventListener("input", () => searchBooks(searchInput.value));


  document.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput?.focus();
    }
    if (event.key === "Escape") closeCart();
  });


  $(".newsletter")?.addEventListener("submit", event => {
    event.preventDefault();
    const email = $("#newsletter-email");
    if (!email.checkValidity()) {
      email.reportValidity();
      return;
    }
    notify("¡Gracias por suscribirte! La conexión de envíos debe configurarse en el servidor.");
    event.currentTarget.reset();
  });

 
  $$(".book-card").forEach(card => {
    const id = card.dataset.productCard;
    const heart = $(".heart", card);
    if (heart && favorites.includes(id)) {
      heart.classList.add("is-favorite");
      heart.textContent = "♥";
    }
  });
  updateCart();
})();