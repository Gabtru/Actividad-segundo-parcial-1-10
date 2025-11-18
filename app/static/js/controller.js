// app/static/js/controller.js

const Controller = (function(Model, View){
    
    /**
     * Función principal de inicialización.
     */
    function init() {
        console.log("Controlador profesional (v2) inicializado.");
        
        // 1. Configurar el modo oscuro en todas las páginas
        setupThemeSwitcher();
        
        // 2. Lógica de la página de "Productos"
        const productListContainer = document.getElementById('product-list-container');
        if(productListContainer){
            loadProducts(productListContainer);
            setupProductEventListeners(productListContainer); // <- Este ahora es 'async'
        }

        // 3. Lógica de la página "Nuevo"
        const newProductForm = document.getElementById('form-nuevo-producto');
        if (newProductForm) {
            setupNewProductForm(newProductForm); // <- Este ahora usa 'toasts'
        }
    }

    /**
     * Carga los productos con estado de carga
     */
    async function loadProducts(container) {
        View.renderLoading(container);
        try {
            await new Promise(res => setTimeout(res, 500)); 
            const products = await Model.getProducts();
            View.renderProductList(container, products);
        } catch (error) {
            console.error("Error en loadProducts:", error);
            View.renderError(container, error.message);
        }
    }

    /**
     * Configura los manejadores de eventos para la lista de productos
     * ****** ACTUALIZADO: Ahora es 'async' para usar el modal ******
     */
    function setupProductEventListeners(container) {
        
        // Hacemos el listener 'async' para poder usar 'await'
        container.addEventListener('click', async (e) => {
            const target = e.target;
            
            // Lógica de borrado
            if (target.classList.contains('delete-btn')) {
                e.preventDefault(); 
                
                const card = target.closest('.card');
                const id = card.dataset.productId;
                
                // Sacamos el nombre del producto de la tarjeta para el modal
                const productName = card.querySelector('h4').textContent;
                
                // ****** REEMPLAZO DEL 'confirm()' NATIVO ******
                // 1. Mostramos el modal y esperamos la respuesta (true/false)
                const confirmed = await View.showDeleteModal(
                    'Confirmar borrado', 
                    `¿Seguro que quieres eliminar el producto "${productName}"?`
                );

                // 2. Si el usuario confirmó...
                if (confirmed) {
                    try {
                        await Model.deleteProduct(id);
                        View.removeCard(id); // Elimina del DOM
                        
                        // 3. Mostramos una notificación "Toast"
                        View.showNotification('Producto eliminado con éxito', 'info');
                        
                    } catch (error) {
                        // 4. Mostramos error si falla la API
                        View.showNotification(error.message, 'error');
                    }
                }
                // Si 'confirmed' es false, no hacemos nada (el modal se cerró)
            }
        });
    }

    /**
     * Configura el formulario de "Nuevo Producto" para AJAX
     * ****** ACTUALIZADO: Usa notificaciones "Toast" ******
     */
    function setupNewProductForm(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            View.clearFormMessage(); // Limpia mensajes de formulario antiguos (si los hubiera)
            
            const submitButton = document.getElementById('submit-button');
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';

            const formData = new FormData(form);

            try {
                const newProduct = await Model.createProduct(formData);
                
                // ****** NUEVO: Notificación Toast de éxito ******
                View.showNotification(`¡Producto "${newProduct.name}" creado!`, 'success');
                form.reset();

            } catch (error) {
                console.error(error.message);
                let errorMsg = 'Error al crear el producto. Revisa los campos.';
                
                if (error.message.includes('{')) {
                    const errors = JSON.parse(error.message);
                    errorMsg = Object.values(errors).map(err => err[0]).join('; ');
                }
                
                // ****** NUEVO: Notificación Toast de error ******
                View.showNotification(errorMsg, 'error');
                
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Crear';
            }
        });
    }

    /**
     * Configura el interruptor de modo oscuro
     */
    function setupThemeSwitcher() {
        const switcher = document.getElementById('theme-switcher');
        if (!switcher) return;

        switcher.addEventListener('click', () => {
            const currentTheme = document.documentElement.dataset.theme || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.dataset.theme = newTheme;
            localStorage.setItem('theme', newTheme);
        });
    }

    // Inicializa el controlador
    document.addEventListener('DOMContentLoaded', init);

})(Model, View);