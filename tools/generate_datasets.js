// Generator for accurate factual / categorical datasets.
// Data is authored by ISO 3166-1 alpha-3 code and resolved to the canonical
// GeoJSON country names used by the map, so every entry renders correctly.
//
// Run: node tools/generate_datasets.js
//
// Each dataset is written to data/<slug>.json in the schema the quiz loader
// expects: { title, description, unit, source, data: { "<Country>": { value, unit } } }

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const A3_NAME = JSON.parse(fs.readFileSync(path.join(__dirname, '.cache', 'a3_name.json'), 'utf8'));
// France and Norway carry ISO3 "-99" in this GeoJSON (Natural Earth quirk for
// states with overseas territories); map them to their canonical feature names.
A3_NAME.FRA = A3_NAME.FRA || 'France';
A3_NAME.NOR = A3_NAME.NOR || 'Norway';

const warnings = [];
function nameFor(code) {
  const n = A3_NAME[code];
  if (!n) warnings.push(`Unknown ISO3 code: ${code}`);
  return n;
}
const codes = (str) => str.trim().split(/\s+/).filter(Boolean);

// The 193 UN member states — used as the "universe" for default+exception datasets
// so maps colour sovereign states and not territories.
const SOVEREIGN = codes(`
AFG ALB DZA AND AGO ATG ARG ARM AUS AUT AZE BHS BHR BGD BRB BLR BEL BLZ BEN BTN
BOL BIH BWA BRA BRN BGR BFA BDI CPV KHM CMR CAN CAF TCD CHL CHN COL COM COG COD
CRI CIV HRV CUB CYP CZE DNK DJI DMA DOM ECU EGY SLV GNQ ERI EST SWZ ETH FJI FIN
FRA GAB GMB GEO DEU GHA GRC GRD GTM GIN GNB GUY HTI HND HUN ISL IND IDN IRN IRQ
IRL ISR ITA JAM JPN JOR KAZ KEN KIR PRK KOR KWT KGZ LAO LVA LBN LSO LBR LBY LIE
LTU LUX MDG MWI MYS MDV MLI MLT MHL MRT MUS MEX FSM MDA MCO MNG MNE MAR MOZ MMR
NAM NRU NPL NLD NZL NIC NER NGA MKD NOR OMN PAK PLW PAN PNG PRY PER PHL POL PRT
QAT ROU RUS RWA KNA LCA VCT WSM SMR STP SAU SEN SRB SYC SLE SGP SVK SVN SLB SOM
ZAF SSD ESP LKA SDN SUR SWE CHE SYR TJK TZA THA TLS TGO TON TTO TUN TUR TKM TUV
UGA UKR ARE GBR USA URY UZB VUT VEN VNM YEM ZMB ZWE
`);

const datasets = [];
function add(slug, title, description, source, unit, dataObj) {
  const data = {};
  for (const [code, value] of Object.entries(dataObj)) {
    const n = nameFor(code);
    if (n && value !== undefined && value !== null) data[n] = { value, unit };
  }
  datasets.push({ slug, json: { title, description, unit, source, data } });
}

// Membership: each listed country gets `label`; others are left blank (white).
function membership(slug, title, description, source, codeStr, label = 'Member', unit = 'membership') {
  const obj = {};
  codes(codeStr).forEach((c) => { obj[c] = label; });
  add(slug, title, description, source, unit, obj);
}

// Default + exceptions across the sovereign universe (categorical).
function defaultWithExceptions(slug, title, description, source, unit, defaultVal, exceptions) {
  const obj = {};
  SOVEREIGN.forEach((c) => { obj[c] = defaultVal; });
  for (const [val, codeStr] of Object.entries(exceptions)) {
    codes(codeStr).forEach((c) => { obj[c] = val; });
  }
  add(slug, title, description, source, unit, obj);
}

// Explicit per-country values (numeric or categorical).
function perCountry(slug, title, description, source, unit, map) {
  add(slug, title, description, source, unit, map);
}

const W = (p) => `https://en.wikipedia.org/wiki/${p}`;

/* ============================ MEMBERSHIP BLOCS ============================ */

membership('eu_member_states', 'European Union Member States',
  'The 27 member states of the European Union', W('Member_state_of_the_European_Union'),
  'AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE',
  'EU member');

membership('eurozone_members', 'Eurozone Members',
  'Countries that use the euro and are part of the eurozone', W('Eurozone'),
  'AUT BEL HRV CYP EST FIN FRA DEU GRC IRL ITA LVA LTU LUX MLT NLD PRT SVK SVN ESP',
  'Eurozone');

membership('schengen_area', 'Schengen Area',
  'Countries in the Schengen passport-free travel area', W('Schengen_Area'),
  'AUT BEL BGR HRV CZE DNK EST FIN FRA DEU GRC HUN ISL ITA LVA LIE LTU LUX MLT NLD NOR POL PRT ROU SVK SVN ESP SWE CHE',
  'Schengen');

membership('nato_members', 'NATO Member States',
  'The 32 member states of the North Atlantic Treaty Organization', W('Member_states_of_NATO'),
  'ALB BEL BGR CAN HRV CZE DNK EST FIN FRA DEU GRC HUN ISL ITA LVA LTU LUX MNE NLD MKD NOR POL PRT ROU SVK SVN ESP SWE TUR GBR USA',
  'NATO member');

membership('opec_members', 'OPEC Member States',
  'Members of the Organization of the Petroleum Exporting Countries (2024)', W('OPEC'),
  'DZA COG GNQ GAB IRN IRQ KWT LBY NGA SAU ARE VEN',
  'OPEC member');

membership('g7_members', 'G7 Members',
  'The Group of Seven advanced economies', W('G7'),
  'CAN FRA DEU ITA JPN GBR USA', 'G7 member');

membership('g20_members', 'G20 Member Countries',
  'The 19 member countries of the G20 (excluding the EU and African Union blocs)', W('G20'),
  'ARG AUS BRA CAN CHN FRA DEU IND IDN ITA JPN MEX RUS SAU ZAF KOR TUR GBR USA',
  'G20 member');

membership('brics_founding', 'BRICS Founding Members',
  'The five founding members of BRICS', W('BRICS'),
  'BRA RUS IND CHN ZAF', 'BRICS member');

membership('oecd_members', 'OECD Member States',
  'Members of the Organisation for Economic Co-operation and Development', W('OECD'),
  'AUS AUT BEL CAN CHL COL CRI CZE DNK EST FIN FRA DEU GRC HUN ISL IRL ISR ITA JPN KOR LVA LTU LUX MEX NLD NZL NOR POL PRT SVK SVN ESP SWE CHE TUR GBR USA',
  'OECD member');

membership('asean_members', 'ASEAN Member States',
  'Members of the Association of Southeast Asian Nations', W('ASEAN'),
  'BRN KHM IDN LAO MYS MMR PHL SGP THA VNM', 'ASEAN member');

membership('arab_league', 'Arab League Members',
  'The 22 member states of the Arab League', W('Arab_League'),
  'DZA BHR COM DJI EGY IRQ JOR KWT LBN LBY MRT MAR OMN PSE QAT SAU SOM SDN SYR TUN ARE YEM',
  'Arab League');

membership('gcc_members', 'Gulf Cooperation Council',
  'Members of the Gulf Cooperation Council', W('Gulf_Cooperation_Council'),
  'BHR KWT OMN QAT SAU ARE', 'GCC member');

membership('nordic_countries', 'Nordic Countries',
  'The five Nordic countries', W('Nordic_countries'),
  'DNK FIN ISL NOR SWE', 'Nordic');

membership('baltic_states', 'Baltic States',
  'The three Baltic states', W('Baltic_states'),
  'EST LVA LTU', 'Baltic state');

membership('benelux', 'Benelux',
  'The Benelux political-economic union', W('Benelux'),
  'BEL NLD LUX', 'Benelux');

membership('visegrad_group', 'Visegrád Group',
  'The Visegrád Group (V4) of Central European states', W('Visegr%C3%A1d_Group'),
  'CZE HUN POL SVK', 'V4 member');

membership('five_eyes', 'Five Eyes Alliance',
  'The Five Eyes intelligence alliance', W('Five_Eyes'),
  'AUS CAN NZL GBR USA', 'Five Eyes');

membership('efta_members', 'EFTA Members',
  'Members of the European Free Trade Association', W('European_Free_Trade_Association'),
  'ISL LIE NOR CHE', 'EFTA member');

membership('usmca', 'USMCA (North American Trade)',
  'Parties to the United States–Mexico–Canada Agreement', W('Agreement_between_the_United_States_of_America,_the_United_Mexican_States,_and_Canada'),
  'CAN MEX USA', 'USMCA');

membership('mercosur', 'Mercosur Members',
  'Full members of the Southern Common Market', W('Mercosur'),
  'ARG BRA PRY URY BOL', 'Mercosur');

membership('andean_community', 'Andean Community',
  'Members of the Andean Community (CAN)', W('Andean_Community'),
  'BOL COL ECU PER', 'Andean');

membership('caricom', 'CARICOM Members',
  'Full members of the Caribbean Community', W('CARICOM'),
  'ATG BHS BRB BLZ DMA GRD GUY HTI JAM MSR KNA LCA VCT SUR TTO', 'CARICOM');

membership('cis_members', 'Commonwealth of Independent States',
  'Member states of the Commonwealth of Independent States', W('Commonwealth_of_Independent_States'),
  'ARM AZE BLR KAZ KGZ RUS TJK UZB', 'CIS member');

membership('eaeu', 'Eurasian Economic Union',
  'Members of the Eurasian Economic Union', W('Eurasian_Economic_Union'),
  'ARM BLR KAZ KGZ RUS', 'EAEU member');

membership('turkic_states', 'Organization of Turkic States',
  'Members of the Organization of Turkic States', W('Organization_of_Turkic_States'),
  'AZE KAZ KGZ TUR UZB', 'Turkic state');

membership('sco_members', 'Shanghai Cooperation Organisation',
  'Member states of the Shanghai Cooperation Organisation', W('Shanghai_Cooperation_Organisation'),
  'CHN IND IRN KAZ KGZ PAK RUS TJK UZB BLR', 'SCO member');

membership('un_founding_members', 'United Nations Founding Members (1945)',
  'The 51 original member states of the United Nations', W('Member_states_of_the_United_Nations'),
  'ARG AUS BEL BOL BRA BLR CAN CHL CHN COL CRI CUB CZE DNK DOM ECU EGY SLV ETH FRA GRC GTM HTI HND IND IRN IRQ LBN LBR LUX MEX NLD NZL NIC NOR PAN PRY PER PHL POL SAU ZAF SYR TUR UKR GBR USA URY VEN RUS SRB',
  'Founding member');

membership('council_of_europe', 'Council of Europe',
  'Member states of the Council of Europe', W('Member_states_of_the_Council_of_Europe'),
  'ALB AND ARM AUT AZE BEL BIH BGR HRV CYP CZE DNK EST FIN FRA GEO DEU GRC HUN ISL IRL ITA LVA LIE LTU LUX MLT MDA MCO MNE NLD MKD NOR POL PRT ROU SMR SRB SVK SVN ESP SWE CHE TUR UKR GBR',
  'Member');

membership('african_union', 'African Union',
  'Member states of the African Union', W('African_Union'),
  'DZA AGO BEN BWA BFA BDI CMR CPV CAF TCD COM COG COD CIV DJI EGY GNQ ERI SWZ ETH GAB GMB GHA GIN GNB KEN LSO LBR LBY MDG MWI MLI MRT MUS MAR MOZ NAM NER NGA RWA STP SEN SYC SLE SOM ZAF SSD SDN TZA TGO TUN UGA ZMB ZWE',
  'AU member');

membership('oas_members', 'Organization of American States',
  'Member states of the Organization of American States', W('Organization_of_American_States'),
  'ATG ARG BHS BRB BLZ BOL BRA CAN CHL COL CRI CUB DMA DOM ECU SLV GRD GTM GUY HTI HND JAM MEX NIC PAN PRY PER KNA LCA VCT SUR TTO USA URY VEN',
  'OAS member');

membership('ecowas', 'ECOWAS (West Africa)',
  'Members of the Economic Community of West African States', W('Economic_Community_of_West_African_States'),
  'BEN BFA CPV CIV GMB GHA GIN GNB LBR MLI NER NGA SEN SLE TGO', 'ECOWAS');

membership('east_african_community', 'East African Community',
  'Member states of the East African Community', W('East_African_Community'),
  'BDI COD KEN RWA SSD TZA UGA SOM', 'EAC member');

membership('sadc', 'Southern African Development Community',
  'Members of the Southern African Development Community', W('Southern_African_Development_Community'),
  'AGO BWA COM COD SWZ LSO MDG MWI MUS MOZ NAM SYC ZAF TZA ZMB ZWE', 'SADC member');

membership('arab_maghreb_union', 'Arab Maghreb Union',
  'Members of the Arab Maghreb Union', W('Arab_Maghreb_Union'),
  'DZA LBY MRT MAR TUN', 'Maghreb');

membership('oic_members', 'Organisation of Islamic Cooperation',
  'Member states of the Organisation of Islamic Cooperation', W('Organisation_of_Islamic_Cooperation'),
  'AFG ALB DZA AZE BHR BGD BEN BRN BFA CMR TCD COM CIV DJI EGY GAB GMB GIN GNB GUY IDN IRN IRQ JOR KAZ KWT KGZ LBN LBY MYS MDV MLI MRT MAR MOZ NER NGA OMN PAK PSE QAT SAU SEN SLE SOM SDN SUR SYR TJK TGO TUN TUR TKM UGA ARE UZB YEM',
  'OIC member');

membership('pacific_islands_forum', 'Pacific Islands Forum',
  'Members of the Pacific Islands Forum', W('Pacific_Islands_Forum'),
  'AUS COK FJI KIR MHL FSM NRU NZL PLW PNG WSM SLB TON TUV VUT NIU', 'PIF member');

membership('commonwealth_realms', 'Commonwealth Realms',
  'Countries with King Charles III as head of state', W('Commonwealth_realm'),
  'ATG AUS BHS BLZ CAN GRD JAM NZL PNG KNA LCA VCT SLB TUV GBR', 'Realm');

membership('cfa_franc_zone', 'CFA Franc Zone',
  'African countries using the CFA franc', W('CFA_franc'),
  'BEN BFA CIV GNB MLI NER SEN TGO CMR CAF TCD COG GNQ GAB', 'CFA franc');

/* ============================ ACCESSION YEARS (numeric) ============================ */

perCountry('eu_accession_year', 'Year Joined the European Union',
  'The year each current member state joined the EU (or its predecessors)', W('Enlargement_of_the_European_Union'),
  'year', {
    BEL: 1958, FRA: 1958, DEU: 1958, ITA: 1958, LUX: 1958, NLD: 1958,
    DNK: 1973, IRL: 1973, GRC: 1981, ESP: 1986, PRT: 1986,
    AUT: 1995, FIN: 1995, SWE: 1995,
    CYP: 2004, CZE: 2004, EST: 2004, HUN: 2004, LVA: 2004, LTU: 2004,
    MLT: 2004, POL: 2004, SVK: 2004, SVN: 2004,
    BGR: 2007, ROU: 2007, HRV: 2013,
  });

perCountry('nato_accession_year', 'Year Joined NATO',
  'The year each member state joined the North Atlantic Treaty Organization', W('Enlargement_of_NATO'),
  'year', {
    BEL: 1949, CAN: 1949, DNK: 1949, FRA: 1949, ISL: 1949, ITA: 1949,
    LUX: 1949, NLD: 1949, NOR: 1949, PRT: 1949, GBR: 1949, USA: 1949,
    GRC: 1952, TUR: 1952, DEU: 1955, ESP: 1982,
    CZE: 1999, HUN: 1999, POL: 1999,
    BGR: 2004, EST: 2004, LVA: 2004, LTU: 2004, ROU: 2004, SVK: 2004, SVN: 2004,
    ALB: 2009, HRV: 2009, MNE: 2017, MKD: 2020, FIN: 2023, SWE: 2024,
  });

perCountry('euro_adoption_year', 'Year the Euro Was Adopted',
  'The year each eurozone country adopted the euro', W('Eurozone'),
  'year', {
    AUT: 1999, BEL: 1999, FIN: 1999, FRA: 1999, DEU: 1999, IRL: 1999,
    ITA: 1999, LUX: 1999, NLD: 1999, PRT: 1999, ESP: 1999,
    GRC: 2001, SVN: 2007, CYP: 2008, MLT: 2008, SVK: 2009,
    EST: 2011, LVA: 2014, LTU: 2015, HRV: 2023,
  });

perCountry('same_sex_marriage_year', 'Year Same-Sex Marriage Was Legalized',
  'The year same-sex marriage became legal nationwide', W('Same-sex_marriage'),
  'year', {
    NLD: 2001, BEL: 2003, ESP: 2005, CAN: 2005, ZAF: 2006, NOR: 2009, SWE: 2009,
    PRT: 2010, ISL: 2010, ARG: 2010, DNK: 2012, BRA: 2013, FRA: 2013, URY: 2013,
    NZL: 2013, GBR: 2014, LUX: 2015, USA: 2015, IRL: 2015, COL: 2016, FIN: 2017,
    MLT: 2017, DEU: 2017, AUS: 2017, AUT: 2019, TWN: 2019, ECU: 2019, CRI: 2020,
    CHE: 2022, CHL: 2022, SVN: 2022, CUB: 2022, AND: 2023, EST: 2024, GRC: 2024,
    LIE: 2024, THA: 2025,
  });

/* ============================ STANDARDS / EVERYDAY FACTS ============================ */

defaultWithExceptions('driving_side', 'Driving Side',
  'Which side of the road traffic drives on', W('Left-_and_right-hand_traffic'),
  'side', 'Right-hand', {
    'Left-hand': `GBR IRL CYP MLT IND PAK BGD NPL LKA BTN THA IDN MYS SGP BRN JPN TLS
      AUS NZL PNG FJI SLB TON WSM KIR NRU TUV
      ZAF NAM BWA ZWE ZMB MOZ MWI LSO SWZ KEN UGA TZA MUS SYC
      JAM BHS BRB TTO GUY SUR ATG DMA GRD KNA LCA VCT`,
  });

defaultWithExceptions('measurement_system', 'Measurement System',
  'The primary system of measurement used officially', W('Metrication'),
  'system', 'Metric', {
    'Imperial / US customary': 'USA LBR MMR',
  });

defaultWithExceptions('mains_frequency', 'Mains Electricity Frequency',
  'The frequency of the domestic electrical supply', W('Mains_electricity_by_country'),
  'frequency', '50 Hz', {
    '60 Hz': `USA CAN MEX BRA COL VEN PER ECU GTM HND NIC CRI PAN SLV DOM CUB
      KOR TWN PHL SAU`,
    '50/60 Hz': 'JPN',
  });

defaultWithExceptions('mains_voltage', 'Mains Electricity Voltage',
  'The nominal domestic supply voltage', W('Mains_electricity_by_country'),
  'voltage', '220–240 V', {
    '100–127 V': 'USA CAN MEX JPN BRA COL VEN ECU GTM HND NIC CRI PAN SLV CUB DOM TWN',
  });

defaultWithExceptions('temperature_unit', 'Everyday Temperature Unit',
  'The temperature scale used in everyday life', W('Fahrenheit'),
  'scale', 'Celsius', {
    Fahrenheit: 'USA BHS BLZ PLW FSM MHL',
  });

defaultWithExceptions('paper_size_standard', 'Standard Paper Size',
  'The everyday office paper size standard', W('Paper_size'),
  'standard', 'A4 (ISO 216)', {
    'US Letter': 'USA CAN MEX PHL CHL COL CRI DOM PAN VEN',
  });

defaultWithExceptions('first_day_of_week', 'First Day of the Week',
  'The day considered the first of the week on calendars', W('Week#Week_numbering'),
  'day', 'Monday', {
    Sunday: `USA CAN JPN BRA MEX PHL ZAF KOR IND CHN ISR COL VEN PER ARG HKG TWN
      EGY JAM`,
    Saturday: 'DJI IRN SOM',
  });

defaultWithExceptions('date_format', 'Primary Date Format',
  'The most common way dates are written', W('Date_format_by_country'),
  'format', 'DD/MM/YYYY', {
    'MM/DD/YYYY': 'USA',
    'YYYY/MM/DD': 'CHN JPN KOR PRK MNG IRN LTU HUN TWN',
  });

defaultWithExceptions('decimal_separator', 'Decimal Separator',
  'The symbol used to separate the integer and fractional parts of a number', W('Decimal_separator'),
  'separator', 'Comma (3,14)', {
    'Point (3.14)': `USA GBR IRL AUS NZL CAN IND PAK BGD LKA NPL PHL MYS SGP THA
      JPN CHN KOR ISR MEX EGY NGA KEN`,
  });

/* ============================ SPORT / CULTURE ============================ */

defaultWithExceptions('fifa_confederation', 'FIFA Confederation',
  'The continental football confederation each country belongs to', W('List_of_football_associations'),
  'confederation', 'CAF (Africa)', {
    'UEFA (Europe)': `ALB AND ARM AUT AZE BEL BIH BGR HRV CYP CZE DNK EST FIN FRA GEO
      DEU GRC HUN ISL IRL ISR ITA KAZ LVA LIE LTU LUX MLT MDA MCO MNE NLD MKD NOR POL
      PRT ROU RUS SMR SRB SVK SVN ESP SWE CHE TUR UKR GBR`,
    'CONMEBOL (South America)': 'ARG BOL BRA CHL COL ECU PRY PER URY VEN',
    'CONCACAF (N./C. America)': `ATG BHS BRB BLZ CAN CRI CUB DMA DOM SLV GRD GTM GUY
      HTI HND JAM MEX NIC PAN KNA LCA VCT SUR TTO USA`,
    'AFC (Asia)': `AFG AUS BHR BGD BTN BRN KHM CHN IND IDN IRN IRQ JPN JOR KWT KGZ LAO
      LBN MYS MDV MNG MMR NPL PRK OMN PAK PSE PHL QAT SAU SGP KOR LKA SYR TJK THA TLS
      TKM ARE UZB VNM YEM`,
    'OFC (Oceania)': 'FJI NZL PNG SLB TON VUT WSM KIR',
  });

membership('fifa_world_cup_hosts', 'FIFA World Cup Host Nations',
  'Countries that have hosted the FIFA World Cup', W('FIFA_World_Cup'),
  'URY ITA FRA BRA CHE SWE CHL GBR MEX DEU ARG ESP USA KOR JPN ZAF RUS QAT',
  'Host');

membership('winter_olympics_hosts', 'Winter Olympics Host Nations',
  'Countries that have hosted the Winter Olympic Games', W('Winter_Olympic_Games'),
  'FRA CHE USA DEU NOR ITA AUT JPN BIH CAN RUS KOR CHN', 'Host');

membership('test_cricket_nations', 'Test Cricket Nations',
  'Countries with full International Cricket Council membership (Test status)', W('Test_cricket'),
  'AFG AUS BGD IND IRL NZL PAK ZAF LKA WSM ZWE GBR', 'Test nation');

membership('orbital_launch_capability', 'Independent Orbital Launch Capability',
  'Countries that have launched a satellite into orbit using their own rockets', W('Timeline_of_first_orbital_launches_by_country'),
  'RUS USA FRA JPN CHN GBR IND ISR IRN PRK KOR', 'Spacefaring');

/* ============================ GEOGRAPHY ============================ */

membership('equator_countries', 'Countries on the Equator',
  'Countries that the Equator passes through', W('Equator'),
  'ECU COL BRA STP GAB COG COD UGA KEN SOM IDN MDV KIR', 'On Equator');

membership('prime_meridian_countries', 'Countries on the Prime Meridian',
  'Countries that the Prime Meridian (0° longitude) passes through', W('Prime_meridian_(Greenwich)'),
  'GBR FRA ESP DZA MLI BFA TGO GHA', 'On Meridian');

membership('tropic_of_cancer', 'Countries on the Tropic of Cancer',
  'Countries the Tropic of Cancer passes through', W('Tropic_of_Cancer'),
  'MEX BHS EGY LBY DZA MLI MRT NER TCD SAU ARE OMN IND BGD MMR CHN TWN', 'Tropic of Cancer');

membership('tropic_of_capricorn', 'Countries on the Tropic of Capricorn',
  'Countries the Tropic of Capricorn passes through', W('Tropic_of_Capricorn'),
  'CHL ARG PRY BRA NAM BWA ZAF MOZ MDG AUS', 'Tropic of Capricorn');

membership('southern_hemisphere', 'Countries Entirely in the Southern Hemisphere',
  'Sovereign states located completely south of the Equator', W('Southern_Hemisphere'),
  `ARG CHL URY PRY BOL AUS NZL ZAF NAM BWA ZWE ZMB MWI LSO SWZ MDG AGO MOZ
   FJI PNG SLB VUT WSM TON TUV NRU`, 'Southern');

membership('transcontinental_countries', 'Transcontinental Countries',
  'Countries whose territory spans more than one continent', W('Transcontinental_country'),
  'RUS TUR KAZ EGY AZE GEO ESP PRT FRA NLD GBR USA', 'Transcontinental');

membership('mediterranean_coast', 'Mediterranean Sea Coastline',
  'Countries with a coastline on the Mediterranean Sea', W('Mediterranean_Sea'),
  'ESP FRA MCO ITA SVN HRV BIH MNE ALB GRC TUR CYP SYR LBN ISR EGY LBY TUN DZA MAR MLT',
  'Mediterranean');

membership('baltic_sea_coast', 'Baltic Sea Coastline',
  'Countries with a coastline on the Baltic Sea', W('Baltic_Sea'),
  'SWE FIN EST LVA LTU POL DEU DNK RUS', 'Baltic Sea');

membership('black_sea_coast', 'Black Sea Coastline',
  'Countries with a coastline on the Black Sea', W('Black_Sea'),
  'TUR BGR ROU UKR RUS GEO', 'Black Sea');

membership('red_sea_coast', 'Red Sea Coastline',
  'Countries with a coastline on the Red Sea', W('Red_Sea'),
  'EGY SDN ERI DJI SAU YEM ISR JOR', 'Red Sea');

membership('caspian_sea_coast', 'Caspian Sea Coastline',
  'Countries bordering the Caspian Sea', W('Caspian_Sea'),
  'RUS KAZ TKM IRN AZE', 'Caspian Sea');

membership('persian_gulf_coast', 'Persian Gulf Coastline',
  'Countries with a coastline on the Persian Gulf', W('Persian_Gulf'),
  'IRN IRQ KWT SAU BHR QAT ARE OMN', 'Persian Gulf');

membership('north_sea_coast', 'North Sea Coastline',
  'Countries with a coastline on the North Sea', W('North_Sea'),
  'GBR NOR DNK DEU NLD BEL FRA', 'North Sea');

membership('sahara_countries', 'Countries in the Sahara',
  'Countries that contain part of the Sahara Desert', W('Sahara'),
  'DZA TCD EGY LBY MLI MRT MAR NER SDN TUN', 'Sahara');

/* Borders of major countries */
membership('borders_russia', 'Countries Bordering Russia',
  'Countries that share a land border with Russia', W('Borders_of_Russia'),
  'NOR FIN EST LVA LTU POL BLR UKR GEO AZE KAZ CHN MNG PRK', 'Borders Russia');

membership('borders_china', 'Countries Bordering China',
  'Countries that share a land border with China', W('Borders_of_China'),
  'MNG RUS PRK VNM LAO MMR IND BTN NPL PAK AFG TJK KGZ KAZ', 'Borders China');

membership('borders_brazil', 'Countries Bordering Brazil',
  'Countries that share a land border with Brazil', W('Geography_of_Brazil'),
  'URY ARG PRY BOL PER COL VEN GUY SUR', 'Borders Brazil');

membership('borders_germany', 'Countries Bordering Germany',
  'Countries that share a land border with Germany', W('Geography_of_Germany'),
  'DNK POL CZE AUT CHE FRA LUX BEL NLD', 'Borders Germany');

membership('borders_france', 'Countries Bordering France (Europe)',
  'European countries that share a land border with France', W('Geography_of_France'),
  'BEL LUX DEU CHE ITA MCO ESP AND', 'Borders France');

membership('borders_south_africa', 'Countries Bordering South Africa',
  'Countries that share a land border with South Africa', W('Geography_of_South_Africa'),
  'NAM BWA ZWE MOZ SWZ LSO', 'Borders South Africa');

membership('borders_india', 'Countries Bordering India',
  'Countries that share a land border with India', W('Borders_of_India'),
  'PAK CHN NPL BTN BGD MMR', 'Borders India');

/* ============================ CURRENCY ============================ */

membership('uses_euro', 'Countries Using the Euro',
  'Countries and microstates that use the euro as their official currency', W('Euro'),
  'AUT BEL HRV CYP EST FIN FRA DEU GRC IRL ITA LVA LTU LUX MLT NLD PRT SVK SVN ESP MCO SMR VAT AND MNE',
  'Uses euro');

membership('uses_us_dollar', 'Countries Using the US Dollar',
  'Countries that use the US dollar as official legal tender', W('United_States_dollar'),
  'USA ECU SLV PAN TLS MHL FSM PLW', 'Uses USD');

/* ============================ LANGUAGE ============================ */

membership('spanish_official', 'Spanish as an Official Language',
  'Countries where Spanish is an official language', W('Geographical_distribution_of_Spanish'),
  'ESP MEX COL ARG PER VEN CHL ECU GTM CUB BOL DOM HND PRY SLV NIC CRI PAN URY GNQ',
  'Spanish');

membership('portuguese_official', 'Portuguese as an Official Language',
  'Countries where Portuguese is an official language', W('Portuguese_language'),
  'PRT BRA AGO MOZ GNB CPV STP TLS GNQ', 'Portuguese');

membership('arabic_official', 'Arabic as an Official Language',
  'Countries where Arabic is an official language', W('Arabic'),
  'DZA BHR TCD COM DJI EGY ERI IRQ JOR KWT LBN LBY MRT MAR OMN PSE QAT SAU SOM SDN SYR TUN ARE YEM',
  'Arabic');

membership('german_official', 'German as an Official Language',
  'Countries where German is an official language', W('German_language'),
  'DEU AUT CHE LIE LUX BEL', 'German');

membership('dutch_official', 'Dutch as an Official Language',
  'Countries where Dutch is an official language', W('Dutch_language'),
  'NLD BEL SUR', 'Dutch');

/* ============================ REGIONAL CLASSIFICATIONS ============================ */

defaultWithExceptions('un_regional_group', 'United Nations Regional Group',
  'The regional voting group each country belongs to at the UN', W('United_Nations_Regional_Groups'),
  'group', 'African Group', {
    'Asia-Pacific Group': `AFG BHR BGD BTN BRN KHM CHN CYP PRK FJI IND IDN IRN IRQ JPN
      JOR KAZ KIR KWT KGZ LAO LBN MYS MDV MHL FSM MNG MMR NRU NPL OMN PAK PLW PNG PHL
      QAT KOR SAU SGP SLB LKA SYR TJK THA TLS TON TKM TUV ARE UZB VUT VNM WSM YEM`,
    'Eastern European Group': `ALB ARM AZE BLR BIH BGR HRV CZE EST GEO HUN LVA LTU MDA
      MNE MKD POL ROU RUS SRB SVK SVN UKR`,
    'Latin American & Caribbean': `ATG ARG BHS BRB BLZ BOL BRA CHL COL CRI CUB DMA DOM
      ECU SLV GRD GTM GUY HTI HND JAM MEX NIC PAN PRY PER KNA LCA VCT SUR TTO URY VEN`,
    'Western European & Others': `AND AUT BEL CAN DNK FIN FRA DEU GRC ISL IRL ISR ITA
      LIE LUX MLT MCO NLD NZL NOR PRT SMR ESP SWE CHE TUR GBR AUS USA`,
  });

defaultWithExceptions('world_region', 'World Region (UN Geoscheme)',
  'The geographic subregion each country belongs to', W('United_Nations_geoscheme'),
  'region', 'Sub-Saharan Africa', {
    'Northern Africa': 'DZA EGY LBY MAR SDN TUN',
    'Northern America': 'CAN USA',
    'Central America': 'BLZ CRI SLV GTM HND MEX NIC PAN',
    'Caribbean': 'ATG BHS BRB CUB DMA DOM GRD HTI JAM KNA LCA VCT TTO',
    'South America': 'ARG BOL BRA CHL COL ECU GUY PRY PER SUR URY VEN',
    'Central Asia': 'KAZ KGZ TJK TKM UZB',
    'Eastern Asia': 'CHN JPN PRK KOR MNG TWN',
    'South-Eastern Asia': 'BRN KHM IDN LAO MYS MMR PHL SGP THA TLS VNM',
    'Southern Asia': 'AFG BGD BTN IND IRN MDV NPL PAK LKA',
    'Western Asia': 'ARM AZE BHR CYP GEO IRQ ISR JOR KWT LBN OMN PSE QAT SAU SYR TUR ARE YEM',
    'Eastern Europe': 'BLR BGR CZE HUN POL MDA ROU RUS SVK UKR',
    'Northern Europe': 'DNK EST FIN ISL IRL LVA LTU NOR SWE GBR',
    'Southern Europe': 'ALB AND BIH HRV GRC ITA MLT MNE MKD PRT SMR SRB SVN ESP VAT',
    'Western Europe': 'AUT BEL FRA DEU LIE LUX MCO NLD CHE',
    'Oceania': 'AUS FJI KIR MHL FSM NRU NZL PLW PNG WSM SLB TON TUV VUT',
  });

/* ============================ MORE BORDERS & GROUPS ============================ */

membership('borders_argentina', 'Countries Bordering Argentina',
  'Countries that share a land border with Argentina', W('Geography_of_Argentina'),
  'CHL BOL PRY BRA URY', 'Borders Argentina');

membership('borders_saudi_arabia', 'Countries Bordering Saudi Arabia',
  'Countries that share a land border with Saudi Arabia', W('Geography_of_Saudi_Arabia'),
  'JOR IRQ KWT QAT ARE OMN YEM', 'Borders Saudi Arabia');

membership('borders_turkey', 'Countries Bordering Turkey',
  'Countries that share a land border with Turkey', W('Geography_of_Turkey'),
  'GRC BGR GEO ARM AZE IRN IRQ SYR', 'Borders Turkey');

membership('borders_poland', 'Countries Bordering Poland',
  'Countries that share a land border with Poland', W('Geography_of_Poland'),
  'DEU CZE SVK UKR BLR LTU RUS', 'Borders Poland');

membership('borders_thailand', 'Countries Bordering Thailand',
  'Countries that share a land border with Thailand', W('Geography_of_Thailand'),
  'MMR LAO KHM MYS', 'Borders Thailand');

membership('european_economic_area', 'European Economic Area',
  'Members of the European Economic Area (EU plus Iceland, Liechtenstein, Norway)', W('European_Economic_Area'),
  'AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE ISL LIE NOR',
  'EEA member');

membership('island_nations', 'Island Nations',
  'Sovereign states made up entirely of one or more islands', W('Island_country'),
  `ATG AUS BHS BHR BRB BRN CPV COM CUB CYP DMA DOM FJI GRD ISL IDN IRL JAM JPN KIR MDG
   MDV MLT MHL MUS FSM NRU NZL PLW PNG PHL WSM STP SGP SLB LKA TLS TON TTO TUV GBR VUT
   HTI SYC`, 'Island nation');

membership('arctic_circle_territory', 'Countries with Territory in the Arctic Circle',
  'Countries with land north of the Arctic Circle', W('Arctic_Circle'),
  'NOR SWE FIN RUS USA CAN DNK ISL', 'Arctic territory');

membership('arctic_ocean_coast', 'Arctic Ocean Coastline',
  'The five littoral states of the Arctic Ocean', W('Arctic_Ocean'),
  'CAN RUS USA NOR DNK', 'Arctic Ocean');

membership('nuclear_armed_states', 'Nuclear-Armed States',
  'Countries known or believed to possess nuclear weapons', W('List_of_states_with_nuclear_weapons'),
  'USA RUS GBR FRA CHN IND PAK PRK ISR', 'Nuclear-armed');

membership('unsc_permanent_members', 'UN Security Council Permanent Members',
  'The five permanent members of the United Nations Security Council', W('Permanent_members_of_the_United_Nations_Security_Council'),
  'USA RUS CHN GBR FRA', 'P5 member');

membership('cyrillic_script', 'Countries Using the Cyrillic Script',
  'Countries that use the Cyrillic alphabet for an official language', W('Cyrillic_script'),
  'RUS BLR UKR BGR SRB MKD MNE KAZ KGZ TJK MNG', 'Cyrillic');

membership('no_standing_army', 'Countries Without a Standing Army',
  'Sovereign states that maintain no standing military', W('List_of_countries_without_armed_forces'),
  'CRI PAN ISL AND LIE MCO MHL FSM PLW WSM VUT NRU TUV KIR GRD VCT LCA DMA SLB MUS',
  'No army');

membership('compulsory_voting', 'Countries with Compulsory Voting',
  'Countries where voting in elections is legally required', W('Compulsory_voting'),
  'AUS BEL LUX BRA ARG ECU PER URY BOL SGP NRU', 'Compulsory voting');

/* ============================ WRITE ============================ */

let written = 0;
const titles = new Set();
for (const { slug, json } of datasets) {
  const count = Object.keys(json.data).length;
  if (count === 0) { warnings.push(`EMPTY dataset: ${slug}`); continue; }
  if (titles.has(json.title)) warnings.push(`DUPLICATE title: ${json.title}`);
  titles.add(json.title);
  const file = path.join(DATA_DIR, `${slug}.json`);
  fs.writeFileSync(file, JSON.stringify(json, null, 2));
  written++;
}

console.log(`\nWrote ${written} datasets (${datasets.length} defined).`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  [...new Set(warnings)].forEach((w) => console.log('  - ' + w));
} else {
  console.log('No warnings — all codes resolved.');
}
