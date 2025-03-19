document.addEventListener('DOMContentLoaded', function() {
    // Cart elements
    const cartModal = document.getElementById('cart-modal');
    const closeCartModal = document.querySelector('.close-cart-modal');
    const cartItems = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartShipping = document.getElementById('cart-shipping');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Cart triggers - expanded to include all possible cart buttons
    const cartTriggers = [
        document.querySelector('.header-actions .btn-icon:last-child'), // Cart icon in header
        document.getElementById('floating-cart-button'), // Floating cart button
        document.querySelector('.bottom-nav .nav-item:nth-child(3)') // Cart icon in bottom nav
    ];
    
    // Add event listeners to cart triggers
    cartTriggers.forEach(trigger => {
        if (trigger) {
            trigger.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent navigation for the bottom-nav link
                openCartModal();
            });
        }
    });
    
    // Close modal event
    if (closeCartModal) {
        closeCartModal.addEventListener('click', closeCartModalHandler);
    }
    
    // Close when clicking outside content
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                closeCartModalHandler();
            }
        });
    }
    
    // Add event listener to checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', openCheckoutForm);
    }
    
    // Function to open cart modal
    function openCartModal() {
        if (cartModal) {
            cartModal.classList.add('open');
            document.body.style.overflow = 'hidden';
            
            // Render cart items
            renderCart();
        }
    }
    
    // Function to close cart modal
    function closeCartModalHandler() {
        if (cartModal) {
            cartModal.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    }
    
    // Function to render cart items
    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Clear cart items container
        if (cartItems) cartItems.innerHTML = '';
        
        // Show empty cart message if cart is empty
        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.classList.add('visible');
            if (cartItems) cartItems.style.display = 'none';
            updateCartTotals(0, 0, 0);
            return;
        }
        
        // Hide empty cart message if cart has items
        if (emptyCartMessage) emptyCartMessage.classList.remove('visible');
        if (cartItems) cartItems.style.display = 'block';
        
        // Generate cart items HTML
        let subtotal = 0;
        
        cart.forEach((item, index) => {
            subtotal += item.totalPrice;
            
            // Create cart item element
            const cartItemElement = createCartItemElement(item, index);
            
            // Append cart item to container
            if (cartItems) cartItems.appendChild(cartItemElement);
        });
        
        // Get current delivery type
        const deliveryType = localStorage.getItem('deliveryType') || 'pickup';
        
        // Calculate shipping and total - only charge shipping for delivery
        const shipping = (deliveryType === 'delivery' && subtotal > 0) ? 35 : 0;
        const total = subtotal + shipping;
        
        // Update totals
        updateCartTotals(subtotal, shipping, total);
    }
    
    // Function to create cart item element
    function createCartItemElement(item, index) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.index = index;
        
        // Always show quantity controls regardless of quantity
        const quantityControlsHtml = `
            <div class="cart-item-quantity-controls">
                <button class="cart-item-btn" data-action="decrease">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="cart-item-quantity-display">${item.quantity}</span>
                <button class="cart-item-btn" data-action="increase">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        
        // Create options text - improved to use stored text values
        let optionsText = '';
        if (item.options) {
            // Use stored text values if available, or fallback to the helper functions
            if (item.options.meatDonenessText || item.options.meatDoneness) {
                optionsText += `<span class="cart-item-option">Término: ${item.options.meatDonenessText || getMeatDonenessText(item.options.meatDoneness)}</span>`;
            }
            
            if (item.options.friesTypeText || item.options.friesType) {
                optionsText += `<span class="cart-item-option">${item.options.friesTypeText || getFriesTypeText(item.options.friesType)}</span>`;
            }
            
            if (item.options.extras && item.options.extras.length > 0) {
                const extrasText = item.options.extras.map(extra => extra.name).join(', ');
                optionsText += `<span class="cart-item-option">Extras: ${extrasText}</span>`;
            }
        }
        
        // Create the cart item HTML
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-quantity">${item.quantity}</div>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-header">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.totalPrice.toFixed(2)}</div>
                </div>
                <div class="cart-item-options">${optionsText}</div>
                <div class="cart-item-footer">
                    <div class="cart-item-special">${item.options.specialInstructions || ''}</div>
                    <div class="cart-item-actions">
                        <div class="cart-item-action-buttons">
                            <button class="cart-item-btn edit" data-action="edit" title="Editar">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button class="cart-item-btn delete" data-action="delete" title="Eliminar">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        <div class="cart-item-qty-wrapper">
                            ${quantityControlsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for buttons
        const decreaseBtn = cartItem.querySelector('[data-action="decrease"]');
        const increaseBtn = cartItem.querySelector('[data-action="increase"]');
        const deleteBtn = cartItem.querySelector('[data-action="delete"]');
        const editBtn = cartItem.querySelector('[data-action="edit"]');
        
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                updateCartItemQuantity(index, item.quantity - 1);
            });
        }
        
        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                updateCartItemQuantity(index, item.quantity + 1);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                removeCartItem(index);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                editCartItem(index, item);
            });
        }
        
        return cartItem;
    }
    
    // Function to edit cart item - redirects to product page with item data
    function editCartItem(index, item) {
        console.log("Editing item:", item, "at index:", index);
        
        // Store the product info to edit with all details
        localStorage.setItem('editingProduct', JSON.stringify({
            id: item.id,
            index: index,
            name: item.name,
            image: item.image,
            basePrice: item.basePrice,
            description: item.description || '',
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            options: item.options
        }));
        
        // Close the cart modal
        closeCartModalHandler();
        
        // Redirect to product page with edit parameters
        window.location.href = 'product.html?edit=true&index=' + index;
    }
    
    // Function to update cart item quantity
    function updateCartItemQuantity(index, newQuantity) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (index >= 0 && index < cart.length) {
            const item = cart[index];
            const oldQty = item.quantity;
            
            if (newQuantity <= 0) {
                // Remove item if quantity is 0 or less
                removeCartItem(index);
                return;
            }
            
            // Calculate new total price based on new quantity
            const unitPrice = item.totalPrice / oldQty;
            item.quantity = newQuantity;
            item.totalPrice = parseFloat((unitPrice * newQuantity).toFixed(2));
            
            // Save updated cart
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Re-render cart
            renderCart();
            
            // Update cart counters
            if (typeof updateCartCounter === 'function') {
                updateCartCounter();
            }
            if (typeof updateFloatingCartButton === 'function') {
                updateFloatingCartButton();
            }
        }
    }
    
    // Function to remove cart item
    function removeCartItem(index) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (index >= 0 && index < cart.length) {
            // Remove item at index
            cart.splice(index, 1);
            
            // Save updated cart
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Re-render cart
            renderCart();
            
            // Update cart counters
            if (typeof updateCartCounter === 'function') {
                updateCartCounter();
            }
            if (typeof updateFloatingCartButton === 'function') {
                updateFloatingCartButton();
            }
        }
    }
    
    // Function to update cart totals
    function updateCartTotals(subtotal, shipping, total) {
        if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (cartShipping) cartShipping.textContent = `$${shipping.toFixed(2)}`;
        if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
        
        // Disable checkout button if cart is empty
        if (checkoutBtn) {
            checkoutBtn.disabled = total <= 0;
            if (total <= 0) {
                checkoutBtn.classList.add('disabled');
            } else {
                checkoutBtn.classList.remove('disabled');
            }
        }
    }
    
    // Helper function to get readable meat doneness text
    function getMeatDonenessText(doneness) {
        const donenessMap = {
            'medium-rare': 'Término medio',
            'medium': 'Tres cuartos',
            'well-done': 'Bien cocido'
        };
        return donenessMap[doneness] || doneness;
    }
    
    // Helper function to get readable fries type text
    function getFriesTypeText(friesType) {
        const friesMap = {
            'normal': 'Papas normales',
            'criss-cut': 'Papas criss cut',
            'onion-rings': 'Aros de cebolla'
        };
        return friesMap[friesType] || friesType;
    }
    
    // Function to open checkout form
    function openCheckoutForm() {
        // Create checkout form modal
        const checkoutModal = document.createElement('div');
        checkoutModal.className = 'checkout-modal';
        
        checkoutModal.innerHTML = `
            <div class="checkout-modal-content">
                <div class="checkout-modal-header">
                    <h2>Información de contacto</h2>
                    <button class="close-checkout-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="checkout-modal-body">
                    <form id="checkout-form">
                        <div class="form-group">
                            <label for="customer-name">Nombre completo</label>
                            <input type="text" id="customer-name" required placeholder="Ej. Juan Pérez Rodríguez">
                        </div>
                        <div class="form-group phone-group">
                            <label for="customer-phone-code">Teléfono</label>
                            <div class="phone-inputs">
                                <div class="phone-code-container">
                                    <select id="country-code" class="country-code-select">
                                        <option value="52" selected>+52</option>
                                        <option value="1">+1</option>
                                        <option value="34">+34</option>
                                        <option value="57">+57</option>
                                        <option value="51">+51</option>
                                        <option value="54">+54</option>
                                        <option value="56">+56</option>
                                        <option value="593">+593</option>
                                    </select>
                                </div>
                                <input type="tel" id="customer-phone" placeholder="Número (10 dígitos)" required maxlength="10" class="phone-number">
                            </div>
                            <span class="input-help-text">Ejemplos: +52 (México), +1 (USA/Canadá), +34 (España)</span>
                        </div>
                        <div class="form-group">
                            <label for="customer-email">Correo electrónico</label>
                            <input type="email" id="customer-email" required placeholder="ejemplo@correo.com">
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="terms-checkbox" required>
                                <span>Acepto los <a href="#" class="terms-link">términos y condiciones</a> y la <a href="#" class="terms-link">política de privacidad</a> para el procesamiento de mi información.</span>
                            </label>
                        </div>
                        <div class="checkout-summary">
                            <h3>Resumen del pedido</h3>
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span class="summary-subtotal">$0.00</span>
                            </div>
                            <div class="summary-row">
                                <span>Envío:</span>
                                <span class="summary-shipping">$0.00</span>
                            </div>
                            <div class="summary-row total">
                                <span>Total:</span>
                                <span class="summary-total">$0.00</span>
                            </div>
                        </div>
                        <button type="submit" class="btn-complete-checkout">Completar pedido</button>
                    </form>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(checkoutModal);
        
        // Get cart totals
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let subtotal = 0;
        cart.forEach((item) => {
            subtotal += item.totalPrice;
        });
        
        // Get current delivery type
        const deliveryType = localStorage.getItem('deliveryType') || 'pickup';
        
        // Calculate shipping and total - only charge shipping for delivery
        const shipping = (deliveryType === 'delivery' && subtotal > 0) ? 35 : 0;
        const total = subtotal + shipping;
        
        // Update summary values with delivery type information
        const summarySubtotal = checkoutModal.querySelector('.summary-subtotal');
        const summaryShipping = checkoutModal.querySelector('.summary-shipping');
        const summaryTotal = checkoutModal.querySelector('.summary-total');
        
        if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (summaryShipping) {
            if (deliveryType === 'pickup') {
                summaryShipping.innerHTML = `$0.00 <span class="shipping-note">(Recoger en tienda)</span>`;
            } else {
                summaryShipping.textContent = `$${shipping.toFixed(2)}`;
            }
        }
        if (summaryTotal) summaryTotal.textContent = `$${total.toFixed(2)}`;
        
        // Close modal when clicking the close button
        const closeCheckoutBtn = checkoutModal.querySelector('.close-checkout-modal');
        if (closeCheckoutBtn) {
            closeCheckoutBtn.addEventListener('click', () => {
                closeCheckoutModal(checkoutModal);
            });
        }
        
        // Close when clicking outside content
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                closeCheckoutModal(checkoutModal);
            }
        });
        
        // Input validation and formatting
        const phoneNumber = checkoutModal.querySelector('#customer-phone');
        
        // Only allow numbers in phone input
        if (phoneNumber) {
            phoneNumber.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
        
        // Form submission
        const checkoutForm = checkoutModal.querySelector('#checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form values
                const customerName = checkoutModal.querySelector('#customer-name').value;
                const customerCountryCode = checkoutModal.querySelector('#country-code').value;
                const customerPhone = checkoutModal.querySelector('#customer-phone').value;
                const customerEmail = checkoutModal.querySelector('#customer-email').value;
                
                // Create customer info object
                const customerInfo = {
                    name: customerName,
                    phone: `+${customerCountryCode}${customerPhone}`,
                    phoneCountryCode: customerCountryCode,
                    phoneNumber: customerPhone,
                    email: customerEmail
                };
                
                // Save to localStorage
                localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
                
                // Close checkout modal
                closeCheckoutModal(checkoutModal);
                
                // Close cart modal
                closeCartModalHandler();
                
                // Show order confirmation
                showOrderConfirmation(customerInfo, total);
            });
        }
        
        // Show the modal with animation
        setTimeout(() => {
            checkoutModal.classList.add('active');
            // Focus first field
            const nameInput = checkoutModal.querySelector('#customer-name');
            if (nameInput) nameInput.focus();
        }, 10);
    }
    
    // Function to close checkout modal
    function closeCheckoutModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
    
    // Function to show order confirmation
    function showOrderConfirmation(customerInfo, total) {
        // Create a unique order number
        const orderNumber = 'EN' + Date.now().toString().substr(-6);
        
        // Create confirmation modal
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'order-confirmation-modal';
        
        confirmationModal.innerHTML = `
            <div class="confirmation-modal-content">
                <div class="confirmation-modal-header">
                    <div class="confirmation-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>¡Pedido confirmado!</h2>
                    <p>Gracias por tu compra, ${customerInfo.name}</p>
                </div>
                <div class="confirmation-modal-body">
                    <div class="order-info">
                        <div class="order-info-item">
                            <span>Número de pedido:</span>
                            <span>${orderNumber}</span>
                        </div>
                        <div class="order-info-item">
                            <span>Total:</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                    </div>
                    <p class="confirmation-message">
                        Hemos enviado los detalles de tu pedido a <strong>${customerInfo.email}</strong>.<br>
                        Te contactaremos al teléfono <strong>${customerInfo.phone}</strong> para confirmar la entrega.
                    </p>
                </div>
                <div class="confirmation-modal-footer">
                    <button class="btn-primary btn-continue-shopping">Continuar comprando</button>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(confirmationModal);
        
        // Continue shopping button
        const continueBtn = confirmationModal.querySelector('.btn-continue-shopping');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                // Close confirmation modal
                confirmationModal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(confirmationModal);
                }, 300);
                
                // Clear cart
                localStorage.setItem('cart', JSON.stringify([]));
                
                // Update cart UI
                if (typeof updateCartCounter === 'function') {
                    updateCartCounter();
                }
                if (typeof updateFloatingCartButton === 'function') {
                    updateFloatingCartButton();
                }
                
                // Redirect to home if not already there
                if (!window.location.pathname.includes('index.html') && 
                    !window.location.pathname.endsWith('/') && 
                    !window.location.pathname.endsWith('/enriques/')) {
                    window.location.href = 'index.html';
                }
            });
        }
        
        // Show with animation
        setTimeout(() => {
            confirmationModal.classList.add('active');
        }, 10);
    }
    
    // Add global functions that might be called from other scripts
    window.openCartModal = openCartModal;
    window.closeCartModal = closeCartModalHandler;
    window.renderCart = renderCart;
});
