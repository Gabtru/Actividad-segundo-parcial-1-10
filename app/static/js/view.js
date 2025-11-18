// app/static/js/view.js

const View = (function(){

    // ****** Almacenamos referencias al modal ******
    const modalOverlay = document.getElementById('confirm-modal-overlay');
    const modalTitle = document.getElementById('confirm-modal-title');
    const modalMessage = document.getElementById('confirm-modal-message');
    const modalConfirmBtn = document.getElementById('confirm-modal-confirm');
    const modalCancelBtn = document.getElementById('confirm-modal-cancel');
    
    /**
     * Crea la tarjeta HTML para un solo producto.
     * @param {object} product - El objeto producto (viene de la API)
     */
    function createProductCard(product){
        const card = document.createElement('div');
        card.className = "card";
        card.dataset.productId = product.id;
        
        const imageUrl = product.image_path; 
        
        card.innerHTML = `
            <button class="delete-btn" title="Eliminar producto">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 3.25A2.25 2.25 0 0 1 7.25 1h1.5A2.25 2.25 0 0 1 11 3.25V5h-6v-.75ZM11 6V3.25A.75.75 0 0 0 10.25 2.5h-1.5A.75.75 0 0 0 8 3.25V6H4.75a.75.75 0 0 0 0 1.5h.56l.66 6.6a.75.75 0 0 0 .74.65h3.58a.75.75 0 0 0 .74-.65l.66-6.6h.56a.75.75 0 0 0 0-1.5H11Z" clip-rule="evenodd" />
                </svg>
            </button>
            
            <img src="${imageUrl}" alt="${product.name}" class="card-img">
            
            <h4>${product.name}</h4>
            <p><strong>${Model.formatPrice(product.price)}</strong></p>
            
            <div class="card-actions">
                <button class="buy-btn">Añadir al carrito</button>
            </div>
            `;
        return card;
    }

    /**
     * Crea una tarjeta "esqueleto" de carga.
     */
    function createSkeletonCard() {
        const card = document.createElement('div');
        card.className = "skeleton-card";
        card.innerHTML = `
            <div class="img"></div>
            <div class="line"></div>
            <div class="line-short"></div>
        `;
        return card;
    }

    /**
     * Renderiza la lista completa de productos en el contenedor.
     */
    function renderProductList(container, products){
        container.innerHTML = '';
        
        if(products.length === 0){
            container.innerHTML = '<p>No hay productos disponibles. <a href="/nuevo">Crea el primero</a>.</p>';
            return;
        }

        products.forEach(p => {
            container.appendChild(createProductCard(p));
        });
    }

    /**
     * Renderiza el estado de carga con esqueletos.
     */
    function renderLoading(container) {
        container.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            container.appendChild(createSkeletonCard());
        }
    }

    /**
     * Renderiza un estado de error.
     */
    function renderError(container, message) {
        container.innerHTML = `<p class="form-message error" style="display:block;">${message}</p>`;
    }
    
    /**
     * Elimina una tarjeta del DOM.
     */
    function removeCard(productId) {
        const card = document.querySelector(`.card[data-product-id="${productId}"]`);
        if (card) {
            card.remove();
        }
    }

    /**
     * Muestra un mensaje en el formulario (para AJAX).
     * (Esta función ya no se usa, se reemplaza por showNotification)
     */
    function showFormMessage(message, type = 'success') {
        const container = document.getElementById('form-message-container');
        if (container) {
             container.innerHTML = `<div class="form-message ${type}">${message}</div>`;
        }
    }
    
    /**
     * Limpia los mensajes del formulario.
     */
    function clearFormMessage() {
        const container = document.getElementById('form-message-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    /**
     * Muestra una notificación "Toast"
     */
    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3500);
    }

    /**
     * Muestra el modal de confirmación
     */
    function showDeleteModal(title, message) {
        return new Promise((resolve) => {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            
            modalOverlay.classList.add('visible');
            modalOverlay.setAttribute('aria-hidden', 'false');

            modalConfirmBtn.onclick = () => {
                modalOverlay.classList.remove('visible');
                modalOverlay.setAttribute('aria-hidden', 'true');
                resolve(true);
            };
            
            modalCancelBtn.onclick = () => {
                modalOverlay.classList.remove('visible');
                modalOverlay.setAttribute('aria-hidden', 'true');
                resolve(false);
            };
        });
    }

    // Exponemos las funciones
    return { 
        renderProductList,
        renderLoading,
        renderError,
        removeCard,
        showFormMessage,
        clearFormMessage,
        showNotification,
        showDeleteModal
    };
})();



/* =====================================================
   🔹 BLOQUE NUEVO: Botón para probar jsonParseSeguro
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.createElement('button');
    testButton.textContent = 'Probar JSON.parse seguro';
    testButton.style.margin = '1em';
    testButton.style.padding = '0.5em 1em';
    testButton.style.cursor = 'pointer';

    document.body.appendChild(testButton);

    // Contenedor para mostrar resultados en pantalla
    const resultContainer = document.createElement('div');
    resultContainer.id = 'json-test-results';
    resultContainer.style.border = '1px solid #ccc';
    resultContainer.style.padding = '1em';
    resultContainer.style.margin = '1em';
    resultContainer.style.backgroundColor = '#fafafa';
    document.body.appendChild(resultContainer);

    testButton.addEventListener('click', () => {
        const ejemplos = [
            '{"nombre":"Producto válido","precio":10}', // ✅ válido
            '{"nombre": "Producto sin comillas en precio": 10}', // ❌ inválido
            'null', // ✅ válido
            '{nombre: sin comillas}', // ❌ inválido
            '', // ❌ vacío
        ];

        resultContainer.innerHTML = '<h3>Resultados de jsonParseSeguro:</h3>';

        ejemplos.forEach((ej, i) => {
            const resultado = Model.jsonParseSeguro(ej);
            console.log(`Caso ${i + 1}:`, ej, '→ Resultado:', resultado);

            const p = document.createElement('p');
            p.innerHTML = `<strong>Caso ${i + 1}:</strong> <code>${ej}</code><br>
                           Resultado: <code>${JSON.stringify(resultado)}</code>`;
            resultContainer.appendChild(p);
        });
    });
});
