// Country Name Mapping System
// Maps country names from data files to Leaflet.js GeoJSON country names

class CountryMapper {
    constructor() {
        this.countryMappings = {
            // Major countries with multiple variations
            "United States": "United States of America",
            "United States of America": "United States of America",
            "USA": "United States of America",
            "US": "United States of America",
            "America": "United States of America",
            
            // China variations
            "China": "China",
            "People's Republic of China": "China",
            "PRC": "China",
            
            // Russia variations
            "Russia": "Russia",
            "Russian Federation": "Russia",
            "Russian Federation (Europe)": "Russia",
            "Russian Federation (Asia)": "Russia",
            
                // Democratic Republic of the Congo variations
    "Democratic Republic of the Congo": "Democratic Republic of the Congo",
    "DR Congo": "Democratic Republic of the Congo",
    "Congo, Democratic Republic of the": "Democratic Republic of the Congo",
    "Congo-Brazzaville": "Democratic Republic of the Congo",
    
    // Republic of the Congo
    "Republic of the Congo": "Republic of the Congo",
    "Congo, Republic of the": "Republic of the Congo",
    "Congo": "Republic of the Congo",
    "Congo, Republic of": "Republic of the Congo",
    "Congo, Democratic Republic of": "Democratic Republic of the Congo",
    "St. Kitts & Nevis": "Saint Kitts and Nevis",
    "Yugoslavia": "Serbia",
    "Tibet": "China",
    "Russia/Soviet Union": "Russian Federation",
            
            // United Kingdom variations
            "United Kingdom": "United Kingdom of Great Britain and Northern Ireland",
            "UK": "United Kingdom of Great Britain and Northern Ireland",
            "Great Britain": "United Kingdom of Great Britain and Northern Ireland",
            "England": "United Kingdom of Great Britain and Northern Ireland",
            "Scotland": "United Kingdom of Great Britain and Northern Ireland",
            "Wales": "United Kingdom of Great Britain and Northern Ireland",
            "Northern Ireland": "United Kingdom of Great Britain and Northern Ireland",
            "United Kingdom (plus British Overseas Territories and Crown Dependencies)": "United Kingdom of Great Britain and Northern Ireland",
            
            // France variations
            "France": "France",
            "France (including French overseas departments, collectivities, and territories)": "France",
            
            // Czech Republic
            "Czech Republic": "Czechia",
            "Czechia": "Czechia",
            
            // Ivory Coast
            "Ivory Coast": "Côte d'Ivoire",
            "Côte d'Ivoire": "Côte d'Ivoire",
            "Cote d'Ivoire": "Côte d'Ivoire",
            
            // North Korea
            "North Korea": "North Korea",
            "Korea, Democratic People's Republic of": "North Korea",
            
            // South Korea
            "South Korea": "South Korea",
            "Korea, Republic of": "South Korea",
            
            // North Macedonia
            "North Macedonia": "North Macedonia",
            "Macedonia, The Former Yugoslav Republic of": "North Macedonia",
            
            // East Timor
            "East Timor": "Timor-Leste",
            "Timor-Leste": "Timor-Leste",
            
            // Eswatini
            "Eswatini": "Eswatini",
            "Swaziland": "Eswatini",
            "Eswatini (Swaziland)": "Eswatini",
            
            // Palestine
            "Palestine": "Palestine, State of",
            "Palestine, State of": "Palestine, State of",
            "West Bank Palestine (West Bank)": "Palestine, State of",
            "Palestine (Gaza Strip)": "Palestine, State of",
            
            // Vatican City
            "Vatican City": "Vatican",
            "Holy See (Vatican City State)": "Vatican",
            
            // São Tomé and Príncipe
            "São Tomé and Príncipe": "Sao Tome and Principe",
            "Sao Tome and Principe": "Sao Tome and Principe",
            
            // Additional critical mappings based on GeoJSON names
            "Bolivia": "Bolivia (Plurinational State of)",
            "Bosnia and Herzegovina": "Bosnia and Herzegovina",
            "Brunei": "Brunei",
            "Cape Verde": "Cabo Verde",
            "Congo, Republic of": "Congo",
            "Congo, Democratic Republic of": "Congo, Democratic Republic of the",
            "Iran": "Iran",
            "Laos": "Laos",
            "Moldova": "Moldova",
            "Syria": "Syria",
            "Tanzania": "Tanzania",
            "Venezuela": "Venezuela",
            "Vietnam": "Vietnam",
            
            // Saint Barthélemy
            "Saint Barthélemy (France)": "Saint Barthélemy",
            "Saint Barthélemy": "Saint Barthélemy",
            "Saint Barthelemy": "Saint Barthélemy",
            
            // Saint Martin
            "Saint Martin (France)": "Saint Martin (French part)",
            "Saint Martin (French part)": "Saint Martin (French part)",
            "Saint Martin": "Saint Martin (French part)",
            
            // Sint Maarten
            "Sint Maarten (NL)": "Sint Maarten (Dutch part)",
            "Sint Maarten (Dutch part)": "Sint Maarten (Dutch part)",
            "Sint Maarten": "Sint Maarten (Dutch part)",
            "Sint Maarten (Netherlands)": "Sint Maarten (Dutch part)",
            
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
            "Aruba (Netherlands)": "Aruba",
            
            // Curaçao
            "Curaçao (NL)": "Curaçao",
            "Curaçao": "Curaçao",
            "Curacao": "Curaçao",
            "Curaçao (Netherlands)": "Curaçao",
            
            // Puerto Rico
            "Puerto Rico (US)": "Puerto Rico",
            "Puerto Rico": "Puerto Rico",
            
            // US Virgin Islands
            "US Virgin Islands": "Virgin Islands, U.S.",
            "Virgin Islands, U.S.": "Virgin Islands, U.S.",
            "U.S. Virgin Islands": "Virgin Islands, U.S.",
            
            // British Virgin Islands
            "British Virgin Islands": "Virgin Islands, British",
            "Virgin Islands, British": "Virgin Islands, British",
            "British Virgin Islands (UK)": "Virgin Islands, British",
            
            // Cayman Islands
            "Cayman Islands": "Cayman Islands",
            "Cayman Islands (UK)": "Cayman Islands",
            
            // Turks and Caicos Islands
            "Turks and Caicos Islands": "Turks and Caicos Islands",
            "Turks and Caicos Islands (UK)": "Turks and Caicos Islands",
            
            // Northern Mariana Islands
            "Northern Mariana Islands": "Northern Mariana Islands",
            "Northern Mariana Islands (US)": "Northern Mariana Islands",
            
            // Faroe Islands
            "Faroe Islands": "Faroe Islands",
            "Faroe Islands (Denmark)": "Faroe Islands",
            
            // New Caledonia
            "New Caledonia": "New Caledonia",
            "New Caledonia (France)": "New Caledonia",
            
            // French Polynesia
            "French Polynesia": "French Polynesia",
            "French Polynesia (France)": "French Polynesia",
            
            // Wallis and Futuna
            "Wallis and Futuna": "Wallis and Futuna",
            "Wallis and Futuna (France)": "Wallis and Futuna",
            
            // Saint Pierre and Miquelon
            "Saint Pierre and Miquelon": "Saint Pierre and Miquelon",
            "Saint Pierre and Miquelon (France)": "Saint Pierre and Miquelon",
            
            // Saint Helena
            "Saint Helena, Ascension and Tristan da Cunha": "Saint Helena",
            "Saint Helena, Ascension, and Tristan da Cunha": "Saint Helena",
            "Saint Helena, Ascension and Tristan da Cunha (UK)": "Saint Helena",
            
            // Falkland Islands
            "Falkland Islands": "Falkland Islands (Malvinas)",
            "Falkland Islands (UK)": "Falkland Islands (Malvinas)",
            "Falkland Islands (Malvinas)": "Falkland Islands (Malvinas)",
            
            // Pitcairn Islands
            "Pitcairn Islands": "Pitcairn",
            "Pitcairn Islands (UK)": "Pitcairn",
            "Pitcairn": "Pitcairn",
            
            // Christmas Island
            "Christmas Island": "Christmas Island",
            "Christmas Island (Australia)": "Christmas Island",
            
            // Cocos Islands
            "Cocos (Keeling) Islands": "Cocos (Keeling) Islands",
            "Cocos (Keeling) Islands (Australia)": "Cocos (Keeling) Islands",
            
            // Norfolk Island
            "Norfolk Island": "Norfolk Island",
            "Norfolk Island (Australia)": "Norfolk Island",
            
            // Cook Islands
            "Cook Islands": "Cook Islands",
            
            // Tokelau
            "Tokelau": "Tokelau",
            "Tokelau (NZ)": "Tokelau",
            
            // Niue
            "Niue": "Niue",
            "Niue (NZ)": "Niue",
            
            // Montserrat
            "Montserrat": "Montserrat",
            "Montserrat (UK)": "Montserrat",
            
            // Anguilla
            "Anguilla": "Anguilla",
            "Anguilla (UK)": "Anguilla",
            
            // Isle of Man
            "Isle of Man": "Isle of Man",
            "Isle of Man (UK)": "Isle of Man",
            
            // Åland Islands
            "Åland": "Åland Islands",
            "Åland (Finland)": "Åland Islands",
            "Aland Islands": "Åland Islands",
            
            // Svalbard
            "Svalbard": "Svalbard and Jan Mayen",
            "Svalbard and Jan Mayen": "Svalbard and Jan Mayen",
            
            // Bouvet Island
            "Bouvet Island": "Bouvet Island",
            "Bouvet Island (Norway)": "Bouvet Island",
            
            // Heard and McDonald Islands
            "Heard and McDonald Islands": "Heard Island and McDonald Islands",
            "Heard Island and McDonald Islands": "Heard Island and McDonald Islands",
            
            // French Southern Territories
            "French Southern Territories": "French Southern Territories",
            "French Southern and Antarctic Lands": "French Southern Territories",
            
            // South Georgia
            "South Georgia and the South Sandwich Islands": "South Georgia and the South Sandwich Islands",
            "South Georgia": "South Georgia and the South Sandwich Islands",
            
            // Antarctica
            "Antarctica": "Antarctica",
            
            // Unrecognized territories (map to closest recognized)
            "Somaliland": "Somalia",
            "Abkhazia": "Georgia",
            "South Ossetia": "Georgia",
            "Transnistria": "Moldova",
            "Northern Cyprus": "Cyprus",
            "Kosovo": "Serbia",
            "Taiwan": "Taiwan",
            "Taiwan, Province of China": "Taiwan",
            
            // Macau
            "Macau": "Macao",
            "Macao": "Macao",
            
            // Hong Kong
            "Hong Kong": "Hong Kong",
            
            // The Bahamas
            "The Bahamas": "Bahamas",
            "Bahamas": "Bahamas",
            
            // Afghanistan variations
            "Afghanistan": "Afghanistan",
            
            // Hong Kong variations
            "Hong Kong (China)": "Hong Kong",
            "Hong Kong": "Hong Kong",
            
            // Macau variations
            "Macau (China)": "Macao",
            "Macau": "Macao",
            
            // New Caledonia variations
            "New Caledonia (FR)": "New Caledonia",
            "New Caledonia": "New Caledonia",
            
            // Faroe Islands variations
            "Faroe Islands (DK)": "Faroe Islands",
            "Faroe Islands": "Faroe Islands",
            
            // French Polynesia variations
            "French Polynesia (FR)": "French Polynesia",
            "French Polynesia": "French Polynesia",
            
            // Cocos Islands variations
            "Cocos Islands (AU)": "Cocos (Keeling) Islands",
            "Cocos (Keeling) Islands": "Cocos (Keeling) Islands",
            
            // Saint Helena variations
            "Saint Helena": "Saint Helena",
            
            // The Gambia
            "The Gambia": "Gambia",
            "Gambia": "Gambia",
            
            // Guinea Bissau
            "Guinea Bissau": "Guinea-Bissau",
            "Guinea-Bissau": "Guinea-Bissau",
            
            // Federated States of Micronesia
            "Federated States of Micronesia": "Micronesia",
            "Micronesia, Federated States of": "Micronesia",
            "Micronesia": "Micronesia",
            
            // Madeira
            "Madeira": "Portugal",
            
            // Denmark constituent country
            "Denmark (constituent country)": "Denmark",
            "Denmark Kingdom of Denmark": "Denmark",
            
            // Netherlands constituent country
            "Netherlands (constituent country)": "Netherlands",
            "Netherlands": "Netherlands",
            
            // Greenland
            "Greenland (Denmark)": "Greenland",
            "Greenland": "Greenland",
            "Greenland (DK)": "Greenland",
            
            // Western Sahara
            "Western Sahara (disputed)": "Western Sahara",
            "Western Sahara": "Western Sahara",
            "Western Sahara (MR)": "Western Sahara",
            "Sahrawi Arab Democratic Republic": "Western Sahara",
            
            // Cabo Verde / Cape Verde
            "Cabo Verde": "Cape Verde",
            "Cape Verde": "Cape Verde",
            
            // Germany
            "Germany": "Germany",
            
            // France metropolitan
            "France (metropolitan)": "France",
            "France (Metropolitan)": "France",
            
            // Norway mainland
            "Norway (mainland)": "Norway",
            
            // Guam
            "Guam": "Guam",
            "Guam (US)": "Guam",
            
            // Gibraltar
            "Gibraltar": "Gibraltar",
            "Gibraltar (UK)": "Gibraltar",
            
            // American Samoa
            "American Samoa": "American Samoa",
            "American Samoa (US)": "American Samoa",
            
            // U.S. Virgin Islands
            "U.S. Virgin Islands (US)": "Virgin Islands, U.S.",
            
            // Tokelau
            "Tokelau (New Zealand)": "Tokelau",
            
            // Caribbean Netherlands
            "Caribbean Netherlands (Netherlands)": "Netherlands",
            "Bonaire": "Netherlands",
            "Bonaire (NL)": "Netherlands",
            
            // China variations
            "China (PRC)": "China",
            
            // Korea variations
            "Korea (DPRK)": "North Korea",
            "Korea (ROK)": "South Korea",
            
            // Hong Kong variations
            "Hong Kong (CN)": "Hong Kong",
            
            // Macau variations
            "Macau (CN)": "Macao",
            
            // Scotland
            "Scotland (UK)": "United Kingdom",
            
            // United States Minor Outlying Islands
            "United States Minor Outlying Islands (US)": "United States of America",
            
            // Saint Pierre and Miquelon
            "Saint Pierre and Miquelon (FR)": "Saint Pierre and Miquelon",
            
            // Wallis and Futuna
            "Wallis and Futuna (FR)": "Wallis and Futuna",
            
            // French Southern and Antarctic Lands
            "French Southern and Antarctic Lands (FR)": "French Southern Territories",
            
            // British Indian Ocean Territory
            "British Indian Ocean Territory (UK)": "United Kingdom",
            
            // Christmas Island
            "Christmas Island (AU)": "Christmas Island",
            
            // Norfolk Island
            "Norfolk Island (AU)": "Norfolk Island",
            
            // Alderney
            "Alderney": "United Kingdom",
            
            // Ascension
            "Ascension": "Saint Helena",
            
            // Russia variations
            "Russia (Asia)": "Russian Federation",
            "Russia (Europe)": "Russian Federation",
            
            // Réunion
            "Réunion": "Réunion",
            "Réunion (France)": "Réunion",
            
            // French Guiana
            "French Guiana": "French Guiana",
            "French Guiana (France)": "French Guiana",
            
            // Martinique
            "Martinique": "Martinique",
            "Martinique (France)": "Martinique",
            
            // Guadeloupe
            "Guadeloupe": "Guadeloupe",
            "Guadeloupe (France)": "Guadeloupe",
            
            // Mayotte
            "Mayotte": "Mayotte",
            "Mayotte (France)": "Mayotte",
            
            // Akrotiri and Dhekelia
            "Akrotiri and Dhekelia": "Akrotiri and Dhekelia",
            "Akrotiri and Dhekelia (UK)": "Akrotiri and Dhekelia",
            
            // Afghanistan variations
            "Afghanistan (Islamic Emirate)": "Afghanistan",
            "Afghanistan (Islamic Republic)": "Afghanistan",
            
            // Spain Canarias
            "Spain (Canarias)": "Spain",
            
            // United States variations
            "United States (Alaska)": "United States of America",
            "United States (contiguous)": "United States of America",
            "United States (Hawaii)": "United States of America",
            
            // India/Pakistan disputed territory
            "India/Pakistan (disputed territory of Ladakh in Kashmir)": "India",
            "Pakistan/India (undemarcated Kashmir area)": "Pakistan",
            
            // European Union
            "European Union": "Germany", // Map to largest EU country
            
            // All other countries (exact matches)
            "Albania": "Albania",
            "Algeria": "Algeria",
            "Andorra": "Andorra",
            "Angola": "Angola",
            "Antigua and Barbuda": "Antigua and Barbuda",
            "Argentina": "Argentina",
            "Armenia": "Armenia",
            "Australia": "Australia",
            "Austria": "Austria",
            "Azerbaijan": "Azerbaijan",
            "Bahrain": "Bahrain",
            "Bangladesh": "Bangladesh",
            "Barbados": "Barbados",
            "Belarus": "Belarus",
            "Belgium": "Belgium",
            "Belize": "Belize",
            "Benin": "Benin",
            "Bhutan": "Bhutan",
            "Bolivia": "Bolivia",
            "Bosnia and Herzegovina": "Bosnia and Herzegovina",
            "Botswana": "Botswana",
            "Brazil": "Brazil",
            "Brunei": "Brunei",
            "Bulgaria": "Bulgaria",
            "Burkina Faso": "Burkina Faso",
            "Burundi": "Burundi",
            "Cambodia": "Cambodia",
            "Cameroon": "Cameroon",
            "Canada": "Canada",
            "Cape Verde": "Cape Verde",
            "Central African Republic": "Central African Republic",
            "Chad": "Chad",
            "Chile": "Chile",
            "Colombia": "Colombia",
            "Comoros": "Comoros",
            "Costa Rica": "Costa Rica",
            "Croatia": "Croatia",
            "Cuba": "Cuba",
            "Cyprus": "Cyprus",
            "Denmark": "Denmark",
            "Djibouti": "Djibouti",
            "Dominica": "Dominica",
            "Dominican Republic": "Dominican Republic",
            "Ecuador": "Ecuador",
            "Egypt": "Egypt",
            "El Salvador": "El Salvador",
            "Equatorial Guinea": "Equatorial Guinea",
            "Eritrea": "Eritrea",
            "Estonia": "Estonia",
            "Ethiopia": "Ethiopia",
            "Fiji": "Fiji",
            "Finland": "Finland",
            "Gabon": "Gabon",
            "Gambia": "Gambia",
            "Georgia": "Georgia",
            "Ghana": "Ghana",
            "Greece": "Greece",
            "Grenada": "Grenada",
            "Guatemala": "Guatemala",
            "Guinea": "Guinea",
            "Guinea-Bissau": "Guinea-Bissau",
            "Guyana": "Guyana",
            "Haiti": "Haiti",
            "Honduras": "Honduras",
            "Hungary": "Hungary",
            "Iceland": "Iceland",
            "India": "India",
            "Indonesia": "Indonesia",
            "Iran": "Iran",
            "Iran, Islamic Republic of": "Iran",
            "Iraq": "Iraq",
            "Ireland": "Ireland",
            "Israel": "Israel",
            "Italy": "Italy",
            "Jamaica": "Jamaica",
            "Japan": "Japan",
            "Jordan": "Jordan",
            "Kazakhstan": "Kazakhstan",
            "Kenya": "Kenya",
            "Kiribati": "Kiribati",
            "Kuwait": "Kuwait",
            "Kyrgyzstan": "Kyrgyzstan",
            "Laos": "Laos",
            "Lao People's Democratic Republic": "Laos",
            "Latvia": "Latvia",
            "Lebanon": "Lebanon",
            "Lesotho": "Lesotho",
            "Liberia": "Liberia",
            "Libya": "Libya",
            "Liechtenstein": "Liechtenstein",
            "Lithuania": "Lithuania",
            "Luxembourg": "Luxembourg",
            "Madagascar": "Madagascar",
            "Malawi": "Malawi",
            "Malaysia": "Malaysia",
            "Maldives": "Maldives",
            "Mali": "Mali",
            "Malta": "Malta",
            "Marshall Islands": "Marshall Islands",
            "Mauritania": "Mauritania",
            "Mauritius": "Mauritius",
            "Mexico": "Mexico",
            "Micronesia, Federated States of": "Micronesia",
            "Moldova": "Moldova",
            "Moldova, Republic of": "Moldova",
            "Monaco": "Monaco",
            "Mongolia": "Mongolia",
            "Montenegro": "Montenegro",
            "Morocco": "Morocco",
            "Mozambique": "Mozambique",
            "Myanmar": "Myanmar",
            "Namibia": "Namibia",
            "Nauru": "Nauru",
            "Nepal": "Nepal",
            "New Zealand": "New Zealand",
            "Nicaragua": "Nicaragua",
            "Niger": "Niger",
            "Nigeria": "Nigeria",
            "North Korea": "Korea, Democratic People's Republic of",
            "Norway": "Norway",
            "Oman": "Oman",
            "Pakistan": "Pakistan",
            "Palau": "Palau",
            "Panama": "Panama",
            "Papua New Guinea": "Papua New Guinea",
            "Paraguay": "Paraguay",
            "Peru": "Peru",
            "Philippines": "Philippines",
            "Poland": "Poland",
            "Portugal": "Portugal",
            "Qatar": "Qatar",
            "Romania": "Romania",
            "Rwanda": "Rwanda",
            "Saint Kitts and Nevis": "Saint Kitts and Nevis",
            "Saint Lucia": "Saint Lucia",
            "Saint Vincent and the Grenadines": "Saint Vincent and the Grenadines",
            "Samoa": "Samoa",
            "San Marino": "San Marino",
            "Sao Tome and Principe": "Sao Tome and Principe",
            "Saudi Arabia": "Saudi Arabia",
            "Senegal": "Senegal",
            "Serbia": "Serbia",
            "Seychelles": "Seychelles",
            "Sierra Leone": "Sierra Leone",
            "Singapore": "Singapore",
            "Slovakia": "Slovakia",
            "Slovenia": "Slovenia",
            "Solomon Islands": "Solomon Islands",
            "Somalia": "Somalia",
            "South Africa": "South Africa",
            "South Korea": "Korea, Republic of",
            "South Sudan": "South Sudan",
            "Spain": "Spain",
            "Sri Lanka": "Sri Lanka",
            "Sudan": "Sudan",
            "Suriname": "Suriname",
            "Sweden": "Sweden",
            "Switzerland": "Switzerland",
            "Syria": "Syria",
            "Syrian Arab Republic": "Syria",
            "Tajikistan": "Tajikistan",
            "Tanzania": "Tanzania",
            "Tanzania, United Republic of": "Tanzania",
            "Thailand": "Thailand",
            "Togo": "Togo",
            "Tonga": "Tonga",
            "Trinidad and Tobago": "Trinidad and Tobago",
            "Tunisia": "Tunisia",
            "Turkey": "Turkey",
            "Turkmenistan": "Turkmenistan",
            "Tuvalu": "Tuvalu",
            "Uganda": "Uganda",
            "Ukraine": "Ukraine",
            "United Arab Emirates": "United Arab Emirates",
            "Uruguay": "Uruguay",
            "Uzbekistan": "Uzbekistan",
            "Vanuatu": "Vanuatu",
            "Venezuela": "Venezuela",
            "Venezuela, Bolivarian Republic of": "Venezuela",
            "Vietnam": "Vietnam",
            "Viet Nam": "Vietnam",
            "Yemen": "Yemen",
            "Zambia": "Zambia",
            "Zimbabwe": "Zimbabwe"
        };
    }
    
    // Map a country name from data file to Leaflet.js expected name
    mapCountryName(dataCountryName) {
        // 1) Remove region qualifiers like " (Alaska)" / " (Asia)" / " (Hawaii)" etc.
        const cleaned = (dataCountryName || "")
            .replace(/\s*\([^)]*\)\s*$/g, "")
            .trim();
            
        // Debug logging for United States
        if (dataCountryName === 'United States' || cleaned === 'United States') {
            console.log('CountryMapper - Mapping United States:', {
                original: dataCountryName,
                cleaned: cleaned,
                directMapping: this.countryMappings[cleaned],
                hasMapping: !!this.countryMappings[cleaned],
                expectedOutput: 'United States of America',
                allUnitedMappings: Object.keys(this.countryMappings).filter(key => key.includes('United'))
            });
        }
        
        // First try exact match on cleaned name
        if (this.countryMappings[cleaned]) {
            return this.countryMappings[cleaned];
        }
        
        // Try case-insensitive match
        const lowerDataName = cleaned.toLowerCase();
        for (const [key, value] of Object.entries(this.countryMappings)) {
            if (key.toLowerCase() === lowerDataName) {
                return value;
            }
        }
        
        // Try partial matches for common patterns
        const partialMatches = {
            'united states': 'United States of America',
            'usa': 'United States of America',
            'us': 'United States of America',
            'america': 'United States of America',
            'russia': 'Russia',
            'china': 'China',
            'uk': 'United Kingdom',
            'great britain': 'United Kingdom',
            'england': 'United Kingdom',
            'scotland': 'United Kingdom',
            'wales': 'United Kingdom',
            'northern ireland': 'United Kingdom',
            'czech': 'Czech Republic',
            'czechia': 'Czech Republic',
            'ivory coast': 'Côte d\'Ivoire',
            'cote divoire': 'Côte d\'Ivoire',
            'north korea': 'North Korea',
            'south korea': 'South Korea',
            'korea': 'South Korea', // Default to South Korea
            'macedonia': 'North Macedonia',
            'east timor': 'Timor-Leste',
            'eswatini': 'Eswatini',
            'swaziland': 'Eswatini',
            'palestine': 'Palestine, State of',
            'vatican': 'Vatican',
            'sao tome': 'Sao Tome and Principe',
            'saint barthelemy': 'Saint Barthélemy',
            'saint martin': 'Saint Martin (French part)',
            'sint maarten': 'Sint Maarten (Dutch part)',
            'bermuda': 'Bermuda',
            'jersey': 'Jersey',
            'guernsey': 'Guernsey',
            'aruba': 'Aruba',
            'curacao': 'Curaçao',
            'puerto rico': 'Puerto Rico',
            'us virgin islands': 'Virgin Islands, U.S.',
            'british virgin islands': 'Virgin Islands, British',
            'cayman islands': 'Cayman Islands',
            'turks and caicos': 'Turks and Caicos Islands',
            'northern mariana': 'Northern Mariana Islands',
            'faroe': 'Faroe Islands',
            'new caledonia': 'New Caledonia',
            'french polynesia': 'French Polynesia',
            'wallis and futuna': 'Wallis and Futuna',
            'saint pierre': 'Saint Pierre and Miquelon',
            'saint helena': 'Saint Helena',
            'falkland': 'Falkland Islands (Malvinas)',
            'pitcairn': 'Pitcairn',
            'christmas island': 'Christmas Island',
            'cocos': 'Cocos (Keeling) Islands',
            'norfolk': 'Norfolk Island',
            'cook islands': 'Cook Islands',
            'tokelau': 'Tokelau',
            'niue': 'Niue',
            'montserrat': 'Montserrat',
            'anguilla': 'Anguilla',
            'isle of man': 'Isle of Man',
            'aland': 'Åland Islands',
            'svalbard': 'Svalbard and Jan Mayen',
            'bouvet': 'Bouvet Island',
            'heard': 'Heard Island and McDonald Islands',
            'french southern': 'French Southern Territories',
            'south georgia': 'South Georgia and the South Sandwich Islands',
            'antarctica': 'Antarctica',
            'macau': 'Macao',
            'hong kong': 'Hong Kong',
            'gambia': 'Gambia',
            'guinea bissau': 'Guinea-Bissau',
            'micronesia': 'Micronesia',
            'reunion': 'Réunion',
            'french guiana': 'French Guiana',
            'martinique': 'Martinique',
            'guadeloupe': 'Guadeloupe',
            'mayotte': 'Mayotte',
            'akrotiri': 'Akrotiri and Dhekelia',
            'afghanistan': 'Afghanistan',
            'spain canarias': 'Spain',
            'india pakistan': 'India',
            'pakistan india': 'Pakistan',
            'european union': 'Germany',
            'bahamas': 'Bahamas',
            'taiwan': 'Taiwan',
            'iran': 'Iran',
            'laos': 'Laos',
            'syria': 'Syria',
            'tanzania': 'Tanzania',
            'venezuela': 'Venezuela',
            'vietnam': 'Vietnam',
            'moldova': 'Moldova',
            'brunei': 'Brunei',
            'cape verde': 'Cabo Verde',
            'bolivia': 'Bolivia, Plurinational State of',
            // New additions for missing mappings
            'denmark kingdom': 'Denmark',
            'greenland': 'Greenland',
            'western sahara': 'Western Sahara',
            'cabo verde': 'Cape Verde',
            'germany': 'Germany',
            'netherlands': 'Netherlands',
            'france metropolitan': 'France',
            'norway mainland': 'Norway',
            'guam': 'Guam',
            'gibraltar': 'Gibraltar',
            'american samoa': 'American Samoa',
            'caribbean netherlands': 'Netherlands',
            'bonaire': 'Netherlands',
            'china prc': 'China',
            'korea dprk': 'North Korea',
            'korea rok': 'South Korea',
            'hong kong cn': 'Hong Kong',
            'macau cn': 'Macao',
            'scotland uk': 'United Kingdom',
            'united states minor': 'United States of America',
            'saint pierre miquelon': 'Saint Pierre and Miquelon',
            'wallis futuna': 'Wallis and Futuna',
            'french southern antarctic': 'French Southern Territories',
            'british indian ocean': 'United Kingdom',
            'christmas island au': 'Christmas Island',
            'norfolk island au': 'Norfolk Island',
            'alderney': 'United Kingdom',
            'ascension': 'Saint Helena',
            'russia asia': 'Russian Federation',
            'russia europe': 'Russian Federation',
            'sahrawi': 'Western Sahara',
            'congo republic': 'Republic of the Congo',
            'congo democratic': 'Democratic Republic of the Congo',
            'st kitts': 'Saint Kitts and Nevis',
            'st kitts nevis': 'Saint Kitts and Nevis',
            'yugoslavia': 'Serbia',
            'tibet': 'China',
            'russia soviet': 'Russian Federation'
        };
        
        for (const [pattern, value] of Object.entries(partialMatches)) {
            if (lowerDataName.includes(pattern)) {
                console.log(`Partial match found: "${dataCountryName}" -> "${value}"`);
                return value;
            }
        }
        
        // If no match found, log warning and return original name
        if (dataCountryName === 'United States') {
            console.error(`CRITICAL: United States mapping failed! Available mappings:`, Object.keys(this.countryMappings).filter(key => key.includes('United')));
        }
        console.warn(`No mapping found for country: "${dataCountryName}", using cleaned: "${cleaned}"`);
        return cleaned;
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
