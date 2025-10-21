// Clean Quiz Game Controller - Refactored without bloat
class QuizGame {
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
        this.lastAnswerWasCorrect = undefined;
        
        this.init();
    }
    
    async init() {
        console.log('🎯 Quiz Game initializing...');
        
        // Load quiz data
        await this.loadQuizData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Wait for map
        await this.waitForMap();
        
        // Initialize learn mode
        this.initializeLearnModeSequence();
        
        this.isReady = true;
        console.log('🎯 Quiz Game ready!');
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

    async waitForMap() {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!window.mapInstance && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.mapInstance) {
            console.error('❌ Map instance not available');
            return false;
        }
        
        return true;
    }

    initializeLearnModeSequence() {
        if (this.learnModeSequence.length === 0 && this.datasetList.length > 0) {
            this.learnModeSequence = [...this.datasetList];
            // Shuffle the sequence
            for (let i = this.learnModeSequence.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.learnModeSequence[i], this.learnModeSequence[j]] = [this.learnModeSequence[j], this.learnModeSequence[i]];
            }
            this.learnModeCurrentIndex = 0;
        }
    }

    setupEventListeners() {
        // Game mode buttons
        const learnBtn = document.getElementById('learnModeBtn');
        const playBtn = document.getElementById('playModeBtn');
        const multipleBtn = document.getElementById('multipleModeBtn');
        
        if (learnBtn) learnBtn.addEventListener('click', () => this.setGameMode('learn'));
        if (playBtn) playBtn.addEventListener('click', () => this.setGameMode('play'));
        if (multipleBtn) multipleBtn.addEventListener('click', () => this.setGameMode('multiple'));
        
        // Input handling
        const guessInput = document.getElementById('guessInput');
        const submitBtn = document.getElementById('submitGuess');
        
        if (guessInput) {
            guessInput.addEventListener('input', () => this.handleInputChange());
            guessInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSubmitGuess();
            });
        }
        
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmitGuess());
        }
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.isLearnMode = (mode === 'learn');
        
        // Reset game state
        this.resetGameState();
        
        // Update UI
        this.updateModeToggle();
        
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
        this.lastAnswerWasCorrect = undefined;
        this.resetProgressBar();
    }

    startLearnMode() {
        if (this.learnModeSequence.length > 0) {
            this.currentQuiz = this.learnModeSequence[this.learnModeCurrentIndex];
            this.showLearnModeControls();
            this.loadLearnModeDataset();
        }
    }

    startNewQuiz() {
        if (this.datasetList.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.datasetList.length);
            this.currentQuiz = this.datasetList[randomIndex];
            
            if (this.gameMode === 'multiple') {
                this.showMultipleChoice();
            } else {
                this.showPlayModeInput();
            }
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
        const nextBtn = document.getElementById('nextQuizBtn');
        const prevBtn = document.getElementById('prevQuizBtn');
        
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousQuestion());
        
        // Update Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    showPlayModeInput() {
        const inputContainer = document.querySelector('.input-container');
        if (!inputContainer) return;
        
        inputContainer.innerHTML = `
            <input type="text" id="guessInput" placeholder="Type your answer here" class="guess-input">
            <button id="submitGuess" class="submit-btn" aria-label="Send" disabled>
                <i data-lucide="send"></i>
            </button>
        `;
        
        // Re-add event listeners
        this.setupEventListeners();
        
        // Update Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    showMultipleChoice() {
        if (!this.currentQuiz) return;
        
        const correctDataset = this.currentQuiz.title;
        const wrongDatasets = this.datasetList
            .filter(dataset => dataset.title !== correctDataset)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        const options = [correctDataset, ...wrongDatasets.map(d => d.title)];
        const shuffledOptions = options.sort(() => Math.random() - 0.5);
        
        const inputContainer = document.querySelector('.input-container');
        if (!inputContainer) return;
        
        inputContainer.innerHTML = `
            <div class="multiple-choice">
                <div class="choice-options-container">
                    <div class="choice-options">
                        ${shuffledOptions.map(option => `
                            <button class="choice-btn" data-answer="${option}">
                                ${option}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedAnswer = e.target.dataset.answer;
                this.handleMultipleChoiceAnswer(selectedAnswer);
            });
        });
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    handleMultipleChoiceAnswer(selectedAnswer) {
        const isCorrect = selectedAnswer === this.currentQuiz.title;
        
        // Visual feedback
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.answer === this.currentQuiz.title) {
                btn.classList.add('correct');
            } else if (btn.dataset.answer === selectedAnswer && !isCorrect) {
                btn.classList.add('wrong');
            }
        });
        
        // Update progress
        this.updateProgressBar(isCorrect);
        
        // Auto-advance after 2 seconds
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    handleInputChange() {
        const guessInput = document.getElementById('guessInput');
        const submitBtn = document.getElementById('submitGuess');
        
        if (guessInput && submitBtn) {
            submitBtn.disabled = !guessInput.value.trim();
        }
    }

    handleSubmitGuess() {
        const guessInput = document.getElementById('guessInput');
        if (!guessInput || !guessInput.value.trim()) return;
        
        const userGuess = guessInput.value.trim();
        const isCorrect = this.checkAnswer(userGuess);
        
        // Update progress
        this.updateProgressBar(isCorrect);
        
        // Show feedback
        this.showFeedback(isCorrect);
        
        // Clear input
        guessInput.value = '';
        guessInput.disabled = true;
        
        // Auto-advance after 2 seconds
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    checkAnswer(userGuess) {
        if (!this.currentQuiz || !this.currentQuiz.answer_variations) return false;
        
        const normalizedGuess = userGuess.toLowerCase().trim();
        return this.currentQuiz.answer_variations.some(variation => 
            variation.toLowerCase() === normalizedGuess
        );
    }

    showFeedback(isCorrect) {
        const feedbackElement = document.querySelector('.feedback');
        if (feedbackElement) {
            feedbackElement.textContent = isCorrect ? 'Correct!' : 'Incorrect!';
            feedbackElement.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
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
            this.updateColorBar();
            
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

    updateColorBar() {
        if (!this.currentQuiz) return;
        
        const colorBarGradient = document.getElementById('colorBarGradient');
        if (colorBarGradient && this.currentQuiz.colorScheme) {
            const scheme = this.currentQuiz.colorScheme;
            if (scheme.type === 'gradient' && scheme.colors) {
                const colorStops = scheme.colors.map((color, index) => {
                    const percentage = (index / (scheme.colors.length - 1)) * 100;
                    return `${color} ${percentage}%`;
                }).join(', ');
                colorBarGradient.style.background = `linear-gradient(to right, ${colorStops})`;
            } else if (scheme.minColor && scheme.maxColor) {
                colorBarGradient.style.background = `linear-gradient(to right, ${scheme.minColor}, ${scheme.maxColor})`;
            }
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
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    updateProgressBar(isCorrect) {
        const progressCircles = document.querySelectorAll('.progress-circle');
        
        if (this.currentProgress < progressCircles.length) {
            const currentCircle = progressCircles[this.currentProgress];
            
            currentCircle.classList.remove('current', 'empty', 'correct', 'wrong');
            
            if (isCorrect) {
                currentCircle.classList.add('correct');
                currentCircle.setAttribute('data-lucide', 'circle');
            } else {
                currentCircle.classList.add('wrong');
                currentCircle.setAttribute('data-lucide', 'circle');
            }
            
            this.currentProgress++;
            
            if (this.currentProgress < progressCircles.length) {
                const nextCircle = progressCircles[this.currentProgress];
                nextCircle.classList.remove('correct', 'wrong', 'empty');
                nextCircle.classList.add('current');
                nextCircle.setAttribute('data-lucide', 'circle');
            }
        }
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    updateModeToggle() {
        // Update active button states
        document.querySelectorAll('.game-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-mode="${this.gameMode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
}

// Initialize quiz game
const quizGame = new QuizGame();
window.quizGame = quizGame;
