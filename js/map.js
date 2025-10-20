// Runtime resolver to handle name mismatches between data and GeoJSON
function resolveToGeoName(name, geoNames) {
    if (geoNames.has(name)) return name;

    const aliases = new Map([
        // USA variations - map from quiz data to GeoJSON
        ['USA', 'United States of America'],
        ['United States', 'United States of America'],
        ['US', 'United States of America'],
        ['America', 'United States of America'],
        ['United States of America', 'United States of America'],
        
        // UK variations - map from quiz data to GeoJSON
        ['England', 'United Kingdom'],
        ['UK', 'United Kingdom'],
        ['Great Britain', 'United Kingdom'],
        ['United Kingdom', 'United Kingdom'],
        ['Scotland', 'United Kingdom'],
        ['Wales', 'United Kingdom'],
        ['Northern Ireland', 'United Kingdom'],
        ['United Kingdom of Great Britain and Northern Ireland', 'United Kingdom'],
        ['United Kingdom (plus British Overseas Territories and Crown Dependencies)', 'United Kingdom'],
        
        // Russia variations
        ['Russian Federation', 'Russia'],
        ['Russia', 'Russia'],
        ['Russia/Soviet Union', 'Russia'],
        
        // Czech Republic
        ['Czech Republic', 'Czechia'],
        ['Czechia', 'Czechia'],
        
        // North Korea
        ['North Korea', 'North Korea'],
        ['Korea, Democratic People\'s Republic of', 'North Korea'],
        
        // South Korea
        ['South Korea', 'South Korea'],
        ['Korea, Republic of', 'South Korea'],
        
        // Other country variations
        ['Swaziland', 'Eswatini'],
        ['Eswatini', 'Eswatini'],
        ['Eswatini (Swaziland)', 'Eswatini'],
        
        ['Macedonia, The Former Yugoslav Republic of', 'North Macedonia'],
        ['Macedonia', 'North Macedonia'],
        ['North Macedonia', 'North Macedonia'],
        
        ['Iran, Islamic Republic of', 'Iran'],
        ['Iran', 'Iran'],
        
        ['Lao People\'s Democratic Republic', 'Laos'],
        ['Laos', 'Laos'],
        
        ['Syrian Arab Republic', 'Syria'],
        ['Syria', 'Syria'],
        
        ['Tanzania, United Republic of', 'Tanzania'],
        ['Tanzania', 'Tanzania'],
        
        ['Venezuela, Bolivarian Republic of', 'Venezuela'],
        ['Venezuela', 'Venezuela'],
        
        ['Moldova, Republic of', 'Moldova'],
        ['Moldova', 'Moldova'],
        
        ['Viet Nam', 'Vietnam'],
        ['Vietnam', 'Vietnam'],
        
        ['Brunei Darussalam', 'Brunei'],
        ['Brunei', 'Brunei'],
        
        ['Holy See (Vatican City State)', 'Vatican'],
        ['Vatican City', 'Vatican'],
        ['Holy See', 'Vatican'],
        ['Vatican', 'Vatican'],
        
        ['Micronesia, Federated States of', 'Micronesia'],
        ['Micronesia', 'Micronesia'],
        
        ['Taiwan, Province of China', 'Taiwan'],
        ['Taiwan', 'Taiwan'],
        
        // Microstates and islands
        ['San Marino', 'San Marino'],
        ['Liechtenstein', 'Liechtenstein'],
        ['Andorra', 'Andorra'],
        ['Malta', 'Malta'],
        ['Luxembourg', 'Luxembourg'],
        ['Monaco', 'Monaco'],
        ['Singapore', 'Singapore'],
        
        // Hong Kong and Macau variations
        ['Macau', 'Macao'],
        ['Macao', 'Macao'],
        ['Hong Kong', 'Hong Kong'],
        ['Hong Kong (China)', 'Hong Kong'],
        ['Hong Kong (CN)', 'Hong Kong'],
        ['Macau (China)', 'Macao'],
        ['Macau (CN)', 'Macao'],
        ['Hong Kong SAR', 'Hong Kong'],
        ['Macau SAR', 'Macao'],
        ['Hong Kong (Visible)', 'Hong Kong'],
        ['Macau (Visible)', 'Macao'],
        
        // Additional microstate variations
        ['Bahrain', 'Bahrain'],
        ['Qatar', 'Qatar'],
        ['Kuwait', 'Kuwait'],
        ['UAE', 'United Arab Emirates'],
        ['United Arab Emirates', 'United Arab Emirates'],
        
        // Caribbean microstates
        ['St. Kitts & Nevis', 'Saint Kitts and Nevis'],
        ['Saint Kitts and Nevis', 'Saint Kitts and Nevis'],
        ['St. Vincent & the Grenadines', 'Saint Vincent and the Grenadines'],
        ['Saint Vincent and the Grenadines', 'Saint Vincent and the Grenadines'],
        ['St. Lucia', 'Saint Lucia'],
        ['Saint Lucia', 'Saint Lucia'],
        ['Antigua & Barbuda', 'Antigua and Barbuda'],
        ['Antigua and Barbuda', 'Antigua and Barbuda'],
        ['Grenada', 'Grenada'],
        ['Dominica', 'Dominica'],
        ['Barbados', 'Barbados'],
        
        // Pacific microstates
        ['Palau', 'Palau'],
        ['Nauru', 'Nauru'],
        ['Tuvalu', 'Tuvalu'],
        ['Kiribati', 'Kiribati'],
        ['Marshall Islands', 'Marshall Islands'],
        ['Vanuatu', 'Vanuatu'],
        ['Fiji', 'Fiji'],
        
        // African microstates
        ['Seychelles', 'Seychelles'],
        ['Mauritius', 'Mauritius'],
        ['Comoros', 'Comoros'],
        ['Djibouti', 'Djibouti'],
        
        // Additional variations
        ['The Bahamas', 'Bahamas'],
        ['Bahamas', 'Bahamas'],
        ['Cape Verde', 'Cape Verde'],
        ['Cabo Verde', 'Cape Verde'],
        ['East Timor', 'Timor-Leste'],
        ['Timor-Leste', 'Timor-Leste'],
        
        ['Bosnia and Herzegovina', 'Bosnia and Herzegovina'],
        ['Bosnia & Herzegovina', 'Bosnia and Herzegovina'],
        
        ['Côte d\'Ivoire', 'Côte d\'Ivoire'],
        ['Ivory Coast', 'Côte d\'Ivoire'],
        ['Cote d\'Ivoire', 'Côte d\'Ivoire'],
        
        ['Guinea-Bissau', 'Guinea-Bissau'],
        ['Guinea Bissau', 'Guinea-Bissau'],
        
        ['The Gambia', 'Gambia'],
        ['Gambia', 'Gambia'],
        
        ['Democratic Republic of the Congo', 'Democratic Republic of the Congo'],
        ['DR Congo', 'Democratic Republic of the Congo'],
        ['Congo, Democratic Republic of the', 'Democratic Republic of the Congo'],
        
        ['Republic of the Congo', 'Republic of the Congo'],
        ['Congo, Republic of the', 'Republic of the Congo'],
        ['Congo', 'Republic of the Congo'],
        
        ['São Tomé and Príncipe', 'Sao Tome and Principe'],
        ['Sao Tome and Principe', 'Sao Tome and Principe'],
        
        ['Palestine, State of', 'Palestine, State of'],
        ['Palestine', 'Palestine, State of'],
        ['West Bank Palestine (West Bank)', 'Palestine, State of'],
        ['Palestine (Gaza Strip)', 'Palestine, State of'],
        
        ['Bolivia (Plurinational State of)', 'Bolivia'],
        ['Bolivia', 'Bolivia'],
        
        ['Yugoslavia', 'Serbia'],
        ['Tibet', 'China'],
        
        // France variations
        ['France', 'France'],
        ['France (including French overseas departments, collectivities, and territories)', 'France'],
    ]);

    const alt = aliases.get(name);
    if (alt && geoNames.has(alt)) return alt;
    
    // Try case-insensitive matching
    const lowerName = name.toLowerCase();
    for (const [alias, target] of aliases) {
        if (alias.toLowerCase() === lowerName && geoNames.has(target)) {
            return target;
        }
    }
    
    // Try partial matching for microstates and islands
    const partialMatches = {
        // USA variations
        'united states': 'United States of America',
        'usa': 'United States of America',
        'us': 'United States of America',
        'america': 'United States of America',
        'united states of america': 'United States of America',
        
        // UK variations
        'united kingdom': 'United Kingdom',
        'uk': 'United Kingdom',
        'great britain': 'United Kingdom',
        'england': 'United Kingdom',
        'scotland': 'United Kingdom',
        'wales': 'United Kingdom',
        'northern ireland': 'United Kingdom',
        
        // Russia variations
        'russia': 'Russia',
        'russian federation': 'Russia',
        'soviet union': 'Russia',
        
        // Czech Republic
        'czech republic': 'Czechia',
        'czechia': 'Czechia',
        
        // Korea variations
        'north korea': 'North Korea',
        'south korea': 'South Korea',
        'korea': 'South Korea',
        
        // Microstates and islands
        'monaco': 'Monaco',
        'vatican': 'Vatican',
        'san marino': 'San Marino',
        'liechtenstein': 'Liechtenstein',
        'andorra': 'Andorra',
        'malta': 'Malta',
        'luxembourg': 'Luxembourg',
        'singapore': 'Singapore',
        
        // Hong Kong and Macau
        'macau': 'Macao',
        'macao': 'Macao',
        'hong kong': 'Hong Kong',
        
        // Other microstates
        'bahamas': 'Bahamas',
        'brunei': 'Brunei',
        'bahrain': 'Bahrain',
        'qatar': 'Qatar',
        'kuwait': 'Kuwait',
        'uae': 'United Arab Emirates',
        'united arab emirates': 'United Arab Emirates',
        
        // Caribbean microstates
        'st kitts': 'Saint Kitts and Nevis',
        'saint kitts': 'Saint Kitts and Nevis',
        'st vincent': 'Saint Vincent and the Grenadines',
        'saint vincent': 'Saint Vincent and the Grenadines',
        'st lucia': 'Saint Lucia',
        'saint lucia': 'Saint Lucia',
        'antigua': 'Antigua and Barbuda',
        'grenada': 'Grenada',
        'dominica': 'Dominica',
        'barbados': 'Barbados',
        
        // Pacific microstates
        'palau': 'Palau',
        'nauru': 'Nauru',
        'tuvalu': 'Tuvalu',
        'kiribati': 'Kiribati',
        'marshall': 'Marshall Islands',
        'micronesia': 'Micronesia',
        'vanuatu': 'Vanuatu',
        'fiji': 'Fiji',
        
        // African microstates
        'seychelles': 'Seychelles',
        'mauritius': 'Mauritius',
        'comoros': 'Comoros',
        'djibouti': 'Djibouti',
        
        // Other country variations
        'cape verde': 'Cape Verde',
        'cabo verde': 'Cape Verde',
        'east timor': 'Timor-Leste',
        'timor-leste': 'Timor-Leste',
        'eswatini': 'Eswatini',
        'swaziland': 'Eswatini',
        'north macedonia': 'North Macedonia',
        'macedonia': 'North Macedonia',
        'bosnia': 'Bosnia and Herzegovina',
        'cote divoire': 'Côte d\'Ivoire',
        'ivory coast': 'Côte d\'Ivoire',
        'guinea bissau': 'Guinea-Bissau',
        'gambia': 'Gambia',
        'congo': 'Republic of the Congo',
        'sao tome': 'Sao Tome and Principe',
        'palestine': 'Palestine, State of',
        'bolivia': 'Bolivia',
        'iran': 'Iran',
        'laos': 'Laos',
        'syria': 'Syria',
        'tanzania': 'Tanzania',
        'venezuela': 'Venezuela',
        'vietnam': 'Vietnam',
        'moldova': 'Moldova',
        'yugoslavia': 'Serbia',
        'tibet': 'China',
        'france': 'France'
    };
    
    for (const [pattern, target] of Object.entries(partialMatches)) {
        if (lowerName.includes(pattern) && geoNames.has(target)) {
            console.log(`Partial match found: "${name}" -> "${target}"`);
            return target;
        }
    }
    
    return name; // fallback
}

// Throttle function for performance optimization
function throttle(fn, wait = 50) {
    let timeout;
    return (...args) => {
        if (timeout) return;
        timeout = setTimeout(() => {
            fn(...args);
            timeout = null;
        }, wait);
    };
}

// World Map class for Quiz Game
class WorldMap {
         constructor() {
         this.map = null;
         this.countriesLayer = null;
         this.selectedCountry = null;
         this.countriesData = null;
         this.currentQuiz = null;
         this.legend = null;
         this.currentHoverPopup = null; // Track current hover popup at class level
         this.popupTimeout = null; // Track popup timeout
         
         this.init();
     }
    
    init() {
        // Check if map is already initialized
        if (this.map) {
            console.log('Map already initialized, skipping...');
            return;
        }
        
        // Check if map container exists
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('Map container not found!');
            return;
        }
        
        console.log('🗺️ Initializing map in container:', mapContainer);
        console.log('🗺️ Container dimensions:', {
            width: mapContainer.offsetWidth,
            height: mapContainer.offsetHeight,
            clientWidth: mapContainer.clientWidth,
            clientHeight: mapContainer.clientHeight
        });
        
        // Initialize the map centered on the world
        this.map = L.map('map').setView([20, 0], 2);
        
                // Set map bounds for game area only
        this.map.setMinZoom(1);
        this.map.setMaxZoom(4);
        
        // Set bounds to show world with some repetition
        const worldBounds = L.latLngBounds(
            L.latLng(-60, -180), // Southwest corner
            L.latLng(85, 180)    // Northeast corner
        );
        this.map.setMaxBounds(worldBounds);
        
        // Add a simple, clean tile layer (CartoDB Positron - clean and minimal)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors, © CartoDB',
            subdomains: 'abcd',
            maxZoom: 19,
            noWrap: false // Allow infinite repetition
        }).addTo(this.map);
         
                   // Note: Removed map event handlers to allow infinite map scrolling
          // Popups will now stay open during zoom/pan operations
        
        // Load countries data
        this.loadCountriesData();
        
        // Lazy load quiz data after map is ready
        this.map.on('load', () => {
            console.log('🗺️ Map tiles loaded successfully');
            // Use requestIdleCallback for better performance, fallback to setTimeout
            if (window.requestIdleCallback) {
                requestIdleCallback(() => {
                    this.notifyQuizDataReady();
                }, { timeout: 1000 });
            } else {
                setTimeout(() => {
                    this.notifyQuizDataReady();
                }, 100);
            }
        });
        
        // Make map instance globally available
        window.mapInstance = this;
    }
    
    // Notify that map is ready for quiz data
    notifyQuizDataReady() {
        // Dispatch custom event to notify quiz system
        window.dispatchEvent(new CustomEvent('mapReadyForQuiz'));
    }
    
    async loadCountriesData() {
        try {
            console.log('🗺️ Loading countries GeoJSON data...');
            
            // Try multiple GeoJSON sources to ensure we get all microstates and islands
            const sources = [
                'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
                'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
            ];
            
            let countriesData = null;
            let sourceIndex = 0;
            
            while (sourceIndex < sources.length && !countriesData) {
                try {
                    console.log(`🗺️ Trying GeoJSON source ${sourceIndex + 1}: ${sources[sourceIndex]}`);
                    const response = await fetch(sources[sourceIndex]);
                    countriesData = await response.json();
                    console.log(`🗺️ Successfully loaded from source ${sourceIndex + 1}`);
                } catch (error) {
                    console.warn(`Failed to load from source ${sourceIndex + 1}:`, error);
                    sourceIndex++;
                }
            }
            
            if (!countriesData) {
                throw new Error('Failed to load from all sources');
            }
            
            this.countriesData = countriesData;
            
            console.log('🗺️ GeoJSON loaded successfully:', {
                featureCount: this.countriesData.features.length,
                type: this.countriesData.type,
                hasProperties: this.countriesData.features[0]?.properties ? true : false
            });
            
            // Debug: Log all country names containing "United" to see what's available
            const unitedCountries = this.countriesData.features
                .map(f => f.properties.name)
                .filter(name => name && name.toLowerCase().includes('united'))
                .sort();
            console.log('GeoJSON countries containing "United":', unitedCountries);
            
            // Debug: Also check for "America" and "USA" variations
            const americaCountries = this.countriesData.features
                .map(f => f.properties.name)
                .filter(name => name && (name.toLowerCase().includes('america') || name.toLowerCase().includes('usa')))
                .sort();
            console.log('GeoJSON countries containing "America" or "USA":', americaCountries);
            
            // Debug: Check for microstates and islands
            const microstates = this.countriesData.features
                .map(f => f.properties.name)
                .filter(name => name && (
                    name.toLowerCase().includes('monaco') ||
                    name.toLowerCase().includes('vatican') ||
                    name.toLowerCase().includes('san marino') ||
                    name.toLowerCase().includes('liechtenstein') ||
                    name.toLowerCase().includes('andorra') ||
                    name.toLowerCase().includes('malta') ||
                    name.toLowerCase().includes('luxembourg') ||
                    name.toLowerCase().includes('singapore') ||
                    name.toLowerCase().includes('macao') ||
                    name.toLowerCase().includes('hong kong')
                ))
                .sort();
            console.log('GeoJSON microstates and islands found:', microstates);
            
            // Debug: Log a sample of all country names
            const allCountryNames = this.countriesData.features
                .map(f => f.properties.name)
                .filter(name => name)
                .sort()
                .slice(0, 20);
            console.log('Sample of all GeoJSON country names:', allCountryNames);
            
            // Create the countries layer
            this.createCountriesLayer();
            
            // Ensure microstates and islands are included
            this.ensureMicrostatesIncluded();
        } catch (error) {
            console.error('Error loading countries data:', error);
            // Final fallback: create a simple world outline
            this.createSimpleWorldOutline();
        }
    }
    
    ensureMicrostatesIncluded() {
        if (!this.countriesData || !this.countriesData.features) {
            return;
        }
        
        const existingNames = new Set(this.countriesData.features.map(f => f.properties.name));
                 const microstatesToAdd = [
             // European microstates
             {
                 name: 'Monaco',
                 coordinates: [[[7.409, 43.750], [7.409, 43.750], [7.409, 43.750], [7.409, 43.750]]]
             },
             {
                 name: 'Vatican',
                 coordinates: [[[12.446, 41.902], [12.446, 41.902], [12.446, 41.902], [12.446, 41.902]]]
             },
             {
                 name: 'San Marino',
                 coordinates: [[[12.458, 43.942], [12.458, 43.942], [12.458, 43.942], [12.458, 43.942]]]
             },
             {
                 name: 'Liechtenstein',
                 coordinates: [[[9.544, 47.058], [9.544, 47.058], [9.544, 47.058], [9.544, 47.058]]]
             },
             {
                 name: 'Andorra',
                 coordinates: [[[1.502, 42.500], [1.502, 42.500], [1.502, 42.500], [1.502, 42.500]]]
             },
             {
                 name: 'Malta',
                 coordinates: [[[14.375, 35.937], [14.375, 35.937], [14.375, 35.937], [14.375, 35.937]]]
             },
             {
                 name: 'Luxembourg',
                 coordinates: [[[6.129, 49.815], [6.129, 49.815], [6.129, 49.815], [6.129, 49.815]]]
             },
             
             // Asian microstates and territories
             {
                 name: 'Singapore',
                 coordinates: [[[103.819, 1.352], [103.819, 1.352], [103.819, 1.352], [103.819, 1.352]]]
             },
             {
                 name: 'Macao',
                 coordinates: [[[113.544, 22.199], [113.544, 22.199], [113.544, 22.199], [113.544, 22.199]]]
             },
             {
                 name: 'Hong Kong',
                 coordinates: [[[114.169, 22.319], [114.169, 22.319], [114.169, 22.319], [114.169, 22.319]]]
             },
             {
                 name: 'Brunei',
                 coordinates: [[[114.727, 4.535], [114.727, 4.535], [114.727, 4.535], [114.727, 4.535]]]
             },
             {
                 name: 'Bahrain',
                 coordinates: [[[50.562, 26.066], [50.562, 26.066], [50.562, 26.066], [50.562, 26.066]]]
             },
             {
                 name: 'Qatar',
                 coordinates: [[[51.183, 25.285], [51.183, 25.285], [51.183, 25.285], [51.183, 25.285]]]
             },
             {
                 name: 'Kuwait',
                 coordinates: [[[47.978, 29.375], [47.978, 29.375], [47.978, 29.375], [47.978, 29.375]]]
             },
             {
                 name: 'United Arab Emirates',
                 coordinates: [[[54.377, 24.453], [54.377, 24.453], [54.377, 24.453], [54.377, 24.453]]]
             },
             
             // Caribbean microstates
             {
                 name: 'Saint Kitts and Nevis',
                 coordinates: [[[-62.783, 17.357], [-62.783, 17.357], [-62.783, 17.357], [-62.783, 17.357]]]
             },
             {
                 name: 'Saint Vincent and the Grenadines',
                 coordinates: [[[-61.227, 13.253], [-61.227, 13.253], [-61.227, 13.253], [-61.227, 13.253]]]
             },
             {
                 name: 'Saint Lucia',
                 coordinates: [[[-60.978, 13.909], [-60.978, 13.909], [-60.978, 13.909], [-60.978, 13.909]]]
             },
             {
                 name: 'Antigua and Barbuda',
                 coordinates: [[[-61.783, 17.050], [-61.783, 17.050], [-61.783, 17.050], [-61.783, 17.050]]]
             },
             {
                 name: 'Grenada',
                 coordinates: [[[-61.667, 12.117], [-61.667, 12.117], [-61.667, 12.117], [-61.667, 12.117]]]
             },
             {
                 name: 'Dominica',
                 coordinates: [[[-61.375, 15.415], [-61.375, 15.415], [-61.375, 15.415], [-61.375, 15.415]]]
             },
             {
                 name: 'Barbados',
                 coordinates: [[[-59.613, 13.193], [-59.613, 13.193], [-59.613, 13.193], [-59.613, 13.193]]]
             },
             
             // Pacific microstates
             {
                 name: 'Palau',
                 coordinates: [[[134.582, 7.515], [134.582, 7.515], [134.582, 7.515], [134.582, 7.515]]]
             },
             {
                 name: 'Nauru',
                 coordinates: [[[166.921, -0.523], [166.921, -0.523], [166.921, -0.523], [166.921, -0.523]]]
             },
             {
                 name: 'Tuvalu',
                 coordinates: [[[178.116, -8.521], [178.116, -8.521], [178.116, -8.521], [178.116, -8.521]]]
             },
             {
                 name: 'Kiribati',
                 coordinates: [[[173.664, 1.338], [173.664, 1.338], [173.664, 1.338], [173.664, 1.338]]]
             },
             {
                 name: 'Marshall Islands',
                 coordinates: [[[168.735, 7.131], [168.735, 7.131], [168.735, 7.131], [168.735, 7.131]]]
             },
             {
                 name: 'Micronesia',
                 coordinates: [[[158.215, 6.924], [158.215, 6.924], [158.215, 6.924], [158.215, 6.924]]]
             },
             {
                 name: 'Vanuatu',
                 coordinates: [[[166.959, -15.376], [166.959, -15.376], [166.959, -15.376], [166.959, -15.376]]]
             },
             {
                 name: 'Fiji',
                 coordinates: [[[178.065, -17.713], [178.065, -17.713], [178.065, -17.713], [178.065, -17.713]]]
             },
             
             // African microstates
             {
                 name: 'Seychelles',
                 coordinates: [[[55.454, -4.679], [55.454, -4.679], [55.454, -4.679], [55.454, -4.679]]]
             },
             {
                 name: 'Mauritius',
                 coordinates: [[[57.552, -20.348], [57.552, -20.348], [57.552, -20.348], [57.552, -20.348]]]
             },
             {
                 name: 'Comoros',
                 coordinates: [[[43.872, -11.645], [43.872, -11.645], [43.872, -11.645], [43.872, -11.645]]]
             },
             {
                 name: 'São Tomé and Príncipe',
                 coordinates: [[[6.613, 0.186], [6.613, 0.186], [6.613, 0.186], [6.613, 0.186]]]
             },
             {
                 name: 'Cape Verde',
                 coordinates: [[[-23.508, 15.120], [-23.508, 15.120], [-23.508, 15.120], [-23.508, 15.120]]]
             },
             {
                 name: 'Djibouti',
                 coordinates: [[[42.590, 11.825], [42.590, 11.825], [42.590, 11.825], [42.590, 11.825]]]
             },
             
             // Alternative names that might be in the data
             {
                 name: 'Macau',
                 coordinates: [[[113.544, 22.199], [113.544, 22.199], [113.544, 22.199], [113.544, 22.199]]]
             },
             {
                 name: 'Hong Kong SAR',
                 coordinates: [[[114.169, 22.319], [114.169, 22.319], [114.169, 22.319], [114.169, 22.319]]]
             },
             {
                 name: 'Macau SAR',
                 coordinates: [[[113.544, 22.199], [113.544, 22.199], [113.544, 22.199], [113.544, 22.199]]]
             },
             {
                 name: 'Sao Tome and Principe',
                 coordinates: [[[6.613, 0.186], [6.613, 0.186], [6.613, 0.186], [6.613, 0.186]]]
             },
             {
                 name: 'Cabo Verde',
                 coordinates: [[[-23.508, 15.120], [-23.508, 15.120], [-23.508, 15.120], [-23.508, 15.120]]]
             },
             
             // Create more visible polygons for microstates
             {
                 name: 'Hong Kong (Visible)',
                 coordinates: [[[114.1, 22.2], [114.3, 22.2], [114.3, 22.4], [114.1, 22.4], [114.1, 22.2]]]
             },
             {
                 name: 'Macau (Visible)',
                 coordinates: [[[113.5, 22.1], [113.6, 22.1], [113.6, 22.3], [113.5, 22.3], [113.5, 22.1]]]
             },
             {
                 name: 'Monaco (Visible)',
                 coordinates: [[[7.4, 43.7], [7.4, 43.8], [7.4, 43.8], [7.4, 43.7], [7.4, 43.7]]]
             },
             {
                 name: 'Vatican (Visible)',
                 coordinates: [[[12.44, 41.90], [12.44, 41.91], [12.44, 41.91], [12.44, 41.90], [12.44, 41.90]]]
             },
             {
                 name: 'San Marino (Visible)',
                 coordinates: [[[12.45, 43.94], [12.45, 43.95], [12.45, 43.95], [12.45, 43.94], [12.45, 43.94]]]
             },
             {
                 name: 'Liechtenstein (Visible)',
                 coordinates: [[[9.54, 47.05], [9.54, 47.06], [9.54, 47.06], [9.54, 47.05], [9.54, 47.05]]]
             },
             {
                 name: 'Andorra (Visible)',
                 coordinates: [[[1.50, 42.50], [1.50, 42.51], [1.50, 42.51], [1.50, 42.50], [1.50, 42.50]]]
             },
             {
                 name: 'Malta (Visible)',
                 coordinates: [[[14.37, 35.93], [14.37, 35.94], [14.37, 35.94], [14.37, 35.93], [14.37, 35.93]]]
             },
             {
                 name: 'Luxembourg (Visible)',
                 coordinates: [[[6.12, 49.81], [6.12, 49.82], [6.12, 49.82], [6.12, 49.81], [6.12, 49.81]]]
             },
             {
                 name: 'Singapore (Visible)',
                 coordinates: [[[103.81, 1.35], [103.81, 1.36], [103.81, 1.36], [103.81, 1.35], [103.81, 1.35]]]
             }
         ];
        
        const addedMicrostates = [];
        
        microstatesToAdd.forEach(microstate => {
            if (!existingNames.has(microstate.name)) {
                const feature = {
                    type: 'Feature',
                    properties: {
                        name: microstate.name
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: microstate.coordinates
                    }
                };
                
                this.countriesData.features.push(feature);
                addedMicrostates.push(microstate.name);
                console.log(`Added missing microstate: ${microstate.name}`);
            }
        });
        
        if (addedMicrostates.length > 0) {
            console.log('Added microstates to GeoJSON:', addedMicrostates);
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
             
             // Close any existing hover popup
             if (this.currentHoverPopup) {
                 this.currentHoverPopup.closePopup();
                 this.currentHoverPopup = null;
             }
             
             // Keep original colors, no border changes
             const originalStyle = this.getCountryStyle(layer.feature);
             layer.setStyle(originalStyle);
             
             // Use DOM class instead of Leaflet class
             if (layer.getElement()) {
                 layer.getElement().classList.add('country-hover');
             }
             
             // Show popup on hover if quiz data exists - with delay to prevent interference
             if (this.currentQuiz && this.currentQuiz.countries[layer.feature.properties.name]) {
                 const countryData = this.currentQuiz.countries[layer.feature.properties.name];
                 const popupContent = this.createPopupContent(layer.feature.properties.name, countryData);
                 
                                   // Close all existing popups first
                  this.closeAllPopups();
                  
                  // Small delay to ensure previous popup is fully closed
                  this.popupTimeout = setTimeout(() => {
                      // Get the center of the country for better popup positioning
                      const bounds = layer.getBounds();
                      const center = bounds.getCenter();
                      
                      // Create popup at the center of the country, not at a fixed point
                      const popup = L.popup({
                          className: 'country-popup',
                          maxWidth: 200,
                          closeButton: false,
                          autoClose: false,
                          keepInView: false, // Prevent automatic map movement
                          autoPan: false, // Disable automatic panning
                          autoPanPadding: [0, 0] // No padding for auto-pan
                      })
                      .setLatLng(center)
                      .setContent(popupContent);
                      
                      popup.openOn(this.map);
                      this.currentHoverPopup = popup;
                      this.popupTimeout = null;
                  }, 50); // Small delay to prevent race conditions
             }
         };
        
                 // Reset highlight function
         const resetHighlight = (e) => {
             const layer = e.target;
             
             // Explicitly reset to original quiz style
             const originalStyle = this.getCountryStyle(layer.feature);
             layer.setStyle(originalStyle);
             
             // Use DOM class instead of Leaflet class
             if (layer.getElement()) {
                 layer.getElement().classList.remove('country-hover');
             }
             
                           // Close all popups on mouse out
              this.closeAllPopups();
         };
        
                 // Click function (simplified - no popup)
         const onEachFeature = (feature, layer) => {
                           layer.on({
                  mouseover: throttle(highlightFeature, 50), // Reduced throttle for better responsiveness
                  mouseout: resetHighlight,
                  click: (e) => this.selectCountry(e.target, feature)
              });
         };
        
        // Create a single layer that will repeat infinitely
        this.countriesLayer = L.geoJSON(this.countriesData, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(this.map);
        
        console.log('🗺️ Countries layer created and added to map:', {
            layerCount: this.countriesLayer.getLayers().length,
            hasStyle: !!style,
            hasOnEachFeature: !!onEachFeature
        });
        
        // Force map refresh to ensure proper rendering
        setTimeout(() => {
            if (this.map && typeof this.map.invalidateSize === 'function') {
                this.map.invalidateSize();
                console.log('🗺️ Map invalidated after countries layer creation');
            }
        }, 100);
    }
    
    getCountryStyle(feature) {
        const countryName = feature.properties.name;
        
        // Debug logging for United States
        if (countryName === 'United States of America' || countryName === 'United States') {
            console.log('🇺🇸 Map styling - USA country:', countryName, {
                hasQuiz: !!this.currentQuiz,
                hasCountryData: !!(this.currentQuiz && this.currentQuiz.countries[countryName]),
                countryData: this.currentQuiz ? this.currentQuiz.countries[countryName] : null,
                allUSAKeys: this.currentQuiz ? Object.keys(this.currentQuiz.countries).filter(c => 
                    c.toLowerCase().includes('united') || 
                    c.toLowerCase().includes('america') || 
                    c.toLowerCase().includes('usa')
                ) : []
            });
        }
        
        // Debug: Log all available country names in the GeoJSON to see what we have
        if (countryName && countryName.toLowerCase().includes('united')) {
            console.log('GeoJSON country name containing "united":', countryName);
        }
        
        // Debug: Also log America/USA variations
        if (countryName && (countryName.toLowerCase().includes('america') || countryName.toLowerCase().includes('usa'))) {
            console.log('GeoJSON country name containing "america" or "usa":', countryName);
        }
        
        // Default style - use white only for countries without data
        let style = {
            fillColor: '#ffffff', // White for countries without data
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
        
        // Normalize country names to match GeoJSON names
        const geoNames = new Set(this.countriesData.features.map(f => f.properties.name));
        const usaNames = Array.from(geoNames).filter(name => 
            name.toLowerCase().includes('united') || 
            name.toLowerCase().includes('america') || 
            name.toLowerCase().includes('usa')
        );
        console.log('🇺🇸 USA DEBUG - Available GeoJSON names:');
        usaNames.forEach(name => console.log(`  - "${name}"`));
        
        // Also debug UK names
        const ukNames = Array.from(geoNames).filter(name => 
            name.toLowerCase().includes('kingdom') || 
            name.toLowerCase().includes('britain') || 
            name.toLowerCase().includes('england') ||
            name.toLowerCase().includes('uk ')
        );
        console.log('🇬🇧 UK DEBUG - Available GeoJSON names:');
        ukNames.forEach(name => console.log(`  - "${name}"`));
        
                 // Debug microstates and islands
         const microstateNames = Array.from(geoNames).filter(name => 
             name.toLowerCase().includes('monaco') ||
             name.toLowerCase().includes('vatican') ||
             name.toLowerCase().includes('san marino') ||
             name.toLowerCase().includes('liechtenstein') ||
             name.toLowerCase().includes('andorra') ||
             name.toLowerCase().includes('malta') ||
             name.toLowerCase().includes('luxembourg') ||
             name.toLowerCase().includes('singapore') ||
             name.toLowerCase().includes('macao') ||
             name.toLowerCase().includes('hong kong')
         );
         console.log('🏛️ Microstates and Islands DEBUG - Available GeoJSON names:');
         microstateNames.forEach(name => console.log(`  - "${name}"`));
         
         // Specific debug for Hong Kong and Macau
         const hkMacauNames = Array.from(geoNames).filter(name => 
             name.toLowerCase().includes('hong') ||
             name.toLowerCase().includes('macau') ||
             name.toLowerCase().includes('macao')
         );
         console.log('🇭🇰🇲🇴 Hong Kong & Macau DEBUG - Available GeoJSON names:');
         hkMacauNames.forEach(name => console.log(`  - "${name}"`));
        
        const fixed = {};
        const missingCountries = [];
        
        for (const [k, v] of Object.entries(this.currentQuiz.countries)) {
            const resolvedName = resolveToGeoName(k, geoNames);
            
            // Debug USA specifically
            if (k.toLowerCase().includes('united') || k.toLowerCase().includes('america')) {
                console.log('🇺🇸 USA DEBUG - Processing:', {
                    original: k,
                    resolved: resolvedName,
                    inGeoJSON: geoNames.has(resolvedName),
                    value: v
                });
            }
            
            // Debug UK specifically
            if (k.toLowerCase().includes('kingdom') || k.toLowerCase().includes('britain')) {
                console.log('🇬🇧 UK DEBUG - Processing:', {
                    original: k,
                    resolved: resolvedName,
                    inGeoJSON: geoNames.has(resolvedName),
                    value: v
                });
            }
            
                         // Debug microstates and islands
             if (k.toLowerCase().includes('monaco') || 
                 k.toLowerCase().includes('vatican') || 
                 k.toLowerCase().includes('san marino') || 
                 k.toLowerCase().includes('liechtenstein') || 
                 k.toLowerCase().includes('andorra') || 
                 k.toLowerCase().includes('malta') || 
                 k.toLowerCase().includes('luxembourg') || 
                 k.toLowerCase().includes('singapore') || 
                 k.toLowerCase().includes('macao') || 
                 k.toLowerCase().includes('hong kong')) {
                 console.log('🏛️ Microstate/Island DEBUG - Processing:', {
                     original: k,
                     resolved: resolvedName,
                     inGeoJSON: geoNames.has(resolvedName),
                     value: v
                 });
             }
             
             // Specific debug for Hong Kong and Macau
             if (k.toLowerCase().includes('hong') || k.toLowerCase().includes('macau') || k.toLowerCase().includes('macao')) {
                 console.log('🇭🇰🇲🇴 Hong Kong & Macau DEBUG - Processing:', {
                     original: k,
                     resolved: resolvedName,
                     inGeoJSON: geoNames.has(resolvedName),
                     value: v,
                     allMatchingGeoJSON: Array.from(geoNames).filter(name => 
                         name.toLowerCase().includes('hong') || 
                         name.toLowerCase().includes('macau') || 
                         name.toLowerCase().includes('macao')
                     )
                 });
             }
            
            if (!geoNames.has(resolvedName)) {
                missingCountries.push({ original: k, resolved: resolvedName });
            }
            
            fixed[resolvedName] = v;
        }
        
        // Log missing countries
        if (missingCountries.length > 0) {
            console.warn('⚠️ Countries missing from GeoJSON:', missingCountries);
            console.log('Available GeoJSON countries:', Array.from(geoNames).sort());
        }
        
        this.currentQuiz.countries = fixed;
        
        // Debug: Show final USA entries in the fixed countries object
        const finalUSAEntries = Object.keys(fixed).filter(k => 
            k.toLowerCase().includes('united') || 
            k.toLowerCase().includes('america') || 
            k.toLowerCase().includes('usa')
        );
        console.log('🇺🇸 USA DEBUG - Final quiz countries with USA data:');
        finalUSAEntries.forEach(name => console.log(`  - "${name}": ${JSON.stringify(fixed[name])}`));
        
        // Debug: Show final UK entries in the fixed countries object
        const finalUKEntries = Object.keys(fixed).filter(k => 
            k.toLowerCase().includes('kingdom') || 
            k.toLowerCase().includes('britain') ||
            k.toLowerCase().includes('england')
        );
        console.log('🇬🇧 UK DEBUG - Final quiz countries with UK data:');
        finalUKEntries.forEach(name => console.log(`  - "${name}": ${JSON.stringify(fixed[name])}`));
        
        // Debug: Show final microstate entries in the fixed countries object
        const finalMicrostateEntries = Object.keys(fixed).filter(k => 
            k.toLowerCase().includes('monaco') ||
            k.toLowerCase().includes('vatican') ||
            k.toLowerCase().includes('san marino') ||
            k.toLowerCase().includes('liechtenstein') ||
            k.toLowerCase().includes('andorra') ||
            k.toLowerCase().includes('malta') ||
            k.toLowerCase().includes('luxembourg') ||
            k.toLowerCase().includes('singapore') ||
            k.toLowerCase().includes('macao') ||
            k.toLowerCase().includes('hong kong')
        );
        console.log('🏛️ Microstate/Island DEBUG - Final quiz countries with microstate data:');
        finalMicrostateEntries.forEach(name => console.log(`  - "${name}": ${JSON.stringify(fixed[name])}`));
        
        // Check if countries layer exists
        if (!this.countriesLayer) {
            console.error('Countries layer not initialized');
            return;
        }
        
        // Apply colors to the single layer
        this.countriesLayer.setStyle((feature) => {
            return this.getCountryStyle(feature);
        });
        
        // Force redraw to ensure colors appear on all repeating instances
        // For GeoJSON layers, we need to refresh the map to see changes on repeating instances
        if (this.map && typeof this.map.invalidateSize === 'function') {
            this.map.invalidateSize();
        }
        
        // Force a complete layer refresh to ensure proper rendering
        if (this.countriesLayer) {
            this.map.removeLayer(this.countriesLayer);
            this.map.addLayer(this.countriesLayer);
            
            // Additional refresh after re-adding
            setTimeout(() => {
                if (this.map && typeof this.map.invalidateSize === 'function') {
                    this.map.invalidateSize();
                }
            }, 50);
        }
        
        // Create legend
        this.createLegend(quiz);
    }
    
    createPopupContent(countryName, countryData) {
        const formattedValue = this.formatValue(countryData.value, countryData.unit);
        
        // Check if answer is revealed (quiz interface has answer title visible)
        const answerTitle = document.getElementById('answerTitle');
        const isAnswerRevealed = answerTitle && answerTitle.style.display !== 'none';
        
        let additionalInfo = '';
        if (isAnswerRevealed && window.quizGame && window.quizGame.currentQuiz) {
            const currentQuiz = window.quizGame.currentQuiz;
            additionalInfo = `
                <div class="popup-context">
                    <div class="popup-quiz-info">
                        <strong>${currentQuiz.title}</strong>
                    </div>
                    <div class="popup-unit-info">
                        Unit: ${countryData.unit}
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="popup-content">
                <h3>${countryName}</h3>
                <div class="popup-value">
                    <span class="value-number">${formattedValue}</span>
                </div>
                ${additionalInfo}
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
            this.legend = null;
        }
        
        // Validate quiz data
        if (!quiz || !quiz.countries || Object.keys(quiz.countries).length === 0) {
            console.warn('No valid quiz data for legend creation');
            return;
        }
        
        // Handle categorical data
        if (quiz.colorScheme?.type === 'categorical') {
            this.createCategoricalLegend(quiz);
            return;
        }
        
        // Handle numeric data
        const values = Object.values(quiz.countries).map(country => country.value);
        
        // Debug logging for legend creation
        console.log('Legend creation - All values:', values.slice(0, 10), '... (showing first 10)');
        console.log('Legend creation - Quiz countries count:', Object.keys(quiz.countries).length);
        
        // Filter out invalid values
        const validValues = values.filter(value => 
            value !== null && 
            value !== undefined && 
            !isNaN(value) && 
            typeof value === 'number'
        );
        
        console.log('Legend creation - Valid values count:', validValues.length);
        console.log('Legend creation - Sample valid values:', validValues.slice(0, 5));
        
        if (validValues.length === 0) {
            console.error('No valid numeric values found for legend');
            console.error('All values were:', values);
            return;
        }
        
        const minValue = Math.min(...validValues);
        const maxValue = Math.max(...validValues);
        const unit = Object.values(quiz.countries)[0]?.unit || '';
        
        console.log('Legend values:', { minValue, maxValue, unit, totalValues: values.length, validValues: validValues.length });
        
        // Round the bounds to prevent spoilers
        const roundedMinValue = this.roundValueForLegend(minValue, unit);
        const roundedMaxValue = this.roundValueForLegend(maxValue, unit);
        
        // Get top 10 and bottom 10 countries for legend
        const countriesWithValues = Object.entries(quiz.countries)
            .filter(([country, data]) => typeof data.value === 'number' && !isNaN(data.value))
            .map(([country, data]) => ({ country, value: data.value }))
            .sort((a, b) => b.value - a.value);
        
        const top10 = countriesWithValues.slice(0, 10);
        const bottom10 = countriesWithValues.slice(-10).reverse();
        
        // Create legend HTML with top/bottom section
        const legendHtml = `
            <div class="legend">
                <div class="legend-gradient">
                    <div class="gradient-bar"></div>
                    <div class="gradient-labels">
                        <span class="min-label">${this.formatValue(roundedMinValue, unit)}</span>
                        <span class="max-label">${this.formatValue(roundedMaxValue, unit)}</span>
                    </div>
                </div>
                ${top10.length > 0 ? `
                <div class="legend-extremes">
                    <div class="extremes-section">
                        <div class="extremes-title">Top 10</div>
                        <div class="extremes-items">
                            ${top10.map(item => `
                                <div class="extreme-item" title="${item.country} (${item.value.toLocaleString()})">
                                    ${item.country} <span class="extreme-value">(${item.value.toLocaleString()})</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="extremes-section">
                        <div class="extremes-title">Bottom 10</div>
                        <div class="extremes-items">
                            ${bottom10.map(item => `
                                <div class="extreme-item" title="${item.country} (${item.value.toLocaleString()})">
                                    ${item.country} <span class="extreme-value">(${item.value.toLocaleString()})</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}
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
        
        console.log('Legend created successfully');
    }
    
    createCategoricalLegend(quiz) {
        // Get unique categories and their colors
        const categories = new Set();
        const categoryColors = {};
        
        Object.values(quiz.countries).forEach(country => {
            if (country.value && country.color) {
                categories.add(country.value);
                categoryColors[country.value] = country.color;
            }
        });
        
        const categoryList = Array.from(categories);
        
        if (categoryList.length === 0) {
            console.warn('No valid categories found for categorical legend');
            return;
        }
        
        // Don't show legend if there are too many categories (more than 9)
        if (categoryList.length > 9) {
            console.log('Too many categories (' + categoryList.length + '), skipping categorical legend');
            return;
        }
        
        // Create legend HTML with color swatches (max 9)
        const maxCategories = Math.min(categoryList.length, 9);
        const colorSwatches = categoryList.slice(0, maxCategories).map(category => {
            const color = categoryColors[category];
            return `<div class="category-swatch" style="background-color: ${color};" title="${category}"></div>`;
        }).join('');
        
        const legendHtml = `
            <div class="legend">
                <div class="legend-categorical">
                    <div class="category-swatches">
                        ${colorSwatches}
                    </div>
                    <div class="category-count">
                        <span>${maxCategories} categories</span>
                        ${categoryList.length > maxCategories ? ` (+${categoryList.length - maxCategories} more)` : ''}
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
        
        console.log('Categorical legend created successfully with', maxCategories, 'categories (out of', categoryList.length, 'total)');
    }
    
    updateLegendGradient(quiz) {
        const gradientBar = document.querySelector('.gradient-bar');
        if (gradientBar && quiz.colorScheme) {
            // Use multi-color gradient if available, otherwise fall back to simple gradient
            if (quiz.colorScheme.colors && quiz.colorScheme.colors.length > 2) {
                const colorStops = quiz.colorScheme.colors.map((color, index) => {
                    const percentage = (index / (quiz.colorScheme.colors.length - 1)) * 100;
                    return `${color} ${percentage}%`;
                }).join(', ');
                gradientBar.style.background = `linear-gradient(to right, ${colorStops})`;
            } else {
                const minColor = quiz.colorScheme.minColor;
                const maxColor = quiz.colorScheme.maxColor;
                gradientBar.style.background = `linear-gradient(to right, ${minColor}, ${maxColor})`;
            }
        }
    }
    
    clearLegend() {
        if (this.legend) {
            this.map.removeControl(this.legend);
            this.legend = null;
            console.log('Legend cleared');
        }
    }
    
    getColorForValue(value, quiz) {
        // Handle categorical data
        if (quiz.colorScheme?.type === 'categorical') {
            // For categorical data, the color is already assigned in the quiz data
            return quiz.colorScheme?.defaultColor || '#ffffff';
        }
        
        // Handle numeric data
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
    

    
         closeAllPopups() {
         // Clear any pending popup timeout
         if (this.popupTimeout) {
             clearTimeout(this.popupTimeout);
             this.popupTimeout = null;
         }
         
         // Close current hover popup
         if (this.currentHoverPopup) {
             this.map.closePopup(this.currentHoverPopup);
             this.currentHoverPopup = null;
         }
         
         // Close any other popups
         this.map.closePopup();
     }
     
    createSimpleWorldOutline() {
        // Fallback: create a simple world outline if GeoJSON fails to load
        console.log('Creating simple world outline as fallback');
    }
    
    resetMapView() {
        // Reset map to standard world view
        if (this.map) {
            this.map.setView([20, 0], 2);
            this.map.invalidateSize();
            console.log('🗺️ Map view reset to standard world view');
        }
    }
}

// Initialize map when script loads
const worldMap = new WorldMap();
