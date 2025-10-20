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
        
        // Wait for map to be ready
        await this.waitForMap();
        
        // Wait for quiz to be ready
        await this.waitForQuiz();
        
        // Show the game
        this.showGame();
        
        // Setup event listeners
        this.setupEventListeners();
        
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
    
    setupEventListeners() {
        // Game mode button
        document.getElementById('gameModeBtn').addEventListener('click', () => this.showGameModeMenu());
        
        // Control buttons
        document.getElementById('resetMapView').addEventListener('click', () => this.resetMapView());
        document.getElementById('downloadData').addEventListener('click', () => this.downloadData());
        
        // Dataset counter click for browsing
        document.getElementById('datasetCounter').addEventListener('click', () => this.showDatasetBrowser());
        
        console.log('🎮 Event listeners setup complete');
    }
    
    showGameModeMenu() {
        console.log('🎮 Opening game mode menu...');
        
        // Remove any existing menu
        const existingMenu = document.querySelector('.game-mode-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Create game mode selection menu
        const menu = document.createElement('div');
        menu.className = 'game-mode-menu';
        menu.innerHTML = `
            <div class="menu-content">
                <h3>Select Game Mode</h3>
                <button class="mode-option" data-mode="learn">
                    <i data-lucide="book-open"></i>
                    <span>Learn Mode</span>
                </button>
                <button class="mode-option" data-mode="play">
                    <i data-lucide="play"></i>
                    <span>Play Mode</span>
                </button>
                <button class="mode-option" data-mode="multiple">
                    <i data-lucide="list"></i>
                    <span>Multiple Choice</span>
                </button>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Re-initialize Lucide icons for the new menu
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Add event listeners
        menu.querySelectorAll('.mode-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const mode = e.currentTarget.dataset.mode;
                console.log(`🎮 Selected mode: ${mode}`);
                this.setGameMode(mode);
                document.body.removeChild(menu);
            });
        });
        
        // Close menu when clicking outside
        menu.addEventListener('click', (e) => {
            if (e.target === menu) {
                document.body.removeChild(menu);
            }
        });
        
        console.log('🎮 Game mode menu created');
    }
    
    showDatasetBrowser() {
        // Show the dataset browser modal
        const browser = document.getElementById('datasetBrowser');
        if (browser) {
            browser.style.display = 'flex';
        }
    }
    
    setGameMode(mode) {
        this.currentMode = mode;
        
        // Update quiz instance
        if (this.quizInstance) {
            this.quizInstance.setGameMode(mode);
        }
        
        // Update game mode button text to show current mode
        const gameModeBtn = document.getElementById('gameModeBtn');
        if (gameModeBtn) {
            const modeText = mode === 'learn' ? 'Learn' : 
                           mode === 'play' ? 'Play' : 
                           mode === 'multiple' ? 'Multiple' : 'Mode';
            gameModeBtn.querySelector('span').textContent = modeText;
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
