/**
 * Test Country Mapping
 * Tests the comprehensive country mapping system
 */

class CountryMappingTester {
    constructor() {
        this.mappingData = null;
        this.testCases = [
            // Basic country names
            { input: "United States", expected: "United States" },
            { input: "China", expected: "China" },
            { input: "Germany", expected: "Germany" },
            
            // ISO codes
            { input: "US", expected: "United States" },
            { input: "CN", expected: "China" },
            { input: "DE", expected: "Germany" },
            
            // Common aliases
            { input: "USA", expected: "United States" },
            { input: "UK", expected: "United Kingdom" },
            { input: "UAE", expected: "United Arab Emirates" },
            
            // Hong Kong variations
            { input: "Hong Kong", expected: "Hong Kong" },
            { input: "Hong Kong (CN)", expected: "Hong Kong" },
            { input: "Hong Kong (China)", expected: "Hong Kong" },
            
            // Macau variations
            { input: "Macau", expected: "Macau" },
            { input: "Macao", expected: "Macau" },
            { input: "Macau (CN)", expected: "Macau" },
            { input: "Macau (China)", expected: "Macau" },
            
            // Korea variations
            { input: "South Korea", expected: "South Korea" },
            { input: "Korea, Rep.", expected: "South Korea" },
            { input: "Republic of Korea", expected: "South Korea" },
            { input: "North Korea", expected: "North Korea" },
            
            // Congo variations
            { input: "Congo", expected: "Republic of the Congo" },
            { input: "Republic of the Congo", expected: "Republic of the Congo" },
            { input: "Democratic Republic of the Congo", expected: "Democratic Republic of the Congo" },
            { input: "DR Congo", expected: "Democratic Republic of the Congo" },
            { input: "DRC", expected: "Democratic Republic of the Congo" },
            
            // Other variations
            { input: "Czech Republic", expected: "Czech Republic" },
            { input: "Czechia", expected: "Czech Republic" },
            { input: "Russia", expected: "Russia" },
            { input: "Russian Federation", expected: "Russia" }
        ];
    }

    async loadMappingData() {
        try {
            const response = await fetch('data/country_mapping.json');
            this.mappingData = await response.json();
            console.log('✅ Loaded comprehensive country mapping data');
            return true;
        } catch (error) {
            console.error('❌ Failed to load mapping data:', error);
            return false;
        }
    }

    getStandardName(input) {
        if (!this.mappingData || !input) return null;
        
        const normalizedInput = input.trim();
        
        // Check common aliases first
        if (this.mappingData.common_aliases && this.mappingData.common_aliases[normalizedInput]) {
            const iso2 = this.mappingData.common_aliases[normalizedInput];
            return this.mappingData.countries[iso2]?.name || null;
        }
        
        // Search through all countries
        for (const [iso2, country] of Object.entries(this.mappingData.countries)) {
            // Check if input matches ISO codes
            if (country.iso2 === normalizedInput || country.iso3 === normalizedInput) {
                return country.name;
            }
            
            // Check if input matches country name
            if (country.name.toLowerCase() === normalizedInput.toLowerCase()) {
                return country.name;
            }
            
            // Check aliases
            if (country.aliases && country.aliases.some(alias => 
                alias.toLowerCase() === normalizedInput.toLowerCase())) {
                return country.name;
            }
        }
        
        // Check special cases (microstates, territories)
        for (const category of ['microstates', 'territories']) {
            if (this.mappingData.special_cases && this.mappingData.special_cases[category]) {
                for (const [iso2, country] of Object.entries(this.mappingData.special_cases[category])) {
                    if (country.iso2 === normalizedInput || country.iso3 === normalizedInput) {
                        return country.name;
                    }
                    if (country.name.toLowerCase() === normalizedInput.toLowerCase()) {
                        return country.name;
                    }
                    if (country.aliases && country.aliases.some(alias => 
                        alias.toLowerCase() === normalizedInput.toLowerCase())) {
                        return country.name;
                    }
                }
            }
        }
        
        return null;
    }

    async runTests() {
        console.log('🧪 Running Country Mapping Tests...\n');
        
        if (!await this.loadMappingData()) {
            console.log('❌ Cannot run tests - failed to load mapping data');
            return;
        }
        
        let passed = 0;
        let failed = 0;
        const failures = [];
        
        for (const testCase of this.testCases) {
            const result = this.getStandardName(testCase.input);
            const success = result === testCase.expected;
            
            if (success) {
                console.log(`✅ "${testCase.input}" → "${result}"`);
                passed++;
            } else {
                console.log(`❌ "${testCase.input}" → "${result}" (expected: "${testCase.expected}")`);
                failed++;
                failures.push({
                    input: testCase.input,
                    expected: testCase.expected,
                    actual: result
                });
            }
        }
        
        console.log(`\n📊 Test Results:`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
        
        if (failures.length > 0) {
            console.log('\n🔍 Failed Tests:');
            for (const failure of failures) {
                console.log(`  - "${failure.input}" → "${failure.actual}" (expected: "${failure.expected}")`);
            }
        }
        
        return { passed, failed, failures };
    }

    async testDataFiles() {
        console.log('\n🔍 Testing Real Data Files...\n');
        
        const testFiles = [
            'world_population_2025.json',
            'gdp_by_country_2025.json',
            'quiz_data.json'
        ];
        
        for (const filename of testFiles) {
            try {
                const response = await fetch(`data/${filename}`);
                const data = await response.json();
                const countries = this.extractCountries(data);
                
                console.log(`📁 ${filename}:`);
                let unmappedCount = 0;
                
                for (const country of countries) {
                    const mapped = this.getStandardName(country);
                    if (!mapped) {
                        console.log(`  ❌ Unmapped: "${country}"`);
                        unmappedCount++;
                    }
                }
                
                if (unmappedCount === 0) {
                    console.log(`  ✅ All ${countries.length} countries mapped successfully`);
                } else {
                    console.log(`  ⚠️  ${unmappedCount} unmapped countries out of ${countries.length}`);
                }
                console.log('');
                
            } catch (error) {
                console.log(`❌ Failed to test ${filename}:`, error);
            }
        }
    }

    extractCountries(data) {
        const countries = new Set();
        
        // Handle different data structures
        if (data.quizzes) {
            // Quiz data structure
            for (const quizId in data.quizzes) {
                const quiz = data.quizzes[quizId];
                if (quiz.countries) {
                    for (const country in quiz.countries) {
                        countries.add(country);
                    }
                }
            }
        } else if (data.data && Array.isArray(data.data)) {
            // Array data structure
            for (const item of data.data) {
                if (item.country) {
                    countries.add(item.country);
                }
            }
        } else if (typeof data === 'object') {
            // Object data structure
            for (const key in data) {
                if (key !== 'title' && key !== 'description' && key !== 'category' && key !== 'tags') {
                    countries.add(key);
                }
            }
        }
        
        return Array.from(countries);
    }
}

// Auto-run tests when loaded
document.addEventListener('DOMContentLoaded', async () => {
    const tester = new CountryMappingTester();
    await tester.runTests();
    await tester.testDataFiles();
});

// Export for manual use
window.CountryMappingTester = CountryMappingTester;
