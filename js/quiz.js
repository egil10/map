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
        this.gameMode = 'play';
        this.learnModeSequence = [];
        this.learnModeCurrentIndex = 0;
        this.datasetList = [];
        this.isReady = false;
        this.lastAnswerWasCorrect = undefined;
        this.waitingForNext = false;
        this.nextQuestionListener = null;
        
        // Track quiz history
        this.quizHistory = [];
        this.lastGuess = null;
        this.lastCorrectAnswer = null;
        
        this.init();
    }
    
    async init() {
        console.log('🎯 Quiz Game initializing...');
        
        // Show loading state immediately
        this.showLoadingMessage();
        
        // Setup event listeners first
        this.setupEventListeners();
        
        // Load quiz data
        await this.loadQuizData();
        
        // Initialize learn mode
        this.initializeLearnModeSequence();
        
        console.log('🎯 Quiz Game ready!');
        console.log('🎯 Total datasets loaded:', this.datasetList.length);
        
        // Check if we have enough datasets
        if (this.datasetList.length < 4) {
            console.error('❌ Not enough datasets loaded! Need at least 4, got:', this.datasetList.length);
            const inputContainer = document.querySelector('.input-container');
            if (inputContainer) {
                inputContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #e74c3c;">
                        <p><strong>Error:</strong> Not enough datasets loaded</p>
                        <p>Only ${this.datasetList.length} of 169 datasets loaded successfully.</p>
                        <p>Please refresh the page.</p>
                    </div>
                `;
            }
            return;
        }
        
        // Wait a bit longer for DOM and app to be fully ready (increased for 167 datasets)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.isReady = true;
        
        // Check for stored game mode from previous session
        const storedGameMode = localStorage.getItem('geoquest-game-mode');
        if (storedGameMode && ['play', 'learn'].includes(storedGameMode)) {
            console.log('🎯 Restoring game mode:', storedGameMode);
            this.setGameMode(storedGameMode);
            // Clear the stored mode after using it
            localStorage.removeItem('geoquest-game-mode');
        } else {
            // Start with play mode by default
            console.log('🎯 Setting default game mode to play');
            this.setGameMode('play');
        }
    }

    async loadQuizData() {
        // Load every dataset from a single pre-built bundle (data/datasets.bundle.json,
        // produced by tools/build.js). This replaces ~235 individual fetches with one
        // request. Falls back to the manifest + individual files if the bundle is missing.
        try {
            const bundleResp = await fetch('data/datasets.bundle.json');
            if (bundleResp.ok) {
                const bundle = await bundleResp.json();
                this.datasetList = Object.entries(bundle)
                    .map(([filename, data]) => this.convertToQuizFormat(data, filename))
                    .filter(dataset => dataset !== null);
                console.log(`📊 Loaded ${this.datasetList.length} datasets from bundle`);
                this.updateDatasetCounter();
                return;
            }

            console.warn('⚠️ Dataset bundle unavailable, falling back to manifest');
            const manifestResp = await fetch('data/manifest.json');
            const dataFiles = manifestResp.ok ? await manifestResp.json() : [];
            const results = await Promise.all(dataFiles.map(async (filename) => {
                try {
                    const response = await fetch(`data/${filename}`);
                    if (!response.ok) return null;
                    return this.convertToQuizFormat(await response.json(), filename);
                } catch (error) {
                    console.error(`❌ Error loading ${filename}:`, error.message);
                    return null;
                }
            }));
            this.datasetList = results.filter(dataset => dataset !== null);
            console.log(`📊 Loaded ${this.datasetList.length} datasets via manifest fallback`);
            this.updateDatasetCounter();
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
                // Array format (e.g., average_height_by_country.json)
                // Example: {"country": "Netherlands", "average_height_cm": 177.1}
                data.data.forEach(item => {
                    if (item.country) {
                        let value = item.value;
                        let unit = item.unit || data.unit || 'count';
                        
                        // If 'value' doesn't exist, find the first numeric or string property that's not 'country'
                        if (value === undefined) {
                            const keys = Object.keys(item).filter(k => 
                                k !== 'country' && 
                                k !== 'Country Name' && 
                                k !== 'Country' &&
                                item[k] !== null &&
                                item[k] !== undefined
                            );
                            
                            if (keys.length > 0) {
                                const dataKey = keys[0];
                                value = item[dataKey];
                                
                                // Use the key name as unit if no unit specified in item or root
                                if (!item.unit && !data.unit) {
                                    unit = dataKey
                                        .replace(/_/g, ' ')
                                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                                        .toLowerCase();
                                }
                            }
                        }
                        
                        if (value !== undefined && value !== null) {
                            countries[item.country] = {
                                value: value,
                                unit: unit,
                                'Country Name': item['Country Name'] || item.country
                            };
                        }
                    }
                });
            } else if (typeof data.data === 'object') {
                // Object format - can be simple key-value or nested structure
                Object.entries(data.data).forEach(([country, countryData]) => {
                    if (countryData === null || countryData === undefined) {
                        return; // Skip null/undefined entries
                    }
                    
                    // If countryData is a simple primitive (number or string), convert it
                    if (typeof countryData === 'number' || typeof countryData === 'string') {
                        countries[country] = {
                            value: countryData,
                            unit: data.unit || 'count',
                            'Country Name': country
                        };
                    } else if (typeof countryData === 'object') {
                        // If it's already an object with nested structure, use it
                        // Ensure it has a 'value' property or extract the first numeric/string property
                        if (countryData.value !== undefined) {
                            countries[country] = {
                                ...countryData,
                                'Country Name': countryData['Country Name'] || country
                            };
                        } else {
                            // Try to find a value property in the object
                            const keys = Object.keys(countryData).filter(k => 
                                k !== 'Country Name' && 
                                k !== 'country' &&
                                countryData[k] !== null &&
                                countryData[k] !== undefined
                            );
                            
                            if (keys.length > 0) {
                                const dataKey = keys[0];
                                countries[country] = {
                                    value: countryData[dataKey],
                                    unit: countryData.unit || data.unit || dataKey.replace(/_/g, ' '),
                                    'Country Name': countryData['Country Name'] || country
                                };
                            }
                        }
                    }
                });
            }
        } else if (data.countries) {
            // Legacy format: data.countries instead of data.data
            countries = data.countries;
        }
        
        // Validate that we have actual country data
        if (!countries || Object.keys(countries).length === 0) {
            console.warn(`⚠️ No country data found in ${filename}`);
            return null; // Skip this dataset
        }
        
        // Check if we have valid values (numeric OR categorical/string)
        const validCountries = Object.entries(countries).filter(([country, data]) => {
            // Accept if data has a value that is either:
            // 1. A valid number
            // 2. A non-empty string (for categorical data)
            if (!data || data.value === undefined || data.value === null) {
                return false;
            }
            
            const isValidNumber = typeof data.value === 'number' && !isNaN(data.value);
            const isValidString = typeof data.value === 'string' && data.value.trim().length > 0;
            
            return isValidNumber || isValidString;
        });
        
        if (validCountries.length === 0) {
            console.warn(`⚠️ No valid values (numeric or categorical) found in ${filename}`);
            console.warn(`   Sample data:`, Object.entries(countries).slice(0, 3));
            return null; // Skip this dataset
        }
        
        console.log(`✅ ${filename}: ${validCountries.length} valid countries`);
        
        if (validCountries.length < 10) {
            console.warn(`⚠️ ${filename} has very few countries (${validCountries.length}), might affect quiz quality`);
        }
        
        // Only include countries with valid data
        const validCountriesObj = {};
        validCountries.forEach(([country, data]) => {
            validCountriesObj[country] = data;
        });
        
        // Detect if data is categorical (all string values) or numeric
        const allValues = validCountries.map(([, data]) => data.value);
        const isCategorical = allValues.every(val => typeof val === 'string');
        
        let colorScheme;
        
        if (isCategorical) {
            // For categorical data, assign distinct colors to each category
            const uniqueCategories = [...new Set(allValues)];
            
            // Predefined color palette for categories
            const categoryColors = [
                '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
                '#1abc9c', '#e67e22', '#34495e', '#95a5a6', '#d35400',
                '#c0392b', '#8e44ad', '#27ae60', '#2980b9', '#f1c40f',
                '#16a085', '#e84393', '#00b894', '#6c5ce7', '#fdcb6e'
            ];
            
            // Create color mapping for categories
            const categoryColorMap = {};
            uniqueCategories.forEach((category, index) => {
                categoryColorMap[category] = categoryColors[index % categoryColors.length];
            });
            
            // Assign colors to each country based on its category
            Object.entries(validCountriesObj).forEach(([country, data]) => {
                data.color = categoryColorMap[data.value];
            });
            
            colorScheme = {
                type: 'categorical',
                categories: categoryColorMap,
                defaultColor: '#ffffff'
            };
            
            console.log(`🎨 Categorical dataset detected: ${filename} with ${uniqueCategories.length} categories`);
        } else {
            // For numeric data, use gradient color scheme
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
            
            colorScheme = {
                type: 'gradient',
                minColor: randomScheme.minColor,
                maxColor: randomScheme.maxColor,
                defaultColor: '#ffffff'
            };
            
            console.log(`🎨 Numeric dataset detected: ${filename} using gradient colors`);
        }
        
        return {
            id: filename.replace('.json', ''),
            title: title,
            description: data.description || `Countries colored by ${title.toLowerCase()}`,
            category: 'general',
            tags: tags,
            answer_variations: answerVariations,
            source: data.source || null,
            colorScheme: colorScheme,
            unit: data.unit || Object.values(validCountriesObj)[0]?.unit || '',
            countries: validCountriesObj
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

        // Dataset browser close button
        const closeBrowserBtn = document.getElementById('closeDatasetBrowser');
        if (closeBrowserBtn) {
            closeBrowserBtn.addEventListener('click', () => this.closeDatasetBrowser());
        }
        
        // Close dataset browser when clicking outside
        const datasetBrowser = document.getElementById('datasetBrowser');
        if (datasetBrowser) {
            datasetBrowser.addEventListener('click', (e) => {
                if (e.target === datasetBrowser) {
                    this.closeDatasetBrowser();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' && e.key !== 'Escape') {
                return; // Don't interfere with typing in input fields
            }
            
            switch (e.key) {
                case 'h':
                case 'H':
                    e.preventDefault();
                    this.showHint();
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    this.skipQuiz();
                    break;
                case 'n':
                case 'N':
                    e.preventDefault();
                    this.startNewQuiz();
                    break;
                case 'Escape':
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
        this.quizHistory = [];
        this.lastGuess = null;
        this.lastCorrectAnswer = null;
        this.resetProgressBar();
        this.removeCompletionScreen();
    }

    startLearnMode() {
        if (this.learnModeSequence.length > 0) {
            this.currentQuiz = this.learnModeSequence[this.learnModeCurrentIndex];
            // Hide answer title at top of map (we show it in footer instead)
            this.hideAnswerTitle();
            this.showLearnModeControls();
            this.loadLearnModeDataset();
        }
    }

    startNewQuiz() {
        console.log(`🎯 Starting new quiz in ${this.gameMode} mode`);
        console.log(`🎯 Available datasets: ${this.datasetList.length}`);
        console.log(`🎯 Is ready: ${this.isReady}`);
        
        this.removeCompletionScreen();
        
        // If not ready yet, wait for initialization to complete
        if (!this.isReady) {
            console.log('⏳ Quiz not ready yet, waiting...');
            console.log('⏳ Current dataset count:', this.datasetList.length);
            setTimeout(() => this.startNewQuiz(), 1000);
            return;
        }
        
        if (this.datasetList.length === 0) {
            console.error('❌ No datasets available, showing loading message');
            this.showLoadingMessage();
            return;
        }
        
        if (this.datasetList.length < 4) {
            console.error('❌ Not enough datasets for quiz (need at least 4)');
            const inputContainer = document.querySelector('.input-container');
            if (inputContainer) {
                inputContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #e74c3c;">
                        <p><strong>Error:</strong> Not enough datasets for quiz</p>
                        <p>Need at least 4 datasets, only ${this.datasetList.length} available.</p>
                    </div>
                `;
            }
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * this.datasetList.length);
        const selectedQuiz = this.datasetList[randomIndex];
        
        // Validate dataset has valid data
        if (!selectedQuiz || !selectedQuiz.countries || Object.keys(selectedQuiz.countries).length === 0) {
            console.warn('⚠️ Selected invalid dataset, trying another one...');
            // Remove invalid dataset and try again
            this.datasetList.splice(randomIndex, 1);
            if (this.datasetList.length > 0) {
                return this.startNewQuiz(); // Try again with remaining datasets
            } else {
                console.error('❌ No valid datasets available');
                this.showLoadingMessage();
                return;
            }
        }
        
        this.currentQuiz = selectedQuiz;
        
        console.log(`🎯 Selected quiz: ${this.currentQuiz.title}`);
        console.log(`🎯 Quiz data sample:`, Object.keys(this.currentQuiz.countries).slice(0, 5));
        
        // Apply quiz to map
        if (window.mapInstance && this.currentQuiz) {
            console.log('🎯 Applying quiz configuration to map...');
            window.mapInstance.applyQuizConfiguration(this.currentQuiz, this.gameMode);
            console.log('🎯 Quiz configuration applied!');
        } else {
            console.log('❌ Map instance or current quiz not available');
        }
        
        // Update color bar
        this.updateColorBar();
        
        // Keep the source hidden in play mode until the player answers, so the
        // website name doesn't spoil the dataset. It is revealed on answer.
        if (window.app && window.app.hideSourceAttribution) {
            window.app.hideSourceAttribution();
        }

        if (this.gameMode === 'play') {
            console.log('🎯 Showing play mode (multiple choice)');
            this.hideAnswerTitle();
            this.showMultipleChoice();
        }
    }
    
    showLoadingMessage() {
        const inputContainer = document.querySelector('.input-container');
        if (inputContainer) {
            inputContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666;">
                    <p>Loading datasets...</p>
                </div>
            `;
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


    showMultipleChoice() {
        console.log('🎯 showMultipleChoice called');
        
        if (!this.currentQuiz) {
            console.error('❌ No current quiz for multiple choice');
            this.showLoadingMessage();
            return;
        }
        
        if (this.datasetList.length < 4) {
            console.error('❌ Not enough datasets for multiple choice (need at least 4), got:', this.datasetList.length);
            console.error('❌ This should not happen if init() completed successfully');
            const inputContainer = document.querySelector('.input-container');
            if (inputContainer) {
                inputContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #e74c3c;">
                        <p><strong>Error:</strong> Cannot show multiple choice</p>
                        <p>Only ${this.datasetList.length} datasets available (need 4+)</p>
                    </div>
                `;
            }
            return;
        }
        
        console.log('🎯 Showing multiple choice for:', this.currentQuiz.title);
        
        const inputContainer = document.querySelector('.input-container');
        if (!inputContainer) {
            console.error('❌ Input container not found!');
            return;
        }
        
        const correctDataset = this.currentQuiz.title;
        const wrongDatasets = this.datasetList
            .filter(dataset => dataset.title !== correctDataset)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        if (wrongDatasets.length < 3) {
            console.error('❌ Not enough wrong options for multiple choice');
            return;
        }
        
        const options = [correctDataset, ...wrongDatasets.map(d => d.title)];
        const shuffledOptions = options.sort(() => Math.random() - 0.5);
        
        console.log('🎯 Multiple choice options:', shuffledOptions);
        console.log('🎯 Correct answer:', correctDataset);
        
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
        
        console.log('🎯 Multiple choice HTML created');
        
        // Add event listeners with proper error handling
        setTimeout(() => {
            const buttons = document.querySelectorAll('.choice-btn');
            console.log('🎯 Found', buttons.length, 'choice buttons');
            buttons.forEach(btn => {
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
        
        // Store guess and correct answer
        this.lastGuess = selectedAnswer;
        this.lastCorrectAnswer = this.currentQuiz ? this.currentQuiz.title : 'Unknown';
        
        // Track quiz history
        if (this.currentQuiz) {
            this.quizHistory.push({
                map: this.currentQuiz.title,
                guess: selectedAnswer,
                correct: isCorrect,
                correctAnswer: this.currentQuiz.title
            });
        }
        
        // Disable all buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.pointerEvents = 'none';
        });
        
        // Visual feedback - show colors on buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            if (btn.dataset.answer === this.currentQuiz.title) {
                // Correct answer - always green
                btn.classList.add('correct');
            } else if (btn.dataset.answer === selectedAnswer && !isCorrect) {
                // Wrong answer selected - red
                btn.classList.add('incorrect');
            }
        });
        
        // Update progress
        this.updateProgressBar(isCorrect);

        // Now that the answer is locked in, reveal the source attribution.
        if (window.app && window.app.updateSourceAttribution) {
            window.app.updateSourceAttribution();
        }

        // Auto-advance after 2 seconds for multiple choice
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
        
        // Store guess and correct answer
        this.lastGuess = userGuess;
        this.lastCorrectAnswer = this.currentQuiz ? this.currentQuiz.title : 'Unknown';
        
        // Track quiz history
        if (this.currentQuiz) {
            this.quizHistory.push({
                map: this.currentQuiz.title,
                guess: userGuess,
                correct: isCorrect,
                correctAnswer: this.currentQuiz.title
            });
        }
        
        // Disable input and button
        guessInput.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
        
        // Update progress
        this.updateProgressBar(isCorrect);
        
        // Show the correct answer as feedback (like in learn mode)
        this.showAnswerTitle();

        // Answer is in — reveal the source attribution.
        if (window.app && window.app.updateSourceAttribution) {
            window.app.updateSourceAttribution();
        }

        // Wait for Enter key press to advance instead of auto-advance
        this.waitingForNext = true;
        this.setupNextQuestionListener();
    }

    setupNextQuestionListener() {
        // Remove existing listener if any
        if (this.nextQuestionListener) {
            document.removeEventListener('keydown', this.nextQuestionListener);
        }
        
        // Add new listener for Enter key
        this.nextQuestionListener = (e) => {
            if (e.key === 'Enter' && this.waitingForNext) {
                e.preventDefault();
                this.waitingForNext = false;
                document.removeEventListener('keydown', this.nextQuestionListener);
                this.nextQuestion();
            }
        };
        
        document.addEventListener('keydown', this.nextQuestionListener);
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
        // Clean up next question listener
        if (this.nextQuestionListener) {
            document.removeEventListener('keydown', this.nextQuestionListener);
            this.nextQuestionListener = null;
        }
        this.waitingForNext = false;
        
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
            this.hideAnswerTitle();
            this.resetInput();
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
            const currentDataset = this.learnModeSequence[this.learnModeCurrentIndex];
            
            // Validate dataset has valid data
            if (!currentDataset || !currentDataset.countries || Object.keys(currentDataset.countries).length === 0) {
                console.warn('⚠️ Skipping invalid dataset in learn mode:', currentDataset?.title || 'Unknown');
                this.learnModeCurrentIndex++;
                if (this.learnModeCurrentIndex >= this.learnModeSequence.length) {
                    this.learnModeCurrentIndex = 0;
                }
                return this.loadLearnModeDataset(); // Try next dataset
            }
            
            this.currentQuiz = currentDataset;
            
            console.log('📚 Learn mode dataset loaded:', currentDataset.title);
            console.log(`📊 Dataset has ${Object.keys(currentDataset.countries).length} countries with data`);
            
            // Apply quiz to map
            if (window.mapInstance && this.currentQuiz) {
                window.mapInstance.applyQuizConfiguration(this.currentQuiz, this.gameMode);
            }
            
            // Update color bar
            this.updateColorBar();
            
            // Update title in footer (we don't show the top answer title anymore)
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
        const colorBarLabels = document.querySelector('.color-bar-labels');
        
        // Check if this is categorical data
        const isCategorical = this.currentQuiz.colorScheme?.type === 'categorical';
        
        // Hide labels for categorical data, show for numeric data
        if (colorBarLabels) {
            colorBarLabels.style.display = isCategorical ? 'none' : 'flex';
        }
        
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
        
        // Only update numeric labels if this is numeric data
        if (!isCategorical) {
            // Update color bar labels with actual values
            const colorBarMin = document.getElementById('colorBarMin');
            const colorBarQ1 = document.getElementById('colorBarQ1');
            const colorBarMid = document.getElementById('colorBarMid');
            const colorBarQ3 = document.getElementById('colorBarQ3');
            const colorBarMax = document.getElementById('colorBarMax');
            
            if (this.currentQuiz.countries) {
                const values = Object.values(this.currentQuiz.countries)
                    .map(c => c.value)
                    .filter(v => !isNaN(v) && v !== null && v !== undefined);
                
                if (values.length > 0) {
                    const sortedValues = values.sort((a, b) => a - b);
                    
                    // Calculate quartiles
                    const minValue = sortedValues[0];
                    const maxValue = sortedValues[sortedValues.length - 1];
                    const q1Index = Math.floor(sortedValues.length * 0.25);
                    const midIndex = Math.floor(sortedValues.length * 0.5);
                    const q3Index = Math.floor(sortedValues.length * 0.75);
                    
                    const q1Value = sortedValues[q1Index];
                    const midValue = sortedValues[midIndex];
                    const q3Value = sortedValues[q3Index];
                    
                    // Update labels with actual values. Hide the unit during
                    // play so it doesn't give away the dataset.
                    const unit = this.gameMode === 'play' ? '' : (this.currentQuiz.unit || '');
                    if (colorBarMin) colorBarMin.textContent = this.formatValue(minValue, unit);
                    if (colorBarQ1) colorBarQ1.textContent = this.formatValue(q1Value, unit);
                    if (colorBarMid) colorBarMid.textContent = this.formatValue(midValue, unit);
                    if (colorBarQ3) colorBarQ3.textContent = this.formatValue(q3Value, unit);
                    if (colorBarMax) colorBarMax.textContent = this.formatValue(maxValue, unit);
                }
            }
        }
    }

    formatValue(value, unit) {
        if (value === null || value === undefined) {
            return '—';
        }
        if (typeof value === 'string') {
            return value;
        }

        const num = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(num)) {
            return String(value);
        }

        let formatted = '';
        if (num >= 1000000) {
            formatted = (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            formatted = (num / 1000).toFixed(1) + 'K';
        } else if (num >= 1) {
            formatted = num.toFixed(0);
        } else {
            formatted = num.toFixed(2);
        }

        if (unit) {
            const trimmedUnit = unit.trim();
            if (trimmedUnit === '%' || trimmedUnit.toLowerCase() === 'percent') {
                return formatted + '%';
            }
            return formatted + ' ' + trimmedUnit;
        }
        return formatted;
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
        // Update toggle option states
        document.querySelectorAll('.toggle-option').forEach(option => {
            option.classList.remove('active');
        });
        
        const activeOption = document.querySelector(`.toggle-option[data-mode="${this.gameMode}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
        
        // Update toggle button data-mode attribute
        const gameModeToggle = document.getElementById('gameModeToggle');
        if (gameModeToggle) {
            gameModeToggle.setAttribute('data-mode', this.gameMode);
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

    resetInput() {
        const guessInput = document.getElementById('guessInput');
        const submitBtn = document.getElementById('submitGuess');
        
        if (guessInput) {
            guessInput.value = '';
            guessInput.disabled = false;
            guessInput.focus();
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
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
        console.log('Game completed!');
        
        // Calculate actual score by counting green circles
        const progressCircles = document.querySelectorAll('.progress-circle');
        let correctAnswers = 0;
        progressCircles.forEach(circle => {
            if (circle.classList.contains('correct')) {
                correctAnswers++;
            }
        });
        
        const totalQuestions = 10;
        const wrongAnswers = totalQuestions - correctAnswers;
        
        // Count unique maps played
        const uniqueMaps = new Set(this.quizHistory.map(item => item.map));
        const mapsPlayed = uniqueMaps.size;
        
        // Separate correct and wrong answers
        const correctItems = this.quizHistory.filter(item => item.correct);
        const wrongItems = this.quizHistory.filter(item => !item.correct);
        
        // Create backdrop overlay first
        const backdrop = document.createElement('div');
        backdrop.className = 'completion-backdrop';
        
        // Show completion screen in the map area
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            // Remove any existing completion screen and backdrop
            const existingCompletion = document.querySelector('.completion-screen');
            const existingBackdrop = document.querySelector('.completion-backdrop');
            if (existingCompletion) existingCompletion.remove();
            if (existingBackdrop) existingBackdrop.remove();
            
            // Add backdrop
            mapContainer.appendChild(backdrop);
            
            // Create completion screen with enhanced info
            const completionScreen = document.createElement('div');
            completionScreen.className = 'completion-screen';
            completionScreen.innerHTML = `
                <div class="completion-header">
                    <h2>${correctAnswers}/10</h2>
                </div>
                <div class="answers-grid">
                    ${correctItems.length > 0 ? `
                    <div class="answers-section correct-section">
                        <div class="section-header">
                            <span class="section-label">Correct (${correctItems.length})</span>
                        </div>
                        <div class="answers-list">
                            ${correctItems.map(item => `
                                <div class="answer-item correct-item">
                                    <span class="answer-text">${item.correctAnswer}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    ${wrongItems.length > 0 ? `
                    <div class="answers-section wrong-section">
                        <div class="section-header">
                            <span class="section-label">Wrong (${wrongItems.length})</span>
                        </div>
                        <div class="answers-list">
                            ${wrongItems.map(item => `
                                <div class="answer-item wrong-item">
                                    <span class="answer-guess">${item.guess}</span>
                                    <span class="answer-separator">→</span>
                                    <span class="answer-correct">${item.correctAnswer}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="completion-actions">
                    <button class="play-again-btn" id="restartGameBtn">
                        Play Again
                    </button>
                </div>
            `;
            
            // Add to map container
            mapContainer.appendChild(completionScreen);
            
            // Add event listeners for restart
            const restartBtn = document.getElementById('restartGameBtn');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => this.restartGame());
            }
            
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
        console.log('Restarting game with hard refresh...');
        
        // Store current game mode in localStorage to preserve it after refresh
        localStorage.setItem('geoquest-game-mode', this.gameMode);
        
        // Hard refresh the page
        location.reload();
    }

    skipQuiz() {
        console.log('Skipping quiz...');
        this.startNewQuiz();
    }

    removeCompletionScreen() {
        const existingCompletion = document.querySelector('.completion-screen');
        const existingBackdrop = document.querySelector('.completion-backdrop');
        if (existingCompletion) existingCompletion.remove();
        if (existingBackdrop) existingBackdrop.remove();
    }

    openDatasetBrowser() {
        this.populateDatasetList();
        const browser = document.getElementById('datasetBrowser');
        if (browser) {
            browser.style.display = 'flex';
        }
    }
    
    closeDatasetBrowser() {
        const browser = document.getElementById('datasetBrowser');
        if (browser) {
            browser.style.display = 'none';
        }
    }
    
    populateDatasetList() {
        const listContainer = document.getElementById('datasetBrowserList');
        if (!listContainer || !this.datasetList || this.datasetList.length === 0) return;
        
        // Sort datasets alphabetically
        const sortedDatasets = [...this.datasetList].sort((a, b) => a.title.localeCompare(b.title));
        
        listContainer.innerHTML = '';
        
        sortedDatasets.forEach((dataset, index) => {
            const datasetItem = document.createElement('div');
            datasetItem.className = 'dataset-item';
            datasetItem.innerHTML = `
                <h3>${dataset.title}</h3>
                <p>${dataset.description || ''}</p>
            `;
            
            // Highlight current dataset
            if (this.currentQuiz && this.currentQuiz.id === dataset.id) {
                datasetItem.classList.add('active');
            }
            
            datasetItem.addEventListener('click', () => {
                this.loadSpecificDataset(dataset);
                this.closeDatasetBrowser();
            });
            
            listContainer.appendChild(datasetItem);
        });
    }
    
    loadSpecificDataset(dataset) {
        if (!dataset) return;
        
        console.log('📚 Loading specific dataset:', dataset.title);
        
        this.currentQuiz = dataset;
        
        // If in learn mode, update the sequence index to match this dataset
        if (this.isLearnMode && this.learnModeSequence.length > 0) {
            const datasetIndex = this.learnModeSequence.findIndex(d => d.id === dataset.id);
            if (datasetIndex !== -1) {
                this.learnModeCurrentIndex = datasetIndex;
                console.log('📚 Updated learn mode index to:', datasetIndex);
            }
        }
        
        // Apply quiz to map
        if (window.mapInstance && this.currentQuiz) {
            console.log('🗺️ Applying quiz configuration to map');
            window.mapInstance.applyQuizConfiguration(this.currentQuiz, this.gameMode);
        }
        
        // Update color bar
        this.updateColorBar();
        
        // Update title in footer for learn mode
        if (this.isLearnMode) {
            this.updateLearnModeTitle();
            console.log('📚 Updated learn mode title');
        }
        
        // Force a small delay to ensure map updates are complete
        setTimeout(() => {
            if (window.mapInstance && window.mapInstance.map) {
                window.mapInstance.map.invalidateSize();
                console.log('🗺️ Map refreshed after dataset load');
            }
        }, 100);
    }

    updateDatasetCounter() {
        const datasetCountElement = document.getElementById('datasetCount');
        if (datasetCountElement && this.datasetList) {
            const totalQuizzes = this.datasetList.length;
            datasetCountElement.textContent = totalQuizzes;
            console.log('📊 Updated dataset counter to:', totalQuizzes, 'datasets');
        }
    }
}

// Initialize quiz game
const quizGame = new QuizGame();
window.quizGame = quizGame;
