# Our World in Data (OWID) Integration Guide

## 🎯 Overview

This guide specializes in integrating datasets from Our World in Data (OWID), a common source for global statistics. This guide covers the specific patterns, challenges, and best practices for OWID data.

## 📊 OWID Data Characteristics

### Data Source Format
OWID provides data in tabular format via their grapher tool:
- **URL Pattern**: `https://ourworldindata.org/grapher/[dataset-name]?tab=table`
- **Table View**: Shows country names, years, and values
- **Time Series**: Often includes multiple years
- **Format**: HTML table view (requires manual extraction)

### Common OWID Dataset Types

1. **Education Metrics**
   - Learning outcomes
   - Enrollment rates
   - Years of schooling
   - Completion rates

2. **Health Metrics**
   - Life expectancy
   - Mortality rates
   - Disease prevalence
   - Healthcare access

3. **Environmental Metrics**
   - Air pollution
   - Energy consumption
   - Emissions
   - Water access

4. **Economic Metrics**
   - GDP indicators
   - Income data
   - Trade statistics
   - Development indices

## 🔍 OWID Country Name Challenges

### Common Name Variations in OWID

OWID uses standardized names, but some still need mapping:

**Direct Matches** (No change needed):
- ✅ Most countries: "United States", "China", "India", "Brazil"
- ✅ Standard names: "Germany", "France", "Japan"

**Requires Standardization**:
```
OWID Name → GeoQuest Name
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Czechia → Czech Republic
Congo → Republic of the Congo (check context!)
Cote d'Ivoire → Côte d'Ivoire
East Timor → Timor-Leste
Eswatini → Eswatini (usually correct)
Micronesia (country) → Micronesia
```

**Special Cases**:

1. **Korea**:
   - OWID rarely lists Korea separately
   - Usually appears as "South Korea" or "North Korea" correctly
   - Check for "Korea" without qualification

2. **China/Hong Kong/Macau**:
   - OWID: "China", "Hong Kong", "Macao"
   - GeoQuest: "China", "Hong Kong", "Macau" (note: Macao vs Macau)

3. **Historical Entities**:
   - OWID may include historical regions
   - Exclude: "USSR", "Yugoslavia", "East Germany", "West Germany"

### Aggregate Regions to Exclude

OWID commonly includes these aggregate regions (always exclude):

**World Regions**:
- ❌ "World"
- ❌ "Africa"
- ❌ "Asia"
- ❌ "Europe"
- ❌ "Americas" / "North America" / "South America"
- ❌ "Oceania"

**Income Groups**:
- ❌ "High-income countries"
- ❌ "Upper-middle-income countries"
- ❌ "Lower-middle-income countries"
- ❌ "Low-income countries"

**Regional Groupings**:
- ❌ "East Asia and Pacific (WB)"
- ❌ "Europe and Central Asia (WB)"
- ❌ "Latin America and Caribbean (WB)"
- ❌ "Middle East, North Africa, Afghanistan and Pakistan (WB)"
- ❌ "South Asia (WB)"
- ❌ "Sub-Saharan Africa (WB)"
- ❌ "European Union (27)"

**WB = World Bank grouping - always exclude these**

## 📋 OWID Data Extraction Process

### Step 1: Access the OWID Grapher

1. Navigate to: `https://ourworldindata.org/grapher/[dataset-name]`
2. Click "Table" tab to see data in tabular format
3. Identify the year column you want (often multiple years available)

### Step 2: Extract Data

**Manual Extraction** (from HTML table):
- Copy data from table view
- Paste into spreadsheet/text editor
- Clean and format

**Key Information to Extract**:
- Country names
- Values for target year
- Any notes or methodology information
- Source attribution

### Step 3: Determine Target Year

OWID datasets often span many years. Choose:
- **Most Recent Year**: For current data (e.g., 2022, 2023, 2024)
- **Specific Historical Year**: For historical comparisons (e.g., 1870, 1990, 2000)
- **Latest Complete Year**: If current year is incomplete

**Example from Recent Work**:
- Learning Outcomes: 2020 (latest complete data at time)
- R&D Researchers: 2022 (most recent available)
- Education (No Education): Both 1870 and 2020 (for comparison)

### Step 4: Handle Missing Data

OWID often shows:
- **Empty cells**: No data available
- **"N/A" or "-"**: Missing value
- **Notes**: Special conditions or limitations

**Handling Missing Data**:
- If country has no value for target year: **exclude** from dataset
- Don't include entries with null, undefined, or empty values
- Only include countries with valid numeric data

## 🔧 OWID-Specific Standardization

### Standardization Workflow for OWID Data

```javascript
// Common OWID standardization patterns
const owidStandardizations = {
    // Country names
    "Czechia": "Czech Republic",
    "Cote d'Ivoire": "Côte d'Ivoire",
    "East Timor": "Timor-Leste",
    "Micronesia (country)": "Micronesia",
    
    // Sometimes OWID has these (rarely):
    "Korea, South": "South Korea",
    "Korea, North": "North Korea",
    
    // Check context for:
    "Congo": "Republic of the Congo", // Or might need "Congo" - check data!
};
```

### Aggregate Region Detection

Always check for and exclude these patterns:
```javascript
const excludePatterns = [
    /^World$/i,
    /^Africa$/i,
    /^Asia$/i,
    /^Europe$/i,
    /Americas?/i,
    /Oceania/i,
    /income countries/i,
    /\(WB\)/i,              // World Bank groupings
    /European Union/i,
    /OECD/i,
    /Arab World/i,
];
```

## 📝 OWID Dataset Template

### Standard OWID Dataset Structure

```json
{
  "title": "[Metric Name] by Country",
  "description": "[Detailed description of metric]. According to Our World in Data ([Year]).",
  "unit": "[unit of measurement]",
  "source": "https://ourworldindata.org/grapher/[dataset-name]",
  "data": {
    "Country Name": {
      "value": 123.45,
      "unit": "[unit]"
    }
  }
}
```

### OWID Description Template

**Good OWID Description**:
```
"[Metric name] according to Our World in Data ([Year]). [Brief methodology if relevant]."
```

**Examples from Recent Work**:
- "Average learning outcomes correspond to harmonized test scores across standardized, psychometrically-robust international and regional student achievement tests according to Our World in Data (2020)."
- "The share of adults aged between 15 and 64 years old with no formal education according to Our World in Data (1870)."
- "Professionals engaged in conceiving or creating new knowledge, products, processes, methods, or systems. Number of R&D researchers per million people according to Our World in Data (2022)."

## 🎯 Real-World Examples

### Example 1: Learning Outcomes Dataset

**Source**: https://ourworldindata.org/grapher/average-harmonized-learning-outcome-scores

**Challenges Encountered**:
- Data was for 2020 (chosen as target year)
- Country names were mostly correct
- Had to exclude regional aggregates

**Standardization Applied**:
- "Czechia" → "Czech Republic" ✓
- Most others were already correct ✓

**Final Structure**:
```json
{
  "title": "Average Learning Outcomes by Country",
  "description": "Average learning outcomes correspond to harmonized test scores...",
  "unit": "score",
  "source": "https://ourworldindata.org/grapher/average-harmonized-learning-outcome-scores",
  "data": {
    "Singapore": { "value": 575.27, "unit": "score" },
    // ... 170+ countries
  }
}
```

### Example 2: Historical Education Data

**Source**: https://ourworldindata.org/grapher/share-of-population-15-years-and-older-with-no-education

**Challenges Encountered**:
- Two datasets needed: 1870 and 2020
- Complementary datasets (no education + some education)
- Historical data had more missing values

**Standardization Applied**:
- Created separate files for each year
- Standardized both "no education" and "some education" datasets
- Ensured complementary datasets were consistent

**Files Created**:
1. `share_population_no_education_1870_by_country.json`
2. `share_population_no_education_2020_by_country.json`
3. `share_population_some_education_1870_by_country.json`
4. `share_population_some_education_2020_by_country.json`

### Example 3: R&D Researchers

**Source**: https://ourworldindata.org/grapher/researchers-in-rd-per-million-people

**Challenges Encountered**:
- 2022 data extraction
- Many countries with missing data (had to exclude)
- Special handling for countries with very low values

**Standardization Applied**:
- Standardized all country names
- Excluded countries with no 2022 data
- Handled low values appropriately (e.g., Myanmar: 26, Dominican Republic: 20)

## ⚠️ Common OWID Pitfalls

### Pitfall 1: Including Aggregate Regions
**Problem**: OWID often includes World Bank groupings like "East Asia and Pacific (WB)"
**Solution**: Always check for and exclude any entries with "(WB)" suffix or regional names

### Pitfall 2: Missing Data Handling
**Problem**: OWID tables show empty cells or "-" for missing data
**Solution**: Only include countries with valid numeric values for the target year

### Pitfall 3: Year Selection
**Problem**: OWID may show multiple years, need to pick the right one
**Solution**: 
- Use most recent complete year
- Note year in filename and description
- Be consistent with year selection across related datasets

### Pitfall 4: Unit Confusion
**Problem**: OWID might use different units than expected
**Solution**: 
- Check the dataset description on OWID
- Verify unit matches the data
- Be consistent with unit naming (e.g., "percent" vs "%")

### Pitfall 5: Country Name Variations
**Problem**: Some country names appear differently in OWID
**Solution**:
- Always check against `COUNTRY_MAPPING_GUIDE.md`
- Verify especially: Czechia, Congo countries, Korea, China territories

## 🎯 OWID Integration Checklist

- [ ] Access OWID grapher table view
- [ ] Identify target year
- [ ] Extract country names and values
- [ ] Standardize country names
- [ ] Exclude all aggregate regions
- [ ] Exclude countries with missing data
- [ ] Verify unit of measurement
- [ ] Include source URL with year notation
- [ ] Write clear description mentioning OWID and year
- [ ] Test dataset loads correctly
- [ ] Verify countries display on map
- [ ] Check for any mapping warnings in console

## 💡 Pro Tips

1. **Use Browser Developer Tools**: When extracting from OWID tables, inspect the HTML to get clean data
2. **Check Multiple Years**: OWID often has historical data - consider creating time-series datasets
3. **Verify Methodology**: OWID includes methodology notes - include relevant info in description
4. **Handle Special Cases**: Some OWID datasets include territories that may not render on map
5. **Cross-Reference**: Compare OWID country names with other sources to catch variations

## 📚 Related Documentation

- `DATASET_MANAGEMENT_GUIDE.md` - General dataset management
- `COUNTRY_MAPPING_GUIDE.md` - Country name standardization
- `DATASET_INTEGRATION_WORKFLOW.md` - Complete integration process

## 🎉 Conclusion

OWID is an excellent source for global statistics, but requires careful handling of country names and aggregate regions. Following this guide ensures OWID datasets integrate smoothly into GeoQuest while maintaining data quality and accuracy.

---

*Last Updated: Based on recent OWID integrations (Learning Outcomes, Education, R&D Researchers)*
*Guide Version: 1.0*

