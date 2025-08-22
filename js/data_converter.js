// Data Converter Utility for GeoQuest
// Converts raw JSON data files into quiz format

class DataConverter {
    constructor() {
        this.quizData = null;
    }
    
    async loadExistingQuizData() {
        try {
            const response = await fetch('data/quiz_data.json');
            this.quizData = await response.json();
        } catch (error) {
            console.error('Error loading existing quiz data:', error);
            this.quizData = { quizzes: {} };
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
                    countries[item.country] = {
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
                    countries[item.country] = {
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
                    countries[item.country] = {
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
                    countries[item.country] = {
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
    
    async convertAllData() {
        await this.loadExistingQuizData();
        
        const newQuizzes = {};
        
        // Convert each data file
        const landAreaQuiz = await this.convertLandAreaData();
        if (landAreaQuiz) {
            newQuizzes[landAreaQuiz.id] = landAreaQuiz;
        }
        
        const waterPercentageQuiz = await this.convertWaterPercentageData();
        if (waterPercentageQuiz) {
            newQuizzes[waterPercentageQuiz.id] = waterPercentageQuiz;
        }
        
        const arableLandQuiz = await this.convertArableLandData();
        if (arableLandQuiz) {
            newQuizzes[arableLandQuiz.id] = arableLandQuiz;
        }
        
        const populationDensityQuiz = await this.convertPopulationDensityData();
        if (populationDensityQuiz) {
            newQuizzes[populationDensityQuiz.id] = populationDensityQuiz;
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

// Export for use in other scripts
window.DataConverter = DataConverter;
