# Dataset Integration Workflow

## 🎯 Overview

This guide provides a step-by-step workflow for integrating new datasets into GeoQuest, based on recent implementations. Follow this process to ensure datasets are properly added and functional.

## 📋 Quick Integration Checklist

- [ ] Create JSON file in `data/` directory
- [ ] Standardize all country names
- [ ] Validate JSON syntax
- [ ] Add filename to `dataFiles` array in `js/quiz.js` (alphabetically)
- [ ] Test dataset loads without errors
- [ ] Verify countries appear on map
- [ ] Test in both Play and Learn modes
- [ ] Verify dataset appears in dataset browser

## 🔄 Complete Integration Process

### Step 1: Prepare the Data

#### Gather Source Information
- **Source URL**: Always note the original data source
- **Date/Year**: Record the specific date or year of the data
- **Unit**: Identify the unit of measurement
- **Description**: Write a clear description of what the data represents

#### Example from Recent Work:
```markdown
Source: https://ourworldindata.org/grapher/average-harmonized-learning-outcome-scores
Year: 2020
Unit: score (harmonized test scores)
Description: Average learning outcomes correspond to harmonized test scores across standardized, psychometrically-robust international and regional student achievement tests.
```

### Step 2: Create JSON File Structure

#### Standard JSON Format
```json
{
  "title": "Descriptive Title of Dataset",
  "description": "Clear description of what this data represents, including source context.",
  "unit": "unit_of_measurement",
  "source": "https://source-url.com",
  "data": {
    "Country Name": {
      "value": 123.45,
      "unit": "unit_of_measurement"
    }
  }
}
```

#### Key Fields Explained

**Title**: Should be clear and descriptive
- ✅ Good: "Average Learning Outcomes by Country"
- ❌ Bad: "Learning Data" or "Countries"

**Description**: Include methodology if relevant
- ✅ Good: "Average learning outcomes correspond to harmonized test scores across standardized, psychometrically-robust international and regional student achievement tests according to Our World in Data (2020)."
- ❌ Bad: "Learning scores by country"

**Unit**: Be specific about units
- ✅ Good: "researchers per million people", "score", "percent"
- ❌ Bad: "count", "number", "value"

**Source**: Always include full URL
- ✅ Good: "https://ourworldindata.org/grapher/researchers-in-rd-per-million-people"
- ❌ Bad: "Our World in Data" or missing source

### Step 3: Country Name Standardization

**CRITICAL**: This is the most common source of integration issues.

#### Standardization Checklist
1. Use exact GeoQuest country names (see `COUNTRY_MAPPING_GUIDE.md`)
2. Check for common variations:
   - "Korea, South" → "South Korea"
   - "Czechia" → "Czech Republic"
   - "Cote d'Ivoire" → "Côte d'Ivoire"
   - "Congo, Rep." → "Congo"
   - "Democratic Republic of Congo" → "Democratic Republic of the Congo"
3. Remove aggregate regions:
   - ❌ "World", "Africa", "Asia", "Europe"
   - ❌ "OECD", "High-income countries", "Middle East"
4. Handle territories appropriately:
   - ✅ Include: "Hong Kong", "Macau", "Taiwan", "Greenland"
   - ❌ Exclude: Small territories not on map (check if they render)

#### Common Standardization Patterns

```javascript
// Pattern examples from recent work:
"Korea, South" → "South Korea"
"Korea, North (DPRK)" → "North Korea"
"People's Republic of China (PRC)" → "China"
"Macau, SAR of China" → "Macau"
"Czechia" → "Czech Republic"
"Republic of the Congo" → "Congo"
"Democratic Republic of Congo" → "Democratic Republic of the Congo"
"East Timor" → "Timor-Leste"
"Swaziland" → "Eswatini"
```

### Step 4: File Naming Convention

#### Naming Rules
- Use lowercase with underscores
- Be descriptive: `r_d_researchers_per_million_2022_by_country.json`
- Include year if temporal: `share_population_no_education_2020_by_country.json`
- Include category if relevant: `average_learning_outcomes_2020_by_country.json`
- Always end with `_by_country.json`

#### Examples from Recent Work:
- ✅ `average_learning_outcomes_2020_by_country.json`
- ✅ `share_population_no_education_1870_by_country.json`
- ✅ `share_population_no_education_2020_by_country.json`
- ✅ `share_population_some_education_1870_by_country.json`
- ✅ `r_d_researchers_per_million_2022_by_country.json`

### Step 5: Add to Quiz System

#### Locate Insertion Point in `js/quiz.js`
The `dataFiles` array is alphabetically organized. Find the correct location:

```javascript
const dataFiles = [
    // ... existing files ...
    'r_d_researchers_per_million_2022_by_country.json', // Your new file goes here
    'recreational_cannabis_legality.json',
    // ... more files ...
];
```

#### Alphabetical Placement Rules
1. Sort strictly alphabetically
2. Numbers come before letters in some systems, but our convention treats them normally
3. Underscores are ignored in sorting for human readability
4. Be careful with prefixes:
   - `r_d_*` comes before `recreational_*`
   - `share_*` comes before `sheep_*`

#### Example from Recent Integration:
```javascript
// Finding the right spot:
'share_primary_school_age_out_of_school_2024_by_country.json',
'share_population_no_education_1870_by_country.json',      // ← Added
'share_population_no_education_2020_by_country.json',      // ← Added
'share_population_some_education_1870_by_country.json',    // ← Added
'share_population_some_education_2020_by_country.json',   // ← Added
'sheep_population_by_country.json',

// For R&D dataset:
'purple_flag_countries.json',
'r_d_researchers_per_million_2022_by_country.json',        // ← Added
'recreational_cannabis_legality.json',
```

### Step 6: Validation and Testing

#### JSON Syntax Validation
```bash
# Use a JSON validator or:
# Check browser console when loading
```

#### Testing Checklist

**1. Initial Load Test**
- [ ] Open browser console
- [ ] Load application
- [ ] Check for "Failed to load" errors
- [ ] Verify no JSON syntax errors

**2. Map Visualization Test**
- [ ] Dataset appears in dataset browser (Learn mode)
- [ ] Countries color correctly on map
- [ ] No missing countries (check console for mapping warnings)
- [ ] Legend displays correctly

**3. Quiz Integration Test**
- [ ] Dataset can be selected in Play mode
- [ ] Answer validation works correctly
- [ ] Source attribution displays (if source provided)
- [ ] Color scheme applies correctly (gradient or categorical)

**4. Cross-Mode Test**
- [ ] Works in Play mode
- [ ] Works in Learn mode
- [ ] Appears in dataset browser
- [ ] Can be navigated with Previous/Next in Learn mode

### Step 7: Handle Special Cases

#### Historical Data (Multiple Years)
When adding datasets from different years of the same metric:

**Naming Convention:**
- Include year in filename: `share_population_no_education_1870_by_country.json`
- Include year in title: "Share of Population with No Formal Education by Country (1870)"

**Best Practice:**
- Create separate files for each year
- Add all files to `dataFiles` array
- They will appear as separate datasets in the quiz

**Example from Recent Work:**
```
share_population_no_education_1870_by_country.json
share_population_no_education_2020_by_country.json
share_population_some_education_1870_by_country.json
share_population_some_education_2020_by_country.json
```

#### Complementary Datasets
For datasets that complement each other (like "no education" and "some education"):

1. Keep them as separate files
2. Name them clearly to show relationship
3. Add them sequentially in the `dataFiles` array for easy management
4. Each becomes an independent quiz question

## 🚨 Common Issues and Solutions

### Issue 1: Dataset Not Appearing
**Symptoms**: File exists but doesn't show in dataset browser
**Causes**:
- Not added to `dataFiles` array
- JSON syntax error
- Invalid country names causing load failure

**Solution**:
1. Verify filename in `dataFiles` array matches exactly
2. Check browser console for JSON parsing errors
3. Validate JSON syntax using a validator
4. Check for country name mapping warnings

### Issue 2: Countries Not Coloring
**Symptoms**: Map shows but countries stay white/default
**Causes**:
- Country names don't match GeoJSON mapping
- Values are non-numeric (strings instead of numbers)
- Data structure doesn't match expected format

**Solution**:
1. Check console for "No mapping found" warnings
2. Verify country names against `COUNTRY_MAPPING_GUIDE.md`
3. Ensure all values are numbers (not strings like "100" vs 100)
4. Verify data structure matches: `{ "Country": { "value": 123, "unit": "..." } }`

### Issue 3: Alphabetical Placement Errors
**Symptoms**: Dataset appears in wrong order in browser
**Causes**:
- Incorrect alphabetical placement in `dataFiles` array

**Solution**:
1. Use strict alphabetical sorting
2. Remember: `r_d_*` comes before `recreational_*` (underscores matter for sorting)
3. Numbers sort normally: `2020` comes before `2022`
4. Double-check placement before and after your entry

## 📊 Quality Assurance Checklist

Before considering a dataset "done", verify:

- [ ] ✅ JSON file is syntactically valid
- [ ] ✅ All required fields present (title, description, source, data)
- [ ] ✅ All country names standardized
- [ ] ✅ No aggregate regions (World, Africa, etc.)
- [ ] ✅ Values are numeric (not strings)
- [ ] ✅ Unit is clearly specified
- [ ] ✅ Source URL is valid and accessible
- [ ] ✅ Filename follows convention
- [ ] ✅ Added to `dataFiles` array in correct alphabetical position
- [ ] ✅ No console errors on load
- [ ] ✅ Countries display on map
- [ ] ✅ Works in Play mode
- [ ] ✅ Works in Learn mode
- [ ] ✅ Appears in dataset browser
- [ ] ✅ Source attribution displays (if source provided)

## 🎯 Best Practices Summary

1. **Always Standardize First**: Fix country names before anything else
2. **Test Early**: Load dataset as soon as basic structure exists
3. **Use Consistent Formatting**: Follow existing dataset patterns
4. **Include Source Attribution**: Always provide source URL
5. **Be Descriptive**: Clear titles and descriptions help users
6. **Handle Missing Data**: Use appropriate defaults (null, 0, or exclude)
7. **Document Special Cases**: Note any unusual data handling in comments
8. **Test Thoroughly**: Check all modes before considering complete

## 📝 Example: Complete Integration

Here's a complete example from recent work:

**1. Source Data**:
```
URL: https://ourworldindata.org/grapher/researchers-in-rd-per-million-people
Year: 2022
Data: Number of R&D researchers per million people
```

**2. Create JSON**:
```json
{
  "title": "Number of R&D Researchers per Million People by Country",
  "description": "Professionals engaged in conceiving or creating new knowledge, products, processes, methods, or systems. Number of R&D researchers per million people according to Our World in Data (2022).",
  "unit": "researchers per million people",
  "source": "https://ourworldindata.org/grapher/researchers-in-rd-per-million-people",
  "data": {
    "South Korea": { "value": 9435, "unit": "researchers per million people" },
    // ... more countries ...
  }
}
```

**3. Standardize Countries**:
- Check: "Korea, South" → "South Korea" ✓
- Check: "Czechia" → "Czech Republic" ✓
- Remove: "World", "Africa", etc. ✓

**4. Name File**:
`r_d_researchers_per_million_2022_by_country.json`

**5. Add to quiz.js**:
```javascript
'purple_flag_countries.json',
'r_d_researchers_per_million_2022_by_country.json',  // ← Added here
'recreational_cannabis_legality.json',
```

**6. Test**:
- ✅ Loads without errors
- ✅ Countries appear on map
- ✅ Works in Play and Learn modes
- ✅ Appears in dataset browser

## 🎉 Conclusion

Following this workflow ensures datasets integrate smoothly into GeoQuest. The most critical step is country name standardization - get that right first, and the rest becomes straightforward. Always test thoroughly before considering integration complete.

---

*Last Updated: Based on recent dataset integrations (Learning Outcomes, Education Data, R&D Researchers)*
*Workflow Version: 1.0*

