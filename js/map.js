// Simple World Map class with color configurations
class SimpleWorldMap {
    constructor() {
        this.map = null;
        this.countriesLayer = null;
        this.selectedCountry = null;
        this.countriesData = null;
        this.configs = null;
        this.currentConfig = null;
        
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
        
        // Load configurations and countries data
        this.loadConfigurations();
        this.loadCountriesData();
    }
    
    async loadConfigurations() {
        try {
            const response = await fetch('data/configs.json');
            this.configs = await response.json();
            console.log('Configurations loaded:', this.configs);
        } catch (error) {
            console.error('Error loading configurations:', error);
            this.configs = { configs: {} };
        }
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
            opacity: 1,
            color: '#cccccc',
            fillOpacity: 0.7
        };
        
        // Apply configuration if available
        if (this.currentConfig && this.currentConfig.countries[countryName]) {
            const countryConfig = this.currentConfig.countries[countryName];
            style.fillColor = countryConfig.color;
            style.fillOpacity = 0.8;
            style.weight = 1.5;
        }
        
        return style;
    }
    
    applyConfiguration(configKey) {
        if (configKey === 'none') {
            this.currentConfig = null;
        } else if (this.configs && this.configs.configs[configKey]) {
            this.currentConfig = this.configs.configs[configKey];
        }
        
        // Update map styles
        if (this.countriesLayer) {
            this.countriesLayer.setStyle((feature) => this.getCountryStyle(feature));
        }
        
        // Update configuration info
        this.updateConfigInfo();
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
        
        // Get country configuration if available
        let countryConfig = null;
        if (this.currentConfig && this.currentConfig.countries[this.selectedCountry]) {
            countryConfig = this.currentConfig.countries[this.selectedCountry];
        }
        
        // Update country info
        this.updateCountryInfo({
            name: feature.properties.name,
            description: `Selected: ${feature.properties.name}`,
            config: countryConfig
        });
        
        // Add animation class
        layer.addClass('country-selected');
        setTimeout(() => {
            layer.removeClass('country-selected');
        }, 300);
    }
    
    clearSelection() {
        if (this.countriesLayer) {
            this.countriesLayer.resetStyle();
        }
        this.selectedCountry = null;
        this.updateCountryInfo(null);
    }
    
    updateConfigInfo() {
        const configInfo = document.getElementById('configInfo');
        
        if (!this.currentConfig) {
            configInfo.innerHTML = '<p class="no-config">Select a color scheme to apply country colors</p>';
            return;
        }
        
        const countriesList = Object.entries(this.currentConfig.countries)
            .map(([country, data]) => `
                <div class="config-item">
                    <h4>${country}</h4>
                    <p>Value: <span class="value">${data.value}</span></p>
                    <div class="color-preview">
                        <div class="color-sample">
                            <div class="color-box" style="background-color: ${data.color}"></div>
                            <span>${data.color}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        
        configInfo.innerHTML = `
            <div class="config-item">
                <h4>${this.currentConfig.name}</h4>
                <p>${this.currentConfig.description}</p>
                <div class="color-preview">
                    <div class="color-sample">
                        <div class="color-box" style="background-color: ${this.currentConfig.colorScheme.minColor}"></div>
                        <span>Min</span>
                    </div>
                    <div class="color-sample">
                        <div class="color-box" style="background-color: ${this.currentConfig.colorScheme.maxColor}"></div>
                        <span>Max</span>
                    </div>
                </div>
            </div>
            ${countriesList}
        `;
    }
    
    updateCountryInfo(country) {
        const countryInfo = document.getElementById('countryInfo');
        
        if (!country) {
            countryInfo.innerHTML = '<p class="no-selection">Click on a country to select it</p>';
            return;
        }
        
        let configInfo = '';
        if (country.config) {
            configInfo = `
                <p>Value: <span class="value">${country.config.value}</span></p>
                <p>Color: <span class="value">${country.config.color}</span></p>
            `;
        }
        
        countryInfo.innerHTML = `
            <div class="country-item">
                <h4>${country.name}</h4>
                <p>${country.description}</p>
                ${configInfo}
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
