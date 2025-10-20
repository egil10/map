# GeoQuest API Reference

## 📚 Complete API Documentation

This document provides comprehensive API documentation for all classes, methods, and properties in the GeoQuest application.

## 🏗️ Core Classes

### App Class (`app.js`)

Main application controller that orchestrates all components.

#### Constructor
```javascript
new App()
```
Initializes the application and starts the initialization process.

#### Methods

##### `async init()`
Initializes the application by setting up all components.
- **Returns**: `Promise<void>`
- **Description**: Main initialization method that coordinates component setup

##### `async waitForMap()`
Waits for the map instance to be ready.
- **Returns**: `Promise<void>`
- **Description**: Polls until map is initialized and countries layer is available

##### `async waitForQuiz()`
Waits for the quiz instance to be ready.
- **Returns**: `Promise<void>`
- **Description**: Polls until quiz system is initialized and ready

##### `showGame()`
Displays the main game interface.
- **Returns**: `void`
- **Description**: Hides loading screen and shows the game interface

#### Properties
- `mapInstance`: Reference to the WorldMap instance
- `quizInstance`: Reference to the QuizGame instance
- `isReady`: Boolean indicating if the app is fully initialized

---

### WorldMap Class (`map.js`)

Handles the interactive world map functionality using Leaflet.js.

#### Constructor
```javascript
new WorldMap()
```
Initializes the map with default settings.

#### Methods

##### `init()`
Initializes the Leaflet map and loads country data.
- **Returns**: `void`
- **Description**: Sets up the map container, tile layers, and country data

##### `async loadCountriesData()`
Loads GeoJSON country data from external sources.
- **Returns**: `Promise<void>`
- **Description**: Fetches country boundaries and creates the countries layer

##### `createCountriesLayer()`
Creates the interactive countries layer.
- **Returns**: `void`
- **Description**: Sets up country styling, hover effects, and click handlers

##### `applyQuizConfiguration(quiz)`
Applies quiz data to the map visualization.
- **Parameters**:
  - `quiz` (Object): Quiz configuration object
- **Returns**: `void`
- **Description**: Colors countries based on quiz data and creates legend

##### `getCountryStyle(feature)`
Returns the style for a country feature.
- **Parameters**:
  - `feature` (Object): GeoJSON feature object
- **Returns**: `Object`: Leaflet style object
- **Description**: Determines fill color and style based on quiz data

##### `createLegend(quiz)`
Creates a legend for the current quiz.
- **Parameters**:
  - `quiz` (Object): Quiz configuration object
- **Returns**: `void`
- **Description**: Generates gradient or categorical legend

##### `createPopupContent(countryName, countryData)`
Creates popup content for country hover.
- **Parameters**:
  - `countryName` (String): Name of the country
  - `countryData` (Object): Country data object
- **Returns**: `String`: HTML content for popup
- **Description**: Formats country information for display

##### `formatValue(value, unit)`
Formats numeric values for display.
- **Parameters**:
  - `value` (Number): The value to format
  - `unit` (String): The unit of measurement
- **Returns**: `String`: Formatted value string
- **Description**: Converts large numbers to K/M format

##### `selectCountry(layer, feature)`
Handles country selection.
- **Parameters**:
  - `layer` (Object): Leaflet layer object
  - `feature` (Object): GeoJSON feature object
- **Returns**: `void`
- **Description**: Highlights selected country and updates info display

#### Properties
- `map`: Leaflet map instance
- `countriesLayer`: GeoJSON layer containing countries
- `countriesData`: Raw GeoJSON data
- `currentQuiz`: Currently active quiz configuration
- `legend`: Legend control instance
- `selectedCountry`: Currently selected country name

---

### QuizGame Class (`quiz.js`)

Manages the quiz game logic and data processing.

#### Constructor
```javascript
new QuizGame()
```
Initializes the quiz system and loads quiz data.

#### Methods

##### `async loadQuizData()`
Loads and processes all quiz data files.
- **Returns**: `Promise<void>`
- **Description**: Fetches and converts all available quiz datasets

##### `startNewQuiz()`
Starts a new random quiz.
- **Returns**: `void`
- **Description**: Selects random quiz and applies it to the map

##### `checkAnswer(guess)`
Validates user's answer against quiz data.
- **Parameters**:
  - `guess` (String): User's guess
- **Returns**: `Object`: Result object with success status and feedback
- **Description**: Checks if guess matches any answer variations

##### `getHint()`
Provides a hint for the current quiz.
- **Returns**: `String`: Hint text
- **Description**: Returns a random tag from the quiz's tag list

##### `skipQuiz()`
Skips to the next quiz.
- **Returns**: `void`
- **Description**: Ends current quiz and starts a new one

##### `updateScore(points)`
Updates the user's score.
- **Parameters**:
  - `points` (Number): Points to add
- **Returns**: `void`
- **Description**: Updates score display and streak counter

##### `resetGame()`
Resets the game state.
- **Returns**: `void`
- **Description**: Clears score, streak, and starts fresh

#### Properties
- `currentQuiz`: Currently active quiz object
- `score`: Current user score
- `streak`: Current correct answer streak
- `totalQuizzes`: Total number of quizzes played
- `isReady`: Boolean indicating if quiz system is ready

---

### DataConverter Class (`data_converter.js`)

Converts raw JSON data files into quiz format.

#### Constructor
```javascript
new DataConverter()
```
Initializes the data converter.

#### Methods

##### `async loadExistingQuizData()`
Loads existing quiz data from quiz_data.json.
- **Returns**: `Promise<void>`
- **Description**: Fetches base quiz configurations

##### `async convertLandAreaData()`
Converts land area data to quiz format.
- **Returns**: `Promise<Object|null>`: Quiz object or null if failed
- **Description**: Processes land area JSON and creates quiz configuration

##### `async convertWaterPercentageData()`
Converts water percentage data to quiz format.
- **Returns**: `Promise<Object|null>`: Quiz object or null if failed
- **Description**: Processes water percentage JSON and creates quiz configuration

##### `async convertArableLandData()`
Converts arable land data to quiz format.
- **Returns**: `Promise<Object|null>`: Quiz object or null if failed
- **Description**: Processes arable land JSON and creates quiz configuration

##### `async convertPopulationDensityData()`
Converts population density data to quiz format.
- **Returns**: `Promise<Object|null>`: Quiz object or null if failed
- **Description**: Processes population density JSON and creates quiz configuration

##### `getColorForRatio(ratio, minColor, maxColor)`
Generates color based on value ratio.
- **Parameters**:
  - `ratio` (Number): Value ratio (0-1)
  - `minColor` (String): Minimum color hex
  - `maxColor` (String): Maximum color hex
- **Returns**: `String`: Interpolated color hex
- **Description**: Linear interpolation between two colors

##### `async convertAllData()`
Converts all available data files.
- **Returns**: `Promise<Object>`: Complete quiz data object
- **Description**: Processes all data files and returns merged quiz data

#### Properties
- `quizData`: Base quiz data object

---

### CountryMapper Class (`country_mapping.js`)

Maps country names between data sources and GeoJSON.

#### Constructor
```javascript
new CountryMapper()
```
Initializes the country mapper with predefined mappings.

#### Methods

##### `mapCountryName(dataCountryName)`
Maps a country name from data source to GeoJSON name.
- **Parameters**:
  - `dataCountryName` (String): Country name from data source
- **Returns**: `String`: Mapped country name for GeoJSON
- **Description**: Resolves country name variations and aliases

##### `getMappedCountryNames()`
Returns all mapped country names.
- **Returns**: `Array<String>`: Array of mapped country names
- **Description**: Gets all available mapped country names

##### `logMappings()`
Logs all country mappings to console.
- **Returns**: `void`
- **Description**: Debug method to display all mappings

#### Properties
- `countryMappings`: Object containing all country name mappings
- `_cache`: Map for caching mapping results

---

## 🔧 Utility Functions

### `resolveToGeoName(name, geoNames)`
Resolves country names to GeoJSON names.
- **Parameters**:
  - `name` (String): Country name to resolve
  - `geoNames` (Set): Set of available GeoJSON country names
- **Returns**: `String`: Resolved country name
- **Description**: Handles country name variations and aliases

### `throttle(fn, wait)`
Creates a throttled version of a function.
- **Parameters**:
  - `fn` (Function): Function to throttle
  - `wait` (Number): Throttle delay in milliseconds
- **Returns**: `Function`: Throttled function
- **Description**: Limits function execution frequency

---

## 📊 Data Structures

### Quiz Object
```javascript
{
  id: String,                    // Unique quiz identifier
  title: String,                 // Quiz title
  description: String,           // Quiz description
  category: String,              // Quiz category
  tags: Array<String>,          // Keywords for hints
  answer_variations: Array<String>, // Valid answer variations
  colorScheme: {                // Color configuration
    type: String,               // 'gradient' or 'categorical'
    minColor: String,          // Minimum color hex
    maxColor: String,          // Maximum color hex
    defaultColor: String       // Default color hex
  },
  countries: {                  // Country data
    [countryName]: {
      value: Number,           // Data value
      color: String,           // Display color hex
      unit: String            // Unit of measurement
    }
  }
}
```

### Country Data Object
```javascript
{
  value: Number,               // Numeric data value
  color: String,              // Hex color code
  unit: String                // Unit of measurement
}
```

### Answer Result Object
```javascript
{
  success: Boolean,            // Whether answer is correct
  feedback: String,           // User feedback message
  points: Number,             // Points awarded
  isHint: Boolean             // Whether hint was used
}
```

---

## 🎨 Styling API

### CSS Classes
- `.country-hover`: Applied to countries on hover
- `.legend-control`: Legend container styling
- `.popup-content`: Country popup content styling
- `.gradient-bar`: Legend gradient bar styling
- `.extreme-item`: Top/bottom country list items

### CSS Variables
- `--primary-color`: Main application color
- `--secondary-color`: Secondary application color
- `--accent-color`: Accent color for highlights
- `--background-gradient`: Background gradient definition

---

## 🔄 Event System

### Custom Events
- `mapReadyForQuiz`: Fired when map is ready for quiz data
- `quizStarted`: Fired when a new quiz begins
- `answerSubmitted`: Fired when user submits an answer
- `quizCompleted`: Fired when quiz is completed

### Event Listeners
```javascript
// Listen for map ready event
window.addEventListener('mapReadyForQuiz', (event) => {
  // Handle map ready
});

// Listen for quiz events
document.addEventListener('quizStarted', (event) => {
  // Handle quiz start
});
```

---

## 🛠️ Development API

### Debug Methods
- `console.log()`: Standard logging throughout the application
- `CountryMapper.logMappings()`: Log all country mappings
- `WorldMap.debugCountryNames()`: Debug country name resolution

### Performance Monitoring
- Timing measurements for data loading
- Memory usage tracking
- Render performance metrics

---

This API reference provides complete documentation for all public interfaces in the GeoQuest application. For implementation details, refer to the source code and inline comments.
