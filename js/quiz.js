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
        this.countryMapper = new CountryMapper();
        
        this.init();
    }
    
    async init() {
        await this.loadAllQuizData();
        this.setupEventListeners();
        this.startNewQuiz();
    }
    
    async loadAllQuizData() {
        try {
            // First load the existing quiz data
            const response = await fetch('data/quiz_data.json');
            this.quizData = await response.json();
            console.log('🎮 Base quiz data loaded:', Object.keys(this.quizData.quizzes).length, 'quizzes');
            
            // Now convert and add all the new data files
            await this.loadConvertedData();
            
            console.log('🎮 Total quizzes available:', Object.keys(this.quizData.quizzes).length, 'quizzes');
        } catch (error) {
            console.error('❌ Error loading quiz data:', error);
            this.quizData = { quizzes: {} };
        }
    }
    
    async loadConvertedData() {
        try {
            // Convert land area data
            const landAreaQuiz = await this.convertLandAreaData();
            if (landAreaQuiz) {
                this.quizData.quizzes[landAreaQuiz.id] = landAreaQuiz;
                console.log('🗺️ Added Land Area quiz');
            }
            
            // Convert water percentage data
            const waterPercentageQuiz = await this.convertWaterPercentageData();
            if (waterPercentageQuiz) {
                this.quizData.quizzes[waterPercentageQuiz.id] = waterPercentageQuiz;
                console.log('💧 Added Water Percentage quiz');
            }
            
            // Convert arable land data
            const arableLandQuiz = await this.convertArableLandData();
            if (arableLandQuiz) {
                this.quizData.quizzes[arableLandQuiz.id] = arableLandQuiz;
                console.log('🌾 Added Arable Land quiz');
            }
            
            // Convert population density data
            const populationDensityQuiz = await this.convertPopulationDensityData();
            if (populationDensityQuiz) {
                this.quizData.quizzes[populationDensityQuiz.id] = populationDensityQuiz;
                console.log('👥 Added Population Density (Detailed) quiz');
            }
            
        } catch (error) {
            console.error('❌ Error loading converted data:', error);
        }
    }
    
    async convertLandAreaData() {
        try {
            const response = await fetch('data/land_area.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            data.data.forEach(item => {
                if (item.country !== 'Earth' && item.country !== 'Antarctica') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.land_area_km2,
                        unit: 'km²'
                    };
                    values.push(item.land_area_km2);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e8f5e8', '#2e7d32');
            });
            
            return {
                id: 'land_area',
                title: 'Land Area',
                description: 'Countries colored by total land area',
                category: 'geography',
                tags: ['land area', 'area', 'size', 'geography', 'territory', 'landmass', 'country size'],
                answer_variations: [
                    'land area',
                    'area',
                    'country size',
                    'territory size',
                    'landmass',
                    'geographic area',
                    'land size'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e8f5e8',
                    maxColor: '#2e7d32',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting land area data:', error);
            return null;
        }
    }
    
    async convertWaterPercentageData() {
        try {
            const response = await fetch('data/percent_water.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            data.data.forEach(item => {
                if (item.country !== 'Earth') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.percent_water,
                        unit: '%'
                    };
                    values.push(item.percent_water);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values (blue gradient for water)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e3f2fd', '#1976d2');
            });
            
            return {
                id: 'water_percentage',
                title: 'Water Percentage',
                description: 'Countries colored by percentage of water coverage',
                category: 'geography',
                tags: ['water', 'percentage', 'water coverage', 'geography', 'water area', 'water percentage'],
                answer_variations: [
                    'water percentage',
                    'water coverage',
                    'water area',
                    'percentage water',
                    'water',
                    'water area percentage'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e3f2fd',
                    maxColor: '#1976d2',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting water percentage data:', error);
            return null;
        }
    }
    
    async convertArableLandData() {
        try {
            const response = await fetch('data/arable_land_per_person.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.arable_land_per_person_m2,
                        unit: 'm²/person'
                    };
                    values.push(item.arable_land_per_person_m2);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values (brown gradient for arable land)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fff3e0', '#8d6e63');
            });
            
            return {
                id: 'arable_land_per_person',
                title: 'Arable Land per Person',
                description: 'Countries colored by arable land area per person',
                category: 'agriculture',
                tags: ['arable land', 'agriculture', 'farming', 'land per person', 'agricultural land', 'farmland'],
                answer_variations: [
                    'arable land per person',
                    'arable land',
                    'agricultural land',
                    'farmland per person',
                    'farming land',
                    'arable land per capita'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fff3e0',
                    maxColor: '#8d6e63',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting arable land data:', error);
            return null;
        }
    }
    
    async convertPopulationDensityData() {
        try {
            const response = await fetch('data/population_density.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.density_km2,
                        unit: 'people/km²'
                    };
                    values.push(item.density_km2);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values (purple gradient for density)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#f3e5f5', '#7b1fa2');
            });
            
            return {
                id: 'population_density_new',
                title: 'Population Density (Detailed)',
                description: 'Countries colored by population density with comprehensive data',
                category: 'demographics',
                tags: ['population density', 'density', 'people per area', 'crowding', 'demographics'],
                answer_variations: [
                    'population density',
                    'density',
                    'people per square kilometer',
                    'crowding',
                    'population per area'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#f3e5f5',
                    maxColor: '#7b1fa2',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting population density data:', error);
            return null;
        }
    }
    
    getColorForRatio(ratio, minColor, maxColor) {
        // Simple linear interpolation between two colors
        const r1 = parseInt(minColor.slice(1, 3), 16);
        const g1 = parseInt(minColor.slice(3, 5), 16);
        const b1 = parseInt(minColor.slice(5, 7), 16);
        
        const r2 = parseInt(maxColor.slice(1, 3), 16);
        const g2 = parseInt(maxColor.slice(3, 5), 16);
        const b2 = parseInt(maxColor.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
            'education': '📚',
            'geography': '🗺️',
            'agriculture': '🌾'
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
