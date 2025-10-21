# GeoQuest Data Management Guide

## Overview

This guide provides comprehensive information about managing data in the GeoQuest application, including data sources, processing, validation, and maintenance procedures.

## Data Architecture

### Data Flow
```
Raw Data Sources → Data Processing → Validation → Storage → Visualization
     ↓                ↓              ↓           ↓           ↓
External APIs → JSON Conversion → Schema Check → Memory → Map Display
```

### Data Categories

#### Primary Data Sources
- **World Bank**: Economic and development indicators
- **Our World in Data (OWID)**: Global statistics and trends
- **United Nations**: Population and social indicators
- **CIA World Factbook**: Country information and statistics

#### Data Types
- **Quantitative**: Numeric values with units
- **Categorical**: Discrete categories and classifications
- **Temporal**: Time-series data with trends
- **Spatial**: Geographic and location-based data

## Data Format Standards

### JSON Schema Definition
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["title", "data"],
  "properties": {
    "title": {
      "type": "string",
      "minLength": 3,
      "maxLength": 100
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "unit": {
      "type": "string",
      "enum": ["km²", "people", "%", "°C", "USD", "tons", "years"]
    },
    "source": {
      "type": "string",
      "format": "uri"
    },
    "data": {
      "type": "object",
      "patternProperties": {
        "^[A-Za-z\\s]+$": {
          "type": "object",
          "required": ["value"],
          "properties": {
            "value": {
              "type": "number"
            },
            "unit": {
              "type": "string"
            }
          }
        }
      }
    }
  }
}
```

### Data Validation Rules

#### Title Validation
- **Length**: 3-100 characters
- **Characters**: Letters, numbers, spaces, hyphens only
- **Uniqueness**: Must be unique across all datasets
- **Format**: Title case with proper capitalization

#### Description Validation
- **Length**: 0-500 characters
- **Content**: Plain text only, no HTML
- **Language**: English only
- **Clarity**: Must clearly describe the data

#### Unit Validation
- **Standard Units**: Use standard measurement units
- **Consistency**: Same unit across all data points
- **Format**: Proper unit notation (km², %, °C)
- **Compatibility**: Must be compatible with visualization

#### Source Validation
- **URL Format**: Valid HTTP/HTTPS URL
- **Accessibility**: URL must be publicly accessible
- **Attribution**: Proper source attribution required
- **Reliability**: Source must be authoritative

#### Data Validation
- **Country Names**: Must match mapping system
- **Numeric Values**: Valid numbers only
- **Range Checks**: Values within reasonable ranges
- **Completeness**: Minimum data coverage required

## Data Processing Pipeline

### 1. Data Ingestion
```javascript
async loadDataset(filename) {
  try {
    const response = await fetch(`/data/${filename}`);
    const data = await response.json();
    return this.validateData(data);
  } catch (error) {
    console.error(`Failed to load ${filename}:`, error);
    return null;
  }
}
```

### 2. Data Validation
```javascript
validateData(data) {
  // Schema validation
  if (!this.validateSchema(data)) {
    throw new Error('Invalid data schema');
  }
  
  // Business logic validation
  if (!this.validateBusinessRules(data)) {
    throw new Error('Invalid business rules');
  }
  
  // Data quality checks
  if (!this.validateDataQuality(data)) {
    throw new Error('Poor data quality');
  }
  
  return data;
}
```

### 3. Data Transformation
```javascript
transformToQuizFormat(rawData) {
  return {
    id: this.generateId(rawData.title),
    title: rawData.title,
    description: rawData.description,
    category: this.categorizeData(rawData),
    tags: this.extractTags(rawData),
    answer_variations: this.generateAnswers(rawData),
    colorScheme: this.generateColorScheme(rawData),
    countries: this.processCountryData(rawData.data)
  };
}
```

### 4. Data Storage
```javascript
storeDataset(processedData) {
  // Memory storage
  this.datasetCache.set(processedData.id, processedData);
  
  // Index for quick lookup
  this.datasetIndex.add(processedData);
  
  // Category grouping
  this.categoryGroups[processedData.category].push(processedData);
}
```

## Country Name Mapping

### Mapping System Architecture
```
Data Source Names → Country Mapper → GeoJSON Names → Map Display
     ↓                    ↓              ↓            ↓
"United States" → "USA" → "United States" → Map Feature
```

### Mapping Rules
- **Standardization**: Use official country names
- **Aliases**: Support common country name variations
- **Historical Names**: Handle historical country names
- **Territories**: Include territories and dependencies

### Country Name Resolution
```javascript
class CountryMapper {
  constructor() {
    this.mappings = new Map();
    this.aliases = new Map();
    this.loadMappings();
  }
  
  mapCountryName(sourceName) {
    // Direct mapping
    if (this.mappings.has(sourceName)) {
      return this.mappings.get(sourceName);
    }
    
    // Alias resolution
    if (this.aliases.has(sourceName)) {
      return this.aliases.get(sourceName);
    }
    
    // Fuzzy matching
    return this.fuzzyMatch(sourceName);
  }
}
```

## Data Quality Management

### Quality Metrics
- **Completeness**: Percentage of countries with data
- **Accuracy**: Data validation and verification
- **Consistency**: Uniform data format and structure
- **Timeliness**: Data freshness and updates

### Quality Checks
```javascript
validateDataQuality(data) {
  const checks = [
    this.checkCompleteness(data),
    this.checkAccuracy(data),
    this.checkConsistency(data),
    this.checkTimeliness(data)
  ];
  
  return checks.every(check => check.passed);
}
```

### Data Cleaning
```javascript
cleanData(rawData) {
  return {
    // Remove invalid entries
    data: rawData.data.filter(entry => this.isValidEntry(entry)),
    
    // Standardize country names
    countries: this.standardizeCountryNames(rawData.data),
    
    // Validate numeric values
    values: this.validateNumericValues(rawData.data),
    
    // Remove outliers
    filtered: this.removeOutliers(rawData.data)
  };
}
```

## Performance Optimization

### Data Loading Strategies
- **Lazy Loading**: Load data on demand
- **Caching**: Store processed data in memory
- **Compression**: Use data compression techniques
- **Pagination**: Load data in chunks

### Memory Management
```javascript
class DataManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.cacheTimeout = 300000; // 5 minutes
  }
  
  getData(key) {
    const cached = this.cache.get(key);
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }
    
    return this.loadAndCache(key);
  }
}
```

### Data Compression
- **Gzip Compression**: Server-side compression
- **JSON Minification**: Remove unnecessary whitespace
- **Data Deduplication**: Remove duplicate entries
- **Efficient Encoding**: Use efficient data formats

## Data Maintenance

### Regular Maintenance Tasks
- **Data Updates**: Keep data current and accurate
- **Quality Checks**: Regular data quality validation
- **Performance Monitoring**: Monitor data processing performance
- **Error Tracking**: Track and resolve data errors

### Update Procedures
```javascript
async updateDataset(datasetId, newData) {
  // Backup existing data
  const backup = await this.backupDataset(datasetId);
  
  try {
    // Validate new data
    const validated = await this.validateData(newData);
    
    // Update dataset
    await this.updateDatasetData(datasetId, validated);
    
    // Update indexes
    await this.updateIndexes(datasetId, validated);
    
    // Clear cache
    this.clearCache(datasetId);
    
    return { success: true };
  } catch (error) {
    // Restore backup
    await this.restoreDataset(datasetId, backup);
    throw error;
  }
}
```

### Data Versioning
```javascript
class DataVersioning {
  constructor() {
    this.versions = new Map();
    this.currentVersion = 1;
  }
  
  createVersion(datasetId, data) {
    const version = {
      id: this.generateVersionId(),
      datasetId: datasetId,
      data: data,
      timestamp: Date.now(),
      checksum: this.calculateChecksum(data)
    };
    
    this.versions.set(version.id, version);
    return version;
  }
}
```

## Error Handling

### Data Error Categories
- **Loading Errors**: Network and file system errors
- **Validation Errors**: Schema and business rule violations
- **Processing Errors**: Data transformation failures
- **Storage Errors**: Memory and cache errors

### Error Recovery
```javascript
class DataErrorHandler {
  handleError(error, context) {
    switch (error.type) {
      case 'LOADING_ERROR':
        return this.handleLoadingError(error, context);
      case 'VALIDATION_ERROR':
        return this.handleValidationError(error, context);
      case 'PROCESSING_ERROR':
        return this.handleProcessingError(error, context);
      default:
        return this.handleGenericError(error, context);
    }
  }
}
```

### Fallback Strategies
- **Default Data**: Use default data for missing information
- **Cached Data**: Use cached data when fresh data unavailable
- **Partial Data**: Use partial data when complete data unavailable
- **Error Messages**: Display appropriate error messages to users

## Data Security

### Data Protection
- **Input Validation**: Sanitize all data inputs
- **Output Encoding**: Properly encode data outputs
- **Access Control**: Restrict data access as needed
- **Audit Logging**: Log all data access and modifications

### Privacy Compliance
- **Data Minimization**: Collect only necessary data
- **Purpose Limitation**: Use data only for intended purposes
- **Retention Limits**: Delete data when no longer needed
- **User Rights**: Respect user data rights

## Monitoring and Analytics

### Data Metrics
- **Load Times**: Monitor data loading performance
- **Error Rates**: Track data processing errors
- **Usage Patterns**: Analyze data usage patterns
- **Quality Scores**: Monitor data quality metrics

### Alerting System
```javascript
class DataMonitoring {
  constructor() {
    this.metrics = new Map();
    this.alerts = new Map();
    this.thresholds = this.loadThresholds();
  }
  
  checkMetrics() {
    for (const [metric, value] of this.metrics) {
      if (value > this.thresholds[metric]) {
        this.triggerAlert(metric, value);
      }
    }
  }
}
```

## Best Practices

### Data Management
1. **Consistent Format**: Maintain consistent data format
2. **Quality Assurance**: Implement data quality checks
3. **Documentation**: Document data sources and processing
4. **Version Control**: Track data changes and updates

### Performance
1. **Optimization**: Optimize data size and structure
2. **Caching**: Implement appropriate caching strategies
3. **Lazy Loading**: Load data on demand
4. **Error Handling**: Implement robust error handling

### User Experience
1. **Data Presentation**: Ensure clear data presentation
2. **Accessibility**: Consider accessibility requirements
3. **Performance**: Optimize for user experience
4. **Documentation**: Provide clear data documentation

---

This data management guide provides comprehensive information for managing data in the GeoQuest application, ensuring data quality, performance, and user experience.
