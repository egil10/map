// Main Application Controller
class App {
    constructor() {
        this.mapInstance = null;
        this.quizInstance = null;
        this.isReady = false;
        this.currentMode = 'learn'; // Default to learn mode
        this.init();
    }
    
    async init() {
        console.log('🚀 GeoQuest app initializing...');
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Setup event listeners first
        this.setupEventListeners();
        
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
            let attempts = 0;
            const maxAttempts = 50; // Reduced from infinite
            
            const checkMap = () => {
                if (window.mapInstance && window.mapInstance.countriesLayer) {
                    console.log('🗺️ Map is ready');
                    this.mapInstance = window.mapInstance;
                    resolve();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    console.log('⏳ Waiting for map...', attempts);
                    setTimeout(checkMap, 50); // Faster checking
                } else {
                    console.warn('⚠️ Map timeout, continuing anyway');
                    resolve(); // Continue even if map isn't ready
                }
            };
            checkMap();
        });
    }
    
    async waitForQuiz() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 30; // Reduced timeout
            
            const checkQuiz = () => {
                if (window.quizGame && window.quizGame.isReady) {
                    console.log('🎯 Quiz is ready');
                    this.quizInstance = window.quizGame;
                    resolve();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    console.log('⏳ Waiting for quiz...', attempts);
                    setTimeout(checkQuiz, 50); // Faster checking
                } else {
                    console.warn('⚠️ Quiz timeout, continuing anyway');
                    resolve(); // Continue even if quiz isn't ready
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
    
    setupEventListeners() {
        // Game mode buttons
        document.getElementById('learnModeBtn').addEventListener('click', () => this.setGameMode('learn'));
        document.getElementById('playModeBtn').addEventListener('click', () => this.setGameMode('play'));
        document.getElementById('multipleModeBtn').addEventListener('click', () => this.setGameMode('multiple'));
        
        // Control buttons
        document.getElementById('resetMapView').addEventListener('click', () => this.resetMapView());
        document.getElementById('downloadData').addEventListener('click', () => this.downloadData());
        
        // Dataset counter click for browsing (only in learn mode)
        document.getElementById('datasetCounter').addEventListener('click', () => {
            if (this.currentMode === 'learn') {
                this.showDatasetBrowser();
            }
        });
        
        console.log('🎮 Event listeners setup complete');
    }
    
    
    showDatasetBrowser() {
        // Show the dataset browser modal
        const browser = document.getElementById('datasetBrowser');
        if (browser) {
            browser.style.display = 'flex';
        }
    }
    
    setGameMode(mode) {
        console.log('🎮 Setting game mode to:', mode);
        this.currentMode = mode;
        
        // Update quiz instance
        if (this.quizInstance) {
            console.log('🎮 Quiz instance found, calling setGameMode');
            this.quizInstance.setGameMode(mode);
        } else {
            console.log('❌ No quiz instance found!');
        }
        
        // Update active button states
        document.querySelectorAll('.game-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update dataset counter appearance based on mode
        const datasetCounter = document.getElementById('datasetCounter');
        if (datasetCounter) {
            if (mode === 'learn') {
                datasetCounter.style.display = 'block';
                datasetCounter.style.cursor = 'pointer';
                datasetCounter.style.color = '#666';
            } else {
                // Hide dataset counter in play and multiple choice modes
                datasetCounter.style.display = 'none';
            }
        }
        
        console.log(`🎮 Game mode changed to: ${mode}`);
    }
    
    resetMapView() {
        if (this.mapInstance && this.mapInstance.resetMapView) {
            this.mapInstance.resetMapView();
        }
    }
    
    downloadData() {
        if (this.quizInstance && this.quizInstance.currentQuiz) {
            this.downloadCSV(this.quizInstance.currentQuiz);
        }
    }
    
    downloadCSV(quiz) {
        const csvContent = this.convertQuizToCSV(quiz);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('📊 CSV downloaded:', quiz.title);
    }
    
    convertQuizToCSV(quiz) {
        const headers = ['Country', 'Value', 'Unit'];
        const rows = [headers.join(',')];
        
        Object.entries(quiz.countries).forEach(([country, data]) => {
            const row = [
                `"${country}"`,
                data.value,
                `"${data.unit || ''}"`
            ];
            rows.push(row.join(','));
        });
        
        return rows.join('\n');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
