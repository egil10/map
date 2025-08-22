// Main Application Controller
class App {
    constructor() {
        this.init();
    }
    
    async init() {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        console.log('🚀 GeoQuest app initialized');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
