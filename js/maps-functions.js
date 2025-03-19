/**
 * Google Maps specific functions for location selection
 */

// Function to show the map-based location selector
function showLocationMapSelector(callback) {
    // Create modal for map selection
    const mapModal = document.createElement('div');
    mapModal.className = 'location-selector-modal location-modal-wide';
    
    mapModal.innerHTML = `
        <div class="location-modal-content">
            <div class="location-modal-header">
                <h3>Selecciona tu ubicación de entrega</h3>
                <button class="close-location-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="location-modal-body">
                <div class="location-search-container">
                    <input type="text" class="location-search-input" id="location-search-input" placeholder="Buscar tu calle, colonia o referencia">
                </div>
                <p class="search-help-text">Busca tu dirección o mueve el mapa para seleccionar tu ubicación</p>
                <div class="map-container">
                    <div id="map"></div>
                    <div class="map-center-marker">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="map-address-display" id="map-address-display">
                        <i class="fas fa-spinner fa-spin"></i> Obteniendo ubicación...
                    </div>
                    <button class="my-location-button" title="Usar mi ubicación actual">
                        <i class="fas fa-location-arrow"></i>
                    </button>
                </div>
                <div class="location-address-actions">
                    <button class="btn-secondary" id="cancel-map-selection">Cancelar</button>
                    <button class="btn-primary" id="confirm-map-selection">Confirmar ubicación</button>
                </div>
            </div>
        </div>
    `;
    
    // Add to document and show with animation
    document.body.appendChild(mapModal);
    document.body.style.overflow = 'hidden';
    
    // Current selected location
    let selectedLocation = {
        address: '',
        lat: 0,
        lng: 0,
        components: {}
    };
    
    let map, autocomplete;
    
    setTimeout(() => {
        mapModal.classList.add('active');
        
        // Check if Google Maps API is loaded
        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
            initializeMapSelector();
        } else {
            // If not loaded yet, wait for it
            document.addEventListener('google-maps-ready', initializeMapSelector);
            // Show loading message
            document.getElementById('map-address-display').innerHTML = 
                '<i class="fas fa-spinner fa-spin"></i> Cargando mapa...';
        }
    }, 10);
    
    // Initialize the map
    function initializeMapSelector() {
        // Default coordinates (Mexico City by default)
        let defaultLat = 19.432608;
        let defaultLng = -99.133209;
        
        // Try to get user's current position from localStorage if available
        const storedCoords = JSON.parse(localStorage.getItem('userCoordinates'));tes'));
        if (storedCoords && storedCoords.latitude && storedCoords.longitude) {
            defaultLat = storedCoords.latitude; 'number' && 
            defaultLng = storedCoords.longitude;       typeof storedCoords.longitude === 'number') {
        }        defaultLat = storedCoords.latitude;
        g = storedCoords.longitude;
        // Initialize map
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: defaultLat, lng: defaultLng },rror("Error parsing stored coordinates:", error);
            zoom: 16,coordinates
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy',.Map(document.getElementById('map'), {
            zoomControl: true center: { lat: defaultLat, lng: defaultLng },
        });    zoom: 16,
        alse,
        // Initialize search box
        const searchInput = document.getElementById('location-search-input');
        autocomplete = new google.maps.places.Autocomplete(searchInput);
        autocomplete.setFields(['address_components', 'geometry', 'name', 'place_id', 'formatted_address']);    zoomControl: true
        
        // Add listener for place changed
        autocomplete.addListener('place_changed', function() {iendly options
            const place = autocomplete.getPlace();nt.getElementById('location-search-input');
            if (!place.geometry) {new google.maps.places.Autocomplete(searchInput, {
                return;ields: ['address_components', 'geometry', 'name', 'place_id', 'formatted_address'],
            }componentRestrictions: { country: 'mx' }, // Restrict to Mexico - change this based on your target country
            ioritize complete addresses
            // Center map to the selected place
            map.setCenter(place.geometry.location);
            updateSelectedLocation(place.geometry.location.lat(), place.geometry.location.lng(), place);Set the bounds to prioritize results near the current map view
        });const updateAutocompleteArea = () => {
        
        // Update the selected location when the map is idle (after dragging/zooming)etBounds());
        map.addListener('idle', function() {
            const center = map.getCenter();
            updateSelectedLocation(center.lat, center.lng());
        });// Update bounds after the map is fully loaded
        ed', updateAutocompleteArea);
        // Initial location update
        updateSelectedLocation(defaultLat, defaultLng);// Add listener for place changed
        ner('place_changed', function() {
        // My location button
        const myLocationBtn = mapModal.querySelector('.my-location-button');
        myLocationBtn.addEventListener('click', () => { of a place that was not suggested
            if (navigator.geolocation) {sta de sugerencias', 'warning');
                navigator.geolocation.getCurrentPosition(position => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitudemap to the selected place
                    };y.location);
                    map.setCenter(pos);t(), place.geometry.location.lng(), place);
                    updateSelectedLocation(pos.lat, pos.lng);
                }, error => {
                    console.error('Error getting current location:', error);ing)
                    showToast('No se pudo obtener tu ubicación actual', 'error');ener('idle', function() {
                });nter = map.getCenter();
            } else {
                showToast('Tu navegador no soporta geolocalización', 'error');
            }
        });   // Initial location update
    }    updateSelectedLocation(defaultLat, defaultLng);
    
    // Update selected location based on map center
    function updateSelectedLocation(lat, lng, placeDetails = null) {dal.querySelector('.my-location-button');
        selectedLocation.lat = lat;ner('click', () => {
        selectedLocation.lng = lng;    if (navigator.geolocation) {
        
        const mapAddressDisplay = document.getElementById('map-address-display');{
        if (mapAddressDisplay) {
            mapAddressDisplay.textContent = 'Obteniendo dirección...';               lng: position.coords.longitude
        }            };
        Center(pos);
        if (placeDetails) {
            // If we have place details from autocomplete, use them
            processLocationFromPlaceDetails(placeDetails);    console.error('Error getting current location:', error);
        } else {ción actual', 'error');
            // Otherwise, reverse geocode from coordinates
            reverseGeocode(lat, lng).then(locationData => {
                selectedLocation.address = locationData.formattedAddress;;
                selectedLocation.components = locationData.addressComponents;
                
                if (mapAddressDisplay) {
                    mapAddressDisplay.textContent = locationData.formattedAddress;
                } based on map center
            }).catch(error => {) {
                console.error('Error reverse geocoding:', error);
                if (mapAddressDisplay) {
                    mapAddressDisplay.textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;le.error('Invalid coordinates:', lat, lng);
                }wToast('Coordenadas inválidas. Intenta buscar nuevamente.', 'error');
            });   return;
        }   }
    }    
    
    // Process location information from place details
    function processLocationFromPlaceDetails(placeDetails) {
        const mapAddressDisplay = document.getElementById('map-address-display');const mapAddressDisplay = document.getElementById('map-address-display');
        if (mapAddressDisplay) {
            mapAddressDisplay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obteniendo dirección...';
        } = placeDetails.formatted_address;
        
        if (placeDetails) {   mapAddressDisplay.textContent = placeDetails.formatted_address;
            // If we have place details from autocomplete, use them   }
            processLocationFromPlaceDetails(placeDetails);}
        } else {
            // Otherwise, reverse geocode from coordinatests) {
            reverseGeocode(lat, lng).then(locationData => {
                selectedLocation.address = locationData.formattedAddress;
                selectedLocation.components = locationData.addressComponents; {
                
                if (mapAddressDisplay) {   addressComponents.houseNumber = component.long_name;
                    mapAddressDisplay.textContent = locationData.formattedAddress;
                }
            }).catch(error => {   addressComponents.road = component.long_name;
                console.error('Error reverse geocoding:', error);
                if (mapAddressDisplay) {evel_1') || 
                    mapAddressDisplay.textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
                }   addressComponents.neighbourhood = component.long_name;
            });
        }_level_1')) {
    }   addressComponents.city = component.long_name;
     }
    // Process location information from place details});
    function processLocationFromPlaceDetails(placeDetails) {
        const mapAddressDisplay = document.getElementById('map-address-display');   selectedLocation.components = addressComponents;
           }
        if (placeDetails.formatted_address) {}
            selectedLocation.address = placeDetails.formatted_address;
            if (mapAddressDisplay) {
                mapAddressDisplay.textContent = placeDetails.formatted_address;mapModal.querySelector('.close-location-modal').addEventListener('click', closeMapModal);
            }
        }
        document.getElementById('cancel-map-selection').addEventListener('click', closeMapModal);
        if (placeDetails.address_components) {
            // Extract address components
            const addressComponents = {};p-selection').addEventListener('click', () => {
            placeDetails.address_components.forEach(component => {dress) {
                if (component.types.includes('street_number')) {
                    addressComponents.houseNumber = component.long_name;es', JSON.stringify({
                }
                if (component.types.includes('route')) {longitude: selectedLocation.lng
                    addressComponents.road = component.long_name;}));
                }
                if (component.types.includes('sublocality_level_1') || lable
                    component.types.includes('locality')) {
                    addressComponents.neighbourhood = component.long_name;   localStorage.setItem('userAddressComponents', JSON.stringify(selectedLocation.components));
                }}
                if (component.types.includes('administrative_area_level_1')) {
                    addressComponents.city = component.long_name;al
                }closeMapModal();
            });
            pt to add it
            selectedLocation.components = addressComponents;components.houseNumber) {
        }
    }
     tu número de casa. ¿Quieres completar los detalles de tu dirección?',
    // Close button functionalitycción',
    mapModal.querySelector('.close-location-modal').addEventListener('click', closeMapModal);así',
    
    // Cancel button functionalitye the address
    document.getElementById('cancel-map-selection').addEventListener('click', closeMapModal);
    
    // Confirm button functionalitymponents: selectedLocation.components
    document.getElementById('confirm-map-selection').addEventListener('click', () => {  }, callback);
        if (selectedLocation.address) {
            // Save coordinates
            localStorage.setItem('userCoordinates', JSON.stringify({
                latitude: selectedLocation.lat,   callback(selectedLocation.address);
                longitude: selectedLocation.lng  }
            }));
            
            // Save address components if availablese it
            if (selectedLocation.components) {   callback(selectedLocation.address);
                localStorage.setItem('userAddressComponents', JSON.stringify(selectedLocation.components));
            }
               showToast('Por favor selecciona una ubicación válida', 'warning');
            // Close the modal }
            closeMapModal();});
            
            // If the address is missing house number, prompt to add it
            if (!selectedLocation.components.houseNumber) {', (e) => {
                showConfirmDialog(Modal) {
                    'Refinar dirección',   closeMapModal();
                    'No pudimos obtener tu número de casa. ¿Quieres completar los detalles de tu dirección?', }
                    'Editar dirección',});
                    'Dejar así',
                    () => {
                        // User wants to refine the address
                        showAddressEditModal({.remove('active');
                            formattedAddress: selectedLocation.address,
                            addressComponents: selectedLocation.components
                        }, callback);document.body.style.overflow = 'auto';
                    },
                    () => { map resources
                        // User doesn't want to refine
                        callback(selectedLocation.address);complete = null;
                    }   }, 300);
                );   }
            } else {}
                // We have complete address, just use it
                callback(selectedLocation.address);
            }nOption, addresses, callback) {
        } else {
            showToast('Por favor selecciona una ubicación válida', 'warning');
        }modal.className = 'location-selector-modal';
    });
    L with geolocation option and map option
    // Close when clicking outside
    mapModal.addEventListener('click', (e) => {
        if (e.target === mapModal) {}"></i>
            closeMapModal();pan>${geoLocationOption.text}</span>
        }
    });
    i>
    // Function to close modalpan>Seleccionar en el mapa</span>
    function closeMapModal() {  </div>
        mapModal.classList.remove('active');`;
        setTimeout(() => {
            document.body.removeChild(mapModal);
            document.body.style.overflow = 'auto';
             optionsHtml += `<div class="location-option">${address}</div>`;
            // Clean up map resources});
            map = null;
            autocomplete = null;
        }, 300);
    }>
}
utton class="close-location-modal"><i class="fas fa-times"></i></button>
// Enhanced delivery location selector with map
function selectDeliveryLocation(geoLocationOption, addresses, callback) {on-modal-body">
    // Create modal for location selection
    const modal = document.createElement('div');utton class="add-address-btn"><i class="fas fa-plus"></i> Agregar nueva dirección</button>
    modal.className = 'location-selector-modal';div>
      </div>
    // Create modal HTML with geolocation option and map option`;
    let optionsHtml = `
        <div class="location-option geolocation-option">animation
            <i class="fas ${geoLocationOption.icon}"></i>
            <span>${geoLocationOption.text}</span>e.overflow = 'hidden';
        </div>
        <div class="location-option map-option">al.classList.add('active');
            <i class="fas fa-map-marker-alt"></i>}, 10);
            <span>Seleccionar en el mapa</span>
        </div>
    `;modal.querySelector('.close-location-modal').addEventListener('click', closeLocationModal);
    
    // Add saved addresses
    addresses.forEach(address => {location-option').addEventListener('click', () => {
        optionsHtml += `<div class="location-option">${address}</div>`;
    });tion after closing the modal
    
    modal.innerHTML = `estGeolocation();
        <div class="location-modal-content"> }, 300);
            <div class="location-modal-header">});
                <h3>Seleccionar dirección</h3>
                <button class="close-location-modal"><i class="fas fa-times"></i></button>
            </div>-option').addEventListener('click', () => {
            <div class="location-modal-body">
                ${optionsHtml}or after closing the modal
                <button class="add-address-btn"><i class="fas fa-plus"></i> Agregar nueva dirección</button>
            </div>LocationMapSelector(callback);
        </div> }, 300);
    `;});
    
    // Add to document and show with animation
    document.body.appendChild(modal);(.geolocation-option):not(.map-option)').forEach(option => {
    document.body.style.overflow = 'hidden';() => {
    setTimeout(() => {ontent);
        modal.classList.add('active'); closeLocationModal();
    }, 10); });
    });
    // Close button functionality
    modal.querySelector('.close-location-modal').addEventListener('click', closeLocationModal);
    = modal.querySelector('.add-address-btn');
    // Geolocation option functionality
    modal.querySelector('.geolocation-option').addEventListener('click', () => {
        closeLocationModal(); showAddNewAddressDialog(callback, closeLocationModal);
        // Request geolocation after closing the modal   });
        setTimeout(() => {}
            requestGeolocation();
        }, 300);
    });', (e) => {
    
    // Map option functionality   closeLocationModal();
    modal.querySelector('.map-option').addEventListener('click', () => { }
        closeLocationModal();});
        // Show map selector after closing the modal
        setTimeout(() => {
            showLocationMapSelector(callback);
        }, 300);move('active');
    });
    
    // Saved location options functionalityment.body.style.overflow = 'auto';
    modal.querySelectorAll('.location-option:not(.geolocation-option):not(.map-option)').forEach(option => {   }, 300);
        option.addEventListener('click', () => {   }
            callback(option.textContent);}
            closeLocationModal();
        });
    });, closeParentModal) {
       // ...existing code implementation...
    // Add new address button}
    const addAddressBtn = modal.querySelector('.add-address-btn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', () => {Google Maps specific functions for location selection
            showAddNewAddressDialog(callback, closeLocationModal); */
        });
    }
    Dialog(acceptCallback, declineCallback) {
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {dialogOverlay.className = 'location-permission-dialog-overlay';
            closeLocationModal();
        }
    });
    
    // Function to close modallt"></i>
    function closeLocationModal() {3>Permiso de ubicación</h3>
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';>Esto nos permite sugerirte direcciones cercanas y optimizar tu entrega.</p>
        }, 300);
    }
}
utton class="btn-primary" id="accept-location">Permitir acceso</button>
// Function to show dialog for adding a new address manuallydiv>
function showAddNewAddressDialog(callback, closeParentModal) {  </div>
    // ...existing code implementation...`;
}

/**;
 * Google Maps specific functions for location selectiondocument.body.style.overflow = 'hidden';
 */
tion
// Function to show geolocation permission dialog
function showGeolocationDialog(acceptCallback, declineCallback) {logOverlay.classList.add('active');
    // Create the dialog}, 10);
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'location-permission-dialog-overlay';
    pt-location').addEventListener('click', () => {
    dialogOverlay.innerHTML = `ialog();
        <div class="location-permission-dialog"> acceptCallback();
            <div class="location-dialog-header">});
                <i class="fas fa-map-marker-alt"></i>
                <h3>Permiso de ubicación</h3>ine-location').addEventListener('click', () => {
            </div>alog();
            <div class="location-dialog-body"> declineCallback();
                <p>Para entregarte de manera precisa, necesitamos acceder a tu ubicación.</p>});
                <p>Esto nos permite sugerirte direcciones cercanas y optimizar tu entrega.</p>
            </div>
            <div class="location-dialog-footer">
                <button class="btn-secondary" id="decline-location">Ahora no</button>sList.remove('active');
                <button class="btn-primary" id="accept-location">Permitir acceso</button>
            </div>y);
        </div>ment.body.style.overflow = 'auto';
    `;   }, 300);
       }
    // Add to document}
    document.body.appendChild(dialogOverlay);
    document.body.style.overflow = 'hidden';ded for geolocation
    or() {
    // Show with animation
    setTimeout(() => {
        dialogOverlay.classList.add('active');location-loading-indicator';
    }, 10);
    
    // Add event listenersner"></div>
    document.getElementById('accept-location').addEventListener('click', () => {>Obteniendo tu ubicación...</p>
        closeGeolocationDialog();  </div>
        acceptCallback();`;
    });
    
    document.getElementById('decline-location').addEventListener('click', () => {document.body.appendChild(loadingIndicator);
        closeGeolocationDialog();
        declineCallback();tion
    });
    dingIndicator.classList.add('active');
    // Function to close dialog   }, 10);
    function closeGeolocationDialog() {}
        dialogOverlay.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(dialogOverlay);= document.querySelector('.location-loading-indicator');
            document.body.style.overflow = 'auto';
        }, 300);lassList.remove('active');
    }
}ment.body.removeChild(loadingIndicator);
   }, 300);
// Also define these helper functions needed for geolocation   }
function showLocationLoadingIndicator() {}
    // Create the loading indicator
    const loadingIndicator = document.createElement('div'); type = 'info') {
    loadingIndicator.className = 'location-loading-indicator';
    loadingIndicator.innerHTML = `v');
        <div class="location-loading-content">toast.className = `toast toast-${type}`;
            <div class="location-loading-spinner"></div>
            <p>Obteniendo tu ubicación...</p>n type
        </div>
    `;
    le';
    // Add to documentif (type === 'error') icon = 'fa-exclamation-circle';
    document.body.appendChild(loadingIndicator);
    
    // Show with animation
    setTimeout(() => {con}"></i>
        loadingIndicator.classList.add('active');>${message}</p>
    }, 10);  </div>
}`;

function hideLocationLoadingIndicator() {
    const loadingIndicator = document.querySelector('.location-loading-indicator');document.body.appendChild(toast);
    if (loadingIndicator) {
        loadingIndicator.classList.remove('active');tion
        setTimeout(() => {
            document.body.removeChild(loadingIndicator);st.classList.add('active');
        }, 300);}, 10);
    }
}delay

function showToast(message, type = 'info') {move('active');
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;   document.body.removeChild(toast);
    
    // Create toast icon based on type0);
    let icon = 'fa-info-circle';   }, 3000);
    if (type === 'success') icon = 'fa-check-circle';}
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <div class="toast-content">icator = hideLocationLoadingIndicator;
            <i class="fas ${icon}"></i>window.showToast = showToast;
            <p>${message}</p>
        </div>m coordinates)
    `;ude) {
    aps API if available
    // Add to documentw.geocoder) {
    document.body.appendChild(toast);
    
    // Show with animation
    setTimeout(() => {ng }, (results, status) => {
        toast.classList.add('active');& results[0]) {
    }, 10);lve(results);
    
    // Remove after a delay   reject("Geocoding failed: " + status);
    setTimeout(() => { }
        toast.classList.remove('active'); });
        setTimeout(() => {});
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);console.log("Google Geocode results:", response);
            }
        }, 300);se
    }, 3000); > 0) {
}const result = response[0];

// Make functions globally available
window.showGeolocationDialog = showGeolocationDialog;
window.showLocationLoadingIndicator = showLocationLoadingIndicator;
window.hideLocationLoadingIndicator = hideLocationLoadingIndicator;
window.showToast = showToast;   addressComponents.houseNumber = component.long_name;

// Function to do reverse geocoding (get address from coordinates)
async function reverseGeocode(latitude, longitude) {   addressComponents.road = component.long_name;
    // Try to use Google Maps API if available
    if (window.geocoder) {evel_1') || 
        try {
            const latlng = { lat: latitude, lng: longitude };   addressComponents.neighbourhood = component.long_name;
            const response = await new Promise((resolve, reject) => {
                window.geocoder.geocode({ location: latlng }, (results, status) => {_level_1')) {
                    if (status === "OK" && results[0]) {   addressComponents.city = component.long_name;
                        resolve(results); }
                    } else {});
                        reject("Geocoding failed: " + status);
                    }
                });dress,
            });
            : result.formatted_address,
            console.log("Google Geocode results:", response);  raw: result
               };
            // Process the Google geocoding response
            if (response && response.length > 0) {
                const result = response[0];ding error:", error);
                   // Fall through to backup method
                // Extract address components   }
                const addressComponents = {};}
                result.address_components.forEach(component => {
                    if (component.types.includes('street_number')) {ll back to Nominatim if Google geocoding fails or isn't available
                        addressComponents.houseNumber = component.long_name;
                    }const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    if (component.types.includes('route')) {
                        addressComponents.road = component.long_name;
                    }   throw new Error('Network response was not ok');
                    if (component.types.includes('sublocality_level_1') || }
                        component.types.includes('locality')) {
                        addressComponents.neighbourhood = component.long_name;
                    }console.log("Nominatim Geocode response data:", data);
                    if (component.types.includes('administrative_area_level_1')) {
                        addressComponents.city = component.long_name;
                    }trian || data.address.street || '',
                });
                
                return {address.town || data.address.village || '',
                    formattedAddress: result.formatted_address,
                    addressComponents: addressComponents,
                    displayName: result.formatted_address,  postcode: data.address.postcode || ''
                    raw: result};
                };
            }
        } catch (error) {
            console.error("Google Maps geocoding error:", error);                       `${addressComponents.road} ${addressComponents.houseNumber}, ${addressComponents.neighbourhood}`;
            // Fall through to backup method
        }
    }
    
    // Fall back to Nominatim if Google geocoding fails or isn't availableme: data.display_name,
    try {  raw: data
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
        
        if (!response.ok) {error('Error during reverse geocoding:', error);
            throw new Error('Network response was not ok');
        }: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`,
         {},
        const data = await response.json();me: null,
        console.log("Nominatim Geocode response data:", data);  raw: null
           };
        const addressComponents = {   }
            road: data.address.road || data.address.pedestrian || data.address.street || '',}
            houseNumber: data.address.house_number || '',
            neighbourhood: data.address.neighbourhood || data.address.suburb || '',
            city: data.address.city || data.address.town || data.address.village || '',window.reverseGeocode = reverseGeocode;
            state: data.address.state || '',
            country: data.address.country || '',ion
            postcode: data.address.postcode || ''
        };h explanation
        
        // Format the address
        const formattedAddress = data.display_name || r) {
                               `${addressComponents.road} ${addressComponents.houseNumber}, ${addressComponents.neighbourhood}`;
        showLocationLoadingIndicator();
        return {
            formattedAddress,olocation request
            addressComponents,
            displayName: data.display_name,acy: true,
            raw: data0,
        };  maximumAge: 0
    } catch (error) {};
        console.error('Error during reverse geocoding:', error);
        return {// ...existing geolocation code...
            formattedAddress: `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`,
            addressComponents: {},etCurrentPosition(
            displayName: null,llback
            raw: null
        };
    }const { latitude, longitude } = position.coords;
}

// Make function globally availablengitude)
window.reverseGeocode = reverseGeocode;
e data
// Function to request geolocationormattedAddress);
function requestGeolocation() {
    // Show permission dialog with explanationetItem('userCoordinates', JSON.stringify({
    showGeolocationDialog(() => { 
        // User wants to use geolocationlongitude
        if ("geolocation" in navigator) {
            // Show loading indicatorlocalStorage.setItem('userLocationData', JSON.stringify(locationData));
            showLocationLoadingIndicator();
            
            // Options for geolocation request= document.querySelector('.address-info');
            const options = {
                enableHighAccuracy: true,tion
                timeout: 10000,
                maximumAge: 0ow.updateAddressInfo('delivery', addressInfoSection, locationData.formattedAddress);
            };
            
            // ...existing geolocation code...r('.address-text');
            
            navigator.geolocation.getCurrentPosition(
                // Success callback   if (addressTextEl) addressTextEl.textContent = 'Entregar en: ' + locationData.formattedAddress;
                position => {   }
                    // Get coordinates}
                    const { latitude, longitude } = position.coords;
                    
                    // Reverse geocode to get addresshideLocationLoadingIndicator();
                    reverseGeocode(latitude, longitude)
                        .then(locationData => {
                            // Save to localStorage - we now save both formatted address and complete datashowToast(`Ubicación obtenida: ${locationData.formattedAddress}`, 'success');
                            localStorage.setItem('deliveryLocation', locationData.formattedAddress);
                            localStorage.setItem('requestLocationUpdate', 'false');ts to refine the address details
                            localStorage.setItem('userCoordinates', JSON.stringify({
                                latitude, 
                                longitudeessComponents.houseNumber && typeof showConfirmDialog === 'function') {
                            }));
                            localStorage.setItem('userLocationData', JSON.stringify(locationData));
                             tu número de casa. ¿Quieres completar los detalles de tu dirección?', 
                            // Update UIcción',
                            const addressInfoSection = document.querySelector('.address-info');así',
                            if (addressInfoSection) {
                                // We need to access the app's updateAddressInfo function
                                if (typeof window.updateAddressInfo === 'function') {nction') {
                                    window.updateAddressInfo('delivery', addressInfoSection, locationData.formattedAddress);   showAddressEditModal(locationData);
                                } else {  }
                                    // Fallback if the function isn't available
                                    const addressTextEl = addressInfoSection.querySelector('.address-text');
                                    const iconEl = addressInfoSection.querySelector('i');   // User doesn't want to refine
                                    if (iconEl) iconEl.className = 'fas fa-map-marker-alt';  }
                                    if (addressTextEl) addressTextEl.textContent = 'Entregar en: ' + locationData.formattedAddress;   );
                                }
                            }  }, 1500);
                            
                            // Hide loading indicator
                            hideLocationLoadingIndicator();console.error("Error in reverse geocoding:", error);
                            
                            // Show success message
                            showToast(`Ubicación obtenida: ${locationData.formattedAddress}`, 'success');ctual');
                            etItem('userCoordinates', JSON.stringify({
                            // Ask if user wants to refine the address details 
                            setTimeout(() => {longitude
                                // Check if we got house number, if not, prompt to refine}));
                                if (!locationData.addressComponents.houseNumber && typeof showConfirmDialog === 'function') {
                                    showConfirmDialog(
                                        'Refinar dirección', 
                                        'No pudimos obtener tu número de casa. ¿Quieres completar los detalles de tu dirección?', 
                                        'Editar dirección',   window.updateAddressInfo('delivery', addressInfoSection, 'Mi ubicación actual');
                                        'Dejar así',}
                                        () => {
                                            // User wants to refine
                                            if (typeof showAddressEditModal === 'function') {hideLocationLoadingIndicator();
                                                showAddressEditModal(locationData);
                                            }
                                        }, showToast('No pudimos obtener tu dirección completa, pero tenemos tu ubicación', 'warning');
                                        () => {      });
                                            // User doesn't want to refine
                                        }allback
                                    );
                                }console.error("Error getting location:", error);
                            }, 1500);
                        })
                        .catch(error => {hideLocationLoadingIndicator();
                            console.error("Error in reverse geocoding:", error);
                            sage
                            // Save generic location and coordinates
                            localStorage.setItem('deliveryLocation', 'Mi ubicación actual');
                            localStorage.setItem('userCoordinates', JSON.stringify({
                                latitude, essage = 'Permiso denegado para usar tu ubicación';
                                longitude
                            }));
                            essage = 'Tu ubicación no está disponible';
                            // Update UI
                            const addressInfoSection = document.querySelector('.address-info');
                            if (addressInfoSection && typeof window.updateAddressInfo === 'function') {essage = 'Se agotó el tiempo para obtener tu ubicación';
                                window.updateAddressInfo('delivery', addressInfoSection, 'Mi ubicación actual');k;
                            }
                                   errorMessage = 'Error desconocido al obtener tu ubicación';
                            // Hide loading indicator}
                            hideLocationLoadingIndicator();
                            showToast(errorMessage, 'error');
                            // Show warning message
                            showToast('No pudimos obtener tu dirección completa, pero tenemos tu ubicación', 'warning');e
                        });  localStorage.setItem('requestLocationUpdate', 'true');
                },
                // Error callback  options
                error => {
                    console.error("Error getting location:", error);
                    
                    // Hide loading indicator   showToast('Tu navegador no soporta geolocalización', 'error');
                    hideLocationLoadingIndicator();
                    
                    // Show error message
                    let errorMessage; showToast('Has declinado compartir tu ubicación', 'warning');
                    switch (error.code) {   });
                        case error.PERMISSION_DENIED:}
                            errorMessage = 'Permiso denegado para usar tu ubicación';
                            break;
                        case error.POSITION_UNAVAILABLE:window.requestGeolocation = requestGeolocation;
                            errorMessage = 'Tu ubicación no está disponible';
                            break; to delivery mode
                        case error.TIMEOUT:
                            errorMessage = 'Se agotó el tiempo para obtener tu ubicación';const deliveryOptions = document.querySelectorAll('.delivery-option');
                            break;
                        default:
                            errorMessage = 'Error desconocido al obtener tu ubicación';
                    }y') {
                    
                    showToast(errorMessage, 'error');allow the UI to update first
                    
                    // Flag that we should request location again next time {
                    localStorage.setItem('requestLocationUpdate', 'true');
                },= document.querySelector('.address-info');
                options
            );
        } else {ow.updateAddressInfo('delivery', addressInfoSection, selectedAddress);
            // Geolocation not supported
            showToast('Tu navegador no soporta geolocalización', 'error');
        }= addressInfoSection.querySelector('.address-text');
    }, () => {
        // User declined geolocation   addressTextEl.textContent = 'Entregar en: ' + selectedAddress;
        showToast('Has declinado compartir tu ubicación', 'warning');   }
    });   }
}
 localStorage.setItem('deliveryLocation', selectedAddress);
// Make the function globally available
window.requestGeolocation = requestGeolocation; }, 300);
   });
// Show the map selector as soon as user switches to delivery mode }
function showAddressMapSelectorOnDeliveryMode() {   });
    const deliveryOptions = document.querySelectorAll('.delivery-option');   }
    }
    if (deliveryOptions.length > 0) {
        deliveryOptions.forEach(option => {
            if (option.getAttribute('data-type') === 'delivery') {window.showAddressMapSelectorOnDeliveryMode = showAddressMapSelectorOnDeliveryMode;





























window.showAddressMapSelectorOnDeliveryMode = showAddressMapSelectorOnDeliveryMode;// Make sure to expose this function globally}    }        });            }                });                    }, 300);                        });                            localStorage.setItem('deliveryLocation', selectedAddress);                            }                                }                                    }                                        addressTextEl.textContent = 'Entregar en: ' + selectedAddress;                                    if (addressTextEl) {                                    const addressTextEl = addressInfoSection.querySelector('.address-text');                                    // Fallback if updateAddressInfo isn't available                                } else {                                    window.updateAddressInfo('delivery', addressInfoSection, selectedAddress);                                if (typeof window.updateAddressInfo === 'function') {                            if (addressInfoSection) {                            const addressInfoSection = document.querySelector('.address-info');                            // Update address in UI and localStorage                        showLocationMapSelector((selectedAddress) => {                    setTimeout(() => {                    // Short delay to allow the UI to update first                option.addEventListener('click', function() {