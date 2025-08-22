// World Map class for Quiz Game
class WorldMap {
    constructor() {
        this.map = null;
        this.countriesLayer = null;
        this.selectedCountry = null;
        this.countriesData = null;
        this.currentQuiz = null;
        this.legend = null;
        
        this.init();
    }
    
    init() {
        // Check if map is already initialized
        if (this.map) {
            console.log('Map already initialized, skipping...');
            return;
        }
        
        // Initialize the map centered on the world
        this.map = L.map('map').setView([20, 0], 2);
        
        // Add a simple, clean tile layer (CartoDB Positron - clean and minimal)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors, © CartoDB',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);
        
        // Load countries data
        this.loadCountriesData();
        
        // Make map instance globally available
        window.mapInstance = this;
    }
    
    async loadCountriesData() {
        try {
            // Using a simple countries GeoJSON from a public source
            const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
            this.countriesData = await response.json();
            
            // Create the countries layer
            this.createCountriesLayer();
        } catch (error) {
            console.error('Error loading countries data:', error);
            // Fallback: create a simple world outline
            this.createSimpleWorldOutline();
        }
    }
    
    createCountriesLayer() {
        // Style function for countries
        const style = (feature) => {
            return this.getCountryStyle(feature);
        };
        
        // Highlight function
        const highlightFeature = (e) => {
            const layer = e.target;
            layer.setStyle({
                fillColor: '#ecf0f1',
                weight: 2,
                color: '#bdc3c7',
                fillOpacity: 0.9
            });
            // Use DOM class instead of Leaflet class
            if (layer.getElement()) {
                layer.getElement().classList.add('country-hover');
            }
        };
        
        // Reset highlight function
        const resetHighlight = (e) => {
            if (this.selectedCountry !== e.target.feature.properties.name) {
                this.countriesLayer.resetStyle(e.target);
            }
            // Use DOM class instead of Leaflet class
            if (e.target.getElement()) {
                e.target.getElement().classList.remove('country-hover');
            }
        };
        
        // Click function
        const onEachFeature = (feature, layer) => {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: (e) => this.selectCountry(e.target, feature)
            });
            
            // Add popup with country data
            if (this.currentQuiz && this.currentQuiz.countries[feature.properties.name]) {
                const countryData = this.currentQuiz.countries[feature.properties.name];
                const popupContent = this.createPopupContent(feature.properties.name, countryData);
                layer.bindPopup(popupContent, {
                    className: 'country-popup',
                    maxWidth: 300
                });
            }
        };
        
        // Create the layer
        this.countriesLayer = L.geoJSON(this.countriesData, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(this.map);
    }
    
    getCountryStyle(feature) {
        const countryName = feature.properties.name;
        
        // Default style
        let style = {
            fillColor: '#ffffff',
            weight: 1,
            color: '#cccccc',
            fillOpacity: 0.8
        };
        
        // Apply quiz colors if available
        if (this.currentQuiz && this.currentQuiz.countries[countryName]) {
            const countryData = this.currentQuiz.countries[countryName];
            if (countryData.color) {
                style.fillColor = countryData.color;
                style.fillOpacity = 0.8;
            }
        }
        
        return style;
    }
    
    applyQuizConfiguration(quiz) {
        this.currentQuiz = quiz;
        
        // Apply colors to countries
        this.countriesLayer.setStyle((feature) => {
            return this.getCountryStyle(feature);
        });
        
        // Update popups for all countries
        this.countriesLayer.eachLayer((layer) => {
            const countryName = layer.feature.properties.name;
            if (this.currentQuiz.countries[countryName]) {
                const countryData = this.currentQuiz.countries[countryName];
                const popupContent = this.createPopupContent(countryName, countryData);
                layer.bindPopup(popupContent, {
                    className: 'country-popup',
                    maxWidth: 300
                });
            }
        });
        
        // Create legend
        this.createLegend(quiz);
    }
    
    createPopupContent(countryName, countryData) {
        const formattedValue = this.formatValue(countryData.value, countryData.unit);
        return `
            <div class="popup-content">
                <h3>${countryName}</h3>
                <div class="popup-value">
                    <span class="value-number">${formattedValue}</span>
                </div>
            </div>
        `;
    }
    
    formatValue(value, unit) {
        if (typeof value === 'number') {
            if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
            } else {
                return value.toFixed(1);
            }
        }
        return value;
    }
    
    createLegend(quiz) {
        // Remove existing legend
        if (this.legend) {
            this.map.removeControl(this.legend);
        }
        
        // Calculate min and max values
        const values = Object.values(quiz.countries).map(country => country.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const unit = Object.values(quiz.countries)[0]?.unit || '';
        
        // Create legend HTML
        const legendHtml = `
            <div class="legend">
                <div class="legend-gradient">
                    <div class="gradient-bar"></div>
                    <div class="gradient-labels">
                        <span class="min-label">${this.formatValue(minValue, unit)}</span>
                        <span class="max-label">${this.formatValue(maxValue, unit)}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Create legend control
        this.legend = L.control({ position: 'bottomleft' });
        
        this.legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'legend-control leaflet-control');
            div.innerHTML = legendHtml;
            return div;
        };
        
        this.legend.addTo(this.map);
        
        // Update gradient colors
        this.updateLegendGradient(quiz);
    }
    
    updateLegendGradient(quiz) {
        const gradientBar = document.querySelector('.gradient-bar');
        if (gradientBar && quiz.colorScheme) {
            const minColor = quiz.colorScheme.minColor;
            const maxColor = quiz.colorScheme.maxColor;
            gradientBar.style.background = `linear-gradient(to right, ${minColor}, ${maxColor})`;
        }
    }
    
    getColorForValue(value, quiz) {
        const values = Object.values(quiz.countries).map(country => country.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        const ratio = (value - minValue) / (maxValue - minValue);
        const minColor = quiz.colorScheme.minColor;
        const maxColor = quiz.colorScheme.maxColor;
        
        return this.interpolateColor(minColor, maxColor, ratio);
    }
    
    interpolateColor(color1, color2, factor) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    selectCountry(layer, feature) {
        // Clear previous selection
        if (this.selectedCountry) {
            this.countriesLayer.resetStyle();
        }
        
        // Highlight selected country
        layer.setStyle({
            fillColor: '#3498db',
            weight: 2,
            color: '#2980b9',
            fillOpacity: 0.8
        });
        
        this.selectedCountry = feature.properties.name;
        
        // Get country quiz data if available
        let countryQuizData = null;
        if (this.currentQuiz && this.currentQuiz.countries[this.selectedCountry]) {
            countryQuizData = this.currentQuiz.countries[this.selectedCountry];
        }
        
        // Update country info display
        this.updateCountryInfo(feature.properties.name, countryQuizData);
    }
    
    updateCountryInfo(countryName, countryData) {
        // This method can be used to update any country info display
        // For now, we'll just log it
        if (countryData) {
            console.log(`${countryName}: ${this.formatValue(countryData.value, countryData.unit)}`);
        }
    }
    
    createSimpleWorldOutline() {
        // Fallback: create a simple world outline if GeoJSON fails to load
        console.log('Creating simple world outline as fallback');
    }
}

// Initialize map when script loads
const worldMap = new WorldMap();
