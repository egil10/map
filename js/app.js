// Main Application Controller
class App {
    constructor() {
        this.mapInstance = null;
        this.quizInstance = null;
        this.isReady = false;
        this.init();
    }
    
    async init() {
        console.log('🚀 GeoQuest app initializing...');
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Wait for map to be ready
        await this.waitForMap();
        
        // Wait for quiz to be ready
        await this.waitForQuiz();
        
        // Show the game
        this.showGame();
        
        console.log('🎮 GeoQuest app fully initialized and ready!');
    }
    
    async waitForMap() {
        return new Promise((resolve) => {
            const checkMap = () => {
                if (window.mapInstance && window.mapInstance.countriesLayer) {
                    console.log('🗺️ Map is ready');
                    this.mapInstance = window.mapInstance;
                    resolve();
                } else {
                    console.log('⏳ Waiting for map...');
                    setTimeout(checkMap, 100);
                }
            };
            checkMap();
        });
    }
    
    async waitForQuiz() {
        return new Promise((resolve) => {
            const checkQuiz = () => {
                if (window.quizInstance && window.quizInstance.isReady) {
                    console.log('🎯 Quiz is ready');
                    this.quizInstance = window.quizInstance;
                    resolve();
                } else {
                    console.log('⏳ Waiting for quiz...');
                    setTimeout(checkQuiz, 100);
                }
            };
            checkQuiz();
        });
    }
    
    showGame() {
        // Hide loading screen
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
        
        // Show main app
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.style.display = 'flex';
        }
        
        // Force map refresh after showing the app to ensure proper rendering
        setTimeout(() => {
            if (this.mapInstance && this.mapInstance.map && typeof this.mapInstance.map.invalidateSize === 'function') {
                this.mapInstance.map.invalidateSize();
                console.log('🗺️ Map refreshed after app visibility');
            }
        }, 100);
        
        this.isReady = true;
        console.log('🎉 Game is now visible and ready to play!');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
