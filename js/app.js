document.addEventListener('DOMContentLoaded', function() {
    // Preload images for smoother experience
    const imagesToPreload = [
        'img/logo.png',
        'img/promo1.jpg',
        'img/promo2.jpg',
        'img/hamburguesa1.jpg',
        'img/boneless1.jpg',
        'img/papas1.jpg',
        'img/bebida1.jpg'
    ];
    
    preloadImages(imagesToPreload);
    
    // Remove splash screen after animation completes and images are loaded
    setTimeout(() => {
        document.querySelector('.splash-screen').style.display = 'none';
    }, 1500);  // Changed from 3000 to 1500 (1.5 seconds)
    
    // Image preloader function
    function preloadImages(sources) {
        sources.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Handle image loading errors
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            console.log('Error loading image:', this.src);
            // If you have a placeholder image, use it:
            // this.src = 'img/placeholder.jpg';
            this.onerror = null;
        };
    });
    
    // Delivery type selector functionality
    const deliveryOptions = document.querySelectorAll('.delivery-option');
    let currentDeliveryType = localStorage.getItem('deliveryType') || 'pickup'; // Get from localStorage or default to pickup

    // Find and activate the proper delivery option based on stored preference
    if (deliveryOptions.length > 0) {
        deliveryOptions.forEach(option => {
            if (option.getAttribute('data-type') === currentDeliveryType) {
                deliveryOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            }
        });
    }

    // Only proceed with address info if we're on the index page (which has the delivery selector)
    const deliveryTypeContainer = document.querySelector('.delivery-type-container');
    
    if (deliveryTypeContainer) {
        // Check if address info section exists, if not create it
        let addressInfoSection = document.querySelector('.address-info');
        if (!addressInfoSection) {
            addressInfoSection = document.createElement('div');
            addressInfoSection.className = 'address-info';
            
            // Get stored location or use default
            const storedLocation = localStorage.getItem('deliveryLocation') || 'Centro';
            
            // Default message based on stored delivery type
            if (currentDeliveryType === 'pickup') {
                addressInfoSection.innerHTML = `
                    <div>
                        <i class="fas fa-store"></i>
                        <span class="address-text">Recoger en sucursal: ${storedLocation}</span>
                    </div>
                    <a href="#" class="change-address">Cambiar</a>
                `;
            } else {
                addressInfoSection.innerHTML = `
                    <div>
                        <i class="fas fa-map-marker-alt"></i>
                        <span class="address-text">Entregar en: ${storedLocation}</span>
                    </div>
                    <a href="#" class="change-address">Cambiar</a>
                `;
            }
            
            // Insert after the delivery type selector
            deliveryTypeContainer.insertAdjacentElement('afterend', addressInfoSection);
        }
    
        // Handle delivery option clicks - improved with better address text updates
        deliveryOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Update active state
                deliveryOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Get the selected delivery type
                const deliveryType = option.getAttribute('data-type');
                currentDeliveryType = deliveryType;
                
                // Save delivery type to localStorage
                localStorage.setItem('deliveryType', deliveryType);
                
                // First update the address info based on delivery type
                if (addressInfoSection) {
                    updateAddressInfo(deliveryType, addressInfoSection);
                }
                
                // If switching to delivery mode, handle location selection
                if (deliveryType === 'delivery') {
                    // Check if we should request geolocation
                    const shouldRequestLocation = !localStorage.getItem('deliveryLocation') || 
                        localStorage.getItem('deliveryLocation') === 'Tu dirección actual' ||
                        localStorage.getItem('requestLocationUpdate') === 'true';
                    
                    if (shouldRequestLocation) {
                        requestGeolocation();
                    } else {
                        // Show map selector for delivery mode
                        showLocationMapSelector((selectedAddress) => {
                            if (addressInfoSection) {
                                updateAddressInfo('delivery', addressInfoSection, selectedAddress);
                            }
                        });
                    }
                }
            });
        });
        
        // Change address link functionality
        const changeAddressLink = document.querySelector('.change-address');
        if (changeAddressLink) {
            changeAddressLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (currentDeliveryType === 'pickup') {
                    // Show location selector for pickup
                    const locations = ['Centro', 'Norte', 'Sur', 'Este'];
                    selectLocation(locations, (location) => {
                        localStorage.setItem('deliveryLocation', location);
                        updateAddressInfo(currentDeliveryType, addressInfoSection, location);
                    });
                } else {
                    // First option should be to use current location
                    const geoLocationOption = {
                        text: 'Usar mi ubicación actual',
                        icon: 'fa-location-arrow',
                        action: 'geolocation'
                    };
                    
                    // Get saved addresses
                    const savedAddresses = JSON.parse(localStorage.getItem('savedAddresses')) || 
                        ['Casa', 'Trabajo'];
                    
                    selectDeliveryLocation(geoLocationOption, savedAddresses, (location) => {
                        localStorage.setItem('deliveryLocation', location);
                        updateAddressInfo(currentDeliveryType, addressInfoSection, location);
                    });
                }
            });
        }
        
        // Check if we need to get the location right away (if delivery is selected on page load)
        if (currentDeliveryType === 'delivery') {
            const shouldRequestLocation = localStorage.getItem('deliveryLocation') === 'Tu dirección actual' ||
                localStorage.getItem('requestLocationUpdate') === 'true';
            
            if (shouldRequestLocation) {
                // Use a small delay to let the page load completely
                setTimeout(() => {
                    requestGeolocation();
                }, 1000);
            }
        }
    }
    
    // Function to update address info
    function updateAddressInfo(type, addressInfoSection, location) {
        const addressTextEl = addressInfoSection.querySelector('.address-text');
        const iconEl = addressInfoSection.querySelector('i');
        const storedLocation = location || localStorage.getItem('deliveryLocation') || 
                              (type === 'pickup' ? 'Centro' : 'Tu dirección actual');
        
        if (type === 'pickup') {
            iconEl.className = 'fas fa-store';
            addressTextEl.textContent = 'Recoger en sucursal: ' + storedLocation;
        } else {
            iconEl.className = 'fas fa-map-marker-alt';
            addressTextEl.textContent = 'Entregar en: ' + storedLocation;
        }
        
        // Save to localStorage if not already done
        if (!location) {
            localStorage.setItem('deliveryLocation', storedLocation);
        }
    }
    
    // Make the function globally available
    window.updateAddressInfo = updateAddressInfo;
    
    // Location selector modal function
    function selectLocation(options, callback) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'location-selector-modal';
        
        // Title based on delivery type
        const title = currentDeliveryType === 'pickup' ? 
            'Seleccionar sucursal' : 'Seleccionar dirección';
        
        // Create modal HTML
        let optionsHtml = '';
        options.forEach(option => {
            optionsHtml += `<div class="location-option">${option}</div>`;
        });
        
        modal.innerHTML = `
            <div class="location-modal-content">
                <div class="location-modal-header">
                    <h3>${title}</h3>
                    <button class="close-location-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="location-modal-body">
                    ${optionsHtml}
                    ${currentDeliveryType === 'delivery' ? 
                      '<button class="add-address-btn"><i class="fas fa-plus"></i> Agregar nueva dirección</button>' : ''}
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Show with animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close button functionality
        modal.querySelector('.close-location-modal').addEventListener('click', () => {
            closeLocationModal();
        });
        
        // Location options functionality
        modal.querySelectorAll('.location-option').forEach(option => {
            option.addEventListener('click', () => {
                callback(option.textContent);
                closeLocationModal();
            });
        });
        
        // Add new address button (delivery only)
        const addAddressBtn = modal.querySelector('.add-address-btn');
        if (addAddressBtn) {
            addAddressBtn.addEventListener('click', () => {
                const newAddress = prompt('Ingrese nueva dirección:');
                if (newAddress && newAddress.trim()) {
                    // Save to localStorage
                    const addresses = JSON.parse(localStorage.getItem('savedAddresses')) || 
                        ['Tu dirección actual', 'Casa', 'Trabajo'];
                    addresses.push(newAddress.trim());
                    localStorage.setItem('savedAddresses', JSON.stringify(addresses));
                    
                    // Call callback with new address
                    callback(newAddress.trim());
                    closeLocationModal();
                }
            });
        }
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeLocationModal();
            }
        });
        
        // Function to close modal
        function closeLocationModal() {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }
    
    // Function to request geolocation
    function requestGeolocation() {
        // Show permission dialog with explanation
        showGeolocationDialog(() => {
            // User wants to use geolocation
            if ("geolocation" in navigator) {
                // Show loading indicator
                showLocationLoadingIndicator();
                
                // Options for geolocation request
                const options = {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                };
                
                navigator.geolocation.getCurrentPosition(
                    position => {
                        // Get coordinates
                        const { latitude, longitude } = position.coords;
                        
                        // Reverse geocode to get address
                        reverseGeocode(latitude, longitude)
                            .then(locationData => {
                                // Save to localStorage - we now save both formatted address and complete data
                                localStorage.setItem('deliveryLocation', locationData.formattedAddress);
                                localStorage.setItem('requestLocationUpdate', 'false');
                                localStorage.setItem('userCoordinates', JSON.stringify({
                                    latitude, 
                                    longitude
                                }));
                                localStorage.setItem('userLocationData', JSON.stringify(locationData));
                                // Show success message
                                showToast(`Ubicación obtenida: ${locationData.formattedAddress}`, 'success');
                                
                                // Update UI
                                const addressInfoSection = document.querySelector('.address-info');
                                if (addressInfoSection) {
                                    updateAddressInfo('delivery', addressInfoSection, locationData.formattedAddress);
                                }
                                
                                // Check if we got house number, if not, prompt to refine
                                if (!locationData.addressComponents.houseNumber) {
                                    showConfirmDialog(
                                        'Refinar dirección', 
                                        'No pudimos obtener tu número de casa. ¿Quieres completar los detalles de tu dirección?', 
                                        'Editar dirección',
                                        'Dejar así',
                                        () => {
                                            // User wants to refine
                                            showAddressEditModal(locationData);
                                        }
                                    );
                                }
                                
                                // Hide loading indicator
                                hideLocationLoadingIndicator();
                            })
                            .catch(error => {
                                console.error("Error in reverse geocoding:", error);
                                // Save generic location and coordinates
                                localStorage.setItem('deliveryLocation', 'Mi ubicación actual');
                                localStorage.setItem('userCoordinates', JSON.stringify({
                                    latitude, 
                                    longitude
                                }));
                                // Show warning message
                                showToast('No pudimos obtener tu dirección completa, pero tenemos tu ubicación', 'warning');
                                
                                // Update UI
                                const addressInfoSection = document.querySelector('.address-info');
                                if (addressInfoSection) {
                                    updateAddressInfo('delivery', addressInfoSection, 'Mi ubicación actual');
                                }
                                
                                // Hide loading indicator
                                hideLocationLoadingIndicator();
                            });
                    },
                    error => {
                        console.error("Error getting location:", error);
                        // Hide loading indicator
                        hideLocationLoadingIndicator();
                        // Show error message
                        let errorMessage;
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'Permiso denegado para usar tu ubicación';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'Tu ubicación no está disponible';
                                break;
                            case error.TIMEOUT:
                                errorMessage = 'Se agotó el tiempo para obtener tu ubicación';
                                break;
                            default:
                                errorMessage = 'Error desconocido al obtener tu ubicación';
                        }
                        showToast(errorMessage, 'error');
                        
                        // Flag that we should request location again next time
                        localStorage.setItem('requestLocationUpdate', 'true');
                    },
                    options
                );
            } else {
                // Geolocation not supported
                showToast('Tu navegador no soporta geolocalización', 'error');
            }
        }, () => {
            // User declined geolocation
            showToast('Has declinado compartir tu ubicación', 'warning');
        });
    }
    
    // Function to do reverse geocoding (get address from coordinates)
    async function reverseGeocode(latitude, longitude) {
        // Try to use Google Maps API if available
        if (window.geocoder) {
            try {
                const latlng = { lat: latitude, lng: longitude };
                const response = await new Promise((resolve, reject) => {
                    window.geocoder.geocode({ location: latlng }, (results, status) => {
                        if (status === "OK" && results[0]) {
                            resolve(results);
                        } else {
                            reject("Geocoding failed: " + status);
                        }
                    });
                });
                
                console.log("Google Geocode results:", response);
                
                // Process the Google geocoding response
                if (response && response.length > 0) {
                    const result = response[0];
                    
                    // Extract address components
                    const addressComponents = {};
                    result.address_components.forEach(component => {
                        if (component.types.includes('street_number')) {
                            addressComponents.houseNumber = component.long_name;
                        }
                        if (component.types.includes('route')) {
                            addressComponents.road = component.long_name;
                        }
                        if (component.types.includes('sublocality_level_1') || 
                            component.types.includes('locality')) {
                            addressComponents.neighbourhood = component.long_name;
                        }
                        if (component.types.includes('administrative_area_level_1')) {
                            addressComponents.city = component.long_name;
                        }
                    });
                    
                    return {
                        formattedAddress: result.formatted_address,
                        addressComponents: addressComponents,
                        displayName: result.formatted_address,
                        raw: result
                    };
                }
            } catch (error) {
                console.error("Google Maps geocoding error:", error);
                // Fall through to backup method
            }
        }
        
        // Fall back to Nominatim if Google geocoding fails or isn't available
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log("Nominatim Geocode response data:", data);
            
            const addressComponents = {
                road: data.address.road || data.address.pedestrian || data.address.street || '',
                houseNumber: data.address.house_number || '',
                neighbourhood: data.address.neighbourhood || data.address.suburb || '',
                city: data.address.city || data.address.town || data.address.village || '',
                state: data.address.state || '',
                country: data.address.country || '',
                postcode: data.address.postcode || ''
            };
            
            const formattedAddress = data.display_name || `${addressComponents.road} ${addressComponents.houseNumber}, ${addressComponents.neighbourhood}`;
            
            return {
                formattedAddress,
                addressComponents,
                displayName: data.display_name,
                raw: data
            };
        } catch (error) {
            console.error('Error during reverse geocoding:', error);
            return {
                formattedAddress: `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`,
                addressComponents: {},
                displayName: null,
                raw: null
            };
        }
    }
    
    // Make entire product card clickable
    function setupProductCardClicks() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // Don't navigate if the click was on the add-to-cart button
                if (e.target.closest('.add-to-cart') || e.target.closest('.product-price-actions')) {
                    return;
                }
                
                // Get product details
                const productName = this.querySelector('h3').textContent;
                const productImage = this.querySelector('.product-image img').src;
                const productPrice = this.querySelector('.product-price').textContent;
                const productDescription = this.querySelector('.product-description').textContent;
                
                // Store product details in localStorage to pass to product detail page
                localStorage.setItem('selectedProduct', JSON.stringify({
                    name: productName,
                    image: productImage,
                    price: productPrice,
                    description: productDescription
                }));
                
                // Navigate to product detail page
                window.location.href = 'product.html';
            });
        });
    }
    
    // Call the setup function on page load
    setupProductCardClicks();
    updateFloatingCartButton();
    
    // Add to cart buttons now handle their own events
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Stop event from bubbling up to the card click handler
            
            // Get product card parent element
            const productCard = this.closest('.product-card');
            
            // Get product details
            const productName = productCard.querySelector('h3').textContent;
            const productImage = productCard.querySelector('.product-image img').src;
            const productPrice = productCard.querySelector('.product-price').textContent;
            
            // Store product details in localStorage to pass to product detail page
            localStorage.setItem('selectedProduct', JSON.stringify({
                name: productName,
                image: productImage,
                price: productPrice,
                description: productCard.querySelector('.product-description').textContent
            }));
            
            // Navigate to product detail page
            window.location.href = 'product.html';
        });
    });
    
    // Set up map selector to appear when user switches to delivery mode
    if (typeof showAddressMapSelectorOnDeliveryMode === 'function') {
        showAddressMapSelectorOnDeliveryMode();
    }

    // Add search functionality
    const searchButton = document.querySelector('.header-actions .btn-icon:first-child');
    if (searchButton) {
        searchButton.addEventListener('click', openSearchModal);
    }
});

// Function to open search modal
function openSearchModal() {
    // Create search modal if it doesn't exist
    let searchModal = document.getElementById('search-modal');
    
    if (!searchModal) {
        searchModal = document.createElement('div');
        searchModal.id = 'search-modal';
        searchModal.className = 'search-modal';
        
        searchModal.innerHTML = `
            <div class="search-modal-content">
                <div class="search-modal-header">
                    <div class="search-input-container">
                        <i class="fas fa-search"></i>
                        <input type="text" id="search-input" placeholder="Buscar platillos, ingredientes..." autofocus>
                        <button class="clear-search" id="clear-search"><i class="fas fa-times"></i></button>
                    </div>
                    <button class="close-search-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="search-modal-body">
                    <div class="search-suggestions">
                        <h3>Búsquedas populares</h3>
                        <div class="suggestion-tags">
                            <span class="suggestion-tag">Hamburguesas</span>
                            <span class="suggestion-tag">Boneless</span>
                            <span class="suggestion-tag">Papas</span>
                            <span class="suggestion-tag">Vegetariano</span>
                            <span class="suggestion-tag">Promociones</span>
                        </div>
                    </div>
                    <div class="search-results" id="search-results">
                        <!-- Search results will be displayed here -->
                    </div>
                    <div class="no-results" id="no-results">
                        <i class="fas fa-search"></i>
                        <p>No encontramos resultados para tu búsqueda</p>
                        <p class="no-results-tip">Prueba con otras palabras o revisa la ortografía</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(searchModal);
        
        // Set up event listeners
        const closeButton = searchModal.querySelector('.close-search-modal');
        const searchInput = searchModal.querySelector('#search-input');
        const clearButton = searchModal.querySelector('#clear-search');
        const suggestionTags = searchModal.querySelectorAll('.suggestion-tag');
        
        // Close modal when clicking the close button
        closeButton.addEventListener('click', closeSearchModal);
        
        // Close modal when clicking outside the content
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                closeSearchModal();
            }
        });
        
        // Clear search field
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            updateSearchResults('');
        });
        
        // Handle input in search field
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            updateSearchResults(query);
            
            // Toggle clear button visibility
            clearButton.style.display = query.length > 0 ? 'flex' : 'none';
        });
        
        // Handle suggestion tag clicks
        suggestionTags.forEach(tag => {
            tag.addEventListener('click', () => {
                searchInput.value = tag.textContent;
                updateSearchResults(tag.textContent);
                clearButton.style.display = 'flex';
            });
        });
        
        // Handle keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchModal.classList.contains('open')) {
                closeSearchModal();
            }
        });
    }
    
    // Open the modal
    searchModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Focus the input field
    setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }, 100);
}

// Function to close search modal
function closeSearchModal() {
    const searchModal = document.getElementById('search-modal');
    if (searchModal) {
        searchModal.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
}

// Function to update search results
function updateSearchResults(query) {
    const searchResults = document.getElementById('search-results');
    const noResults = document.getElementById('no-results');
    
    if (!query) {
        // Show suggestions, hide results and no-results
        document.querySelector('.search-suggestions').style.display = 'block';
        searchResults.style.display = 'none';
        noResults.style.display = 'none';
        return;
    }
    
    // Hide suggestions
    document.querySelector('.search-suggestions').style.display = 'none';
    
    // Mock search function - in a real app, you would query your database
    const mockProducts = [
        { id: 1, name: 'Hamburguesa Clásica', category: 'hamburguesas', price: '$120', image: 'img/hamburguesa.jpg' },
        { id: 2, name: 'Hamburguesa Doble', category: 'hamburguesas', price: '$170', image: 'img/hamburguesa.jpg' },
        { id: 3, name: 'Boneless BBQ', category: 'boneless', price: '$150', image: 'img/boneless.jpg' },
        { id: 4, name: 'Papas a la Francesa', category: 'papas', price: '$80', image: 'img/papas.jpg' },
        { id: 5, name: 'Boneless Buffalo', category: 'boneless', price: '$150', image: 'img/boneless.jpg' },
    ];
    
    // Filter products based on query
    const results = mockProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) || 
        product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    if (results.length > 0) {
        // Show results, hide no-results
        searchResults.style.display = 'grid';
        noResults.style.display = 'none';
        
        // Generate HTML for results
        searchResults.innerHTML = results.map(product => `
            <div class="search-result-item" data-id="${product.id}">
                <div class="result-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="result-details">
                    <h4>${product.name}</h4>
                    <span class="result-category">${product.category}</span>
                    <span class="result-price">${product.price}</span>
                </div>
            </div>
        `).join('');
        
        // Add click event to result items
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                // Find the product data
                const productId = parseInt(item.dataset.id);
                const product = mockProducts.find(p => p.id === productId);
                
                if (product) {
                    // Store product details in localStorage
                    localStorage.setItem('selectedProduct', JSON.stringify({
                        name: product.name,
                        image: product.image,
                        price: product.price,
                        description: 'Descripción detallada del producto seleccionado.'
                    }));
                    
                    // Navigate to product detail page
                    window.location.href = 'product.html';
                }
            });
        });
    } else {
        // Show no-results, hide results
        searchResults.style.display = 'none';
        noResults.style.display = 'flex';
    }
}

// Make search functions globally available
window.openSearchModal = openSearchModal;
window.closeSearchModal = closeSearchModal;

// Function to show a confirmation dialog
function showConfirmDialog(title, message, confirmText, cancelText, onConfirm, onCancel) {
    // Create the dialog
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'location-permission-dialog-overlay';
    
    dialogOverlay.innerHTML = `
        <div class="location-permission-dialog">
            <div class="location-dialog-header">
                <i class="fas fa-map-marker-alt"></i>
                <h3>${title}</h3>
            </div>
            <div class="location-dialog-body">
                <p>${message}</p>
            </div>
            <div class="location-dialog-footer">
                <button class="btn-secondary" id="cancel-action">${cancelText}</button>
                <button class="btn-primary" id="confirm-action">${confirmText}</button>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(dialogOverlay);
    document.body.style.overflow = 'hidden';
    
    // Show with animation
    setTimeout(() => {
        dialogOverlay.classList.add('active');
    }, 10);
    
    // Add event listeners
    document.getElementById('confirm-action').addEventListener('click', () => {
        closeDialog();
        if (onConfirm) onConfirm();
    });
    
    document.getElementById('cancel-action').addEventListener('click', () => {
        closeDialog();
        if (onCancel) onCancel();
    });
    
    // Function to close dialog
    function closeDialog() {
        dialogOverlay.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(dialogOverlay);
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Function to update the floating cart button
function updateFloatingCartButton() {
    const floatingCartButton = document.getElementById('floating-cart-button');
    
    // Only show the floating cart button on index.html
    if (floatingCartButton) {
        // Check if we're on the index page - either no path or ends with index.html
        const isIndexPage = window.location.pathname === '/' || 
                            window.location.pathname.endsWith('/') || 
                            window.location.pathname.endsWith('index.html') ||
                            window.location.pathname.toLowerCase().endsWith('/enriques/');
        
        if (!isIndexPage) {
            // Hide button completely on non-index pages
            floatingCartButton.style.display = 'none';
            return;
        }
        
        // Reset display to flex (or default) for index page
        floatingCartButton.style.display = '';
        
        // Get cart items
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // If cart is empty, hide the button
        if (cart.length === 0) {
            floatingCartButton.classList.remove('visible');
            return;
        }
        
        // Get current delivery type
        const deliveryType = localStorage.getItem('deliveryType') || 'pickup';
        
        // Calculate totals
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        const subtotal = cart.reduce((total, item) => total + item.totalPrice, 0);
        
        // Calculate shipping based on delivery type
        const shipping = (deliveryType === 'delivery' && subtotal > 0) ? 35 : 0;
        const totalPrice = subtotal + shipping;
        
        // Update button content
        const countElement = floatingCartButton.querySelector('.cart-button-count');
        const priceElement = floatingCartButton.querySelector('.cart-button-right');
        
        if (countElement) countElement.textContent = totalItems;
        if (priceElement) priceElement.textContent = '$' + totalPrice.toFixed(2);
        
        // Make button visible
        floatingCartButton.classList.add('visible');
        
        // Add click event if not already added
        if (!floatingCartButton.hasAttribute('data-event-added')) {
            floatingCartButton.addEventListener('click', () => {
                // Check if openCartModal function exists (from cart.js)
                if (typeof openCartModal === 'function') {
                    openCartModal();
                } else {
                    alert('Carrito disponible en próxima versión');
                }
            });
            
            floatingCartButton.setAttribute('data-event-added', 'true');
        }
    }
}

// Make updateFloatingCartButton accessible globally
window.updateFloatingCartButton = updateFloatingCartButton;