# GeoQuest Data Organization Guide

## 📊 Data Directory Structure

The `data/` directory contains 134 JSON files with various datasets for the GeoQuest application. This guide explains how the data is organized and how to work with it.

## 🗂️ Data Categories

### Economics (25 files)
- **GDP Data**: `gdp_by_country_2025.json`, `gni_per_capita_2024.json`
- **Income Data**: `average_annual_wages_usd_ppp_2023.json`, `median_wealth_per_adult_2023.json`
- **Financial Data**: `external_debt_by_country.json`, `stock_market_capitalization_by_country.json`
- **Trade Data**: `imports_by_country.json`, `leading_export_market_by_country.json`

### Demographics (20 files)
- **Population Data**: `world_population_2025.json`, `population_density.json`
- **Age Data**: `male_median_age_by_country.json`, `total_fertility_rate_2025.json`
- **Gender Data**: `sex_ratio_by_country.json`
- **Literacy Data**: `total_literacy_rate_by_country.json`

### Geography (15 files)
- **Land Data**: `land_area.json`, `percent_water.json`
- **Elevation Data**: `maximum_elevation_by_country.json`
- **Geographic Features**: `landlocked_countries.json`, `number_of_islands_by_country.json`
- **Climate Data**: `highest_temperature_by_country.json`, `lowest_temperature_by_country.json`

### Agriculture (10 files)
- **Land Use**: `arable_land_per_person.json`
- **Production**: `wheat_production_by_country.json`, `cocoa_production_by_country.json`
- **Livestock**: `sheep_population_by_country.json`, `horse_population_by_country.json`

### Lifestyle (15 files)
- **Consumption**: `coffee_consumption_per_capita_by_country.json`, `wine_consumption_per_capita_by_country.json`
- **Cultural**: `national_anthems_by_country.json`, `marriage_rate_per_1000_by_country.json`
- **Sports**: `fifa_mens_world_ranking.json`, `world_cup_wins_by_country.json`

### Social (20 files)
- **Education**: `total_literacy_rate_by_country.json`
- **Health**: `hdi_by_country_2023.json`
- **Development**: `world_bank_income_group_by_country.json`
- **Social Indicators**: `traffic_related_death_rate_by_country.json`

### Technology (15 files)
- **Internet**: `internet_speed_by_country.json`, `internet_usage_by_country.json`
- **Mobile**: `mobile_connection_speed_by_country.json`, `mobile_phone_numbers_by_country.json`
- **Digital**: `fixed_broadband_subscriptions_by_country.json`

### Miscellaneous (14 files)
- **Flags**: `red_flag_countries.json`, `blue_flag_countries.json`
- **Languages**: `english_primary_language_by_country.json`, `spanish_native_speakers_by_country.json`
- **Government**: `monarchies.json`, `lower_house_seats_by_country.json`

## 📋 Data File Format

### Standard Format
All data files follow a consistent JSON structure:

```json
{
  "title": "Dataset Title",
  "description": "Brief description of the data",
  "unit": "unit_of_measurement",
  "source": "https://source-url.com",
  "data": [
    {
      "country": "Country Name",
      "value_field": 123.45
    }
  ]
}
```

### Required Fields
- **title**: Descriptive title for the dataset
- **data**: Array of country-value pairs
- **country**: Country name (must be mappable)
- **value_field**: Numeric value for the country

### Optional Fields
- **description**: Brief description of what the data represents
- **unit**: Unit of measurement (e.g., "km²", "°C", "people", "%")
- **source**: URL to the original data source

## 🔧 Data Processing

### Automatic Conversion
The system automatically converts raw data files into quiz format:

1. **Load Data**: Fetch JSON file from data directory
2. **Validate Format**: Check required fields and data types
3. **Map Countries**: Resolve country names to GeoJSON names
4. **Generate Colors**: Create color scheme based on data values
5. **Create Quiz**: Generate quiz configuration object

### Manual Processing
For complex datasets or special requirements:

1. **Data Validation**: Ensure data quality and completeness
2. **Country Mapping**: Verify all country names are mappable
3. **Value Processing**: Clean and validate numeric values
4. **Color Generation**: Define appropriate color schemes

## 📊 Data Quality

### Validation Checklist
- [ ] **JSON Syntax**: Valid JSON format
- [ ] **Required Fields**: All required fields present
- [ ] **Data Types**: Correct data types for all fields
- [ ] **Country Names**: Valid country names that can be mapped
- [ ] **Numeric Values**: Valid numeric values for data
- [ ] **Data Completeness**: Sufficient data points for meaningful visualization
- [ ] **Value Ranges**: Reasonable value ranges for the data type
- [ ] **Unit Consistency**: Consistent units across all data points
- [ ] **Source Attribution**: Proper source attribution

### Quality Metrics
- **Coverage**: Percentage of countries with data
- **Completeness**: Percentage of required fields present
- **Accuracy**: Data validation and verification
- **Consistency**: Uniform data format and structure

## 🚀 Adding New Data

### Step-by-Step Process

1. **Prepare Data**:
   - Collect data in the required format
   - Ensure data quality and completeness
   - Verify country names and values

2. **Create JSON File**:
   - Save data in `data/` directory
   - Follow naming conventions
   - Include required metadata

3. **Test Data**:
   - Load data in the application
   - Verify country mapping
   - Check color generation
   - Test quiz functionality

4. **Validate Results**:
   - Ensure all countries display correctly
   - Verify color scheme is appropriate
   - Test answer validation
   - Check legend generation

### Naming Conventions
- **Descriptive Names**: Use clear, descriptive filenames
- **Underscore Separation**: Use underscores for spaces
- **Category Prefix**: Include category in filename when relevant
- **Consistent Format**: Maintain consistent naming across files

## 🔍 Data Analysis

### Statistical Analysis
- **Value Distribution**: Analyze data distribution patterns
- **Outliers**: Identify and handle extreme values
- **Correlations**: Find relationships between datasets
- **Trends**: Identify temporal or spatial trends

### Visualization Analysis
- **Color Schemes**: Choose appropriate color schemes
- **Data Ranges**: Set appropriate value ranges
- **Legend Design**: Create clear and informative legends
- **User Experience**: Ensure intuitive data presentation

## 📈 Performance Optimization

### Data Optimization
- **File Size**: Keep data files reasonably sized
- **Compression**: Use data compression when appropriate
- **Lazy Loading**: Load data on demand
- **Caching**: Implement data caching strategies

### Processing Optimization
- **Batch Processing**: Process multiple datasets together
- **Parallel Processing**: Use parallel processing for large datasets
- **Memory Management**: Optimize memory usage
- **Error Handling**: Implement robust error handling

## 🛠️ Data Maintenance

### Regular Maintenance
- **Data Updates**: Keep data current and up-to-date
- **Quality Checks**: Regular data quality validation
- **Performance Monitoring**: Monitor data processing performance
- **Error Tracking**: Track and resolve data errors

### Version Control
- **Data Versioning**: Track data changes over time
- **Backup Strategies**: Implement data backup procedures
- **Change Management**: Manage data changes and updates
- **Documentation**: Maintain data documentation

## 🔧 Troubleshooting

### Common Issues
1. **Data Loading**: Check file paths and permissions
2. **Country Mapping**: Verify country name mappings
3. **Data Validation**: Ensure data format compliance
4. **Performance**: Monitor data processing performance

### Debug Tools
- **Data Validation**: Use JSON validators
- **Country Mapping**: Check mapping system
- **Performance Profiling**: Monitor processing times
- **Error Logging**: Track and resolve errors

## 📚 Best Practices

### Data Management
1. **Consistent Format**: Maintain consistent data format
2. **Quality Assurance**: Implement data quality checks
3. **Documentation**: Document data sources and processing
4. **Version Control**: Track data changes and updates

### Performance
1. **Optimization**: Optimize data size and structure
2. **Caching**: Implement appropriate caching strategies
3. **Lazy Loading**: Load data on demand
4. **Error Handling**: Implement robust error handling

### User Experience
1. **Data Presentation**: Ensure clear data presentation
2. **Accessibility**: Consider accessibility requirements
3. **Performance**: Optimize for user experience
4. **Documentation**: Provide clear data documentation

---

This data organization guide provides comprehensive information for managing and working with the GeoQuest data files. For specific implementation details, refer to the source code and examples in the data directory.
