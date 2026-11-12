const products = {
  "orbita-cero": { name: "Órbita cero, Vol. 1", author: "Leo Vidal", price: 24 },
  "jardin-dias": { name: "El jardín de los días", author: "Marta Soler", price: 22.5 },
  "despues-medianoche": { name: "Después de medianoche", author: "Ren Aoki", price: 26 },
  "gato-nubes": { name: "Un gato en las nubes, T. 1", author: "Nora Kim", price: 9.95 }
};
 
let cart = []; // ids de los libros añadidos
const cards = document.querySelectorAll(".book-card");
 
// Pasa a minúsculas y quita tildes para comparar textos
function normalize(text) {
  return text.toLowerCase()
    .replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i")
    .replace(/ó/g, "o").replace(/ú/g, "u");
}
 
// Muestra solo las tarjetas que contienen el texto (vacío = todas)
function mostrar(texto) {
  texto = normalize(texto);
  for (const card of cards) {
    card.hidden = !normalize(card.textContent).includes(texto);
  }
}
 
// Filtros por categoría (menú, botones y categorías)
for (const link of document.querySelectorAll("[data-filter]")) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    const filtro = link.dataset.filter;
    mostrar(filtro === "all" ? "" : filtro);
    document.getElementById("novedades").scrollIntoView();
  });
}
 
// Buscador: filtra mientras se escribe
document.getElementById("site-search").addEventListener("submit", function (event) {
  event.preventDefault();
});
document.getElementById("search-input").addEventListener("input", function (event) {
  mostrar(event.target.value);
});
 
// Botones "+": añaden el libro al carrito y actualizan el número
for (const boton of document.querySelectorAll("[data-add-cart]")) {
  boton.addEventListener("click", function (event) {
    event.preventDefault();
    cart.push(boton.dataset.addCart);
    document.querySelector(".badge").textContent = cart.length;
  });
}
 
// Carrito: muestra el contenido y el total
document.querySelector("[data-cart-toggle]").addEventListener("click", function (event) {
  event.preventDefault();
  let lista = "";
  let total = 0;
  for (const id of cart) {
    lista += products[id].name + "\n";
    total += products[id].price;
  }
  alert(cart.length === 0 ? "Tu carrito está vacío." : lista + "\nTotal: " + total.toFixed(2) + " €");
});
 
// Enlaces a la ficha de un libro
for (const link of document.querySelectorAll("[data-product]")) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    const libro = products[link.dataset.product];
    alert(libro.name + "\n" + libro.author + "\n" + libro.price.toFixed(2) + " €");
  });
}
 
// Corazón de favoritos (stopPropagation evita que abra la ficha)
for (const corazon of document.querySelectorAll(".heart")) {
  corazon.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    corazon.classList.toggle("is-favorite");
    corazon.textContent = corazon.classList.contains("is-favorite") ? "♥" : "♡";
  });
}
 
// Newsletter: el navegador ya valida el correo (required)
document.querySelector(".newsletter").addEventListener("submit", function (event) {
  event.preventDefault();
  alert("¡Gracias por suscribirte!");
  event.target.reset();
});
