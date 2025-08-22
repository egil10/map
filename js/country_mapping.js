// Country Name Mapping System
// Maps country names from data files to Leaflet.js GeoJSON country names

class CountryMapper {
    constructor() {
        this.countryMappings = {
            // Common variations and aliases
            "United States": "United States of America",
            "United States of America": "United States of America",
            "USA": "United States of America",
            "US": "United States of America",
            
            // Democratic Republic of the Congo variations
            "Democratic Republic of the Congo": "Congo, Democratic Republic of the",
            "DR Congo": "Congo, Democratic Republic of the",
            "Congo, Democratic Republic of the": "Congo, Democratic Republic of the",
            
            // Republic of the Congo
            "Republic of the Congo": "Congo, Republic of the",
            "Congo, Republic of the": "Congo, Republic of the",
            
            // United Kingdom variations
            "United Kingdom": "United Kingdom",
            "UK": "United Kingdom",
            "Great Britain": "United Kingdom",
            
            // Czech Republic
            "Czech Republic": "Czech Republic",
            "Czechia": "Czech Republic",
            
            // Ivory Coast
            "Ivory Coast": "Côte d'Ivoire",
            "Côte d'Ivoire": "Côte d'Ivoire",
            
            // North Korea
            "North Korea": "Korea, Democratic People's Republic of",
            "Korea, Democratic People's Republic of": "Korea, Democratic People's Republic of",
            
            // South Korea
            "South Korea": "Korea, Republic of",
            "Korea, Republic of": "Korea, Republic of",
            
            // North Macedonia
            "North Macedonia": "Macedonia, The Former Yugoslav Republic of",
            "Macedonia, The Former Yugoslav Republic of": "Macedonia, The Former Yugoslav Republic of",
            
            // East Timor
            "East Timor": "Timor-Leste",
            "Timor-Leste": "Timor-Leste",
            
            // Eswatini
            "Eswatini": "Swaziland",
            "Swaziland": "Swaziland",
            
            // Palestine
            "Palestine": "Palestine, State of",
            "Palestine, State of": "Palestine, State of",
            
            // Vatican City
            "Vatican City": "Holy See (Vatican City State)",
            "Holy See (Vatican City State)": "Holy See (Vatican City State)",
            
            // São Tomé and Príncipe
            "São Tomé and Príncipe": "Sao Tome and Principe",
            "Sao Tome and Principe": "Sao Tome and Principe",
            
            // Saint Barthélemy
            "Saint Barthélemy (France)": "Saint Barthélemy",
            "Saint Barthélemy": "Saint Barthélemy",
            
            // Saint Martin
            "Saint Martin (France)": "Saint Martin (French part)",
            "Saint Martin (French part)": "Saint Martin (French part)",
            
            // Sint Maarten
            "Sint Maarten (NL)": "Sint Maarten (Dutch part)",
            "Sint Maarten (Dutch part)": "Sint Maarten (Dutch part)",
            
            // Bermuda
            "Bermuda (UK)": "Bermuda",
            "Bermuda": "Bermuda",
            
            // Jersey
            "Jersey (UK)": "Jersey",
            "Jersey": "Jersey",
            
            // Guernsey
            "Guernsey (UK)": "Guernsey",
            "Guernsey": "Guernsey",
            
            // Aruba
            "Aruba (NL)": "Aruba",
            "Aruba": "Aruba",
            
            // Curaçao
            "Curaçao (NL)": "Curaçao",
            "Curaçao": "Curaçao",
            
            // Puerto Rico
            "Puerto Rico (US)": "Puerto Rico",
            "Puerto Rico": "Puerto Rico",
            
            // Guam
            "Guam (US)": "Guam",
            "Guam": "Guam",
            
            // U.S. Virgin Islands
            "U.S. Virgin Islands (US)": "Virgin Islands, U.S.",
            "Virgin Islands, U.S.": "Virgin Islands, U.S.",
            
            // British Virgin Islands
            "British Virgin Islands (UK)": "Virgin Islands, British",
            "Virgin Islands, British": "Virgin Islands, British",
            
            // American Samoa
            "American Samoa (US)": "American Samoa",
            "American Samoa": "American Samoa",
            
            // Tokelau
            "Tokelau (New Zealand)": "Tokelau",
            "Tokelau": "Tokelau",
            
            // Anguilla
            "Anguilla (UK)": "Anguilla",
            "Anguilla": "Anguilla",
            
            // Kosovo
            "Kosovo": "Kosovo",
            
            // Isle of Man
            "Isle of Man": "Isle of Man",
            
            // Saint Pierre and Miquelon
            "Saint Pierre and Miquelon": "Saint Pierre and Miquelon",
            
            // Saint Helena, Ascension and Tristan da Cunha
            "Saint Helena, Ascension and Tristan da Cunha": "Saint Helena",
            "Saint Helena": "Saint Helena",
            
            // Niue
            "Niue": "Niue",
            
            // Montserrat
            "Montserrat": "Montserrat",
            
            // Western Sahara
            "Western Sahara (disputed)": "Western Sahara",
            "Western Sahara": "Western Sahara",
            
            // France variations
            "France (metropolitan)": "France",
            "France": "France",
            
            // Norway variations
            "Norway (mainland)": "Norway",
            "Norway": "Norway",
            
            // Denmark variations
            "Denmark Kingdom of Denmark": "Denmark",
            "Denmark": "Denmark",
            
            // Greenland
            "Greenland (Denmark)": "Greenland",
            "Greenland": "Greenland",
            
            // Macau
            "Macau (China)": "Macao",
            "Macao": "Macao",
            
            // Hong Kong
            "Hong Kong (China)": "Hong Kong",
            "Hong Kong": "Hong Kong",
            
            // Gibraltar
            "Gibraltar (UK)": "Gibraltar",
            "Gibraltar": "Gibraltar",
            
            // Taiwan
            "Taiwan": "Taiwan, Province of China",
            "Taiwan, Province of China": "Taiwan, Province of China",
            
            // South Sudan
            "South Sudan": "South Sudan",
            
            // Serbia
            "Serbia": "Serbia",
            
            // Bosnia and Herzegovina
            "Bosnia and Herzegovina": "Bosnia and Herzegovina",
            
            // Moldova
            "Moldova": "Moldova, Republic of",
            "Moldova, Republic of": "Moldova, Republic of",
            
            // Belarus
            "Belarus": "Belarus",
            
            // Ukraine
            "Ukraine": "Ukraine",
            
            // Russia
            "Russia": "Russian Federation",
            "Russian Federation": "Russian Federation",
            
            // China
            "China": "China",
            
            // India
            "India": "India",
            
            // Brazil
            "Brazil": "Brazil",
            
            // Australia
            "Australia": "Australia",
            
            // Canada
            "Canada": "Canada",
            
            // Argentina
            "Argentina": "Argentina",
            
            // Kazakhstan
            "Kazakhstan": "Kazakhstan",
            
            // Algeria
            "Algeria": "Algeria",
            
            // Saudi Arabia
            "Saudi Arabia": "Saudi Arabia",
            
            // Mexico
            "Mexico": "Mexico",
            
            // Indonesia
            "Indonesia": "Indonesia",
            
            // Sudan
            "Sudan": "Sudan",
            
            // Libya
            "Libya": "Libya",
            
            // Iran
            "Iran": "Iran, Islamic Republic of",
            "Iran, Islamic Republic of": "Iran, Islamic Republic of",
            
            // Mongolia
            "Mongolia": "Mongolia",
            
            // Peru
            "Peru": "Peru",
            
            // Chad
            "Chad": "Chad",
            
            // Niger
            "Niger": "Niger",
            
            // Angola
            "Angola": "Angola",
            
            // Mali
            "Mali": "Mali",
            
            // South Africa
            "South Africa": "South Africa",
            
            // Colombia
            "Colombia": "Colombia",
            
            // Ethiopia
            "Ethiopia": "Ethiopia",
            
            // Bolivia
            "Bolivia": "Bolivia, Plurinational State of",
            "Bolivia, Plurinational State of": "Bolivia, Plurinational State of",
            
            // Mauritania
            "Mauritania": "Mauritania",
            
            // Egypt
            "Egypt": "Egypt",
            
            // Tanzania
            "Tanzania": "Tanzania, United Republic of",
            "Tanzania, United Republic of": "Tanzania, United Republic of",
            
            // Nigeria
            "Nigeria": "Nigeria",
            
            // Venezuela
            "Venezuela": "Venezuela, Bolivarian Republic of",
            "Venezuela, Bolivarian Republic of": "Venezuela, Bolivarian Republic of",
            
            // Pakistan
            "Pakistan": "Pakistan",
            
            // Namibia
            "Namibia": "Namibia",
            
            // Mozambique
            "Mozambique": "Mozambique",
            
            // Turkey
            "Turkey": "Turkey",
            
            // Chile
            "Chile": "Chile",
            
            // Zambia
            "Zambia": "Zambia",
            
            // Myanmar
            "Myanmar": "Myanmar",
            
            // Afghanistan
            "Afghanistan": "Afghanistan",
            
            // France
            "France": "France",
            
            // Somalia
            "Somalia": "Somalia",
            
            // Central African Republic
            "Central African Republic": "Central African Republic",
            
            // Madagascar
            "Madagascar": "Madagascar",
            
            // Botswana
            "Botswana": "Botswana",
            
            // Kenya
            "Kenya": "Kenya",
            
            // Thailand
            "Thailand": "Thailand",
            
            // Spain
            "Spain": "Spain",
            
            // Turkmenistan
            "Turkmenistan": "Turkmenistan",
            
            // Cameroon
            "Cameroon": "Cameroon",
            
            // Papua New Guinea
            "Papua New Guinea": "Papua New Guinea",
            
            // Yemen
            "Yemen": "Yemen",
            
            // Sweden
            "Sweden": "Sweden",
            
            // Uzbekistan
            "Uzbekistan": "Uzbekistan",
            
            // Morocco
            "Morocco": "Morocco",
            
            // Iraq
            "Iraq": "Iraq",
            
            // Paraguay
            "Paraguay": "Paraguay",
            
            // Zimbabwe
            "Zimbabwe": "Zimbabwe",
            
            // Japan
            "Japan": "Japan",
            
            // Germany
            "Germany": "Germany",
            
            // Finland
            "Finland": "Finland",
            
            // Vietnam
            "Vietnam": "Viet Nam",
            "Viet Nam": "Viet Nam",
            
            // Malaysia
            "Malaysia": "Malaysia",
            
            // Poland
            "Poland": "Poland",
            
            // Oman
            "Oman": "Oman",
            
            // Italy
            "Italy": "Italy",
            
            // Philippines
            "Philippines": "Philippines",
            
            // Ecuador
            "Ecuador": "Ecuador",
            
            // Burkina Faso
            "Burkina Faso": "Burkina Faso",
            
            // New Zealand
            "New Zealand": "New Zealand",
            
            // Gabon
            "Gabon": "Gabon",
            
            // Guinea
            "Guinea": "Guinea",
            
            // Uganda
            "Uganda": "Uganda",
            
            // Ghana
            "Ghana": "Ghana",
            
            // Romania
            "Romania": "Romania",
            
            // Laos
            "Laos": "Lao People's Democratic Republic",
            "Lao People's Democratic Republic": "Lao People's Democratic Republic",
            
            // Guyana
            "Guyana": "Guyana",
            
            // Kyrgyzstan
            "Kyrgyzstan": "Kyrgyzstan",
            
            // Senegal
            "Senegal": "Senegal",
            
            // Syria
            "Syria": "Syrian Arab Republic",
            "Syrian Arab Republic": "Syrian Arab Republic",
            
            // Cambodia
            "Cambodia": "Cambodia",
            
            // Uruguay
            "Uruguay": "Uruguay",
            
            // Suriname
            "Suriname": "Suriname",
            
            // Tunisia
            "Tunisia": "Tunisia",
            
            // Bangladesh
            "Bangladesh": "Bangladesh",
            
            // Nepal
            "Nepal": "Nepal",
            
            // Tajikistan
            "Tajikistan": "Tajikistan",
            
            // Greece
            "Greece": "Greece",
            
            // Nicaragua
            "Nicaragua": "Nicaragua",
            
            // Malawi
            "Malawi": "Malawi",
            
            // Eritrea
            "Eritrea": "Eritrea",
            
            // Benin
            "Benin": "Benin",
            
            // Honduras
            "Honduras": "Honduras",
            
            // Liberia
            "Liberia": "Liberia",
            
            // Bulgaria
            "Bulgaria": "Bulgaria",
            
            // Cuba
            "Cuba": "Cuba",
            
            // Guatemala
            "Guatemala": "Guatemala",
            
            // Iceland
            "Iceland": "Iceland",
            
            // Hungary
            "Hungary": "Hungary",
            
            // Portugal
            "Portugal": "Portugal",
            
            // Jordan
            "Jordan": "Jordan",
            
            // Azerbaijan
            "Azerbaijan": "Azerbaijan",
            
            // Austria
            "Austria": "Austria",
            
            // United Arab Emirates
            "United Arab Emirates": "United Arab Emirates",
            
            // Panama
            "Panama": "Panama",
            
            // Sierra Leone
            "Sierra Leone": "Sierra Leone",
            
            // Ireland
            "Ireland": "Ireland",
            
            // Georgia
            "Georgia": "Georgia",
            
            // Sri Lanka
            "Sri Lanka": "Sri Lanka",
            
            // Lithuania
            "Lithuania": "Lithuania",
            
            // Latvia
            "Latvia": "Latvia",
            
            // Togo
            "Togo": "Togo",
            
            // Croatia
            "Croatia": "Croatia",
            
            // Costa Rica
            "Costa Rica": "Costa Rica",
            
            // Slovakia
            "Slovakia": "Slovakia",
            
            // Dominican Republic
            "Dominican Republic": "Dominican Republic",
            
            // Estonia
            "Estonia": "Estonia",
            
            // Netherlands
            "Netherlands": "Netherlands",
            
            // Switzerland
            "Switzerland": "Switzerland",
            
            // Bhutan
            "Bhutan": "Bhutan",
            
            // Guinea-Bissau
            "Guinea-Bissau": "Guinea-Bissau",
            
            // Belgium
            "Belgium": "Belgium",
            
            // Lesotho
            "Lesotho": "Lesotho",
            
            // Armenia
            "Armenia": "Armenia",
            
            // Solomon Islands
            "Solomon Islands": "Solomon Islands",
            
            // Albania
            "Albania": "Albania",
            
            // Equatorial Guinea
            "Equatorial Guinea": "Equatorial Guinea",
            
            // Burundi
            "Burundi": "Burundi",
            
            // Haiti
            "Haiti": "Haiti",
            
            // Rwanda
            "Rwanda": "Rwanda",
            
            // Djibouti
            "Djibouti": "Djibouti",
            
            // Belize
            "Belize": "Belize",
            
            // Israel
            "Israel": "Israel",
            
            // El Salvador
            "El Salvador": "El Salvador",
            
            // Slovenia
            "Slovenia": "Slovenia",
            
            // Fiji
            "Fiji": "Fiji",
            
            // Kuwait
            "Kuwait": "Kuwait",
            
            // Bahamas
            "Bahamas": "Bahamas",
            
            // Montenegro
            "Montenegro": "Montenegro",
            
            // Vanuatu
            "Vanuatu": "Vanuatu",
            
            // Qatar
            "Qatar": "Qatar",
            
            // Gambia
            "Gambia": "Gambia",
            
            // Jamaica
            "Jamaica": "Jamaica",
            
            // Lebanon
            "Lebanon": "Lebanon",
            
            // Cyprus
            "Cyprus": "Cyprus",
            
            // Brunei
            "Brunei": "Brunei Darussalam",
            "Brunei Darussalam": "Brunei Darussalam",
            
            // Trinidad and Tobago
            "Trinidad and Tobago": "Trinidad and Tobago",
            
            // Cape Verde
            "Cape Verde": "Cabo Verde",
            "Cabo Verde": "Cabo Verde",
            
            // Samoa
            "Samoa": "Samoa",
            
            // Luxembourg
            "Luxembourg": "Luxembourg",
            
            // Mauritius
            "Mauritius": "Mauritius",
            
            // Comoros
            "Comoros": "Comoros",
            
            // Kiribati
            "Kiribati": "Kiribati",
            
            // Bahrain
            "Bahrain": "Bahrain",
            
            // Dominica
            "Dominica": "Dominica",
            
            // Tonga
            "Tonga": "Tonga",
            
            // Singapore
            "Singapore": "Singapore",
            
            // Micronesia
            "Micronesia": "Micronesia, Federated States of",
            "Micronesia, Federated States of": "Micronesia, Federated States of",
            
            // Saint Lucia
            "Saint Lucia": "Saint Lucia",
            
            // Andorra
            "Andorra": "Andorra",
            
            // Palau
            "Palau": "Palau",
            
            // Seychelles
            "Seychelles": "Seychelles",
            
            // Antigua and Barbuda
            "Antigua and Barbuda": "Antigua and Barbuda",
            
            // Barbados
            "Barbados": "Barbados",
            
            // Saint Vincent and the Grenadines
            "Saint Vincent and the Grenadines": "Saint Vincent and the Grenadines",
            
            // Grenada
            "Grenada": "Grenada",
            
            // Malta
            "Malta": "Malta",
            
            // Maldives
            "Maldives": "Maldives",
            
            // Saint Kitts and Nevis
            "Saint Kitts and Nevis": "Saint Kitts and Nevis",
            
            // Marshall Islands
            "Marshall Islands": "Marshall Islands",
            
            // Liechtenstein
            "Liechtenstein": "Liechtenstein",
            
            // San Marino
            "San Marino": "San Marino",
            
            // Tuvalu
            "Tuvalu": "Tuvalu",
            
            // Nauru
            "Nauru": "Nauru",
            
            // Monaco
            "Monaco": "Monaco"
        };
    }
    
    // Map a country name from data file to Leaflet.js expected name
    mapCountryName(dataCountryName) {
        // First try exact match
        if (this.countryMappings[dataCountryName]) {
            return this.countryMappings[dataCountryName];
        }
        
        // Try case-insensitive match
        const lowerDataName = dataCountryName.toLowerCase();
        for (const [key, value] of Object.entries(this.countryMappings)) {
            if (key.toLowerCase() === lowerDataName) {
                return value;
            }
        }
        
        // If no match found, return original name (might work)
        console.warn(`No mapping found for country: "${dataCountryName}"`);
        return dataCountryName;
    }
    
    // Get all mapped country names
    getMappedCountryNames() {
        return Object.values(this.countryMappings);
    }
    
    // Debug: Log all mappings
    logMappings() {
        console.log('Country Mappings:', this.countryMappings);
    }
}

// Export for use in other scripts
window.CountryMapper = CountryMapper;
