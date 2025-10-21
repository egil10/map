// Game Controller - Core game logic without bloat
class GameController {
    constructor() {
        this.quizData = null;
        this.currentQuiz = null;
        this.score = 0;
        this.streak = 0;
        this.currentProgress = 0;
        this.isQuizCompleted = false;
        this.isLearnMode = false;
        this.gameMode = 'learn';
        this.learnModeSequence = [];
        this.learnModeCurrentIndex = 0;
        this.datasetList = [];
        this.isReady = false;
        
        this.init();
    }

    async init() {
        console.log('🎮 Game Controller initializing...');
        
        // Load quiz data
        await this.loadQuizData();
        
        // Initialize learn mode sequence
        this.initializeLearnModeSequence();
        
        this.isReady = true;
        console.log('🎮 Game Controller ready!');
    }

    async loadQuizData() {
        try {
            const response = await fetch('data/quiz_data.json');
            this.quizData = await response.json();
            
            // Create dataset list
            this.datasetList = Object.values(this.quizData.quizzes)
                .sort((a, b) => a.title.localeCompare(b.title));
                
            console.log(`📊 Loaded ${this.datasetList.length} datasets`);
        } catch (error) {
            console.error('❌ Failed to load quiz data:', error);
            this.quizData = { quizzes: {} };
        }
    }

    initializeLearnModeSequence() {
        if (this.learnModeSequence.length === 0 && this.datasetList.length > 0) {
            this.learnModeSequence = [...this.datasetList];
            // Fisher-Yates shuffle
            for (let i = this.learnModeSequence.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.learnModeSequence[i], this.learnModeSequence[j]] = [this.learnModeSequence[j], this.learnModeSequence[i]];
            }
            this.learnModeCurrentIndex = 0;
        }
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.isLearnMode = (mode === 'learn');
        
        // Reset game state
        this.resetGameState();
        
        // Start appropriate mode
        if (this.isLearnMode) {
            this.startLearnMode();
        } else {
            this.startNewQuiz();
        }
        
        console.log(`🎮 Game mode set to: ${mode}`);
    }

    resetGameState() {
        this.score = 0;
        this.streak = 0;
        this.currentProgress = 0;
        this.isQuizCompleted = false;
        this.resetProgressBar();
    }

    startLearnMode() {
        if (this.learnModeSequence.length > 0) {
            this.currentQuiz = this.learnModeSequence[this.learnModeCurrentIndex];
            this.showLearnModeControls();
        }
    }

    startNewQuiz() {
        if (this.datasetList.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.datasetList.length);
            this.currentQuiz = this.datasetList[randomIndex];
        }
    }

    showLearnModeControls() {
        const inputContainer = document.querySelector('.input-container');
        if (!inputContainer) return;
        
        inputContainer.innerHTML = `
            <button id="prevQuizBtn" class="nav-btn prev-btn">
                <i data-lucide="arrow-left"></i>
                <span>Previous</span>
            </button>
            <div class="learn-info">
                <span id="currentDatasetTitle">${this.currentQuiz ? this.currentQuiz.title : 'Loading...'}</span>
            </div>
            <button id="nextQuizBtn" class="nav-btn next-btn">
                <i data-lucide="arrow-right"></i>
                <span>Next</span>
            </button>
        `;
        
        // Add event listeners
        this.setupLearnModeListeners();
        
        // Update Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    setupLearnModeListeners() {
        const nextBtn = document.getElementById('nextQuizBtn');
        const prevBtn = document.getElementById('prevQuizBtn');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousQuestion());
        }
    }

    nextQuestion() {
        if (this.isLearnMode) {
            this.learnModeCurrentIndex = (this.learnModeCurrentIndex + 1) % this.learnModeSequence.length;
            this.loadLearnModeDataset();
        } else {
            this.startNewQuiz();
        }
    }

    previousQuestion() {
        if (this.isLearnMode) {
            this.learnModeCurrentIndex = (this.learnModeCurrentIndex - 1 + this.learnModeSequence.length) % this.learnModeSequence.length;
            this.loadLearnModeDataset();
        } else {
            this.startNewQuiz();
        }
    }

    loadLearnModeDataset() {
        if (this.learnModeSequence.length > 0 && this.learnModeCurrentIndex >= 0 && this.learnModeCurrentIndex < this.learnModeSequence.length) {
            this.currentQuiz = this.learnModeSequence[this.learnModeCurrentIndex];
            
            // Apply quiz to map
            if (window.mapInstance && this.currentQuiz) {
                window.mapInstance.applyQuizConfiguration(this.currentQuiz);
            }
            
            // Update color bar
            if (window.quizGame && window.quizGame.updateColorBar) {
                window.quizGame.updateColorBar();
            }
            
            // Update title
            this.updateLearnModeTitle();
        }
    }

    updateLearnModeTitle() {
        const titleElement = document.getElementById('currentDatasetTitle');
        if (titleElement && this.currentQuiz) {
            titleElement.textContent = this.currentQuiz.title;
        }
    }

    resetProgressBar() {
        const progressCircles = document.querySelectorAll('.progress-circle');
        progressCircles.forEach((circle, index) => {
            circle.className = 'progress-circle';
            if (index === 0) {
                circle.classList.add('current');
                circle.setAttribute('data-lucide', 'circle');
            } else {
                circle.classList.add('empty');
                circle.setAttribute('data-lucide', 'circle-dashed');
            }
        });
        
        // Update Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    updateProgressBar(isCorrect) {
        const progressCircles = document.querySelectorAll('.progress-circle');
        
        if (this.currentProgress < progressCircles.length) {
            const currentCircle = progressCircles[this.currentProgress];
            
            // Remove all classes
            currentCircle.classList.remove('current', 'empty', 'correct', 'wrong');
            
            // Add appropriate class
            if (isCorrect) {
                currentCircle.classList.add('correct');
                currentCircle.setAttribute('data-lucide', 'circle');
            } else {
                currentCircle.classList.add('wrong');
                currentCircle.setAttribute('data-lucide', 'circle');
            }
            
            // Move to next circle
            this.currentProgress++;
            
            if (this.currentProgress < progressCircles.length) {
                const nextCircle = progressCircles[this.currentProgress];
                nextCircle.classList.remove('correct', 'wrong', 'empty');
                nextCircle.classList.add('current');
                nextCircle.setAttribute('data-lucide', 'circle');
            }
        }
        
        // Update Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Export for use
window.GameController = GameController;
