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
            // Get list of all JSON files in data folder
            const dataFiles = [
                'academy_awards_best_international_feature_film_by_country.json',
                'active_military_by_country.json',
                'african_countries_never_colonized.json',
                'afrikaans_dutch_native_speakers_by_country.json',
                'age_of_consent_by_country.json',
                'alcohol_consumption_per_capita_by_country.json',
                'amphibians_by_country.json',
                'arable_land_per_person.json',
                'average_annual_wages_usd_ppp_2023.json',
                'average_height_by_country.json',
                'billionaires_by_country.json',
                'birds_by_country.json',
                'blood_types_by_country.json',
                'blue_and_white_flags.json',
                'blue_flag_countries.json',
                'carbon_emissions_by_country.json',
                'chinese_native_speakers_by_country.json',
                'cocoa_production_by_country.json',
                'coffee_consumption_per_capita_by_country.json',
                'commonwealth_membership_by_country.json',
                'container_port_traffic_by_country.json',
                'corporate_tax_by_country.json',
                'country_by_first_letter.json',
                'country_exports_simplified.json',
                'country_party_system.json',
                'currencies_by_country.json',
                'currency_exchange_rate_usd.json',
                'distinct_land_neighbours_by_country.json',
                'earthquakes_by_country_2024.json',
                'english_primary_language_by_country.json',
                'english_speakers_total_by_country.json',
                'english_speaking_population_by_country.json',
                'external_debt_by_country.json',
                'external_debt_percent_gdp_by_country.json',
                'female_average_height_by_country.json',
                'fide_top_federations_open_august_2025.json',
                'fifa_mens_world_ranking.json',
                'firearms_per_100_by_country.json',
                'fish_by_country.json',
                'fixed_broadband_subscriptions_by_country.json',
                'flags_without_red.json',
                'food_energy_intake_by_country.json',
                'forest_area_km2_by_country.json',
                'forest_area_percentage_by_country.json',
                'french_official_language_status_by_country.json',
                'gdp_by_country_2025.json',
                'gdp_per_working_hour_2023.json',
                'german_native_speakers_by_country.json',
                'gni_per_capita_2024.json',
                'green_flag_countries.json',
                'hdi_by_country_2023.json',
                'highest_temperature_by_country.json',
                'high_speed_rail_by_country.json',
                'holocene_volcanoes_by_country.json',
                'horse_population_by_country.json',
                'imports_by_country.json',
                'internet_speed_by_country.json',
                'internet_usage_by_country.json',
                'landlocked_countries.json',
                'landlocked_countries_neighbours_with_ocean_access.json',
                'land_area.json',
                'latest_flag_adoption_by_country.json',
                'leading_export_market_by_country.json',
                'leading_import_source_by_country.json',
                'living_languages_by_country.json',
                'lower_house_seats_by_country.json',
                'lowest_temperature_by_country.json',
                'male_median_age_by_country.json',
                'mammals_by_country.json',
                'marriage_rate_per_1000_by_country.json',
                'maximum_elevation_by_country.json',
                'median_wealth_per_adult_2023.json',
                'mobile_connection_speed_by_country.json',
                'mobile_phone_numbers_by_country.json',
                'monarchies.json',
                'motor_vehicle_production_2024.json',
                'national_anthems_by_country.json',
                'national_capitals_by_country.json',
                'national_capitals_population_by_country.json',
                'national_capitals_population_percentage_by_country.json',
                'nobel_laureates_by_country.json',
                'nobel_literature_laureates_by_country.json',
                'number_of_islands_by_country.json',
                'official_languages_by_country.json',
                'oil_production_by_country.json',
                'olympics_hosted_by_country.json',
                'percent_christian_by_country.json',
                'percent_water.json',
                'plants_wcmc_by_country.json',
                'popes_by_country.json',
                'population_density.json',
                'population_per_lower_house_seat_by_country.json',
                'purple_flag_countries.json',
                'red_flag_countries.json',
                'reptiles_by_country.json',
                'road_network_size_by_country.json',
                'sex_ratio_by_country.json',
                'sheep_population_by_country.json',
                'shoe_size_by_country.json',
                'soccer_players_by_country.json',
                'spanish_native_speakers_by_country.json',
                'steel_production_by_country.json',
                'stock_market_capitalization_by_country.json',
                'strongest_earthquake_magnitude_by_country_2024.json',
                'summer_olympic_bronze_medals_by_country.json',
                'summer_olympic_gold_medals_by_country.json',
                'summer_olympic_silver_medals_by_country.json',
                'tea_consumption_per_capita_by_country.json',
                'time_zones_by_country.json',
                'top_goods_export_by_country.json',
                'total_fertility_rate_2025.json',
                'total_literacy_rate_by_country.json',
                'total_naval_assets_by_country.json',
                'traffic_related_death_rate_by_country.json',
                'uefa_champions_league_runners_up_by_country.json',
                'uefa_champions_league_winners_by_country.json',
                'unesco_sites_by_country.json',
                'usd_to_country_currencies.json',
                'waterways_length_by_country.json',
                'wealth_gini_percent_by_country.json',
                'wheat_production_by_country.json',
                'white_flag_countries.json',
                'wine_consumption_per_capita_by_country.json',
                'wine_production_by_country.json',
                'winter_olympic_gold_medals_by_country.json',
                'world_bank_income_group_by_country.json',
                'world_cup_wins_by_country.json',
                'world_figure_skating_gold_medals_by_country.json',
                'world_population_2025.json',
                'years_colonized_by_country.json',
                'yellow_flag_countries.json'
            ];
            
            // Load all datasets
            this.datasetList = [];
            const loadPromises = dataFiles.map(async (filename) => {
                try {
                    const response = await fetch(`data/${filename}`);
                    if (response.ok) {
                        const data = await response.json();
                        return this.convertToQuizFormat(data, filename);
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to load ${filename}:`, error);
                }
                return null;
            });
            
            const results = await Promise.all(loadPromises);
            this.datasetList = results.filter(dataset => dataset !== null);
            
            console.log(`📊 Loaded ${this.datasetList.length} datasets from data folder`);
        } catch (error) {
            console.error('❌ Failed to load quiz data:', error);
            this.datasetList = [];
        }
    }
    
    convertToQuizFormat(data, filename) {
        // Convert various data formats to quiz format
        let title = data.title || filename.replace('.json', '').replace(/_/g, ' ');
        let countries = {};
        let tags = [];
        let answerVariations = [];
        
        // Extract title and create tags
        if (data.title) {
            title = data.title;
            // Create tags from title words
            tags = title.toLowerCase().split(' ').filter(word => word.length > 3);
        }
        
        // Create answer variations from title
        answerVariations = [title.toLowerCase()];
        if (data.title) {
            const words = data.title.toLowerCase().split(' ');
            answerVariations.push(...words.filter(word => word.length > 3));
        }
        
        // Handle different data formats
        if (data.data) {
            if (Array.isArray(data.data)) {
                // Array format
                data.data.forEach(item => {
                    if (item.country && item.value !== undefined) {
                        countries[item.country] = {
                            value: item.value,
                            unit: item.unit || 'count'
                        };
                    }
                });
            } else {
                // Object format - data is already in the correct structure
                countries = data.data;
            }
        } else if (data.countries) {
            countries = data.countries;
        }
        
        // Generate random color scheme
        const colorSchemes = [
            { minColor: '#fff3e0', maxColor: '#e65100' },
            { minColor: '#e8f5e8', maxColor: '#2e7d32' },
            { minColor: '#e3f2fd', maxColor: '#1976d2' },
            { minColor: '#fce4ec', maxColor: '#c2185b' },
            { minColor: '#f3e5f5', maxColor: '#7b1fa2' },
            { minColor: '#fff8e1', maxColor: '#f57c00' },
            { minColor: '#e0f2f1', maxColor: '#00695c' },
            { minColor: '#f1f8e9', maxColor: '#558b2f' }
        ];
        
        const randomScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
        
        return {
            id: filename.replace('.json', ''),
            title: title,
            description: data.description || `Countries colored by ${title.toLowerCase()}`,
            category: 'general',
            tags: tags,
            answer_variations: answerVariations,
            colorScheme: {
                type: 'gradient',
                minColor: randomScheme.minColor,
                maxColor: randomScheme.maxColor,
                defaultColor: '#ffffff'
            },
            countries: countries
        };
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

        // Hint button
        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.showHint());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in input
            if (document.activeElement.tagName === 'INPUT') return;
            
            switch(e.key.toLowerCase()) {
                case 'h':
                    e.preventDefault();
                    this.showHint();
                    break;
                case 's':
                    e.preventDefault();
                    this.skipQuiz();
                    break;
                case 'r':
                    e.preventDefault();
                    this.restartGame();
                    break;
                case 'n':
                    e.preventDefault();
                    this.nextQuestion();
                    break;
                case 'escape':
                    e.preventDefault();
                    this.clearCountrySelection();
                    break;
            }
        });
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
        console.log(`🎯 Available datasets: ${this.datasetList.length}`);
        
        if (this.datasetList.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.datasetList.length);
            this.currentQuiz = this.datasetList[randomIndex];
            
            console.log(`🎯 Selected quiz: ${this.currentQuiz.title}`);
            console.log(`🎯 Quiz data sample:`, Object.keys(this.currentQuiz.countries).slice(0, 5));
            
            // Apply quiz to map
            if (window.mapInstance && this.currentQuiz) {
                console.log('🎯 Applying quiz configuration to map...');
                window.mapInstance.applyQuizConfiguration(this.currentQuiz);
                console.log('🎯 Quiz configuration applied!');
            } else {
                console.log('❌ Map instance or current quiz not available');
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

    getHint() {
        if (!this.currentQuiz || !this.currentQuiz.tags || this.currentQuiz.tags.length === 0) {
            return "No hints available for this quiz.";
        }
        
        // Deduct 5 points for using hint
        this.score = Math.max(0, this.score - 5);
        
        // Return random tag as hint
        const randomTag = this.currentQuiz.tags[Math.floor(Math.random() * this.currentQuiz.tags.length)];
        return `Hint: ${randomTag}`;
    }

    skipQuiz() {
        console.log('⏭️ Skipping current quiz');
        this.nextQuestion();
    }

    restartGame() {
        console.log('🔄 Restarting game...');
        this.resetGameState();
        this.startNewQuiz();
    }

    showHint() {
        if (!this.currentQuiz) return;
        
        const hint = this.getHint();
        this.showFeedback(hint, 'hint');
    }

    clearCountrySelection() {
        if (window.mapInstance && window.mapInstance.clearSelection) {
            window.mapInstance.clearSelection();
        }
    }

    showFeedback(isCorrect, type = 'answer') {
        const feedbackElement = document.querySelector('.feedback');
        if (feedbackElement) {
            if (type === 'hint') {
                feedbackElement.textContent = isCorrect;
                feedbackElement.className = 'feedback hint';
            } else {
                feedbackElement.textContent = isCorrect ? 'Correct!' : 'Incorrect!';
                feedbackElement.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
            }
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
            console.log(`🎯 Starting round ${this.currentProgress + 1} with new dataset...`);
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
                        <p>Score: <strong>${correctAnswers}/10</strong></p>
                        <p>Press <strong>Enter</strong> to restart</p>
                    </div>
                </div>
            `;
            
            // Add Enter key listener for restart
            const handleEnterRestart = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    document.removeEventListener('keydown', handleEnterRestart);
                    this.restartGame();
                }
            };
            
            document.addEventListener('keydown', handleEnterRestart);
            
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
