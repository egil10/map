# GeoQuest Data Format Guide

## 📊 Data Format Overview

This guide explains how to create and format quiz data files for the GeoQuest application. The system supports both manual quiz creation and automatic conversion from raw data files.

## 🗂️ File Structure

### Quiz Data File (`quiz_data.json`)
Base configuration file containing quiz metadata and settings.

### Raw Data Files
Individual JSON files in the `data/` directory that get automatically converted into quiz format.

## 📋 Data Format Specifications

### 1. Raw Data File Format

Raw data files should follow this structure:

```json
{
  "title": "Your Quiz Title",
  "description": "Brief description of what this data represents",
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

#### Required Fields
- **title**: The quiz title that appears in the game
- **data**: Array of country-value pairs
- **country**: Country name (must match mapping system)
- **value_field**: Numeric value for the country

#### Optional Fields
- **description**: Brief description of the data
- **unit**: Unit of measurement (e.g., "km²", "°C", "people", "%")
- **source**: URL to the data source for attribution

### 2. Quiz Configuration Format

Converted quiz files follow this structure:

```json
{
  "id": "unique_quiz_id",
  "title": "Quiz Title",
  "description": "What the map shows",
  "category": "economics|demographics|geography|agriculture|lifestyle|social|technology",
  "tags": ["keyword1", "keyword2", "keyword3"],
  "answer_variations": [
    "primary answer",
    "alternative answer",
    "synonym answer"
  ],
  "colorScheme": {
    "type": "gradient|categorical",
    "minColor": "#ffffff",
    "maxColor": "#000000",
    "defaultColor": "#ffffff"
  },
  "countries": {
    "Country Name": {
      "value": 123.45,
      "color": "#ff0000",
      "unit": "USD"
    }
  }
}
```

## 🗺️ Country Name Mapping

### Supported Country Names

The system uses a comprehensive mapping system to handle country name variations:

#### Major Countries
- **United States**: "United States", "USA", "US", "America"
- **United Kingdom**: "United Kingdom", "UK", "Great Britain", "England"
- **Russia**: "Russia", "Russian Federation"
- **China**: "China", "People's Republic of China"

#### Microstates and Islands
- **Monaco**: "Monaco"
- **Vatican**: "Vatican City", "Holy See"
- **Singapore**: "Singapore"
- **Hong Kong**: "Hong Kong", "Hong Kong SAR"
- **Macau**: "Macau", "Macao"

#### Special Cases
- **Czech Republic**: "Czech Republic", "Czechia"
- **North Korea**: "North Korea", "Korea, Democratic People's Republic of"
- **South Korea**: "South Korea", "Korea, Republic of"
- **North Macedonia**: "North Macedonia", "Macedonia"

### Country Name Guidelines

1. **Use Standard Names**: Use official country names when possible
2. **Avoid Abbreviations**: Use full names instead of abbreviations
3. **Consistent Formatting**: Maintain consistent capitalization
4. **Check Mapping**: Verify names are in the mapping system

## 🎨 Color Scheme Configuration

### Gradient Color Schemes
For numeric data with continuous values:

```json
{
  "colorScheme": {
    "type": "gradient",
    "minColor": "#e8f5e8",
    "maxColor": "#2e7d32",
    "defaultColor": "#ffffff"
  }
}
```

### Categorical Color Schemes
For categorical data with discrete values:

```json
{
  "colorScheme": {
    "type": "categorical",
    "defaultColor": "#ffffff"
  }
}
```

### Color Guidelines
- **Use Accessible Colors**: Ensure good contrast ratios
- **Meaningful Colors**: Choose colors that make sense for the data
- **Consistent Palette**: Use consistent color schemes across similar data types
- **Gradient Ranges**: Use appropriate min/max colors for the data range

## 📊 Data Categories

### Economics
- GDP, GNI, income data
- Economic indicators
- Financial metrics
- Trade data

### Demographics
- Population data
- Age demographics
- Population density
- Fertility rates

### Geography
- Land area
- Water percentage
- Elevation data
- Geographic features

### Agriculture
- Arable land
- Crop production
- Agricultural indicators
- Farming data

### Lifestyle
- Consumption data
- Cultural indicators
- Social metrics
- Quality of life

### Social
- Education data
- Health indicators
- Social development
- Human development index

### Technology
- Internet usage
- Technology adoption
- Digital indicators
- Connectivity data

## 🔧 Data Conversion Process

### Automatic Conversion
The system automatically converts raw data files into quiz format:

1. **Load Raw Data**: Fetch JSON file from data directory
2. **Validate Format**: Check required fields and data types
3. **Map Countries**: Resolve country names to GeoJSON names
4. **Generate Colors**: Create color scheme based on data values
5. **Create Quiz**: Generate quiz configuration object

### Manual Conversion
For complex data or special requirements:

1. **Create Quiz Object**: Follow the quiz configuration format
2. **Map Countries**: Ensure all country names are mapped correctly
3. **Set Colors**: Define appropriate color scheme
4. **Add Metadata**: Include title, description, tags, and answer variations

## 📝 Data Validation

### Required Validation
1. **JSON Syntax**: Valid JSON format
2. **Required Fields**: All required fields present
3. **Data Types**: Correct data types for all fields
4. **Country Names**: Valid country names that can be mapped
5. **Numeric Values**: Valid numeric values for data

### Quality Checks
1. **Data Completeness**: Sufficient data points for meaningful visualization
2. **Value Ranges**: Reasonable value ranges for the data type
3. **Unit Consistency**: Consistent units across all data points
4. **Source Attribution**: Proper source attribution

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

## 🔍 Troubleshooting

### Common Issues

#### Country Mapping Errors
- **Symptom**: Countries not displaying on map
- **Solution**: Check country names against mapping system
- **Prevention**: Use standard country names

#### Data Format Errors
- **Symptom**: Data not loading or displaying incorrectly
- **Solution**: Validate JSON syntax and required fields
- **Prevention**: Use data validation tools

#### Color Generation Issues
- **Symptom**: Countries not colored or wrong colors
- **Solution**: Check data values and color scheme configuration
- **Prevention**: Ensure numeric values are valid

#### Performance Issues
- **Symptom**: Slow loading or rendering
- **Solution**: Optimize data size and structure
- **Prevention**: Use efficient data formats

### Debug Tools
- **Browser Console**: Check for JavaScript errors
- **Network Tab**: Monitor data loading
- **Performance Tab**: Identify bottlenecks
- **Data Validation**: Use JSON validators

## 📚 Best Practices

### Data Quality
1. **Accurate Data**: Ensure data accuracy and reliability
2. **Complete Coverage**: Include as many countries as possible
3. **Recent Data**: Use current, up-to-date information
4. **Source Attribution**: Always include data sources

### Technical Considerations
1. **File Size**: Keep data files reasonably sized
2. **Performance**: Optimize for loading and rendering
3. **Compatibility**: Ensure cross-browser compatibility
4. **Accessibility**: Consider accessibility requirements

### User Experience
1. **Clear Titles**: Use descriptive, clear titles
2. **Meaningful Descriptions**: Provide helpful descriptions
3. **Appropriate Tags**: Include relevant tags for hints
4. **Answer Variations**: Include multiple valid answer formats

---

This data format guide provides comprehensive information for creating and managing quiz data in the GeoQuest application. For specific implementation details, refer to the source code and examples in the data directory.
