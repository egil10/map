# Interactive Map

A modern, responsive interactive map application built with HTML, CSS, and JavaScript using Leaflet.js. Perfect for GitHub Pages deployment.

## 🌟 Features

- **Interactive Map**: Powered by Leaflet.js with OpenStreetMap tiles
- **Marker Management**: Add, remove, and manage custom markers
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations
- **Keyboard Shortcuts**: Quick access to common functions
- **Sample Data**: Pre-loaded with example markers for demonstration
- **GitHub Pages Ready**: Optimized for static hosting

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open `index.html`** in your web browser
3. **Start exploring!** The map will load with sample markers

## 📋 Usage

### Adding Markers
- Click the **"Add Marker"** button (or press `A`)
- Click anywhere on the map to place a marker
- Press `ESC` to cancel marker placement

### Managing Markers
- **View markers** in the sidebar on the right
- **Click a marker** on the map to remove it
- **Click a marker in the sidebar** to focus on it
- **Clear all markers** with the "Clear All" button (or press `C`)

### Keyboard Shortcuts
- `A` - Toggle add marker mode
- `C` - Clear all markers
- `ESC` - Cancel adding marker

## 🏗️ Project Structure

```
map/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # Main stylesheet
├── js/
│   ├── map.js         # Map functionality (InteractiveMap class)
│   └── app.js         # Application controller (MapApp class)
└── README.md          # This file
```

## 🎨 Customization

### Changing the Default Location
Edit the `init()` method in `js/map.js`:
```javascript
this.map = L.map('map').setView([YOUR_LAT, YOUR_LNG], ZOOM_LEVEL);
```

### Adding Custom Markers
Modify the `addSampleMarkers()` method in `js/map.js`:
```javascript
const sampleLocations = [
    { lat: YOUR_LAT, lng: YOUR_LNG, name: "Your Location", description: "Your description" }
];
```

### Styling
- Main styles are in `css/style.css`
- Uses CSS Grid and Flexbox for responsive layout
- Custom gradient backgrounds and modern design

## 🌐 Deployment

### GitHub Pages
1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Select source branch (usually `main` or `master`)
4. Your map will be available at `https://username.github.io/repository-name`

### Other Static Hosting
- Upload all files to any static hosting service
- No build process required - just HTML, CSS, and JavaScript

## 🔧 Technical Details

### Dependencies
- **Leaflet.js 1.9.4**: Open-source mapping library
- **OpenStreetMap**: Free map tiles
- **No build tools required**: Pure HTML/CSS/JS

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance
- Lightweight (~200KB total)
- Fast loading with CDN resources
- Optimized for mobile devices

## 🚀 Future Enhancements

This MVP is designed to be easily expandable. Potential additions:

- **Custom marker icons**
- **Marker categories and filtering**
- **Route planning**
- **Geolocation support**
- **Data import/export**
- **Custom map styles**
- **Search functionality**
- **Real-time data integration**

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

---

**Built with ❤️ using Leaflet.js and modern web technologies**