# GeoQuest - Interactive World Map Quiz Game

## Overview

GeoQuest is an educational web application that combines interactive world maps with quiz functionality. Users can explore global data through visual map representations and test their knowledge through multiple game modes.

## Features

### Core Functionality
- **Interactive World Map**: Dynamic country visualization with Leaflet.js
- **Multiple Game Modes**: Play, Multiple Choice, and Learn modes
- **Dynamic Data Loading**: 134+ datasets covering economics, demographics, geography, and more
- **Real-time Visualization**: Countries colored based on data values
- **Progress Tracking**: Visual progress indicators and scoring system
- **Keyboard Shortcuts**: Quick navigation and control options

### Keyboard Shortcuts
- **Enter**: Submit guess
- **H**: Show hint
- **S**: Skip quiz
- **R**: Restart game (reset score)
- **N**: Start new quiz immediately
- **ESC**: Clear country selection

### Game Modes

#### Play Mode
- Text input for country name guessing
- Hint system with tag-based clues
- Manual progression with Enter key
- Score tracking and streak counting

#### Multiple Choice Mode
- Four option selection interface
- Automatic progression after 2-second delay
- Visual feedback with button color changes
- Wider button layout for better usability

#### Learn Mode
- Browse datasets without scoring
- Navigate through different data visualizations
- Educational exploration of global statistics

### Data Visualization
- **Dynamic Color Schemes**: Automatic color generation based on data values
- **Interactive Legends**: Top/bottom 10 countries with clickable navigation
- **Value-based Color Bar**: Real-time quartile calculations with formatted values
- **Country Hover Effects**: Detailed information popups

## Technical Architecture

### Frontend Stack
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript ES6+**: Modular class-based architecture
- **Leaflet.js**: Interactive map rendering and manipulation

### Data Management
- **JSON Data Format**: Structured country data with value mappings
- **Country Name Resolution**: Comprehensive mapping system for data sources
- **Dynamic Loading**: Asynchronous data fetching and processing
- **Validation System**: Data integrity checks and error handling

### Performance Optimizations
- **Lazy Loading**: On-demand data fetching
- **Caching**: Memory-based data storage
- **Event Throttling**: Optimized user interaction handling
- **Efficient Rendering**: Single-layer map architecture

## Installation and Setup

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Local web server for development

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/geoquest.git
   cd geoquest
   ```

2. Start a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

3. Open your browser and navigate to `http://localhost:8000`

### Development Setup
- Use VS Code with Live Server extension for optimal development experience
- Enable browser DevTools for debugging and performance monitoring
- Follow the development guidelines in the documentation

## Project Structure

```
geoquest/
├── index.html              # Main application entry point
├── css/
│   └── style.css          # Application styling and themes
├── js/
│   ├── app.js             # Main application controller
│   ├── map.js             # World map functionality
│   ├── quiz.js            # Quiz game logic
│   ├── data_converter.js  # Data processing utilities
│   └── country_mapping.js # Country name resolution
├── data/                   # Quiz datasets (134 JSON files)
├── assets/                 # Static assets and icons
├── docs/                   # Comprehensive documentation
└── README.md              # Project overview
```

## Data Sources

The application includes datasets covering:

### Economics
- GDP and GNI data
- Income and wealth metrics
- Trade and financial indicators
- Economic development indicators

### Demographics
- Population statistics
- Age and gender demographics
- Literacy and education data
- Social development metrics

### Geography
- Land area and elevation data
- Climate and temperature records
- Geographic features and boundaries
- Natural resource information

### Technology
- Internet connectivity metrics
- Digital adoption indicators
- Mobile and broadband statistics
- Technology infrastructure data

## Browser Compatibility

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Mobile Support
- Responsive design for mobile devices
- Touch-optimized interactions
- Progressive Web App capabilities

## Performance Specifications

### Loading Performance
- Initial load time: < 3 seconds
- Data processing: < 1 second
- Map rendering: < 500ms
- Quiz transitions: < 200ms

### Memory Usage
- Base application: ~15MB
- With all datasets: ~25MB
- Peak usage during gameplay: ~35MB

## Development Guidelines

### Code Standards
- ES6+ JavaScript with modern features
- CSS Grid and Flexbox for layouts
- Semantic HTML5 markup
- Accessibility-first design principles

### Testing Requirements
- Cross-browser compatibility testing
- Mobile device testing
- Performance benchmarking
- Accessibility validation

## Contributing

### Development Process
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit pull request with documentation

### Code Review Process
- Automated testing validation
- Manual code review
- Performance impact assessment
- Documentation updates

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **API Reference**: Complete class and method documentation
- **Architecture Guide**: System design and component relationships
- **Development Guide**: Setup, testing, and contribution guidelines
- **Data Format Guide**: Dataset creation and management
- **User Manual**: End-user documentation and tutorials

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For technical support, feature requests, or bug reports:
- Create an issue in the GitHub repository
- Review the troubleshooting guide in the documentation
- Check the FAQ section in the user manual

## Roadmap

### Upcoming Features
- Advanced analytics and progress tracking
- Social features and multiplayer modes
- Custom dataset creation tools
- Enhanced accessibility features

### Long-term Vision
- Machine learning integration for personalized learning
- Advanced data visualization options
- Community-driven content creation
- Educational institution partnerships

## Acknowledgments

- Leaflet.js community for mapping capabilities
- Data providers including World Bank, UN, and OWID
- Open source contributors and testers
- Educational technology community

---

For detailed technical information, implementation guides, and advanced usage, refer to the comprehensive documentation in the `docs/` directory.