// Quiz Game Controller
class QuizGame {
    constructor() {
        this.quizData = null;
        this.currentQuiz = null;
        this.score = 0;
        this.streak = 0;
        this.usedQuizzes = new Set();
        this.hintUsed = false;
        
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
            console.log('Quiz data loaded:', this.quizData);
        } catch (error) {
            console.error('Error loading quiz data:', error);
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
            this.showNotification('All quizzes completed! Starting over...', 'info');
        }
        
        // Select random quiz
        const randomQuizId = availableQuizzes[Math.floor(Math.random() * availableQuizzes.length)];
        this.currentQuiz = this.quizData.quizzes[randomQuizId];
        this.usedQuizzes.add(randomQuizId);
        
        // Reset quiz state
        this.hintUsed = false;
        this.clearFeedback();
        this.clearHint();
        
        // Update UI
        this.updateQuizInfo();
        this.updateScoreDisplay();
        
        // Apply quiz to map
        if (window.mapInstance) {
            window.mapInstance.applyQuizConfiguration(this.currentQuiz);
        }
        
        console.log('New quiz started:', this.currentQuiz.title);
    }
    
    submitGuess() {
        const guessInput = document.getElementById('guessInput');
        const guess = guessInput.value.trim().toLowerCase();
        
        if (!guess) {
            this.showFeedback('Please enter a guess!', 'hint');
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
        
        // Show success feedback
        this.showFeedback(
            `Correct! +${points} points. The answer was: ${this.currentQuiz.title}`,
            'correct'
        );
        
        // Update displays
        this.updateScoreDisplay();
        
        // Start new quiz after delay
        setTimeout(() => {
            this.startNewQuiz();
        }, 2000);
    }
    
    handleIncorrectAnswer() {
        this.streak = 0;
        this.updateScoreDisplay();
        
        this.showFeedback(
            'Incorrect! Try again or use a hint.',
            'incorrect'
        );
    }
    
    showHint() {
        if (this.hintUsed) {
            this.showFeedback('Hint already used!', 'hint');
            return;
        }
        
        this.hintUsed = true;
        
        // Get a random tag as hint
        const tags = this.currentQuiz.tags;
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        
        this.showHintText(`Hint: Think about "${randomTag}"`);
        this.showFeedback('Hint used! -5 points for correct answer.', 'hint');
    }
    
    skipQuiz() {
        this.streak = 0;
        this.updateScoreDisplay();
        
        this.showFeedback(
            `Skipped! The answer was: ${this.currentQuiz.title}`,
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
        feedback.className = `guess-feedback ${type}`;
        
        // Add animation class
        if (type === 'correct') {
            feedback.classList.add('correct-answer');
        } else if (type === 'incorrect') {
            feedback.classList.add('incorrect-answer');
        }
        
        // Remove animation class after animation
        setTimeout(() => {
            feedback.classList.remove('correct-answer', 'incorrect-answer');
        }, 500);
    }
    
    showHintText(text) {
        const hintText = document.getElementById('hintText');
        hintText.textContent = text;
    }
    
    clearFeedback() {
        const feedback = document.getElementById('guessFeedback');
        feedback.textContent = '';
        feedback.className = 'guess-feedback';
    }
    
    clearHint() {
        const hintText = document.getElementById('hintText');
        hintText.textContent = '';
    }
    
    updateQuizInfo() {
        const quizInfo = document.getElementById('quizInfo');
        
        if (!this.currentQuiz) {
            quizInfo.innerHTML = '<p class="no-quiz">No quiz available</p>';
            return;
        }
        
        quizInfo.innerHTML = `
            <h4>${this.currentQuiz.title}</h4>
            <p>${this.currentQuiz.description}</p>
            <p><strong>Category:</strong> ${this.currentQuiz.category}</p>
        `;
    }
    
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
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
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        });
        
        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };
        notification.style.background = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize quiz game when script loads
const quizGame = new QuizGame();
