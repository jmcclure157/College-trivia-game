// Every Power 4 football school for the 2025-26 season, the town its main campus is in, and its
// mascot (the team nickname, e.g. "Crimson Tide", not the costumed character).
// `colors` are the school's two official colors (primary, secondary), used to theme the page.
// `townAliases` / `schoolAliases` / `mascotAliases` list other answers the typed mode should also accept.

export const CONFERENCES = ["SEC", "Big Ten", "Big 12", "ACC"];

export const STATE_NAMES = {
  AL: "Alabama", AR: "Arkansas", AZ: "Arizona", CA: "California", CO: "Colorado",
  FL: "Florida", GA: "Georgia", IA: "Iowa", IL: "Illinois", IN: "Indiana",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", MA: "Massachusetts", MD: "Maryland",
  MI: "Michigan", MN: "Minnesota", MO: "Missouri", MS: "Mississippi", NC: "North Carolina",
  NE: "Nebraska", NJ: "New Jersey", NY: "New York", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", SC: "South Carolina", TN: "Tennessee", TX: "Texas",
  UT: "Utah", VA: "Virginia", WA: "Washington", WI: "Wisconsin", WV: "West Virginia",
};

export const SCHOOLS = [
  // SEC (16)
  { school: "Alabama", town: "Tuscaloosa", state: "AL", conference: "SEC", mascot: "Crimson Tide", colors: ["#9E1B32", "#FFFFFF"] },
  { school: "Arkansas", town: "Fayetteville", state: "AR", conference: "SEC", mascot: "Razorbacks", mascotAliases: ["Hogs"], colors: ["#9D2235", "#FFFFFF"] },
  { school: "Auburn", town: "Auburn", state: "AL", conference: "SEC", mascot: "Tigers", colors: ["#0C2340", "#E87722"] },
  { school: "Florida", town: "Gainesville", state: "FL", conference: "SEC", mascot: "Gators", colors: ["#0021A5", "#FA4616"] },
  { school: "Georgia", town: "Athens", state: "GA", conference: "SEC", mascot: "Bulldogs", mascotAliases: ["Dawgs"], colors: ["#BA0C2F", "#000000"] },
  { school: "Kentucky", town: "Lexington", state: "KY", conference: "SEC", mascot: "Wildcats", colors: ["#0033A0", "#FFFFFF"] },
  { school: "LSU", town: "Baton Rouge", state: "LA", conference: "SEC", schoolAliases: ["Louisiana State"], mascot: "Tigers", colors: ["#461D7C", "#FDD023"] },
  { school: "Ole Miss", town: "Oxford", state: "MS", conference: "SEC", schoolAliases: ["Mississippi"], mascot: "Rebels", colors: ["#CE1126", "#14213D"] },
  { school: "Mississippi State", town: "Starkville", state: "MS", conference: "SEC", mascot: "Bulldogs", colors: ["#660000", "#FFFFFF"] },
  { school: "Missouri", town: "Columbia", state: "MO", conference: "SEC", schoolAliases: ["Mizzou"], mascot: "Tigers", colors: ["#F1B82D", "#000000"] },
  { school: "Oklahoma", town: "Norman", state: "OK", conference: "SEC", mascot: "Sooners", colors: ["#841617", "#FDF9D8"] },
  { school: "South Carolina", town: "Columbia", state: "SC", conference: "SEC", mascot: "Gamecocks", colors: ["#73000A", "#000000"] },
  { school: "Tennessee", town: "Knoxville", state: "TN", conference: "SEC", mascot: "Volunteers", mascotAliases: ["Vols"], colors: ["#FF8200", "#FFFFFF"] },
  { school: "Texas", town: "Austin", state: "TX", conference: "SEC", mascot: "Longhorns", colors: ["#BF5700", "#FFFFFF"] },
  { school: "Texas A&M", town: "College Station", state: "TX", conference: "SEC", mascot: "Aggies", colors: ["#500000", "#FFFFFF"] },
  { school: "Vanderbilt", town: "Nashville", state: "TN", conference: "SEC", mascot: "Commodores", mascotAliases: ["Dores"], colors: ["#000000", "#CFAE70"] },

  // Big Ten (18)
  { school: "Illinois", town: "Champaign", state: "IL", conference: "Big Ten", townAliases: ["Urbana", "Urbana-Champaign", "Champaign-Urbana"], mascot: "Fighting Illini", mascotAliases: ["Illini"], colors: ["#E84A27", "#13294B"] },
  { school: "Indiana", town: "Bloomington", state: "IN", conference: "Big Ten", mascot: "Hoosiers", colors: ["#990000", "#EEEDEB"] },
  { school: "Iowa", town: "Iowa City", state: "IA", conference: "Big Ten", mascot: "Hawkeyes", colors: ["#000000", "#FFCD00"] },
  { school: "Maryland", town: "College Park", state: "MD", conference: "Big Ten", mascot: "Terrapins", mascotAliases: ["Terps"], colors: ["#E21833", "#FFD200"] },
  { school: "Michigan", town: "Ann Arbor", state: "MI", conference: "Big Ten", mascot: "Wolverines", colors: ["#00274C", "#FFCB05"] },
  { school: "Michigan State", town: "East Lansing", state: "MI", conference: "Big Ten", mascot: "Spartans", colors: ["#18453B", "#FFFFFF"] },
  { school: "Minnesota", town: "Minneapolis", state: "MN", conference: "Big Ten", mascot: "Golden Gophers", mascotAliases: ["Gophers"], colors: ["#7A0019", "#FFCC33"] },
  { school: "Nebraska", town: "Lincoln", state: "NE", conference: "Big Ten", mascot: "Cornhuskers", mascotAliases: ["Huskers"], colors: ["#D00000", "#F5F1E7"] },
  { school: "Northwestern", town: "Evanston", state: "IL", conference: "Big Ten", mascot: "Wildcats", colors: ["#4E2A84", "#FFFFFF"] },
  { school: "Ohio State", town: "Columbus", state: "OH", conference: "Big Ten", mascot: "Buckeyes", colors: ["#BB0000", "#666666"] },
  { school: "Oregon", town: "Eugene", state: "OR", conference: "Big Ten", mascot: "Ducks", colors: ["#154733", "#FEE123"] },
  { school: "Penn State", town: "State College", state: "PA", conference: "Big Ten", townAliases: ["University Park"], mascot: "Nittany Lions", colors: ["#041E42", "#FFFFFF"] },
  { school: "Purdue", town: "West Lafayette", state: "IN", conference: "Big Ten", mascot: "Boilermakers", colors: ["#000000", "#CFB991"] },
  { school: "Rutgers", town: "New Brunswick", state: "NJ", conference: "Big Ten", townAliases: ["Piscataway"], mascot: "Scarlet Knights", colors: ["#CC0033", "#000000"] },
  { school: "UCLA", town: "Los Angeles", state: "CA", conference: "Big Ten", mascot: "Bruins", colors: ["#2774AE", "#FFD100"] },
  { school: "USC", town: "Los Angeles", state: "CA", conference: "Big Ten", schoolAliases: ["Southern California", "Southern Cal"], mascot: "Trojans", colors: ["#990000", "#FFCC00"] },
  { school: "Washington", town: "Seattle", state: "WA", conference: "Big Ten", mascot: "Huskies", colors: ["#4B2E83", "#B7A57A"] },
  { school: "Wisconsin", town: "Madison", state: "WI", conference: "Big Ten", mascot: "Badgers", colors: ["#C5050C", "#FFFFFF"] },

  // Big 12 (16)
  { school: "Arizona", town: "Tucson", state: "AZ", conference: "Big 12", mascot: "Wildcats", colors: ["#AB0520", "#0C234B"] },
  { school: "Arizona State", town: "Tempe", state: "AZ", conference: "Big 12", mascot: "Sun Devils", colors: ["#8C1D40", "#FFC627"] },
  { school: "Baylor", town: "Waco", state: "TX", conference: "Big 12", mascot: "Bears", colors: ["#154734", "#FFB81C"] },
  { school: "BYU", town: "Provo", state: "UT", conference: "Big 12", schoolAliases: ["Brigham Young"], mascot: "Cougars", colors: ["#002E5D", "#FFFFFF"] },
  { school: "Cincinnati", town: "Cincinnati", state: "OH", conference: "Big 12", mascot: "Bearcats", colors: ["#E00122", "#000000"] },
  { school: "Colorado", town: "Boulder", state: "CO", conference: "Big 12", mascot: "Buffaloes", mascotAliases: ["Buffs"], colors: ["#000000", "#CFB87C"] },
  { school: "Houston", town: "Houston", state: "TX", conference: "Big 12", mascot: "Cougars", colors: ["#C8102E", "#FFFFFF"] },
  { school: "Iowa State", town: "Ames", state: "IA", conference: "Big 12", mascot: "Cyclones", colors: ["#C8102E", "#F1BE48"] },
  { school: "Kansas", town: "Lawrence", state: "KS", conference: "Big 12", mascot: "Jayhawks", colors: ["#0051BA", "#E8000D"] },
  { school: "Kansas State", town: "Manhattan", state: "KS", conference: "Big 12", schoolAliases: ["K-State"], mascot: "Wildcats", colors: ["#512888", "#FFFFFF"] },
  { school: "Oklahoma State", town: "Stillwater", state: "OK", conference: "Big 12", mascot: "Cowboys", mascotAliases: ["Pokes"], colors: ["#FF7300", "#000000"] },
  { school: "TCU", town: "Fort Worth", state: "TX", conference: "Big 12", schoolAliases: ["Texas Christian"], mascot: "Horned Frogs", colors: ["#4D1979", "#A3A9AC"] },
  { school: "Texas Tech", town: "Lubbock", state: "TX", conference: "Big 12", mascot: "Red Raiders", colors: ["#CC0000", "#000000"] },
  { school: "UCF", town: "Orlando", state: "FL", conference: "Big 12", schoolAliases: ["Central Florida"], mascot: "Knights", colors: ["#000000", "#FFC904"] },
  { school: "Utah", town: "Salt Lake City", state: "UT", conference: "Big 12", mascot: "Utes", colors: ["#CC0000", "#FFFFFF"] },
  { school: "West Virginia", town: "Morgantown", state: "WV", conference: "Big 12", mascot: "Mountaineers", colors: ["#002855", "#EAAA00"] },

  // ACC (17 football members; Notre Dame plays other ACC sports but is a football independent)
  { school: "Boston College", town: "Chestnut Hill", state: "MA", conference: "ACC", mascot: "Eagles", colors: ["#98002E", "#BC9B6A"] },
  { school: "Cal", town: "Berkeley", state: "CA", conference: "ACC", schoolAliases: ["California", "UC Berkeley"], mascot: "Golden Bears", colors: ["#003262", "#FDB515"] },
  { school: "Clemson", town: "Clemson", state: "SC", conference: "ACC", mascot: "Tigers", colors: ["#F56600", "#522D80"] },
  { school: "Duke", town: "Durham", state: "NC", conference: "ACC", mascot: "Blue Devils", colors: ["#012169", "#FFFFFF"] },
  { school: "Florida State", town: "Tallahassee", state: "FL", conference: "ACC", mascot: "Seminoles", mascotAliases: ["Noles"], colors: ["#782F40", "#CEB888"] },
  { school: "Georgia Tech", town: "Atlanta", state: "GA", conference: "ACC", mascot: "Yellow Jackets", colors: ["#B3A369", "#003057"] },
  { school: "Louisville", town: "Louisville", state: "KY", conference: "ACC", mascot: "Cardinals", colors: ["#AD0000", "#000000"] },
  { school: "Miami", town: "Coral Gables", state: "FL", conference: "ACC", schoolAliases: ["Miami (FL)", "Miami Florida"], mascot: "Hurricanes", mascotAliases: ["Canes"], colors: ["#005030", "#F47321"] },
  { school: "NC State", town: "Raleigh", state: "NC", conference: "ACC", schoolAliases: ["North Carolina State"], mascot: "Wolfpack", colors: ["#CC0000", "#FFFFFF"] },
  { school: "North Carolina", town: "Chapel Hill", state: "NC", conference: "ACC", schoolAliases: ["UNC"], mascot: "Tar Heels", colors: ["#7BAFD4", "#13294B"] },
  { school: "Pitt", town: "Pittsburgh", state: "PA", conference: "ACC", schoolAliases: ["Pittsburgh"], mascot: "Panthers", colors: ["#003594", "#FFB81C"] },
  { school: "SMU", town: "Dallas", state: "TX", conference: "ACC", townAliases: ["University Park"], schoolAliases: ["Southern Methodist"], mascot: "Mustangs", colors: ["#C8102E", "#354CA1"] },
  { school: "Stanford", town: "Stanford", state: "CA", conference: "ACC", townAliases: ["Palo Alto"], mascot: "Cardinal", colors: ["#8C1515", "#FFFFFF"] },
  { school: "Syracuse", town: "Syracuse", state: "NY", conference: "ACC", mascot: "Orange", colors: ["#F76900", "#000E54"] },
  { school: "Virginia", town: "Charlottesville", state: "VA", conference: "ACC", schoolAliases: ["UVA"], mascot: "Cavaliers", mascotAliases: ["Hoos", "Wahoos"], colors: ["#232D4B", "#E57200"] },
  { school: "Virginia Tech", town: "Blacksburg", state: "VA", conference: "ACC", mascot: "Hokies", colors: ["#861F41", "#E5751F"] },
  { school: "Wake Forest", town: "Winston-Salem", state: "NC", conference: "ACC", mascot: "Demon Deacons", colors: ["#9E7E38", "#000000"] },
];
