// Main application controller for Simple World Map
class SimpleMapApp {
    constructor() {
        this.mapInstance = null;
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeMap();
            this.setupEventListeners();
        });
    }
    
    initializeMap() {
        // Initialize the simple world map
        this.mapInstance = new SimpleWorldMap();
    }
    
    setupEventListeners() {
        // Configuration selector
        const configSelect = document.getElementById('configSelect');
        configSelect.addEventListener('change', (e) => {
            this.changeConfiguration(e.target.value);
        });
        
        // Clear Selection button
        const clearSelectionBtn = document.getElementById('clearSelection');
        clearSelectionBtn.addEventListener('click', () => {
            this.clearSelection();
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
    
    changeConfiguration(configKey) {
        if (this.mapInstance) {
            this.mapInstance.applyConfiguration(configKey);
            this.showNotification(`Applied ${configKey === 'none' ? 'no color scheme' : configKey}`, 'success');
        }
    }
    
    clearSelection() {
        if (this.mapInstance) {
            this.mapInstance.clearSelection();
            this.showNotification('Selection cleared!', 'info');
        }
    }
    
    handleKeyboardShortcuts(e) {
        // 'C' key to clear selection
        if (e.key === 'c' || e.key === 'C') {
            e.preventDefault();
            this.clearSelection();
        }
        
        // 'ESC' key to clear selection
        if (e.key === 'Escape') {
            this.clearSelection();
        }
        
        // Number keys to switch configurations
        if (e.key >= '1' && e.key <= '3') {
            const configSelect = document.getElementById('configSelect');
            const configs = ['none', 'blue_gradient', 'red_gradient', 'green_gradient'];
            const selectedIndex = parseInt(e.key);
            if (configs[selectedIndex]) {
                configSelect.value = configs[selectedIndex];
                this.changeConfiguration(configs[selectedIndex]);
            }
        }
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
            borderRadius: '6px',
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
}

// Initialize the application when the script loads
const app = new SimpleMapApp();

// Add some helpful console messages
console.log('🗺️ Simple World Map loaded successfully!');
console.log('📝 Available keyboard shortcuts:');
console.log('   C - Clear selection');
console.log('   ESC - Clear selection');
console.log('   1 - No color scheme');
console.log('   2 - Blue gradient');
console.log('   3 - Red gradient');
console.log('   Click on any country to select it');
