document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the product detail page
    if (window.location.pathname.includes('product.html')) {
        // Load selected product data from localStorage
        const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct'));
        
        if (selectedProduct) {
            console.log("Loading product:", selectedProduct);
            
            // Update product details in the page
            document.getElementById('product-name').textContent = selectedProduct.name;
            document.getElementById('product-price').textContent = selectedProduct.price;
            document.getElementById('product-description').textContent = selectedProduct.description;
            document.getElementById('product-image').src = selectedProduct.image;
            
            // Update title
            document.title = selectedProduct.name + ' - Enrique\'s Restaurant';
        }
    }

    // Product options database - we can use this to know available options for each product type
    const productOptionsDB = {
        // Options for hamburgers
        hamburguesa: {
            meatDoneness: [
                {value: 'medium-rare', text: 'Término medio', isRecommended: true},
                {value: 'medium', text: 'Tres cuartos', isPopular: true},
                {value: 'well-done', text: 'Bien cocido'}
            ],
            sides: [
                {value: 'normal', text: 'Papas normales', price: 0, isIncluded: true},
                {value: 'criss-cut', text: 'Papas criss cut', price: 15},
                {value: 'onion-rings', text: 'Aros de cebolla', price: 20}
            ],
            extras: [
                {value: 'cheese', text: 'Extra queso', price: 10},
                {value: 'bacon', text: 'Tocino', price: 20},
                {value: 'guacamole', text: 'Guacamole', price: 15}
            ]
        },
        // We could add more product types here (boneless, etc.)
        boneless: {
            // ... options for boneless
        }
    };

    // Check if we're editing an existing cart item
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.has('edit');
    const editIndex = urlParams.has('index') ? parseInt(urlParams.get('index')) : -1;
    let editingProduct = null;
    
    // Product details variables
    const productName = document.getElementById('product-name').textContent;
    const productPrice = parseFloat(document.getElementById('product-price').textContent.replace('$', ''));
    const quantityInput = document.getElementById('quantity');
    const qtyDisplay = document.getElementById('qty-display');
    const totalPriceDisplay = document.getElementById('total-price');
    
    // Initialize extras and options pricing
    let totalPrice = productPrice;
    let currentQuantity = 1;
    let extraOptions = {
        meatDoneness: '',
        friesType: 0,
        extras: {}
    };
    
    // Required option sections
    const requiredSections = document.querySelectorAll('.options-section.required');

    // If in edit mode, retrieve the product from localStorage and populate form
    if (editMode) {
        editingProduct = JSON.parse(localStorage.getItem('editingProduct'));
        
        if (editingProduct) {
            console.log("Editing product:", editingProduct);
            
            // Update button text for edit mode
            const addToCartBtn = document.querySelector('.btn-add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.textContent = `Actualizar (${editingProduct.quantity}) • $${editingProduct.totalPrice.toFixed(2)}`;
            }
            
            // Set current quantity from the editing product
            currentQuantity = editingProduct.quantity || 1;
            if (quantityInput) {
                quantityInput.value = currentQuantity;
            }
            
            populateProductOptions();
        }
    }
    
    // Function to populate product options when editing
    function populateProductOptions() {
        if (!editingProduct || !editingProduct.options) return;
        
        // Meat doneness
        if (editingProduct.options.meatDoneness) {
            const meatRadio = document.querySelector(`input[name="meat-doneness"][value="${editingProduct.options.meatDoneness}"]`);
            if (meatRadio) {
                meatRadio.checked = true;
                extraOptions.meatDoneness = editingProduct.options.meatDoneness;
            }
        }
        
        // Fries type
        if (editingProduct.options.friesType) {
            const friesRadio = document.querySelector(`input[name="fries-type"][value="${editingProduct.options.friesType}"]`);
            if (friesRadio) {
                friesRadio.checked = true;
                
                // Set price based on fries type
                switch (editingProduct.options.friesType) {
                    case 'criss-cut':
                        extraOptions.friesType = 15;
                        break;
                    case 'onion-rings':
                        extraOptions.friesType = 20;
                        break;
                    default:
                        extraOptions.friesType = 0;
                }
            }
        }
        
        // Extras
        if (editingProduct.options.extras && editingProduct.options.extras.length > 0) {
            editingProduct.options.extras.forEach(extra => {
                const checkbox = document.querySelector(`input[name="extras"][value="${extra.value}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    extraOptions.extras[extra.value] = extra.price;
                }
            });
        }
        
        // Special instructions
        if (editingProduct.options.specialInstructions) {
            const specialInstructions = document.querySelector('.special-instructions');
            if (specialInstructions) {
                specialInstructions.value = editingProduct.options.specialInstructions;
            }
        }
        
        // Update price calculation
        calculateTotal();
    }

    // Function to calculate total price
    function calculateTotal() {
        // Calculate base price with extras
        let basePrice = productPrice;
        
        // Add fries option price
        basePrice += extraOptions.friesType;
        
        // Add extras
        Object.values(extraOptions.extras).forEach(price => {
            basePrice += price;
        });
        
        // Multiply by quantity
        totalPrice = basePrice * currentQuantity;
        
        // Update display
        totalPriceDisplay.textContent = `$${totalPrice.toFixed(2)}`;
        qtyDisplay.textContent = currentQuantity;
        
        // Update button text if in edit mode
        if (editMode && editingProduct) {
            const addToCartBtn = document.querySelector('.btn-add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.textContent = `Actualizar (${currentQuantity}) • $${totalPrice.toFixed(2)}`;
            }
        }
    }
    
    // Quantity buttons with visual feedback
    const decreaseBtn = document.querySelector('.quantity-btn.decrease');
    const increaseBtn = document.querySelector('.quantity-btn.increase');
    
    decreaseBtn.addEventListener('click', function() {
        if (currentQuantity > 1) {
            currentQuantity--;
            quantityInput.value = currentQuantity;
            calculateTotal();
            
            // Add animation class and remove it after animation completes
            quantityInput.classList.add('quantity-changed');
            setTimeout(() => {
                quantityInput.classList.remove('quantity-changed');
            }, 300);
        }
    });
    
    increaseBtn.addEventListener('click', function() {
        currentQuantity++;
        quantityInput.value = currentQuantity;
        calculateTotal();
        
        // Add animation class and remove it after animation completes
        quantityInput.classList.add('quantity-changed');
        setTimeout(() => {
            quantityInput.classList.remove('quantity-changed');
        }, 300);
    });
    
    // Quantity input direct changes
    quantityInput.addEventListener('change', function() {
        if (this.value < 1) {
            this.value = 1;
        }
        currentQuantity = parseInt(this.value);
        calculateTotal();
    });
    
    // Required meat doneness selection
    const meatDonenessRadios = document.querySelectorAll('input[name="meat-doneness"]');
    meatDonenessRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            extraOptions.meatDoneness = this.value;
            // Remove invalid class when an option is selected
            this.closest('.options-section').classList.remove('invalid');
        });
    });
    
    // Fries type selection
    const friesTypeRadios = document.querySelectorAll('input[name="fries-type"]');
    friesTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Remove invalid class when an option is selected
            this.closest('.options-section').classList.remove('invalid');
            
            if (this.value === 'normal') {
                extraOptions.friesType = 0;
            } else if (this.value === 'criss-cut') {
                extraOptions.friesType = 15;
            } else if (this.value === 'onion-rings') {
                extraOptions.friesType = 20;
            }
            calculateTotal();
        });
    });
    
    // Extras checkboxes
    const extrasCheckboxes = document.querySelectorAll('input[name="extras"]');
    extrasCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                switch(this.value) {
                    case 'cheese':
                        extraOptions.extras.cheese = 10;
                        break;
                    case 'bacon':
                        extraOptions.extras.bacon = 20;
                        break;
                    case 'guacamole':
                        extraOptions.extras.guacamole = 15;
                        break;
                }
            } else {
                delete extraOptions.extras[this.value];
            }
            calculateTotal();
        });
    });
    
    // Function to validate required options
    function validateRequiredOptions() {
        let isValid = true;
        
        requiredSections.forEach(section => {
            const radioName = section.querySelector('input[type="radio"]').getAttribute('name');
            const isChecked = document.querySelector(`input[name="${radioName}"]:checked`) !== null;
            
            if (!isChecked) {
                section.classList.add('invalid');
                isValid = false;
            } else {
                section.classList.remove('invalid');
            }
        });
        
        return isValid;
    }
    
    // Add to cart button
    const addToCartBtn = document.querySelector('.btn-add-to-cart');
    addToCartBtn.addEventListener('click', function() {
        // Validate required options first
        if (!validateRequiredOptions()) {
            // Scroll to the first invalid section
            const firstInvalidSection = document.querySelector('.options-section.invalid');
            if (firstInvalidSection) {
                firstInvalidSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return; // Stop execution if validation fails
        }
        
        // Get special instructions
        const specialInstructions = document.querySelector('.special-instructions').value;
        
        // Get selected meat doneness and fries type
        const selectedMeatDoneness = document.querySelector('input[name="meat-doneness"]:checked').value;
        const selectedFriesType = document.querySelector('input[name="fries-type"]:checked').value;
        
        // Get meat doneness display text
        const meatDonenessText = document.querySelector(`input[name="meat-doneness"][value="${selectedMeatDoneness}"]`)
            .closest('.option-item')
            .querySelector('.option-text')
            .textContent;
            
        // Get fries type display text
        const friesTypeText = document.querySelector(`input[name="fries-type"][value="${selectedFriesType}"]`)
            .closest('.option-item')
            .querySelector('.option-text')
            .textContent;
        
        // Get delivery preferences from localStorage
        const deliveryType = localStorage.getItem('deliveryType') || 'pickup';
        const deliveryLocation = localStorage.getItem('deliveryLocation') || 'Centro';
        
        // Create order item object with improved details storage
        const orderItem = {
            id: editMode && editingProduct ? editingProduct.id : generateItemId(),
            name: productName,
            image: document.getElementById('product-image').src,
            basePrice: productPrice,
            quantity: currentQuantity,
            totalPrice: totalPrice,
            options: {
                meatDoneness: selectedMeatDoneness,
                meatDonenessText: meatDonenessText,
                friesType: selectedFriesType,
                friesTypeText: friesTypeText,
                extras: [],
                specialInstructions: specialInstructions
            },
            delivery: {
                type: deliveryType,
                location: deliveryLocation
            }
        };
        
        // Add selected extras to order with improved details
        const extrasCheckboxes = document.querySelectorAll('input[name="extras"]:checked');
        extrasCheckboxes.forEach(checkbox => {
            const extraText = checkbox.closest('.option-item').querySelector('.option-text').textContent;
            const extraPrice = extraOptions.extras[checkbox.value] || 0;
            
            orderItem.options.extras.push({
                name: extraText,
                value: checkbox.value,
                price: extraPrice
            });
        });
        
        // Debug
        console.log("Saving item:", orderItem);
        
        if (editMode && editIndex >= 0) {
            // Update existing cart item
            updateCartItem(editIndex, orderItem);
            showConfirmation(`¡Producto actualizado! ${orderItem.quantity} ${orderItem.name}`);
        } else {
            // Add new item to cart
            addToCart(orderItem);
            showConfirmation(`¡Agregado al carrito! ${orderItem.quantity} ${orderItem.name}`);
        }
        
        // Clear editing product data
        localStorage.removeItem('editingProduct');
        
        // Redirect back to main page after a delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
    
    // Update existing cart item
    function updateCartItem(index, updatedItem) {
        // Get current cart
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Update item at index if it exists
        if (index >= 0 && index < cart.length) {
            cart[index] = updatedItem;
            
            // Save updated cart
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update UI
            if (typeof updateCartCounter === 'function') {
                updateCartCounter();
            }
            if (typeof updateFloatingCartButton === 'function') {
                updateFloatingCartButton();
            }
        } else {
            // Fall back to adding as new item if index is invalid
            addToCart(updatedItem);
        }
    }
    
    // Generate a unique ID for cart items
    function generateItemId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    }
    
    // Add item to cart
    function addToCart(item) {
        // Get current cart or initialize empty array
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Add new item to cart
        cart.push(item);
        
        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart counter
        updateCartCounter();
    }
    
    // Show confirmation message
    function showConfirmation(message) {
        // Create confirmation element
        const confirmation = document.createElement('div');
        confirmation.className = 'confirmation-message';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <i class="fas fa-check-circle"></i>
                <p>${message}</p>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(confirmation);
        
        // Show with animation
        setTimeout(() => {
            confirmation.classList.add('active');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            confirmation.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(confirmation);
            }, 300);
        }, 1200);
    }
    
    // Update cart counter in the header
    function updateCartCounter() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Update counter in header if it exists
        const cartCounter = document.querySelector('.cart-counter');
        if (cartCounter) {
            cartCounter.textContent = totalItems;
            cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    // Initialize cart counter
    updateCartCounter();
});
