/**
 * Country Mapping Analysis Tool
 * Analyzes all data files to identify unmapped countries
 */

class CountryMappingAnalyzer {
    constructor() {
        this.mappingData = null;
        this.unmappedCountries = new Set();
        this.dataFiles = [];
        this.countryFrequency = new Map();
    }

    async loadMappingData() {
        try {
            const response = await fetch('data/country_mapping.json');
            this.mappingData = await response.json();
            console.log('Loaded comprehensive country mapping data');
        } catch (error) {
            console.error('Failed to load mapping data:', error);
        }
    }

    async analyzeDataFiles() {
        // Get list of data files
        const dataFiles = await this.getDataFiles();
        console.log(`Analyzing ${dataFiles.length} data files...`);

        for (const file of dataFiles) {
            try {
                const response = await fetch(`data/${file}`);
                const data = await response.json();
                await this.analyzeFile(file, data);
            } catch (error) {
                console.warn(`Failed to analyze ${file}:`, error);
            }
        }

        this.generateReport();
    }

    async getDataFiles() {
        // This would normally fetch from the server, but for now we'll use a hardcoded list
        // In a real implementation, you'd fetch this from the server
        return [
            'world_population_2025.json',
            'gdp_by_country_2025.json',
            'quiz_data.json',
            'hdi_by_country_2023.json',
            'gni_per_capita_2024.json',
            'total_fertility_rate_2025.json',
            'carbon_emissions_by_country.json',
            'alcohol_consumption_per_capita_by_country.json',
            'coffee_consumption_per_capita_by_country.json',
            'wine_consumption_per_capita_by_country.json',
            'tea_consumption_per_capita_by_country.json',
            'average_height_by_country.json',
            'male_median_age_by_country.json',
            'sex_ratio_by_country.json',
            'total_literacy_rate_by_country.json',
            'internet_usage_by_country.json',
            'mobile_phone_numbers_by_country.json',
            'fixed_broadband_subscriptions_by_country.json',
            'internet_speed_by_country.json',
            'mobile_connection_speed_by_country.json',
            'land_area.json',
            'population_density.json',
            'percent_water.json',
            'arable_land_per_person.json',
            'forest_area_km2_by_country.json',
            'forest_area_percentage_by_country.json',
            'maximum_elevation_by_country.json',
            'lowest_temperature_by_country.json',
            'highest_temperature_by_country.json',
            'time_zones_by_country.json',
            'distinct_land_neighbours_by_country.json',
            'landlocked_countries.json',
            'landlocked_countries_neighbours_with_ocean_access.json',
            'number_of_islands_by_country.json',
            'waterways_length_by_country.json',
            'road_network_size_by_country.json',
            'high_speed_rail_by_country.json',
            'container_port_traffic_by_country.json',
            'motor_vehicle_production_2024.json',
            'steel_production_by_country.json',
            'oil_production_by_country.json',
            'wheat_production_by_country.json',
            'cocoa_production_by_country.json',
            'wine_production_by_country.json',
            'fish_by_country.json',
            'mammals_by_country.json',
            'birds_by_country.json',
            'reptiles_by_country.json',
            'amphibians_by_country.json',
            'plants_wcmc_by_country.json',
            'living_languages_by_country.json',
            'english_primary_language_by_country.json',
            'english_speakers_total_by_country.json',
            'english_speaking_population_by_country.json',
            'chinese_native_speakers_by_country.json',
            'spanish_native_speakers_by_country.json',
            'french_official_language_status_by_country.json',
            'german_native_speakers_by_country.json',
            'afrikaans_dutch_native_speakers_by_country.json',
            'official_languages_by_country.json',
            'national_capitals_by_country.json',
            'national_capitals_population_by_country.json',
            'national_capitals_population_percentage_by_country.json',
            'currencies_by_country.json',
            'currency_exchange_rate_usd.json',
            'usd_to_country_currencies.json',
            'corporate_tax_by_country.json',
            'external_debt_by_country.json',
            'external_debt_percent_gdp_by_country.json',
            'median_wealth_per_adult_2023.json',
            'wealth_gini_percent_by_country.json',
            'billionaires_by_country.json',
            'stock_market_capitalization_by_country.json',
            'world_bank_income_group_by_country.json',
            'gdp_per_working_hour_2023.json',
            'average_annual_wages_usd_ppp_2023.json',
            'marriage_rate_per_1000_by_country.json',
            'age_of_consent_by_country.json',
            'traffic_related_death_rate_by_country.json',
            'total_naval_assets_by_country.json',
            'active_military_by_country.json',
            'firearms_per_100_by_country.json',
            'blood_types_by_country.json',
            'shoe_size_by_country.json',
            'flags_without_red.json',
            'red_flag_countries.json',
            'blue_flag_countries.json',
            'green_flag_countries.json',
            'yellow_flag_countries.json',
            'white_flag_countries.json',
            'purple_flag_countries.json',
            'blue_and_white_flags.json',
            'latest_flag_adoption_by_country.json',
            'national_anthems_by_country.json',
            'monarchies.json',
            'country_party_system.json',
            'lower_house_seats_by_country.json',
            'population_per_lower_house_seat_by_country.json',
            'commonwealth_membership_by_country.json',
            'unesco_sites_by_country.json',
            'olympics_hosted_by_country.json',
            'summer_olympic_gold_medals_by_country.json',
            'summer_olympic_silver_medals_by_country.json',
            'summer_olympic_bronze_medals_by_country.json',
            'winter_olympic_gold_medals_by_country.json',
            'world_cup_wins_by_country.json',
            'fifa_mens_world_ranking.json',
            'soccer_players_by_country.json',
            'uefa_champions_league_winners_by_country.json',
            'uefa_champions_league_runners_up_by_country.json',
            'world_figure_skating_gold_medals_by_country.json',
            'fide_top_federations_open_august_2025.json',
            'nobel_laureates_by_country.json',
            'nobel_literature_laureates_by_country.json',
            'popes_by_country.json',
            'academy_awards_best_international_feature_film_by_country.json',
            'holocene_volcanoes_by_country.json',
            'earthquakes_by_country_2024.json',
            'strongest_earthquake_magnitude_by_country_2024.json',
            'horse_population_by_country.json',
            'sheep_population_by_country.json',
            'years_colonized_by_country.json',
            'african_countries_never_colonized.json',
            'country_by_first_letter.json',
            'country_exports_simplified.json',
            'leading_export_market_by_country.json',
            'leading_import_source_by_country.json',
            'top_goods_export_by_country.json',
            'imports_by_country.json'
        ];
    }

    async analyzeFile(filename, data) {
        console.log(`Analyzing ${filename}...`);
        
        // Extract countries from different data structures
        const countries = this.extractCountries(data);
        
        for (const country of countries) {
            // Count frequency
            this.countryFrequency.set(country, (this.countryFrequency.get(country) || 0) + 1);
            
            // Check if country is mapped
            if (!this.isCountryMapped(country)) {
                this.unmappedCountries.add(country);
                console.log(`❌ Unmapped: "${country}" in ${filename}`);
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

    isCountryMapped(countryName) {
        if (!this.mappingData) return false;
        
        const normalizedInput = countryName.trim();
        
        // Check common aliases first
        if (this.mappingData.common_aliases && this.mappingData.common_aliases[normalizedInput]) {
            return true;
        }
        
        // Search through all countries
        for (const [iso2, country] of Object.entries(this.mappingData.countries)) {
            // Check if input matches ISO codes
            if (country.iso2 === normalizedInput || country.iso3 === normalizedInput) {
                return true;
            }
            
            // Check if input matches country name
            if (country.name.toLowerCase() === normalizedInput.toLowerCase()) {
                return true;
            }
            
            // Check aliases
            if (country.aliases && country.aliases.some(alias => 
                alias.toLowerCase() === normalizedInput.toLowerCase())) {
                return true;
            }
        }
        
        // Check special cases (microstates, territories)
        for (const category of ['microstates', 'territories']) {
            if (this.mappingData.special_cases && this.mappingData.special_cases[category]) {
                for (const [iso2, country] of Object.entries(this.mappingData.special_cases[category])) {
                    if (country.iso2 === normalizedInput || country.iso3 === normalizedInput) {
                        return true;
                    }
                    if (country.name.toLowerCase() === normalizedInput.toLowerCase()) {
                        return true;
                    }
                    if (country.aliases && country.aliases.some(alias => 
                        alias.toLowerCase() === normalizedInput.toLowerCase())) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    generateReport() {
        console.log('\n=== COUNTRY MAPPING ANALYSIS REPORT ===\n');
        
        console.log(`📊 Total unique countries found: ${this.countryFrequency.size}`);
        console.log(`❌ Unmapped countries: ${this.unmappedCountries.size}`);
        console.log(`✅ Mapped countries: ${this.countryFrequency.size - this.unmappedCountries.size}`);
        
        if (this.unmappedCountries.size > 0) {
            console.log('\n🔍 UNMAPPED COUNTRIES:');
            const sortedUnmapped = Array.from(this.unmappedCountries).sort();
            for (const country of sortedUnmapped) {
                const frequency = this.countryFrequency.get(country) || 0;
                console.log(`  - "${country}" (appears in ${frequency} files)`);
            }
        }
        
        console.log('\n📈 MOST FREQUENT COUNTRIES:');
        const sortedCountries = Array.from(this.countryFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);
        
        for (const [country, frequency] of sortedCountries) {
            const status = this.unmappedCountries.has(country) ? '❌' : '✅';
            console.log(`  ${status} "${country}": ${frequency} files`);
        }
        
        // Generate mapping suggestions
        this.generateMappingSuggestions();
    }

    generateMappingSuggestions() {
        if (this.unmappedCountries.size === 0) {
            console.log('\n🎉 All countries are properly mapped!');
            return;
        }
        
        console.log('\n💡 MAPPING SUGGESTIONS:');
        
        for (const unmapped of this.unmappedCountries) {
            const suggestions = this.findSimilarCountries(unmapped);
            if (suggestions.length > 0) {
                console.log(`\n"${unmapped}" might map to:`);
                for (const suggestion of suggestions) {
                    console.log(`  - ${suggestion.name} (${suggestion.iso2})`);
                }
            }
        }
    }

    findSimilarCountries(countryName) {
        if (!this.mappingData) return [];
        
        const suggestions = [];
        const normalizedInput = countryName.toLowerCase();
        
        for (const [iso2, country] of Object.entries(this.mappingData.countries)) {
            // Check if country name contains the input or vice versa
            if (country.name.toLowerCase().includes(normalizedInput) || 
                normalizedInput.includes(country.name.toLowerCase())) {
                suggestions.push(country);
            }
            
            // Check aliases
            if (country.aliases) {
                for (const alias of country.aliases) {
                    if (alias.toLowerCase().includes(normalizedInput) || 
                        normalizedInput.includes(alias.toLowerCase())) {
                        suggestions.push(country);
                        break;
                    }
                }
            }
        }
        
        return suggestions.slice(0, 3); // Return top 3 suggestions
    }
}

// Auto-run analysis when loaded
document.addEventListener('DOMContentLoaded', async () => {
    const analyzer = new CountryMappingAnalyzer();
    await analyzer.loadMappingData();
    await analyzer.analyzeDataFiles();
});

// Export for manual use
window.CountryMappingAnalyzer = CountryMappingAnalyzer;
