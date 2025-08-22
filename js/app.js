// Main application controller
class MapApp {
    constructor() {
        this.mapInstance = null;
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeMap();
            this.setupEventListeners();
            this.updateMarkerList();
        });
    }
    
    initializeMap() {
        // Initialize the interactive map
        this.mapInstance = new InteractiveMap();
        
        // Make map instance globally available for marker list clicks
        window.mapInstance = this.mapInstance;
    }
    
    setupEventListeners() {
        // Add Marker button
        const addMarkerBtn = document.getElementById('addMarker');
        addMarkerBtn.addEventListener('click', () => {
            this.toggleAddMarkerMode();
        });
        
        // Clear All Markers button
        const clearMarkersBtn = document.getElementById('clearMarkers');
        clearMarkersBtn.addEventListener('click', () => {
            this.clearAllMarkers();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Prevent context menu on map
        document.getElementById('map').addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    toggleAddMarkerMode() {
        if (this.mapInstance.isAddingMarker) {
            this.mapInstance.stopAddingMarker();
        } else {
            this.mapInstance.startAddingMarker();
        }
        this.mapInstance.updateUI();
    }
    
    clearAllMarkers() {
        if (this.mapInstance.markers.length === 0) {
            this.showNotification('No markers to clear!', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear all markers?')) {
            this.mapInstance.clearAllMarkers();
            this.showNotification('All markers cleared!', 'success');
        }
    }
    
    handleKeyboardShortcuts(e) {
        // Escape key to cancel adding marker
        if (e.key === 'Escape' && this.mapInstance.isAddingMarker) {
            this.mapInstance.stopAddingMarker();
            this.mapInstance.updateUI();
        }
        
        // 'A' key to toggle add marker mode
        if (e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            this.toggleAddMarkerMode();
        }
        
        // 'C' key to clear all markers
        if (e.key === 'c' || e.key === 'C') {
            e.preventDefault();
            this.clearAllMarkers();
        }
    }
    
    updateMarkerList() {
        // Update marker list initially
        this.mapInstance.updateMarkerList();
        
        // Set up periodic updates (in case markers are added programmatically)
        setInterval(() => {
            this.mapInstance.updateMarkerList();
        }, 1000);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        });
        
        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };
        notification.style.background = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Export map data
    exportMapData() {
        const mapData = {
            markers: this.mapInstance.markers.map(m => ({
                lat: m.latlng.lat,
                lng: m.latlng.lng,
                name: m.name,
                description: m.description,
                timestamp: m.timestamp
            })),
            center: this.mapInstance.getCenter(),
            zoom: this.mapInstance.getZoom(),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(mapData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `map-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
    
    // Import map data
    importMapData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const mapData = JSON.parse(e.target.result);
                
                // Clear existing markers
                this.mapInstance.clearAllMarkers();
                
                // Add imported markers
                if (mapData.markers && Array.isArray(mapData.markers)) {
                    mapData.markers.forEach(marker => {
                        this.mapInstance.addMarkerAtPosition(
                            { lat: marker.lat, lng: marker.lng },
                            marker.name,
                            marker.description
                        );
                    });
                }
                
                // Set map view if available
                if (mapData.center && mapData.zoom) {
                    this.mapInstance.map.setView(mapData.center, mapData.zoom);
                }
                
                this.showNotification(`Imported ${mapData.markers?.length || 0} markers!`, 'success');
            } catch (error) {
                this.showNotification('Error importing map data!', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the application when the script loads
const app = new MapApp();

// Add some helpful console messages
console.log('🗺️ Interactive Map loaded successfully!');
console.log('📝 Available keyboard shortcuts:');
console.log('   A - Toggle add marker mode');
console.log('   C - Clear all markers');
console.log('   ESC - Cancel adding marker');
