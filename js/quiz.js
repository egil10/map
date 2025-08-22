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
        
        this.init();
    }
    
    async init() {
        await this.loadAllQuizData();
        this.setupEventListeners();
        
        // Wait for map to be ready before starting quiz
        const mapReady = await this.waitForMap();
        if (mapReady) {
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
                totalCountries: Object.keys(countries).length
            });
            
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
                        value: item.male_median_age,
                        unit: 'years'
                    };
                    values.push(item.male_median_age);
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
    
    getColorForRatio(ratio, minColor, maxColor) {
        // Enhanced contrast interpolation with non-linear curve for better visual distinction
        // Apply a curve to make differences more pronounced
        const enhancedRatio = Math.pow(ratio, 0.7); // Makes differences more visible in mid-range
        
        const r1 = parseInt(minColor.slice(1, 3), 16);
        const g1 = parseInt(minColor.slice(3, 5), 16);
        const b1 = parseInt(minColor.slice(5, 7), 16);
        
        const r2 = parseInt(maxColor.slice(1, 3), 16);
        const g2 = parseInt(maxColor.slice(3, 5), 16);
        const b2 = parseInt(maxColor.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * enhancedRatio);
        const g = Math.round(g1 + (g2 - g1) * enhancedRatio);
        const b = Math.round(b1 + (b2 - b1) * enhancedRatio);
        
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
        }
        
        // Skip quiz button (if it exists)
        const skipBtn = document.getElementById('skipQuiz');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipQuiz());
        }
    }
    
    handleSubmitGuess() {
        const userGuess = document.getElementById('guessInput').value.trim();
        if (!userGuess) return;
        
        // Transform button icon to check
        this.transformToCheckIcon();
        
        // Disable input and button
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
        
        if (this.checkAnswer(userGuess)) {
            this.showFeedback(`Correct! This map shows ${this.currentQuiz.title}.`, 'correct');
            this.score++;
            this.updateScoreDisplay();
            
            // Only start new quiz if not at the end
            if (this.currentProgress < 9) { // 9 because we're about to increment to 10
                setTimeout(() => {
                    this.startNewQuiz();
                }, 3000);
            }
        } else {
            this.showFeedback(`Incorrect. The correct answer was: ${this.currentQuiz.title}`, 'incorrect');
            
            // Only start new quiz if not at the end
            if (this.currentProgress < 9) { // 9 because we're about to increment to 10
                setTimeout(() => {
                    this.startNewQuiz();
                }, 4000);
            }
        }
    }
    
    startNewQuiz() {
        // Clear feedback
        this.clearFeedback();
        
        // Reset progress bar
        this.resetProgressBar();
        
        // Reset input and button
        const guessInput = document.getElementById('guessInput');
        const submitButton = document.getElementById('submitGuess');
        
        guessInput.disabled = false;
        submitButton.disabled = false;
        guessInput.value = '';
        guessInput.focus();
        
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
            window.mapInstance.applyQuizConfiguration(this.currentQuiz);
        }
        
        if (this.currentQuiz) {
            console.log('Started new quiz:', this.currentQuiz.title);
        } else {
            console.error('Failed to start new quiz');
        }
    }
    
    applyRandomColorVariations() {
        if (!this.currentQuiz || !this.currentQuiz.countries) return;
        
        // Define multiple color schemes for variety
        const colorSchemes = [
            { minColor: '#e8f5e8', maxColor: '#2e7d32' }, // Green
            { minColor: '#e3f2fd', maxColor: '#1565c0' }, // Blue
            { minColor: '#fff3e0', maxColor: '#e65100' }, // Orange
            { minColor: '#f3e5f5', maxColor: '#7b1fa2' }, // Purple
            { minColor: '#ffebee', maxColor: '#c62828' }, // Red
            { minColor: '#fff8e1', maxColor: '#f57f17' }, // Gold
            { minColor: '#e0f7fa', maxColor: '#00838f' }, // Teal
            { minColor: '#fce4ec', maxColor: '#c2185b' }, // Pink
            { minColor: '#eceff1', maxColor: '#546e7a' }, // Gray
            { minColor: '#e8f5e8', maxColor: '#1b5e20' }, // Dark Green
            { minColor: '#e1f5fe', maxColor: '#0277bd' }, // Light Blue
            { minColor: '#fff8e1', maxColor: '#f9a825' }  // Amber
        ];
        
        // Randomly select a color scheme
        const selectedScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
        
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
                this.currentQuiz.countries[country].color = this.getColorForRatio(ratio, selectedScheme.minColor, selectedScheme.maxColor);
            }
        });
        
        // Update the quiz's color scheme
        this.currentQuiz.colorScheme = {
            type: 'gradient',
            minColor: selectedScheme.minColor,
            maxColor: selectedScheme.maxColor,
            defaultColor: '#ffffff'
        };
    }
    
    transformToCheckIcon() {
        const submitIcon = document.getElementById('submitIcon');
        if (submitIcon) {
            // Remove old icon
            submitIcon.remove();
            
            // Create new check icon
            const checkIcon = document.createElement('i');
            checkIcon.setAttribute('data-lucide', 'check');
            checkIcon.id = 'submitIcon';
            
            // Add to button
            const submitBtn = document.getElementById('submitGuess');
            submitBtn.appendChild(checkIcon);
            
            // Reinitialize Lucide icons
            lucide.createIcons();
            
            // Transform back to send icon after a delay
            setTimeout(() => {
                this.transformToSendIcon();
            }, 2000);
        }
    }
    
    transformToSendIcon() {
        const submitIcon = document.getElementById('submitIcon');
        if (submitIcon) {
            // Remove old icon
            submitIcon.remove();
            
            // Create new send icon
            const sendIcon = document.createElement('i');
            sendIcon.setAttribute('data-lucide', 'send');
            sendIcon.id = 'submitIcon';
            
            // Add to button
            const submitBtn = document.getElementById('submitGuess');
            submitBtn.appendChild(sendIcon);
            
            // Reinitialize Lucide icons
            lucide.createIcons();
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
        
        // Show completion message
        this.showFeedback(`🎉 Quiz Complete! You got ${correctAnswers}/${totalQuestions} correct. Click "Replay" to start over!`, 'correct');
        
        // Add replay button
        this.addReplayButton();
    }
    
    addReplayButton() {
        // Remove existing replay button if any
        const existingReplay = document.querySelector('.replay-button');
        if (existingReplay) {
            existingReplay.remove();
        }
        
        // Create replay button
        const replayButton = document.createElement('button');
        replayButton.className = 'btn replay-button';
        replayButton.textContent = 'Replay Quiz';
        replayButton.style.cssText = `
            margin-top: 10px;
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        `;
        
        // Add click handler
        replayButton.addEventListener('click', () => {
            this.restartQuiz();
        });
        
        // Add to feedback area
        const feedback = document.getElementById('guessFeedback');
        feedback.appendChild(replayButton);
    }
    
    restartQuiz() {
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
}

// Initialize quiz game when script loads
const quizGame = new QuizGame();
