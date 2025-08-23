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
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        
        // Wait for map to be ready before loading quiz data
        const mapReady = await this.waitForMap();
        if (mapReady) {
            // Load quiz data after map is ready (lazy loading)
            await this.loadAllQuizData();
            this.updateModeToggle(); // Initialize mode toggle
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
            
            // Now convert and add all the new data files
            await this.loadConvertedData();
            
            console.log('🎮 Total quizzes available:', Object.keys(this.quizData.quizzes).length, 'quizzes');
            
            // Update dataset counter
            this.updateDatasetCounter();
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
            
            // Apply colors based on values
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#1b5e20');
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
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#0d47a1');
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
    
    async convertFertilityRateData() {
        try {
            const response = await fetch('data/total_fertility_rate_2025.json');
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data and collect values for color scaling
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
            
            // Apply colors based on values (pink gradient for fertility)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#880e4f');
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
                    minColor: '#fce4ec',
                    maxColor: '#c2185b',
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
            
            // Apply colors based on values (gold gradient for wealth)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#e65100');
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
                    minColor: '#fff8e1',
                    maxColor: '#f57f17',
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
            
            // Apply colors based on values (blue gradient for development)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#0d47a1');
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
                    minColor: '#e3f2fd',
                    maxColor: '#1565c0',
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
            
            // Apply colors based on values (green gradient for GDP)
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, '#ffffff', '#1b5e20');
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
                    minColor: '#e8f5e8',
                    maxColor: '#2e7d32',
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
            data.data.forEach(item => {
                const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                countries[mappedCountryName] = {
                    value: item.monarchy_type,
                    unit: 'monarchy type'
                };
                monarchyTypes[item.monarchy_type] = (monarchyTypes[item.monarchy_type] || 0) + 1;
            });

            // Create color scheme for monarchy types with contrasting colors
            const monarchyTypeList = Object.keys(monarchyTypes);
            const colors = [
                '#e74c3c', // Red
                '#3498db', // Blue
                '#2ecc71', // Green
                '#f39c12', // Orange
                '#9b59b6', // Purple
                '#1abc9c', // Teal
                '#e67e22', // Dark Orange
                '#34495e', // Dark Blue
                '#f1c40f', // Yellow
                '#e91e63', // Pink
                '#00bcd4', // Cyan
                '#795548'  // Brown
            ];
            
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
            data.data.forEach(item => {
                const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                countries[mappedCountryName] = {
                    value: item.party_system,
                    unit: 'party system'
                };
                partySystems[item.party_system] = (partySystems[item.party_system] || 0) + 1;
            });

            // Create color scheme for party systems with contrasting colors
            const partySystemList = Object.keys(partySystems);
            const colors = [
                '#e74c3c', // Red
                '#3498db', // Blue
                '#2ecc71', // Green
                '#f39c12', // Orange
                '#9b59b6', // Purple
                '#1abc9c', // Teal
                '#e67e22', // Dark Orange
                '#34495e', // Dark Blue
                '#f1c40f', // Yellow
                '#e91e63', // Pink
                '#00bcd4', // Cyan
                '#795548'  // Brown
            ];
            
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
            
            data.data.forEach(item => {
                const mappedCountryName = this.countryMapper.mapCountryName(item.country);
                if (mappedCountryName) {
                    const value = item.usd_exchange_rate;
                    countries[mappedCountryName] = {
                        value: value,
                        unit: 'USD rate'
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
            const colors = [
                '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
                '#1abc9c', '#e67e22', '#34495e', '#f1c40f', '#e91e63',
                '#00bcd4', '#795548', '#607d8b', '#ff5722', '#2196f3'
            ];
            
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
        // Enhanced contrast interpolation with dramatic non-linear curves
        // Use different curves for better visual distinction across the spectrum
        let enhancedRatio;
        
        if (ratio < 0.5) {
            // First half: slower progression for subtle differences
            enhancedRatio = Math.pow(ratio * 2, 0.5) * 0.5;
        } else {
            // Second half: faster progression for dramatic differences
            enhancedRatio = 0.5 + Math.pow((ratio - 0.5) * 2, 1.5) * 0.5;
        }
        
        // Support both old format (minColor, maxColor) and new format (colorScheme object)
        let color1, color2;
        
        if (typeof minColor === 'object' && minColor !== null) {
            // New format: colorScheme object
            if (minColor.colors && minColor.colors.length > 2) {
                return this.interpolateMultiColor(enhancedRatio, minColor.colors);
            }
            color1 = minColor.minColor || (minColor.colors && minColor.colors[0]) || '#ffffff';
            color2 = minColor.maxColor || (minColor.colors && minColor.colors[1]) || '#000000';
        } else {
            // Old format: minColor, maxColor strings
            color1 = minColor || '#ffffff';
            color2 = maxColor || '#000000';
        }
        
        // Ensure colors are strings and have the correct format
        if (typeof color1 !== 'string' || typeof color2 !== 'string') {
            console.warn('Invalid color format:', { color1, color2, minColor, maxColor });
            return '#ffffff'; // Default fallback
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
            return '#ffffff'; // Default fallback
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
        
        // Skip buttons
        const skipLeftBtn = document.getElementById('skipLeft');
        console.log('Setting up skipLeftBtn event listener, found:', skipLeftBtn);
        if (skipLeftBtn) {
            skipLeftBtn.addEventListener('click', () => {
                console.log('skipLeftBtn clicked!');
                this.skipToPreviousQuestion();
            });
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
        
        const userGuess = document.getElementById('guessInput').value.trim();
        
        // If answer is already shown, skip to next question
        if (this.isAnswerShown) {
            this.skipToNextQuestion();
            return;
        }
        
        if (!userGuess) return;
        
        // Transform button icon to check
        this.transformToCheckIcon();
        
        // Disable input and submit button
        const guessInput = document.getElementById('guessInput');
        const submitButton = document.getElementById('submitGuess');
        guessInput.disabled = true;
        submitButton.disabled = true;
        
        // Check if currentQuiz exists before accessing its properties
        if (!this.currentQuiz) {
            console.error('No current quiz available');
            this.showFeedback('Error: No quiz available', 'incorrect');
            return;
        }
        
        // Show the answer title
        this.showAnswerTitle();
        this.isAnswerShown = true;
        
        if (this.checkAnswer(userGuess)) {
            this.showFeedback(`Correct! This map shows ${this.currentQuiz.title}.`, 'correct');
            this.score++;
            this.updateScoreDisplay();
        } else {
            this.showFeedback(`Incorrect. The correct answer was: ${this.currentQuiz.title}`, 'incorrect');
        }
        
        // Show skip button for next question (only in learn mode)
        if (this.isLearnMode) {
            this.showSkipButton();
        } else {
            // In play mode, re-enable input for next question navigation
            const guessInput = document.getElementById('guessInput');
            if (guessInput) {
                guessInput.disabled = false;
                guessInput.value = '';
                guessInput.placeholder = 'Press Enter to continue...';
                guessInput.focus();
            }
        }
    }
    
    showAnswerTitle() {
        const answerTitle = document.getElementById('answerTitle');
        const answerTitleText = document.getElementById('answerTitleText');
        const answerDescription = document.getElementById('answerDescription');
        
        if (this.currentQuiz && answerTitle && answerTitleText && answerDescription) {
            answerTitleText.textContent = this.currentQuiz.title;
            answerDescription.textContent = this.currentQuiz.description;
            answerTitle.style.display = 'block';
        }
    }
    
    hideAnswerTitle() {
        const answerTitle = document.getElementById('answerTitle');
        if (answerTitle) {
            answerTitle.style.display = 'none';
        }
    }
    
    showSkipButton() {
        const skipLeftBtn = document.getElementById('skipLeft');
        const skipRightBtn = document.getElementById('skipRight');
        console.log('showSkipButton called, skipLeftBtn:', skipLeftBtn, 'skipRightBtn:', skipRightBtn);
        
        if (skipLeftBtn) {
            skipLeftBtn.style.display = 'flex';
            skipLeftBtn.disabled = false; // Ensure button is enabled
            console.log('Set skipLeftBtn display to flex, disabled:', skipLeftBtn.disabled);
        }
        if (skipRightBtn) {
            skipRightBtn.style.display = 'flex';
            skipRightBtn.disabled = false; // Ensure button is enabled
            console.log('Set skipRightBtn display to flex, disabled:', skipRightBtn.disabled);
        }
    }
    
    hideSkipButton() {
        const skipLeftBtn = document.getElementById('skipLeft');
        const skipRightBtn = document.getElementById('skipRight');
        if (skipLeftBtn) {
            skipLeftBtn.style.display = 'none';
        }
        if (skipRightBtn) {
            skipRightBtn.style.display = 'none';
        }
    }
    
    skipToPreviousQuestion() {
        console.log('skipToPreviousQuestion called, isLearnMode:', this.isLearnMode);
        console.log('Current sequence length:', this.learnModeSequence.length, 'Current index:', this.learnModeCurrentIndex);
        
        if (this.isLearnMode) {
            // In learn mode, go to previous dataset in sequence
            if (this.learnModeSequence.length === 0) {
                console.log('No sequence found, generating new one');
                this.generateLearnModeSequence();
            }
            
            // Move to previous index (with wraparound)
            this.learnModeCurrentIndex = (this.learnModeCurrentIndex - 1 + this.learnModeSequence.length) % this.learnModeSequence.length;
            console.log('Moving to previous index:', this.learnModeCurrentIndex);
            this.loadRandomDataset();
        } else {
            // In play mode, go to previous question if possible
            if (this.currentProgress > 0) {
                this.currentProgress--;
                this.startNewQuiz();
            }
        }
    }
    
    skipToNextQuestion() {
        console.log('skipToNextQuestion called, isLearnMode:', this.isLearnMode);
        
        if (this.isLearnMode) {
            // In learn mode, go to next dataset in sequence
            if (this.learnModeSequence.length === 0) {
                this.generateLearnModeSequence();
            }
            
            // Move to next index (with wraparound)
            this.learnModeCurrentIndex = (this.learnModeCurrentIndex + 1) % this.learnModeSequence.length;
            console.log('Moving to next index:', this.learnModeCurrentIndex);
            this.loadRandomDataset();
        } else {
            // In play mode, only proceed if not at the end
            if (this.currentProgress < 10) {
                this.startNewQuiz();
            } else {
                // If at the end, show completion
                this.showCompletionMessage();
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
        
        console.log('Generated new learn mode sequence with', this.learnModeSequence.length, 'datasets');
        console.log('First few datasets in sequence:', this.learnModeSequence.slice(0, 3).map(d => d.title));
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
            console.log('Applying dataset to map:', {
                quizTitle: this.currentQuiz.title,
                countriesCount: Object.keys(this.currentQuiz.countries).length,
                sequenceIndex: this.learnModeCurrentIndex + 1,
                totalInSequence: this.learnModeSequence.length
            });
            window.mapInstance.applyQuizConfiguration(this.currentQuiz);
        }
        
        // Show the answer title in learn mode
        this.showAnswerTitle();
        
        // Reset answer shown flag for learn mode
        this.isAnswerShown = false;
        
        // Ensure skip buttons are still visible and enabled in learn mode
        if (this.isLearnMode) {
            this.showSkipButton();
        }
        
        console.log('Loaded dataset from sequence:', this.currentQuiz.title, `(${this.learnModeCurrentIndex + 1}/${this.learnModeSequence.length})`);
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
            guessInput.placeholder = 'Explore the data — click a country or start typing…';
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
            
            // Show answer title in learn mode
            if (this.isLearnMode) {
                this.showAnswerTitle();
            }
            
            // Update active item in browser
            this.updateActiveDatasetInBrowser();
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
        } else {
            // In play mode, hide answer and enable input
            this.hideAnswerTitle();
            this.hideSkipButton();
            
            // Reset input and button for play mode
            const guessInput = document.getElementById('guessInput');
            const submitButton = document.getElementById('submitGuess');
            
            guessInput.disabled = false;
            submitButton.style.display = 'flex';
            submitButton.disabled = true; // Will be enabled when user types
            guessInput.value = '';
            guessInput.placeholder = 'What does this map show?';
            guessInput.focus();
            
            // Ensure skip buttons are hidden in play mode
            this.hideSkipButton();
        }
        
        // Only reset progress bar if we're starting fresh (not just changing quiz)
        if (this.currentProgress === 0) {
            this.resetProgressBar();
        }
        
        // Select random quiz with better randomization
        const quizIds = Object.keys(this.quizData.quizzes);
        if (quizIds.length === 0) {
            console.error('No quizzes available');
            return;
        }
        
        // Use Fisher-Yates shuffle for better randomization
        const shuffledQuizIds = [...quizIds];
        for (let i = shuffledQuizIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledQuizIds[i], shuffledQuizIds[j]] = [shuffledQuizIds[j], shuffledQuizIds[i]];
        }
        
        const randomQuizId = shuffledQuizIds[0];
        this.currentQuiz = this.quizData.quizzes[randomQuizId];
        
        // Apply random color variations to the quiz
        this.applyRandomColorVariations();
        
        // Apply quiz to map
        if (window.mapInstance && this.currentQuiz) {
            console.log('Applying quiz to map:', {
                quizTitle: this.currentQuiz.title,
                countriesCount: Object.keys(this.currentQuiz.countries).length,
                sampleCountries: Object.keys(this.currentQuiz.countries).slice(0, 5),
                hasUnitedStates: !!this.currentQuiz.countries['United States of America']
            });
            window.mapInstance.applyQuizConfiguration(this.currentQuiz);
        }
        
        if (this.currentQuiz) {
            console.log('Started new quiz:', this.currentQuiz.title);
            
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
            }
            
            // Transform back to arrow-up icon after a delay
            setTimeout(() => {
                this.transformToArrowIcon();
            }, 2000);
        }
    }
    
    transformToArrowIcon() {
        const submitBtn = document.getElementById('submitGuess');
        if (submitBtn) {
            // Replace the SVG content with arrow-up icon
            const svg = submitBtn.querySelector('svg');
            if (svg) {
                svg.innerHTML = '<path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path>';
            }
        }
    }
    
    checkAnswer(userGuess) {
        if (!this.currentQuiz) return false;
        
        const normalizedGuess = userGuess.toLowerCase().trim();
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
            
            let wordMatchCount = 0;
            for (const correctWord of correctWords) {
                for (const userWord of userWords) {
                    if (userWord.includes(correctWord) || correctWord.includes(userWord)) {
                        wordMatchCount++;
                        break;
                    }
                }
            }
            
            // If more than 50% of key words match, consider it correct
            if (wordMatchCount >= Math.ceil(correctWords.length * 0.5)) {
                return true;
            }
            
            // Strategy 2: Check for partial matches (user guess is part of correct answer or vice versa)
            if (normalizedGuess.includes(correctAnswer) || correctAnswer.includes(normalizedGuess)) {
                return true;
            }
            
            // Strategy 3: Check for acronyms and abbreviations
            if (this.checkAcronymMatch(normalizedGuess, correctAnswer)) {
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
        // Common synonyms and variations
        const synonyms = {
            'population': ['people', 'inhabitants', 'residents', 'citizens'],
            'gdp': ['gross domestic product', 'economic output', 'economy'],
            'gni': ['gross national income', 'national income'],
            'hdi': ['human development index', 'development index', 'human development'],
            'area': ['land area', 'size', 'territory', 'landmass'],
            'density': ['population density', 'people per km2', 'crowding'],
            'fertility': ['birth rate', 'fertility rate', 'births per woman'],
            'literacy': ['literacy rate', 'reading ability', 'education level'],
            'temperature': ['temp', 'climate', 'weather'],
            'water': ['water percentage', 'water coverage', 'water area'],
            'arable': ['farmland', 'agricultural land', 'cultivable land'],
            'income': ['money', 'wealth', 'earnings', 'salary'],
            'development': ['progress', 'advancement', 'growth'],
            'quality of life': ['living standards', 'life quality', 'wellbeing'],
            'neighbours': ['borders', 'neighbors', 'adjacent countries', 'surrounding countries'],
            'height': ['tallness', 'stature', 'physical height', 'body height'],
            'age': ['median age', 'average age', 'demographic age', 'population age'],
            'islands': ['island count', 'number of islands', 'island territory', 'archipelago'],
            'phones': ['mobile phones', 'cell phones', 'mobile devices', 'telecommunications'],
            'flag': ['national flag', 'country flag', 'flag adoption', 'national symbol'],
            'monarchy': ['kings', 'queens', 'royalty', 'monarchs', 'crown'],
            'party system': ['political parties', 'democracy', 'political system', 'government type'],
            'exports': ['trade exports', 'international trade', 'goods exports', 'commerce'],
            'imports': ['trade imports', 'international imports', 'goods imports', 'commerce']
        };
        
        for (const [key, synonymList] of Object.entries(synonyms)) {
            if (correctAnswer.includes(key)) {
                for (const synonym of synonymList) {
                    if (userGuess.includes(synonym) || synonym.includes(userGuess)) {
                        return true;
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
            currentCircle.classList.remove('current');
            currentCircle.classList.add(isCorrect ? 'correct' : 'incorrect');
            currentCircle.setAttribute('data-lucide', 'circle');
            
            // Move to next circle
            this.currentProgress++;
            
            // Check if we've completed all 10 questions
            if (this.currentProgress >= circles.length) {
                // Show completion message
                this.showCompletionMessage();
                return;
            }
            
            // Update next circle to current if available
            if (this.currentProgress < circles.length) {
                const nextCircle = circles[this.currentProgress];
                nextCircle.classList.remove('correct', 'incorrect');
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
            circle.classList.remove('current', 'correct', 'incorrect');
            
            if (index === 0) {
                circle.classList.add('current');
                circle.setAttribute('data-lucide', 'circle');
            } else {
                circle.setAttribute('data-lucide', 'circle-dashed');
            }
        });
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    showCompletionMessage() {
        // Disable input and button
        const guessInput = document.getElementById('guessInput');
        const submitButton = document.getElementById('submitGuess');
        guessInput.disabled = true;
        submitButton.disabled = true;
        
        // Calculate final score
        const correctAnswers = document.querySelectorAll('.progress-circle.correct').length;
        const totalQuestions = 10;
        
        // Create completion screen
        this.showCompletionScreen(correctAnswers, totalQuestions);
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
    
    restartQuiz() {
        // Remove completion screen if it exists
        const completionScreen = document.querySelector('.completion-screen');
        if (completionScreen) {
            completionScreen.remove();
        }
        
        // Reset progress
        this.currentProgress = 0;
        this.score = 0;
        
        // Reset progress bar
        this.resetProgressBar();
        
        // Clear feedback
        this.clearFeedback();
        
        // Re-enable input and button
        const guessInput = document.getElementById('guessInput');
        const submitButton = document.getElementById('submitGuess');
        guessInput.disabled = false;
        submitButton.disabled = false;
        guessInput.value = '';
        guessInput.focus();
        
        // Start new quiz
        this.startNewQuiz();
    }
    
    updateDatasetCounter() {
        const datasetCountElement = document.getElementById('datasetCount');
        if (datasetCountElement) {
            const totalQuizzes = Object.keys(this.quizData.quizzes).length;
            datasetCountElement.textContent = totalQuizzes;
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
}

// Initialize quiz game when script loads
const quizGame = new QuizGame();
window.quizGame = quizGame;
