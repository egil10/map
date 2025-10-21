# GeoQuest Development Guide

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Text editor or IDE (VS Code recommended)
- Basic knowledge of HTML, CSS, and JavaScript
- Git for version control

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/map.git
   cd map
   ```

2. **Open in browser**:
   - Simply open `index.html` in your browser
   - Or use a local server for best experience:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using VS Code Live Server extension
     ```

3. **Start developing**:
   - Edit files in your preferred editor
   - Refresh browser to see changes
   - Use browser DevTools for debugging

## 🏗️ Project Structure

```
map/
├── index.html              # Main application entry point
├── css/
│   └── style.css          # Application styling
├── js/
│   ├── app.js             # Main application controller
│   ├── map.js             # World map functionality
│   ├── quiz.js            # Quiz game logic
│   ├── data_converter.js  # Data conversion utilities
│   └── country_mapping.js # Country name mapping system
├── data/                   # Quiz data files (134 datasets)
├── assets/                 # Static assets (favicon, etc.)
├── docs/                   # Documentation
└── README.md              # Project overview
```

## 🔧 Development Workflow

### 1. Code Organization
- **Modular Design**: Each major feature in its own file
- **Separation of Concerns**: UI, logic, and data handling separated
- **Consistent Naming**: camelCase for variables, PascalCase for classes
- **Commenting**: JSDoc comments for all public methods

### 2. File Structure Guidelines
- **HTML**: Semantic structure with accessibility in mind
- **CSS**: Component-based styling with CSS variables
- **JavaScript**: ES6+ features with proper error handling
- **Data**: JSON format with consistent schema

### 3. Development Best Practices
- **Error Handling**: Try-catch blocks for async operations
- **Performance**: Throttle expensive operations
- **Accessibility**: Keyboard navigation and screen reader support
- **Responsive Design**: Mobile-first approach

## 🎨 Styling Guidelines

### CSS Architecture
```css
/* Use CSS variables for consistency */
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --accent-color: #e74c3c;
}

/* Component-based styling */
.component-name {
  /* Base styles */
}

.component-name--modifier {
  /* Modifier styles */
}

.component-name__element {
  /* Element styles */
}
```

### Design System
- **Colors**: Nintendo-inspired bright palette
- **Typography**: System fonts for performance
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth transitions and feedback

## 📊 Data Development

### Adding New Quiz Data

1. **Create JSON file** in `data/` directory:
   ```json
   {
     "title": "Your Quiz Title",
     "data": [
       {"country": "Country Name", "value_field": 123}
     ]
   }
   ```

2. **Follow naming convention**:
   - Use descriptive filenames
   - Use underscores for spaces
   - Include category in filename

3. **Data format requirements**:
   - Valid JSON syntax
   - Consistent field names
   - Numeric values (not strings)
   - Proper country names

### Data Validation
- **Schema Validation**: Ensure data follows expected format
- **Country Mapping**: Verify country names are mapped correctly
- **Value Validation**: Check for valid numeric data
- **Unit Consistency**: Ensure consistent units

## 🧪 Testing

### Manual Testing
1. **Functionality Testing**:
   - Test all quiz categories
   - Verify answer validation
   - Check hint system
   - Test scoring system

2. **Browser Testing**:
   - Test in multiple browsers
   - Check responsive design
   - Verify accessibility features
   - Test performance

3. **Data Testing**:
   - Load all data files
   - Verify country mapping
   - Check color generation
   - Test legend creation

### Debug Tools
- **Browser DevTools**: Console, Network, Performance tabs
- **Console Logging**: Structured logging throughout the app
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Timing and memory usage

### Keyboard Shortcuts
- **Enter**: Submit guess (Play Mode)
- **H**: Show hint
- **S**: Skip quiz
- **N**: Start new quiz immediately
- **ESC**: Clear country selection

## 🚀 Performance Optimization

### Loading Optimization
- **Lazy Loading**: Load data as needed
- **Caching**: Store processed data in memory
- **Throttling**: Limit expensive operations
- **Request Optimization**: Minimize API calls

### Rendering Optimization
- **Single Layer**: One GeoJSON layer for all countries
- **Style Caching**: Cache computed styles
- **Event Throttling**: Limit hover event frequency
- **Memory Management**: Clean up unused resources

### Code Optimization
- **Minification**: Minify CSS and JavaScript
- **Compression**: Compress data files
- **CDN**: Use CDN for external resources
- **Service Workers**: Offline capabilities

## 🔍 Debugging

### Console Debugging
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');

// Check specific components
console.log('Map instance:', window.mapInstance);
console.log('Quiz instance:', window.quizInstance);
console.log('Current quiz:', window.quizInstance?.currentQuiz);
```

### Common Issues
1. **Country Mapping**: Check if country names are mapped correctly
2. **Data Loading**: Verify JSON files are valid
3. **Color Generation**: Check if color schemes are applied
4. **Performance**: Monitor memory usage and render times

### Debug Tools
- **Browser DevTools**: Standard debugging tools
- **Performance Profiling**: Identify bottlenecks
- **Memory Monitoring**: Track memory usage
- **Network Analysis**: Monitor data loading

## 📦 Building and Deployment

### Build Process
1. **Code Review**: Check for errors and inconsistencies
2. **Testing**: Run comprehensive tests
3. **Optimization**: Minify and compress files
4. **Validation**: Validate HTML, CSS, and JavaScript

### Deployment
1. **Static Hosting**: Deploy to GitHub Pages, Netlify, or Vercel
2. **CDN**: Use CDN for better performance
3. **HTTPS**: Ensure secure connections
4. **Monitoring**: Set up error tracking and analytics

## 🤝 Contributing

### Contribution Guidelines
1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Code Style
- **JavaScript**: ES6+ features, consistent formatting
- **CSS**: Component-based styling, consistent naming
- **HTML**: Semantic markup, accessibility features
- **Comments**: Clear, helpful comments

### Pull Request Process
1. **Description**: Clear description of changes
2. **Testing**: Evidence of testing
3. **Documentation**: Update relevant documentation
4. **Review**: Address review feedback

## 🔧 Development Tools

### Recommended Tools
- **VS Code**: Code editor with extensions
- **Live Server**: Local development server
- **Git**: Version control
- **Browser DevTools**: Debugging and profiling

### Useful Extensions
- **Live Server**: Local development server
- **Prettier**: Code formatting
- **ESLint**: JavaScript linting
- **Auto Rename Tag**: HTML tag management

## 📚 Learning Resources

### Documentation
- [Leaflet.js Documentation](https://leafletjs.com/reference.html)
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [JavaScript ES6+ Features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

### Tutorials
- [Interactive Maps with Leaflet](https://leafletjs.com/examples.html)
- [Modern JavaScript Features](https://javascript.info/)
- [CSS Grid Layout](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Web Accessibility](https://webaim.org/)

## 🐛 Troubleshooting

### Common Issues
1. **Map not loading**: Check Leaflet.js CDN connection
2. **Data not displaying**: Verify JSON file format
3. **Country mapping errors**: Check country name mappings
4. **Performance issues**: Monitor memory usage and render times

### Getting Help
1. **Check documentation**: Review relevant docs
2. **Search issues**: Look for similar problems
3. **Ask questions**: Use GitHub issues or discussions
4. **Contribute**: Help improve the project

---

This development guide provides everything you need to contribute to the GeoQuest project. For specific implementation details, refer to the source code and inline comments.
