# GeoQuest Documentation

Welcome to the GeoQuest documentation! This folder contains comprehensive documentation for the GeoQuest world map quiz game.

## 📚 Documentation Structure

### Core Documentation
- **[API Reference](api-reference.md)** - Complete API documentation for all classes and methods
- **[Data Format Guide](data-format.md)** - How to create and format quiz data files
- **[Development Guide](development.md)** - Setup, development workflow, and contribution guidelines
- **[Architecture Overview](architecture.md)** - Technical architecture and system design

### User Guides
- **[User Manual](user-manual.md)** - How to use the GeoQuest application
- **[Quiz Creation Guide](quiz-creation.md)** - How to create new quiz datasets
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions

### Technical Documentation
- **[Browser Support](browser-support.md)** - Supported browsers and features
- **[Performance Guide](performance.md)** - Performance optimization tips
- **[Security Considerations](security.md)** - Security best practices

## 🚀 Quick Start

1. **For Users**: See [User Manual](user-manual.md)
2. **For Developers**: See [Development Guide](development.md)
3. **For Data Contributors**: See [Quiz Creation Guide](quiz-creation.md)

## 📖 Key Features

- **Interactive World Maps**: Countries colored by different data types
- **Smart Answer System**: Accepts various ways to describe the same concept
- **Automatic Data Loading**: Converts raw JSON files into quiz format
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Extensible Architecture**: Easy to add new quiz categories and data

## 🔧 Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js
- **Icons**: Lucide Icons
- **Data**: JSON format with automatic conversion
- **Styling**: Custom CSS with Nintendo-inspired design

## 📁 Project Structure

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
├── data/                  # Quiz data files (134 datasets)
├── assets/                # Static assets (favicon, etc.)
├── docs/                  # Documentation (this folder)
└── README.md              # Project overview
```

## 🤝 Contributing

We welcome contributions! Please see our [Development Guide](development.md) for details on how to contribute to the project.

## 📄 License

This project is open source and available under the [MIT License](../LICENSE).

---

**Need help?** Check the [Troubleshooting Guide](troubleshooting.md) or open an issue on GitHub.
