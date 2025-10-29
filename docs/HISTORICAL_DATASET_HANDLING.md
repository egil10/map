# Historical Dataset Handling Guide

## 🎯 Overview

This guide covers best practices for handling historical datasets and time-series data in GeoQuest, based on recent work with education data spanning from 1870 to 2020.

## 📅 Understanding Historical Data

### What Are Historical Datasets?

Historical datasets show the same metric across different time periods, allowing comparisons over time. Examples from recent work:
- Education data: 1870 vs 2020
- Population: Multiple years
- Economic indicators: Time series data

### When to Create Multiple Historical Datasets

Create separate datasets when:
1. **Significant Time Gap**: Large gaps (e.g., 1870 vs 2020) show dramatic changes
2. **Different Contexts**: Each year provides unique insights
3. **Complementary Metrics**: Related but inverse metrics (e.g., "no education" vs "some education")
4. **User Interest**: Comparison value is high

**Don't create separate datasets when:**
- Years are consecutive (e.g., 2021, 2022, 2023) - too granular
- Data is identical - no change over time
- Differences are negligible

## 🗂️ File Organization Strategy

### Naming Convention for Historical Data

**Include Year in Filename**:
```
[metric]_[year]_by_country.json
```

**Examples from Recent Work**:
```
share_population_no_education_1870_by_country.json
share_population_no_education_2020_by_country.json
share_population_some_education_1870_by_country.json
share_population_some_education_2020_by_country.json
```

### Title Formatting

**Include Year in Title**:
```json
{
  "title": "Share of Population with No Formal Education by Country (1870)",
  "description": "... according to Our World in Data (1870)."
}
```

**For Latest Data**:
```json
{
  "title": "Number of R&D Researchers per Million People by Country",
  "description": "... according to Our World in Data (2022)."
}
```

### Alphabetical Placement

Historical datasets should be placed together in `dataFiles` array:

```javascript
'share_population_no_education_1870_by_country.json',
'share_population_no_education_2020_by_country.json',
'share_population_some_education_1870_by_country.json',
'share_population_some_education_2020_by_country.json',
```

**Sorting Order**:
1. Metric name (alphabetically)
2. Year (chronologically within same metric)

## 📊 Handling Complementary Datasets

### Example: No Education vs Some Education

When creating complementary datasets (inverse metrics):

**Strategy 1: Separate Files (Recommended)**
```
File 1: share_population_no_education_2020_by_country.json
File 2: share_population_some_education_2020_by_country.json
```

**Why Separate?**
- ✅ Clear, focused quiz questions
- ✅ Independent dataset management
- ✅ Better user experience (not confusing)
- ✅ Easier to update one without affecting the other

**Strategy 2: Combined File (Not Recommended)**
```
File: education_status_2020_by_country.json
Data: { "no_education": {...}, "some_education": {...} }
```

**Why Not Combined?**
- ❌ Complex data structure
- ❌ Difficult to create quiz questions
- ❌ Mixing categorical data types

### Real-World Example from Recent Work

**Complementary Datasets Created**:

1. **No Education (1870)**:
   - `share_population_no_education_1870_by_country.json`
   - Shows % with NO formal education in 1870
   - Values: 0-100% (most countries near 100%)

2. **No Education (2020)**:
   - `share_population_no_education_2020_by_country.json`
   - Shows % with NO formal education in 2020
   - Values: 0-100% (most countries <10%)

3. **Some Education (1870)**:
   - `share_population_some_education_1870_by_country.json`
   - Shows % with AT LEAST SOME formal education in 1870
   - Values: 0-100% (most countries near 0%)
   - **Note**: Inverse of "no education" but separate dataset

4. **Some Education (2020)**:
   - `share_population_some_education_2020_by_country.json`
   - Shows % with AT LEAST SOME formal education in 2020
   - Values: 0-100% (most countries >90%)

**Key Insight**: Even though "no education" and "some education" are mathematically complementary, they serve as separate quiz questions and provide different educational value.

## 🕐 Year Selection Guidelines

### Choosing Target Years

**For Historical Comparison Datasets**:
- **Anchor Years**: Significant historical moments (1870, 1900, 1950, 2000)
- **Milestone Years**: Decades that mark changes (1990, 2000, 2010, 2020)
- **Data Availability**: Years with most complete country coverage

**For Latest Data**:
- **Most Recent Complete Year**: Latest year with comprehensive data
- **Current Year - 1 or 2**: If current year is incomplete
- **Stated in Source**: Use year explicitly stated in OWID or source

**Examples**:
- ✅ 1870 (historical baseline for education)
- ✅ 2020 (recent complete data, pre-COVID in many cases)
- ✅ 2022 (current available data)
- ❌ 2024 (if only partial data available)
- ❌ Random years without significance

### Handling Missing Years

If source provides multiple years but you need specific years:

**Scenario 1: Target Year Has Data**
```
Source: 1990, 2000, 2010, 2020
Target: 2020
Action: Extract only 2020 data
```

**Scenario 2: Target Year Missing, Nearby Year Available**
```
Source: 2019, 2021, 2022, 2023
Target: 2020
Action: Consider using 2019 or 2021, note in description
```

**Scenario 3: Source Only Shows Trends**
```
Source: Shows "1989-2020" with only start/end values
Action: Use provided values, note date range in description
```

## 📝 Description Best Practices

### Historical Context in Descriptions

**Include**:
1. **Time Period**: Explicitly state the year
2. **Historical Context**: If relevant, note significance
3. **Source Information**: Always attribute source and year

**Example from Recent Work**:
```json
{
  "description": "The share of adults aged between 15 and 64 years old with no formal education according to Our World in Data (1870)."
}
```

vs

```json
{
  "description": "The share of adults aged between 15 and 64 years old with no formal education according to Our World in Data (2020)."
}
```

### Indicating Time Periods

**Clear Year Notation**:
- ✅ "... according to Our World in Data (1870)."
- ✅ "... according to Our World in Data (2020)."
- ❌ "... historical data from OWID"
- ❌ "... data from various years"

## 🔄 Data Consistency Across Years

### Ensuring Comparable Data

When creating historical comparison datasets:

1. **Same Source**: Use same data source for all years
2. **Same Methodology**: Ensure methodology is consistent
3. **Same Countries**: Include same country set when possible
4. **Same Units**: Verify units are consistent across years

### Handling Methodology Changes

**If Methodology Changed**:
- Note in description: "Methodology updated in [year]"
- Consider separate datasets if methodology differs significantly
- Document differences clearly

**Example**:
```json
{
  "description": "Share of population with no formal education. Note: Data collection methodology was updated in 1990, so values may not be directly comparable to earlier years."
}
```

## 🎯 Implementation Workflow

### Step-by-Step: Creating Historical Datasets

**Step 1: Identify Comparison Points**
- Determine which years to include
- Assess data availability for each year
- Consider significance of time periods

**Step 2: Extract Data for Each Year**
- Extract data separately for each target year
- Maintain consistent country coverage
- Note any data quality differences

**Step 3: Standardize Across Years**
- Apply same country name standardization
- Use consistent data structure
- Maintain same units and formatting

**Step 4: Create Separate Files**
- One file per year (for significant gaps)
- Consistent naming: `[metric]_[year]_by_country.json`
- Include year in title and description

**Step 5: Add to Quiz System**
- Add all files to `dataFiles` array
- Place together alphabetically by metric, then by year
- Test all datasets independently

## 📊 Real-World Example: Education Historical Data

### The Complete Set

**Files Created** (4 complementary datasets):

1. `share_population_no_education_1870_by_country.json`
   - 1870 baseline for no education
   - Most countries near 100%
   - Historical starting point

2. `share_population_no_education_2020_by_country.json`
   - 2020 current state of no education
   - Most countries <10%
   - Shows improvement over 150 years

3. `share_population_some_education_1870_by_country.json`
   - 1870 baseline for some education
   - Most countries near 0%
   - Inverse perspective

4. `share_population_some_education_2020_by_country.json`
   - 2020 current state of some education
   - Most countries >90%
   - Shows achievement over time

### Why This Structure Works

1. **Clear Quiz Questions**: Each file becomes a distinct quiz
2. **Easy Comparison**: Users can mentally compare 1870 vs 2020
3. **Complementary Learning**: "No education" and "some education" reinforce each other
4. **Time Context**: Year clearly indicated in filename, title, description

### User Experience

When users encounter these datasets:
- Can select "Share of Population with No Formal Education (1870)"
- Can select "Share of Population with No Formal Education (2020)"
- Can mentally compare the dramatic change
- Can understand both "no education" and "some education" perspectives

## ⚠️ Common Pitfalls

### Pitfall 1: Mixing Years in One Dataset
**Problem**: Including multiple years in one file
**Solution**: Create separate files for significant time gaps

### Pitfall 2: Inconsistent Country Coverage
**Problem**: Different countries in different years
**Solution**: Note in description if coverage differs, maintain same country set when possible

### Pitfall 3: Unclear Year Notation
**Problem**: Year not clearly indicated in filename or title
**Solution**: Always include year in both filename and title

### Pitfall 4: Forgetting to Update All Years
**Problem**: Updating one year but not related years
**Solution**: When updating historical datasets, check all related years

## 🎯 Best Practices Summary

1. **Separate Files for Significant Gaps**: 50+ year gaps deserve separate datasets
2. **Clear Year Indication**: Year in filename, title, and description
3. **Consistent Naming**: Follow pattern: `[metric]_[year]_by_country.json`
4. **Alphabetical Grouping**: Place related years together in `dataFiles`
5. **Complementary Datasets**: Create separate files even for inverse metrics
6. **Source Attribution**: Always include source URL and year
7. **Description Context**: Include time period significance if relevant
8. **Data Consistency**: Use same source, methodology, units across years

## 🎉 Conclusion

Historical datasets provide valuable educational content by showing change over time. Following this guide ensures historical data is properly organized, clearly labeled, and provides maximum educational value to GeoQuest users.

---

*Last Updated: Based on recent historical education dataset implementations*
*Guide Version: 1.0*

