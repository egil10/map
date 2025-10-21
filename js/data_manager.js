// Data Manager - Handles all data conversion efficiently
class DataManager {
    constructor() {
        this.quizData = null;
        this.dataConfigs = new Map();
        this.initializeDataConfigs();
    }

    initializeDataConfigs() {
        // Configuration for all data files - replaces 133 individual methods
        const configs = {
            'land_area': {
                valueField: 'land_area_km2',
                unit: 'km²',
                title: 'Land Area',
                category: 'geography',
                tags: ['land area', 'area', 'size', 'geography'],
                answerVariations: ['land area', 'area', 'country size', 'territory size'],
                colorScheme: { minColor: '#e8f5e8', maxColor: '#2e7d32' }
            },
            'percent_water': {
                valueField: 'percent_water',
                unit: '%',
                title: 'Water Percentage',
                category: 'geography',
                tags: ['water', 'percentage', 'water coverage'],
                answerVariations: ['water percentage', 'water coverage', 'water area'],
                colorScheme: { minColor: '#e3f2fd', maxColor: '#1976d2' }
            },
            'arable_land_per_person': {
                valueField: 'arable_land_per_person_m2',
                unit: 'm²/person',
                title: 'Arable Land per Person',
                category: 'agriculture',
                tags: ['arable land', 'agriculture', 'farming'],
                answerVariations: ['arable land per person', 'arable land', 'agricultural land'],
                colorScheme: { minColor: '#fff3e0', maxColor: '#8d6e63' }
            },
            'population_density': {
                valueField: 'density_km2',
                unit: 'people/km²',
                title: 'Population Density',
                category: 'demographics',
                tags: ['population density', 'density', 'people per area'],
                answerVariations: ['population density', 'density', 'people per square kilometer'],
                colorScheme: { minColor: '#f3e5f5', maxColor: '#7b1fa2' }
            },
            'world_population_2025': {
                valueField: 'population_2025',
                unit: 'people',
                title: 'Population 2025',
                category: 'demographics',
                tags: ['population', 'people', 'demographics'],
                answerVariations: ['population', 'people', 'population size'],
                colorScheme: { minColor: '#fff3e0', maxColor: '#ff5722' }
            },
            'gdp_by_country_2025': {
                valueField: 'gdp_2025',
                unit: 'USD',
                title: 'GDP 2025',
                category: 'economics',
                tags: ['gdp', 'economy', 'economics'],
                answerVariations: ['gdp', 'gross domestic product', 'economy'],
                colorScheme: { minColor: '#e8f5e8', maxColor: '#2e7d32' }
            }
        };

        // Store all configurations
        Object.entries(configs).forEach(([key, config]) => {
            this.dataConfigs.set(key, config);
        });
    }

    async loadAllQuizData() {
        try {
            const response = await fetch('data/quiz_data.json');
            this.quizData = await response.json();
            console.log('📊 Loaded existing quiz data');
        } catch (error) {
            console.error('❌ Failed to load quiz data:', error);
            this.quizData = { quizzes: {} };
        }
    }

    async convertDataFile(fileName, config) {
        try {
            const response = await fetch(`data/${fileName}.json`);
            const data = await response.json();
            
            const countries = {};
            const values = [];
            
            // Process data based on structure
            if (data.data && Array.isArray(data.data)) {
                // Array format
                data.data.forEach(item => {
                    if (item.country && item[config.valueField] !== undefined) {
                        countries[item.country] = {
                            value: item[config.valueField],
                            unit: config.unit
                        };
                        values.push(item[config.valueField]);
                    }
                });
            } else if (typeof data === 'object') {
                // Object format
                Object.entries(data).forEach(([country, value]) => {
                    if (country !== 'title' && country !== 'description' && typeof value === 'number') {
                        countries[country] = {
                            value: value,
                            unit: config.unit
                        };
                        values.push(value);
                    }
                });
            }
            
            if (values.length === 0) {
                console.warn(`No valid data found in ${fileName}`);
                return null;
            }
            
            // Apply colors based on values
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            
            Object.keys(countries).forEach(country => {
                const value = countries[country].value;
                const ratio = (value - minValue) / (maxValue - minValue);
                countries[country].color = this.getColorForRatio(ratio, config.colorScheme.minColor, config.colorScheme.maxColor);
            });
            
            return {
                id: fileName,
                title: config.title,
                description: `Countries colored by ${config.title.toLowerCase()}`,
                category: config.category,
                tags: config.tags,
                answer_variations: config.answerVariations,
                colorScheme: {
                    type: 'gradient',
                    minColor: config.colorScheme.minColor,
                    maxColor: config.colorScheme.maxColor,
                    defaultColor: '#ffffff'
                },
                countries: countries
            };
        } catch (error) {
            console.error(`❌ Error converting ${fileName}:`, error);
            return null;
        }
    }

    getColorForRatio(ratio, minColor, maxColor) {
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

    async convertAllDataFiles() {
        await this.loadAllQuizData();
        
        const newQuizzes = {};
        
        // Convert each configured data file
        for (const [fileName, config] of this.dataConfigs) {
            const quiz = await this.convertDataFile(fileName, config);
            if (quiz) {
                newQuizzes[quiz.id] = quiz;
                console.log(`✅ Converted ${quiz.title}`);
            }
        }
        
        // Merge with existing quizzes
        const updatedQuizData = {
            quizzes: {
                ...this.quizData.quizzes,
                ...newQuizzes
            }
        };
        
        return updatedQuizData;
    }
}

// Export for use
window.DataManager = DataManager;
