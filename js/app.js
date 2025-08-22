// Main Application Controller
class App {
    constructor() {
        this.mapInstance = null;
        this.quizGame = null;
        this.isDarkTheme = false;
        this.init();
    }
    
    async init() {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Load theme preference
        this.loadThemePreference();
        
        // Initialize map
        this.mapInstance = new WorldMap();
        await this.mapInstance.init();
        
        // Store map instance globally for quiz access
        window.mapInstance = this.mapInstance;
        
        // Setup theme toggle
        this.setupThemeToggle();
        
        console.log('🚀 GeoQuest app initialized');
    }
    
    loadThemePreference() {
        const savedTheme = localStorage.getItem('geoquest-theme');
        if (savedTheme === 'dark') {
            this.isDarkTheme = true;
            document.body.classList.add('dark-theme');
        }
    }
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        if (themeToggle && themeIcon) {
            // Set initial icon
            this.updateThemeIcon(themeIcon);
            
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
                this.updateThemeIcon(themeIcon);
            });
        }
    }
    
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        
        if (this.isDarkTheme) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('geoquest-theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('geoquest-theme', 'light');
        }
    }
    
    updateThemeIcon(themeIcon) {
        if (this.isDarkTheme) {
            themeIcon.setAttribute('data-lucide', 'moon');
        } else {
            themeIcon.setAttribute('data-lucide', 'sun');
        }
        
        // Recreate the icon
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
