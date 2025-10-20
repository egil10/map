# 🌍 GeoQuest - World Map Quiz Game

A vibrant, interactive geography quiz game where players guess what data is represented on colored world maps. Built with HTML, CSS, JavaScript, and Leaflet.js, featuring a Nintendo-inspired design with Lucide icons.

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/map.git
   cd map
   ```

2. **Open in browser**:
   - Simply open `index.html` in any modern web browser
   - Or serve with a local server for best experience

3. **Start playing**:
   - The game will automatically load and convert all data files
   - Click on countries to see their data values
   - Type your guesses and earn points!

## 🎮 Game Features

### Core Gameplay
- **Interactive World Maps**: Countries colored by different data types (GDP, population, coffee consumption, etc.)
- **Free-Text Guessing**: Type your answer instead of multiple choice
- **Smart Answer System**: Accepts various ways to describe the same concept
- **Endless Content**: Expandable JSON data files for unlimited quizzes
- **Automatic Data Loading**: Converts raw JSON files into quiz format automatically

### Visual Design
- **Vibrant Nintendo-Inspired UI**: Bright colors, gradients, and playful animations
- **Lucide Icons**: Modern, consistent iconography throughout the interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: Score pulses, button hover effects, and feedback animations

### Game Mechanics
- **Scoring System**: 10 points for correct answers, 5 points with hints
- **Streak Tracking**: Build consecutive correct answers for bragging rights
- **Hint System**: Get clues using tags (costs 5 points)
- **Quiz Counter**: Track total quizzes played
- **Category Emojis**: Visual indicators for different quiz types

## 🎯 Current Quiz Categories

### 📊 **Economics**
- **💰 GDP per Capita 2023** - Economic wealth per person
- **💰 GNI Per Capita 2024** - Gross National Income per person
- **🏭 GDP by Country 2025** - Total economic output by country

### 👥 **Demographics**
- **👥 Population Density** - People per square kilometer
- **👥 World Population 2025** - Total population by country
- **👥 Population Density (Detailed)** - Comprehensive density data
- **👶 Fertility Rate 2025** - Children per woman by country

### 🗺️ **Geography**
- **🗺️ Land Area** - Total land area by country
- **💧 Water Percentage** - Percentage of water coverage

### 🌾 **Agriculture**
- **🌾 Arable Land per Person** - Agricultural land area per person

### ☕ **Lifestyle**
- **☕ Coffee Consumption** - Annual coffee intake per person

### 😊 **Social**
- **😊 Happiness Index** - Life satisfaction scores
- **📊 Human Development Index 2023** - Quality of life and development scores

### 💻 **Technology**
- **💻 Internet Speed** - Average download speeds

## 🎨 Design Features

### Color Scheme
- **Gradient Backgrounds**: Purple to pink gradient theme
- **Vibrant Headers**: Red-orange gradient with shimmer effects
- **Blue Sidebar**: Ocean-themed quiz controls
- **Colorful Feedback**: Green for correct, red for incorrect, yellow for hints

### Interactive Elements
- **Hover Effects**: Buttons lift and glow on hover
- **Pulse Animations**: Score updates with satisfying visual feedback
- **Shimmer Effects**: Header background with moving light
- **Floating Animations**: Subtle movement for game elements

## 🎮 How to Play

1. **Start the Game**: The map will show countries colored by some data
2. **Make Your Guess**: Type what you think the map represents in the input field
3. **Submit Answer**: Press Enter or click the Submit button
4. **Get Feedback**: See if you're correct and earn points
5. **Use Hints**: Click the Hint button if you're stuck (costs 5 points)
6. **Skip if Needed**: Move to the next quiz if you're completely stuck
7. **Build Streaks**: Consecutive correct answers increase your score

## ⌨️ Keyboard Shortcuts

- **Enter** - Submit guess
- **H** - Show hint
- **S** - Skip quiz
- **R** - Restart game (reset score)
- **N** - Start new quiz immediately
- **ESC** - Clear country selection

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[User Manual](docs/user-manual.md)** - Complete user guide
- **[Development Guide](docs/development.md)** - Setup and development workflow
- **[API Reference](docs/api-reference.md)** - Complete API documentation
- **[Architecture Overview](docs/architecture.md)** - Technical architecture
- **[Data Format Guide](docs/data-format.md)** - How to create quiz data
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

## 🏗️ Technical Architecture

### Frontend Technologies
- **HTML5**: Semantic structure and accessibility
- **CSS3**: Advanced styling with gradients, animations, and responsive design
- **JavaScript (ES6+)**: Modern JavaScript with classes and async/await
- **Leaflet.js**: Interactive mapping library
- **Lucide Icons**: Beautiful, consistent iconography

### Data Structure
The game uses a flexible JSON structure for quiz data and automatically converts raw data files:

```json
{
  "quizzes": {
    "quiz_id": {
      "title": "Quiz Title",
      "description": "What the map shows",
      "category": "economics",
      "tags": ["keyword1", "keyword2"],
      "answer_variations": ["answer1", "answer2"],
      "countries": {
        "Country Name": {
          "value": 123,
          "color": "#ff0000",
          "unit": "USD"
        }
      }
    }
  }
}
```

### Project Structure
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
├── docs/                   # Comprehensive documentation
└── README.md              # Project overview
```

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/map.git
   cd map
   ```

2. **Open in browser**:
   - Simply open `index.html` in any modern web browser
   - Or serve with a local server for best experience

3. **Start playing**:
   - The game will automatically load and convert all data files
   - Click on countries to see their data values
   - Type your guesses and earn points!

## 🎯 Adding New Quizzes

### Method 1: Add to quiz_data.json
Simply edit `data/quiz_data.json` to add new quiz configurations.

### Method 2: Add Raw Data Files (Recommended)
1. **Add a new JSON file** to the `data/` folder with this structure:
   ```json
   {
     "title": "Your Data Title",
     "data": [
       {"country": "Country Name", "value_field": 123}
     ]
   }
   ```

2. **The game automatically converts** raw data files into quiz format
3. **No manual configuration needed** - just add the file and restart the game

Example raw data file:
```json
{
  "title": "Beer Consumption per Capita",
  "data": [
    {"country": "Germany", "beer_consumption": 104},
    {"country": "Czech Republic", "beer_consumption": 143}
  ]
}
```

## 🌟 Future Enhancements

- **More Quiz Categories**: Environment, health, education, sports
- **Difficulty Levels**: Easy, medium, hard based on data complexity
- **Leaderboards**: Save and compare scores
- **Multiplayer Mode**: Real-time competition
- **Custom Maps**: User-generated quiz data
- **Achievement System**: Badges for milestones
- **Sound Effects**: Audio feedback for interactions
- **Dark Mode**: Alternative color scheme
- **Data Import**: Upload custom CSV/JSON files
- **Quiz Editor**: Visual interface for creating quizzes

## 🎨 Design Inspiration

The game's vibrant design is inspired by:
- **Nintendo Games**: Bright colors and playful UI elements
- **Modern Web Design**: Clean layouts with gradient backgrounds
- **Gaming Interfaces**: Intuitive controls and visual feedback
- **Educational Apps**: Clear information hierarchy and accessibility

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add new quiz data or improve the design
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**🎮 Ready to test your geography knowledge? Start playing GeoQuest now!** 🌍✨