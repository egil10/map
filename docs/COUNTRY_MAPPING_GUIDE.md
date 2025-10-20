# Country Mapping Guide

## Overview

The GeoQuest application now includes a comprehensive country mapping system that connects different data sources, ISO codes, and country name variations. This system ensures consistent country identification across various data sources like OWID, World Bank, UN, and CIA.

## Files

- `data/country_mapping.json` - Comprehensive mapping database
- `js/country_mapper.js` - New utility class for advanced mapping
- `js/country_mapping.js` - Updated existing mapper with comprehensive support

## Data Structure

### Main Countries
```json
{
  "US": {
    "iso2": "US",
    "iso3": "USA", 
    "name": "United States",
    "aliases": ["USA", "United States of America", "America"],
    "data_sources": {
      "owid": "United States",
      "world_bank": "United States", 
      "un": "United States",
      "cia": "United States"
    }
  }
}
```

### Special Cases
- **Microstates**: Andorra, Liechtenstein, Monaco, San Marino, Vatican City
- **Territories**: Hong Kong, Macau, Taiwan
- **Common Aliases**: USA → US, UK → GB, UAE → AE

## Usage

### Basic Mapping
```javascript
const mapper = new CountryMapper();

// Get standardized name
const standardName = mapper.getStandardName("USA");
// Returns: "United States"

// Get ISO codes
const iso2 = mapper.getISO2("United States");
// Returns: "US"

const iso3 = mapper.getISO3("United States");
// Returns: "USA"
```

### Data Source Specific Names
```javascript
// Get OWID name
const owidName = mapper.getSourceName("United States", "owid");
// Returns: "United States"

// Get World Bank name
const wbName = mapper.getSourceName("United States", "world_bank");
// Returns: "United States"
```

### Search Countries
```javascript
// Search by partial name
const results = mapper.searchCountries("united");
// Returns array of matching countries

// Get all countries
const allCountries = mapper.getAllCountries();
// Returns array of all country objects
```

## Data Sources Supported

- **OWID**: Our World in Data
- **World Bank**: World Bank Open Data
- **UN**: United Nations Statistics
- **CIA**: CIA World Factbook

## Common Mappings

### Major Countries
- United States: USA, US, America
- China: People's Republic of China, PRC
- Russia: Russian Federation
- United Kingdom: UK, Great Britain, England
- Germany: Deutschland
- France: République française

### Special Cases
- Hong Kong: Hong Kong SAR, Hong Kong Special Administrative Region
- Macau: Macao, Macau SAR
- Taiwan: Republic of China, Taiwan Province of China
- Vatican: Holy See, Vatican City State

### Historical Names
- Czechoslovakia → Czech Republic + Slovakia
- Yugoslavia → Serbia
- Soviet Union → Russia

## Integration with Existing Code

The existing `CountryMapper` class in `js/country_mapping.js` has been updated to use the comprehensive mapping as a fallback. It will:

1. First try the comprehensive JSON mapping
2. Fall back to the existing hardcoded mappings
3. Use partial matching for edge cases

## Adding New Countries

To add new countries or aliases, edit `data/country_mapping.json`:

```json
{
  "NEW": {
    "iso2": "NEW",
    "iso3": "NEW",
    "name": "New Country",
    "aliases": ["New Country Alias"],
    "data_sources": {
      "owid": "New Country",
      "world_bank": "New Country",
      "un": "New Country", 
      "cia": "New Country"
    }
  }
}
```

## Performance

- **Caching**: All mappings are cached for O(1) lookup
- **Lazy Loading**: Comprehensive data loads asynchronously
- **Fallback**: Always has working fallback mappings
- **Memory Efficient**: Only loads data when needed

## Troubleshooting

### Common Issues

1. **Country not found**: Check if the country exists in the mapping
2. **Wrong mapping**: Verify the data source specific name
3. **Performance**: Ensure caching is working properly

### Debug Mode

```javascript
// Enable debug logging
mapper.debug = true;

// Log all mappings
mapper.logMappings();

// Search for specific patterns
const results = mapper.searchCountries("pattern");
console.log(results);
```

## Future Enhancements

- [ ] Add more data sources (Eurostat, OECD, etc.)
- [ ] Historical country name support
- [ ] Regional groupings
- [ ] Language-specific names
- [ ] Automatic data source detection
- [ ] Machine learning for new mappings

## Contributing

When adding new countries or fixing mappings:

1. Update `data/country_mapping.json`
2. Test with existing data files
3. Verify all data sources are covered
4. Update documentation if needed
5. Test performance with large datasets

## Examples

### OWID Data Integration
```javascript
// Map OWID country name to standard name
const standardName = mapper.getStandardName("United States", "owid");
// Use in map visualization
```

### World Bank Data Integration  
```javascript
// Map World Bank country name to standard name
const standardName = mapper.getStandardName("Korea, Rep.", "world_bank");
// Returns: "South Korea"
```

### Multi-source Data Merging
```javascript
// Merge data from multiple sources
const countries = ["United States", "Korea, Rep.", "China"];
const standardized = countries.map(country => 
  mapper.getStandardName(country, "world_bank")
);
// Returns: ["United States", "South Korea", "China"]
```
