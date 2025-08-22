// Main Application Controller
class App {
    constructor() {
        this.mapInstance = null;
        this.quizGame = null;
        this.init();
    }
    
    async init() {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Initialize map
        this.mapInstance = new WorldMap();
        await this.mapInstance.init();
        
        // Store map instance globally for quiz access
        window.mapInstance = this.mapInstance;
        
        console.log('🚀 GeoQuest app initialized');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
