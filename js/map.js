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
            maxZoom: 19,
            noWrap: true, // Prevent infinite repetition
            bounds: [[-90, -180], [90, 180]] // Limit to world bounds
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
            
            // Show popup on hover if quiz data exists
            if (this.currentQuiz && this.currentQuiz.countries[layer.feature.properties.name]) {
                const countryData = this.currentQuiz.countries[layer.feature.properties.name];
                const popupContent = this.createPopupContent(layer.feature.properties.name, countryData);
                layer.bindPopup(popupContent, {
                    className: 'country-popup',
                    maxWidth: 200,
                    closeButton: false,
                    autoClose: false
                }).openPopup();
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
            
            // Close popup on mouse out
            if (e.target.isPopupOpen()) {
                e.target.closePopup();
            }
        };
        
        // Click function (simplified - no popup)
        const onEachFeature = (feature, layer) => {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: (e) => this.selectCountry(e.target, feature)
            });
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
        // Debug logging
        console.log('formatValue called with:', { value, unit, type: typeof value });
        
        // Handle null, undefined, or NaN values
        if (value === null || value === undefined || isNaN(value)) {
            console.warn('Invalid value detected:', value);
            return 'N/A';
        }
        
        // Convert to number if it's a string
        if (typeof value === 'string') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                console.warn('Cannot parse string value to number:', value);
                return value; // Return original string if it can't be parsed
            }
            value = numValue;
        }
        
        if (typeof value === 'number') {
            if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
            } else {
                return value.toFixed(1);
            }
        }
        
        // Fallback for other types
        return String(value);
    }
    
    roundValueForLegend(value, unit) {
        if (value === null || value === undefined || isNaN(value)) {
            return 0;
        }
        
        let numValue = value;
        if (typeof value === 'string') {
            numValue = parseFloat(value);
            if (isNaN(numValue)) {
                return 0;
            }
        }
        
        // Round based on the magnitude and unit type
        if (unit === '%' || unit === 'HDI score') {
            // For percentages and scores, round to nearest whole number
            return Math.round(numValue);
        } else if (unit === 'years' || unit === 'cm' || unit === 'laureates' || unit === 'personnel' || unit === 'billionaires' || unit === 'islands' || unit === 'phones/100' || unit === 'neighbours') {
            // For counts and measurements, round to nearest whole number
            return Math.round(numValue);
        } else if (unit === '°C') {
            // For temperatures, round to nearest whole number
            return Math.round(numValue);
        } else if (unit === 'm²/person') {
            // For area per person, round to nearest whole number
            return Math.round(numValue);
        } else if (unit === 'people/km²') {
            // For density, round to nearest whole number
            return Math.round(numValue);
        } else if (unit === 'million USD' || unit === 'USD' || unit === 'USD rate') {
            // For currency values, round to significant figures
            if (numValue >= 1000000) {
                return Math.round(numValue / 100000) * 100000; // Round to nearest 100K
            } else if (numValue >= 10000) {
                return Math.round(numValue / 1000) * 1000; // Round to nearest 1K
            } else if (numValue >= 100) {
                return Math.round(numValue / 10) * 10; // Round to nearest 10
            } else {
                return Math.round(numValue);
            }
        } else if (unit === 'km²') {
            // For land area, round to significant figures
            if (numValue >= 1000000) {
                return Math.round(numValue / 100000) * 100000; // Round to nearest 100K km²
            } else if (numValue >= 10000) {
                return Math.round(numValue / 1000) * 1000; // Round to nearest 1K km²
            } else {
                return Math.round(numValue);
            }
        } else {
            // Default rounding based on magnitude
            if (numValue >= 1000000) {
                return Math.round(numValue / 100000) * 100000;
            } else if (numValue >= 10000) {
                return Math.round(numValue / 1000) * 1000;
            } else if (numValue >= 100) {
                return Math.round(numValue / 10) * 10;
            } else {
                return Math.round(numValue);
            }
        }
    }
    
    createLegend(quiz) {
        // Remove existing legend
        if (this.legend) {
            this.map.removeControl(this.legend);
        }
        
        // Calculate min and max values
        const values = Object.values(quiz.countries).map(country => country.value);
        
        // Filter out invalid values
        const validValues = values.filter(value => 
            value !== null && 
            value !== undefined && 
            !isNaN(value) && 
            typeof value === 'number'
        );
        
        if (validValues.length === 0) {
            console.error('No valid numeric values found for legend');
            return;
        }
        
        const minValue = Math.min(...validValues);
        const maxValue = Math.max(...validValues);
        const unit = Object.values(quiz.countries)[0]?.unit || '';
        
        console.log('Legend values:', { minValue, maxValue, unit, totalValues: values.length, validValues: validValues.length });
        
        // Round the bounds to prevent spoilers
        const roundedMinValue = this.roundValueForLegend(minValue, unit);
        const roundedMaxValue = this.roundValueForLegend(maxValue, unit);
        
        // Create legend HTML
        const legendHtml = `
            <div class="legend">
                <div class="legend-gradient">
                    <div class="gradient-bar"></div>
                    <div class="gradient-labels">
                        <span class="min-label">${this.formatValue(roundedMinValue, unit)}</span>
                        <span class="max-label">${this.formatValue(roundedMaxValue, unit)}</span>
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
        
        // Filter out invalid values
        const validValues = values.filter(val => 
            val !== null && 
            val !== undefined && 
            !isNaN(val) && 
            typeof val === 'number'
        );
        
        if (validValues.length === 0) {
            console.error('No valid numeric values found for color calculation');
            return quiz.colorScheme?.defaultColor || '#ffffff';
        }
        
        const minValue = Math.min(...validValues);
        const maxValue = Math.max(...validValues);
        
        // Handle case where min and max are the same
        if (minValue === maxValue) {
            return quiz.colorScheme?.minColor || '#ffffff';
        }
        
        const ratio = (value - minValue) / (maxValue - minValue);
        const minColor = quiz.colorScheme?.minColor || '#ffffff';
        const maxColor = quiz.colorScheme?.maxColor || '#ffffff';
        
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
