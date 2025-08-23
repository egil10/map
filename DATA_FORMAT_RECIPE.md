# Data Format Recipe for Map Application

## Overview
This document provides the exact format and conventions needed to create new JSON data files that will work seamlessly with the map application. Follow this recipe to ensure your data becomes "plug and play".

## File Structure

### 1. Basic JSON Structure
```json
{
  "title": "Your Quiz Title",
  "description": "Brief description of what this data represents",
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

### 2. Required Fields
- **title**: The quiz title that appears in the game
- **description**: Brief description (optional but recommended)
- **unit**: The unit of measurement (e.g., "km²", "°C", "people", "%")
- **source**: URL to the data source (required for attribution)
- **data**: Object containing country-value pairs

## Country Naming Conventions

### ✅ Use These Exact Names
The application uses a mapping system that recognizes these country names:

**Major Countries:**
- "United States" (maps to "USA")
- "United Kingdom" (maps to "England")
- "Russia" (maps to "Russian Federation")
- "Czech Republic" (maps to "Czechia")
- "Macedonia" (maps to "North Macedonia")

**Standard Names:**
- "Afghanistan", "Albania", "Algeria", "Angola", "Argentina"
- "Armenia", "Australia", "Austria", "Azerbaijan", "Bangladesh"
- "Belarus", "Belgium", "Belize", "Benin", "Bhutan"
- "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil"
- "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon"
- "Canada", "Central African Republic", "Chad", "Chile", "China"
- "Colombia", "Congo", "Costa Rica", "Croatia", "Cuba"
- "Cyprus", "Democratic Republic of the Congo", "Denmark", "Djibouti"
- "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Eritrea"
- "Estonia", "Ethiopia", "Finland", "France", "Gabon"
- "Gambia", "Georgia", "Germany", "Ghana", "Greece"
- "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti"
- "Honduras", "Hungary", "India", "Indonesia", "Iran"
- "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast"
- "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya"
- "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon"
- "Lesotho", "Liberia", "Libya", "Lithuania", "Luxembourg"
- "Madagascar", "Malawi", "Malaysia", "Mali", "Mauritania"
- "Mauritius", "Mexico", "Moldova", "Mongolia", "Montenegro"
- "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal"
- "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria"
- "North Korea", "Norway", "Oman", "Pakistan", "Panama"
- "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland"
- "Portugal", "Qatar", "Romania", "Rwanda", "Saudi Arabia"
- "Senegal", "Serbia", "Sierra Leone", "Slovakia", "Slovenia"
- "Somalia", "South Africa", "South Korea", "South Sudan", "Spain"
- "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland"
- "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand"
- "Togo", "Tunisia", "Turkey", "Turkmenistan", "Uganda"
- "Ukraine", "United Arab Emirates", "Uruguay", "Uzbekistan", "Venezuela"
- "Vietnam", "Yemen", "Zambia", "Zimbabwe"

### ❌ Avoid These Names
- "USA" (use "United States")
- "UK" (use "United Kingdom")
- "England" (use "United Kingdom")
- "Czechoslovakia" (use "Czech Republic")
- "Yugoslavia" (use individual countries)
- "USSR" (use "Russia")

## Data Value Types

### Numeric Values
```json
{
  "data": {
    "United States": {
      "value": 9833517,
      "unit": "km²"
    }
  }
}
```

### Percentage Values
```json
{
  "data": {
    "Norway": {
      "value": 85.7,
      "unit": "%"
    }
  }
}
```

### Temperature Values
```json
{
  "data": {
    "Libya": {
      "value": 58.0,
      "unit": "°C"
    }
  }
}
```

## Complete Example

```json
{
  "title": "Coffee Production",
  "description": "Annual coffee production in metric tons",
  "unit": "tons",
  "source": "https://www.fao.org/faostat/en/#data/QCL",
  "data": {
    "Brazil": {
      "value": 3420000,
      "unit": "tons"
    },
    "Vietnam": {
      "value": 1650000,
      "unit": "tons"
    },
    "Colombia": {
      "value": 810000,
      "unit": "tons"
    },
    "Indonesia": {
      "value": 660000,
      "unit": "tons"
    },
    "Ethiopia": {
      "value": 384000,
      "unit": "tons"
    }
  }
}
```

## File Naming Convention

Name your files descriptively:
- `coffee_production_by_country.json`
- `internet_speed_by_country.json`
- `beer_consumption_by_country.json`

## Validation Checklist

Before adding your JSON file:

1. ✅ File is valid JSON (no syntax errors)
2. ✅ Contains all required fields (title, unit, source, data)
3. ✅ Country names match the approved list above
4. ✅ Values are numbers (not strings)
5. ✅ Unit is appropriate for the data type
6. ✅ Source URL is valid and accessible
7. ✅ File name is descriptive and uses underscores

## Testing Your Data

1. Place your JSON file in the `data/` folder
2. Refresh the application
3. Check the browser console for any mapping warnings
4. Verify the quiz appears in the quiz selection
5. Test that countries display correctly on the map

## Troubleshooting

### Common Issues:
- **"No mapping found for country"**: Use the exact country names from the approved list
- **"Invalid color format"**: Ensure all values are numbers, not strings
- **Quiz doesn't appear**: Check JSON syntax and required fields
- **Countries not showing**: Verify country names match the GeoJSON data

### Debug Tips:
- Check browser console for warnings
- Verify JSON syntax with a JSON validator
- Test with a small subset of countries first
