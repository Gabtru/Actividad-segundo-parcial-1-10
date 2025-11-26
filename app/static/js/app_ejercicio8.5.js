"use strict";

(function () {
  const API_BASE = "https://api.ecommerce-ejemplo.com";

  const estadoGlobalEl = document.querySelector("#estado-global");
  const listaProductosEl = document.querySelector("#lista-productos");
  const detalleContenidoEl = document.querySelector("#detalle-contenido");
  const btnRecargar = document.querySelector("#btn-recargar");

  function setEstadoGlobal(tipo, mensaje) {
    estadoGlobalEl.className = "";
    if (tipo === "ok") estadoGlobalEl.classList.add("estado-ok");
    if (tipo === "error") estadoGlobalEl.classList.add("estado-error");
    if (tipo === "cargando") estadoGlobalEl.classList.add("estado-cargando");
    estadoGlobalEl.textContent = mensaje;
  }

  async function cargarProductos() {
    setEstadoGlobal("cargando", "Cargando catálogo de productos...");
    listaProductosEl.innerHTML = "";

    try {
      const response = await fetch(`${API_BASE}/productos?destacado=true`, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const productos = await response.json();

      if (!Array.isArray(productos) || productos.length === 0) {
        setEstadoGlobal("ok", "No hay productos destacados en este momento.");
        return;
      }

      renderizarProductos(productos);
      setEstadoGlobal("ok", "Catálogo cargado correctamente.");
    } catch (error) {
      console.error(error);
      setEstadoGlobal("error", "No se pudo cargar el catálogo. Revisa la API o la red.");
    }
  }

  function renderizarProductos(productos) {
    listaProductosEl.innerHTML = "";

    for (const producto of productos) {
      const card = document.createElement("article");
      card.className = "card";

      card.innerHTML = `
        <h3>${producto.nombre}</h3>
        <div class="price">${producto.precio.toFixed(2)} €</div>
        <p>${producto.descripcion}</p>
        <button class="btn btn-primary" data-id="${producto.id}" type="button">
          Ver detalle
        </button>
      `;

      listaProductosEl.appendChild(card);
    }

    listaProductosEl
      .querySelectorAll("button[data-id]")
      .forEach((boton) => {
        boton.addEventListener("click", () =>
          cargarDetalleProducto(boton.dataset.id, boton),
        );
      });
  }

  async function cargarDetalleProducto(id, boton) {
    if (!id) return;

    boton.disabled = true;
    const textoOriginal = boton.textContent;
    boton.textContent = "Cargando...";

    try {
      const response = await fetch(
        `${API_BASE}/productos/${encodeURIComponent(id)}`,
        {
          headers: { Accept: "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const producto = await response.json();

      detalleContenidoEl.innerHTML = `
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion_larga}</p>
        <p><strong>Precio:</strong> ${producto.precio.toFixed(2)} €</p>
        <button id="btn-add-cart" class="btn btn-primary" type="button">
          Añadir al carrito
        </button>
      `;

      const btnAddCart = document.querySelector("#btn-add-cart");
      if (btnAddCart) {
        btnAddCart.addEventListener("click", () => addToCart(producto.id));
      }
    } catch (error) {
      console.error(error);
      detalleContenidoEl.innerHTML =
        '<p class="estado-error">No se pudo cargar el detalle del producto.</p>';
    } finally {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  }

  async function addToCart(productId) {
    if (!productId) return;
    setEstadoGlobal("cargando", "Añadiendo producto al carrito...");

    try {
      const response = await fetch(`${API_BASE}/carrito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ producto_id: productId, cantidad: 1 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setEstadoGlobal(
        "ok",
        `Producto añadido al carrito. Total actual: ${data.total.toFixed(2)} €`,
      );
    } catch (error) {
      console.error(error);
      setEstadoGlobal("error", `No se pudo añadir al carrito: ${error.message}`);
    }
  }

  btnRecargar.addEventListener("click", cargarProductos);

  // Cargar el catálogo al iniciar
  cargarProductos();
})();
