// Main application controller for GeoQuest Game
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
            this.showWelcomeMessage();
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
        
        // Add focus to input when clicking on map
        document.getElementById('map').addEventListener('click', () => {
            document.getElementById('guessInput').focus();
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
        
        // 'R' key to restart game (reset score)
        if (e.key === 'r' || e.key === 'R') {
            if (confirm('🎮 Restart the game? This will reset your score and streak.')) {
                this.restartGame();
            }
        }
        
        // 'N' key to start new quiz immediately
        if (e.key === 'n' || e.key === 'N') {
            if (window.quizGame) {
                window.quizGame.startNewQuiz();
            }
        }
    }
    
    restartGame() {
        if (window.quizGame) {
            window.quizGame.score = 0;
            window.quizGame.streak = 0;
            window.quizGame.usedQuizzes.clear();
            window.quizGame.totalQuizzesPlayed = 0;
            window.quizGame.updateScoreDisplay();
            window.quizGame.updateQuizCounter();
            window.quizGame.startNewQuiz();
            this.showNotification('🎮 Game restarted! Good luck!', 'info');
        }
    }
    
    showWelcomeMessage() {
        setTimeout(() => {
            this.showNotification('🎮 Welcome to GeoQuest! Click on countries to explore and guess what the map shows!', 'info');
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
            padding: '15px 25px',
            borderRadius: '15px',
            color: 'white',
            fontWeight: '700',
            fontSize: '16px',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.4s ease',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '3px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)'
        });
        
        // Set background color based on type
        const colors = {
            success: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
            error: 'linear-gradient(135deg, #e17055 0%, #d63031 100%)',
            info: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
            warning: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)'
        };
        notification.style.background = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 400);
        }, 5000);
    }
}

// Initialize the application when the script loads
const app = new QuizApp();

// Make quiz game globally available
window.quizGame = null;

// Add some helpful console messages
console.log('🎮 GeoQuest Game loaded successfully!');
console.log('🎯 Available keyboard shortcuts:');
console.log('   Enter - Submit guess');
console.log('   H - Show hint');
console.log('   S - Skip quiz');
console.log('   R - Restart game');
console.log('   N - New quiz');
console.log('   ESC - Clear country selection');
console.log('   Click on any country to see details');
console.log('   Click on map to focus input');

// Add game tips
setTimeout(() => {
    console.log('💡 Game Tips:');
    console.log('   - Try different ways to describe the data');
    console.log('   - Use hints when stuck (costs 5 points)');
    console.log('   - Build streaks for bonus points');
    console.log('   - Click countries to see their values');
}, 2000);
