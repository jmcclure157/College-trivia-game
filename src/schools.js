// Every Power 4 football school for the 2025-26 season, the town its main campus is in, and its
// mascot (the team nickname, e.g. "Crimson Tide", not the costumed character).
// `townAliases` / `schoolAliases` / `mascotAliases` list other answers the typed mode should also accept.
// `mascotSingular` is only needed when the singular isn't the plural with "s"/"es" dropped or "ies" -> "y".

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
  { school: "Alabama", town: "Tuscaloosa", state: "AL", conference: "SEC", mascot: "Crimson Tide" },
  { school: "Arkansas", town: "Fayetteville", state: "AR", conference: "SEC", mascot: "Razorbacks", mascotAliases: ["Hogs"] },
  { school: "Auburn", town: "Auburn", state: "AL", conference: "SEC", mascot: "Tigers" },
  { school: "Florida", town: "Gainesville", state: "FL", conference: "SEC", mascot: "Gators" },
  { school: "Georgia", town: "Athens", state: "GA", conference: "SEC", mascot: "Bulldogs", mascotAliases: ["Dawgs"] },
  { school: "Kentucky", town: "Lexington", state: "KY", conference: "SEC", mascot: "Wildcats" },
  { school: "LSU", town: "Baton Rouge", state: "LA", conference: "SEC", schoolAliases: ["Louisiana State"], mascot: "Tigers" },
  { school: "Ole Miss", town: "Oxford", state: "MS", conference: "SEC", schoolAliases: ["Mississippi"], mascot: "Rebels" },
  { school: "Mississippi State", town: "Starkville", state: "MS", conference: "SEC", mascot: "Bulldogs" },
  { school: "Missouri", town: "Columbia", state: "MO", conference: "SEC", schoolAliases: ["Mizzou"], mascot: "Tigers" },
  { school: "Oklahoma", town: "Norman", state: "OK", conference: "SEC", mascot: "Sooners" },
  { school: "South Carolina", town: "Columbia", state: "SC", conference: "SEC", mascot: "Gamecocks" },
  { school: "Tennessee", town: "Knoxville", state: "TN", conference: "SEC", mascot: "Volunteers", mascotAliases: ["Vols"] },
  { school: "Texas", town: "Austin", state: "TX", conference: "SEC", mascot: "Longhorns" },
  { school: "Texas A&M", town: "College Station", state: "TX", conference: "SEC", mascot: "Aggies", mascotSingular: "Aggie" },
  { school: "Vanderbilt", town: "Nashville", state: "TN", conference: "SEC", mascot: "Commodores", mascotAliases: ["Dores"] },

  // Big Ten (18)
  { school: "Illinois", town: "Champaign", state: "IL", conference: "Big Ten", townAliases: ["Urbana", "Urbana-Champaign", "Champaign-Urbana"], mascot: "Fighting Illini", mascotAliases: ["Illini"] },
  { school: "Indiana", town: "Bloomington", state: "IN", conference: "Big Ten", mascot: "Hoosiers" },
  { school: "Iowa", town: "Iowa City", state: "IA", conference: "Big Ten", mascot: "Hawkeyes" },
  { school: "Maryland", town: "College Park", state: "MD", conference: "Big Ten", mascot: "Terrapins", mascotAliases: ["Terps"] },
  { school: "Michigan", town: "Ann Arbor", state: "MI", conference: "Big Ten", mascot: "Wolverines" },
  { school: "Michigan State", town: "East Lansing", state: "MI", conference: "Big Ten", mascot: "Spartans" },
  { school: "Minnesota", town: "Minneapolis", state: "MN", conference: "Big Ten", mascot: "Golden Gophers", mascotAliases: ["Gophers"] },
  { school: "Nebraska", town: "Lincoln", state: "NE", conference: "Big Ten", mascot: "Cornhuskers", mascotAliases: ["Huskers"] },
  { school: "Northwestern", town: "Evanston", state: "IL", conference: "Big Ten", mascot: "Wildcats" },
  { school: "Ohio State", town: "Columbus", state: "OH", conference: "Big Ten", mascot: "Buckeyes" },
  { school: "Oregon", town: "Eugene", state: "OR", conference: "Big Ten", mascot: "Ducks" },
  { school: "Penn State", town: "State College", state: "PA", conference: "Big Ten", townAliases: ["University Park"], mascot: "Nittany Lions" },
  { school: "Purdue", town: "West Lafayette", state: "IN", conference: "Big Ten", mascot: "Boilermakers" },
  { school: "Rutgers", town: "New Brunswick", state: "NJ", conference: "Big Ten", townAliases: ["Piscataway"], mascot: "Scarlet Knights" },
  { school: "UCLA", town: "Los Angeles", state: "CA", conference: "Big Ten", mascot: "Bruins" },
  { school: "USC", town: "Los Angeles", state: "CA", conference: "Big Ten", schoolAliases: ["Southern California", "Southern Cal"], mascot: "Trojans" },
  { school: "Washington", town: "Seattle", state: "WA", conference: "Big Ten", mascot: "Huskies" },
  { school: "Wisconsin", town: "Madison", state: "WI", conference: "Big Ten", mascot: "Badgers" },

  // Big 12 (16)
  { school: "Arizona", town: "Tucson", state: "AZ", conference: "Big 12", mascot: "Wildcats" },
  { school: "Arizona State", town: "Tempe", state: "AZ", conference: "Big 12", mascot: "Sun Devils" },
  { school: "Baylor", town: "Waco", state: "TX", conference: "Big 12", mascot: "Bears" },
  { school: "BYU", town: "Provo", state: "UT", conference: "Big 12", schoolAliases: ["Brigham Young"], mascot: "Cougars" },
  { school: "Cincinnati", town: "Cincinnati", state: "OH", conference: "Big 12", mascot: "Bearcats" },
  { school: "Colorado", town: "Boulder", state: "CO", conference: "Big 12", mascot: "Buffaloes", mascotAliases: ["Buffs"] },
  { school: "Houston", town: "Houston", state: "TX", conference: "Big 12", mascot: "Cougars" },
  { school: "Iowa State", town: "Ames", state: "IA", conference: "Big 12", mascot: "Cyclones" },
  { school: "Kansas", town: "Lawrence", state: "KS", conference: "Big 12", mascot: "Jayhawks" },
  { school: "Kansas State", town: "Manhattan", state: "KS", conference: "Big 12", schoolAliases: ["K-State"], mascot: "Wildcats" },
  { school: "Oklahoma State", town: "Stillwater", state: "OK", conference: "Big 12", mascot: "Cowboys", mascotAliases: ["Pokes"] },
  { school: "TCU", town: "Fort Worth", state: "TX", conference: "Big 12", schoolAliases: ["Texas Christian"], mascot: "Horned Frogs" },
  { school: "Texas Tech", town: "Lubbock", state: "TX", conference: "Big 12", mascot: "Red Raiders" },
  { school: "UCF", town: "Orlando", state: "FL", conference: "Big 12", schoolAliases: ["Central Florida"], mascot: "Knights" },
  { school: "Utah", town: "Salt Lake City", state: "UT", conference: "Big 12", mascot: "Utes" },
  { school: "West Virginia", town: "Morgantown", state: "WV", conference: "Big 12", mascot: "Mountaineers" },

  // ACC (17 football members; Notre Dame plays other ACC sports but is a football independent)
  { school: "Boston College", town: "Chestnut Hill", state: "MA", conference: "ACC", mascot: "Eagles" },
  { school: "Cal", town: "Berkeley", state: "CA", conference: "ACC", schoolAliases: ["California", "UC Berkeley"], mascot: "Golden Bears" },
  { school: "Clemson", town: "Clemson", state: "SC", conference: "ACC", mascot: "Tigers" },
  { school: "Duke", town: "Durham", state: "NC", conference: "ACC", mascot: "Blue Devils" },
  { school: "Florida State", town: "Tallahassee", state: "FL", conference: "ACC", mascot: "Seminoles", mascotAliases: ["Noles"] },
  { school: "Georgia Tech", town: "Atlanta", state: "GA", conference: "ACC", mascot: "Yellow Jackets" },
  { school: "Louisville", town: "Louisville", state: "KY", conference: "ACC", mascot: "Cardinals" },
  { school: "Miami", town: "Coral Gables", state: "FL", conference: "ACC", schoolAliases: ["Miami (FL)", "Miami Florida"], mascot: "Hurricanes", mascotAliases: ["Canes"] },
  { school: "NC State", town: "Raleigh", state: "NC", conference: "ACC", schoolAliases: ["North Carolina State"], mascot: "Wolfpack" },
  { school: "North Carolina", town: "Chapel Hill", state: "NC", conference: "ACC", schoolAliases: ["UNC"], mascot: "Tar Heels" },
  { school: "Pitt", town: "Pittsburgh", state: "PA", conference: "ACC", schoolAliases: ["Pittsburgh"], mascot: "Panthers" },
  { school: "SMU", town: "Dallas", state: "TX", conference: "ACC", townAliases: ["University Park"], schoolAliases: ["Southern Methodist"], mascot: "Mustangs" },
  { school: "Stanford", town: "Stanford", state: "CA", conference: "ACC", townAliases: ["Palo Alto"], mascot: "Cardinal" },
  { school: "Syracuse", town: "Syracuse", state: "NY", conference: "ACC", mascot: "Orange" },
  { school: "Virginia", town: "Charlottesville", state: "VA", conference: "ACC", schoolAliases: ["UVA"], mascot: "Cavaliers", mascotAliases: ["Hoos", "Wahoos"] },
  { school: "Virginia Tech", town: "Blacksburg", state: "VA", conference: "ACC", mascot: "Hokies", mascotSingular: "Hokie" },
  { school: "Wake Forest", town: "Winston-Salem", state: "NC", conference: "ACC", mascot: "Demon Deacons" },
];
