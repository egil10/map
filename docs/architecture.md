# GeoQuest Architecture Overview

## 🏗️ System Architecture

GeoQuest is built as a client-side web application with a modular architecture designed for extensibility and maintainability.

## 📦 Core Components

### 1. Application Controller (`app.js`)
- **Purpose**: Main application orchestrator
- **Responsibilities**:
  - Initialize all components
  - Coordinate between map and quiz systems
  - Handle application lifecycle
  - Manage loading states

### 2. World Map System (`map.js`)
- **Purpose**: Interactive world map with Leaflet.js
- **Key Features**:
  - Dynamic country coloring based on quiz data
  - Hover popups with country information
  - Infinite map scrolling
  - Microstate and island support
  - Legend generation with gradient/categorical support

### 3. Quiz Engine (`quiz.js`)
- **Purpose**: Quiz game logic and data management
- **Key Features**:
  - Random quiz selection
  - Answer validation with multiple variations
  - Scoring system (10 points correct, 5 points with hints)
  - Hint system with tag-based clues
  - Progress tracking

### 4. Data Converter (`data_converter.js`)
- **Purpose**: Convert raw JSON data into quiz format
- **Features**:
  - Automatic color generation
  - Data validation
  - Multiple data source support
  - Error handling

### 5. Country Mapping (`country_mapping.js`)
- **Purpose**: Map country names between data sources and GeoJSON
- **Features**:
  - Comprehensive country name mapping
  - Caching for performance
  - Partial matching for fuzzy country names
  - Support for microstates and territories

## 🔄 Data Flow

```
Raw Data Files → Data Converter → Quiz Engine → Map System → User Interface
     ↓              ↓              ↓            ↓           ↓
  JSON Files → Quiz Format → Game Logic → Visual Display → User Interaction
```

## 🗺️ Map System Architecture

### Layer Management
- **Countries Layer**: Single GeoJSON layer with infinite repetition
- **Style System**: Dynamic styling based on quiz data
- **Popup System**: Hover-based information display
- **Legend System**: Automatic legend generation

### Country Name Resolution
1. **Data Source Names** → **Country Mapper** → **GeoJSON Names**
2. **Fallback System**: Multiple mapping strategies
3. **Caching**: Performance optimization for repeated lookups

## 🎮 Quiz System Architecture

### Data Processing Pipeline
1. **Load Raw Data**: Fetch JSON files from data directory
2. **Convert Format**: Transform into quiz-compatible format
3. **Generate Colors**: Create color schemes for visualization
4. **Validate Data**: Ensure data integrity
5. **Cache Results**: Store processed data for performance

### Answer Validation
- **Multiple Variations**: Support for different answer formats
- **Fuzzy Matching**: Handle typos and variations
- **Tag System**: Hint generation based on data tags
- **Scoring Logic**: Point calculation and streak tracking

## 🎨 UI Architecture

### Design System
- **Nintendo-Inspired**: Bright colors and playful animations
- **Responsive Design**: Mobile-first approach
- **Component-Based**: Modular UI components
- **Accessibility**: Keyboard navigation and screen reader support

### Styling Architecture
- **CSS Variables**: Consistent color scheme
- **Gradient System**: Dynamic gradients for data visualization
- **Animation System**: Smooth transitions and feedback
- **Icon System**: Lucide icons throughout

## 📊 Data Architecture

### File Structure
```
data/
├── quiz_data.json          # Base quiz configurations
├── [category]_[metric].json # Raw data files (134 datasets)
└── [converted_data].json   # Processed quiz data
```

### Data Format
```json
{
  "title": "Quiz Title",
  "description": "What the map shows",
  "category": "economics|demographics|geography|etc",
  "tags": ["keyword1", "keyword2"],
  "answer_variations": ["answer1", "answer2"],
  "colorScheme": {
    "type": "gradient|categorical",
    "minColor": "#ffffff",
    "maxColor": "#000000"
  },
  "countries": {
    "Country Name": {
      "value": 123,
      "color": "#ff0000",
      "unit": "USD"
    }
  }
}
```

## 🔧 Performance Optimizations

### Loading Strategy
- **Lazy Loading**: Load data as needed
- **Caching**: Store processed data in memory
- **Throttling**: Limit expensive operations
- **Request Optimization**: Minimize API calls

### Rendering Optimizations
- **Single Layer**: One GeoJSON layer for all countries
- **Style Caching**: Cache computed styles
- **Event Throttling**: Limit hover event frequency
- **Memory Management**: Clean up unused resources

## 🛡️ Error Handling

### Data Validation
- **Schema Validation**: Ensure data format compliance
- **Country Mapping**: Handle missing country names
- **Value Validation**: Check for valid numeric data
- **Fallback Systems**: Graceful degradation

### User Experience
- **Loading States**: Clear feedback during operations
- **Error Messages**: User-friendly error descriptions
- **Recovery**: Automatic retry mechanisms
- **Fallbacks**: Alternative data sources

## 🔄 State Management

### Application State
- **Current Quiz**: Active quiz data and configuration
- **User Progress**: Score, streak, and statistics
- **Map State**: Selected countries and viewport
- **UI State**: Modal states and interactions

### Data Flow
- **Unidirectional**: Data flows down, events flow up
- **Immutable Updates**: State changes create new objects
- **Event System**: Custom events for component communication
- **Lifecycle Management**: Proper cleanup and initialization

## 🚀 Extensibility

### Adding New Quizzes
1. **Data Format**: Follow established JSON schema
2. **Country Mapping**: Ensure country names are mapped
3. **Color Scheme**: Define appropriate color ranges
4. **Validation**: Test with sample data

### Adding New Features
- **Modular Design**: New features as separate modules
- **Event System**: Use custom events for communication
- **Configuration**: External configuration for customization
- **Documentation**: Update docs for new features

## 🔍 Monitoring and Debugging

### Console Logging
- **Structured Logging**: Consistent log format
- **Debug Levels**: Different verbosity levels
- **Performance Metrics**: Timing and memory usage
- **Error Tracking**: Comprehensive error logging

### Development Tools
- **Browser DevTools**: Standard debugging tools
- **Performance Profiling**: Identify bottlenecks
- **Memory Monitoring**: Track memory usage
- **Network Analysis**: Monitor data loading

## 📈 Scalability Considerations

### Data Scalability
- **Lazy Loading**: Load data on demand
- **Pagination**: Handle large datasets
- **Caching**: Reduce repeated processing
- **Compression**: Minimize data transfer

### Performance Scalability
- **Code Splitting**: Load only needed code
- **Service Workers**: Offline capabilities
- **CDN**: Distribute static assets
- **Optimization**: Minimize bundle size

## 🔐 Security Considerations

### Data Security
- **Input Validation**: Sanitize all user inputs
- **XSS Prevention**: Escape HTML content
- **CSRF Protection**: Validate requests
- **Content Security**: Secure external resources

### Privacy
- **No Data Collection**: No user data stored
- **Local Storage**: Minimal local data
- **Third-Party**: Secure external dependencies
- **HTTPS**: Secure connections only

---

This architecture provides a solid foundation for the GeoQuest application while maintaining flexibility for future enhancements and improvements.
