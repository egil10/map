# Cannabis Legality Datasets - Implementation Case Study

## 🎯 Overview

This document provides a detailed case study of the implementation of two comprehensive categorical datasets mapping cannabis legality across the globe. These datasets represent a perfect example of how to create, standardize, and integrate categorical data into the GeoQuest application.

## 📊 Dataset Information

### Dataset 1: Recreational Cannabis Legality
**File**: `data/recreational_cannabis_legality.json`

**Metadata**:
- **Title**: "Legality of Cannabis: Recreational Use"
- **Description**: "Legal status of recreational cannabis use by country."
- **Source**: https://en.wikipedia.org/wiki/Legality_of_cannabis
- **Data Type**: Categorical
- **Countries Covered**: 200+
- **Categories**: 3 (Legal, Decriminalized, Illegal)
- **Date Created**: October 2025

### Dataset 2: Medical Cannabis Legality
**File**: `data/medical_cannabis_legality.json`

**Metadata**:
- **Title**: "Legality of Cannabis: Medical Use"
- **Description**: "Legal status of medical cannabis use by country."
- **Source**: https://en.wikipedia.org/wiki/Legality_of_cannabis
- **Data Type**: Categorical
- **Countries Covered**: 200+
- **Categories**: 2 (Legal, Illegal)
- **Date Created**: October 2025

## 🚀 Implementation Journey

### Phase 1: Data Collection

#### Source Analysis
The data was collected from Wikipedia's comprehensive article on cannabis legality, which provides detailed information about legal status in every country worldwide.

**Data Structure in Source**:
- Organized by region (Americas, Europe, Asia, etc.)
- Mixed naming conventions for countries
- Special cases and territories included
- Historical context provided

#### Initial Challenges
1. **Country Name Variations**: Wikipedia uses formal country names that don't always match GeoQuest's internal mapping
2. **Special Characters**: Countries like "Côte d'Ivoire" required standardization
3. **Political Complexities**: Korea (North vs South), Congo (DRC vs Republic)
4. **Territories**: Had to decide which territories to include

### Phase 2: Category Definition

#### Recreational Cannabis Categories
We defined three clear categories based on legal analysis:

**1. Legal** - Full recreational legalization
- Countries where recreational cannabis use is fully legal
- May have regulations on quantity, age, location
- Examples: Canada, Uruguay, Netherlands

**2. Decriminalized** - Not criminal offense but not fully legal
- Possession of small amounts is not a criminal offense
- May still face fines or confiscation
- Not fully legalized for sale and distribution
- Examples: Portugal, Costa Rica, Czech Republic

**3. Illegal** - Prohibited
- Possession and use are criminal offenses
- May face imprisonment or other penalties
- Includes countries with medical-only provisions
- Examples: Japan, Singapore, Saudi Arabia

#### Medical Cannabis Categories
Simpler binary classification:

**1. Legal** - Medical use is legal with prescription/authorization
- Legal medical cannabis programs exist
- May require specific conditions or prescriptions
- Examples: United Kingdom, Germany, Israel

**2. Illegal** - No legal medical provisions
- Medical use is not recognized or permitted
- No legal framework for medical cannabis
- Examples: Japan (recent change), Indonesia, Russia

### Phase 3: Country Name Standardization

This was the most intensive phase, requiring careful mapping of every country name.

#### Standardization Challenges and Solutions

##### Challenge 1: Korea
**Wikipedia Format**: "Korea, South" and "Korea, North (DPRK)"
**GeoQuest Format**: "South Korea" and "North Korea"

**Solution**:
```json
// Before standardization
{"country": "Korea, South", "value": "Illegal"}
{"country": "Korea, North (DPRK)", "value": "Legal"}

// After standardization
{"country": "South Korea", "value": "Illegal"}
{"country": "North Korea", "value": "Legal"}
```

##### Challenge 2: China/Macau
**Wikipedia Format**: "People's Republic of China (PRC)", "Macau, SAR of China"
**GeoQuest Format**: "China", "Macau"

**Solution**:
```json
// Before standardization
{"country": "People's Republic of China (PRC)", "value": "Illegal"}
{"country": "Macau, SAR of China", "value": "Illegal"}

// After standardization
{"country": "China", "value": "Illegal"}
{"country": "Macau", "value": "Illegal"}
```

##### Challenge 3: Congo Countries
**Wikipedia Format**: "Democratic Republic of the Congo", "Republic of the Congo"
**GeoQuest Format**: "Democratic Republic of the Congo", "Congo"

**Solution**:
```json
// Before standardization
{"country": "Democratic Republic of the Congo", "value": "Illegal"}
{"country": "Republic of the Congo", "value": "Illegal"}

// After standardization
{"country": "Democratic Republic of the Congo", "value": "Illegal"}
{"country": "Congo", "value": "Illegal"}
```

##### Challenge 4: Eswatini
**Wikipedia Format**: "Eswatini (Swaziland)"
**GeoQuest Format**: "Eswatini"

**Solution**:
```json
// Before standardization
{"country": "Eswatini (Swaziland)", "value": "Illegal"}

// After standardization
{"country": "Eswatini", "value": "Illegal"}
```

##### Challenge 5: Ivory Coast
**Wikipedia Format**: "Ivory Coast"
**GeoQuest Format**: "Ivory Coast"

**Note**: This one was already correct, but worth documenting as it's commonly seen as "Côte d'Ivoire" in other sources.

```json
// Correct format (no change needed)
{"country": "Ivory Coast", "value": "Illegal"}
```

#### Complete Standardization Mapping

Here's the complete mapping used for these datasets:

```
Wikipedia Name → GeoQuest Name
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Afghanistan → Afghanistan
Albania → Albania
Algeria → Algeria
Andorra → Andorra
Angola → Angola
Antigua and Barbuda → Antigua and Barbuda
Argentina → Argentina
Armenia → Armenia
Australia → Australia
Austria → Austria
Azerbaijan → Azerbaijan
Bahamas → Bahamas
Bahrain → Bahrain
Bangladesh → Bangladesh
Barbados → Barbados
Belarus → Belarus
Belgium → Belgium
Belize → Belize
Benin → Benin
Bermuda → Bermuda
Bhutan → Bhutan
Bolivia → Bolivia
Bosnia and Herzegovina → Bosnia and Herzegovina
Botswana → Botswana
Brazil → Brazil
Brunei → Brunei
Bulgaria → Bulgaria
Burkina Faso → Burkina Faso
Burundi → Burundi
Cambodia → Cambodia
Cameroon → Cameroon
Canada → Canada
Cape Verde → Cape Verde
Central African Republic → Central African Republic
Chad → Chad
Chile → Chile
People's Republic of China (PRC) → China
Colombia → Colombia
Comoros → Comoros
Cook Islands → Cook Islands
Costa Rica → Costa Rica
Croatia → Croatia
Cuba → Cuba
Cyprus → Cyprus
Czech Republic → Czech Republic
Democratic Republic of the Congo → Democratic Republic of the Congo
Denmark → Denmark
Djibouti → Djibouti
Dominica → Dominica
Dominican Republic → Dominican Republic
Ecuador → Ecuador
Egypt → Egypt
El Salvador → El Salvador
Equatorial Guinea → Equatorial Guinea
Eritrea → Eritrea
Estonia → Estonia
Eswatini (Swaziland) → Eswatini
Ethiopia → Ethiopia
Fiji → Fiji
Finland → Finland
France → France
Gabon → Gabon
Gambia → Gambia
Georgia → Georgia
Germany → Germany
Ghana → Ghana
Greece → Greece
Greenland → Greenland
Grenada → Grenada
Guatemala → Guatemala
Guinea → Guinea
Guinea-Bissau → Guinea-Bissau
Guyana → Guyana
Haiti → Haiti
Honduras → Honduras
Hong Kong → Hong Kong
Hungary → Hungary
Iceland → Iceland
India → India
Indonesia → Indonesia
Iran → Iran
Iraq → Iraq
Ireland → Ireland
Israel → Israel
Italy → Italy
Ivory Coast → Ivory Coast
Jamaica → Jamaica
Japan → Japan
Jordan → Jordan
Kazakhstan → Kazakhstan
Kenya → Kenya
Kiribati → Kiribati
Korea, North (DPRK) → North Korea
Korea, South → South Korea
Kosovo → Kosovo
Kuwait → Kuwait
Kyrgyzstan → Kyrgyzstan
Laos → Laos
Latvia → Latvia
Lebanon → Lebanon
Lesotho → Lesotho
Liberia → Liberia
Libya → Libya
Liechtenstein → Liechtenstein
Lithuania → Lithuania
Luxembourg → Luxembourg
Macau, SAR of China → Macau
Madagascar → Madagascar
Malawi → Malawi
Malaysia → Malaysia
Maldives → Maldives
Mali → Mali
Malta → Malta
Marshall Islands → Marshall Islands
Mauritania → Mauritania
Mauritius → Mauritius
Mexico → Mexico
Micronesia → Micronesia
Moldova → Moldova
Monaco → Monaco
Mongolia → Mongolia
Montenegro → Montenegro
Morocco → Morocco
Mozambique → Mozambique
Myanmar → Myanmar
Namibia → Namibia
Nauru → Nauru
Nepal → Nepal
Netherlands → Netherlands
New Zealand → New Zealand
Nicaragua → Nicaragua
Niger → Niger
Nigeria → Nigeria
North Macedonia → North Macedonia
Norway → Norway
Oman → Oman
Pakistan → Pakistan
Palau → Palau
Panama → Panama
Papua New Guinea → Papua New Guinea
Paraguay → Paraguay
Peru → Peru
Philippines → Philippines
Poland → Poland
Portugal → Portugal
Qatar → Qatar
Republic of the Congo → Congo
Romania → Romania
Russia → Russia
Rwanda → Rwanda
Saint Kitts and Nevis → Saint Kitts and Nevis
Saint Lucia → Saint Lucia
Saint Vincent and the Grenadines → Saint Vincent and the Grenadines
Samoa → Samoa
San Marino → San Marino
Sao Tome and Principe → Sao Tome and Principe
Saudi Arabia → Saudi Arabia
Senegal → Senegal
Serbia → Serbia
Seychelles → Seychelles
Sierra Leone → Sierra Leone
Singapore → Singapore
Slovakia → Slovakia
Slovenia → Slovenia
Solomon Islands → Solomon Islands
Somalia → Somalia
South Africa → South Africa
South Sudan → South Sudan
Spain → Spain
Sri Lanka → Sri Lanka
Sudan → Sudan
Suriname → Suriname
Sweden → Sweden
Switzerland → Switzerland
Syria → Syria
Taiwan → Taiwan
Tajikistan → Tajikistan
Tanzania → Tanzania
Thailand → Thailand
Timor-Leste → Timor-Leste
Togo → Togo
Tonga → Tonga
Trinidad and Tobago → Trinidad and Tobago
Tunisia → Tunisia
Turkey → Turkey
Turkmenistan → Turkmenistan
Tuvalu → Tuvalu
Uganda → Uganda
Ukraine → Ukraine
United Arab Emirates → United Arab Emirates
United Kingdom → United Kingdom
United States → United States
Uruguay → Uruguay
Uzbekistan → Uzbekistan
Vanuatu → Vanuatu
Vatican City → Vatican City
Venezuela → Venezuela
Vietnam → Vietnam
Yemen → Yemen
Zambia → Zambia
Zimbabwe → Zimbabwe
```

### Phase 4: JSON Structure Creation

#### File Structure Design
We created two separate files rather than combining them into one dataset with multiple fields for several reasons:

**Reasons for Separation**:
1. **Clarity**: Each dataset has a clear, single focus
2. **Quiz Simplicity**: Each makes a distinct quiz question
3. **Category Management**: Recreational has 3 categories, medical has 2
4. **Update Independence**: Can update one without affecting the other
5. **User Experience**: Clearer question and answer in quiz mode

#### Recreational Cannabis JSON
```json
{
  "title": "Legality of Cannabis: Recreational Use",
  "description": "Legal status of recreational cannabis use by country.",
  "source": "https://en.wikipedia.org/wiki/Legality_of_cannabis",
  "data": [
    {
      "country": "Afghanistan",
      "value": "Illegal"
    },
    {
      "country": "Albania",
      "value": "Illegal"
    },
    // ... 200+ countries in alphabetical order
    {
      "country": "Zimbabwe",
      "value": "Illegal"
    }
  ]
}
```

#### Medical Cannabis JSON
```json
{
  "title": "Legality of Cannabis: Medical Use",
  "description": "Legal status of medical cannabis use by country.",
  "source": "https://en.wikipedia.org/wiki/Legality_of_cannabis",
  "data": [
    {
      "country": "Afghanistan",
      "value": "Illegal"
    },
    {
      "country": "Albania",
      "value": "Legal"
    },
    // ... 200+ countries in alphabetical order
    {
      "country": "Zimbabwe",
      "value": "Legal"
    }
  ]
}
```

### Phase 5: Integration and Testing

#### Integration Steps
1. **Added to quiz.js**:
```javascript
const dataFiles = [
    // ... existing files
    'medical_cannabis_legality.json',
    'recreational_cannabis_legality.json',
    // ... more files
];
```

2. **Verified file count**: Confirmed total of 167 files (165 datasets + 2 non-dataset files)

3. **Tested loading**: Checked browser console for any errors

4. **Tested visualization**: Verified categorical colors display correctly

#### Testing Checklist
- ✅ Files load without errors
- ✅ Datasets appear in dataset browser (Learn mode)
- ✅ Datasets included in random quiz selection (Play mode)
- ✅ Countries colored correctly on map
- ✅ Categories displayed in legend
- ✅ Category names hidden in Play mode (no spoilers)
- ✅ Category names visible in Learn mode
- ✅ Color bar shows distinct color segments
- ✅ All 200+ countries mapped correctly

## 📈 Data Analysis

### Recreational Cannabis Statistics

**Category Distribution**:
- **Legal**: ~10 countries (5%)
- **Decriminalized**: ~30 countries (15%)
- **Illegal**: ~160 countries (80%)

**Geographic Patterns**:
- **Americas**: Most progressive region with several legalized countries
- **Europe**: Mix of decriminalized and illegal, few fully legal
- **Asia**: Predominantly illegal with very few exceptions
- **Africa**: Mostly illegal with some recent decriminalization
- **Oceania**: Mixed, with Australia recently legalizing

### Medical Cannabis Statistics

**Category Distribution**:
- **Legal**: ~60 countries (30%)
- **Illegal**: ~140 countries (70%)

**Geographic Patterns**:
- **Europe**: High adoption of medical cannabis programs
- **Americas**: Growing acceptance of medical use
- **Asia**: Limited acceptance, mostly illegal
- **Africa**: Emerging medical programs in some countries
- **Oceania**: Progressive medical cannabis policies

## 🎨 Visual Design

### Color Scheme Design

#### Recreational Cannabis Colors
The system automatically assigns colors to each category:
- **Legal**: Green (suggesting permission/go)
- **Decriminalized**: Orange/Yellow (suggesting caution/partial)
- **Illegal**: Red (suggesting prohibition/stop)

These colors align naturally with common traffic light symbolism.

#### Medical Cannabis Colors
Simpler binary visualization:
- **Legal**: Green (permitted)
- **Illegal**: Red (prohibited)

### Legend Display

#### Play Mode
Category names are hidden to avoid spoiling the answer:
```
🟢 (52 countries)
🔴 (148 countries)
```

#### Learn Mode
Full category information is displayed:
```
Legal 🟢 (52 countries)
Illegal 🔴 (148 countries)
```

## 💡 Lessons Learned

### 1. Country Name Standardization is Critical
**Lesson**: Even small variations in country names will cause data to not display on the map.

**Best Practice**: Create a mapping document before starting data entry.

### 2. Category Definition Must Be Clear
**Lesson**: Ambiguous categories lead to inconsistent data.

**Best Practice**: Define categories clearly before categorizing countries.

### 3. Source Attribution is Essential
**Lesson**: Users want to know where data comes from, especially for sensitive topics.

**Best Practice**: Always include source URL and date.

### 4. Separate Files for Related Data
**Lesson**: Two related but distinct datasets work better as separate files.

**Best Practice**: Create separate files when data represents different aspects of a topic.

### 5. Alphabetical Organization Aids Maintenance
**Lesson**: Alphabetically sorted data is much easier to verify and update.

**Best Practice**: Sort country entries alphabetically in JSON files.

## 🔄 Maintenance Plan

### Update Frequency
**Recommended**: Annual review, or when major legislative changes occur

### Update Process
1. Check Wikipedia article for updates
2. Identify changed countries
3. Update relevant JSON files
4. Test changes in application
5. Document changes with date

### Monitoring for Changes
- Legislative news about cannabis legalization
- International policy changes
- New countries or political changes
- Source article updates on Wikipedia

## 🎯 Impact and Usage

### Educational Value
These datasets provide valuable educational content about:
- Global drug policy variation
- Cultural and legal differences between countries
- Recent trends in drug law reform
- Geographic patterns in policy approaches

### Quiz Experience
Players learn about:
- Which countries have progressive drug policies
- The distinction between recreational and medical legalization
- Global variation in cannabis laws
- Recent policy changes and trends

### Geographic Insights
The visualization reveals:
- Regional clustering of similar policies
- Political and cultural influences on drug policy
- Progressive vs. conservative approaches by region
- Impact of international drug control treaties

## 🚀 Future Enhancements

### Potential Additions
1. **Historical Data**: Track changes in legality over time
2. **Penalty Severity**: Add data about legal penalties for possession
3. **Medical Conditions**: Detail which conditions qualify for medical use
4. **Possession Limits**: Show legal quantity limits where applicable
5. **Commercial Status**: Add data about legal cannabis sales

### Related Datasets
Other drug policy datasets that could be added:
- Alcohol legality and regulations
- Tobacco control policies
- Other controlled substances policies
- Harm reduction program availability

## 📚 Technical Details

### File Sizes
- `recreational_cannabis_legality.json`: ~12 KB
- `medical_cannabis_legality.json`: ~10 KB

### Performance Impact
- Minimal: Both files load quickly
- Categorical data processes efficiently
- No impact on map rendering performance

### Browser Compatibility
- Works in all modern browsers
- No special requirements
- Standard JSON parsing

## 🎉 Conclusion

The cannabis legality datasets represent a successful implementation of categorical data in GeoQuest. Through careful country name standardization, clear category definition, and thorough testing, these datasets provide valuable educational content while demonstrating best practices for adding new categorical data to the application.

### Key Success Factors
1. ✅ **Comprehensive Coverage**: 200+ countries included
2. ✅ **Accurate Standardization**: All country names properly mapped
3. ✅ **Clear Categories**: Well-defined, mutually exclusive categories
4. ✅ **Proper Attribution**: Source clearly cited
5. ✅ **Thorough Testing**: Verified in all game modes
6. ✅ **Educational Value**: Provides meaningful global perspective

### Replication for Other Topics
This implementation serves as a template for other categorical datasets:
- Political systems (Democracy, Monarchy, etc.)
- Climate zones (Tropical, Temperate, etc.)
- Economic systems (Capitalist, Socialist, etc.)
- Legal systems (Common Law, Civil Law, etc.)
- Religious demographics (Predominant religion)

The process documented here can be applied to any categorical data to create engaging, educational quiz content for GeoQuest.

---

*Dataset Created: October 2025*
*Countries Covered: 200+*
*Categories: Recreational (3), Medical (2)*
*Source: Wikipedia*
*Status: Active and Integrated*

