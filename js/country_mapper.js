/**
 * Country Mapper Utility
 * Handles mapping between different country naming conventions and ISO codes
 */

class CountryMapper {
    constructor() {
        this.mapping = null;
        this.loadMapping();
    }

    async loadMapping() {
        try {
            const response = await fetch('data/country_mapping.json');
            this.mapping = await response.json();
        } catch (error) {
            console.error('Failed to load country mapping:', error);
        }
    }

    /**
     * Get standardized country name from any input
     * @param {string} input - Country name, ISO code, or alias
     * @param {string} source - Data source (owid, world_bank, un, cia)
     * @returns {string|null} - Standardized country name or null if not found
     */
    getStandardName(input, source = null) {
        if (!this.mapping || !input) return null;

        const normalizedInput = this.normalizeInput(input);
        
        // Check common aliases first
        if (this.mapping.common_aliases && this.mapping.common_aliases[normalizedInput]) {
            const iso2 = this.mapping.common_aliases[normalizedInput];
            return this.mapping.countries[iso2]?.name || null;
        }

        // Search through all countries
        for (const [iso2, country] of Object.entries(this.mapping.countries)) {
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

            // Check data source specific names
            if (source && country.data_sources && country.data_sources[source]) {
                if (country.data_sources[source].toLowerCase() === normalizedInput.toLowerCase()) {
                    return country.name;
                }
            }
        }

        // Check special cases (microstates, territories)
        for (const category of ['microstates', 'territories']) {
            if (this.mapping.special_cases && this.mapping.special_cases[category]) {
                for (const [iso2, country] of Object.entries(this.mapping.special_cases[category])) {
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
                    if (source && country.data_sources && country.data_sources[source]) {
                        if (country.data_sources[source].toLowerCase() === normalizedInput.toLowerCase()) {
                            return country.name;
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * Get ISO2 code from country name
     * @param {string} countryName - Standardized country name
     * @returns {string|null} - ISO2 code or null if not found
     */
    getISO2(countryName) {
        if (!this.mapping || !countryName) return null;

        const normalizedInput = this.normalizeInput(countryName);

        for (const [iso2, country] of Object.entries(this.mapping.countries)) {
            if (country.name.toLowerCase() === normalizedInput.toLowerCase()) {
                return iso2;
            }
        }

        // Check special cases
        for (const category of ['microstates', 'territories']) {
            if (this.mapping.special_cases && this.mapping.special_cases[category]) {
                for (const [iso2, country] of Object.entries(this.mapping.special_cases[category])) {
                    if (country.name.toLowerCase() === normalizedInput.toLowerCase()) {
                        return iso2;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Get ISO3 code from country name
     * @param {string} countryName - Standardized country name
     * @returns {string|null} - ISO3 code or null if not found
     */
    getISO3(countryName) {
        if (!this.mapping || !countryName) return null;

        const normalizedInput = this.normalizeInput(countryName);

        for (const [iso2, country] of Object.entries(this.mapping.countries)) {
            if (country.name.toLowerCase() === normalizedInput.toLowerCase()) {
                return country.iso3;
            }
        }

        // Check special cases
        for (const category of ['microstates', 'territories']) {
            if (this.mapping.special_cases && this.mapping.special_cases[category]) {
                for (const [iso2, country] of Object.entries(this.mapping.special_cases[category])) {
                    if (country.name.toLowerCase() === normalizedInput.toLowerCase()) {
                        return country.iso3;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Get all aliases for a country
     * @param {string} countryName - Standardized country name
     * @returns {Array} - Array of aliases
     */
    getAliases(countryName) {
        if (!this.mapping || !countryName) return [];

        const normalizedInput = this.normalizeInput(countryName);

        for (const [iso2, country] of Object.entries(this.mapping.countries)) {
            if (country.name.toLowerCase() === normalizedInput.toLowerCase()) {
                return country.aliases || [];
            }
        }

        // Check special cases
        for (const category of ['microstates', 'territories']) {
            if (this.mapping.special_cases && this.mapping.special_cases[category]) {
                for (const [iso2, country] of Object.entries(this.mapping.special_cases[category])) {
                    if (country.name.toLowerCase() === normalizedInput.toLowerCase()) {
                        return country.aliases || [];
                    }
                }
            }
        }

        return [];
    }

    /**
     * Get data source specific name
     * @param {string} countryName - Standardized country name
     * @param {string} source - Data source (owid, world_bank, un, cia)
     * @returns {string|null} - Source-specific name or null if not found
     */
    getSourceName(countryName, source) {
        if (!this.mapping || !countryName || !source) return null;

        const normalizedInput = this.normalizeInput(countryName);

        for (const [iso2, country] of Object.entries(this.mapping.countries)) {
            if (country.name.toLowerCase() === normalizedInput.toLowerCase()) {
                return country.data_sources?.[source] || null;
            }
        }

        // Check special cases
        for (const category of ['microstates', 'territories']) {
            if (this.mapping.special_cases && this.mapping.special_cases[category]) {
                for (const [iso2, country] of Object.entries(this.mapping.special_cases[category])) {
                    if (country.name.toLowerCase() === normalizedInput.toLowerCase()) {
                        return country.data_sources?.[source] || null;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Normalize input string
     * @param {string} input - Input string
     * @returns {string} - Normalized string
     */
    normalizeInput(input) {
        if (!input) return '';
        return input.trim();
    }

    /**
     * Get all available countries
     * @returns {Array} - Array of country objects
     */
    getAllCountries() {
        if (!this.mapping) return [];

        const countries = Object.values(this.mapping.countries);
        
        // Add special cases
        if (this.mapping.special_cases) {
            for (const category of Object.values(this.mapping.special_cases)) {
                countries.push(...Object.values(category));
            }
        }

        return countries;
    }

    /**
     * Search countries by partial name
     * @param {string} query - Search query
     * @returns {Array} - Array of matching countries
     */
    searchCountries(query) {
        if (!this.mapping || !query) return [];

        const normalizedQuery = this.normalizeInput(query).toLowerCase();
        const results = [];

        // Search main countries
        for (const [iso2, country] of Object.entries(this.mapping.countries)) {
            if (this.matchesQuery(country, normalizedQuery)) {
                results.push({ ...country, iso2 });
            }
        }

        // Search special cases
        for (const category of ['microstates', 'territories']) {
            if (this.mapping.special_cases && this.mapping.special_cases[category]) {
                for (const [iso2, country] of Object.entries(this.mapping.special_cases[category])) {
                    if (this.matchesQuery(country, normalizedQuery)) {
                        results.push({ ...country, iso2 });
                    }
                }
            }
        }

        return results;
    }

    /**
     * Check if country matches search query
     * @param {Object} country - Country object
     * @param {string} query - Normalized query
     * @returns {boolean} - Whether country matches
     */
    matchesQuery(country, query) {
        if (country.name.toLowerCase().includes(query)) return true;
        if (country.aliases && country.aliases.some(alias => alias.toLowerCase().includes(query))) return true;
        if (country.iso2.toLowerCase().includes(query)) return true;
        if (country.iso3.toLowerCase().includes(query)) return true;
        return false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CountryMapper;
}
