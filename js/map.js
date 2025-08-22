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
            layer.addClass('country-hover');
        };
        
        // Reset highlight function
        const resetHighlight = (e) => {
            if (this.selectedCountry !== e.target.feature.properties.name) {
                this.countriesLayer.resetStyle(e.target);
            }
            e.target.removeClass('country-hover');
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
        
        // Add zoom event listener for value overlays
        this.map.on('zoomend', () => {
            this.updateValueOverlays();
        });
    }
    
    updateValueOverlays() {
        if (!this.currentQuiz) return;
        
        // Remove existing overlays
        if (this.valueOverlays) {
            this.valueOverlays.forEach(overlay => {
                this.map.removeLayer(overlay);
            });
        }
        
        this.valueOverlays = [];
        
        // Only show overlays if zoomed in enough (zoom level > 3)
        if (this.map.getZoom() > 3) {
            this.addValueOverlays();
        }
    }
    
    addValueOverlays() {
        if (!this.currentQuiz) return;
        
        // Add value overlays for each country with data
        this.countriesLayer.eachLayer((layer) => {
            const countryName = layer.feature.properties.name;
            const countryData = this.currentQuiz.countries[countryName];
            
            if (countryData) {
                const bounds = layer.getBounds();
                const center = bounds.getCenter();
                const value = this.formatValue(countryData.value, countryData.unit);
                
                // Create custom div icon for value display (no background)
                const valueIcon = L.divIcon({
                    className: 'country-value-overlay',
                    html: `<div class="value-text">${value}</div>`,
                    iconSize: [60, 20],
                    iconAnchor: [30, 10]
                });
                
                const valueMarker = L.marker(center, {
                    icon: valueIcon,
                    interactive: false
                }).addTo(this.map);
                
                this.valueOverlays.push(valueMarker);
            }
        });
    }
    
    createPopupContent(countryName, countryData) {
        const value = countryData.value;
        const unit = countryData.unit || '';
        const formattedValue = this.formatValue(value, unit);
        
        return `
            <div class="popup-content">
                <h3>${countryName}</h3>
                <div class="popup-value">
                    <span class="value-number">${formattedValue}</span>
                    ${unit ? `<span class="value-unit">${unit}</span>` : ''}
                </div>
                <div class="popup-color-indicator" style="background-color: ${countryData.color}"></div>
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
                return value.toLocaleString();
            }
        }
        return value;
    }
    
    getCountryStyle(feature) {
        const countryName = feature.properties.name;
        
        // Default style
        let style = {
            fillColor: '#ffffff',
            weight: 1,
            opacity: 1,
            color: '#cccccc',
            fillOpacity: 0.7
        };
        
        // Apply quiz configuration if available
        if (this.currentQuiz && this.currentQuiz.countries[countryName]) {
            const countryConfig = this.currentQuiz.countries[countryName];
            style.fillColor = countryConfig.color;
            style.fillOpacity = 0.8;
            style.weight = 1.5;
        }
        
        return style;
    }
    
    applyQuizConfiguration(quiz) {
        this.currentQuiz = quiz;
        
        // Update map styles
        if (this.countriesLayer) {
            this.countriesLayer.setStyle((feature) => this.getCountryStyle(feature));
            
            // Update popups for all countries
            this.countriesLayer.eachLayer((layer) => {
                const countryName = layer.feature.properties.name;
                if (quiz.countries[countryName]) {
                    const popupContent = this.createPopupContent(countryName, quiz.countries[countryName]);
                    layer.bindPopup(popupContent, {
                        className: 'country-popup',
                        maxWidth: 300
                    });
                }
            });
        }
        
        // Create or update legend
        this.createLegend(quiz);
        
        // Update value overlays
        this.updateValueOverlays(); // This will now trigger addValueOverlays
        
        console.log('Applied quiz configuration:', quiz.title);
    }
    
    createLegend(quiz) {
        // Remove existing legend
        if (this.legend) {
            this.map.removeControl(this.legend);
        }
        
        // Get min and max values
        const values = Object.values(quiz.countries).map(c => c.value).filter(v => typeof v === 'number');
        if (values.length === 0) return;
        
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const unit = quiz.countries[Object.keys(quiz.countries)[0]]?.unit || '';
        
        // Create legend HTML (without title to avoid spoiling the quiz)
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
        
        // Create legend control (moved to bottom-left)
        this.legend = L.control({ position: 'bottomleft' });
        this.legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'legend-control');
            div.innerHTML = legendHtml;
            return div;
        };
        
        this.legend.addTo(this.map);
        
        // Apply gradient colors to legend
        this.updateLegendGradient(quiz);
    }
    
    updateLegendGradient(quiz) {
        const values = Object.values(quiz.countries).map(c => c.value).filter(v => typeof v === 'number');
        if (values.length === 0) return;
        
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        // Get colors for min and max
        const minColor = this.getColorForValue(minValue, quiz);
        const maxColor = this.getColorForValue(maxValue, quiz);
        
        // Apply gradient to legend
        const gradientBar = document.querySelector('.gradient-bar');
        if (gradientBar) {
            gradientBar.style.background = `linear-gradient(to right, ${minColor}, ${maxColor})`;
        }
    }
    
    getColorForValue(value, quiz) {
        // Find the country with this value and return its color
        for (const [countryName, countryData] of Object.entries(quiz.countries)) {
            if (countryData.value === value) {
                return countryData.color;
            }
        }
        return '#cccccc'; // fallback
    }
    
    createSimpleWorldOutline() {
        // Fallback: create a simple world outline if countries data fails to load
        const worldOutline = L.rectangle([[-90, -180], [90, 180]], {
            color: '#cccccc',
            weight: 2,
            fillColor: '#ffffff',
            fillOpacity: 0.7
        }).addTo(this.map);
        
        // Add a message
        this.updateCountryInfo({
            name: 'World Map',
            description: 'Simple world outline loaded. Countries data unavailable.'
        });
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
            
            // Show value overlay for selected country
            this.showCountryValue(feature.properties.name, countryQuizData);
        }
        
        // Update country info
        this.updateCountryInfo({
            name: feature.properties.name,
            description: `Selected: ${feature.properties.name}`,
            quizData: countryQuizData
        });
        
        // Add animation class
        layer.addClass('country-selected');
        setTimeout(() => {
            layer.removeClass('country-selected');
        }, 300);
    }
    
    showCountryValue(countryName, countryData) {
        // Remove existing single country overlay
        if (this.selectedCountryOverlay) {
            this.map.removeLayer(this.selectedCountryOverlay);
        }
        
        // Find the country layer
        this.countriesLayer.eachLayer((layer) => {
            if (layer.feature.properties.name === countryName) {
                const bounds = layer.getBounds();
                const center = bounds.getCenter();
                const value = this.formatValue(countryData.value, countryData.unit);
                
                // Create value overlay for selected country
                const valueIcon = L.divIcon({
                    className: 'country-value-overlay selected',
                    html: `<div class="value-text selected">${value}</div>`,
                    iconSize: [80, 25],
                    iconAnchor: [40, 12]
                });
                
                this.selectedCountryOverlay = L.marker(center, {
                    icon: valueIcon,
                    interactive: false
                }).addTo(this.map);
            }
        });
    }
    
    clearSelection() {
        if (this.countriesLayer) {
            this.countriesLayer.resetStyle();
        }
        this.selectedCountry = null;
        this.updateCountryInfo(null);
    }
    
    updateCountryInfo(country) {
        const countryInfo = document.getElementById('countryInfo');
        
        if (!country) {
            countryInfo.innerHTML = '<p class="no-selection">Click on a country to see details</p>';
            return;
        }
        
        let quizInfo = '';
        if (country.quizData) {
            const formattedValue = this.formatValue(country.quizData.value, country.quizData.unit);
            quizInfo = `
                <p>Value: <span class="value">${formattedValue} ${country.quizData.unit || ''}</span></p>
                <p>Color: <span class="value">${country.quizData.color}</span></p>
            `;
        }
        
        countryInfo.innerHTML = `
            <div class="country-item">
                <h4>${country.name}</h4>
                <p>${country.description}</p>
                ${quizInfo}
            </div>
        `;
    }
    
    // Get current map bounds
    getBounds() {
        return this.map.getBounds();
    }
    
    // Get current center
    getCenter() {
        return this.map.getCenter();
    }
    
    // Get current zoom level
    getZoom() {
        return this.map.getZoom();
    }
}
