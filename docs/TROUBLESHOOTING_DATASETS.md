# Dataset Troubleshooting Guide

## 🎯 Overview

This guide covers common issues encountered when integrating datasets into GeoQuest, with specific solutions based on real-world troubleshooting experience.

## 🚨 Quick Diagnostic Checklist

When a dataset isn't working, check in this order:

1. [ ] JSON syntax is valid
2. [ ] File is in `data/` directory
3. [ ] Filename matches exactly in `dataFiles` array
4. [ ] Country names are standardized
5. [ ] Values are numeric (not strings)
6. [ ] No aggregate regions included
7. [ ] Source URL is accessible
8. [ ] Browser console shows no errors

## 🔍 Problem-Solution Matrix

### Issue Category 1: Dataset Not Loading

#### Symptom: Dataset doesn't appear in browser
**Possible Causes:**
- File not in `dataFiles` array
- Filename mismatch
- JSON syntax error
- File not in `data/` directory

**Diagnostic Steps:**
1. Check `js/quiz.js` `dataFiles` array - is filename present?
2. Verify filename spelling matches exactly (case-sensitive)
3. Validate JSON syntax with JSON validator
4. Check file is in `data/` directory (not subdirectory)

**Solutions:**
```javascript
// Add to dataFiles array in js/quiz.js
const dataFiles = [
    // ... existing files ...
    'your_dataset_name.json',  // ← Add here, alphabetically
];
```

**Common Mistakes:**
- Typo in filename: `dataset.json` vs `datasets.json`
- Wrong location: File in root instead of `data/`
- Case mismatch: `Dataset.json` vs `dataset.json`

---

#### Symptom: Console shows "Failed to load" error
**Possible Causes:**
- Invalid JSON syntax
- Missing required fields
- File path incorrect
- Network/server issue

**Diagnostic Steps:**
1. Check browser console for specific error message
2. Validate JSON syntax (use JSON validator online)
3. Verify file path: should be `data/your_file.json`
4. Check file permissions

**Solutions:**
```json
// Ensure valid JSON structure
{
  "title": "Your Title",  // ← Required
  "description": "...",    // Optional but recommended
  "source": "...",        // Optional but recommended
  "unit": "...",          // Optional
  "data": {               // ← Required
    "Country": {
      "value": 123,
      "unit": "..."
    }
  }
}
```

**Common Mistakes:**
- Trailing comma: `"value": 123,` (last item)
- Missing quotes: `title: "..."` (should be `"title": "..."`)
- Unclosed brackets: `{ "data": { ...` (missing closing `}`)

---

### Issue Category 2: Countries Not Displaying

#### Symptom: Dataset loads but countries stay white/uncolored
**Possible Causes:**
- Country names don't match GeoJSON mapping
- Values are strings instead of numbers
- Data structure doesn't match expected format

**Diagnostic Steps:**
1. Open browser console - look for "No mapping found for..." warnings
2. Check country names against `COUNTRY_MAPPING_GUIDE.md`
3. Verify values are numbers: `123` not `"123"`
4. Check data structure matches expected format

**Solutions:**
```json
// ❌ WRONG - String value
{
  "data": {
    "United States": {
      "value": "331900000"  // ← String, won't work!
    }
  }
}

// ✅ CORRECT - Number value
{
  "data": {
    "United States": {
      "value": 331900000  // ← Number, will work!
    }
  }
}
```

**Country Name Fixes:**
```json
// ❌ WRONG - Abbreviation
"USA": { "value": 123 }

// ✅ CORRECT - Full name
"United States": { "value": 123 }

// ❌ WRONG - Variation
"Korea, South": { "value": 123 }

// ✅ CORRECT - Standardized
"South Korea": { "value": 123 }
```

---

#### Symptom: Only some countries display
**Possible Causes:**
- Mixed country name formats
- Some countries not in GeoJSON
- Some values are null/undefined

**Diagnostic Steps:**
1. Check console for mapping warnings - note which countries fail
2. Verify all country names against standardized list
3. Check for null/undefined values
4. Verify country exists in GeoJSON (some territories don't render)

**Solutions:**
```javascript
// After loading dataset, check console:
// Look for warnings like:
// "⚠️ No mapping found for: [Country Name]"

// Fix by standardizing country name:
"Korea, South" → "South Korea"
"Czechia" → "Czech Republic"
```

---

### Issue Category 3: Data Structure Issues

#### Symptom: Data loads but values seem wrong
**Possible Causes:**
- Wrong unit specified
- Values extracted from wrong column
- Data transformation error

**Diagnostic Steps:**
1. Compare values with source data
2. Verify unit matches data type
3. Check if values were extracted from correct year/column
4. Verify data transformation logic

**Solutions:**
```json
// Verify unit matches data:
{
  "title": "Population by Country",
  "unit": "people",  // ← Should match actual values
  "data": {
    "China": {
      "value": 1411000000,  // ← Billions or actual count?
      "unit": "people"
    }
  }
}
```

---

#### Symptom: Some countries have null/undefined values
**Possible Causes:**
- Missing data in source
- Extraction error
- Special value handling needed

**Diagnostic Steps:**
1. Check source data - does country have value?
2. Verify extraction didn't miss the value
3. Check for special notations (N/A, -, null, etc.)

**Solutions:**
```json
// ❌ WRONG - Include missing data
{
  "data": {
    "Country": {
      "value": null  // ← Don't include!
    }
  }
}

// ✅ CORRECT - Exclude missing data
{
  "data": {
    // Simply don't include countries without data
  }
}
```

---

### Issue Category 4: Alphabetical Placement

#### Symptom: Dataset appears in wrong order in browser
**Possible Causes:**
- Incorrect alphabetical placement in `dataFiles`
- Sort order misunderstanding

**Diagnostic Steps:**
1. Check position in `dataFiles` array
2. Verify alphabetical sorting rules
3. Note that `r_d_*` comes before `recreational_*`

**Solutions:**
```javascript
// Correct alphabetical order:
const dataFiles = [
    'purple_flag_countries.json',
    'r_d_researchers_per_million_2022_by_country.json',  // ← r_d before rec
    'recreational_cannabis_legality.json',
    'red_flag_countries.json',
    // ...
];
```

**Alphabetical Rules:**
- Numbers come before letters normally
- Underscores are part of the string for sorting
- `r_d_*` sorts before `recreational_*`
- Case-sensitive (but all our files are lowercase)

---

### Issue Category 5: Source and Attribution

#### Symptom: Source not displaying or incorrect
**Possible Causes:**
- Missing source field
- Invalid URL
- Source URL not accessible

**Diagnostic Steps:**
1. Check JSON has `"source"` field
2. Verify URL is valid and accessible
3. Test URL in browser

**Solutions:**
```json
// ✅ CORRECT - Valid source URL
{
  "source": "https://ourworldindata.org/grapher/dataset-name"
}

// ❌ WRONG - Missing or invalid
{
  // No source field
}
// or
{
  "source": "OWID"  // ← Not a valid URL
}
```

---

## 🛠️ Debugging Tools and Techniques

### Browser Console Diagnostics

**Enable Detailed Logging:**
```javascript
// In browser console, check for:
console.log('Dataset list:', quizInstance.datasetList.length);
console.log('Current quiz:', quizInstance.currentQuiz);
```

**Check for Mapping Warnings:**
```
// Look for these in console:
⚠️ No mapping found for: [Country Name]
⚠️ Failed to load dataset: [filename]
```

**Verify Data Structure:**
```javascript
// In browser console after load:
const quiz = quizInstance.datasetList.find(d => d.id === 'your_dataset_id');
console.log('Quiz data:', quiz);
console.log('Countries:', Object.keys(quiz.countries));
console.log('First country:', quiz.countries[Object.keys(quiz.countries)[0]]);
```

### JSON Validation

**Online Validators:**
- JSONLint: https://jsonlint.com/
- JSON Formatter: https://jsonformatter.org/

**Common JSON Errors:**
- Trailing commas
- Missing quotes around keys
- Unclosed brackets/braces
- Invalid escape sequences

### Country Name Verification

**Check Against Existing Datasets:**
```bash
# Search existing datasets for country name pattern
grep -r "United States" data/*.json
grep -r "South Korea" data/*.json
```

**Test Country Name:**
```javascript
// In browser console, test if country renders:
// Load a simple test dataset with just that country
const testData = {
  title: "Test",
  data: {
    "Your Test Country": { value: 100, unit: "test" }
  }
};
// See if it appears on map
```

## 📋 Step-by-Step Debugging Workflow

### When Dataset Doesn't Work:

**Step 1: Verify Basic Requirements**
- [ ] File exists in `data/` directory
- [ ] JSON syntax is valid
- [ ] Filename in `dataFiles` array
- [ ] Required fields present (title, data)

**Step 2: Check Loading**
- [ ] No console errors on page load
- [ ] Dataset appears in dataset browser
- [ ] Dataset count increased correctly

**Step 3: Verify Mapping**
- [ ] No "No mapping found" warnings
- [ ] Countries appear on map
- [ ] At least some countries color correctly

**Step 4: Check Data Quality**
- [ ] Values are numbers
- [ ] Unit is appropriate
- [ ] Source attribution works
- [ ] Description is clear

## 🎯 Common Error Messages and Solutions

### "Failed to load dataset: [filename]"
**Cause**: File not found or invalid JSON
**Solution**: 
1. Check file exists in `data/` directory
2. Validate JSON syntax
3. Verify filename matches exactly

### "No mapping found for: [Country]"
**Cause**: Country name doesn't match GeoJSON
**Solution**:
1. Check `COUNTRY_NAME_STANDARDIZATION_QUICK_REFERENCE.md`
2. Standardize country name
3. Test with existing datasets to see correct format

### "Invalid data format"
**Cause**: Data structure doesn't match expected format
**Solution**:
1. Verify structure: `{ "Country": { "value": 123, "unit": "..." } }`
2. Check values are numbers
3. Verify no null/undefined values included

### "Dataset list length is [number]"
**Cause**: Dataset loaded but not working correctly
**Solution**:
1. Check if dataset appears in browser
2. Verify it's selectable in Play mode
3. Check console for specific errors

## 💡 Pro Troubleshooting Tips

1. **Start Small**: Test with 5-10 countries first, then expand
2. **Check Console First**: Errors appear immediately
3. **Compare with Working Dataset**: Use existing dataset as template
4. **Test Incrementally**: Load dataset, check console, test visualization, then move on
5. **Document Issues**: Note any unusual problems for future reference

## 🔄 Recovery Procedures

### If Dataset Partially Works:

1. **Identify Working Countries**: Note which countries display
2. **Identify Problem Countries**: Check console warnings
3. **Fix Problem Names**: Standardize remaining country names
4. **Retest**: Load again and verify all countries work

### If Dataset Completely Fails:

1. **Start Fresh**: Create new JSON file from template
2. **Add Countries Incrementally**: Add 5 countries, test, add 5 more
3. **Verify Each Step**: Check console after each addition
4. **Once Working**: Add remaining countries

## 📚 Related Documentation

- `DATASET_INTEGRATION_WORKFLOW.md` - Complete integration process
- `COUNTRY_NAME_STANDARDIZATION_QUICK_REFERENCE.md` - Country name fixes
- `OWID_DATA_INTEGRATION_GUIDE.md` - OWID-specific issues

## 🎉 Conclusion

Most dataset issues stem from country name standardization or JSON syntax errors. Following this troubleshooting guide should resolve 95% of problems. For persistent issues, check browser console for specific error messages and refer to related documentation.

---

*Last Updated: Based on recent dataset integration troubleshooting*
*Guide Version: 1.0*

