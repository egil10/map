# GeoQuest Dataset Management Guide

## 📊 Overview

This comprehensive guide documents the dataset management system in GeoQuest, including how to verify datasets, add new data, standardize country names, and maintain data quality. This document is based on extensive work done to ensure all datasets are properly integrated and functional.

## 🎯 Current Dataset Status

### Dataset Inventory (as of October 2025)
- **Total JSON Files**: 167 files in `data/` directory
- **Active Quiz Datasets**: 165 datasets
- **Non-Dataset Files**: 2 files
  - `country_mapping.json` - Country name mapping reference
  - `quiz_data.json` - Legacy data file (not used)

### Recent Additions
- **Recreational Cannabis Legality** (`recreational_cannabis_legality.json`)
- **Medical Cannabis Legality** (`medical_cannabis_legality.json`)

## 🔍 Dataset Verification Process

### How to Verify All Datasets Are Loaded

#### Step 1: Count JSON Files
```powershell
# PowerShell command to count all JSON files
Get-ChildItem .\data\*.json | Measure-Object | Select-Object -ExpandProperty Count
```

#### Step 2: Check Quiz.js Integration
The `dataFiles` array in `js/quiz.js` (starting around line 79) contains all dataset filenames:

```javascript
const dataFiles = [
    'academy_awards_best_international_feature_film_by_country.json',
    'active_military_by_country.json',
    // ... all 165 dataset files
    'recreational_cannabis_legality.json',
    'medical_cannabis_legality.json'
];
```

#### Step 3: Verification Checklist
- ✅ Verify file count matches expected number
- ✅ Check that all files are listed in `dataFiles` array
- ✅ Exclude `country_mapping.json` and `quiz_data.json` (non-dataset files)
- ✅ Test in browser that all datasets load correctly
- ✅ Check browser console for any loading errors

### Common Verification Issues

#### Issue 1: Dataset Not Appearing in Quiz
**Symptoms**: JSON file exists but doesn't show in dataset browser or quiz
**Causes**:
- File not listed in `dataFiles` array in `quiz.js`
- JSON syntax errors
- Country name mapping issues

**Solution**:
```javascript
// Add filename to dataFiles array in js/quiz.js
const dataFiles = [
    // ... existing files
    'your_new_dataset.json'  // Add here
];
```

#### Issue 2: Loading Errors in Console
**Symptoms**: Console shows "Failed to load" or "Invalid JSON" errors
**Causes**:
- Invalid JSON syntax
- Missing required fields
- Incorrect file path

**Solution**:
1. Validate JSON syntax using a JSON validator
2. Check required fields: `title`, `description`, `source`, `data`
3. Verify file is in correct location (`data/` directory)

## 📝 Adding New Datasets

### Complete Step-by-Step Process

#### Step 1: Prepare Your Data
Collect data from reliable sources and organize it in a spreadsheet or text file.

**Example Data Format**:
```
Country | Status
--------|--------
United States | Legal
Canada | Legal
Mexico | Legal
```

#### Step 2: Create JSON File
Create a new JSON file in the `data/` directory following this template:

```json
{
  "title": "Your Dataset Title",
  "description": "Clear description of what this data represents",
  "source": "https://source-url.com",
  "data": [
    {
      "country": "Country Name",
      "value": "value_or_category"
    }
  ]
}
```

#### Step 3: Standardize Country Names
**CRITICAL**: Use exact country names from the internal mapping system.

##### Common Country Name Mappings
```
Data Source Name → GeoQuest Name
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USA → United States
UK → United Kingdom
Korea, South → South Korea
Korea, North → North Korea
Korea, Rep. → South Korea
Korea, Dem. Rep. → North Korea
Czech Republic / Czechia → Czech Republic
Macedonia → North Macedonia
Congo, Dem. Rep. → Democratic Republic of the Congo
Congo, Rep. → Congo
Cote d'Ivoire → Ivory Coast
Ivory Coast / Côte d'Ivoire → Ivory Coast
Taiwan / Chinese Taipei → Taiwan
Hong Kong SAR → Hong Kong
Macao SAR → Macau
Burma → Myanmar
East Timor → Timor-Leste
Swaziland → Eswatini
```

#### Step 4: Add to Quiz.js
Add your filename to the `dataFiles` array in `js/quiz.js`:

```javascript
const dataFiles = [
    // ... existing files (alphabetically organized)
    'your_new_dataset.json',  // Add in alphabetical order
];
```

#### Step 5: Test the Dataset
1. Refresh the application
2. Check browser console for loading errors
3. Verify dataset appears in dataset browser (Learn mode)
4. Test in Play mode to ensure it's included in quizzes
5. Check that countries are coloring correctly on the map

## 🌍 Country Name Standardization

### Why Country Name Standardization Matters
GeoQuest uses an internal country mapping system that matches country names from data sources to the GeoJSON country polygons used to render the map. If country names don't match exactly, countries won't appear on the map.

### The Standardization Process

#### 1. Identify Source Country Names
Look at the country names in your source data and note any variations.

**Example from Cannabis Legality Dataset**:
```
Source Data: "Korea, South"
GeoQuest Name: "South Korea"
```

#### 2. Use Standard Name Mappings
Always convert to GeoQuest standard names:

**Standard Names List** (Most Common):
```
✅ United States (not USA, US, or America)
✅ United Kingdom (not UK, Great Britain, or England)
✅ South Korea (not Korea, Rep. or Republic of Korea)
✅ North Korea (not Korea, Dem. or DPRK)
✅ Democratic Republic of the Congo (not Congo, Dem. Rep. or DRC)
✅ Congo (not Republic of the Congo or Congo, Rep.)
✅ Ivory Coast (not Cote d'Ivoire or Côte d'Ivoire)
✅ Czech Republic (not Czechia)
✅ North Macedonia (not Macedonia or FYROM)
✅ Myanmar (not Burma)
✅ Timor-Leste (not East Timor)
✅ Eswatini (not Swaziland)
```

#### 3. Handle Special Cases

##### Territories and Dependencies
**Include** if they have data:
- Hong Kong
- Macau
- Taiwan
- Greenland
- Puerto Rico (in some datasets)

**Exclude** (not rendered on map):
- Guam
- American Samoa
- French Polynesia (in most datasets)
- Other small territories

##### Historical Countries
**Replace** with modern equivalents:
- USSR → Russia
- Yugoslavia → Serbia (or split into individual countries)
- Czechoslovakia → Czech Republic and Slovakia

##### Aggregates and Regions
**Always Exclude**:
- World
- Earth
- Africa
- Asia
- Europe
- OECD
- Arab World
- East Asia & Pacific
- Any other regional groupings

### Standardization Best Practices

#### 1. Create a Mapping Document
When working with a new data source, create a mapping:

```
# Data Source → GeoQuest Mapping
Korea, South → South Korea
Korea, North → North Korea
Cote d'Ivoire → Ivory Coast
Czech Republic → Czech Republic
Macedonia → North Macedonia
```

#### 2. Use Search & Replace Carefully
When standardizing in bulk:
```javascript
// Example: Standardizing in JavaScript
let countryName = sourceCountryName
    .replace('Korea, South', 'South Korea')
    .replace('Korea, North', 'North Korea')
    .replace(/Côte d'Ivoire|Cote d'Ivoire/, 'Ivory Coast')
    .replace('Czech Republic', 'Czech Republic')  // Keep as is
    .replace(/Macedonia(?! North)/, 'North Macedonia');
```

#### 3. Validate After Standardization
After standardizing country names:
1. Load dataset in application
2. Check console for "No mapping found" warnings
3. Verify all countries appear on the map
4. Check legend to ensure all data is displayed

## 🎨 Data Types: Numeric vs. Categorical

### Understanding Data Types

#### Numeric Data
**Characteristics**:
- Continuous values (population, GDP, area, etc.)
- Can be averaged, summed, compared
- Displayed with gradient color scheme
- Examples: Population (millions), GDP (billions), Temperature (°C)

**JSON Format**:
```json
{
  "title": "Population by Country 2025",
  "description": "Total population",
  "source": "https://example.com",
  "data": [
    {
      "country": "United States",
      "value": 331900000
    },
    {
      "country": "China",
      "value": 1411000000
    }
  ]
}
```

#### Categorical Data
**Characteristics**:
- Discrete categories (Legal/Illegal, Continent, Climate, etc.)
- Cannot be averaged or summed
- Displayed with distinct colors per category
- Examples: Legal Status, Government Type, Climate Zone

**JSON Format**:
```json
{
  "title": "Cannabis Legality: Recreational Use",
  "description": "Legal status of recreational cannabis",
  "source": "https://example.com",
  "data": [
    {
      "country": "Canada",
      "value": "Legal"
    },
    {
      "country": "United States",
      "value": "Legal"
    },
    {
      "country": "France",
      "value": "Decriminalized"
    },
    {
      "country": "Japan",
      "value": "Illegal"
    }
  ]
}
```

### How the System Handles Each Type

#### Numeric Data Processing
1. System calculates min, max, quartiles
2. Generates gradient color scheme
3. Creates gradient color bar
4. Displays numeric values in legend
5. Formats large numbers (1.2M, 5.3K, etc.)

#### Categorical Data Processing
1. System identifies unique categories
2. Assigns distinct colors to each category
3. Creates categorical color bar
4. Groups countries by category in legend
5. Hides category names in Play mode (to avoid spoilers)

## 📚 Case Study: Cannabis Legality Datasets

### Background
Two comprehensive categorical datasets were created to map the legal status of cannabis globally for both recreational and medical use.

### Data Source
- **Source**: [Wikipedia - Legality of Cannabis](https://en.wikipedia.org/wiki/Legality_of_cannabis)
- **Date**: October 2025
- **Countries Covered**: 200+ countries

### Creation Process

#### Step 1: Data Collection
Collected data from Wikipedia article showing legal status for both recreational and medical use.

#### Step 2: Category Definition

**Recreational Cannabis**:
- Legal (fully legal for recreational use)
- Decriminalized (not fully legal but decriminalized)
- Illegal (prohibited)

**Medical Cannabis**:
- Legal (legal for medical use)
- Illegal (not legal for medical use)

#### Step 3: Country Name Standardization

**Challenging Mappings Encountered**:
```
Wikipedia Name → GeoQuest Name
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Korea, South → South Korea
Korea, North (DPRK) → North Korea
People's Republic of China (PRC) → China
Republic of the Congo → Congo
Macau, SAR of China → Macau
Eswatini (Swaziland) → Eswatini
Ivory Coast → Ivory Coast
```

#### Step 4: JSON Structure
Created two separate files for clarity:

**`recreational_cannabis_legality.json`**:
```json
{
  "title": "Legality of Cannabis: Recreational Use",
  "description": "Legal status of recreational cannabis use by country.",
  "source": "https://en.wikipedia.org/wiki/Legality_of_cannabis",
  "data": [
    {
      "country": "United States",
      "value": "Legal"
    },
    {
      "country": "France",
      "value": "Decriminalized"
    },
    {
      "country": "Japan",
      "value": "Illegal"
    }
    // ... 200+ countries
  ]
}
```

**`medical_cannabis_legality.json`**:
```json
{
  "title": "Legality of Cannabis: Medical Use",
  "description": "Legal status of medical cannabis use by country.",
  "source": "https://en.wikipedia.org/wiki/Legality_of_cannabis",
  "data": [
    {
      "country": "United States",
      "value": "Legal"
    },
    {
      "country": "United Kingdom",
      "value": "Legal"
    },
    {
      "country": "Japan",
      "value": "Legal"
    }
    // ... 200+ countries
  ]
}
```

#### Step 5: Integration
Added both files to `js/quiz.js`:
```javascript
const dataFiles = [
    // ... existing files
    'medical_cannabis_legality.json',
    'recreational_cannabis_legality.json',
    // ... more files
];
```

### Lessons Learned

#### 1. Category Naming Consistency
Use consistent category names across related datasets:
- ✅ "Legal", "Decriminalized", "Illegal"
- ❌ Don't mix: "Yes/No", "Legal/Not Legal", "Allowed/Prohibited"

#### 2. Source Attribution
Always include source URL for credibility and future updates.

#### 3. Country Name Precision
Pay special attention to:
- Korea (North vs South)
- Congo (Democratic Republic vs Republic)
- Macedonia → North Macedonia
- Czech Republic (not Czechia)

#### 4. Data Completeness
Cover as many countries as possible for comprehensive visualization.

## 🔧 Maintenance and Updates

### Regular Maintenance Tasks

#### 1. Dataset Verification (Monthly)
- Verify all datasets still load correctly
- Check for any console errors
- Test random selection of datasets in quiz
- Verify country mapping still works

#### 2. Data Updates (As Needed)
- Update datasets when new data becomes available
- Add new datasets from reliable sources
- Remove outdated datasets if necessary
- Update source URLs if they change

#### 3. Country Name Mapping Updates
- Monitor for country name changes (rare but happens)
- Update mapping when countries rename (e.g., Swaziland → Eswatini)
- Handle new countries if they emerge
- Update historical country mappings

### How to Update Existing Datasets

#### Step 1: Backup Original
```bash
# Create backup before updating
cp data/dataset_name.json data/dataset_name.json.backup
```

#### Step 2: Update Data
Edit the JSON file with new data while maintaining structure:
```json
{
  "title": "Same Title",
  "description": "Updated description if needed",
  "source": "Updated source URL if changed",
  "data": [
    // Updated data here
  ]
}
```

#### Step 3: Test Updated Dataset
1. Reload application
2. Check console for errors
3. Verify data displays correctly
4. Test in both Play and Learn modes

#### Step 4: Document Changes
Update any relevant documentation noting what was changed and when.

## 📊 Dataset Quality Standards

### Required Fields
Every dataset MUST have:
- ✅ `title` - Clear, descriptive title
- ✅ `description` - Brief explanation of data
- ✅ `source` - URL to original data source
- ✅ `data` - Array of country-value pairs

### Data Quality Checklist
- ✅ Valid JSON syntax
- ✅ All country names standardized
- ✅ Consistent value format (all numeric OR all categorical)
- ✅ Source URL is valid and accessible
- ✅ Title is unique and descriptive
- ✅ Description explains what the data shows
- ✅ At least 20 countries included (for meaningful visualization)
- ✅ No aggregate regions (World, Africa, etc.)
- ✅ No territories (unless specifically desired)

### Common Quality Issues

#### Issue 1: Mixed Data Types
**Problem**: Some values are numbers, others are strings
```json
// ❌ BAD
"data": [
  {"country": "USA", "value": 100},
  {"country": "Canada", "value": "N/A"}
]

// ✅ GOOD - All numeric
"data": [
  {"country": "United States", "value": 100},
  {"country": "Canada", "value": 95}
]

// ✅ GOOD - All categorical
"data": [
  {"country": "United States", "value": "High"},
  {"country": "Canada", "value": "Medium"}
]
```

#### Issue 2: Inconsistent Country Names
**Problem**: Same country with different names
```json
// ❌ BAD
"data": [
  {"country": "USA", "value": 100},
  {"country": "United States", "value": 50}  // Duplicate!
]

// ✅ GOOD
"data": [
  {"country": "United States", "value": 100}
]
```

#### Issue 3: Missing Source
**Problem**: No source attribution
```json
// ❌ BAD
{
  "title": "Population Data",
  "data": [...]
}

// ✅ GOOD
{
  "title": "Population Data 2025",
  "description": "Total population by country",
  "source": "https://worldbank.org/data/population",
  "data": [...]
}
```

## 🎯 Best Practices Summary

### When Adding New Datasets
1. **Research thoroughly** - Use reliable, authoritative sources
2. **Standardize country names** - Use exact GeoQuest names
3. **Include source attribution** - Always credit original source
4. **Test extensively** - Verify in all game modes
5. **Document changes** - Update relevant documentation

### When Standardizing Country Names
1. **Use mapping reference** - Refer to `country_mapping.json`
2. **Be consistent** - Use same name for same country across datasets
3. **Validate after** - Check for mapping warnings in console
4. **Test visualization** - Ensure countries appear on map

### When Maintaining Datasets
1. **Regular verification** - Check datasets load correctly
2. **Update promptly** - Keep data current when sources update
3. **Monitor quality** - Watch for errors and inconsistencies
4. **Document updates** - Track what changed and when

## 📈 Dataset Statistics

### Current Collection (October 2025)
- **Total Datasets**: 165 active quiz datasets
- **Categories Covered**:
  - Economics: ~30 datasets
  - Demographics: ~25 datasets
  - Geography: ~20 datasets
  - Social: ~20 datasets
  - Agriculture: ~15 datasets
  - Technology: ~15 datasets
  - Lifestyle: ~15 datasets
  - Miscellaneous: ~25 datasets

### Data Coverage
- **Countries Covered**: 195+ countries
- **Data Types**: Numeric (gradient) and Categorical (distinct colors)
- **Source Diversity**: Wikipedia, World Bank, UN, OECD, OWID, and more

### Quality Metrics
- ✅ All datasets have source attribution
- ✅ All country names standardized
- ✅ All datasets load without errors
- ✅ All datasets integrated into quiz system

## 🚀 Future Enhancements

### Planned Improvements
1. **Automated country name validation** - Check names against mapping on load
2. **Data freshness indicators** - Show when datasets were last updated
3. **Quality score system** - Rate datasets by completeness and accuracy
4. **Bulk update tools** - Scripts to update multiple datasets at once
5. **Dataset versioning** - Track dataset changes over time

### Contribution Guidelines
When contributing new datasets:
1. Follow this guide strictly
2. Test thoroughly before submitting
3. Include documentation of any special considerations
4. Provide source citations and date of data
5. Submit via pull request with clear description

## 📚 Additional Resources

### Related Documentation
- `data-format.md` - Detailed data format specifications
- `data-organization.md` - Data directory structure guide
- `COUNTRY_MAPPING_GUIDE.md` - Country name mapping reference
- `DATA_FORMAT_RECIPE.md` - Quick reference for data format

### External References
- [GeoJSON Specification](https://geojson.org/)
- [Leaflet.js Documentation](https://leafletjs.com/)
- [Country Name Standards (ISO 3166)](https://www.iso.org/iso-3166-country-codes.html)

## 🎉 Conclusion

This comprehensive guide ensures that GeoQuest's dataset collection remains high-quality, consistent, and maintainable. By following these guidelines, anyone can successfully add new datasets, maintain existing ones, and contribute to the growing collection of global data visualizations.

### Key Takeaways
1. **Country name standardization is critical** - The most common source of dataset issues
2. **Source attribution is required** - Always credit original data sources
3. **Test thoroughly** - Verify datasets work in all game modes
4. **Maintain quality** - Regular verification and updates keep data fresh
5. **Document everything** - Clear documentation helps future maintenance

The current collection of 165 datasets provides comprehensive coverage of global data across multiple categories, making GeoQuest a valuable educational tool for understanding our world through interactive data visualization.

---

*Last Updated: October 2025*
*Total Datasets: 165*
*Documentation Version: 1.0*

