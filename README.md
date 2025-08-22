# Simple World Map

A clean, minimal world map application built with HTML, CSS, and JavaScript using Leaflet.js. Click on countries to highlight them with a simple, elegant design.

## 🌟 Features

- **Simple World Map**: Clean, minimal design with country borders
- **Country Selection**: Click on any country to highlight it in blue
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Clean UI**: Simple white/grey color scheme with subtle interactions
- **Keyboard Shortcuts**: Quick access to clear selection
- **GitHub Pages Ready**: Optimized for static hosting

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open `index.html`** in your web browser
3. **Click on any country** to select and highlight it

## 📋 Usage

### Selecting Countries
- **Click on any country** to highlight it in blue
- **Hover over countries** to see a subtle highlight effect
- **Only one country** can be selected at a time

### Managing Selection
- **View selected country** in the sidebar on the right
- **Clear selection** with the "Clear Selection" button (or press `C`)
- **Press ESC** to clear the current selection

### Keyboard Shortcuts
- `C` - Clear selection
- `ESC` - Clear selection

## 🏗️ Project Structure

```
map/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # Clean, minimal styling
├── js/
│   ├── map.js         # World map functionality (SimpleWorldMap class)
│   └── app.js         # Application controller (SimpleMapApp class)
└── README.md          # This file
```

## 🎨 Design Features

### Color Scheme
- **Background**: Light grey (#f5f5f5)
- **Countries**: White with grey borders (#cccccc)
- **Selected Country**: Blue (#3498db)
- **Hover Effect**: Light grey (#ecf0f1)

### Map Style
- **Tile Layer**: CartoDB Positron (clean, minimal)
- **Country Borders**: Simple grey lines
- **Selection Highlight**: Blue fill with darker border

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
- **CartoDB Positron**: Clean, minimal map tiles
- **GeoJSON**: World countries data from public source
- **No build tools required**: Pure HTML/CSS/JS

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance
- Lightweight (~150KB total)
- Fast loading with CDN resources
- Optimized for mobile devices

## 🚀 Future Enhancements

This simple map is designed to be easily expandable. Potential additions:

- **Country information display**
- **Multiple country selection**
- **Custom color themes**
- **Country search functionality**
- **Data visualization overlays**
- **Export selected countries**
- **Custom country data**

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

---

**Built with ❤️ using Leaflet.js and modern web technologies**