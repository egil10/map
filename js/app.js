// Main application controller for Quiz Game
class QuizApp {
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
        // Initialize the world map for quiz game
        this.mapInstance = new WorldMap();
    }
    
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Prevent context menu on map
        document.getElementById('map').addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    handleKeyboardShortcuts(e) {
        // 'ESC' key to clear selection
        if (e.key === 'Escape') {
            if (this.mapInstance) {
                this.mapInstance.clearSelection();
            }
        }
        
        // 'H' key to show hint
        if (e.key === 'h' || e.key === 'H') {
            const showHintBtn = document.getElementById('showHint');
            if (showHintBtn) {
                showHintBtn.click();
            }
        }
        
        // 'S' key to skip quiz
        if (e.key === 's' || e.key === 'S') {
            const skipBtn = document.getElementById('skipQuiz');
            if (skipBtn) {
                skipBtn.click();
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
const app = new QuizApp();

// Add some helpful console messages
console.log('🗺️ Geography Quiz Game loaded successfully!');
console.log('📝 Available keyboard shortcuts:');
console.log('   H - Show hint');
console.log('   S - Skip quiz');
console.log('   ESC - Clear country selection');
console.log('   Enter - Submit guess');
console.log('   Click on any country to see details');
