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
        this.currentProgress = 0; // Track current progress (0-9)
        this.isReady = false; // Flag to indicate quiz is ready
        this.isLearnMode = false; // Start in play mode
        this.currentDatasetIndex = 0;
        this.datasetList = [];
        this.skipDirection = 'forward'; // Track skip direction
        this.learnModeSequence = []; // Store the predetermined order for learn mode
        this.learnModeCurrentIndex = 0; // Current position in the sequence
        this.isQuizCompleted = false; // Track if quiz is completed
        this.lastAnswerWasCorrect = undefined; // Track the result of the last answer for progress bar
        this.gameMode = 'learn'; // Current game mode
        
        this.init();
    }
    
    // Color randomization methods to prevent memorization
    getRandomColorScheme(type) {
        const gradientSchemes = [
            ['#f0f8ff', '#87ceeb', '#4682b4', '#1e3a8a'], // Blue gradient
            ['#fff5f5', '#fed7d7', '#f56565', '#c53030'], // Red gradient
            ['#f0fff4', '#9ae6b4', '#48bb78', '#22543d'], // Green gradient
            ['#faf5ff', '#d6bcfa', '#9f7aea', '#553c9a'], // Purple gradient
            ['#fffaf0', '#fbd38d', '#ed8936', '#c05621'], // Orange gradient
            ['#f0f9ff', '#7dd3fc', '#0ea5e9', '#1e40af'], // Sky blue gradient
            ['#fdf2f8', '#f9a8d4', '#ec4899', '#be185d'], // Pink gradient
            ['#fefce8', '#fde047', '#eab308', '#a16207'], // Yellow gradient
            ['#f0fdf4', '#86efac', '#22c55e', '#15803d'], // Emerald gradient
            ['#fef7ff', '#d8b4fe', '#a855f7', '#7c3aed']  // Violet gradient
        ];
        
        const categoricalSchemes = [
            ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
            ['#dc2626', '#059669', '#7c3aed', '#ea580c', '#0891b2', '#be185d', '#65a30d', '#9333ea'],
            ['#16a34a', '#dc2626', '#7c3aed', '#ea580c', '#0891b2', '#be185d', '#65a30d', '#9333ea'],
            ['#7c3aed', '#16a34a', '#dc2626', '#ea580c', '#0891b2', '#be185d', '#65a30d', '#9333ea'],
            ['#ea580c', '#7c3aed', '#16a34a', '#dc2626', '#0891b2', '#be185d', '#65a30d', '#9333ea']
        ];
        
        if (type === 'gradient') {
            return gradientSchemes[Math.floor(Math.random() * gradientSchemes.length)];
        } else {
            return categoricalSchemes[Math.floor(Math.random() * categoricalSchemes.length)];
        }
    }
    
    async init() {
        this.setupEventListeners();
        
        // Load quiz data first
        await this.loadAllQuizData();
        this.updateModeToggle(); // Initialize mode toggle
        
        // Wait for map to be ready before starting quiz
        const mapReady = await this.waitForMap();
        if (mapReady) {
            console.log('🗺️ Map ready, starting quiz');
            this.startNewQuiz();
        } else {
            console.error('❌ Failed to initialize map, retrying in 2 seconds...');
            setTimeout(() => this.init(), 2000);
        }
    }
    
    async waitForMap() {
        // Wait for map instance to be available
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max wait
        
        while (!window.mapInstance && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.mapInstance) {
            console.error('❌ Map instance not available after waiting');
            return false;
        }
        
        // Wait for countries layer to be ready
        attempts = 0;
        while (!window.mapInstance.countriesLayer && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.mapInstance.countriesLayer) {
            console.error('❌ Countries layer not available after waiting');
            return false;
        }
        
        console.log('✅ Map instance and countries layer ready, starting quiz');
        return true;
    }
    
    async loadAllQuizData() {
        try {
            // First load the existing quiz data
            const response = await fetch('data/quiz_data.json');
            this.quizData = await response.json();
            console.log('🎮 Base quiz data loaded:', Object.keys(this.quizData.quizzes).length, 'quizzes');
            
            // Quiz will be started when map is ready
            
            // Now convert and add all the new data files (in background)
            this.loadConvertedData().then(() => {
                console.log('🎮 Total quizzes available:', Object.keys(this.quizData.quizzes).length, 'quizzes');
                this.updateDatasetCounter();
            }).catch(error => {
                console.log('⚠️ Some datasets failed to load, but continuing with base data');
                this.updateDatasetCounter();
            });
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
            
            // Convert fertility rate data
            const fertilityRateQuiz = await this.convertFertilityRateData();
            if (fertilityRateQuiz) {
                this.quizData.quizzes[fertilityRateQuiz.id] = fertilityRateQuiz;
                console.log('👶 Added Fertility Rate quiz');
            }
            
            // Convert GNI per capita data
            const gniPerCapitaQuiz = await this.convertGNIPerCapitaData();
            if (gniPerCapitaQuiz) {
                this.quizData.quizzes[gniPerCapitaQuiz.id] = gniPerCapitaQuiz;
                console.log('💰 Added GNI Per Capita quiz');
            }
            
            // Convert HDI data
            const hdiQuiz = await this.convertHDIData();
            if (hdiQuiz) {
                this.quizData.quizzes[hdiQuiz.id] = hdiQuiz;
                console.log('📊 Added Human Development Index quiz');
            }
            
            // Convert GDP by country data
            const gdpByCountryQuiz = await this.convertGDPByCountryData();
            if (gdpByCountryQuiz) {
                this.quizData.quizzes[gdpByCountryQuiz.id] = gdpByCountryQuiz;
                console.log('🏭 Added GDP by Country quiz');
            }
            
            // Convert new data files
            const landNeighboursQuiz = await this.convertLandNeighboursData();
            if (landNeighboursQuiz) {
                this.quizData.quizzes[landNeighboursQuiz.id] = landNeighboursQuiz;
                console.log('🌍 Added Land Neighbours quiz');
            }
            
            const averageHeightQuiz = await this.convertAverageHeightData();
            if (averageHeightQuiz) {
                this.quizData.quizzes[averageHeightQuiz.id] = averageHeightQuiz;
                console.log('📏 Added Average Height quiz');
            }
            
            const literacyRateQuiz = await this.convertLiteracyRateData();
            if (literacyRateQuiz) {
                this.quizData.quizzes[literacyRateQuiz.id] = literacyRateQuiz;
                console.log('📚 Added Literacy Rate quiz');
            }
            
            const maleMedianAgeQuiz = await this.convertMaleMedianAgeData();
            if (maleMedianAgeQuiz) {
                this.quizData.quizzes[maleMedianAgeQuiz.id] = maleMedianAgeQuiz;
                console.log('👨 Added Male Median Age quiz');
            }
            
            const lowestTempQuiz = await this.convertLowestTemperatureData();
            if (lowestTempQuiz) {
                this.quizData.quizzes[lowestTempQuiz.id] = lowestTempQuiz;
                console.log('❄️ Added Lowest Temperature quiz');
            }
            
            const highestTempQuiz = await this.convertHighestTemperatureData();
            if (highestTempQuiz) {
                this.quizData.quizzes[highestTempQuiz.id] = highestTempQuiz;
                console.log('🔥 Added Highest Temperature quiz');
            }
            
            const flagAdoptionQuiz = await this.convertFlagAdoptionData();
            if (flagAdoptionQuiz) {
                this.quizData.quizzes[flagAdoptionQuiz.id] = flagAdoptionQuiz;
                console.log('🏁 Added Flag Adoption quiz');
            }
            
            const islandsQuiz = await this.convertIslandsData();
            if (islandsQuiz) {
                this.quizData.quizzes[islandsQuiz.id] = islandsQuiz;
                console.log('🏝️ Added Number of Islands quiz');
            }
            
            const mobilePhonesQuiz = await this.convertMobilePhonesData();
            if (mobilePhonesQuiz) {
                this.quizData.quizzes[mobilePhonesQuiz.id] = mobilePhonesQuiz;
                console.log('📱 Added Mobile Phone Numbers quiz');
            }
            
            // Convert new data files
            const monarchiesQuiz = await this.convertMonarchiesData();
            if (monarchiesQuiz) {
                this.quizData.quizzes[monarchiesQuiz.id] = monarchiesQuiz;
                console.log('👑 Added Monarchies quiz');
            }
            
            const partySystemQuiz = await this.convertPartySystemData();
            if (partySystemQuiz) {
                this.quizData.quizzes[partySystemQuiz.id] = partySystemQuiz;
                console.log('🗳️ Added Party System quiz');
            }
            
            const exportsQuiz = await this.convertExportsData();
            if (exportsQuiz) {
                this.quizData.quizzes[exportsQuiz.id] = exportsQuiz;
                console.log('📦 Added Exports quiz');
            }
            
            const importsQuiz = await this.convertImportsData();
            if (importsQuiz) {
                this.quizData.quizzes[importsQuiz.id] = importsQuiz;
                console.log('📥 Added Imports quiz');
            }
            
            // New datasets
            const christianPopulationQuiz = await this.convertChristianPopulationData();
            if (christianPopulationQuiz) {
                this.quizData.quizzes[christianPopulationQuiz.id] = christianPopulationQuiz;
                console.log('⛪ Added Christian Population quiz');
            }
            
            const nobelLaureatesQuiz = await this.convertNobelLaureatesData();
            if (nobelLaureatesQuiz) {
                this.quizData.quizzes[nobelLaureatesQuiz.id] = nobelLaureatesQuiz;
                console.log('🏆 Added Nobel Laureates quiz');
            }
            
            const activeMilitaryQuiz = await this.convertActiveMilitaryData();
            if (activeMilitaryQuiz) {
                this.quizData.quizzes[activeMilitaryQuiz.id] = activeMilitaryQuiz;
                console.log('🎖️ Added Active Military quiz');
            }
            
            const billionairesQuiz = await this.convertBillionairesData();
            if (billionairesQuiz) {
                this.quizData.quizzes[billionairesQuiz.id] = billionairesQuiz;
                console.log('💰 Added Billionaires quiz');
            }
            
            const bloodTypesQuiz = await this.convertBloodTypesData();
            if (bloodTypesQuiz) {
                this.quizData.quizzes[bloodTypesQuiz.id] = bloodTypesQuiz;
                console.log('🩸 Added Blood Types quiz');
            }
            
            // Road side data temporarily disabled due to JSON corruption
            // const roadSideQuiz = await this.convertRoadSideData();
            // if (roadSideQuiz) {
            //     this.quizData.quizzes[roadSideQuiz.id] = roadSideQuiz;
            //     console.log('🚗 Added Road Side quiz');
            // }
            
            const currencyQuiz = await this.convertCurrencyData();
            if (currencyQuiz) {
                this.quizData.quizzes[currencyQuiz.id] = currencyQuiz;
                console.log('💱 Added Currency quiz');
            }
            
            // Convert world population data
            const worldPopulationQuiz = await this.convertWorldPopulationData();
            if (worldPopulationQuiz) {
                this.quizData.quizzes[worldPopulationQuiz.id] = worldPopulationQuiz;
                console.log('🌍 Added World Population quiz');
            }
            
            // Convert internet usage data
            const internetUsageQuiz = await this.convertInternetUsageData();
            if (internetUsageQuiz) {
                this.quizData.quizzes[internetUsageQuiz.id] = internetUsageQuiz;
                console.log('🌐 Added Internet Usage quiz');
            }
            
            // Convert carbon emissions data
            const carbonEmissionsQuiz = await this.convertCarbonEmissionsData();
            if (carbonEmissionsQuiz) {
                this.quizData.quizzes[carbonEmissionsQuiz.id] = carbonEmissionsQuiz;
                console.log('🌱 Added Carbon Emissions quiz');
            }
            
            // Convert currencies data
            const currenciesQuiz = await this.convertCurrenciesData();
            if (currenciesQuiz) {
                this.quizData.quizzes[currenciesQuiz.id] = currenciesQuiz;
                console.log('💱 Added Currencies quiz');
            }
            
            // Convert firearms data
            const firearmsQuiz = await this.convertFirearmsData();
            if (firearmsQuiz) {
                this.quizData.quizzes[firearmsQuiz.id] = firearmsQuiz;
                console.log('🔫 Added Firearms quiz');
            }
            
            // Convert traffic deaths data
            const trafficDeathsQuiz = await this.convertTrafficDeathsData();
            if (trafficDeathsQuiz) {
                this.quizData.quizzes[trafficDeathsQuiz.id] = trafficDeathsQuiz;
                console.log('🚗 Added Traffic Deaths quiz');
            }
            
            // Convert broadband subscriptions data
            const broadbandQuiz = await this.convertBroadbandData();
            if (broadbandQuiz) {
                this.quizData.quizzes[broadbandQuiz.id] = broadbandQuiz;
                console.log('📡 Added Broadband Subscriptions quiz');
            }
            
            // Convert mobile connection speed data
            const mobileSpeedQuiz = await this.convertMobileSpeedData();
            if (mobileSpeedQuiz) {
                this.quizData.quizzes[mobileSpeedQuiz.id] = mobileSpeedQuiz;
                console.log('📱 Added Mobile Connection Speed quiz');
            }
            
            // Convert internet speed data
            const internetSpeedQuiz = await this.convertInternetSpeedData();
            if (internetSpeedQuiz) {
                this.quizData.quizzes[internetSpeedQuiz.id] = internetSpeedQuiz;
                console.log('🌐 Added Internet Speed quiz');
            }
            
            // Convert leading export market data
            const leadingExportMarketQuiz = await this.convertLeadingExportMarketData();
            if (leadingExportMarketQuiz) {
                this.quizData.quizzes[leadingExportMarketQuiz.id] = leadingExportMarketQuiz;
                console.log('🌍 Added Leading Export Market quiz');
            }
            
            // Convert top goods export data
            const topGoodsExportQuiz = await this.convertTopGoodsExportData();
            if (topGoodsExportQuiz) {
                this.quizData.quizzes[topGoodsExportQuiz.id] = topGoodsExportQuiz;
                console.log('📦 Added Top Goods Export quiz');
            }
            
            // Convert world bank income group data
            const worldBankIncomeGroupQuiz = await this.convertWorldBankIncomeGroupData();
            if (worldBankIncomeGroupQuiz) {
                this.quizData.quizzes[worldBankIncomeGroupQuiz.id] = worldBankIncomeGroupQuiz;
                console.log('💰 Added World Bank Income Group quiz');
            }
            
            // Convert leading import source data
            const leadingImportSourceQuiz = await this.convertLeadingImportSourceData();
            if (leadingImportSourceQuiz) {
                this.quizData.quizzes[leadingImportSourceQuiz.id] = leadingImportSourceQuiz;
                console.log('📥 Added Leading Import Source quiz');
            }
            
            // Convert female average height data
            const femaleHeightQuiz = await this.convertFemaleHeightData();
            if (femaleHeightQuiz) {
                this.quizData.quizzes[femaleHeightQuiz.id] = femaleHeightQuiz;
                console.log('👩 Added Female Average Height quiz');
            }
            
            // Convert Academy Awards data
            const academyAwardsQuiz = await this.convertAcademyAwardsData();
            if (academyAwardsQuiz) {
                this.quizData.quizzes[academyAwardsQuiz.id] = academyAwardsQuiz;
                console.log('🏆 Added Academy Awards quiz');
            }
            
            // Convert Winter Olympic Gold Medals data
            const winterOlympicGoldQuiz = await this.convertWinterOlympicGoldData();
            if (winterOlympicGoldQuiz) {
                this.quizData.quizzes[winterOlympicGoldQuiz.id] = winterOlympicGoldQuiz;
                console.log('⛷️ Added Winter Olympic Gold Medals quiz');
            }
            
            // Convert Summer Olympic Bronze Medals data
            const summerOlympicBronzeQuiz = await this.convertSummerOlympicBronzeData();
            if (summerOlympicBronzeQuiz) {
                this.quizData.quizzes[summerOlympicBronzeQuiz.id] = summerOlympicBronzeQuiz;
                console.log('🥉 Added Summer Olympic Bronze Medals quiz');
            }
            
            // Convert Summer Olympic Silver Medals data
            const summerOlympicSilverQuiz = await this.convertSummerOlympicSilverData();
            if (summerOlympicSilverQuiz) {
                this.quizData.quizzes[summerOlympicSilverQuiz.id] = summerOlympicSilverQuiz;
                console.log('🥈 Added Summer Olympic Silver Medals quiz');
            }
            
            // Convert Summer Olympic Gold Medals data
            const summerOlympicGoldQuiz = await this.convertSummerOlympicGoldData();
            if (summerOlympicGoldQuiz) {
                this.quizData.quizzes[summerOlympicGoldQuiz.id] = summerOlympicGoldQuiz;
                console.log('🥇 Added Summer Olympic Gold Medals quiz');
            }
            
            // Convert Nobel Literature Laureates data
            const nobelLiteratureQuiz = await this.convertNobelLiteratureData();
            if (nobelLiteratureQuiz) {
                this.quizData.quizzes[nobelLiteratureQuiz.id] = nobelLiteratureQuiz;
                console.log('📚 Added Nobel Literature Laureates quiz');
            }
            
            // Convert World Cup Wins data
            const worldCupWinsQuiz = await this.convertWorldCupWinsData();
            if (worldCupWinsQuiz) {
                this.quizData.quizzes[worldCupWinsQuiz.id] = worldCupWinsQuiz;
                console.log('⚽ Added World Cup Wins quiz');
            }
            
            // Convert Age of Consent data
            const ageOfConsentQuiz = await this.convertAgeOfConsentData();
            if (ageOfConsentQuiz) {
                this.quizData.quizzes[ageOfConsentQuiz.id] = ageOfConsentQuiz;
                console.log('📋 Added Age of Consent quiz');
            }
            
            // Convert Population per Lower House Seat data
            const populationPerSeatQuiz = await this.convertPopulationPerSeatData();
            if (populationPerSeatQuiz) {
                this.quizData.quizzes[populationPerSeatQuiz.id] = populationPerSeatQuiz;
                console.log('🏛️ Added Population per Lower House Seat quiz');
            }
            
            // Convert Lower House Seats data
            const lowerHouseSeatsQuiz = await this.convertLowerHouseSeatsData();
            if (lowerHouseSeatsQuiz) {
                this.quizData.quizzes[lowerHouseSeatsQuiz.id] = lowerHouseSeatsQuiz;
                console.log('🏛️ Added Lower House Seats quiz');
            }
            
            // Convert Total Naval Assets data
            const navalAssetsQuiz = await this.convertNavalAssetsData();
            if (navalAssetsQuiz) {
                this.quizData.quizzes[navalAssetsQuiz.id] = navalAssetsQuiz;
                console.log('🚢 Added Total Naval Assets quiz');
            }
            
            // Convert new datasets - Food & Beverages
            const alcoholConsumptionQuiz = await this.convertAlcoholConsumptionData();
            if (alcoholConsumptionQuiz) {
                this.quizData.quizzes[alcoholConsumptionQuiz.id] = alcoholConsumptionQuiz;
                console.log('🍺 Added Alcohol Consumption quiz');
            }
            
            const coffeeConsumptionQuiz = await this.convertCoffeeConsumptionData();
            if (coffeeConsumptionQuiz) {
                this.quizData.quizzes[coffeeConsumptionQuiz.id] = coffeeConsumptionQuiz;
                console.log('☕ Added Coffee Consumption quiz');
            }
            
            // Convert new datasets - Sports
            const uefaChampionsWinnersQuiz = await this.convertUEFAChampionsWinnersData();
            if (uefaChampionsWinnersQuiz) {
                this.quizData.quizzes[uefaChampionsWinnersQuiz.id] = uefaChampionsWinnersQuiz;
                console.log('⚽ Added UEFA Champions League Winners quiz');
            }
            
            const uefaChampionsRunnersUpQuiz = await this.convertUEFAChampionsRunnersUpData();
            if (uefaChampionsRunnersUpQuiz) {
                this.quizData.quizzes[uefaChampionsRunnersUpQuiz.id] = uefaChampionsRunnersUpQuiz;
                console.log('🥈 Added UEFA Champions League Runners Up quiz');
            }
            
            const soccerPlayersQuiz = await this.convertSoccerPlayersData();
            if (soccerPlayersQuiz) {
                this.quizData.quizzes[soccerPlayersQuiz.id] = soccerPlayersQuiz;
                console.log('⚽ Added Soccer Players quiz');
            }
            
            const fifaRankingQuiz = await this.convertFIFARankingData();
            if (fifaRankingQuiz) {
                this.quizData.quizzes[fifaRankingQuiz.id] = fifaRankingQuiz;
                console.log('🏆 Added FIFA World Ranking quiz');
            }
            
            // Convert new datasets - Demographics & Geography
            const sexRatioQuiz = await this.convertSexRatioData();
            if (sexRatioQuiz) {
                this.quizData.quizzes[sexRatioQuiz.id] = sexRatioQuiz;
                console.log('👥 Added Sex Ratio quiz');
            }
            
            const maximumElevationQuiz = await this.convertMaximumElevationData();
            if (maximumElevationQuiz) {
                this.quizData.quizzes[maximumElevationQuiz.id] = maximumElevationQuiz;
                console.log('🏔️ Added Maximum Elevation quiz');
            }
            
            const nationalCapitalsQuiz = await this.convertNationalCapitalsData();
            if (nationalCapitalsQuiz) {
                this.quizData.quizzes[nationalCapitalsQuiz.id] = nationalCapitalsQuiz;
                console.log('🏛️ Added National Capitals quiz');
            }
            
            const nationalCapitalsPopulationQuiz = await this.convertNationalCapitalsPopulationData();
            if (nationalCapitalsPopulationQuiz) {
                this.quizData.quizzes[nationalCapitalsPopulationQuiz.id] = nationalCapitalsPopulationQuiz;
                console.log('🏛️ Added National Capitals Population quiz');
            }
            
            const nationalCapitalsPopulationPercentageQuiz = await this.convertNationalCapitalsPopulationPercentageData();
            if (nationalCapitalsPopulationPercentageQuiz) {
                this.quizData.quizzes[nationalCapitalsPopulationPercentageQuiz.id] = nationalCapitalsPopulationPercentageQuiz;
                console.log('🏛️ Added National Capitals Population Percentage quiz');
            }
            
            // Convert new datasets - Language & Culture
            const englishPrimaryLanguageQuiz = await this.convertEnglishPrimaryLanguageData();
            if (englishPrimaryLanguageQuiz) {
                this.quizData.quizzes[englishPrimaryLanguageQuiz.id] = englishPrimaryLanguageQuiz;
                console.log('🇬🇧 Added English Primary Language quiz');
            }
            
            const englishSpeakersTotalQuiz = await this.convertEnglishSpeakersTotalData();
            if (englishSpeakersTotalQuiz) {
                this.quizData.quizzes[englishSpeakersTotalQuiz.id] = englishSpeakersTotalQuiz;
                console.log('🇬🇧 Added English Speakers Total quiz');
            }
            
            const englishSpeakingPopulationQuiz = await this.convertEnglishSpeakingPopulationData();
            if (englishSpeakingPopulationQuiz) {
                this.quizData.quizzes[englishSpeakingPopulationQuiz.id] = englishSpeakingPopulationQuiz;
                console.log('🇬🇧 Added English Speaking Population quiz');
            }
            
            const officialLanguagesQuiz = await this.convertOfficialLanguagesData();
            if (officialLanguagesQuiz) {
                this.quizData.quizzes[officialLanguagesQuiz.id] = officialLanguagesQuiz;
                console.log('🗣️ Added Official Languages quiz');
            }
            
            const livingLanguagesQuiz = await this.convertLivingLanguagesData();
            if (livingLanguagesQuiz) {
                this.quizData.quizzes[livingLanguagesQuiz.id] = livingLanguagesQuiz;
                console.log('🗣️ Added Living Languages quiz');
            }
            
            const spanishNativeSpeakersQuiz = await this.convertSpanishNativeSpeakersData();
            if (spanishNativeSpeakersQuiz) {
                this.quizData.quizzes[spanishNativeSpeakersQuiz.id] = spanishNativeSpeakersQuiz;
                console.log('🇪🇸 Added Spanish Native Speakers quiz');
            }
            
            const germanNativeSpeakersQuiz = await this.convertGermanNativeSpeakersData();
            if (germanNativeSpeakersQuiz) {
                this.quizData.quizzes[germanNativeSpeakersQuiz.id] = germanNativeSpeakersQuiz;
                console.log('🇩🇪 Added German Native Speakers quiz');
            }
            
            const chineseNativeSpeakersQuiz = await this.convertChineseNativeSpeakersData();
            if (chineseNativeSpeakersQuiz) {
                this.quizData.quizzes[chineseNativeSpeakersQuiz.id] = chineseNativeSpeakersQuiz;
                console.log('🇨🇳 Added Chinese Native Speakers quiz');
            }
            
            const afrikaansDutchNativeSpeakersQuiz = await this.convertAfrikaansDutchNativeSpeakersData();
            if (afrikaansDutchNativeSpeakersQuiz) {
                this.quizData.quizzes[afrikaansDutchNativeSpeakersQuiz.id] = afrikaansDutchNativeSpeakersQuiz;
                console.log('🇳🇱 Added Afrikaans/Dutch Native Speakers quiz');
            }
            
            const frenchOfficialLanguageQuiz = await this.convertFrenchOfficialLanguageData();
            if (frenchOfficialLanguageQuiz) {
                this.quizData.quizzes[frenchOfficialLanguageQuiz.id] = frenchOfficialLanguageQuiz;
                console.log('🇫🇷 Added French Official Language quiz');
            }
            
            // Convert new datasets - Infrastructure & Transport
            const containerPortTrafficQuiz = await this.convertContainerPortTrafficData();
            if (containerPortTrafficQuiz) {
                this.quizData.quizzes[containerPortTrafficQuiz.id] = containerPortTrafficQuiz;
                console.log('🚢 Added Container Port Traffic quiz');
            }
            
            const roadNetworkSizeQuiz = await this.convertRoadNetworkSizeData();
            if (roadNetworkSizeQuiz) {
                this.quizData.quizzes[roadNetworkSizeQuiz.id] = roadNetworkSizeQuiz;
                console.log('🛣️ Added Road Network Size quiz');
            }
            
            const highSpeedRailQuiz = await this.convertHighSpeedRailData();
            if (highSpeedRailQuiz) {
                this.quizData.quizzes[highSpeedRailQuiz.id] = highSpeedRailQuiz;
                console.log('🚄 Added High Speed Rail quiz');
            }
            
            // Convert new datasets - Economics & Industry
            const stockMarketCapitalizationQuiz = await this.convertStockMarketCapitalizationData();
            if (stockMarketCapitalizationQuiz) {
                this.quizData.quizzes[stockMarketCapitalizationQuiz.id] = stockMarketCapitalizationQuiz;
                console.log('📈 Added Stock Market Capitalization quiz');
            }
            
            const cocoaProductionQuiz = await this.convertCocoaProductionData();
            if (cocoaProductionQuiz) {
                this.quizData.quizzes[cocoaProductionQuiz.id] = cocoaProductionQuiz;
                console.log('🍫 Added Cocoa Production quiz');
            }
            
            const wheatProductionQuiz = await this.convertWheatProductionData();
            if (wheatProductionQuiz) {
                this.quizData.quizzes[wheatProductionQuiz.id] = wheatProductionQuiz;
                console.log('🌾 Added Wheat Production quiz');
            }
            
            const steelProductionQuiz = await this.convertSteelProductionData();
            if (steelProductionQuiz) {
                this.quizData.quizzes[steelProductionQuiz.id] = steelProductionQuiz;
                console.log('🏭 Added Steel Production quiz');
            }
            
            const oilProductionQuiz = await this.convertOilProductionData();
            if (oilProductionQuiz) {
                this.quizData.quizzes[oilProductionQuiz.id] = oilProductionQuiz;
                console.log('🛢️ Added Oil Production quiz');
            }
            
            // Convert new datasets - Politics & History
            const popesQuiz = await this.convertPopesData();
            if (popesQuiz) {
                this.quizData.quizzes[popesQuiz.id] = popesQuiz;
                console.log('⛪ Added Popes quiz');
            }
            
            const yearsColonizedQuiz = await this.convertYearsColonizedData();
            if (yearsColonizedQuiz) {
                this.quizData.quizzes[yearsColonizedQuiz.id] = yearsColonizedQuiz;
                console.log('🏛️ Added Years Colonized quiz');
            }
            
            const commonwealthMembershipQuiz = await this.convertCommonwealthMembershipData();
            if (commonwealthMembershipQuiz) {
                this.quizData.quizzes[commonwealthMembershipQuiz.id] = commonwealthMembershipQuiz;
                console.log('🇬🇧 Added Commonwealth Membership quiz');
            }
            
            // Convert new datasets - Culture & Heritage
            const unescoSitesQuiz = await this.convertUNESCOSitesData();
            if (unescoSitesQuiz) {
                this.quizData.quizzes[unescoSitesQuiz.id] = unescoSitesQuiz;
                console.log('🏛️ Added UNESCO Sites quiz');
            }
            
            // Convert new datasets - Geography & Time
            const timeZonesQuiz = await this.convertTimeZonesData();
            if (timeZonesQuiz) {
                this.quizData.quizzes[timeZonesQuiz.id] = timeZonesQuiz;
                console.log('🕐 Added Time Zones quiz');
            }
            
            const countryByFirstLetterQuiz = await this.convertCountryByFirstLetterData();
            if (countryByFirstLetterQuiz) {
                this.quizData.quizzes[countryByFirstLetterQuiz.id] = countryByFirstLetterQuiz;
                console.log('🔤 Added Country by First Letter quiz');
            }
            
            // Convert newest datasets
            const landlockedCountriesQuiz = await this.convertLandlockedCountriesData();
            if (landlockedCountriesQuiz) {
                this.quizData.quizzes[landlockedCountriesQuiz.id] = landlockedCountriesQuiz;
                console.log('🏔️ Added Landlocked Countries quiz');
            }
            
            const foodEnergyIntakeQuiz = await this.convertFoodEnergyIntakeData();
            if (foodEnergyIntakeQuiz) {
                this.quizData.quizzes[foodEnergyIntakeQuiz.id] = foodEnergyIntakeQuiz;
                console.log('🍽️ Added Food Energy Intake quiz');
            }
            
            const wineProductionQuiz = await this.convertWineProductionData();
            if (wineProductionQuiz) {
                this.quizData.quizzes[wineProductionQuiz.id] = wineProductionQuiz;
                console.log('🍷 Added Wine Production quiz');
            }
            
            const wineConsumptionQuiz = await this.convertWineConsumptionData();
            if (wineConsumptionQuiz) {
                this.quizData.quizzes[wineConsumptionQuiz.id] = wineConsumptionQuiz;
                console.log('🍷 Added Wine Consumption quiz');
            }
            
            const teaConsumptionQuiz = await this.convertTeaConsumptionData();
            if (teaConsumptionQuiz) {
                this.quizData.quizzes[teaConsumptionQuiz.id] = teaConsumptionQuiz;
                console.log('🫖 Added Tea Consumption quiz');
            }
            
            const currencyExchangeRateQuiz = await this.convertCurrencyExchangeRateData();
            if (currencyExchangeRateQuiz) {
                this.quizData.quizzes[currencyExchangeRateQuiz.id] = currencyExchangeRateQuiz;
                console.log('💱 Added Currency Exchange Rate quiz');
            }
            
            // New datasets - Economics & Wealth
            const gdpPerWorkingHourQuiz = await this.convertGDPPerWorkingHourData();
            if (gdpPerWorkingHourQuiz) {
                this.quizData.quizzes[gdpPerWorkingHourQuiz.id] = gdpPerWorkingHourQuiz;
                console.log('💰 Added GDP Per Working Hour quiz');
            } else {
                console.log('❌ Failed to load GDP Per Working Hour quiz');
            }
            
            const wealthGiniQuiz = await this.convertWealthGiniData();
            if (wealthGiniQuiz) {
                this.quizData.quizzes[wealthGiniQuiz.id] = wealthGiniQuiz;
                console.log('📊 Added Wealth Gini Coefficient quiz');
            } else {
                console.log('❌ Failed to load Wealth Gini Coefficient quiz');
            }
            
            const medianWealthQuiz = await this.convertMedianWealthData();
            if (medianWealthQuiz) {
                this.quizData.quizzes[medianWealthQuiz.id] = medianWealthQuiz;
                console.log('💰 Added Median Wealth quiz');
            }
            
            const averageWagesQuiz = await this.convertAverageWagesData();
            if (averageWagesQuiz) {
                this.quizData.quizzes[averageWagesQuiz.id] = averageWagesQuiz;
                console.log('💵 Added Average Annual Wages quiz');
            }
            
            const corporateTaxQuiz = await this.convertCorporateTaxData();
            if (corporateTaxQuiz) {
                this.quizData.quizzes[corporateTaxQuiz.id] = corporateTaxQuiz;
                console.log('🏢 Added Corporate Tax Rate quiz');
            }
            
            // New datasets - Demographics & Social
            const marriageRateQuiz = await this.convertMarriageRateData();
            if (marriageRateQuiz) {
                this.quizData.quizzes[marriageRateQuiz.id] = marriageRateQuiz;
                console.log('💒 Added Marriage Rate quiz');
            }
            
            // New datasets - Industry & Production
            const motorVehicleProductionQuiz = await this.convertMotorVehicleProductionData();
            if (motorVehicleProductionQuiz) {
                this.quizData.quizzes[motorVehicleProductionQuiz.id] = motorVehicleProductionQuiz;
                console.log('🚗 Added Motor Vehicle Production quiz');
            }
            
            // New datasets - Environment
            const forestAreaQuiz = await this.convertForestAreaData();
            if (forestAreaQuiz) {
                this.quizData.quizzes[forestAreaQuiz.id] = forestAreaQuiz;
                console.log('🌲 Added Forest Area quiz');
            }
            
            const forestAreaPercentageQuiz = await this.convertForestAreaPercentageData();
            if (forestAreaPercentageQuiz) {
                this.quizData.quizzes[forestAreaPercentageQuiz.id] = forestAreaPercentageQuiz;
                console.log('🌲 Added Forest Area Percentage quiz');
            }
            
            // New datasets - Sports
            const olympicsHostedQuiz = await this.convertOlympicsHostedData();
            if (olympicsHostedQuiz) {
                this.quizData.quizzes[olympicsHostedQuiz.id] = olympicsHostedQuiz;
                console.log('🏟️ Added Olympics Hosted quiz');
            }
            
            const figureSkatingGoldQuiz = await this.convertFigureSkatingGoldData();
            if (figureSkatingGoldQuiz) {
                this.quizData.quizzes[figureSkatingGoldQuiz.id] = figureSkatingGoldQuiz;
                console.log('⛸️ Added Figure Skating Gold Medals quiz');
            }
            
            // New datasets - Flag Colors
            const blueFlagQuiz = await this.convertBlueFlagData();
            if (blueFlagQuiz) {
                this.quizData.quizzes[blueFlagQuiz.id] = blueFlagQuiz;
                console.log('🔵 Added Blue Flag Countries quiz');
            } else {
                console.log('❌ Failed to load Blue Flag Countries quiz');
            }
            
            const redFlagQuiz = await this.convertRedFlagData();
            if (redFlagQuiz) {
                this.quizData.quizzes[redFlagQuiz.id] = redFlagQuiz;
                console.log('🔴 Added Red Flag Countries quiz');
            } else {
                console.log('❌ Failed to load Red Flag Countries quiz');
            }
            
            const yellowFlagQuiz = await this.convertYellowFlagData();
            if (yellowFlagQuiz) {
                this.quizData.quizzes[yellowFlagQuiz.id] = yellowFlagQuiz;
                console.log('🟡 Added Yellow Flag Countries quiz');
            } else {
                console.log('❌ Failed to load Yellow Flag Countries quiz');
            }
            
            const whiteFlagQuiz = await this.convertWhiteFlagData();
            if (whiteFlagQuiz) {
                this.quizData.quizzes[whiteFlagQuiz.id] = whiteFlagQuiz;
                console.log('⚪ Added White Flag Countries quiz');
            } else {
                console.log('❌ Failed to load White Flag Countries quiz');
            }
            
            const purpleFlagQuiz = await this.convertPurpleFlagData();
            if (purpleFlagQuiz) {
                this.quizData.quizzes[purpleFlagQuiz.id] = purpleFlagQuiz;
                console.log('🟣 Added Purple Flag Countries quiz');
            } else {
                console.log('❌ Failed to load Purple Flag Countries quiz');
            }
            
            const greenFlagQuiz = await this.convertGreenFlagData();
            if (greenFlagQuiz) {
                this.quizData.quizzes[greenFlagQuiz.id] = greenFlagQuiz;
                console.log('🟢 Added Green Flag Countries quiz');
            } else {
                console.log('❌ Failed to load Green Flag Countries quiz');
            }
            
            const blueWhiteFlagQuiz = await this.convertBlueWhiteFlagData();
            if (blueWhiteFlagQuiz) {
                this.quizData.quizzes[blueWhiteFlagQuiz.id] = blueWhiteFlagQuiz;
                console.log('🔵⚪ Added Blue and White Flag Countries quiz');
            } else {
                console.log('❌ Failed to load Blue and White Flag Countries quiz');
            }
            
            const noRedFlagQuiz = await this.convertNoRedFlagData();
            if (noRedFlagQuiz) {
                this.quizData.quizzes[noRedFlagQuiz.id] = noRedFlagQuiz;
                console.log('🚫🔴 Added Flags Without Red quiz');
            } else {
                console.log('❌ Failed to load Flags Without Red quiz');
            }
            
            // New datasets - History
            const africanNeverColonizedQuiz = await this.convertAfricanNeverColonizedData();
            if (africanNeverColonizedQuiz) {
                this.quizData.quizzes[africanNeverColonizedQuiz.id] = africanNeverColonizedQuiz;
                console.log('🌍 Added African Countries Never Colonized quiz');
            } else {
                console.log('❌ Failed to load African Countries Never Colonized quiz');
            }
            
            // Convert new datasets - Animals & Wildlife
            const horsePopulationQuiz = await this.convertHorsePopulationData();
            if (horsePopulationQuiz) {
                this.quizData.quizzes[horsePopulationQuiz.id] = horsePopulationQuiz;
                console.log('🐎 Added Horse Population quiz');
            }
            
            const sheepPopulationQuiz = await this.convertSheepPopulationData();
            if (sheepPopulationQuiz) {
                this.quizData.quizzes[sheepPopulationQuiz.id] = sheepPopulationQuiz;
                console.log('🐑 Added Sheep Population quiz');
            }
            
            const mammalsQuiz = await this.convertMammalsData();
            if (mammalsQuiz) {
                this.quizData.quizzes[mammalsQuiz.id] = mammalsQuiz;
                console.log('🦁 Added Mammals quiz');
            }
            
            const birdsQuiz = await this.convertBirdsData();
            if (birdsQuiz) {
                this.quizData.quizzes[birdsQuiz.id] = birdsQuiz;
                console.log('🦅 Added Birds quiz');
            }
            
            const fishQuiz = await this.convertFishData();
            if (fishQuiz) {
                this.quizData.quizzes[fishQuiz.id] = fishQuiz;
                console.log('🐟 Added Fish quiz');
            }
            
            const reptilesQuiz = await this.convertReptilesData();
            if (reptilesQuiz) {
                this.quizData.quizzes[reptilesQuiz.id] = reptilesQuiz;
                console.log('🦎 Added Reptiles quiz');
            }
            
            const amphibiansQuiz = await this.convertAmphibiansData();
            if (amphibiansQuiz) {
                this.quizData.quizzes[amphibiansQuiz.id] = amphibiansQuiz;
                console.log('🐸 Added Amphibians quiz');
            }
            
            // Convert new datasets - Environment & Natural Disasters
            const earthquakesQuiz = await this.convertEarthquakesData();
            if (earthquakesQuiz) {
                this.quizData.quizzes[earthquakesQuiz.id] = earthquakesQuiz;
                console.log('🌋 Added Earthquakes quiz');
            }
            
            const strongestEarthquakesQuiz = await this.convertStrongestEarthquakesData();
            if (strongestEarthquakesQuiz) {
                this.quizData.quizzes[strongestEarthquakesQuiz.id] = strongestEarthquakesQuiz;
                console.log('🌋 Added Strongest Earthquakes quiz');
            }
            
            const holoceneVolcanoesQuiz = await this.convertHoloceneVolcanoesData();
            if (holoceneVolcanoesQuiz) {
                this.quizData.quizzes[holoceneVolcanoesQuiz.id] = holoceneVolcanoesQuiz;
                console.log('🌋 Added Holocene Volcanoes quiz');
            }
            
            const plantsQuiz = await this.convertPlantsData();
            if (plantsQuiz) {
                this.quizData.quizzes[plantsQuiz.id] = plantsQuiz;
                console.log('🌿 Added Plants quiz');
            }
            
            // Convert new datasets - Infrastructure & Transport
            const waterwaysQuiz = await this.convertWaterwaysData();
            if (waterwaysQuiz) {
                this.quizData.quizzes[waterwaysQuiz.id] = waterwaysQuiz;
                console.log('🚢 Added Waterways quiz');
            }
            
            // Convert new datasets - Culture & Society
            const nationalAnthemsQuiz = await this.convertNationalAnthemsData();
            if (nationalAnthemsQuiz) {
                this.quizData.quizzes[nationalAnthemsQuiz.id] = nationalAnthemsQuiz;
                console.log('🎵 Added National Anthems quiz');
            }
            
            const shoeSizeQuiz = await this.convertShoeSizeData();
            if (shoeSizeQuiz) {
                this.quizData.quizzes[shoeSizeQuiz.id] = shoeSizeQuiz;
                console.log('👟 Added Shoe Size quiz');
            }
            
            // Convert new datasets - Economics & Finance
            const externalDebtQuiz = await this.convertExternalDebtData();
            if (externalDebtQuiz) {
                this.quizData.quizzes[externalDebtQuiz.id] = externalDebtQuiz;
                console.log('💳 Added External Debt quiz');
            }
            
            const externalDebtPercentGDPQuiz = await this.convertExternalDebtPercentGDPData();
            if (externalDebtPercentGDPQuiz) {
                this.quizData.quizzes[externalDebtPercentGDPQuiz.id] = externalDebtPercentGDPQuiz;
                console.log('💳 Added External Debt % GDP quiz');
            }
            
            // Convert new datasets - Sports & Games
            const fideTopFederationsQuiz = await this.convertFIDETopFederationsData();
            if (fideTopFederationsQuiz) {
                this.quizData.quizzes[fideTopFederationsQuiz.id] = fideTopFederationsQuiz;
                console.log('♟️ Added FIDE Top Federations quiz');
            }
            
            // Convert new datasets - Landlocked Countries with Ocean Access
            const landlockedNeighboursOceanAccessQuiz = await this.convertLandlockedNeighboursOceanAccessData();
            if (landlockedNeighboursOceanAccessQuiz) {
                this.quizData.quizzes[landlockedNeighboursOceanAccessQuiz.id] = landlockedNeighboursOceanAccessQuiz;
                console.log('🏔️ Added Landlocked Countries with Ocean Access quiz');
            }
            
            // Log summary of loaded datasets
            const totalLoaded = Object.keys(this.quizData.quizzes).length;
            console.log(`📊 Dataset loading complete: ${totalLoaded} datasets loaded successfully`);
            console.log('📋 Loaded dataset IDs:', Object.keys(this.quizData.quizzes).sort());
        } catch (error) {
            console.error('❌ Error in loadConvertedData:', error);
        }
    }
    
    async convertLandAreaData() {
        try {
            const response = await fetch('data/land_area.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'Earth' && item.country !== 'Antarctica') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    
                    // Debug logging for United States
                    if (item.country === 'United States') {
                        console.log('Land Area - United States mapping:', {
                            original: item.country,
                            mapped: mappedCountryName,
                            value: item.land_area_km2
                        });
                    }
                    
                    countries[mappedCountryName] = {
                        value: item.land_area_km2,
                        unit: 'km²'
                    };
                    values.push(item.land_area_km2);
                }
            });
            
            // Debug: Check if United States made it to the final countries object
            console.log('Land Area - Final countries object:', {
                hasUnitedStates: !!countries['United States of America'],
                unitedStatesData: countries['United States of America'],
                totalCountries: Object.keys(countries).length,
                sampleCountries: Object.keys(countries).slice(0, 10)
            });
            
            // Debug: Check all values for validity
            const sampleValues = values.slice(0, 10);
            console.log('Land Area - Sample values:', sampleValues);
            console.log('Land Area - Values types:', sampleValues.map(v => typeof v));
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values using random color scheme
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme[0], colorScheme[colorScheme.length - 1]);
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
                    colors: colorScheme,
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
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
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
            
            // Apply colors based on values using random color scheme
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme[0], colorScheme[colorScheme.length - 1]);
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
                    colors: colorScheme,
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
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
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
            
            // Apply colors based on values using random color scheme
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme[0], colorScheme[colorScheme.length - 1]);
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
                    colors: colorScheme,
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
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
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
            
            // Apply colors based on values using enhanced color scheme
            const colorScheme = this.getColorSchemeForCategory('demographics', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
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
                    colors: ['#fef3c7', '#fbbf24', '#f59e0b', '#d97706'],
                    minColor: '#fef3c7',
                    maxColor: '#d97706',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting population density data:', error);
            return null;
        }
    }
    
    async convertFertilityRateData() {
        try {
            const response = await fetch('data/total_fertility_rate_2025.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.total_fertility_rate,
                        unit: 'children per woman'
                    };
                    values.push(item.total_fertility_rate);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values using enhanced color scheme
            const colorScheme = this.getColorSchemeForCategory('demographics', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'fertility_rate_2025',
                title: 'Fertility Rate 2025',
                description: 'Countries colored by total fertility rate (children per woman)',
                category: 'demographics',
                tags: ['fertility rate', 'birth rate', 'children per woman', 'demographics', 'population growth'],
                answer_variations: [
                    'fertility rate',
                    'birth rate',
                    'children per woman',
                    'total fertility rate',
                    'fertility',
                    'births per woman'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fef3c7', '#fbbf24', '#f59e0b', '#d97706'],
                    minColor: '#fef3c7',
                    maxColor: '#d97706',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting fertility rate data:', error);
            return null;
        }
    }
    
    async convertGNIPerCapitaData() {
        try {
            const response = await fetch('data/gni_per_capita_2024.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.gni_per_capita_usd,
                        unit: 'USD'
                    };
                    values.push(item.gni_per_capita_usd);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values using enhanced color scheme
            const colorScheme = this.getColorSchemeForCategory('economics', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'gni_per_capita_2024',
                title: 'GNI Per Capita 2024',
                description: 'Countries colored by Gross National Income per capita',
                category: 'economics',
                tags: ['gni per capita', 'income', 'wealth', 'economics', 'gross national income', 'money'],
                answer_variations: [
                    'gni per capita',
                    'income per person',
                    'wealth per person',
                    'gross national income',
                    'income',
                    'money per person'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#dcfce7', '#22c55e', '#16a34a', '#15803d'],
                    minColor: '#dcfce7',
                    maxColor: '#15803d',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting GNI per capita data:', error);
            return null;
        }
    }
    
    async convertHDIData() {
        try {
            const response = await fetch('data/hdi_by_country_2023.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                countries[mappedCountryName] = {
                    value: item.hdi_value,
                    unit: 'HDI score'
                };
                values.push(item.hdi_value);
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values using enhanced color scheme
            const colorScheme = this.getColorSchemeForCategory('social', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'hdi_2023',
                title: 'Human Development Index 2023',
                description: 'Countries colored by Human Development Index score',
                category: 'social',
                tags: ['human development index', 'hdi', 'development', 'quality of life', 'social progress'],
                answer_variations: [
                    'human development index',
                    'hdi',
                    'development',
                    'quality of life',
                    'human development',
                    'development index'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fdf4ff', '#f3e8ff', '#c084fc', '#9333ea'],
                    minColor: '#fdf4ff',
                    maxColor: '#9333ea',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting HDI data:', error);
            return null;
        }
    }
    
    async convertGDPByCountryData() {
        try {
            const response = await fetch('data/gdp_by_country_2025.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.gdp_million_usd,
                        unit: 'million USD'
                    };
                    values.push(item.gdp_million_usd);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values using enhanced color scheme
            const colorScheme = this.getColorSchemeForCategory('economics', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'gdp_by_country_2025',
                title: 'GDP by Country 2025',
                description: 'Countries colored by total GDP (Gross Domestic Product)',
                category: 'economics',
                tags: ['gdp', 'gross domestic product', 'economy', 'economic size', 'economic output'],
                answer_variations: [
                    'gdp',
                    'gross domestic product',
                    'economy size',
                    'economic output',
                    'economic size',
                    'total gdp'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#dcfce7', '#22c55e', '#16a34a', '#15803d'],
                    minColor: '#dcfce7',
                    maxColor: '#15803d',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting GDP by country data:', error);
            return null;
        }
    }
    
    async convertLandNeighboursData() {
        try {
            const response = await fetch('data/distinct_land_neighbours_by_country.json');
            const data = await response.json();

            const countries = {};
            const values = [];

            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.distinct_land_neighbours,
                        unit: 'neighbours'
                    };
                    values.push(item.distinct_land_neighbours);
                }
            });

            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);

            // Apply colors based on values (purple gradient for neighbours)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e0e0e0', '#607d8b');
            });

            return {
                id: 'land_neighbours',
                title: 'Land Neighbours',
                description: 'Countries colored by number of land neighbours',
                category: 'geography',
                tags: ['land neighbours', 'neighbours', 'borders', 'territory', 'landmass'],
                answer_variations: [
                    'land neighbours',
                    'neighbours',
                    'borders',
                    'territory',
                    'landmass'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e0e0e0',
                    maxColor: '#607d8b',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting Land Neighbours data:', error);
            return null;
        }
    }

    async convertAverageHeightData() {
        try {
            const response = await fetch('data/average_height_by_country.json');
            const data = await response.json();

            const countries = {};
            const values = [];

            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.average_height_cm,
                        unit: 'cm'
                    };
                    values.push(item.average_height_cm);
                }
            });

            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);

            // Apply colors based on values (blue gradient for height)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e0f7fa', '#00838f');
            });

            return {
                id: 'average_height',
                title: 'Average Height',
                description: 'Countries colored by average height',
                category: 'demographics',
                tags: ['average height', 'height', 'demographics', 'population'],
                answer_variations: [
                    'average height',
                    'height',
                    'demographic height',
                    'population height'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e0f7fa',
                    maxColor: '#00838f',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting Average Height data:', error);
            return null;
        }
    }

    async convertLiteracyRateData() {
        try {
            const response = await fetch('data/total_literacy_rate_by_country.json');
            const data = await response.json();

            const countries = {};
            const values = [];

            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.literacy_rate_percent,
                        unit: '%'
                    };
                    values.push(item.literacy_rate_percent);
                }
            });

            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);

            // Apply colors based on values (green gradient for literacy)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e8f5e8', '#2e7d32');
            });

            return {
                id: 'literacy_rate',
                title: 'Literacy Rate',
                description: 'Countries colored by literacy rate',
                category: 'education',
                tags: ['literacy rate', 'reading ability', 'education level', 'literacy'],
                answer_variations: [
                    'literacy rate',
                    'reading ability',
                    'education level',
                    'literacy'
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
            console.error('Error converting Literacy Rate data:', error);
            return null;
        }
    }

    async convertMaleMedianAgeData() {
        try {
            const response = await fetch('data/male_median_age_by_country.json');
            const data = await response.json();

            const countries = {};
            const values = [];

            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.male_median_age_years,
                        unit: 'years'
                    };
                    values.push(item.male_median_age_years);
                }
            });

            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);

            // Apply colors based on values (purple gradient for age)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#eceff1', '#546e7a');
            });

            return {
                id: 'male_median_age',
                title: 'Male Median Age',
                description: 'Countries colored by male median age',
                category: 'demographics',
                tags: ['male median age', 'age', 'demographics', 'population'],
                answer_variations: [
                    'male median age',
                    'age',
                    'demographic age',
                    'population age'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#eceff1',
                    maxColor: '#546e7a',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting Male Median Age data:', error);
            return null;
        }
    }

    async convertLowestTemperatureData() {
        try {
            const response = await fetch('data/lowest_temperature_by_country.json');
            const data = await response.json();

            const countries = {};
            const values = [];

            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.temperature_celsius,
                        unit: '°C'
                    };
                    values.push(item.temperature_celsius);
                }
            });

            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);

            // Apply colors based on values (blue gradient for cold)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e0f2f7', '#0077b6');
            });

            return {
                id: 'lowest_temperature',
                title: 'Lowest Temperature',
                description: 'Countries colored by lowest recorded temperature',
                category: 'environment',
                tags: ['lowest temperature', 'cold', 'climate', 'weather'],
                answer_variations: [
                    'lowest temperature',
                    'cold',
                    'climate',
                    'weather'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e0f2f7',
                    maxColor: '#0077b6',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting Lowest Temperature data:', error);
            return null;
        }
    }

    async convertHighestTemperatureData() {
        try {
            const response = await fetch('data/highest_temperature_by_country.json');
            const data = await response.json();

            const countries = {};
            const values = [];

            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.temperature_celsius,
                        unit: '°C'
                    };
                    values.push(item.temperature_celsius);
                }
            });

            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);

            // Apply colors based on values (red gradient for hot)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#b71c1c');
            });

            return {
                id: 'highest_temperature',
                title: 'Highest Temperature',
                description: 'Countries colored by highest recorded temperature',
                category: 'environment',
                tags: ['highest temperature', 'hot', 'climate', 'weather'],
                answer_variations: [
                    'highest temperature',
                    'hot',
                    'climate',
                    'weather'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#ffebee',
                    maxColor: '#d32f2f',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting Highest Temperature data:', error);
            return null;
        }
    }

    async convertFlagAdoptionData() {
        try {
            const response = await fetch('data/latest_flag_adoption_by_country.json');
            const data = await response.json();

            const countries = {};
            const values = [];

            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.latest_flag_adoption_year,
                        unit: 'year'
                    };
                    values.push(item.latest_flag_adoption_year);
                }
            });

            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);

            // Apply colors based on values (purple gradient for adoption)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#eceff1', '#546e7a');
            });

            return {
                id: 'flag_adoption',
                title: 'Flag Adoption',
                description: 'Countries colored by year of flag adoption',
                category: 'social',
                tags: ['flag adoption', 'national flag', 'country flag', 'nationality'],
                answer_variations: [
                    'flag adoption',
                    'national flag',
                    'country flag',
                    'nationality'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#eceff1',
                    maxColor: '#546e7a',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting Flag Adoption data:', error);
            return null;
        }
    }

    async convertIslandsData() {
        try {
            const response = await fetch('data/number_of_islands_by_country.json');
            const data = await response.json();

            const countries = {};
            const values = [];

            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.number_of_islands,
                        unit: 'islands'
                    };
                    values.push(item.number_of_islands);
                }
            });

            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);

            // Apply colors based on values (blue gradient for islands)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e0f7fa', '#00838f');
            });

            return {
                id: 'islands',
                title: 'Number of Islands',
                description: 'Countries colored by number of islands',
                category: 'geography',
                tags: ['islands', 'island', 'geography', 'territory', 'landmass'],
                answer_variations: [
                    'islands',
                    'island',
                    'geographic islands',
                    'territory islands'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e0f7fa',
                    maxColor: '#00838f',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting Islands data:', error);
            return null;
        }
    }

    async convertMobilePhonesData() {
        try {
            const response = await fetch('data/mobile_phone_numbers_by_country.json');
            const data = await response.json();

            const countries = {};
            const values = [];

            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.phone_numbers_per_100_citizens,
                        unit: 'phones/100'
                    };
                    values.push(item.phone_numbers_per_100_citizens);
                }
            });

            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);

            // Apply colors based on values (purple gradient for phones)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#eceff1', '#546e7a');
            });

            return {
                id: 'mobile_phones',
                title: 'Mobile Phone Numbers',
                description: 'Countries colored by number of mobile phones per 100 people',
                category: 'technology',
                tags: ['mobile phones', 'phones', 'technology', 'communication'],
                answer_variations: [
                    'mobile phones',
                    'phones',
                    'technology',
                    'communication'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#eceff1',
                    maxColor: '#546e7a',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting Mobile Phones data:', error);
            return null;
        }
    }
    
    async convertMonarchiesData() {
        try {
            const response = await fetch('data/monarchies.json');
            const data = await response.json();

            const countries = {};
            const monarchyTypes = {};

            // Process data and collect monarchy types
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                monarchyTypes[countryData.value] = (monarchyTypes[countryData.value] || 0) + 1;
            });

            // Create color scheme for monarchy types with contrasting colors
            const monarchyTypeList = Object.keys(monarchyTypes);
            const colorScheme = this.getColorSchemeForCategory('politics', 'categorical');
            const colors = colorScheme?.colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
            
            monarchyTypeList.forEach((type, index) => {
                const color = colors[index % colors.length];
                Object.keys(countries).forEach(country => {
                    if (countries[country].value === type) {
                        countries[country].color = color;
                    }
                });
            });

            return {
                id: 'monarchies',
                title: 'Countries with Monarchies',
                description: 'Countries colored by type of monarchy',
                category: 'politics',
                tags: ['monarchy', 'royalty', 'kings', 'queens', 'politics', 'government'],
                answer_variations: [
                    'monarchy',
                    'monarchies',
                    'kings and queens',
                    'royalty',
                    'monarchs'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: colors,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting Monarchies data:', error);
            return null;
        }
    }
    
    async convertPartySystemData() {
        try {
            const response = await fetch('data/country_party_system.json');
            const data = await response.json();

            const countries = {};
            const partySystems = {};

            // Process data and collect party systems
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                partySystems[countryData.value] = (partySystems[countryData.value] || 0) + 1;
            });

            // Create color scheme for party systems with contrasting colors
            const partySystemList = Object.keys(partySystems);
            const colorScheme = this.getColorSchemeForCategory('politics', 'categorical');
            const colors = colorScheme?.colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
            
            partySystemList.forEach((system, index) => {
                const color = colors[index % colors.length];
                Object.keys(countries).forEach(country => {
                    if (countries[country].value === system) {
                        countries[country].color = color;
                    }
                });
            });

            return {
                id: 'party_system',
                title: 'Political Party Systems',
                description: 'Countries colored by political party system',
                category: 'politics',
                tags: ['party system', 'politics', 'democracy', 'political parties', 'government'],
                answer_variations: [
                    'party system',
                    'political parties',
                    'political system',
                    'democracy type',
                    'party systems'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: colors,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting Party System data:', error);
            return null;
        }
    }
    
    async convertExportsData() {
        try {
            const response = await fetch('data/country_exports_simplified.json');
            const data = await response.json();

            const countries = {};
            const values = [];

            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                console.log(`Mapping: "${item.country}" -> "${mappedCountryName}"`);
                countries[mappedCountryName] = {
                    value: item.exports,
                    unit: 'million USD'
                };
                values.push(item.exports);
            });

            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);

            // Apply colors based on values (green gradient for exports)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e8f5e8', '#2e7d32');
            });

            return {
                id: 'exports',
                title: 'Exports by Country',
                description: 'Countries colored by total exports (goods and services)',
                category: 'economics',
                tags: ['exports', 'trade', 'economy', 'commerce', 'international trade'],
                answer_variations: [
                    'exports',
                    'export',
                    'trade exports',
                    'international exports',
                    'goods exports'
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
            console.error('Error converting Exports data:', error);
            return null;
        }
    }
    
    async convertImportsData() {
        try {
            const response = await fetch('data/imports_by_country.json');
            const data = await response.json();

            const countries = {};
            const values = [];

            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                countries[mappedCountryName] = {
                    value: item.imports_million_usd,
                    unit: 'million USD'
                };
                values.push(item.imports_million_usd);
            });

            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);

            // Apply colors based on values (blue gradient for imports)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#0d47a1');
            });

            return {
                id: 'imports',
                title: 'Imports by Country',
                description: 'Countries colored by total merchandise imports',
                category: 'economics',
                tags: ['imports', 'trade', 'economy', 'commerce', 'international trade'],
                answer_variations: [
                    'imports',
                    'import',
                    'trade imports',
                    'international imports',
                    'goods imports'
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
            console.error('Error converting Imports data:', error);
            return null;
        }
    }

    // New dataset conversion methods
    async convertChristianPopulationData() {
        try {
            const response = await fetch('data/percent_christian_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, value]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: '%'
                    };
                    values.push(value);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fff3e0', '#e65100');
            });
            
            return {
                id: 'percent_christian_by_country',
                title: 'Christian Population Percentage',
                description: 'Countries colored by percentage of Christian population',
                category: 'demographics',
                tags: ['christian', 'religion', 'christianity', 'religious demographics', 'faith', 'christian population'],
                answer_variations: [
                    'christian population',
                    'christianity',
                    'christian percentage',
                    'christian demographics',
                    'christian faith',
                    'christian religion'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fff3e0',
                    maxColor: '#e65100',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting christian population data:', error);
            return null;
        }
    }

    async convertNobelLaureatesData() {
        try {
            const response = await fetch('data/nobel_laureates_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, value]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: 'laureates'
                    };
                    values.push(value);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#f3e5f5', '#7b1fa2');
            });
            
            return {
                id: 'nobel_laureates_by_country',
                title: 'Nobel Laureates by Country',
                description: 'Countries colored by number of Nobel Prize winners',
                category: 'education',
                tags: ['nobel prize', 'nobel laureates', 'achievement', 'awards', 'academic excellence', 'scientific achievement'],
                answer_variations: [
                    'nobel laureates',
                    'nobel prize winners',
                    'nobel prize',
                    'nobel awards',
                    'nobel achievements',
                    'nobel winners'
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
            console.error('Error converting nobel laureates data:', error);
            return null;
        }
    }

    async convertActiveMilitaryData() {
        try {
            const response = await fetch('data/active_military_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, value]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: 'personnel'
                    };
                    values.push(value);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffebee', '#c62828');
            });
            
            return {
                id: 'active_military_by_country',
                title: 'Active Military Personnel',
                description: 'Countries colored by number of active military personnel',
                category: 'politics',
                tags: ['military', 'armed forces', 'defense', 'army', 'soldiers', 'military personnel'],
                answer_variations: [
                    'military personnel',
                    'active military',
                    'armed forces',
                    'military size',
                    'army size',
                    'defense forces'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#ffebee',
                    maxColor: '#c62828',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting active military data:', error);
            return null;
        }
    }

    async convertBillionairesData() {
        try {
            const response = await fetch('data/billionaires_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, value]) => {
                if (country !== 'World') { // Skip world total
                    const mappedCountryName = this.countryMapper.mapCountryName(country);
                    if (mappedCountryName) {
                        countries[mappedCountryName] = {
                            value: value,
                            unit: 'billionaires'
                        };
                        values.push(value);
                    }
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fff8e1', '#f57f17');
            });
            
            return {
                id: 'billionaires_by_country',
                title: 'Billionaires by Country',
                description: 'Countries colored by number of billionaires',
                category: 'economics',
                tags: ['billionaires', 'wealth', 'rich', 'millionaires', 'wealthy people', 'ultra rich'],
                answer_variations: [
                    'billionaires',
                    'wealthy people',
                    'billionaire count',
                    'ultra rich',
                    'wealthy individuals',
                    'billionaire population'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fff8e1',
                    maxColor: '#f57f17',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting billionaires data:', error);
            return null;
        }
    }

    async convertBloodTypesData() {
        try {
            const response = await fetch('data/blood_types_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data).forEach(([country, bloodData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    // Use O+ blood type percentage as the main metric
                    const value = bloodData['O+'];
                    countries[mappedCountryName] = {
                        value: value,
                        unit: '%'
                    };
                    values.push(value);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#b71c1c');
            });
            
            return {
                id: 'blood_types_by_country',
                title: 'O+ Blood Type Distribution',
                description: 'Countries colored by percentage of O+ blood type',
                category: 'health',
                tags: ['blood types', 'blood type o+', 'blood distribution', 'blood groups', 'o positive blood'],
                answer_variations: [
                    'blood types',
                    'o+ blood type',
                    'blood type distribution',
                    'blood groups',
                    'o positive blood',
                    'blood type percentage'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#ffebee',
                    maxColor: '#c62828',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting blood types data:', error);
            return null;
        }
    }

    async convertRoadSideData() {
        try {
            const response = await fetch('data/country_side_of_road.json');
            const data = await response.json();
            
            const countries = {};
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                if (mappedCountryName) {
                    // Convert RHT/LHT to numeric values for coloring
                    const value = item.side_of_road === 'RHT' ? 1 : 0;
                    countries[mappedCountryName] = {
                        value: value,
                        color: value === 1 ? '#4caf50' : '#f44336', // Green for RHT, Red for LHT
                        unit: item.side_of_road
                    };
                }
            });
            
            return {
                id: 'country_side_of_road',
                title: 'Driving Side by Country',
                description: 'Countries colored by which side of the road they drive on',
                category: 'lifestyle',
                tags: ['driving side', 'road side', 'traffic', 'driving', 'left hand drive', 'right hand drive'],
                answer_variations: [
                    'driving side',
                    'side of road',
                    'traffic side',
                    'road driving',
                    'left hand drive',
                    'right hand drive'
                ],
                colorScheme: {
                    type: 'categorical',
                    minColor: '#f44336', // Red for LHT
                    maxColor: '#4caf50', // Green for RHT
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting road side data:', error);
            return null;
        }
    }

    async convertCurrencyData() {
        try {
            const response = await fetch('data/usd_to_country_currencies.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    const value = countryData.value;
                    countries[mappedCountryName] = {
                        value: value,
                        unit: countryData.unit
                    };
                    values.push(value);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e8f5e8', '#2e7d32');
            });
            
            return {
                id: 'usd_to_country_currencies',
                title: 'USD Exchange Rates',
                description: 'Countries colored by USD exchange rate',
                category: 'economics',
                tags: ['exchange rate', 'currency', 'usd', 'foreign exchange', 'currency rate', 'money'],
                answer_variations: [
                    'exchange rate',
                    'usd exchange rate',
                    'currency rate',
                    'foreign exchange',
                    'currency value',
                    'usd rate'
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
            console.error('Error converting currency data:', error);
            return null;
        }
    }
    
    async convertWorldPopulationData() {
        try {
            const response = await fetch('data/world_population_2025.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    
                    // Debug logging for United States
                    if (item.country === 'United States') {
                        console.log('World Population - United States mapping:', {
                            original: item.country,
                            mapped: mappedCountryName,
                            value: item.population
                        });
                    }
                    
                    countries[mappedCountryName] = {
                        value: item.population,
                        unit: 'people'
                    };
                    values.push(item.population);
                }
            });
            
            // Debug: Check if United States made it to the final countries object
            console.log('World Population - Final countries object:', {
                hasUnitedStates: !!countries['United States of America'],
                unitedStatesData: countries['United States of America'],
                totalCountries: Object.keys(countries).length,
                sampleCountries: Object.keys(countries).slice(0, 10)
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values (blue gradient for population)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e3f2fd', '#1565c0');
            });
            
            return {
                id: 'world_population_2025',
                title: 'World Population 2025',
                description: 'Countries colored by population estimates for 2025',
                category: 'demographics',
                tags: ['population', 'demographics', 'people', 'inhabitants', 'residents'],
                answer_variations: [
                    'population',
                    'people',
                    'inhabitants',
                    'residents',
                    'demographics',
                    'world population'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e3f2fd',
                    maxColor: '#1565c0',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting world population data:', error);
            return null;
        }
    }
    
    async convertInternetUsageData() {
        try {
            const response = await fetch('data/internet_usage_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            Object.keys(data.data).forEach(countryName => {
                const mappedCountryName = this.countryMapper.mapCountryName(countryName);
                const countryData = data.data[countryName];
                
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                values.push(countryData.value);
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values (blue gradient for internet usage)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e3f2fd', '#1565c0');
            });
            
            return {
                id: 'internet_usage',
                title: 'Internet Usage by Country',
                description: 'Countries colored by percentage of population using the internet',
                category: 'technology',
                tags: ['internet', 'technology', 'connectivity', 'digital', 'online', 'web'],
                answer_variations: [
                    'internet usage',
                    'internet',
                    'online',
                    'digital',
                    'connectivity',
                    'web usage',
                    'internet access'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e3f2fd',
                    maxColor: '#1565c0',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting internet usage data:', error);
            return null;
        }
    }
    
    async convertCarbonEmissionsData() {
        try {
            const response = await fetch('data/carbon_emissions_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            Object.keys(data.data).forEach(countryName => {
                const mappedCountryName = this.countryMapper.mapCountryName(countryName);
                const countryData = data.data[countryName];
                
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                values.push(countryData.value);
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values (red gradient for carbon emissions - higher is worse)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffebee', '#c62828');
            });
            
            return {
                id: 'carbon_emissions',
                title: 'Carbon Emissions by Country',
                description: 'Countries colored by fossil CO2 emissions in 2023',
                category: 'environment',
                tags: ['carbon', 'emissions', 'environment', 'climate', 'pollution', 'co2'],
                answer_variations: [
                    'carbon emissions',
                    'co2 emissions',
                    'emissions',
                    'carbon',
                    'pollution',
                    'climate',
                    'fossil fuels'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#ffebee',
                    maxColor: '#c62828',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting carbon emissions data:', error);
            return null;
        }
    }
    
    async convertCurrenciesData() {
        try {
            const response = await fetch('data/currencies_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const currencyTypes = {};
            
            // Process data and collect currency types
            Object.keys(data.data).forEach(countryName => {
                const mappedCountryName = this.countryMapper.mapCountryName(countryName);
                const countryData = data.data[countryName];
                
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                currencyTypes[countryData.value] = (currencyTypes[countryData.value] || 0) + 1;
            });
            
            // Create color scheme for currency types with contrasting colors
            const currencyTypeList = Object.keys(currencyTypes);
            const colorScheme = this.getColorSchemeForCategory('economics', 'categorical');
            const colors = colorScheme?.colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
            
            currencyTypeList.forEach((type, index) => {
                const color = colors[index % colors.length];
                Object.keys(countries).forEach(country => {
                    if (countries[country].value === type) {
                        countries[country].color = color;
                    }
                });
            });
            
            return {
                id: 'currencies_by_country',
                title: 'Currency by Country',
                description: 'Countries colored by their official currency',
                category: 'economics',
                tags: ['currency', 'money', 'economics', 'financial', 'monetary'],
                answer_variations: [
                    'currency',
                    'money',
                    'official currency',
                    'national currency',
                    'monetary unit',
                    'currency type'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: colors,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting currencies data:', error);
            return null;
        }
    }
    
    async convertFirearmsData() {
        try {
            const response = await fetch('data/firearms_per_100_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            Object.keys(data.data).forEach(countryName => {
                const mappedCountryName = this.countryMapper.mapCountryName(countryName);
                const countryData = data.data[countryName];
                
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                values.push(countryData.value);
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values (red gradient for firearms - higher is more concerning)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffebee', '#c62828');
            });
            
            return {
                id: 'firearms_per_100_by_country',
                title: 'Firearms per 100 People',
                description: 'Countries colored by estimated civilian firearms per 100 people',
                category: 'social',
                tags: ['firearms', 'guns', 'weapons', 'social', 'safety', 'gun ownership'],
                answer_variations: [
                    'firearms per 100 people',
                    'guns per 100 people',
                    'firearms ownership',
                    'gun ownership',
                    'civilian firearms',
                    'weapons per capita'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#ffebee',
                    maxColor: '#c62828',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting firearms data:', error);
            return null;
        }
    }
    
    async convertTrafficDeathsData() {
        try {
            const response = await fetch('data/traffic_related_death_rate_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            Object.keys(data.data).forEach(countryName => {
                const mappedCountryName = this.countryMapper.mapCountryName(countryName);
                const countryData = data.data[countryName];
                
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                values.push(countryData.value);
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values (red gradient for traffic deaths - higher is worse)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffebee', '#c62828');
            });
            
            return {
                id: 'traffic_related_death_rate_by_country',
                title: 'Traffic Death Rate',
                description: 'Countries colored by traffic-related death rate per 100,000 people',
                category: 'social',
                tags: ['traffic deaths', 'road safety', 'accidents', 'mortality', 'transportation'],
                answer_variations: [
                    'traffic death rate',
                    'road deaths',
                    'traffic fatalities',
                    'road safety',
                    'traffic mortality',
                    'accident deaths'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#ffebee',
                    maxColor: '#c62828',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting traffic deaths data:', error);
            return null;
        }
    }
    
    async convertBroadbandData() {
        try {
            const response = await fetch('data/fixed_broadband_subscriptions_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            Object.keys(data.data).forEach(countryName => {
                const mappedCountryName = this.countryMapper.mapCountryName(countryName);
                const countryData = data.data[countryName];
                
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                values.push(countryData.value);
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values (blue gradient for broadband - higher is better)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e3f2fd', '#1565c0');
            });
            
            return {
                id: 'fixed_broadband_subscriptions_by_country',
                title: 'Fixed Broadband Subscriptions',
                description: 'Countries colored by fixed broadband subscriptions per 100 people',
                category: 'technology',
                tags: ['broadband', 'internet', 'technology', 'connectivity', 'digital infrastructure'],
                answer_variations: [
                    'fixed broadband subscriptions',
                    'broadband subscriptions',
                    'internet subscriptions',
                    'broadband access',
                    'fixed internet',
                    'broadband connectivity'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e3f2fd',
                    maxColor: '#1565c0',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting broadband data:', error);
            return null;
        }
    }
    
    async convertMobileSpeedData() {
        try {
            const response = await fetch('data/mobile_connection_speed_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            Object.keys(data.data).forEach(countryName => {
                const mappedCountryName = this.countryMapper.mapCountryName(countryName);
                const countryData = data.data[countryName];
                
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                values.push(countryData.value);
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values (green gradient for speed - higher is better)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e8f5e8', '#2e7d32');
            });
            
            return {
                id: 'mobile_connection_speed_by_country',
                title: 'Mobile Connection Speed',
                description: 'Countries colored by average mobile internet connection speed',
                category: 'technology',
                tags: ['mobile speed', 'internet speed', 'technology', 'connectivity', 'mobile data'],
                answer_variations: [
                    'mobile connection speed',
                    'mobile internet speed',
                    'mobile data speed',
                    'mobile speed',
                    'connection speed',
                    'mobile network speed'
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
            console.error('Error converting mobile speed data:', error);
            return null;
        }
    }
    
    async convertInternetSpeedData() {
        try {
            const response = await fetch('data/internet_speed_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
            Object.keys(data.data).forEach(countryName => {
                const mappedCountryName = this.countryMapper.mapCountryName(countryName);
                const countryData = data.data[countryName];
                
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                values.push(countryData.value);
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            // Apply colors based on values (blue gradient for internet speed - higher is better)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e3f2fd', '#1565c0');
            });
            
            return {
                id: 'internet_speed_by_country',
                title: 'Internet Speed by Country',
                description: 'Countries colored by average fixed internet connection speed',
                category: 'technology',
                tags: ['internet speed', 'broadband speed', 'technology', 'connectivity', 'digital'],
                answer_variations: [
                    'internet speed',
                    'broadband speed',
                    'connection speed',
                    'internet connection speed',
                    'fixed internet speed',
                    'download speed'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e3f2fd',
                    maxColor: '#1565c0',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting internet speed data:', error);
            return null;
        }
    }
    
    async convertLeadingExportMarketData() {
        try {
            const response = await fetch('data/leading_export_market_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const marketTypes = {};
            
            // Process data and collect market types
            Object.keys(data.data).forEach(countryName => {
                const mappedCountryName = this.countryMapper.mapCountryName(countryName);
                const countryData = data.data[countryName];
                
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                marketTypes[countryData.value] = (marketTypes[countryData.value] || 0) + 1;
            });
            
            // Create color scheme for market types with contrasting colors
            const marketTypeList = Object.keys(marketTypes);
            const colors = [
                '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
                '#1abc9c', '#e67e22', '#34495e', '#f1c40f', '#e91e63',
                '#00bcd4', '#795548', '#607d8b', '#ff5722', '#2196f3',
                '#4caf50', '#ff9800', '#9c27b0', '#607d8b', '#795548'
            ];
            
            marketTypeList.forEach((type, index) => {
                const color = colors[index % colors.length];
                Object.keys(countries).forEach(country => {
                    if (countries[country].value === type) {
                        countries[country].color = color;
                    }
                });
            });
            
            return {
                id: 'leading_export_market_by_country',
                title: 'Leading Export Market',
                description: 'Countries colored by their leading export market',
                category: 'economics',
                tags: ['export market', 'trade', 'economics', 'commerce', 'international trade'],
                answer_variations: [
                    'leading export market',
                    'export market',
                    'main export market',
                    'primary export market',
                    'top export market',
                    'major export market'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: colors,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting leading export market data:', error);
            return null;
        }
    }
    
    async convertTopGoodsExportData() {
        try {
            const response = await fetch('data/top_goods_export_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const goodsTypes = {};
            
            // Process data and collect goods types
            Object.keys(data.data).forEach(countryName => {
                const mappedCountryName = this.countryMapper.mapCountryName(countryName);
                const countryData = data.data[countryName];
                
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                goodsTypes[countryData.value] = (goodsTypes[countryData.value] || 0) + 1;
            });
            
            // Create color scheme for goods types with contrasting colors
            const goodsTypeList = Object.keys(goodsTypes);
            const colors = [
                '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
                '#1abc9c', '#e67e22', '#34495e', '#f1c40f', '#e91e63',
                '#00bcd4', '#795548', '#607d8b', '#ff5722', '#2196f3',
                '#4caf50', '#ff9800', '#9c27b0', '#607d8b', '#795548',
                '#8bc34a', '#ff5722', '#3f51b5', '#009688', '#ffc107'
            ];
            
            goodsTypeList.forEach((type, index) => {
                const color = colors[index % colors.length];
                Object.keys(countries).forEach(country => {
                    if (countries[country].value === type) {
                        countries[country].color = color;
                    }
                });
            });
            
            return {
                id: 'top_goods_export_by_country',
                title: 'Top Goods Export',
                description: 'Countries colored by their primary goods export',
                category: 'economics',
                tags: ['goods export', 'trade', 'economics', 'commerce', 'exports'],
                answer_variations: [
                    'top goods export',
                    'goods export',
                    'main export',
                    'primary export',
                    'leading export',
                    'major export'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: colors,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting top goods export data:', error);
            return null;
        }
    }
    
    async convertWorldBankIncomeGroupData() {
        try {
            const response = await fetch('data/world_bank_income_group_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const incomeGroups = {};
            
            // Process data and collect income groups
            Object.keys(data.data).forEach(countryName => {
                const mappedCountryName = this.countryMapper.mapCountryName(countryName);
                const countryData = data.data[countryName];
                
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                incomeGroups[countryData.value] = (incomeGroups[countryData.value] || 0) + 1;
            });
            
            // Create color scheme for income groups with distinct colors
            const incomeGroupList = Object.keys(incomeGroups);
            const colors = [
                '#e74c3c', // Low income - red
                '#f39c12', // Lower middle income - orange
                '#f1c40f', // Upper middle income - yellow
                '#2ecc71'  // High income - green
            ];
            
            incomeGroupList.forEach((group, index) => {
                const color = colors[index % colors.length];
                Object.keys(countries).forEach(country => {
                    if (countries[country].value === group) {
                        countries[country].color = color;
                    }
                });
            });
            
            return {
                id: 'world_bank_income_group_by_country',
                title: 'World Bank Income Group',
                description: 'Countries colored by their World Bank income group classification',
                category: 'economics',
                tags: ['income group', 'world bank', 'economics', 'development', 'wealth'],
                answer_variations: [
                    'world bank income group',
                    'income group',
                    'economic classification',
                    'wealth classification',
                    'development level',
                    'economic status'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: colors,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting world bank income group data:', error);
            return null;
        }
    }
    
    async convertLeadingImportSourceData() {
        try {
            const response = await fetch('data/leading_import_source_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const importSources = {};
            
            // Process data and collect import sources
            Object.keys(data.data).forEach(countryName => {
                const mappedCountryName = this.countryMapper.mapCountryName(countryName);
                const countryData = data.data[countryName];
                
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit
                };
                importSources[countryData.value] = (importSources[countryData.value] || 0) + 1;
            });
            
            // Create color scheme for import sources with distinct colors
            const importSourceList = Object.keys(importSources);
            const colors = [
                '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
                '#1abc9c', '#e67e22', '#34495e', '#f1c40f', '#e91e63',
                '#00bcd4', '#795548', '#607d8b', '#ff5722', '#2196f3',
                '#4caf50', '#ff9800', '#9c27b0', '#607d8b', '#795548',
                '#8bc34a', '#ff5722', '#3f51b5', '#009688', '#ffc107'
            ];
            
            importSourceList.forEach((source, index) => {
                const color = colors[index % colors.length];
                Object.keys(countries).forEach(country => {
                    if (countries[country].value === source) {
                        countries[country].color = color;
                    }
                });
            });
            
            return {
                id: 'leading_import_source_by_country',
                title: 'Leading Import Source',
                description: 'Countries colored by their leading import source',
                category: 'economics',
                tags: ['import source', 'trade', 'economics', 'commerce', 'imports'],
                answer_variations: [
                    'leading import source',
                    'import source',
                    'main import',
                    'primary import',
                    'leading trade partner',
                    'major import source'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: colors,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting leading import source data:', error);
            return null;
        }
    }
    
    getColorForRatio(ratio, minColor, maxColor) {
        // Enhanced color system with multiple color schemes and better gradients
        let enhancedRatio;
        
        if (ratio < 0.5) {
            // First half: slower progression for subtle differences
            enhancedRatio = Math.pow(ratio * 2, 0.5) * 0.5;
        } else {
            // Second half: faster progression for dramatic differences
            enhancedRatio = 0.5 + Math.pow((ratio - 0.5) * 2, 1.5) * 0.5;
        }
        
        // Support multiple formats: array, object, or two color strings
        let color1, color2;
        
        if (Array.isArray(minColor)) {
            // Array format: use first and last colors
            color1 = minColor[0] || '#f8f9fa';
            color2 = minColor[minColor.length - 1] || '#000000';
        } else if (typeof minColor === 'object' && minColor !== null) {
            // Object format: colorScheme object
            if (minColor.colors && minColor.colors.length > 2) {
                return this.interpolateMultiColor(enhancedRatio, minColor.colors);
            }
            color1 = minColor.minColor || (minColor.colors && minColor.colors[0]) || '#f8f9fa';
            color2 = minColor.maxColor || (minColor.colors && minColor.colors[1]) || '#000000';
        } else {
            // Old format: minColor, maxColor strings
            color1 = minColor || '#f8f9fa';
            color2 = maxColor || '#000000';
        }
        
        // Ensure colors are strings and have the correct format
        if (typeof color1 !== 'string' || typeof color2 !== 'string') {
            console.warn('Invalid color format:', { color1, color2, minColor, maxColor });
            return '#f8f9fa'; // Default fallback (light gray instead of white)
        }
        
        // Ensure colors start with #
        if (!color1.startsWith('#')) color1 = '#' + color1;
        if (!color2.startsWith('#')) color2 = '#' + color2;
        
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * enhancedRatio);
        const g = Math.round(g1 + (g2 - g1) * enhancedRatio);
        const b = Math.round(b1 + (b2 - b1) * enhancedRatio);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // Enhanced color schemes with more variety and better gradients
    getColorSchemeForCategory(category, dataType = 'numeric') {
        const schemes = {
            // Geography & Environment
            geography: {
                numeric: {
                    colors: ['#f0f8ff', '#87ceeb', '#4682b4', '#1e3a8a'],
                    minColor: '#f0f8ff',
                    maxColor: '#1e3a8a'
                },
                categorical: {
                    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']
                }
            },
            
            // Demographics & Population
            demographics: {
                numeric: {
                    colors: ['#fef3c7', '#fbbf24', '#f59e0b', '#d97706'],
                    minColor: '#fef3c7',
                    maxColor: '#d97706'
                },
                categorical: {
                    colors: ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#84cc16']
                }
            },
            
            // Economics & Finance
            economics: {
                numeric: {
                    colors: ['#dcfce7', '#22c55e', '#16a34a', '#15803d'],
                    minColor: '#dcfce7',
                    maxColor: '#15803d'
                },
                categorical: {
                    colors: ['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#78350f', '#451a03', '#dcfce7', '#22c55e']
                }
            },
            
            // Politics & Government
            politics: {
                numeric: {
                    colors: ['#fce7f3', '#f472b6', '#ec4899', '#be185d'],
                    minColor: '#fce7f3',
                    maxColor: '#be185d'
                },
                categorical: {
                    colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']
                }
            },
            
            // Technology & Infrastructure
            technology: {
                numeric: {
                    colors: ['#e0e7ff', '#a5b4fc', '#6366f1', '#4338ca'],
                    minColor: '#e0e7ff',
                    maxColor: '#4338ca'
                },
                categorical: {
                    colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#84cc16']
                }
            },
            
            // Health & Medicine
            health: {
                numeric: {
                    colors: ['#fef2f2', '#fecaca', '#f87171', '#dc2626'],
                    minColor: '#fef2f2',
                    maxColor: '#dc2626'
                },
                categorical: {
                    colors: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4']
                }
            },
            
            // Education & Science
            education: {
                numeric: {
                    colors: ['#f0fdf4', '#bbf7d0', '#4ade80', '#16a34a'],
                    minColor: '#f0fdf4',
                    maxColor: '#16a34a'
                },
                categorical: {
                    colors: ['#8b5cf6', '#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#84cc16', '#f97316']
                }
            },
            
            // Social & Culture
            social: {
                numeric: {
                    colors: ['#fdf4ff', '#f3e8ff', '#c084fc', '#9333ea'],
                    minColor: '#fdf4ff',
                    maxColor: '#9333ea'
                },
                categorical: {
                    colors: ['#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#84cc16', '#ef4444']
                }
            },
            
            // Environment & Climate
            environment: {
                numeric: {
                    colors: ['#f0fdfa', '#5eead4', '#14b8a6', '#0f766e'],
                    minColor: '#f0fdfa',
                    maxColor: '#0f766e'
                },
                categorical: {
                    colors: ['#10b981', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#06b6d4', '#3b82f6']
                }
            },
            
            // Sports & Recreation
            sports: {
                numeric: {
                    colors: ['#fff7ed', '#fed7aa', '#fb923c', '#ea580c'],
                    minColor: '#fff7ed',
                    maxColor: '#ea580c'
                },
                categorical: {
                    colors: ['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#ef4444', '#dc2626', '#991b1b', '#7f1d1d']
                }
            },
            
            // Agriculture & Food
            agriculture: {
                numeric: {
                    colors: ['#fefce8', '#fef08a', '#eab308', '#a16207'],
                    minColor: '#fefce8',
                    maxColor: '#a16207'
                },
                categorical: {
                    colors: ['#84cc16', '#22c55e', '#16a34a', '#15803d', '#fbbf24', '#f59e0b', '#d97706', '#92400e']
                }
            }
        };
        
        // Default scheme if category not found
        const defaultScheme = {
            numeric: {
                colors: ['#f8fafc', '#cbd5e1', '#64748b', '#334155'],
                minColor: '#f8fafc',
                maxColor: '#334155'
            },
            categorical: {
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']
            }
        };
        
        return schemes[category] || defaultScheme;
    }
    
    // Enhanced multi-color interpolation with better color transitions
    interpolateMultiColor(ratio, colors) {
        // Interpolate between multiple colors for smoother gradients
        const segments = colors.length - 1;
        const segmentSize = 1 / segments;
        const segment = Math.min(Math.floor(ratio / segmentSize), segments - 1);
        const localRatio = (ratio - segment * segmentSize) / segmentSize;
        
        const color1 = colors[segment];
        const color2 = colors[segment + 1];
        
        // Ensure colors are strings and have the correct format
        if (typeof color1 !== 'string' || typeof color2 !== 'string') {
            console.warn('Invalid color format in multi-color interpolation:', { color1, color2 });
            return '#f8f9fa'; // Default fallback (light gray instead of white)
        }
        
        // Ensure colors start with #
        const normalizedColor1 = color1.startsWith('#') ? color1 : '#' + color1;
        const normalizedColor2 = color2.startsWith('#') ? color2 : '#' + color2;
        
        const r1 = parseInt(normalizedColor1.slice(1, 3), 16);
        const g1 = parseInt(normalizedColor1.slice(3, 5), 16);
        const b1 = parseInt(normalizedColor1.slice(5, 7), 16);
        
        const r2 = parseInt(normalizedColor2.slice(1, 3), 16);
        const g2 = parseInt(normalizedColor2.slice(3, 5), 16);
        const b2 = parseInt(normalizedColor2.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * localRatio);
        const g = Math.round(g1 + (g2 - g1) * localRatio);
        const b = Math.round(b1 + (b2 - b1) * localRatio);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    setupEventListeners() {
        // Submit guess button
        const submitBtn = document.getElementById('submitGuess');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmitGuess());
        }
        
        // Enter key in input
        const guessInput = document.getElementById('guessInput');
        if (guessInput) {
            guessInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSubmitGuess();
                }
            });
            
            // Input field input event for enabling/disabling submit button
            guessInput.addEventListener('input', () => {
                const hasValue = guessInput.value.trim().length > 0;
                submitBtn.disabled = !hasValue || this.isLearnMode;
            });
        }
        
        // Skip quiz button (if it exists)
        const skipBtn = document.getElementById('skipQuiz');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipQuiz());
        }
        
        // Copy data button
        const copyDataBtn = document.getElementById('copyData');
        if (copyDataBtn) {
            copyDataBtn.addEventListener('click', () => this.copyCurrentData());
        }
        
        const skipRightBtn = document.getElementById('skipRight');
        console.log('Setting up skipRightBtn event listener, found:', skipRightBtn);
        if (skipRightBtn) {
            skipRightBtn.addEventListener('click', () => {
                console.log('skipRightBtn clicked!');
                this.skipToNextQuestion();
            });
        }
        
        // Mode toggle button
        const modeToggleBtn = document.getElementById('modeToggle');
        if (modeToggleBtn) {
            modeToggleBtn.addEventListener('click', () => this.toggleMode());
        }
        
        // Dataset counter (opens browser)
        const datasetCounter = document.getElementById('datasetCounter');
        if (datasetCounter) {
            datasetCounter.addEventListener('click', () => this.openDatasetBrowser());
        }
        
        // Close dataset browser button
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
    }
    
    handleSubmitGuess() {
        // Only allow submissions in play mode
        if (this.isLearnMode) {
            return;
        }
        
        // If quiz is completed, restart the quiz
        if (this.isQuizCompleted) {
            this.restartQuiz();
            return;
        }
        
        const userGuess = document.getElementById('guessInput').value.trim();
        
        // If answer is already shown, skip to next question
        if (this.isAnswerShown) {
            this.skipToNextQuestion();
            return;
        }
        
        if (!userGuess) return;
        
        // Disable input and submit button
        const guessInput = document.getElementById('guessInput');
        const submitButton = document.getElementById('submitGuess');
        guessInput.disabled = true;
        submitButton.disabled = true;
        
        // Check if currentQuiz exists before accessing its properties
        if (!this.currentQuiz) {
            console.error('No current quiz available');
            this.transformToXIcon();
            return;
        }
        
        // Check the answer first
        const isCorrect = this.checkAnswer(userGuess);
        
        // Show the answer title with appropriate styling
        this.showAnswerTitle(isCorrect);
        this.isAnswerShown = true;
        
        if (isCorrect) {
            this.transformToCheckIcon();
            this.score++;
            this.updateScoreDisplay();
        } else {
            this.transformToXIcon();
        }
        
        // Store the result for progress bar update when moving to next question
        this.lastAnswerWasCorrect = isCorrect;
        
        // Show skip button for next question (only in learn mode)
        if (this.isLearnMode) {
            this.showSkipButton();
        } else {
            // In play mode, re-enable input for next question navigation
            const guessInput = document.getElementById('guessInput');
            const submitButton = document.getElementById('submitGuess');
            if (guessInput) {
                guessInput.disabled = false;
                guessInput.value = '';
                guessInput.placeholder = 'Enter to continue';
                guessInput.focus();
            }
            if (submitButton) {
                submitButton.disabled = false; // Enable send button for next question
            }
        }
    }
    
    showAnswerTitle(isCorrect = true) {
        const answerTitle = document.getElementById('answerTitle');
        const answerTitleText = document.getElementById('answerTitleText');
        const answerDescription = document.getElementById('answerDescription');
        
        if (this.currentQuiz && answerTitle && answerTitleText && answerDescription) {
            answerTitleText.textContent = this.currentQuiz.title;
            answerDescription.textContent = this.currentQuiz.description;
            answerTitle.style.display = 'block';
            
            // Set background color based on correct/incorrect
            if (isCorrect) {
                answerTitle.style.background = 'rgba(40, 167, 69, 0.1)';
                answerTitle.style.borderColor = 'rgba(40, 167, 69, 0.2)';
                answerTitleText.style.color = '#28a745';
            } else {
                answerTitle.style.background = 'rgba(220, 53, 69, 0.1)';
                answerTitle.style.borderColor = 'rgba(220, 53, 69, 0.2)';
                answerTitleText.style.color = '#dc3545';
            }
        }
    }
    
    hideAnswerTitle() {
        const answerTitle = document.getElementById('answerTitle');
        const answerTitleText = document.getElementById('answerTitleText');
        if (answerTitle) {
            answerTitle.style.display = 'none';
            // Reset styling
            answerTitle.style.background = '';
            answerTitle.style.borderColor = '';
            if (answerTitleText) {
                answerTitleText.style.color = '';
            }
        }
    }
    
    showSkipButton() {
        const skipRightBtn = document.getElementById('skipRight');
        if (skipRightBtn) {
            skipRightBtn.style.display = 'flex';
            skipRightBtn.disabled = false; // Ensure button is enabled
        }
    }
    
    hideSkipButton() {
        const skipRightBtn = document.getElementById('skipRight');
        if (skipRightBtn) {
            skipRightBtn.style.display = 'none';
        }
    }
    

    
    skipToNextQuestion() {
        // Reset button icon to arrow before moving to next question
        this.transformToArrowIcon();
        
        // Update progress bar with the result from the previous answer
        if (this.lastAnswerWasCorrect !== undefined) {
            this.updateProgressBar(this.lastAnswerWasCorrect);
            this.lastAnswerWasCorrect = undefined; // Reset for next question
        }
        
        if (this.isLearnMode) {
            // In learn mode, go to next dataset in sequence
            if (this.learnModeSequence.length === 0) {
                this.generateLearnModeSequence();
            }
            
            // Move to next index (with wraparound)
            this.learnModeCurrentIndex = (this.learnModeCurrentIndex + 1) % this.learnModeSequence.length;
            this.loadRandomDataset();
        } else {
            // In play mode, only proceed if not at the end
            if (this.currentProgress < 10) {
                this.startNewQuiz();
            } else {
                // If at the end, show completion in answer card
                this.showCompletionInAnswerCard();
            }
        }
    }
    
    generateLearnModeSequence() {
        if (!this.quizData || !this.quizData.quizzes) return;
        
        // Get all available datasets
        const availableDatasets = Object.values(this.quizData.quizzes);
        if (availableDatasets.length === 0) return;
        
        // Create a shuffled copy of all datasets
        this.learnModeSequence = [...availableDatasets];
        
        // Fisher-Yates shuffle for better randomization
        for (let i = this.learnModeSequence.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.learnModeSequence[i], this.learnModeSequence[j]] = [this.learnModeSequence[j], this.learnModeSequence[i]];
        }
        
        // Reset current index
        this.learnModeCurrentIndex = 0;
    }
    
    loadRandomDataset() {
        if (!this.quizData || !this.quizData.quizzes) return;
        
        // If no sequence exists, generate one
        if (this.learnModeSequence.length === 0) {
            this.generateLearnModeSequence();
        }
        
        // Get current dataset from sequence
        const currentDataset = this.learnModeSequence[this.learnModeCurrentIndex];
        
        // Load the dataset
        this.currentQuiz = currentDataset;
        
        // Apply random color variations to the quiz
        this.applyRandomColorVariations();
        
        // Apply quiz to map
        if (window.mapInstance && this.currentQuiz) {
            window.mapInstance.applyQuizConfiguration(this.currentQuiz);
        }
        
        // Update color bar with new quiz data
        this.updateColorBar();
        
        // Show the answer title in learn mode
        this.showAnswerTitle();
        
        // Reset answer shown flag for learn mode
        this.isAnswerShown = false;
        
        // Ensure skip buttons are still visible and enabled in learn mode
        if (this.isLearnMode) {
            this.showSkipButton();
        }
        

    }
    
    toggleMode() {
        this.isLearnMode = !this.isLearnMode;
        this.updateModeToggle();
        this.resetGame();
        
        if (this.isLearnMode) {
            // Generate a new sequence when entering learn mode
            this.generateLearnModeSequence();
            this.startLearnMode();
        } else {
            this.startPlayMode();
            // Refresh the map when switching back to play mode
            this.refreshMap();
        }
    }
    
    updateModeToggle() {
        const toggleBtn = document.getElementById('modeToggle');
        const toggleText = document.getElementById('modeToggleText');
        const toggleIcon = document.getElementById('modeToggleIcon');
        const progressBar = document.querySelector('.progress-bar');
        
        if (toggleBtn && toggleText && toggleIcon) {
                    if (this.isLearnMode) {
            toggleIcon.setAttribute('data-lucide', 'toggle-right');
            toggleText.textContent = 'Learn';
            toggleBtn.title = 'Switch to Play Mode';
            // Hide progress bar in learn mode
            if (progressBar) {
                progressBar.style.display = 'none';
            }
        } else {
            toggleIcon.setAttribute('data-lucide', 'toggle-left');
            toggleText.textContent = 'Play';
            toggleBtn.title = 'Switch to Learn Mode';
            // Show progress bar in play mode
            if (progressBar) {
                progressBar.style.display = 'flex';
            }
        }
            
            // Reinitialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
    
    resetGame() {
        this.score = 0;
        this.currentProgress = 0;
        this.usedQuizzes = new Set();
        this.hintUsed = false;
        this.totalQuizzesPlayed = 0;
        this.hideAnswerTitle();
        this.hideSkipButton();
        this.clearFeedback();
        this.resetProgressBar();
    }
    
    startLearnMode() {
        // Load the first dataset from the sequence
        this.loadRandomDataset();
        
        // Show answer title immediately in learn mode
        this.showAnswerTitle();
        this.showSkipButton();
        
        // Update input placeholder and state
        const guessInput = document.getElementById('guessInput');
        const submitButton = document.getElementById('submitGuess');
        
        if (guessInput) {
            guessInput.placeholder = 'Explore the data';
            guessInput.disabled = true;
            guessInput.value = '';
        }
        
        if (submitButton) {
            submitButton.style.display = 'none';
        }
    }
    
    startPlayMode() {
        // Hide answer title in play mode
        this.hideAnswerTitle();
        this.hideSkipButton();
        
        // Update input placeholder and state
        const guessInput = document.getElementById('guessInput');
        const submitButton = document.getElementById('submitGuess');
        
        if (guessInput) {
            guessInput.placeholder = 'Type a country name…';
            guessInput.disabled = false;
            guessInput.value = '';
            guessInput.focus();
        }
        
        if (submitButton) {
            submitButton.style.display = 'flex';
            submitButton.disabled = true; // Will be enabled when user types
        }
        
        // Ensure skip buttons are hidden in play mode
        this.hideSkipButton();
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
    
    refreshMap() {
        // Force a new quiz to be selected when switching back to play mode
        this.usedQuizzes.clear();
        this.currentProgress = 0;
        this.resetProgressBar();
        this.startNewQuiz();
    }
    
    populateDatasetList() {
        const listContainer = document.getElementById('datasetBrowserList');
        if (!listContainer || !this.quizData) return;
        
        // Create sorted list of datasets
        this.datasetList = Object.values(this.quizData.quizzes)
            .sort((a, b) => a.title.localeCompare(b.title));
        
        listContainer.innerHTML = '';
        
        this.datasetList.forEach((dataset, index) => {
            const datasetItem = document.createElement('div');
            datasetItem.className = 'dataset-item';
            datasetItem.innerHTML = `
                <div class="dataset-info">
                    <div class="dataset-title">${dataset.title}</div>
                    <div class="dataset-description">${dataset.description}</div>
                </div>
                <div class="dataset-category">${dataset.category}</div>
            `;
            
            // Highlight current dataset
            if (this.currentQuiz && this.currentQuiz.id === dataset.id) {
                datasetItem.classList.add('active');
            }
            
            datasetItem.addEventListener('click', () => {
                this.loadDataset(index);
                this.closeDatasetBrowser();
            });
            
            listContainer.appendChild(datasetItem);
        });
    }
    
    loadDataset(index) {
        if (index >= 0 && index < this.datasetList.length) {
            this.currentDatasetIndex = index;
            this.currentQuiz = this.datasetList[index];
            
            // Apply quiz to map
            if (window.mapInstance && this.currentQuiz) {
                window.mapInstance.applyQuizConfiguration(this.currentQuiz);
            }
            
            // Update color bar asynchronously to avoid blocking
            requestAnimationFrame(() => {
                this.updateColorBar();
            });
            
            // Show answer title in learn mode
            if (this.isLearnMode) {
                this.showAnswerTitle();
            }
            
            // Update active item in browser
            this.updateActiveDatasetInBrowser();
        }
    }
    
    loadLearnModeDataset() {
        if (this.learnModeSequence.length > 0 && this.learnModeCurrentIndex >= 0 && this.learnModeCurrentIndex < this.learnModeSequence.length) {
            this.currentQuiz = this.learnModeSequence[this.learnModeCurrentIndex];
            
            // Apply quiz to map
            if (window.mapInstance && this.currentQuiz) {
                window.mapInstance.applyQuizConfiguration(this.currentQuiz);
            }
            
            // Update color bar asynchronously to avoid blocking
            requestAnimationFrame(() => {
                this.updateColorBar();
            });
            
            // Show answer title in learn mode
            this.showAnswerTitle();
        }
    }
    
    updateActiveDatasetInBrowser() {
        const items = document.querySelectorAll('.dataset-item');
        items.forEach((item, index) => {
            item.classList.remove('active');
            if (index === this.currentDatasetIndex) {
                item.classList.add('active');
            }
        });
    }
    
    startNewQuiz() {
        // Clear feedback
        this.clearFeedback();
        
        // Reset answer shown flag
        this.isAnswerShown = false;
        
        // Handle mode-specific behavior
        if (this.isLearnMode) {
            // In learn mode, show answer immediately
            this.showAnswerTitle();
            this.showSkipButton();
            
            // Disable input in learn mode
            const guessInput = document.getElementById('guessInput');
            const submitButton = document.getElementById('submitGuess');
            
            guessInput.disabled = true;
            submitButton.style.display = 'none';
            guessInput.placeholder = 'Explore the data (click countries to see details)';
        } else if (this.gameMode === 'multiple') {
            // In multiple choice mode, show multiple choice options
            this.hideAnswerTitle();
            this.hideSkipButton();
            this.showMultipleChoice();
        } else {
            // In play mode, hide answer and enable input
            this.hideAnswerTitle();
            this.hideSkipButton();
            
            // Reset input and button for play mode (only if they exist)
            const guessInput = document.getElementById('guessInput');
            const submitButton = document.getElementById('submitGuess');
            
            if (guessInput && submitButton) {
                guessInput.disabled = false;
                submitButton.style.display = 'flex';
                submitButton.disabled = true; // Will be enabled when user types
                guessInput.value = '';
                guessInput.placeholder = 'What does this map show?';
                guessInput.focus();
            }
            
            // Ensure skip buttons are hidden in play mode
            this.hideSkipButton();
        }
        
        // Only reset progress bar if we're starting fresh (not just changing quiz)
        if (this.currentProgress === 0) {
            this.resetProgressBar();
        }
        
        // Select random quiz (optimized - no need for full shuffle)
        const quizIds = Object.keys(this.quizData.quizzes);
        if (quizIds.length === 0) {
            console.error('No quizzes available');
            return;
        }
        
        // Simple random selection (much faster than Fisher-Yates)
        const randomIndex = Math.floor(Math.random() * quizIds.length);
        const randomQuizId = quizIds[randomIndex];
        this.currentQuiz = this.quizData.quizzes[randomQuizId];
        
        // Apply random color variations to the quiz
        this.applyRandomColorVariations();
        
        // Apply quiz to map (optimized - minimal logging)
        if (window.mapInstance && this.currentQuiz) {
            window.mapInstance.applyQuizConfiguration(this.currentQuiz);
        }
        
        if (this.currentQuiz) {
            console.log('Started new quiz:', this.currentQuiz.title);
            
            // Update color bar asynchronously to avoid blocking
            requestAnimationFrame(() => {
                this.updateColorBar();
            });
            
            // Mark quiz as ready on first successful start
            if (!this.isReady) {
                this.isReady = true;
                window.quizInstance = this;
                console.log('🎯 Quiz system is now ready!');
            }
        } else {
            console.error('Failed to start new quiz');
        }
    }
    
    applyRandomColorVariations() {
        if (!this.currentQuiz || !this.currentQuiz.countries) return;
        
        // Define dramatic color schemes with high contrast and multi-color gradients
        const colorSchemes = [
            // Multi-color gradients for maximum visual distinction
            { colors: ['#ffffff', '#ffeb3b', '#ff9800', '#e91e63', '#8e24aa'] }, // White → Yellow → Orange → Pink → Purple
            { colors: ['#e8f5e8', '#4caf50', '#2196f3', '#3f51b5'] }, // Light Green → Green → Blue → Indigo
            { colors: ['#fff3e0', '#ff9800', '#f44336', '#9c27b0'] }, // Light Orange → Orange → Red → Purple
            { colors: ['#e1f5fe', '#00bcd4', '#009688', '#4caf50'] }, // Light Cyan → Cyan → Teal → Green
            { colors: ['#fce4ec', '#e91e63', '#9c27b0', '#673ab7'] }, // Light Pink → Pink → Purple → Deep Purple
            { colors: ['#fff8e1', '#ffc107', '#ff5722', '#795548'] }, // Light Amber → Amber → Deep Orange → Brown
            
            // High contrast two-color schemes
            { minColor: '#ffffff', maxColor: '#000000' }, // White to Black (maximum contrast)
            { minColor: '#ffebee', maxColor: '#b71c1c' }, // Light Pink to Dark Red
            { minColor: '#e8f5e8', maxColor: '#1b5e20' }, // Light Green to Dark Green  
            { minColor: '#e3f2fd', maxColor: '#0d47a1' }, // Light Blue to Dark Blue
            { minColor: '#fff3e0', maxColor: '#bf360c' }, // Light Orange to Dark Orange
            { minColor: '#f3e5f5', maxColor: '#4a148c' }, // Light Purple to Dark Purple
            
            // Contrasting color combinations
            { minColor: '#ffecb3', maxColor: '#1a237e' }, // Light Yellow to Dark Blue
            { minColor: '#c8e6c9', maxColor: '#7b1fa2' }, // Light Green to Purple
            { minColor: '#ffcdd2', maxColor: '#004d40' }, // Light Red to Dark Teal
            { minColor: '#d1c4e9', maxColor: '#e65100' }, // Light Purple to Dark Orange
            
            // Vibrant rainbow-style gradients
            { colors: ['#ff1744', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3'] }, // Red → Orange → Yellow → Green → Blue
            { colors: ['#e91e63', '#9c27b0', '#3f51b5', '#00bcd4', '#4caf50'] }, // Pink → Purple → Indigo → Cyan → Green
            { colors: ['#ff5722', '#ff9800', '#ffc107', '#8bc34a', '#009688'] }, // Deep Orange → Orange → Amber → Light Green → Teal
            { colors: ['#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4'] }  // Purple → Deep Purple → Indigo → Blue → Cyan
        ];
        
        // Randomly select a color scheme
        const selectedScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
        console.log('Selected color scheme:', selectedScheme);
        
        // Get all values for color scaling
        const values = Object.values(this.currentQuiz.countries).map(country => country.value).filter(val => !isNaN(val));
        
        if (values.length === 0) return;
        
        // Calculate color scale
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        
        // Apply colors based on values with selected scheme
        Object.keys(this.currentQuiz.countries).forEach(country => {
            const value = this.currentQuiz.countries[country].value;
            if (!isNaN(value)) {
                const ratio = (value - minValue) / (maxValue - minValue);
                const color = this.getColorForRatio(ratio, selectedScheme, null);
                this.currentQuiz.countries[country].color = color;
                if (color === '#ffffff') {
                    console.warn('Fallback color used for country:', country, 'with ratio:', ratio, 'and scheme:', selectedScheme);
                }
            }
        });
        
        // Update the quiz's color scheme
        this.currentQuiz.colorScheme = {
            type: 'gradient',
            minColor: selectedScheme.minColor || selectedScheme.colors[0],
            maxColor: selectedScheme.maxColor || selectedScheme.colors[selectedScheme.colors.length - 1],
            colors: selectedScheme.colors,
            minValue: Math.round(minValue * 100) / 100,
            maxValue: Math.round(maxValue * 100) / 100,
            defaultColor: '#ffffff'
        };
    }
    
    transformToCheckIcon() {
        const submitBtn = document.getElementById('submitGuess');
        if (submitBtn) {
            // Replace the SVG content with check icon
            const svg = submitBtn.querySelector('svg');
            if (svg) {
                svg.innerHTML = '<path d="M20 6 9 17l-5-5"></path>';
                svg.setAttribute('data-lucide', 'check');
            }
            
            // Change color to green
            submitBtn.style.color = '#28a745';
        }
    }
    
    transformToXIcon() {
        const submitBtn = document.getElementById('submitGuess');
        if (submitBtn) {
            // Replace the SVG content with X icon
            const svg = submitBtn.querySelector('svg');
            if (svg) {
                svg.innerHTML = '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>';
                svg.setAttribute('data-lucide', 'x');
            }
            
            // Change color to red
            submitBtn.style.color = '#dc3545';
        }
    }
    
    transformToArrowIcon() {
        const submitBtn = document.getElementById('submitGuess');
        if (submitBtn) {
            // Replace the SVG content with arrow-up icon
            const svg = submitBtn.querySelector('svg');
            if (svg) {
                svg.innerHTML = '<path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path>';
                svg.setAttribute('data-lucide', 'arrow-up');
            }
            
            // Reset color
            submitBtn.style.color = '';
        }
    }
    
    checkAnswer(userGuess) {
        if (!this.currentQuiz) return false;
        
        const normalizedGuess = userGuess.toLowerCase().trim();
        
        // Reject answers that are too short (less than 3 characters)
        if (normalizedGuess.length < 3) {
            return false;
        }
        
        const correctAnswers = this.currentQuiz.answer_variations.map(answer => 
            answer.toLowerCase().trim()
        );
        
        // Check for exact match first
        if (correctAnswers.includes(normalizedGuess)) {
            return true;
        }
        
        // Fuzzy matching with multiple strategies
        for (const correctAnswer of correctAnswers) {
            // Strategy 1: Check if user guess contains key words from correct answer
            const correctWords = correctAnswer.split(/\s+/).filter(word => word.length > 2);
            const userWords = normalizedGuess.split(/\s+/).filter(word => word.length > 2);
            
            // Only proceed if user has meaningful words
            if (userWords.length === 0) continue;
            
            let wordMatchCount = 0;
            for (const correctWord of correctWords) {
                for (const userWord of userWords) {
                    // Require at least 3 characters and 70% similarity for word matching
                    if (userWord.length >= 3 && correctWord.length >= 3) {
                        if (userWord.includes(correctWord) || correctWord.includes(userWord)) {
                            wordMatchCount++;
                            break;
                        }
                    }
                }
            }
            
            // Require at least 70% of key words to match (more strict)
            if (correctWords.length > 0 && wordMatchCount >= Math.ceil(correctWords.length * 0.7)) {
                return true;
            }
            
            // Strategy 2: Check for partial matches (but with minimum length requirements)
            if (normalizedGuess.length >= 4 && correctAnswer.length >= 4) {
                if (normalizedGuess.includes(correctAnswer) || correctAnswer.includes(normalizedGuess)) {
                    return true;
                }
            }
            
            // Strategy 3: Check for acronyms and abbreviations (minimum 2 characters)
            if (normalizedGuess.length >= 2 && this.checkAcronymMatch(normalizedGuess, correctAnswer)) {
                return true;
            }
            
            // Strategy 4: Check for common synonyms and variations
            if (this.checkSynonymMatch(normalizedGuess, correctAnswer)) {
                return true;
            }
        }
        
        return false;
    }
    
    checkAcronymMatch(userGuess, correctAnswer) {
        // Check if user guess is an acronym of the correct answer
        const words = correctAnswer.split(/\s+/);
        const acronym = words.map(word => word.charAt(0)).join('');
        
        return userGuess === acronym || userGuess === acronym.toLowerCase();
    }
    
    checkSynonymMatch(userGuess, correctAnswer) {
        // Require minimum length for synonym matching
        if (userGuess.length < 4) return false;
        
        // Common synonyms and variations
        const synonyms = {
            'population': ['people', 'inhabitants', 'residents', 'citizens', 'demographics'],
            'gdp': ['gross domestic product', 'economic output', 'economy', 'wealth'],
            'gni': ['gross national income', 'national income', 'income'],
            'hdi': ['human development index', 'development index', 'human development', 'development'],
            'area': ['land area', 'size', 'territory', 'landmass', 'surface'],
            'density': ['population density', 'crowding', 'people per km'],
            'fertility': ['birth rate', 'fertility rate', 'births per woman', 'reproduction'],
            'literacy': ['literacy rate', 'reading ability', 'education level', 'education'],
            'temperature': ['temp', 'climate', 'weather', 'heat', 'cold'],
            'water': ['water percentage', 'water coverage', 'water area', 'ocean', 'sea'],
            'arable': ['farmland', 'agricultural land', 'cultivable land', 'farming', 'agriculture'],
            'income': ['money', 'wealth', 'earnings', 'salary', 'wages'],
            'development': ['progress', 'advancement', 'growth'],
            'neighbours': ['borders', 'neighbors', 'adjacent countries', 'bordering'],
            'height': ['tallness', 'stature', 'elevation'],
            'age': ['median age', 'average age'],
            'islands': ['island count', 'archipelago'],
            'phones': ['mobile phones', 'cell phones', 'telecommunications'],
            'flag': ['national flag', 'country flag'],
            'monarchy': ['kings', 'queens', 'royalty', 'monarchs'],
            'exports': ['trade exports', 'international trade', 'commerce'],
            'imports': ['trade imports', 'international imports', 'commerce'],
            'military': ['army', 'armed forces', 'defense', 'soldiers'],
            'currency': ['money', 'exchange rate', 'forex'],
            'landlocked': ['no coastline', 'inland', 'no sea access'],
            'consumption': ['intake', 'usage', 'drinking', 'eating'],
            'production': ['manufacturing', 'output', 'making'],
            'wine': ['alcohol', 'beverages', 'viticulture'],
            'tea': ['beverages', 'drinks'],
            'food': ['nutrition', 'diet', 'calories', 'eating']
        };
        
        for (const [key, synonymList] of Object.entries(synonyms)) {
            if (correctAnswer.includes(key)) {
                for (const synonym of synonymList) {
                    // Require both strings to be at least 4 characters for synonym matching
                    if (synonym.length >= 4 && userGuess.length >= 4) {
                        if (userGuess.includes(synonym) || synonym.includes(userGuess)) {
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
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
            '❌ Incorrect! Try again or skip.',
            'incorrect'
        );
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
        feedback.className = `feedback ${type}`;
        
        // Update progress bar based on result
        if (type === 'correct') {
            this.updateProgressBar(true);
        } else if (type === 'incorrect') {
            this.updateProgressBar(false);
        }
    }
    
    updateProgressBar(isCorrect) {
        const circles = document.querySelectorAll('.progress-circle');
        if (this.currentProgress < circles.length) {
            // Update current circle with result
            const currentCircle = circles[this.currentProgress];
            currentCircle.classList.remove('current', 'empty', 'correct', 'wrong');
            currentCircle.classList.add(isCorrect ? 'correct' : 'wrong');
            
            // Move to next circle
            this.currentProgress++;
            
            // Check if we've completed all 10 questions
            if (this.currentProgress >= circles.length) {
                // Show completion in answer card
                this.showCompletionInAnswerCard();
                return;
            }
            
            // Update next circle to current if available
            if (this.currentProgress < circles.length) {
                const nextCircle = circles[this.currentProgress];
                nextCircle.classList.remove('correct', 'wrong', 'empty');
                nextCircle.classList.add('current');
                nextCircle.setAttribute('data-lucide', 'circle');
            }
            
            // Reinitialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
    
    resetProgressBar() {
        const circles = document.querySelectorAll('.progress-circle');
        this.currentProgress = 0;
        
        circles.forEach((circle, index) => {
            // Remove all classes first
            circle.classList.remove('current', 'correct', 'wrong', 'empty');
            
            if (index === 0) {
                circle.classList.add('current');
                circle.setAttribute('data-lucide', 'circle');
            } else {
                circle.classList.add('empty');
                circle.setAttribute('data-lucide', 'circle-dashed');
            }
        });
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    showCompletionInAnswerCard() {
        // Calculate final score
        const correctAnswers = document.querySelectorAll('.progress-circle.correct').length;
        const totalQuestions = 10;
        
        // Show completion message in the answer card
        const answerTitle = document.getElementById('answerTitle');
        const answerTitleText = document.getElementById('answerTitleText');
        const answerDescription = document.getElementById('answerDescription');
        
        if (answerTitle && answerTitleText && answerDescription) {
            answerTitleText.textContent = `${correctAnswers}/${totalQuestions} correct`;
            
            // Set a congratulatory message based on score with multiple variations
            const messages = {
                10: [
                    'Perfect score! Amazing geography knowledge!',
                    'Flawless performance! You truly know your world geography!',
                    'Outstanding! You nailed every single question!'
                ],
                8: [
                    'Excellent work! You really know your world geography!',
                    'Impressive performance! Your knowledge is outstanding!',
                    'Superb job! You clearly have strong geography skills!'
                ],
                6: [
                    'Great job! Your geography skills are impressive!',
                    'Well done! You have solid knowledge of world geography!',
                    'Nice work! You clearly understand global geography well!'
                ],
                4: [
                    'Good effort! Keep exploring to learn more!',
                    'Not bad! With more practice, you\'ll improve quickly!',
                    'Decent performance! Continue studying to boost your knowledge!'
                ],
                0: [
                    'Every expert was once a beginner. Keep learning!',
                    'Geography is challenging, but practice makes perfect!',
                    'Don\'t give up! Each attempt helps you learn something new!'
                ]
            };
            
            let messageArray;
            if (correctAnswers === totalQuestions) {
                messageArray = messages[10];
            } else if (correctAnswers >= 8) {
                messageArray = messages[8];
            } else if (correctAnswers >= 6) {
                messageArray = messages[6];
            } else if (correctAnswers >= 4) {
                messageArray = messages[4];
            } else {
                messageArray = messages[0];
            }
            
            // Pick a random message from the appropriate array
            const message = messageArray[Math.floor(Math.random() * messageArray.length)];
            
            answerDescription.textContent = message;
            answerTitle.style.display = 'block';
            
            // Set a nice blue color for completion
            answerTitle.style.background = 'rgba(33, 150, 243, 0.1)';
            answerTitle.style.borderColor = 'rgba(33, 150, 243, 0.2)';
            answerTitleText.style.color = '#1976d2';
        }
        
        // Update input placeholder to restart (enable input so Enter can restart)
        const guessInput = document.getElementById('guessInput');
        const submitButton = document.getElementById('submitGuess');
        if (guessInput) {
            guessInput.disabled = false; // Enable input so Enter can restart the quiz
            guessInput.value = '';
            guessInput.placeholder = 'Enter to restart';
            guessInput.focus();
        }
        if (submitButton) {
            submitButton.disabled = false;
        }
        
        // Mark quiz as completed
        this.isQuizCompleted = true;
    }
    

    
    showCompletionScreen(correctAnswers, totalQuestions) {
        // Clear any existing feedback
        this.clearFeedback();
        
        // Create completion container
        const completionContainer = document.createElement('div');
        completionContainer.className = 'completion-screen';
        completionContainer.innerHTML = `
            <div class="completion-content">
                <h2>Quiz Complete!</h2>
                <p class="score-text">${correctAnswers}/${totalQuestions} correct</p>
                <div class="completion-buttons">
                    <button class="completion-btn play-again-btn" id="playAgainBtn">
                        <i data-lucide="rotate-ccw"></i>
                        <span>Play Again</span>
                    </button>
                    <button class="completion-btn share-btn" id="shareBtn">
                        <i data-lucide="square-arrow-out-up-right"></i>
                        <span>Share Result</span>
                    </button>
                </div>
            </div>
        `;
        
        // Add to the main container
        const appContainer = document.querySelector('.app-container');
        appContainer.appendChild(completionContainer);
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Add event listeners
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartQuiz();
        });
        
        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareResult(correctAnswers, totalQuestions);
        });
    }
    
    shareResult(correctAnswers, totalQuestions) {
        const text = `I scored ${correctAnswers}/${totalQuestions} on the Geography Quiz! 🌍`;
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: 'Geography Quiz Result',
                text: text,
                url: url
            });
        } else {
            // Fallback: copy to clipboard
            const shareText = `${text}\n${url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                // Show temporary feedback
                const shareBtn = document.getElementById('shareBtn');
                const originalText = shareBtn.innerHTML;
                shareBtn.innerHTML = '<i data-lucide="check"></i><span>Copied!</span>';
                
                setTimeout(() => {
                    shareBtn.innerHTML = originalText;
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }, 2000);
            });
        }
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        
        // Get UI elements
        const inputContainer = document.querySelector('.input-container');
        
        if (mode === 'learn') {
            this.isLearnMode = true;
            // Reset progress and start fresh
            this.resetGameState();
            this.initializeLearnModeSequence();
            this.showLearnModeControls();
        } else if (mode === 'play') {
            // Reset progress and start fresh
            this.resetGameState();
            // Restore normal input container
            inputContainer.innerHTML = `
                <input type="text" id="guessInput" placeholder="Type your answer here" class="guess-input">
                <button id="submitGuess" class="submit-btn" aria-label="Send" disabled>
                    <i data-lucide="send"></i>
                </button>
            `;
            
            // Re-initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            // Re-add event listeners
            this.setupEventListeners();
            this.isLearnMode = false;
            // Start a new quiz
            this.startNewQuiz();
        } else if (mode === 'multiple') {
            this.isLearnMode = false;
            // Reset progress and start fresh
            this.resetGameState();
            // Clear the input container first
            inputContainer.innerHTML = '';
            // Start a new quiz
            this.startNewQuiz();
            // Show multiple choice directly
            this.showMultipleChoice();
        }
        
        // Update color bar when mode changes
        this.updateColorBar();
        
        console.log(`🎮 Game mode set to: ${mode}`);
    }
    
    resetGameState() {
        // Reset quiz state
        this.score = 0;
        this.streak = 0;
        this.isAnswerShown = false;
        this.isQuizCompleted = false;
        
        // Clear feedback
        const feedback = document.getElementById('guessFeedback');
        if (feedback) {
            feedback.innerHTML = '';
            feedback.className = 'feedback';
        }
        
        // Reset progress circles
        this.resetProgressBar();
        
        // Start a new quiz
        this.startNewQuiz();
    }
    
    // Method to reset game when user explicitly wants to start over
    restartGame() {
        this.resetGameState();
    }
    
    
    initializeLearnModeSequence() {
        // Initialize learn mode sequence if not already done
        if (this.learnModeSequence.length === 0 && this.datasetList.length > 0) {
            this.learnModeSequence = [...this.datasetList];
            
            // Fisher-Yates shuffle for better randomization
            for (let i = this.learnModeSequence.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.learnModeSequence[i], this.learnModeSequence[j]] = [this.learnModeSequence[j], this.learnModeSequence[i]];
            }
            
            // Reset current index
            this.learnModeCurrentIndex = 0;
        }
        
        // Load the first dataset in learn mode
        if (this.learnModeSequence.length > 0) {
            this.loadLearnModeDataset();
        }
    }
    
    showLearnModeControls() {
        // Replace input container content with learn mode controls
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
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Add event listeners to navigation buttons
        const nextBtn = document.getElementById('nextQuizBtn');
        const prevBtn = document.getElementById('prevQuizBtn');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                console.log('🔄 Next button clicked');
                this.nextQuestion();
                this.updateLearnModeTitle();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                console.log('🔄 Previous button clicked');
                this.previousQuestion();
                this.updateLearnModeTitle();
            });
        }
    }
    
    updateLearnModeTitle() {
        const titleElement = document.getElementById('currentDatasetTitle');
        if (titleElement && this.currentQuiz) {
            titleElement.textContent = this.currentQuiz.title;
        }
    }
    
    showMultipleChoice() {
        // Create multiple choice options - show dataset titles
        console.log('🎯 showMultipleChoice called');
        
        if (!this.currentQuiz) {
            console.log('❌ No current quiz for multiple choice, starting new quiz');
            this.startNewQuiz();
            return;
        }
        
        if (!this.datasetList || this.datasetList.length < 4) {
            console.log('❌ Not enough datasets for multiple choice:', this.datasetList?.length);
            // Show a loading message and try to load datasets
            const loadingContainer = document.querySelector('.input-container');
            if (loadingContainer) {
                loadingContainer.innerHTML = `
                    <div class="multiple-choice">
                        <h3>Loading datasets...</h3>
                        <p>Please wait while we load the datasets.</p>
                    </div>
                `;
            }
            
            // Create fallback options if no datasets
            console.log('🎯 Creating fallback multiple choice options');
            const fallbackContainer = document.querySelector('.input-container');
            if (fallbackContainer) {
                fallbackContainer.innerHTML = `
                    <div class="multiple-choice">
                        <div class="choice-options">
                            <button class="choice-btn" data-answer="Population">Population</button>
                            <button class="choice-btn" data-answer="GDP">GDP</button>
                            <button class="choice-btn" data-answer="Area">Area</button>
                            <button class="choice-btn" data-answer="Oil Production">Oil Production</button>
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
            return;
        }
        
        const correctDataset = this.currentQuiz.title;
        
        // Get 3 random wrong datasets from the dataset list
        const wrongDatasets = this.datasetList
            .filter(dataset => dataset.title !== correctDataset)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        console.log('🎯 Dataset list length:', this.datasetList.length);
        console.log('🎯 Wrong datasets found:', wrongDatasets.length);
        console.log('🎯 Wrong datasets:', wrongDatasets.map(d => d.title));
        
        // Create options array with correct answer
        const options = [correctDataset, ...wrongDatasets.map(d => d.title)].sort(() => Math.random() - 0.5);
        
        console.log('🎯 Multiple choice options:', options);
        console.log('🎯 Correct answer:', correctDataset);
        console.log('🎯 Total options:', options.length);
        
        // Replace input container content with multiple choice
        const inputContainer = document.querySelector('.input-container');
        if (!inputContainer) {
            console.log('❌ Input container not found!');
            return;
        }
        
        console.log('🎯 Input container found, proceeding with HTML generation');
        
        const htmlContent = `
            <div class="multiple-choice">
                <div class="choice-options-container">
                    <div class="choice-options">
                        ${options.map((option, index) => `
                            <button class="choice-btn" data-answer="${option}">
                                ${option}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        console.log('🎯 Generated HTML:', htmlContent);
        console.log('🎯 Number of buttons in HTML:', (htmlContent.match(/choice-btn/g) || []).length);
        
        inputContainer.innerHTML = htmlContent;
        
        // Force a simple test if no buttons are created
        setTimeout(() => {
            const testButtons = document.querySelectorAll('.choice-btn');
            if (testButtons.length === 0) {
                console.log('❌ No buttons created, showing fallback');
                inputContainer.innerHTML = `
                    <div class="multiple-choice">
                        <div class="choice-options">
                            <button class="choice-btn" data-answer="Option 1">Option 1</button>
                            <button class="choice-btn" data-answer="Option 2">Option 2</button>
                            <button class="choice-btn" data-answer="Option 3">Option 3</button>
                            <button class="choice-btn" data-answer="Option 4">Option 4</button>
                        </div>
                    </div>
                `;
            }
        }, 100);
        
        // Debug: Check how many buttons were actually created
        const actualButtons = document.querySelectorAll('.choice-btn');
        console.log('🎯 Actual buttons found in DOM:', actualButtons.length);
        console.log('🎯 Button elements:', actualButtons);
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Add event listeners to choice buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedAnswer = e.target.dataset.answer;
                this.handleMultipleChoiceAnswer(selectedAnswer);
            });
        });
        
    }
    
    handleMultipleChoiceAnswer(selectedAnswer) {
        const correctAnswer = this.currentQuiz.title;
        const isCorrect = selectedAnswer === correctAnswer;
        
        console.log('🎯 Multiple choice answer:', selectedAnswer);
        console.log('🎯 Correct answer:', correctAnswer);
        console.log('🎯 Is correct:', isCorrect);
        
        // Disable all buttons to prevent multiple clicks
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Show visual feedback on buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            const answer = btn.dataset.answer;
            if (answer === correctAnswer) {
                btn.classList.add('correct');
            } else if (answer === selectedAnswer && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        // Update progress
        this.updateProgressBar(isCorrect);
        
        // Auto-advance to next question after 2 seconds
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
    
    nextQuestion() {
        if (this.isLearnMode) {
            // In learn mode, go to next dataset in sequence (circular)
            this.learnModeCurrentIndex = (this.learnModeCurrentIndex + 1) % this.learnModeSequence.length;
            this.loadLearnModeDataset();
        } else {
            // In other modes, start a new random quiz
            this.startNewQuiz();
        }
    }
    
    previousQuestion() {
        if (this.isLearnMode) {
            // In learn mode, go to previous dataset in sequence (circular)
            this.learnModeCurrentIndex = (this.learnModeCurrentIndex - 1 + this.learnModeSequence.length) % this.learnModeSequence.length;
            this.loadLearnModeDataset();
        } else {
            // In other modes, start a new random quiz
            this.startNewQuiz();
        }
    }
    
    updateColorBar() {
        if (!this.currentQuiz) {
            console.log('❌ updateColorBar: No current quiz');
            return;
        }
        
        // Reduced logging for performance
        
        const colorBarGradient = document.getElementById('colorBarGradient');
        const colorBarMin = document.getElementById('colorBarMin');
        const colorBarQ1 = document.getElementById('colorBarQ1');
        const colorBarMid = document.getElementById('colorBarMid');
        const colorBarQ3 = document.getElementById('colorBarQ3');
        const colorBarMax = document.getElementById('colorBarMax');
        
        // Reduced logging for performance
        
        if (colorBarGradient && this.currentQuiz.colorScheme) {
            const scheme = this.currentQuiz.colorScheme;
            // Reduced logging for performance
            
            if (scheme.type === 'gradient' && scheme.colors) {
                const colorStops = scheme.colors.map((color, index) => {
                    const percentage = (index / (scheme.colors.length - 1)) * 100;
                    return `${color} ${percentage}%`;
                }).join(', ');
                colorBarGradient.style.background = `linear-gradient(to right, ${colorStops})`;
                // Reduced logging for performance
            } else if (scheme.minColor && scheme.maxColor) {
                colorBarGradient.style.background = `linear-gradient(to right, ${scheme.minColor}, ${scheme.maxColor})`;
                // Reduced logging for performance
            }
        } else {
            // Reduced logging for performance
        }
        
        if (this.currentQuiz.countries) {
            const values = Object.values(this.currentQuiz.countries).map(c => c.value).filter(v => !isNaN(v));
            // Reduced logging for performance
            
            if (values.length > 0) {
                const sortedValues = values.sort((a, b) => a - b);
                const unit = Object.values(this.currentQuiz.countries)[0]?.unit || '';
                
                // Calculate quartiles
                const minValue = sortedValues[0];
                const maxValue = sortedValues[sortedValues.length - 1];
                const q1Index = Math.floor(sortedValues.length * 0.25);
                const midIndex = Math.floor(sortedValues.length * 0.5);
                const q3Index = Math.floor(sortedValues.length * 0.75);
                
                const q1Value = sortedValues[q1Index];
                const midValue = sortedValues[midIndex];
                const q3Value = sortedValues[q3Index];
                
                // Reduced logging for performance
                
                // Update labels (without units to avoid spoiling quiz)
                if (colorBarMin) colorBarMin.textContent = this.formatValue(minValue, '');
                if (colorBarQ1) colorBarQ1.textContent = this.formatValue(q1Value, '');
                if (colorBarMid) colorBarMid.textContent = this.formatValue(midValue, '');
                if (colorBarQ3) colorBarQ3.textContent = this.formatValue(q3Value, '');
                if (colorBarMax) colorBarMax.textContent = this.formatValue(maxValue, '');
                
                // Reduced logging for performance
            } else {
                // Reduced logging for performance
            }
        } else {
            // Reduced logging for performance
        }
    }
    
    formatValue(value, unit) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M' + (unit ? ' ' + unit : '');
        } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K' + (unit ? ' ' + unit : '');
        } else {
            return value.toFixed(1) + (unit ? ' ' + unit : '');
        }
    }
    
    restartQuiz() {
        // Remove completion screen if it exists
        const completionScreen = document.querySelector('.completion-screen');
        if (completionScreen) {
            completionScreen.remove();
        }
        
        // Reset all quiz state variables
        this.isQuizCompleted = false;
        this.isAnswerShown = false;
        this.currentProgress = 0;
        this.score = 0;
        this.lastAnswerWasCorrect = undefined;
        
        // Reset progress bar
        this.resetProgressBar();
        
        // Clear feedback
        this.clearFeedback();
        
        // Hide answer title
        this.hideAnswerTitle();
        
        // Reset button icon
        this.transformToArrowIcon();
        
        // Re-enable input and button
        const guessInput = document.getElementById('guessInput');
        const submitButton = document.getElementById('submitGuess');
        if (guessInput) {
            guessInput.disabled = false;
            guessInput.value = '';
            guessInput.placeholder = 'What does this map show?';
            guessInput.focus();
        }
        if (submitButton) {
            submitButton.disabled = false;
        }
        
        // Start new quiz
        this.startNewQuiz();
    }
    
    updateDatasetCounter() {
        const datasetCountElement = document.getElementById('datasetCount');
        if (datasetCountElement) {
            const totalQuizzes = Object.keys(this.quizData.quizzes).length;
            datasetCountElement.textContent = totalQuizzes;
            console.log('📊 Updated dataset counter to:', totalQuizzes, 'datasets');
        }
    }
    
    clearFeedback() {
        const feedback = document.getElementById('guessFeedback');
        feedback.textContent = '';
        feedback.className = 'feedback';
    }
    
    updateScoreDisplay() {
        // In minimalistic design, we don't show score/stats
        // This method is kept for potential future use
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
            'agriculture': '🌾',
            'politics': '🏛️'
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
    
    // New dataset conversion functions
    async convertFemaleHeightData() {
        try {
            const response = await fetch('data/female_average_height_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.keys(data.data).forEach(country => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                const value = data.data[country].value;
                
                if (typeof value === 'number') {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: data.data[country].unit
                    };
                    values.push(value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#e91e63');
            });
            
            return {
                id: 'female_average_height',
                title: 'Female Average Height',
                description: 'Countries colored by average female height',
                category: 'demographics',
                tags: ['height', 'female', 'demographics', 'anthropometry', 'women', 'stature'],
                answer_variations: [
                    'female height',
                    'women height',
                    'average female height',
                    'female average height',
                    'women average height',
                    'female stature',
                    'women stature'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fce4ec',
                    maxColor: '#c2185b',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting female height data:', error);
            return null;
        }
    }
    
    async convertAcademyAwardsData() {
        try {
            const response = await fetch('data/academy_awards_best_international_feature_film_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.keys(data.data).forEach(country => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                const value = data.data[country].value;
                
                if (typeof value === 'number') {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: data.data[country].unit
                    };
                    values.push(value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#ffd700');
            });
            
            return {
                id: 'academy_awards',
                title: 'Academy Awards for Best International Feature Film',
                description: 'Countries colored by number of Academy Awards won',
                category: 'culture',
                tags: ['academy awards', 'oscars', 'movies', 'film', 'international', 'cinema'],
                answer_variations: [
                    'academy awards',
                    'oscars',
                    'international feature film',
                    'best international film',
                    'academy awards international',
                    'oscar wins',
                    'film awards'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fff8e1',
                    maxColor: '#f57f17',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting academy awards data:', error);
            return null;
        }
    }
    
    async convertWinterOlympicGoldData() {
        try {
            const response = await fetch('data/winter_olympic_gold_medals_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.keys(data.data).forEach(country => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                const value = data.data[country].value;
                
                if (typeof value === 'number') {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: data.data[country].unit
                    };
                    values.push(value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#ffd700');
            });
            
            return {
                id: 'winter_olympic_gold',
                title: 'Winter Olympic Gold Medals',
                description: 'Countries colored by number of Winter Olympic gold medals',
                category: 'sports',
                tags: ['winter olympics', 'gold medals', 'olympics', 'sports', 'winter sports'],
                answer_variations: [
                    'winter olympic gold medals',
                    'winter olympics gold',
                    'winter olympic medals',
                    'winter sports medals',
                    'olympic gold medals winter',
                    'winter olympics'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fff8e1',
                    maxColor: '#f57f17',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting winter olympic gold data:', error);
            return null;
        }
    }
    
    async convertSummerOlympicBronzeData() {
        try {
            const response = await fetch('data/summer_olympic_bronze_medals_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.keys(data.data).forEach(country => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                const value = data.data[country].value;
                
                if (typeof value === 'number') {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: data.data[country].unit
                    };
                    values.push(value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#cd7f32');
            });
            
            return {
                id: 'summer_olympic_bronze',
                title: 'Summer Olympic Bronze Medals',
                description: 'Countries colored by number of Summer Olympic bronze medals',
                category: 'sports',
                tags: ['summer olympics', 'bronze medals', 'olympics', 'sports'],
                answer_variations: [
                    'summer olympic bronze medals',
                    'summer olympics bronze',
                    'olympic bronze medals',
                    'summer olympic medals',
                    'olympics bronze',
                    'summer olympics'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fff3e0',
                    maxColor: '#e65100',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting summer olympic bronze data:', error);
            return null;
        }
    }
    
    async convertSummerOlympicSilverData() {
        try {
            const response = await fetch('data/summer_olympic_silver_medals_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.keys(data.data).forEach(country => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                const value = data.data[country].value;
                
                if (typeof value === 'number') {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: data.data[country].unit
                    };
                    values.push(value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#c0c0c0');
            });
            
            return {
                id: 'summer_olympic_silver',
                title: 'Summer Olympic Silver Medals',
                description: 'Countries colored by number of Summer Olympic silver medals',
                category: 'sports',
                tags: ['summer olympics', 'silver medals', 'olympics', 'sports'],
                answer_variations: [
                    'summer olympic silver medals',
                    'summer olympics silver',
                    'olympic silver medals',
                    'summer olympic medals',
                    'olympics silver',
                    'summer olympics'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#f5f5f5',
                    maxColor: '#757575',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting summer olympic silver data:', error);
            return null;
        }
    }
    
    async convertSummerOlympicGoldData() {
        try {
            const response = await fetch('data/summer_olympic_gold_medals_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.keys(data.data).forEach(country => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                const value = data.data[country].value;
                
                if (typeof value === 'number') {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: data.data[country].unit
                    };
                    values.push(value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#ffd700');
            });
            
            return {
                id: 'summer_olympic_gold',
                title: 'Summer Olympic Gold Medals',
                description: 'Countries colored by number of Summer Olympic gold medals',
                category: 'sports',
                tags: ['summer olympics', 'gold medals', 'olympics', 'sports'],
                answer_variations: [
                    'summer olympic gold medals',
                    'summer olympics gold',
                    'olympic gold medals',
                    'summer olympic medals',
                    'olympics gold',
                    'summer olympics'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fff8e1',
                    maxColor: '#f57f17',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting summer olympic gold data:', error);
            return null;
        }
    }
    
    async convertNobelLiteratureData() {
        try {
            const response = await fetch('data/nobel_literature_laureates_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.keys(data.data).forEach(country => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                const value = data.data[country].value;
                
                if (typeof value === 'number') {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: data.data[country].unit
                    };
                    values.push(value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#9c27b0');
            });
            
            return {
                id: 'nobel_literature',
                title: 'Nobel Literature Laureates',
                description: 'Countries colored by number of Nobel Literature laureates',
                category: 'culture',
                tags: ['nobel prize', 'literature', 'laureates', 'books', 'authors', 'writing'],
                answer_variations: [
                    'nobel literature',
                    'nobel prize literature',
                    'nobel literature laureates',
                    'literature nobel',
                    'nobel prize authors',
                    'literature laureates'
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
            console.error('Error converting nobel literature data:', error);
            return null;
        }
    }
    
    async convertWorldCupWinsData() {
        try {
            const response = await fetch('data/world_cup_wins_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.keys(data.data).forEach(country => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                const value = data.data[country].value;
                
                if (typeof value === 'number') {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: data.data[country].unit
                    };
                    values.push(value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#4caf50');
            });
            
            return {
                id: 'world_cup_wins',
                title: 'FIFA World Cup Wins',
                description: 'Countries colored by number of FIFA World Cup titles',
                category: 'sports',
                tags: ['world cup', 'fifa', 'soccer', 'football', 'world cup wins', 'football titles'],
                answer_variations: [
                    'world cup wins',
                    'fifa world cup',
                    'world cup titles',
                    'football world cup',
                    'soccer world cup',
                    'fifa titles'
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
            console.error('Error converting world cup wins data:', error);
            return null;
        }
    }
    
    async convertAgeOfConsentData() {
        try {
            const response = await fetch('data/age_of_consent_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.keys(data.data).forEach(country => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                const value = data.data[country].value;
                
                if (typeof value === 'number') {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: data.data[country].unit
                    };
                    values.push(value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#ff5722');
            });
            
            return {
                id: 'age_of_consent',
                title: 'Age of Consent by Country',
                description: 'Countries colored by age of consent for sexual activity',
                category: 'social',
                tags: ['age of consent', 'legal age', 'social', 'law', 'legal'],
                answer_variations: [
                    'age of consent',
                    'legal age',
                    'consent age',
                    'age of consent law',
                    'legal consent age',
                    'sexual consent age'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#ffebee',
                    maxColor: '#c62828',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting age of consent data:', error);
            return null;
        }
    }
    
    async convertPopulationPerSeatData() {
        try {
            const response = await fetch('data/population_per_lower_house_seat_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.keys(data.data).forEach(country => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                const value = data.data[country].value;
                
                if (typeof value === 'number') {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: data.data[country].unit
                    };
                    values.push(value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#3f51b5');
            });
            
            return {
                id: 'population_per_seat',
                title: 'Population per Lower House Seat',
                description: 'Countries colored by population per lower house seat',
                category: 'politics',
                tags: ['population', 'parliament', 'legislature', 'representation', 'politics', 'government'],
                answer_variations: [
                    'population per seat',
                    'population per lower house seat',
                    'parliament representation',
                    'legislative representation',
                    'population per representative',
                    'parliament seats population'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e8eaf6',
                    maxColor: '#303f9f',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting population per seat data:', error);
            return null;
        }
    }
    
    async convertLowerHouseSeatsData() {
        try {
            const response = await fetch('data/lower_house_seats_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.keys(data.data).forEach(country => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                const value = data.data[country].value;
                
                if (typeof value === 'number') {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: data.data[country].unit
                    };
                    values.push(value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#3f51b5');
            });
            
            return {
                id: 'lower_house_seats',
                title: 'Lower House Seats by Country',
                description: 'Countries colored by number of lower house seats',
                category: 'politics',
                tags: ['parliament', 'legislature', 'seats', 'politics', 'government', 'lower house'],
                answer_variations: [
                    'lower house seats',
                    'parliament seats',
                    'legislative seats',
                    'lower house',
                    'parliament',
                    'legislature seats'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e8eaf6',
                    maxColor: '#303f9f',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting lower house seats data:', error);
            return null;
        }
    }
    
    async convertNavalAssetsData() {
        try {
            const response = await fetch('data/total_naval_assets_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.keys(data.data).forEach(country => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                const value = data.data[country].value;
                
                if (typeof value === 'number') {
                    countries[mappedCountryName] = {
                        value: value,
                        unit: data.data[country].unit
                    };
                    values.push(value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#2196f3');
            });
            
            return {
                id: 'naval_assets',
                title: 'Total Naval Assets by Country',
                description: 'Countries colored by total naval assets',
                category: 'military',
                tags: ['naval', 'military', 'navy', 'ships', 'naval assets', 'defense'],
                answer_variations: [
                    'naval assets',
                    'total naval assets',
                    'navy ships',
                    'naval fleet',
                    'military ships',
                    'naval vessels'
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
            console.error('Error converting naval assets data:', error);
            return null;
        }
    }
    
    // New conversion methods for all the new datasets
    
    async convertAlcoholConsumptionData() {
        try {
            const response = await fetch('data/alcohol_consumption_per_capita_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('social', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'alcohol_consumption_per_capita',
                title: 'Alcohol Consumption Per Capita',
                description: 'Annual consumption of pure alcohol in liters per person aged 15 and over',
                category: 'social',
                tags: ['alcohol', 'consumption', 'beverages', 'social', 'drinking'],
                answer_variations: [
                    'alcohol consumption',
                    'alcohol consumption per capita',
                    'alcohol drinking',
                    'alcohol intake',
                    'alcohol consumption per person'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fdf4ff', '#f3e8ff', '#c084fc', '#9333ea'],
                    minColor: '#fdf4ff',
                    maxColor: '#9333ea',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting alcohol consumption data:', error);
            return null;
        }
    }
    
    async convertCoffeeConsumptionData() {
        try {
            const response = await fetch('data/coffee_consumption_per_capita_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('social', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'coffee_consumption_per_capita',
                title: 'Coffee Consumption Per Capita',
                description: 'Annual coffee consumption per capita in kilograms',
                category: 'social',
                tags: ['coffee', 'consumption', 'beverages', 'social', 'drinking'],
                answer_variations: [
                    'coffee consumption',
                    'coffee consumption per capita',
                    'coffee drinking',
                    'coffee intake',
                    'coffee consumption per person'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fdf4ff', '#f3e8ff', '#c084fc', '#9333ea'],
                    minColor: '#fdf4ff',
                    maxColor: '#9333ea',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting coffee consumption data:', error);
            return null;
        }
    }
    
    async convertUEFAChampionsWinnersData() {
        try {
            const response = await fetch('data/uefa_champions_league_winners_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('sports', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'uefa_champions_league_winners',
                title: 'UEFA Champions League Winners',
                description: 'Number of UEFA Champions League and European Cup titles won by clubs from each nation',
                category: 'sports',
                tags: ['uefa', 'champions league', 'soccer', 'football', 'european cup', 'sports'],
                answer_variations: [
                    'uefa champions league winners',
                    'champions league winners',
                    'european cup winners',
                    'uefa titles',
                    'champions league titles'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fff7ed', '#fed7aa', '#fb923c', '#ea580c'],
                    minColor: '#fff7ed',
                    maxColor: '#ea580c',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting UEFA Champions League winners data:', error);
            return null;
        }
    }
    
    async convertUEFAChampionsRunnersUpData() {
        try {
            const response = await fetch('data/uefa_champions_league_runners_up_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('sports', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'uefa_champions_league_runners_up',
                title: 'UEFA Champions League Runners Up',
                description: 'Number of UEFA Champions League and European Cup runner-up finishes by clubs from each nation',
                category: 'sports',
                tags: ['uefa', 'champions league', 'soccer', 'football', 'european cup', 'sports', 'runners up'],
                answer_variations: [
                    'uefa champions league runners up',
                    'champions league runners up',
                    'european cup runners up',
                    'uefa second place',
                    'champions league second place'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fff7ed', '#fed7aa', '#fb923c', '#ea580c'],
                    minColor: '#fff7ed',
                    maxColor: '#ea580c',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting UEFA Champions League runners up data:', error);
            return null;
        }
    }
    
    async convertSoccerPlayersData() {
        try {
            const response = await fetch('data/soccer_players_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('sports', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'soccer_players_by_country',
                title: 'Soccer Players by Country',
                description: 'Number of professional soccer players from each country',
                category: 'sports',
                tags: ['soccer', 'football', 'players', 'sports', 'athletes'],
                answer_variations: [
                    'soccer players',
                    'football players',
                    'professional soccer players',
                    'soccer athletes',
                    'football athletes'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fff7ed', '#fed7aa', '#fb923c', '#ea580c'],
                    minColor: '#fff7ed',
                    maxColor: '#ea580c',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting soccer players data:', error);
            return null;
        }
    }
    
    async convertFIFARankingData() {
        try {
            const response = await fetch('data/fifa_mens_world_ranking.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('sports', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'fifa_mens_world_ranking',
                title: 'FIFA Men\'s World Ranking',
                description: 'FIFA men\'s national team world ranking positions',
                category: 'sports',
                tags: ['fifa', 'soccer', 'football', 'ranking', 'sports', 'national team'],
                answer_variations: [
                    'fifa ranking',
                    'fifa world ranking',
                    'soccer ranking',
                    'football ranking',
                    'fifa men\'s ranking'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fff7ed', '#fed7aa', '#fb923c', '#ea580c'],
                    minColor: '#fff7ed',
                    maxColor: '#ea580c',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting FIFA ranking data:', error);
            return null;
        }
    }
    
    async convertSexRatioData() {
        try {
            const response = await fetch('data/sex_ratio_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('demographics', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'sex_ratio_by_country',
                title: 'Sex Ratio by Country',
                description: 'Ratio of males to females in the population',
                category: 'demographics',
                tags: ['sex ratio', 'gender ratio', 'demographics', 'population', 'males to females'],
                answer_variations: [
                    'sex ratio',
                    'gender ratio',
                    'male to female ratio',
                    'population sex ratio',
                    'demographic sex ratio'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fef3c7', '#fbbf24', '#f59e0b', '#d97706'],
                    minColor: '#fef3c7',
                    maxColor: '#d97706',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting sex ratio data:', error);
            return null;
        }
    }
    
    async convertMaximumElevationData() {
        try {
            const response = await fetch('data/maximum_elevation_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('geography', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'maximum_elevation_by_country',
                title: 'Maximum Elevation by Country',
                description: 'Highest point elevation in each country',
                category: 'geography',
                tags: ['elevation', 'mountains', 'highest point', 'geography', 'terrain'],
                answer_variations: [
                    'maximum elevation',
                    'highest point',
                    'highest elevation',
                    'mountain height',
                    'peak elevation'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#f0f8ff', '#87ceeb', '#4682b4', '#1e3a8a'],
                    minColor: '#f0f8ff',
                    maxColor: '#1e3a8a',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting maximum elevation data:', error);
            return null;
        }
    }
    
    async convertNationalCapitalsData() {
        try {
            const response = await fetch('data/national_capitals_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('geography', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'national_capitals_by_country',
                title: 'National Capitals by Country',
                description: 'Capital cities of each country',
                category: 'geography',
                tags: ['capitals', 'cities', 'geography', 'government', 'national capitals'],
                answer_variations: [
                    'national capitals',
                    'capital cities',
                    'capitals',
                    'government capitals',
                    'country capitals'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#f0f8ff', '#87ceeb', '#4682b4', '#1e3a8a'],
                    minColor: '#f0f8ff',
                    maxColor: '#1e3a8a',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting national capitals data:', error);
            return null;
        }
    }
    
    async convertNationalCapitalsPopulationData() {
        try {
            const response = await fetch('data/national_capitals_population_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('demographics', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'national_capitals_population_by_country',
                title: 'National Capitals Population by Country',
                description: 'Population of capital cities in each country',
                category: 'demographics',
                tags: ['capitals', 'population', 'cities', 'demographics', 'capital population'],
                answer_variations: [
                    'capital population',
                    'capital city population',
                    'national capital population',
                    'capital residents',
                    'capital city residents'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fef3c7', '#fbbf24', '#f59e0b', '#d97706'],
                    minColor: '#fef3c7',
                    maxColor: '#d97706',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting national capitals population data:', error);
            return null;
        }
    }
    
    async convertNationalCapitalsPopulationPercentageData() {
        try {
            const response = await fetch('data/national_capitals_population_percentage_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('demographics', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'national_capitals_population_percentage_by_country',
                title: 'National Capitals Population Percentage by Country',
                description: 'Percentage of country population living in the capital city',
                category: 'demographics',
                tags: ['capitals', 'population percentage', 'cities', 'demographics', 'capital percentage'],
                answer_variations: [
                    'capital population percentage',
                    'capital city percentage',
                    'national capital percentage',
                    'capital residents percentage',
                    'capital city residents percentage'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fef3c7', '#fbbf24', '#f59e0b', '#d97706'],
                    minColor: '#fef3c7',
                    maxColor: '#d97706',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting national capitals population percentage data:', error);
            return null;
        }
    }
    
    // Add more conversion methods for the remaining datasets...
    // I'll continue with a few more key ones and then provide a summary
    
    async convertEnglishPrimaryLanguageData() {
        try {
            const response = await fetch('data/english_primary_language_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('social', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'english_primary_language_by_country',
                title: 'English Primary Language by Country',
                description: 'Countries where English is the primary language',
                category: 'social',
                tags: ['english', 'language', 'primary language', 'social', 'linguistics'],
                answer_variations: [
                    'english primary language',
                    'english as primary language',
                    'primary language english',
                    'english speaking countries',
                    'english language countries'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fdf4ff', '#f3e8ff', '#c084fc', '#9333ea'],
                    minColor: '#fdf4ff',
                    maxColor: '#9333ea',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting english primary language data:', error);
            return null;
        }
    }
    
    async convertStockMarketCapitalizationData() {
        try {
            const response = await fetch('data/stock_market_capitalization_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('economics', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'stock_market_capitalization_by_country',
                title: 'Stock Market Capitalization by Country',
                description: 'Total market capitalization of stock markets in each country',
                category: 'economics',
                tags: ['stock market', 'capitalization', 'finance', 'economics', 'markets'],
                answer_variations: [
                    'stock market capitalization',
                    'market capitalization',
                    'stock market value',
                    'market value',
                    'stock market size'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#dcfce7', '#22c55e', '#16a34a', '#15803d'],
                    minColor: '#dcfce7',
                    maxColor: '#15803d',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting stock market capitalization data:', error);
            return null;
        }
    }
    
    async convertOilProductionData() {
        try {
            const response = await fetch('data/oil_production_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('economics', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'oil_production_by_country',
                title: 'Oil Production by Country',
                description: 'Annual oil production in each country',
                category: 'economics',
                tags: ['oil', 'production', 'energy', 'economics', 'petroleum'],
                answer_variations: [
                    'oil production',
                    'petroleum production',
                    'oil output',
                    'crude oil production',
                    'oil extraction'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#dcfce7', '#22c55e', '#16a34a', '#15803d'],
                    minColor: '#dcfce7',
                    maxColor: '#15803d',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting oil production data:', error);
            return null;
        }
    }
    
    async convertUNESCOSitesData() {
        try {
            const response = await fetch('data/unesco_sites_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getColorSchemeForCategory('social', 'numeric');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'unesco_sites_by_country',
                title: 'UNESCO World Heritage Sites by Country',
                description: 'Number of UNESCO World Heritage Sites in each country',
                category: 'social',
                tags: ['unesco', 'world heritage', 'cultural sites', 'heritage', 'tourism'],
                answer_variations: [
                    'unesco sites',
                    'world heritage sites',
                    'unesco world heritage',
                    'cultural heritage sites',
                    'unesco heritage sites'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: ['#fdf4ff', '#f3e8ff', '#c084fc', '#9333ea'],
                    minColor: '#fdf4ff',
                    maxColor: '#9333ea',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting UNESCO sites data:', error);
            return null;
        }
    }
    
    // Add placeholder methods for the remaining datasets
    // These can be implemented following the same pattern
    
    async convertEnglishSpeakersTotalData() {
        try {
            const response = await fetch('data/english_speakers_total_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.english_speakers_total,
                        unit: 'speakers'
                    };
                    values.push(item.english_speakers_total);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'english_speakers_total',
                title: 'English Speakers Total',
                description: 'Countries colored by total number of English speakers',
                category: 'language',
                tags: ['english', 'language', 'speakers', 'total', 'population'],
                answer_variations: ['english speakers total', 'total english speakers', 'english language speakers'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting english speakers total data:', error);
            return null;
        }
    }
    
    async convertEnglishSpeakingPopulationData() {
        try {
            const response = await fetch('data/english_speaking_population_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.english_speaking_population,
                        unit: 'people'
                    };
                    values.push(item.english_speaking_population);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'english_speaking_population',
                title: 'English Speaking Population',
                description: 'Countries colored by English speaking population',
                category: 'language',
                tags: ['english', 'language', 'population', 'speakers'],
                answer_variations: ['english speaking population', 'english population', 'english speakers population'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting english speaking population data:', error);
            return null;
        }
    }
    
    async convertOfficialLanguagesData() {
        try {
            const response = await fetch('data/official_languages_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.official_languages,
                        unit: 'languages'
                    };
                    values.push(item.official_languages);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'official_languages',
                title: 'Official Languages',
                description: 'Countries colored by number of official languages',
                category: 'language',
                tags: ['official languages', 'language', 'languages', 'government'],
                answer_variations: ['official languages', 'number of official languages', 'official language count'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting official languages data:', error);
            return null;
        }
    }
    
    async convertLivingLanguagesData() {
        try {
            const response = await fetch('data/living_languages_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.living_languages,
                        unit: 'languages'
                    };
                    values.push(item.living_languages);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'living_languages',
                title: 'Living Languages',
                description: 'Countries colored by number of living languages',
                category: 'language',
                tags: ['living languages', 'language', 'languages', 'indigenous'],
                answer_variations: ['living languages', 'number of living languages', 'indigenous languages'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting living languages data:', error);
            return null;
        }
    }
    
    async convertSpanishNativeSpeakersData() {
        try {
            const response = await fetch('data/spanish_native_speakers_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.spanish_native_speakers,
                        unit: 'speakers'
                    };
                    values.push(item.spanish_native_speakers);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'spanish_native_speakers',
                title: 'Spanish Native Speakers',
                description: 'Countries colored by number of Spanish native speakers',
                category: 'language',
                tags: ['spanish', 'language', 'native speakers', 'hispanic'],
                answer_variations: ['spanish native speakers', 'native spanish speakers', 'spanish speakers'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting spanish native speakers data:', error);
            return null;
        }
    }
    
    async convertGermanNativeSpeakersData() {
        try {
            const response = await fetch('data/german_native_speakers_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.german_native_speakers,
                        unit: 'speakers'
                    };
                    values.push(item.german_native_speakers);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'german_native_speakers',
                title: 'German Native Speakers',
                description: 'Countries colored by number of German native speakers',
                category: 'language',
                tags: ['german', 'language', 'native speakers', 'deutsch'],
                answer_variations: ['german native speakers', 'native german speakers', 'german speakers'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting german native speakers data:', error);
            return null;
        }
    }
    
    async convertChineseNativeSpeakersData() {
        try {
            const response = await fetch('data/chinese_native_speakers_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.chinese_native_speakers,
                        unit: 'speakers'
                    };
                    values.push(item.chinese_native_speakers);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'chinese_native_speakers',
                title: 'Chinese Native Speakers',
                description: 'Countries colored by number of Chinese native speakers',
                category: 'language',
                tags: ['chinese', 'language', 'native speakers', 'mandarin'],
                answer_variations: ['chinese native speakers', 'native chinese speakers', 'chinese speakers'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting chinese native speakers data:', error);
            return null;
        }
    }
    
    async convertAfrikaansDutchNativeSpeakersData() {
        try {
            const response = await fetch('data/afrikaans_dutch_native_speakers_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.afrikaans_dutch_native_speakers,
                        unit: 'speakers'
                    };
                    values.push(item.afrikaans_dutch_native_speakers);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'afrikaans_dutch_native_speakers',
                title: 'Afrikaans/Dutch Native Speakers',
                description: 'Countries colored by number of Afrikaans/Dutch native speakers',
                category: 'language',
                tags: ['afrikaans', 'dutch', 'language', 'native speakers'],
                answer_variations: ['afrikaans dutch native speakers', 'afrikaans speakers', 'dutch speakers'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting afrikaans dutch native speakers data:', error);
            return null;
        }
    }
    
    async convertFrenchOfficialLanguageData() {
        try {
            const response = await fetch('data/french_official_language_status_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.french_official_language_status === 'Official' ? 1 : 0,
                        unit: 'status'
                    };
                    values.push(item.french_official_language_status === 'Official' ? 1 : 0);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('categorical');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                countries[country].color = value === 1 ? colorScheme[0] : colorScheme[1];
            });
            
            return {
                id: 'french_official_language',
                title: 'French Official Language',
                description: 'Countries colored by French official language status',
                category: 'language',
                tags: ['french', 'official language', 'language', 'francophone'],
                answer_variations: ['french official language', 'french as official language', 'francophone countries'],
                colorScheme: {
                    type: 'categorical',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting french official language data:', error);
            return null;
        }
    }
    
    async convertContainerPortTrafficData() {
        try {
            const response = await fetch('data/container_port_traffic_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.container_port_traffic,
                        unit: 'TEU'
                    };
                    values.push(item.container_port_traffic);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'container_port_traffic',
                title: 'Container Port Traffic',
                description: 'Countries colored by container port traffic',
                category: 'economy',
                tags: ['container port', 'traffic', 'shipping', 'trade', 'ports'],
                answer_variations: ['container port traffic', 'port traffic', 'shipping traffic'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting container port traffic data:', error);
            return null;
        }
    }
    
    async convertRoadNetworkSizeData() {
        try {
            const response = await fetch('data/road_network_size_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.road_network_size,
                        unit: 'km'
                    };
                    values.push(item.road_network_size);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'road_network_size',
                title: 'Road Network Size',
                description: 'Countries colored by road network size',
                category: 'infrastructure',
                tags: ['road network', 'roads', 'infrastructure', 'transportation'],
                answer_variations: ['road network size', 'road length', 'road infrastructure'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting road network size data:', error);
            return null;
        }
    }
    
    async convertHighSpeedRailData() {
        try {
            const response = await fetch('data/high_speed_rail_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.high_speed_rail,
                        unit: 'km'
                    };
                    values.push(item.high_speed_rail);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'high_speed_rail',
                title: 'High Speed Rail',
                description: 'Countries colored by high speed rail length',
                category: 'infrastructure',
                tags: ['high speed rail', 'railway', 'infrastructure', 'transportation'],
                answer_variations: ['high speed rail', 'high speed railway', 'bullet train'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting high speed rail data:', error);
            return null;
        }
    }
    
    async convertCocoaProductionData() {
        try {
            const response = await fetch('data/cocoa_production_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.cocoa_production,
                        unit: 'tons'
                    };
                    values.push(item.cocoa_production);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'cocoa_production',
                title: 'Cocoa Production',
                description: 'Countries colored by cocoa production',
                category: 'agriculture',
                tags: ['cocoa', 'production', 'agriculture', 'chocolate'],
                answer_variations: ['cocoa production', 'chocolate production', 'cocoa farming'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting cocoa production data:', error);
            return null;
        }
    }
    
    async convertWheatProductionData() {
        try {
            const response = await fetch('data/wheat_production_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.wheat_production,
                        unit: 'tons'
                    };
                    values.push(item.wheat_production);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'wheat_production',
                title: 'Wheat Production',
                description: 'Countries colored by wheat production',
                category: 'agriculture',
                tags: ['wheat', 'production', 'agriculture', 'grain'],
                answer_variations: ['wheat production', 'wheat farming', 'grain production'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting wheat production data:', error);
            return null;
        }
    }
    
    async convertSteelProductionData() {
        try {
            const response = await fetch('data/steel_production_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.steel_production,
                        unit: 'tons'
                    };
                    values.push(item.steel_production);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'steel_production',
                title: 'Steel Production',
                description: 'Countries colored by steel production',
                category: 'industry',
                tags: ['steel', 'production', 'industry', 'manufacturing'],
                answer_variations: ['steel production', 'steel manufacturing', 'steel industry'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting steel production data:', error);
            return null;
        }
    }
    
    async convertPopesData() {
        try {
            const response = await fetch('data/popes_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.popes,
                        unit: 'popes'
                    };
                    values.push(item.popes);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'popes',
                title: 'Popes by Country',
                description: 'Countries colored by number of popes produced',
                category: 'history',
                tags: ['popes', 'vatican', 'catholic', 'history', 'religion'],
                answer_variations: ['popes by country', 'number of popes', 'popes produced'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting popes data:', error);
            return null;
        }
    }
    
    async convertYearsColonizedData() {
        try {
            const response = await fetch('data/years_colonized_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.years_colonized,
                        unit: 'years'
                    };
                    values.push(item.years_colonized);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'years_colonized',
                title: 'Years Colonized',
                description: 'Countries colored by years under colonization',
                category: 'history',
                tags: ['colonization', 'history', 'colonial', 'empire'],
                answer_variations: ['years colonized', 'colonization period', 'colonial years'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting years colonized data:', error);
            return null;
        }
    }
    
    async convertCommonwealthMembershipData() {
        try {
            const response = await fetch('data/commonwealth_membership_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.commonwealth_membership === 'Member' ? 1 : 0,
                        unit: 'status'
                    };
                    values.push(item.commonwealth_membership === 'Member' ? 1 : 0);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('categorical');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                countries[country].color = value === 1 ? colorScheme[0] : colorScheme[1];
            });
            
            return {
                id: 'commonwealth_membership',
                title: 'Commonwealth Membership',
                description: 'Countries colored by Commonwealth membership status',
                category: 'politics',
                tags: ['commonwealth', 'membership', 'british empire', 'politics'],
                answer_variations: ['commonwealth membership', 'commonwealth member', 'commonwealth countries'],
                colorScheme: {
                    type: 'categorical',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting commonwealth membership data:', error);
            return null;
        }
    }
    
    async convertTimeZonesData() {
        try {
            const response = await fetch('data/time_zones_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.time_zones,
                        unit: 'zones'
                    };
                    values.push(item.time_zones);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'time_zones',
                title: 'Time Zones',
                description: 'Countries colored by number of time zones',
                category: 'geography',
                tags: ['time zones', 'time', 'geography', 'longitude'],
                answer_variations: ['time zones', 'number of time zones', 'time zone count'],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting time zones data:', error);
            return null;
        }
    }
    
    async convertCountryByFirstLetterData() {
        try {
            const response = await fetch('data/country_by_first_letter.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.country_by_first_letter,
                        unit: 'letter'
                    };
                    values.push(item.country_by_first_letter);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('categorical');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const index = Math.floor((value.charCodeAt(0) - 65) % colorScheme.length);
                countries[country].color = colorScheme[index];
            });
            
            return {
                id: 'country_by_first_letter',
                title: 'Country by First Letter',
                description: 'Countries colored by first letter of country name',
                category: 'geography',
                tags: ['alphabet', 'letters', 'country names', 'geography'],
                answer_variations: ['country by first letter', 'first letter', 'alphabetical countries'],
                colorScheme: {
                    type: 'categorical',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting country by first letter data:', error);
            return null;
        }
    }
    
    // New datasets
    async convertLandlockedCountriesData() {
        try {
            const response = await fetch('data/landlocked_countries.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, value]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: value.value === 'Landlocked' ? 1 : 0,
                        unit: 'status'
                    };
                    values.push(value.value === 'Landlocked' ? 1 : 0);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e8f5e8', '#2e7d32');
            });
            
            return {
                id: 'landlocked_countries',
                title: 'Landlocked Countries',
                description: 'Countries colored by landlocked status',
                category: 'geography',
                tags: ['landlocked', 'geography', 'borders', 'coastline', 'access to sea'],
                answer_variations: [
                    'landlocked countries',
                    'landlocked',
                    'no coastline',
                    'no sea access',
                    'inland countries'
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
            console.error('Error converting landlocked countries data:', error);
            return null;
        }
    }
    
    async convertFoodEnergyIntakeData() {
        try {
            const response = await fetch('data/food_energy_intake_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, value]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: value.value,
                        unit: 'kJ'
                    };
                    values.push(value.value);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fff3e0', '#e65100');
            });
            
            return {
                id: 'food_energy_intake_by_country',
                title: 'Daily Caloric Food Supply',
                description: 'Average daily caloric food supply per capita in kilojoules',
                category: 'food',
                tags: ['food', 'calories', 'nutrition', 'diet', 'energy intake', 'food supply'],
                answer_variations: [
                    'food energy intake',
                    'caloric intake',
                    'daily calories',
                    'food supply',
                    'nutrition',
                    'diet'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fff3e0',
                    maxColor: '#e65100',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting food energy intake data:', error);
            return null;
        }
    }
    
    async convertWineProductionData() {
        try {
            const response = await fetch('data/wine_production_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, value]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: value.value,
                        unit: 'tonnes'
                    };
                    values.push(value.value);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fce4ec', '#880e4f');
            });
            
            return {
                id: 'wine_production_by_country',
                title: 'Wine Production',
                description: 'Annual wine production in tonnes',
                category: 'food',
                tags: ['wine', 'alcohol', 'beverages', 'production', 'agriculture'],
                answer_variations: [
                    'wine production',
                    'wine',
                    'viticulture',
                    'wine making',
                    'grape production'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fce4ec',
                    maxColor: '#880e4f',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting wine production data:', error);
            return null;
        }
    }
    
    async convertWineConsumptionData() {
        try {
            const response = await fetch('data/wine_consumption_per_capita_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, value]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: value.value,
                        unit: 'liters'
                    };
                    values.push(value.value);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#f3e5f5', '#4a148c');
            });
            
            return {
                id: 'wine_consumption_per_capita_by_country',
                title: 'Wine Consumption per Capita',
                description: 'Annual wine consumption per capita in liters',
                category: 'food',
                tags: ['wine', 'alcohol', 'consumption', 'beverages', 'per capita'],
                answer_variations: [
                    'wine consumption',
                    'wine drinking',
                    'wine per capita',
                    'wine intake'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#f3e5f5',
                    maxColor: '#4a148c',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting wine consumption data:', error);
            return null;
        }
    }
    
    async convertTeaConsumptionData() {
        try {
            const response = await fetch('data/tea_consumption_per_capita_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, value]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: value.value,
                        unit: 'kg'
                    };
                    values.push(value.value);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e8f5e8', '#2e7d32');
            });
            
            return {
                id: 'tea_consumption_per_capita_by_country',
                title: 'Tea Consumption per Capita',
                description: 'Annual tea consumption per capita in kilograms',
                category: 'food',
                tags: ['tea', 'beverages', 'consumption', 'per capita'],
                answer_variations: [
                    'tea consumption',
                    'tea drinking',
                    'tea per capita',
                    'tea intake'
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
            console.error('Error converting tea consumption data:', error);
            return null;
        }
    }
    
    async convertCurrencyExchangeRateData() {
        try {
            const response = await fetch('data/currency_exchange_rate_usd.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, value]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                if (mappedCountryName) {
                    countries[mappedCountryName] = {
                        value: value.value,
                        unit: 'USD'
                    };
                    values.push(value.value);
                }
            });
            
            // Calculate color scale
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e3f2fd', '#1565c0');
            });
            
            return {
                id: 'currency_exchange_rate_usd',
                title: 'Currency Exchange Rate to USD',
                description: 'Exchange rate of local currency to US Dollar',
                category: 'economics',
                tags: ['currency', 'exchange rate', 'usd', 'money', 'forex'],
                answer_variations: [
                    'currency exchange rate',
                    'exchange rate',
                    'usd rate',
                    'currency value',
                    'forex rate'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e3f2fd',
                    maxColor: '#1565c0',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting currency exchange rate data:', error);
            return null;
        }
    }
    
    copyCurrentData() {
        if (!this.currentQuiz || !this.currentQuiz.countries) {
            this.showFeedback('No data available to copy', 'incorrect');
            return;
        }
        
        try {
            // Create table header (lowercase)
            let tableData = 'country\tvalue\tunit\n';
            
            // Sort countries by value (descending) for better readability
            const sortedCountries = Object.entries(this.currentQuiz.countries)
                .sort(([,a], [,b]) => b.value - a.value);
            
            // Add each country's data
            sortedCountries.forEach(([country, data]) => {
                const value = typeof data.value === 'number' ? data.value.toLocaleString() : data.value;
                const unit = data.unit || '';
                tableData += `${country}\t${value}\t${unit}\n`;
            });
            
            // Copy to clipboard
            navigator.clipboard.writeText(tableData).then(() => {
                // Change icon from copy to check for 1.2 seconds
                const copyBtn = document.getElementById('copyData');
                if (copyBtn) {
                    this.setLucide(copyBtn, 'check');
                    setTimeout(() => this.setLucide(copyBtn, 'copy'), 1200);
                }
            }).catch(err => {
                console.error('Failed to copy data:', err);
                this.showFeedback('Failed to copy data', 'incorrect');
            });
            
        } catch (error) {
            console.error('Error copying data:', error);
            this.showFeedback('Error copying data', 'incorrect');
        }
    }
    
    setLucide(btn, icon) {
        if (!btn) return;
        btn.replaceChildren();
        const i = document.createElement('i');
        i.setAttribute('data-lucide', icon);
        i.setAttribute('aria-hidden', 'true');
        btn.appendChild(i);
        if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
    }
    
    // New conversion methods for additional datasets
    
    async convertGDPPerWorkingHourData() {
        try {
            const response = await fetch('data/gdp_per_working_hour_2023.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                if (country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(country);
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit || 'USD/hour'
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#dcfce7', '#15803d');
            });
            
            return {
                id: 'gdp_per_working_hour_2023',
                title: 'GDP Per Working Hour 2023',
                description: 'Gross Domestic Product per working hour',
                category: 'economics',
                tags: ['gdp per hour', 'productivity', 'economic efficiency', 'work output'],
                answer_variations: [
                    'gdp per working hour',
                    'productivity per hour',
                    'economic output per hour',
                    'gdp per hour'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#dcfce7',
                    maxColor: '#15803d',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('❌ Error converting GDP per working hour data:', error);
            return null;
        }
    }
    
    async convertWealthGiniData() {
        try {
            const response = await fetch('data/wealth_gini_percent_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                if (country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(country);
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit || '%'
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fef3c7', '#d97706');
            });
            
            return {
                id: 'wealth_gini_percent_by_country',
                title: 'Wealth Gini Coefficient',
                description: 'Wealth inequality measured by Gini coefficient',
                category: 'economics',
                tags: ['wealth inequality', 'gini coefficient', 'wealth distribution', 'inequality'],
                answer_variations: [
                    'wealth gini coefficient',
                    'wealth inequality',
                    'gini coefficient',
                    'wealth distribution'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fef3c7',
                    maxColor: '#d97706',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('❌ Error converting wealth gini data:', error);
            return null;
        }
    }
    
    async convertMedianWealthData() {
        try {
            const response = await fetch('data/median_wealth_per_adult_2023.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                if (country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(country);
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit || 'USD'
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#dcfce7', '#15803d');
            });
            
            return {
                id: 'median_wealth_per_adult_2023',
                title: 'Median Wealth per Adult 2023',
                description: 'Median wealth per adult in USD',
                category: 'economics',
                tags: ['median wealth', 'wealth per adult', 'middle class wealth', 'wealth'],
                answer_variations: [
                    'median wealth per adult',
                    'median wealth',
                    'wealth per adult',
                    'middle class wealth'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#dcfce7',
                    maxColor: '#15803d',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting median wealth data:', error);
            return null;
        }
    }
    
    async convertAverageWagesData() {
        try {
            const response = await fetch('data/average_annual_wages_usd_ppp_2023.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                if (country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(country);
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit || 'USD PPP'
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#dcfce7', '#15803d');
            });
            
            return {
                id: 'average_annual_wages_usd_ppp_2023',
                title: 'Average Annual Wages 2023',
                description: 'Average annual wages in USD PPP',
                category: 'economics',
                tags: ['average wages', 'annual wages', 'income', 'salary', 'wages'],
                answer_variations: [
                    'average annual wages',
                    'average wages',
                    'annual wages',
                    'income'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#dcfce7',
                    maxColor: '#15803d',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting average wages data:', error);
            return null;
        }
    }
    
    async convertCorporateTaxData() {
        try {
            const response = await fetch('data/corporate_tax_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                if (country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(country);
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit || '%'
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fef3c7', '#d97706');
            });
            
            return {
                id: 'corporate_tax_by_country',
                title: 'Corporate Tax Rate',
                description: 'Corporate tax rate by country',
                category: 'economics',
                tags: ['corporate tax', 'tax rate', 'business tax', 'corporate taxation'],
                answer_variations: [
                    'corporate tax rate',
                    'corporate tax',
                    'business tax',
                    'tax rate'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fef3c7',
                    maxColor: '#d97706',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting corporate tax data:', error);
            return null;
        }
    }
    
    async convertMarriageRateData() {
        try {
            const response = await fetch('data/marriage_rate_per_1000_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                if (country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(country);
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit || 'per 1000'
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fdf4ff', '#9333ea');
            });
            
            return {
                id: 'marriage_rate_per_1000_by_country',
                title: 'Marriage Rate',
                description: 'Marriage rate per 1000 people',
                category: 'demographics',
                tags: ['marriage rate', 'marriages', 'demographics', 'social'],
                answer_variations: [
                    'marriage rate',
                    'marriages per 1000',
                    'marriage rate per 1000',
                    'marriages'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fdf4ff',
                    maxColor: '#9333ea',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting marriage rate data:', error);
            return null;
        }
    }
    
    async convertMotorVehicleProductionData() {
        try {
            const response = await fetch('data/motor_vehicle_production_2024.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                if (country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(country);
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit || 'vehicles'
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e0f2f1', '#00695c');
            });
            
            return {
                id: 'motor_vehicle_production_2024',
                title: 'Motor Vehicle Production 2024',
                description: 'Motor vehicle production by country',
                category: 'industry',
                tags: ['motor vehicle production', 'car production', 'vehicle manufacturing', 'automotive'],
                answer_variations: [
                    'motor vehicle production',
                    'car production',
                    'vehicle production',
                    'automotive production'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e0f2f1',
                    maxColor: '#00695c',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting motor vehicle production data:', error);
            return null;
        }
    }
    
    async convertForestAreaData() {
        try {
            const response = await fetch('data/forest_area_km2_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                if (country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(country);
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit || 'km²'
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e8f5e8', '#2e7d32');
            });
            
            return {
                id: 'forest_area_km2_by_country',
                title: 'Forest Area',
                description: 'Total forest area in square kilometers',
                category: 'environment',
                tags: ['forest area', 'forests', 'environment', 'nature', 'trees'],
                answer_variations: [
                    'forest area',
                    'forests',
                    'forest coverage',
                    'trees'
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
            console.error('Error converting forest area data:', error);
            return null;
        }
    }
    
    async convertForestAreaPercentageData() {
        try {
            const response = await fetch('data/forest_area_percentage_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                if (country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(country);
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit || '%'
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e8f5e8', '#2e7d32');
            });
            
            return {
                id: 'forest_area_percentage_by_country',
                title: 'Forest Area Percentage',
                description: 'Percentage of land area covered by forests',
                category: 'environment',
                tags: ['forest percentage', 'forest coverage', 'environment', 'nature'],
                answer_variations: [
                    'forest area percentage',
                    'forest percentage',
                    'forest coverage',
                    'percentage of forests'
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
            console.error('Error converting forest area percentage data:', error);
            return null;
        }
    }
    
    async convertOlympicsHostedData() {
        try {
            const response = await fetch('data/olympics_hosted_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                if (country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(country);
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit || 'times'
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fff3e0', '#e65100');
            });
            
            return {
                id: 'olympics_hosted_by_country',
                title: 'Olympics Hosted',
                description: 'Number of times a country has hosted the Olympics',
                category: 'sports',
                tags: ['olympics hosted', 'olympic games', 'sports', 'hosting'],
                answer_variations: [
                    'olympics hosted',
                    'olympic games hosted',
                    'times hosted olympics',
                    'olympic hosting'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fff3e0',
                    maxColor: '#e65100',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting olympics hosted data:', error);
            return null;
        }
    }
    
    async convertFigureSkatingGoldData() {
        try {
            const response = await fetch('data/world_figure_skating_gold_medals_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                if (country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(country);
                    countries[mappedCountryName] = {
                        value: countryData.value,
                        unit: countryData.unit || 'medals'
                    };
                    values.push(countryData.value);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e3f2fd', '#1565c0');
            });
            
            return {
                id: 'world_figure_skating_gold_medals_by_country',
                title: 'Figure Skating Gold Medals',
                description: 'Number of world figure skating gold medals',
                category: 'sports',
                tags: ['figure skating', 'gold medals', 'sports', 'skating'],
                answer_variations: [
                    'figure skating gold medals',
                    'figure skating medals',
                    'skating gold medals',
                    'figure skating'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e3f2fd',
                    maxColor: '#1565c0',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting figure skating gold data:', error);
            return null;
        }
    }
    
    // Flag color conversion methods
    async convertBlueFlagData() {
        try {
            const response = await fetch('data/blue_flag_countries.json');
            const data = await response.json();
            
            const countries = {};
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit || 'flag color',
                    color: '#3b82f6'
                };
            });
            
            return {
                id: 'blue_flag_countries',
                title: 'Countries with Blue Flags',
                description: 'Countries whose flags contain blue',
                category: 'culture',
                tags: ['blue flags', 'flag colors', 'national flags', 'blue'],
                answer_variations: [
                    'blue flags',
                    'flags with blue',
                    'blue flag countries',
                    'blue flag'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: ['#3b82f6'],
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting blue flag data:', error);
            return null;
        }
    }
    
    async convertRedFlagData() {
        try {
            const response = await fetch('data/red_flag_countries.json');
            const data = await response.json();
            
            const countries = {};
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit || 'flag color',
                    color: '#ef4444'
                };
            });
            
            return {
                id: 'red_flag_countries',
                title: 'Countries with Red Flags',
                description: 'Countries whose flags contain red',
                category: 'culture',
                tags: ['red flags', 'flag colors', 'national flags', 'red'],
                answer_variations: [
                    'red flags',
                    'flags with red',
                    'red flag countries',
                    'red flag'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: ['#ef4444'],
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting red flag data:', error);
            return null;
        }
    }
    
    async convertYellowFlagData() {
        try {
            const response = await fetch('data/yellow_flag_countries.json');
            const data = await response.json();
            
            const countries = {};
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit || 'flag color',
                    color: '#eab308'
                };
            });
            
            return {
                id: 'yellow_flag_countries',
                title: 'Countries with Yellow Flags',
                description: 'Countries whose flags contain yellow',
                category: 'culture',
                tags: ['yellow flags', 'flag colors', 'national flags', 'yellow'],
                answer_variations: [
                    'yellow flags',
                    'flags with yellow',
                    'yellow flag countries',
                    'yellow flag'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: ['#eab308'],
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting yellow flag data:', error);
            return null;
        }
    }
    
    async convertWhiteFlagData() {
        try {
            const response = await fetch('data/white_flag_countries.json');
            const data = await response.json();
            
            const countries = {};
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit || 'flag color',
                    color: '#f8fafc'
                };
            });
            
            return {
                id: 'white_flag_countries',
                title: 'Countries with White Flags',
                description: 'Countries whose flags contain white',
                category: 'culture',
                tags: ['white flags', 'flag colors', 'national flags', 'white'],
                answer_variations: [
                    'white flags',
                    'flags with white',
                    'white flag countries',
                    'white flag'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: ['#f8fafc'],
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting white flag data:', error);
            return null;
        }
    }
    
    async convertPurpleFlagData() {
        try {
            const response = await fetch('data/purple_flag_countries.json');
            const data = await response.json();
            
            const countries = {};
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit || 'flag color',
                    color: '#a855f7'
                };
            });
            
            return {
                id: 'purple_flag_countries',
                title: 'Countries with Purple Flags',
                description: 'Countries whose flags contain purple',
                category: 'culture',
                tags: ['purple flags', 'flag colors', 'national flags', 'purple'],
                answer_variations: [
                    'purple flags',
                    'flags with purple',
                    'purple flag countries',
                    'purple flag'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: ['#a855f7'],
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting purple flag data:', error);
            return null;
        }
    }
    
    async convertGreenFlagData() {
        try {
            const response = await fetch('data/green_flag_countries.json');
            const data = await response.json();
            
            const countries = {};
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit || 'flag color',
                    color: '#22c55e'
                };
            });
            
            return {
                id: 'green_flag_countries',
                title: 'Countries with Green Flags',
                description: 'Countries whose flags contain green',
                category: 'culture',
                tags: ['green flags', 'flag colors', 'national flags', 'green'],
                answer_variations: [
                    'green flags',
                    'flags with green',
                    'green flag countries',
                    'green flag'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: ['#22c55e'],
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting green flag data:', error);
            return null;
        }
    }
    
    async convertBlueWhiteFlagData() {
        try {
            const response = await fetch('data/blue_and_white_flags.json');
            const data = await response.json();
            
            const countries = {};
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit || 'flag colors',
                    color: '#3b82f6'
                };
            });
            
            return {
                id: 'blue_and_white_flags',
                title: 'Countries with Blue and White Flags',
                description: 'Countries whose flags contain both blue and white',
                category: 'culture',
                tags: ['blue and white flags', 'flag colors', 'national flags'],
                answer_variations: [
                    'blue and white flags',
                    'flags with blue and white',
                    'blue and white flag countries',
                    'blue and white flag'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: ['#3b82f6'],
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting blue and white flag data:', error);
            return null;
        }
    }
    
    async convertNoRedFlagData() {
        try {
            const response = await fetch('data/flags_without_red.json');
            const data = await response.json();
            
            const countries = {};
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit || 'flag colors',
                    color: '#6b7280'
                };
            });
            
            return {
                id: 'flags_without_red',
                title: 'Flags Without Red',
                description: 'Countries whose flags do not contain red',
                category: 'culture',
                tags: ['flags without red', 'flag colors', 'national flags'],
                answer_variations: [
                    'flags without red',
                    'no red flags',
                    'flags without red color',
                    'no red flag countries'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: ['#6b7280'],
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting no red flag data:', error);
            return null;
        }
    }
    
    async convertAfricanNeverColonizedData() {
        try {
            const response = await fetch('data/african_countries_never_colonized.json');
            const data = await response.json();
            
            const countries = {};
            
            Object.entries(data.data).forEach(([country, countryData]) => {
                const mappedCountryName = this.countryMapper.mapCountryName(country);
                countries[mappedCountryName] = {
                    value: countryData.value,
                    unit: countryData.unit || 'colonial status',
                    color: '#dc2626'
                };
            });
            
            return {
                id: 'african_countries_never_colonized',
                title: 'African Countries Never Colonized',
                description: 'African countries that were never colonized',
                category: 'history',
                tags: ['never colonized', 'african history', 'colonialism', 'independence'],
                answer_variations: [
                    'african countries never colonized',
                    'never colonized',
                    'african independence',
                    'never colonized countries'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: ['#dc2626'],
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting african never colonized data:', error);
            return null;
        }
    }

    // New dataset conversion methods
    async convertHorsePopulationData() {
        try {
            const response = await fetch('data/horse_population_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Horse population data format not supported, skipping...');
                return null;
            }
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.horse_population,
                        unit: 'horses'
                    };
                    values.push(item.horse_population);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fef3c7', '#d97706');
            });
            
            return {
                id: 'horse_population',
                title: 'Horse Population',
                description: 'Countries colored by horse population',
                category: 'agriculture',
                tags: ['horses', 'horse population', 'livestock', 'animals', 'agriculture'],
                answer_variations: [
                    'horse population',
                    'horses',
                    'horse count',
                    'livestock horses',
                    'horse numbers'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fef3c7',
                    maxColor: '#d97706',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting horse population data:', error);
            return null;
        }
    }

    async convertSheepPopulationData() {
        try {
            const response = await fetch('data/sheep_population_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.sheep_population,
                        unit: 'sheep'
                    };
                    values.push(item.sheep_population);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#f0f9ff', '#0369a1');
            });
            
            return {
                id: 'sheep_population',
                title: 'Sheep Population',
                description: 'Countries colored by sheep population',
                category: 'agriculture',
                tags: ['sheep', 'sheep population', 'livestock', 'animals', 'agriculture'],
                answer_variations: [
                    'sheep population',
                    'sheep',
                    'sheep count',
                    'livestock sheep',
                    'sheep numbers'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#f0f9ff',
                    maxColor: '#0369a1',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting sheep population data:', error);
            return null;
        }
    }

    async convertMammalsData() {
        try {
            const response = await fetch('data/mammals_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.mammal_species,
                        unit: 'species'
                    };
                    values.push(item.mammal_species);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fef3c7', '#d97706');
            });
            
            return {
                id: 'mammals',
                title: 'Mammal Species',
                description: 'Countries colored by number of mammal species',
                category: 'environment',
                tags: ['mammals', 'mammal species', 'wildlife', 'biodiversity', 'animals'],
                answer_variations: [
                    'mammal species',
                    'mammals',
                    'mammal count',
                    'wildlife mammals',
                    'mammal biodiversity'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fef3c7',
                    maxColor: '#d97706',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting mammals data:', error);
            return null;
        }
    }

    async convertBirdsData() {
        try {
            const response = await fetch('data/birds_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.bird_species,
                        unit: 'species'
                    };
                    values.push(item.bird_species);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#f0f9ff', '#0369a1');
            });
            
            return {
                id: 'birds',
                title: 'Bird Species',
                description: 'Countries colored by number of bird species',
                category: 'environment',
                tags: ['birds', 'bird species', 'wildlife', 'biodiversity', 'animals'],
                answer_variations: [
                    'bird species',
                    'birds',
                    'bird count',
                    'wildlife birds',
                    'bird biodiversity'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#f0f9ff',
                    maxColor: '#0369a1',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting birds data:', error);
            return null;
        }
    }

    async convertFishData() {
        try {
            const response = await fetch('data/fish_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.fish_species,
                        unit: 'species'
                    };
                    values.push(item.fish_species);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e0f2fe', '#0277bd');
            });
            
            return {
                id: 'fish',
                title: 'Fish Species',
                description: 'Countries colored by number of fish species',
                category: 'environment',
                tags: ['fish', 'fish species', 'wildlife', 'biodiversity', 'animals'],
                answer_variations: [
                    'fish species',
                    'fish',
                    'fish count',
                    'wildlife fish',
                    'fish biodiversity'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e0f2fe',
                    maxColor: '#0277bd',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting fish data:', error);
            return null;
        }
    }

    async convertReptilesData() {
        try {
            const response = await fetch('data/reptiles_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.reptile_species,
                        unit: 'species'
                    };
                    values.push(item.reptile_species);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#f0f4c3', '#827717');
            });
            
            return {
                id: 'reptiles',
                title: 'Reptile Species',
                description: 'Countries colored by number of reptile species',
                category: 'environment',
                tags: ['reptiles', 'reptile species', 'wildlife', 'biodiversity', 'animals'],
                answer_variations: [
                    'reptile species',
                    'reptiles',
                    'reptile count',
                    'wildlife reptiles',
                    'reptile biodiversity'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#f0f4c3',
                    maxColor: '#827717',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting reptiles data:', error);
            return null;
        }
    }

    async convertAmphibiansData() {
        try {
            const response = await fetch('data/amphibians_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.amphibian_species,
                        unit: 'species'
                    };
                    values.push(item.amphibian_species);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e8f5e8', '#2e7d32');
            });
            
            return {
                id: 'amphibians',
                title: 'Amphibian Species',
                description: 'Countries colored by number of amphibian species',
                category: 'environment',
                tags: ['amphibians', 'amphibian species', 'wildlife', 'biodiversity', 'animals'],
                answer_variations: [
                    'amphibian species',
                    'amphibians',
                    'amphibian count',
                    'wildlife amphibians',
                    'amphibian biodiversity'
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
            console.error('Error converting amphibians data:', error);
            return null;
        }
    }

    async convertEarthquakesData() {
        try {
            const response = await fetch('data/earthquakes_by_country_2024.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.earthquakes_count,
                        unit: 'earthquakes'
                    };
                    values.push(item.earthquakes_count);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fff3e0', '#e65100');
            });
            
            return {
                id: 'earthquakes_2024',
                title: 'Earthquakes 2024',
                description: 'Countries colored by number of earthquakes in 2024',
                category: 'environment',
                tags: ['earthquakes', 'natural disasters', 'seismic activity', 'geology'],
                answer_variations: [
                    'earthquakes',
                    'earthquake count',
                    'seismic activity',
                    'natural disasters',
                    'earthquake frequency'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fff3e0',
                    maxColor: '#e65100',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting earthquakes data:', error);
            return null;
        }
    }

    async convertStrongestEarthquakesData() {
        try {
            const response = await fetch('data/strongest_earthquake_magnitude_by_country_2024.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.strongest_earthquake_magnitude,
                        unit: 'magnitude'
                    };
                    values.push(item.strongest_earthquake_magnitude);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffebee', '#c62828');
            });
            
            return {
                id: 'strongest_earthquakes_2024',
                title: 'Strongest Earthquakes 2024',
                description: 'Countries colored by strongest earthquake magnitude in 2024',
                category: 'environment',
                tags: ['strongest earthquakes', 'earthquake magnitude', 'seismic activity', 'natural disasters'],
                answer_variations: [
                    'strongest earthquakes',
                    'earthquake magnitude',
                    'strongest earthquake',
                    'seismic magnitude',
                    'earthquake strength'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#ffebee',
                    maxColor: '#c62828',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting strongest earthquakes data:', error);
            return null;
        }
    }

    async convertHoloceneVolcanoesData() {
        try {
            const response = await fetch('data/holocene_volcanoes_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.holocene_volcanoes,
                        unit: 'volcanoes'
                    };
                    values.push(item.holocene_volcanoes);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#fff3e0', '#e65100');
            });
            
            return {
                id: 'holocene_volcanoes',
                title: 'Holocene Volcanoes',
                description: 'Countries colored by number of Holocene volcanoes',
                category: 'environment',
                tags: ['volcanoes', 'holocene volcanoes', 'volcanic activity', 'geology'],
                answer_variations: [
                    'holocene volcanoes',
                    'volcanoes',
                    'volcanic activity',
                    'volcano count',
                    'volcanic features'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#fff3e0',
                    maxColor: '#e65100',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting holocene volcanoes data:', error);
            return null;
        }
    }

    async convertPlantsData() {
        try {
            const response = await fetch('data/plants_wcmc_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.plant_species,
                        unit: 'species'
                    };
                    values.push(item.plant_species);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e8f5e8', '#2e7d32');
            });
            
            return {
                id: 'plants',
                title: 'Plant Species',
                description: 'Countries colored by number of plant species',
                category: 'environment',
                tags: ['plants', 'plant species', 'flora', 'biodiversity', 'vegetation'],
                answer_variations: [
                    'plant species',
                    'plants',
                    'plant count',
                    'flora',
                    'vegetation species'
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
            console.error('Error converting plants data:', error);
            return null;
        }
    }

    async convertWaterwaysData() {
        try {
            const response = await fetch('data/waterways_length_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.waterways_length_km,
                        unit: 'km'
                    };
                    values.push(item.waterways_length_km);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#e0f2fe', '#0277bd');
            });
            
            return {
                id: 'waterways',
                title: 'Waterways Length',
                description: 'Countries colored by length of navigable waterways',
                category: 'infrastructure',
                tags: ['waterways', 'navigable waterways', 'rivers', 'canals', 'transportation'],
                answer_variations: [
                    'waterways length',
                    'navigable waterways',
                    'waterway length',
                    'rivers and canals',
                    'water transportation'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#e0f2fe',
                    maxColor: '#0277bd',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting waterways data:', error);
            return null;
        }
    }

    async convertNationalAnthemsData() {
        try {
            const response = await fetch('data/national_anthems_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const anthemTypes = {};
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.anthem_type,
                        unit: 'anthem type'
                    };
                    anthemTypes[item.anthem_type] = (anthemTypes[item.anthem_type] || 0) + 1;
                }
            });
            
            const anthemTypeList = Object.keys(anthemTypes);
            const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
            
            anthemTypeList.forEach((type, index) => {
                const color = colors[index % colors.length];
                Object.keys(countries).forEach(country => {
                    if (countries[country].value === type) {
                        countries[country].color = color;
                    }
                });
            });
            
            return {
                id: 'national_anthems',
                title: 'National Anthems',
                description: 'Countries colored by type of national anthem',
                category: 'culture',
                tags: ['national anthems', 'anthems', 'music', 'culture', 'national symbols'],
                answer_variations: [
                    'national anthems',
                    'anthems',
                    'national anthem type',
                    'anthem types',
                    'national music'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: colors,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting national anthems data:', error);
            return null;
        }
    }

    async convertShoeSizeData() {
        try {
            const response = await fetch('data/shoe_size_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.average_shoe_size,
                        unit: 'US size'
                    };
                    values.push(item.average_shoe_size);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#f3e5f5', '#7b1fa2');
            });
            
            return {
                id: 'shoe_size',
                title: 'Average Shoe Size',
                description: 'Countries colored by average shoe size',
                category: 'demographics',
                tags: ['shoe size', 'footwear', 'average size', 'demographics', 'clothing'],
                answer_variations: [
                    'shoe size',
                    'average shoe size',
                    'footwear size',
                    'shoe sizes',
                    'foot size'
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
            console.error('Error converting shoe size data:', error);
            return null;
        }
    }

    async convertExternalDebtData() {
        try {
            const response = await fetch('data/external_debt_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.external_debt_million_usd,
                        unit: 'million USD'
                    };
                    values.push(item.external_debt_million_usd);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffebee', '#c62828');
            });
            
            return {
                id: 'external_debt',
                title: 'External Debt',
                description: 'Countries colored by external debt',
                category: 'economics',
                tags: ['external debt', 'debt', 'foreign debt', 'national debt', 'financial debt'],
                answer_variations: [
                    'external debt',
                    'debt',
                    'foreign debt',
                    'national debt',
                    'external debt amount'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#ffebee',
                    maxColor: '#c62828',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting external debt data:', error);
            return null;
        }
    }

    async convertExternalDebtPercentGDPData() {
        try {
            const response = await fetch('data/external_debt_percent_gdp_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.external_debt_percent_gdp,
                        unit: '%'
                    };
                    values.push(item.external_debt_percent_gdp);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffebee', '#c62828');
            });
            
            return {
                id: 'external_debt_percent_gdp',
                title: 'External Debt % GDP',
                description: 'Countries colored by external debt as percentage of GDP',
                category: 'economics',
                tags: ['external debt gdp', 'debt percentage', 'debt ratio', 'financial debt', 'debt burden'],
                answer_variations: [
                    'external debt gdp',
                    'debt percentage',
                    'debt ratio',
                    'debt burden',
                    'debt gdp ratio'
                ],
                colorScheme: {
                    type: 'gradient',
                    minColor: '#ffebee',
                    maxColor: '#c62828',
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting external debt percent gdp data:', error);
            return null;
        }
    }

    async convertFIDETopFederationsData() {
        try {
            const response = await fetch('data/fide_top_federations_open_august_2025.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.average_rating,
                        unit: 'rating'
                    };
                    values.push(item.average_rating);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#f3e5f5', '#7b1fa2');
            });
            
            return {
                id: 'fide_top_federations',
                title: 'FIDE Top Federations',
                description: 'Countries colored by FIDE chess federation average rating',
                category: 'sports',
                tags: ['chess', 'fide', 'chess rating', 'chess federations', 'chess players'],
                answer_variations: [
                    'chess rating',
                    'fide rating',
                    'chess federations',
                    'chess players',
                    'chess average rating'
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
            console.error('Error converting fide top federations data:', error);
            return null;
        }
    }

    async convertSexRatioData() {
        try {
            const response = await fetch('data/sex_ratio_by_country.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.sex_ratio_males_per_100_females,
                        unit: 'males/100 females'
                    };
                    values.push(item.sex_ratio_males_per_100_females);
                }
            });
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            const colorScheme = this.getRandomColorScheme('gradient');
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, colorScheme);
            });
            
            return {
                id: 'sex_ratio',
                title: 'Sex Ratio',
                description: 'Countries colored by sex ratio (males per 100 females)',
                category: 'demographics',
                tags: ['sex ratio', 'gender ratio', 'male female ratio', 'demographics', 'population gender'],
                answer_variations: [
                    'sex ratio',
                    'gender ratio',
                    'male female ratio',
                    'sex ratio demographics',
                    'gender demographics'
                ],
                colorScheme: {
                    type: 'gradient',
                    colors: colorScheme,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting sex ratio data:', error);
            return null;
        }
    }

    async convertLandlockedNeighboursOceanAccessData() {
        try {
            const response = await fetch('data/landlocked_countries_neighbours_with_ocean_access.json');
            const data = await response.json();
            
            const countries = {};
            
            if (!data.data || !Array.isArray(data.data)) {
                console.log('⚠️ Data format not supported, skipping...');
                return null;
            }
            
            data.data.forEach(item => {
                if (item.country !== 'World') {
                    const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                    countries[mappedCountryName] = {
                        value: item.has_ocean_access_via_neighbours,
                        unit: 'ocean access',
                        color: item.has_ocean_access_via_neighbours ? '#22c55e' : '#ef4444'
                    };
                }
            });
            
            return {
                id: 'landlocked_neighbours_ocean_access',
                title: 'Landlocked Countries with Ocean Access',
                description: 'Landlocked countries that have ocean access through neighbors',
                category: 'geography',
                tags: ['landlocked', 'ocean access', 'geography', 'neighbors', 'coastal access'],
                answer_variations: [
                    'landlocked with ocean access',
                    'ocean access through neighbors',
                    'landlocked ocean access',
                    'coastal access through neighbors',
                    'ocean access via neighbors'
                ],
                colorScheme: {
                    type: 'categorical',
                    colors: ['#22c55e', '#ef4444'],
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error('Error converting landlocked neighbours ocean access data:', error);
            return null;
        }
    }

    

}

// Initialize quiz game when script loads
const quizGame = new QuizGame();
window.quizGame = quizGame;
