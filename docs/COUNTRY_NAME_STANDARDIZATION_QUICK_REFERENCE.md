# Country Name Standardization Quick Reference

## 🎯 Overview

This is a quick reference guide for the most common country name standardization issues encountered when adding datasets to GeoQuest. Use this as a cheat sheet during data integration.

## ⚡ Quick Lookup Table

### Most Common Standardizations

| Source Name | GeoQuest Name | Notes |
|------------|---------------|-------|
| USA / US | United States | Always use full name |
| UK | United Kingdom | Never abbreviate |
| Korea, South / Korea, Rep. | South Korea | Check context |
| Korea, North / Korea, Dem. Rep. / DPRK | North Korea | Check context |
| Czechia | Czech Republic | Always use full name |
| Congo | Republic of the Congo | Check context - could be "Congo" if DRC specified |
| Congo, Rep. / Congo, Republic of | Republic of the Congo | Map to "Congo" |
| Congo, Dem. Rep. / DRC | Democratic Republic of the Congo | Full name |
| Côte d'Ivoire / Cote d'Ivoire | Côte d'Ivoire | Keep accent or standardize? Check mapping |
| Ivory Coast | Ivory Coast | Alternative name - check which is used in GeoJSON |
| Macedonia | North Macedonia | Modern name |
| FYROM | North Macedonia | Former Yugoslav Republic |
| East Timor / Timor-Leste | Timor-Leste | Standard name |
| Eswatini / Swaziland | Eswatini | Modern name |
| Burma | Myanmar | Current name |
| Micronesia (country) | Micronesia | Remove parenthetical |
| People's Republic of China / PRC | China | Simplified name |
| Hong Kong SAR / Hong Kong Special Administrative Region | Hong Kong | Simplified |
| Macao / Macau | Macau | Check which rendering is used |

### Special Territory Handling

| Source Name | GeoQuest Name | Include? | Notes |
|------------|---------------|----------|-------|
| Hong Kong | Hong Kong | ✅ Yes | Special Administrative Region |
| Macau / Macao | Macau | ✅ Yes | Special Administrative Region |
| Taiwan | Taiwan | ✅ Yes | Often included |
| Greenland | Greenland | ✅ Yes | Danish territory |
| Puerto Rico | Puerto Rico | ⚠️ Sometimes | May not render on map |
| Guam | Guam | ❌ Usually No | Too small for map |
| American Samoa | American Samoa | ❌ Usually No | Too small for map |

### Historical Country Names (Exclude or Map)

| Historical Name | Action | Modern Equivalent |
|----------------|--------|-------------------|
| USSR / Soviet Union | ❌ Exclude or Map | Russia (with caveats) |
| Yugoslavia | ❌ Exclude or Map | Split into modern countries |
| Czechoslovakia | ❌ Exclude or Map | Czech Republic + Slovakia |
| East Germany / West Germany | ❌ Exclude | Germany (unified) |
| Zaire | ❌ Exclude or Map | Democratic Republic of the Congo |

### Aggregate Regions (Always Exclude)

**World Regions:**
- ❌ World
- ❌ Earth
- ❌ Africa
- ❌ Asia
- ❌ Europe
- ❌ North America
- ❌ South America
- ❌ Americas
- ❌ Oceania
- ❌ Middle East

**Income Groups:**
- ❌ High-income countries
- ❌ Upper-middle-income countries
- ❌ Lower-middle-income countries
- ❌ Low-income countries

**World Bank Groupings (Look for "(WB)" suffix):**
- ❌ East Asia and Pacific (WB)
- ❌ Europe and Central Asia (WB)
- ❌ Latin America and Caribbean (WB)
- ❌ Middle East, North Africa, Afghanistan and Pakistan (WB)
- ❌ South Asia (WB)
- ❌ Sub-Saharan Africa (WB)

**Other Aggregates:**
- ❌ OECD
- ❌ European Union (27) / EU
- ❌ Arab World
- ❌ G7 / G20

## 🔍 Source-Specific Patterns

### Our World in Data (OWID)

Common issues:
- "Czechia" → "Czech Republic"
- "Congo" → Check context (usually "Congo" for Republic of the Congo)
- "Micronesia (country)" → "Micronesia"
- "Cote d'Ivoire" → "Côte d'Ivoire" (check which GeoJSON uses)

### World Bank

Common issues:
- "Korea, Rep." → "South Korea"
- "Korea, Dem. Rep." → "North Korea"
- "Congo, Rep." → "Congo"
- "Congo, Dem. Rep." → "Democratic Republic of the Congo"
- "Iran, Islamic Rep." → "Iran"
- "Venezuela, RB" → "Venezuela"
- "Egypt, Arab Rep." → "Egypt"

### Wikipedia

Common issues:
- "Korea, South" → "South Korea"
- "Korea, North (DPRK)" → "North Korea"
- "People's Republic of China (PRC)" → "China"
- "Republic of the Congo" → "Congo"
- "Eswatini (Swaziland)" → "Eswatini"

## 🛠️ Standardization Workflow

### Step 1: Identify Problem Names

When extracting data, immediately flag:
- ❓ Abbreviations (USA, UK, UAE)
- ❓ Parenthetical notes (Micronesia (country))
- ❓ Historical names (USSR, Yugoslavia)
- ❓ Regional aggregates (World, Africa, OECD)
- ❓ Variations (Korea, South vs South Korea)

### Step 2: Apply Standardization Rules

Use this priority order:

1. **Check Quick Reference Table** (above) - fastest lookup
2. **Check Country Mapping File** - `data/country_mapping.json` if it exists
3. **Check Existing Datasets** - see how other files handle the same country
4. **Test in Browser** - load dataset and check console for mapping warnings

### Step 3: Verify Standardization

After standardization, verify:
- ✅ No "No mapping found" warnings in console
- ✅ All countries appear on map (at least those with data)
- ✅ Country names match existing dataset patterns

## 📋 Pre-Standardization Checklist

Before creating your JSON file, verify:

- [ ] No abbreviations (USA → United States)
- [ ] No parentheticals removed (Micronesia (country) → Micronesia)
- [ ] No historical names (USSR, Yugoslavia excluded)
- [ ] No aggregate regions (World, Africa, OECD excluded)
- [ ] Korea standardized correctly (South/North)
- [ ] Congo standardized correctly (Congo vs DRC)
- [ ] Czechia → Czech Republic
- [ ] Macedonia → North Macedonia
- [ ] Territories handled appropriately (Hong Kong, Macau, Taiwan)

## 🔧 Common Standardization Patterns

### Pattern 1: Korea Variations

```javascript
// All map to:
"Korea, South" → "South Korea"
"Korea, North" → "North Korea"
"Korea, Rep." → "South Korea"
"Korea, Dem. Rep." → "North Korea"
"Republic of Korea" → "South Korea"
"Democratic People's Republic of Korea" → "North Korea"
"DPRK" → "North Korea"
```

### Pattern 2: Congo Variations

```javascript
// Important: Check context!
"Congo" → Usually "Congo" (Republic of the Congo)
         → But could be DRC - check source!
"Congo, Rep." → "Congo"
"Congo, Republic of" → "Congo"
"Republic of the Congo" → "Congo"
"Congo, Dem. Rep." → "Democratic Republic of the Congo"
"Democratic Republic of Congo" → "Democratic Republic of the Congo"
"DRC" → "Democratic Republic of the Congo"
"Zaire" → "Democratic Republic of the Congo" (historical)
```

### Pattern 3: China and Territories

```javascript
"People's Republic of China (PRC)" → "China"
"PRC" → "China"
"China" → "China" (usually correct)

"Hong Kong SAR" → "Hong Kong"
"Hong Kong Special Administrative Region" → "Hong Kong"
"Hong Kong" → "Hong Kong" (usually correct)

"Macao, SAR of China" → "Macau"
"Macau, SAR of China" → "Macau"
"Macao" → "Macau" (check which GeoJSON uses)
"Macau" → "Macau"
```

### Pattern 4: Other Common Variations

```javascript
"Czechia" → "Czech Republic"
"Côte d'Ivoire" → "Côte d'Ivoire" (keep accent or check mapping)
"Cote d'Ivoire" → "Côte d'Ivoire"
"Ivory Coast" → "Ivory Coast" (check which is standard)

"Macedonia" → "North Macedonia"
"FYROM" → "North Macedonia"

"East Timor" → "Timor-Leste"
"Timor-Leste" → "Timor-Leste"

"Eswatini (Swaziland)" → "Eswatini"
"Swaziland" → "Eswatini"

"Burma" → "Myanmar"
"Myanmar" → "Myanmar"
```

## 🚨 Red Flags to Watch For

### Immediate Exclusion Items

If you see these, **exclude them immediately**:

**World Aggregates:**
- "World", "Earth", "Globe"
- Any continent name alone: "Africa", "Asia", "Europe"
- Regional groupings: "Americas", "Oceania"

**Economic Groups:**
- Income brackets (High-income, Low-income countries)
- Organizations (OECD, G7, G20, EU)
- World Bank groupings (anything with "(WB)")

**Historical Entities:**
- "USSR", "Soviet Union"
- "Yugoslavia"
- "Czechoslovakia"
- "East Germany", "West Germany"

### Verification Items

If you see these, **verify carefully**:

**Ambiguous Names:**
- "Congo" (which one?)
- "Korea" (which one?)
- "Macedonia" (FYROM or current?)

**Variations:**
- "Côte d'Ivoire" vs "Ivory Coast"
- "Macao" vs "Macau"
- "Eswatini" vs "Swaziland"

## 💡 Pro Tips

1. **Search Existing Datasets**: Before guessing, search existing JSON files to see how other datasets handle the same country name
2. **Check Console First**: Load a small test dataset and check browser console - mapping warnings appear immediately
3. **Use Find & Replace Carefully**: When standardizing many entries, use find & replace but verify each one
4. **Test Small Subset**: Before processing all countries, test with 5-10 countries to verify standardization works
5. **Keep a Log**: Document any unusual standardizations you had to figure out

## 🎯 Quick Decision Tree

```
Is it a country name? → Yes
    ↓
Is it an aggregate region? → Yes → ❌ EXCLUDE
    ↓ No
Is it an abbreviation? → Yes → ✅ STANDARDIZE
    ↓ No
Is it a variation? → Yes → ✅ CHECK REFERENCE TABLE
    ↓ No
Does it match GeoJSON? → Yes → ✅ USE AS-IS
    ↓ No
✅ CHECK COUNTRY MAPPING OR CONSOLE
```

## 📚 Related Documentation

- `COUNTRY_MAPPING_GUIDE.md` - Detailed mapping system
- `DATASET_INTEGRATION_WORKFLOW.md` - Full integration process
- `OWID_DATA_INTEGRATION_GUIDE.md` - OWID-specific patterns

## 🎉 Conclusion

This quick reference should cover 90% of country name standardization issues. For unusual cases, check the browser console for mapping warnings and refer to existing datasets for patterns.

---

*Last Updated: Based on recent dataset integrations*
*Quick Reference Version: 1.0*

