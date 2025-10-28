// Main Application Controller
class App {
    constructor() {
        this.mapInstance = null;
        this.quizInstance = null;
        this.isReady = false;
        this.currentMode = 'play'; // Default to play mode
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
        
        // Set initial active state for legend toggle button (legend is visible by default)
        const toggleLegendBtn = document.getElementById('toggleLegend');
        if (toggleLegendBtn) {
            toggleLegendBtn.classList.add('active');
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
        // Game mode toggle button
        const gameModeToggle = document.getElementById('gameModeToggle');
        if (gameModeToggle) {
            gameModeToggle.addEventListener('click', () => {
                // Toggle between learn and play modes
                const newMode = this.currentMode === 'learn' ? 'play' : 'learn';
                this.setGameMode(newMode);
            });
        }
        
        // Control buttons
        document.getElementById('resetMapView').addEventListener('click', () => this.resetMapView());
        document.getElementById('toggleLegend').addEventListener('click', () => this.toggleLegend());
        document.getElementById('downloadData').addEventListener('click', () => this.downloadData());
        
        // Dataset counter click for browsing (only in learn mode)
        document.getElementById('datasetCounter').addEventListener('click', () => {
            if (this.currentMode === 'learn' && this.quizInstance) {
                this.quizInstance.openDatasetBrowser();
            }
        });
        
        console.log('🎮 Event listeners setup complete');
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
        
        // Update toggle button states
        document.querySelectorAll('.toggle-option').forEach(option => {
            option.classList.remove('active');
        });
        
        const activeOption = document.querySelector(`.toggle-option[data-mode="${mode}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
        
        // Update toggle button data-mode attribute
        const gameModeToggle = document.getElementById('gameModeToggle');
        if (gameModeToggle) {
            gameModeToggle.setAttribute('data-mode', mode);
        }
        
        // Update dataset counter and source attribution based on mode
        const datasetCounter = document.getElementById('datasetCounter');
        const sourceAttribution = document.getElementById('sourceAttribution');
        
        if (datasetCounter && sourceAttribution) {
            if (mode === 'learn') {
                // Show dataset counter in learn mode
                datasetCounter.style.display = 'flex';
                datasetCounter.style.cursor = 'pointer';
                datasetCounter.style.color = '#666';
                // Hide source attribution
                sourceAttribution.style.display = 'none';
            } else {
                // Hide dataset counter in play mode
                datasetCounter.style.display = 'none';
                // Show source attribution in play mode
                this.updateSourceAttribution();
            }
        }
        
        console.log(`🎮 Game mode changed to: ${mode}`);
    }
    
    resetMapView() {
        if (this.mapInstance && this.mapInstance.resetMapView) {
            this.mapInstance.resetMapView();
        }
    }
    
    updateSourceAttribution() {
        const sourceAttribution = document.getElementById('sourceAttribution');
        const sourceLink = document.getElementById('sourceLink');
        
        if (!sourceAttribution || !sourceLink) return;
        
        // Get current quiz data
        const currentQuiz = this.quizInstance?.currentQuiz;
        
        if (currentQuiz && currentQuiz.source) {
            // Show source attribution with link
            sourceLink.href = currentQuiz.source;
            sourceLink.textContent = this.formatSourceUrl(currentQuiz.source);
            sourceAttribution.style.display = 'flex';
        } else {
            // Hide if no source available
            sourceAttribution.style.display = 'none';
        }
    }
    
    formatSourceUrl(url) {
        try {
            const urlObj = new URL(url);
            // Get domain without www
            let domain = urlObj.hostname.replace('www.', '');
            // Truncate if too long
            if (domain.length > 30) {
                domain = domain.substring(0, 27) + '...';
            }
            return domain;
        } catch (e) {
            // If URL parsing fails, return truncated string
            return url.length > 30 ? url.substring(0, 27) + '...' : url;
        }
    }
    
    toggleLegend() {
        const legend = document.getElementById('newLegend');
        const toggleBtn = document.getElementById('toggleLegend');
        
        if (legend && toggleBtn) {
            const isVisible = legend.style.display !== 'none';
            legend.style.display = isVisible ? 'none' : 'block';
            
            // Toggle active class on button
            if (isVisible) {
                toggleBtn.classList.remove('active');
            } else {
                toggleBtn.classList.add('active');
            }
            
            console.log('🔢 Legend toggled:', !isVisible ? 'visible' : 'hidden');
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
    window.app = new App();
});
