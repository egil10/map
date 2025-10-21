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
        
        // Setup event listeners first
        this.setupEventListeners();
        
        // Load quiz data
        await this.loadQuizData();
        
        // Initialize learn mode
        this.initializeLearnModeSequence();
        
        this.isReady = true;
        console.log('🎯 Quiz Game ready!');
        
        // Start with learn mode by default
        this.setGameMode('learn');
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

    // Map will be handled by App.js

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
        // Mode toggle buttons are handled by App.js
        
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
        console.log(`🎮 Setting game mode to: ${mode}`);
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
            console.log(`🎮 Starting new quiz in ${mode} mode`);
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
        console.log(`🎯 Starting new quiz in ${this.gameMode} mode`);
        
        if (this.datasetList.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.datasetList.length);
            this.currentQuiz = this.datasetList[randomIndex];
            
            console.log(`🎯 Selected quiz: ${this.currentQuiz.title}`);
            
            // Apply quiz to map
            if (window.mapInstance && this.currentQuiz) {
                window.mapInstance.applyQuizConfiguration(this.currentQuiz);
            }
            
            // Update color bar
            this.updateColorBar();
            
            if (this.gameMode === 'multiple') {
                console.log('🎯 Showing multiple choice');
                this.hideAnswerTitle();
                this.showMultipleChoice();
            } else if (this.gameMode === 'play') {
                console.log('🎯 Showing play mode input');
                this.hideAnswerTitle();
                this.showPlayModeInput();
            } else {
                console.log('🎯 Unknown game mode, defaulting to play mode');
                this.hideAnswerTitle();
                this.showPlayModeInput();
            }
        } else {
            console.log('❌ No datasets available');
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
        
        // Add event listeners with delay
        setTimeout(() => {
            const nextBtn = document.getElementById('nextQuizBtn');
            const prevBtn = document.getElementById('prevQuizBtn');
            
            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🎯 Next button clicked');
                    this.nextQuestion();
                });
            }
            
            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🎯 Previous button clicked');
                    this.previousQuestion();
                });
            }
        }, 100);
        
        // Update Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    showPlayModeInput() {
        const inputContainer = document.querySelector('.input-container');
        if (!inputContainer) return;
        
        inputContainer.innerHTML = `
            <input type="text" id="guessInput" placeholder="What does this map show?" class="guess-input">
            <button id="submitGuess" class="submit-btn" aria-label="Send" disabled>
                <i data-lucide="send"></i>
            </button>
        `;
        
        // Clear any existing feedback
        this.clearFeedback();
        
        // Add event listeners with delay
        setTimeout(() => {
            const guessInput = document.getElementById('guessInput');
            const submitBtn = document.getElementById('submitGuess');
            
            if (guessInput) {
                guessInput.addEventListener('input', () => this.handleInputChange());
                guessInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.handleSubmitGuess();
                });
                guessInput.focus();
            }
            
            if (submitBtn) {
                submitBtn.addEventListener('click', () => this.handleSubmitGuess());
            }
        }, 100);
        
        // Update Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    showMultipleChoice() {
        if (!this.currentQuiz) {
            console.log('❌ No current quiz for multiple choice');
            return;
        }
        
        console.log('🎯 Showing multiple choice for:', this.currentQuiz.title);
        
        const correctDataset = this.currentQuiz.title;
        const wrongDatasets = this.datasetList
            .filter(dataset => dataset.title !== correctDataset)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        const options = [correctDataset, ...wrongDatasets.map(d => d.title)];
        const shuffledOptions = options.sort(() => Math.random() - 0.5);
        
        console.log('🎯 Multiple choice options:', shuffledOptions);
        console.log('🎯 Correct answer:', correctDataset);
        
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
        
        // Add event listeners with proper error handling
        setTimeout(() => {
            document.querySelectorAll('.choice-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const selectedAnswer = e.target.dataset.answer;
                    console.log('🎯 Multiple choice clicked:', selectedAnswer);
                    this.handleMultipleChoiceAnswer(selectedAnswer);
                });
            });
        }, 100);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    handleMultipleChoiceAnswer(selectedAnswer) {
        console.log('🎯 Handling multiple choice answer:', selectedAnswer);
        console.log('🎯 Correct answer:', this.currentQuiz.title);
        
        const isCorrect = selectedAnswer === this.currentQuiz.title;
        console.log('🎯 Is correct:', isCorrect);
        
        // Disable all buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.pointerEvents = 'none';
        });
        
        // Visual feedback
        document.querySelectorAll('.choice-btn').forEach(btn => {
            if (btn.dataset.answer === this.currentQuiz.title) {
                btn.classList.add('correct');
            } else if (btn.dataset.answer === selectedAnswer && !isCorrect) {
                btn.classList.add('wrong');
            }
        });
        
        // Update progress
        this.updateProgressBar(isCorrect);
        
        // Show feedback
        this.showFeedback(isCorrect);
        
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
        const submitBtn = document.getElementById('submitGuess');
        
        if (!guessInput || !guessInput.value.trim()) return;
        
        const userGuess = guessInput.value.trim();
        const isCorrect = this.checkAnswer(userGuess);
        
        // Disable input and button
        guessInput.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
        
        // Update progress
        this.updateProgressBar(isCorrect);
        
        // Show feedback
        this.showFeedback(isCorrect);
        
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
            // Check if game is completed (10 rounds)
            if (this.currentProgress >= 10) {
                this.showGameCompletion();
                return;
            }
            
            // Clear feedback and start new quiz
            this.clearFeedback();
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
            
            // Show answer title in learn mode
            this.showAnswerTitle();
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
            // Remove all classes first
            circle.classList.remove('current', 'empty', 'correct', 'wrong');
            
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

    showAnswerTitle() {
        const answerTitle = document.getElementById('answerTitle');
        if (answerTitle && this.currentQuiz) {
            answerTitle.textContent = this.currentQuiz.title;
            answerTitle.style.display = 'block';
        }
    }

    hideAnswerTitle() {
        const answerTitle = document.getElementById('answerTitle');
        if (answerTitle) {
            answerTitle.style.display = 'none';
        }
    }

    clearFeedback() {
        const feedbackElement = document.querySelector('.feedback');
        if (feedbackElement) {
            feedbackElement.textContent = '';
            feedbackElement.className = 'feedback';
        }
    }

    showGameCompletion() {
        console.log('🎉 Game completed!');
        
        // Calculate score
        const correctAnswers = this.currentProgress;
        const totalQuestions = 10;
        
        // Show completion screen
        const inputContainer = document.querySelector('.input-container');
        if (inputContainer) {
            inputContainer.innerHTML = `
                <div class="completion-screen">
                    <h2>🎉 Game Complete!</h2>
                    <div class="score-display">
                        <p>You got <strong>${correctAnswers}</strong> out of <strong>${totalQuestions}</strong> correct!</p>
                        <p>Score: <strong>${Math.round((correctAnswers / totalQuestions) * 100)}%</strong></p>
                    </div>
                    <div class="completion-actions">
                        <button id="playAgainBtn" class="play-again-btn">
                            <i data-lucide="refresh-cw"></i>
                            Play Again
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listener for play again
            setTimeout(() => {
                const playAgainBtn = document.getElementById('playAgainBtn');
                if (playAgainBtn) {
                    playAgainBtn.addEventListener('click', () => {
                        this.restartGame();
                    });
                }
            }, 100);
            
            // Update Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    restartGame() {
        console.log('🔄 Restarting game...');
        
        // Reset all game state
        this.resetGameState();
        
        // Start new game based on current mode
        if (this.gameMode === 'multiple') {
            this.showMultipleChoice();
        } else if (this.gameMode === 'play') {
            this.showPlayModeInput();
        } else {
            this.startLearnMode();
        }
    }
}

// Initialize quiz game
const quizGame = new QuizGame();
window.quizGame = quizGame;
