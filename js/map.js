// Map class to handle all map-related functionality
class InteractiveMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.markerCounter = 0;
        this.isAddingMarker = false;
        
        this.init();
    }
    
    init() {
        // Initialize the map centered on a default location (New York City)
        this.map = L.map('map').setView([40.7128, -74.0060], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        // Add click event to map for adding markers
        this.map.on('click', (e) => {
            if (this.isAddingMarker) {
                this.addMarkerAtPosition(e.latlng);
                this.isAddingMarker = false;
                this.updateUI();
            }
        });
        
        // Add some sample markers for demonstration
        this.addSampleMarkers();
    }
    
    addSampleMarkers() {
        const sampleLocations = [
            { lat: 40.7589, lng: -73.9851, name: "Times Square", description: "Famous intersection in Manhattan" },
            { lat: 40.7484, lng: -73.9857, name: "Empire State Building", description: "Iconic skyscraper" },
            { lat: 40.7527, lng: -73.9772, name: "Grand Central Terminal", description: "Historic train station" }
        ];
        
        sampleLocations.forEach(location => {
            this.addMarkerAtPosition(
                { lat: location.lat, lng: location.lng },
                location.name,
                location.description
            );
        });
    }
    
    addMarkerAtPosition(latlng, name = null, description = null) {
        this.markerCounter++;
        
        const markerName = name || `Marker ${this.markerCounter}`;
        const markerDescription = description || `Added on ${new Date().toLocaleDateString()}`;
        
        // Create custom icon for the marker
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
            ">${this.markerCounter}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        // Create the marker
        const marker = L.marker(latlng, { icon: customIcon }).addTo(this.map);
        
        // Create popup content
        const popupContent = `
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${markerName}</h3>
                <p style="margin: 0 0 10px 0; color: #6c757d;">${markerDescription}</p>
                <p style="margin: 0; font-family: monospace; background: #f8f9fa; padding: 5px; border-radius: 4px; font-size: 12px;">
                    ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}
                </p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Store marker data
        const markerData = {
            id: this.markerCounter,
            marker: marker,
            latlng: latlng,
            name: markerName,
            description: markerDescription,
            timestamp: new Date()
        };
        
        this.markers.push(markerData);
        
        // Add click event to marker for removal
        marker.on('click', () => {
            if (!this.isAddingMarker) {
                this.removeMarker(markerData.id);
            }
        });
        
        // Animate the marker
        marker.getElement()?.classList.add('marker-pulse');
        setTimeout(() => {
            marker.getElement()?.classList.remove('marker-pulse');
        }, 600);
        
        return markerData;
    }
    
    removeMarker(markerId) {
        const markerIndex = this.markers.findIndex(m => m.id === markerId);
        if (markerIndex !== -1) {
            const markerData = this.markers[markerIndex];
            this.map.removeLayer(markerData.marker);
            this.markers.splice(markerIndex, 1);
            this.updateMarkerList();
        }
    }
    
    clearAllMarkers() {
        this.markers.forEach(markerData => {
            this.map.removeLayer(markerData.marker);
        });
        this.markers = [];
        this.markerCounter = 0;
        this.updateMarkerList();
    }
    
    startAddingMarker() {
        this.isAddingMarker = true;
        document.body.style.cursor = 'crosshair';
        this.map.getContainer().style.cursor = 'crosshair';
    }
    
    stopAddingMarker() {
        this.isAddingMarker = false;
        document.body.style.cursor = 'default';
        this.map.getContainer().style.cursor = 'grab';
    }
    
    updateMarkerList() {
        const markerList = document.getElementById('markerList');
        
        if (this.markers.length === 0) {
            markerList.innerHTML = '<p class="no-markers">No markers added yet</p>';
            return;
        }
        
        markerList.innerHTML = this.markers.map(markerData => `
            <div class="marker-item" onclick="mapInstance.focusMarker(${markerData.id})">
                <h4>${markerData.name}</h4>
                <p>${markerData.description}</p>
                <p class="coordinates">${markerData.latlng.lat.toFixed(4)}, ${markerData.latlng.lng.toFixed(4)}</p>
            </div>
        `).join('');
    }
    
    focusMarker(markerId) {
        const markerData = this.markers.find(m => m.id === markerId);
        if (markerData) {
            this.map.setView(markerData.latlng, 16);
            markerData.marker.openPopup();
        }
    }
    
    updateUI() {
        const addButton = document.getElementById('addMarker');
        if (this.isAddingMarker) {
            addButton.textContent = 'Cancel';
            addButton.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
        } else {
            addButton.textContent = 'Add Marker';
            addButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    }
    
    // Get current map bounds
    getBounds() {
        return this.map.getBounds();
    }
    
    // Get current center
    getCenter() {
        return this.map.getCenter();
    }
    
    // Get current zoom level
    getZoom() {
        return this.map.getZoom();
    }
}
