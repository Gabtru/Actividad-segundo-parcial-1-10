// app/static/js/model.js

const Model = (function(){
    
    /**
     * Función segura para parsear JSON.
     * Evita que errores de sintaxis rompan el flujo del programa.
     * Si el texto no es JSON válido, devuelve null.
     */
    function jsonParseSeguro(texto) {
        try {
            return JSON.parse(texto);
        } catch (error) {
            console.error("Error al parsear JSON:", error);
            return null; // Indicamos que el JSON era inválido
        }
    }

    /**
     * Pide los productos a nuestra API del backend.
     */
    async function getProducts() {
        const response = await fetch('/api/productos');
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron cargar los productos.`);
        }

        const text = await response.text();
        const products = jsonParseSeguro(text);

        if (!products) {
            // Este error sí se considera real (respuesta no válida)
            throw new Error('Error al procesar los datos de productos (JSON inválido o corrupto).');
        }

        return products;
    }

    /**
     * Envía datos de un nuevo producto a la API.
     * @param {FormData} formData - Los datos del formulario.
     */
    async function createProduct(formData) {
        const response = await fetch('/api/productos', {
            method: 'POST',
            body: formData
        });

        const text = await response.text();
        const data = jsonParseSeguro(text);

        if (!data) {
            throw new Error('Respuesta JSON inválida del servidor.');
        }

        if (!response.ok) {
            throw new Error(data.errors ? JSON.stringify(data.errors) : 'Error del servidor');
        }

        return data;
    }

    /**
     * Pide a la API que borre un producto.
     * @param {number} id - El ID del producto a borrar.
     */
    async function deleteProduct(id) {
        const response = await fetch(`/api/producto/${id}`, {
            method: 'DELETE'
        });

        const text = await response.text();
        const data = jsonParseSeguro(text);

        if (!data) {
            throw new Error('Respuesta JSON inválida del servidor.');
        }

        if (!response.ok) {
            throw new Error('No se pudo eliminar el producto.');
        }

        return data; // { success: true }
    }

    /**
     * Función de utilidad para formatear precios.
     */
    const formatPrice = price => `€${price.toFixed(2)}`;

    // Exponemos las funciones públicas del modelo
    return { 
        getProducts,
        createProduct,
        deleteProduct,
        formatPrice,
        jsonParseSeguro //  ahora accesible desde Model.jsonParseSeguro()
    };
})();
