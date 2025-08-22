// Quiz Game Controller
class QuizGame {
    constructor() {
        this.quizData = null;
        this.currentQuiz = null;
        this.score = 0;
        this.streak = 0;
        this.usedQuizzes = new Set();
        this.hintUsed = false;
        this.totalQuizzesPlayed = 0;
        
        this.init();
    }
    
    async init() {
        await this.loadQuizData();
        this.setupEventListeners();
        this.startNewQuiz();
    }
    
    async loadQuizData() {
        try {
            const response = await fetch('data/quiz_data.json');
            this.quizData = await response.json();
            console.log('🎮 Quiz data loaded:', this.quizData);
        } catch (error) {
            console.error('❌ Error loading quiz data:', error);
            this.quizData = { quizzes: {} };
        }
    }
    
    setupEventListeners() {
        // Submit guess button
        const submitBtn = document.getElementById('submitGuess');
        submitBtn.addEventListener('click', () => this.submitGuess());
        
        // Enter key in input
        const guessInput = document.getElementById('guessInput');
        guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitGuess();
            }
        });
        
        // Show hint button
        const showHintBtn = document.getElementById('showHint');
        showHintBtn.addEventListener('click', () => this.showHint());
        
        // Skip quiz button
        const skipBtn = document.getElementById('skipQuiz');
        skipBtn.addEventListener('click', () => this.skipQuiz());
    }
    
    startNewQuiz() {
        // Get available quizzes
        const availableQuizzes = Object.keys(this.quizData.quizzes).filter(
            quizId => !this.usedQuizzes.has(quizId)
        );
        
        // If all quizzes used, reset
        if (availableQuizzes.length === 0) {
            this.usedQuizzes.clear();
            this.showNotification('🎉 All quizzes completed! Starting over...', 'success');
        }
        
        // Select random quiz
        const randomQuizId = availableQuizzes[Math.floor(Math.random() * availableQuizzes.length)];
        this.currentQuiz = this.quizData.quizzes[randomQuizId];
        this.usedQuizzes.add(randomQuizId);
        this.totalQuizzesPlayed++;
        
        // Reset quiz state
        this.hintUsed = false;
        this.clearFeedback();
        this.clearHint();
        
        // Update UI
        this.updateQuizInfo();
        this.updateScoreDisplay();
        this.updateQuizCounter();
        
        // Apply quiz to map
        if (window.mapInstance) {
            window.mapInstance.applyQuizConfiguration(this.currentQuiz);
        }
        
        console.log('🎯 New quiz started:', this.currentQuiz.title);
    }
    
    submitGuess() {
        const guessInput = document.getElementById('guessInput');
        const guess = guessInput.value.trim().toLowerCase();
        
        if (!guess) {
            this.showFeedback('💡 Please enter a guess!', 'hint');
            return;
        }
        
        const isCorrect = this.checkAnswer(guess);
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
        
        // Clear input
        guessInput.value = '';
    }
    
    checkAnswer(guess) {
        if (!this.currentQuiz) return false;
        
        // Check against answer variations
        const answerVariations = this.currentQuiz.answer_variations.map(
            answer => answer.toLowerCase().trim()
        );
        
        // Check against tags
        const tags = this.currentQuiz.tags.map(tag => tag.toLowerCase().trim());
        
        // Check if guess matches any answer variation or tag
        return answerVariations.some(answer => 
            guess.includes(answer) || answer.includes(guess)
        ) || tags.some(tag => 
            guess.includes(tag) || tag.includes(guess)
        );
    }
    
    handleCorrectAnswer() {
        // Calculate score based on hint usage
        let points = this.hintUsed ? 5 : 10;
        this.score += points;
        this.streak++;
        
        // Show success feedback with emoji
        const emoji = this.getRandomSuccessEmoji();
        this.showFeedback(
            `${emoji} Correct! +${points} points. The answer was: ${this.currentQuiz.title}`,
            'correct'
        );
        
        // Add score pulse animation
        this.addScorePulseAnimation();
        
        // Update displays
        this.updateScoreDisplay();
        
        // Start new quiz after delay
        setTimeout(() => {
            this.startNewQuiz();
        }, 2500);
    }
    
    handleIncorrectAnswer() {
        this.streak = 0;
        this.updateScoreDisplay();
        
        this.showFeedback(
            '❌ Incorrect! Try again or use a hint.',
            'incorrect'
        );
    }
    
    showHint() {
        if (this.hintUsed) {
            this.showFeedback('💡 Hint already used!', 'hint');
            return;
        }
        
        this.hintUsed = true;
        
        // Get a random tag as hint
        const tags = this.currentQuiz.tags;
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        
        this.showHintText(`💡 Hint: Think about "${randomTag}"`);
        this.showFeedback('💡 Hint used! -5 points for correct answer.', 'hint');
    }
    
    skipQuiz() {
        this.streak = 0;
        this.updateScoreDisplay();
        
        this.showFeedback(
            `⏭️ Skipped! The answer was: ${this.currentQuiz.title}`,
            'hint'
        );
        
        // Start new quiz after delay
        setTimeout(() => {
            this.startNewQuiz();
        }, 2000);
    }
    
    showFeedback(message, type) {
        const feedback = document.getElementById('guessFeedback');
        feedback.textContent = message;
        feedback.className = `game-feedback ${type}`;
        
        // Add animation class
        if (type === 'correct') {
            feedback.classList.add('correct-answer');
        } else if (type === 'incorrect') {
            feedback.classList.add('incorrect-answer');
        }
        
        // Remove animation class after animation
        setTimeout(() => {
            feedback.classList.remove('correct-answer', 'incorrect-answer');
        }, 600);
    }
    
    showHintText(text) {
        const hintText = document.getElementById('hintText');
        hintText.textContent = text;
    }
    
    clearFeedback() {
        const feedback = document.getElementById('guessFeedback');
        feedback.textContent = '';
        feedback.className = 'game-feedback';
    }
    
    clearHint() {
        const hintText = document.getElementById('hintText');
        hintText.textContent = '';
    }
    
    updateQuizInfo() {
        const quizInfo = document.getElementById('quizInfo');
        
        if (!this.currentQuiz) {
            quizInfo.innerHTML = '<div class="loading-spinner"><i data-lucide="loader-2" class="spinner-icon"></i><span>No quiz available</span></div>';
            return;
        }
        
        // Get category emoji
        const categoryEmoji = this.getCategoryEmoji(this.currentQuiz.category);
        
        quizInfo.innerHTML = `
            <h4>${categoryEmoji} ${this.currentQuiz.title}</h4>
            <p>${this.currentQuiz.description}</p>
            <p><strong>Category:</strong> ${this.currentQuiz.category}</p>
        `;
        
        // Reinitialize Lucide icons
        lucide.createIcons();
    }
    
    updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        const streakElement = document.getElementById('streak');
        
        scoreElement.textContent = this.score;
        streakElement.textContent = this.streak;
        
        // Add pulse animation to score elements
        scoreElement.classList.add('score-pulse');
        streakElement.classList.add('score-pulse');
        
        setTimeout(() => {
            scoreElement.classList.remove('score-pulse');
            streakElement.classList.remove('score-pulse');
        }, 500);
    }
    
    updateQuizCounter() {
        const totalQuizzesElement = document.getElementById('totalQuizzes');
        if (totalQuizzesElement) {
            totalQuizzesElement.textContent = this.totalQuizzesPlayed;
        }
    }
    
    addScorePulseAnimation() {
        const scoreItems = document.querySelectorAll('.score-item');
        scoreItems.forEach(item => {
            item.classList.add('score-pulse');
            setTimeout(() => {
                item.classList.remove('score-pulse');
            }, 500);
        });
    }
    
    getRandomSuccessEmoji() {
        const emojis = ['🎉', '🎊', '🏆', '⭐', '🌟', '💫', '✨', '🎯', '🔥', '💎'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }
    
    getCategoryEmoji(category) {
        const categoryEmojis = {
            'economics': '💰',
            'demographics': '👥',
            'lifestyle': '☕',
            'social': '😊',
            'technology': '💻',
            'environment': '🌍',
            'health': '🏥',
            'education': '📚'
        };
        return categoryEmojis[category] || '🗺️';
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
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 400);
        }, 4000);
    }
}

// Initialize quiz game when script loads
const quizGame = new QuizGame();
