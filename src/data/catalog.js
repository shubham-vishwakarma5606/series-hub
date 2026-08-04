// ─────────────────────────────────────────────────────────────────────────────
// Series Hub catalogue — fictional titles, deterministic metadata.
// ─────────────────────────────────────────────────────────────────────────────

import { pub } from '../utils/pub.js'

const RAW = [
  // ── Flagship originals (with AI cinematic backdrops) ────────────────────────
  { id: 'neon-district', title: 'Neon District', type: 'series', year: 2026, age: 'TV-MA', seasons: 3,
    genres: ['Sci-Fi', 'Crime', 'Thriller'], original: true, backdrop: pub('/backdrops/neon-district.jpg'),
    palette: ['#071a45', '#0e3aa0'], markers: { intro: [78, 168], recap: [12, 74] }, pattern: 'glow', font: 'bebas', rank: '#1 in TV Shows Today',
    tags: ['cyberpunk', 'detective', 'noir', 'rainy city', 'conspiracy'],
    syn: 'In a rain-drowned megacity where memories can be stolen, a washed-out detective hunts the one suspect who knows her own erased past — and every clue glows neon blue and red.' },
  { id: 'iron-harbor', title: 'Iron Harbor', type: 'series', year: 2025, age: 'TV-MA', seasons: 2,
    genres: ['Crime', 'Drama', 'Mystery'], original: true, backdrop: pub('/backdrops/iron-harbor.jpg'),
    palette: ['#0a1626', '#1e4a73'], markers: { intro: [96, 182] }, pattern: 'slash', font: 'oswald', rank: '#2 in TV Shows Today',
    tags: ['port city', 'smuggling', 'family', 'slow burn', 'fog'],
    syn: 'A grieving dockmaster inherits his brother’s shipping empire — and the ledger of debts, bribes and bodies that came with it. The fog at Iron Harbor keeps everyone’s secrets. Almost.' },
  { id: 'the-long-dark', title: 'The Long Dark', type: 'series', year: 2026, age: 'TV-14', seasons: 1,
    genres: ['Sci-Fi', 'Mystery', 'Adventure'], original: true, backdrop: pub('/backdrops/the-long-dark.jpg'),
    palette: ['#04121f', '#10628a'], markers: { intro: [88, 160] }, pattern: 'rays', font: 'oswald', rank: '#3 in TV Shows Today',
    tags: ['arctic', 'survival', 'aurora', 'isolation', 'expedition'],
    syn: 'Sixty days of polar night. Twelve scientists. One distress call that should not exist. At Station Vardø, the dark is not empty — it is patient.' },

  // ── Series — originals ──────────────────────────────────────────────────────
  { id: 'glasshouse', title: 'Glasshouse', type: 'series', year: 2024, age: 'TV-MA', seasons: 4,
    genres: ['Drama', 'Thriller'], original: true, palette: ['#26060a', '#8f1020'], markers: { intro: [70, 150], recap: [10, 66] }, pattern: 'fold', font: 'serif',
    tags: ['political', 'family empire', 'secrets'], featured: true,
    syn: 'A media dynasty fractures when the patriarch dies live on air. Four heirs, one will, and a glass house where everyone can see everyone else’s knife.' },
  { id: 'bone-orchard', title: 'Bone Orchard', type: 'series', year: 2023, age: 'TV-MA', seasons: 2,
    genres: ['Crime', 'Western', 'Drama'], original: true, palette: ['#170a04', '#7a2e12'], pattern: 'dust', font: 'bebas',
    tags: ['outlaws', 'revenge', 'gritty'],
    syn: 'A former outlaw plants apple trees over the graves of his old gang, but the past keeps pushing up through the soil.' },
  { id: 'saltline', title: 'Saltline', type: 'series', year: 2025, age: 'TV-14', seasons: 2,
    genres: ['Drama', 'Mystery'], original: true, palette: ['#04202c', '#0f6b8a'], pattern: 'waves', font: 'serif',
    tags: ['coastal town', 'disappearance', 'tides'],
    syn: 'Every spring the tide returns something the sea took from the town — this year it returned Mara Venn, eleven years after she drowned.' },
  { id: 'midnight-circuit', title: 'Midnight Circuit', type: 'series', year: 2024, age: 'TV-MA', seasons: 3,
    genres: ['Action', 'Crime', 'Thriller'], original: true, palette: ['#0d0d12', '#e50914'], markers: { intro: [72, 150] }, pattern: 'strobe', font: 'bebas',
    tags: ['street racing', 'heist', 'undercover'],
    syn: 'An undercover driver infiltrates an illegal midnight racing league that launders billions for a cartel — one checkpoint at a time.' },
  { id: 'the-undertow', title: 'The Undertow', type: 'series', year: 2025, age: 'TV-MA', seasons: 1,
    genres: ['Thriller', 'Drama'], original: true, palette: ['#03151c', '#11557a'], pattern: 'waves', font: 'oswald',
    tags: ['submarine', 'courtroom', 'grief'],
    syn: 'A salvage lawyer takes on the navy after her husband’s submarine vanishes — and the ocean’s logs disagree with the official story.' },
  { id: 'vigil-9', title: 'Vigil 9', type: 'series', year: 2026, age: 'TV-14', seasons: 1,
    genres: ['Sci-Fi', 'Thriller'], original: true, palette: ['#0a0f24', '#2e93ff'], pattern: 'grid', font: 'mono',
    tags: ['space station', 'ai', 'whodunit'],
    syn: 'Nine crew. One unblinking AI. When the station’s medic is found dead in a sealed module, VIGIL insists no one left the room.' },
  { id: 'kingdom-of-ash', title: 'Kingdom of Ash & Smoke', type: 'series', year: 2024, age: 'TV-MA', seasons: 3,
    genres: ['Fantasy', 'Epic', 'Drama'], original: true, palette: ['#1c0a06', '#b0431f'], markers: { intro: [102, 198], recap: [14, 82] }, pattern: 'ember', font: 'serif',
    tags: ['dragons', 'succession', 'war'],
    syn: 'The Dragon Throne sits empty, five banners burn, and the ash remembers every oath ever broken.' },
  { id: 'static', title: 'Static', type: 'series', year: 2025, age: 'TV-MA', seasons: 2,
    genres: ['Sci-Fi', 'Horror', 'Mystery'], original: true, palette: ['#05070d', '#3d4a63'], markers: { intro: [84, 156] }, pattern: 'strobe', font: 'mono',
    tags: ['broadcast signal', 'analog horror', 'creepy'],
    syn: 'A late-night radio host traces a pirate signal that shouldn’t exist — and it starts answering her callers before they dial.' },

  // ── Series — dramas → components stay below as curated ──────────────────────
  { id: 'paper-straits', title: 'Paper Straits', type: 'series', year: 2023, age: 'TV-14', seasons: 4,
    genres: ['Drama', 'Family'], palette: ['#101820', '#365a7d'], pattern: 'fold', font: 'serif',
    tags: ['siblings', 'inheritance', 'bookstore'],
    syn: 'Three estranged siblings inherit their father’s sinking bookshop, and the margins of his books are full of letters none of them were meant to read.' },
  { id: 'amber-line', title: 'Amber Line', type: 'series', year: 2024, age: 'TV-14', seasons: 2,
    genres: ['Drama', 'Medical'], palette: ['#221208', '#c07b2a'], pattern: 'glow', font: 'oswald',
    tags: ['hospital', 'night shift', 'ensemble'],
    syn: 'The amber line marks the last hour of the night shift — the hour when St. Brigid’s emergency room tells the truth.' },
  { id: 'the-last-cartographer', title: 'The Last Cartographer', type: 'series', year: 2022, age: 'TV-PG', seasons: 3,
    genres: ['Adventure', 'Drama', 'Period'], palette: ['#10160c', '#4c6b3c'], pattern: 'grid', font: 'serif',
    tags: ['exploration', 'maps', 'expedition'],
    syn: 'Commissioned to chart the last unmapped coast on earth, a royal cartographer discovers the map has been lying to the crown for two hundred years.' },
  { id: 'calling-hours', title: 'Calling Hours', type: 'series', year: 2025, age: 'TV-MA', seasons: 1,
    genres: ['Drama', 'Thriller'], palette: ['#12091c', '#5b2b8f'], pattern: 'rays', font: 'serif',
    tags: ['funeral home', 'family business', 'dark comedy edge'],
    syn: 'A family-run funeral home keeps two sets of books — one for the living, one for the dead who left instructions.' },
  { id: 'the-gallery', title: 'The Gallery', type: 'series', year: 2023, age: 'TV-MA', seasons: 2,
    genres: ['Drama', 'Mystery'], palette: ['#151312', '#8a6f4d'], pattern: 'fold', font: 'serif',
    tags: ['art world', 'forgery', 'museum'],
    syn: 'A conservator realizes the museum’s crown jewel is a forgery — painted by her own missing mother.' },
  { id: 'stringer', title: 'Stringer', type: 'series', year: 2024, age: 'TV-MA', seasons: 3,
    genres: ['Drama', 'Crime'], palette: ['#0c1118', '#2c5b8a'], pattern: 'strobe', font: 'oswald',
    tags: ['night news', 'journalism', 'los angeles'],
    syn: 'A freelance crime-scene cameraman sells the night’s worst moments to the highest bidder — until he films something he was never supposed to see.' },
  { id: 'verdict', title: 'Verdict', type: 'series', year: 2022, age: 'TV-14', seasons: 5,
    genres: ['Drama', 'Legal'], palette: ['#0b1220', '#31435f'], pattern: 'grid', font: 'oswald',
    tags: ['courtroom', 'jury', 'anthology'],
    syn: 'One jury room, twelve strangers, a new case every season — and a verdict that never survives its own consequences.' },

  // ── Series — comedies ───────────────────────────────────────────────────────
  { id: 'group-chat', title: 'Group Chat', type: 'series', year: 2025, age: 'TV-14', seasons: 3,
    genres: ['Comedy', 'Sitcom'], palette: ['#06230f', '#1f8f4d'], pattern: 'glow', font: 'bebas',
    tags: ['friends', 'dating', 'screens'],
    syn: 'Six friends, one unhinged group chat, and a rule that nothing said after 2am counts. Nobody honors the rule.' },
  { id: 'the-interns', title: 'The Interns', type: 'series', year: 2024, age: 'TV-14', seasons: 4,
    genres: ['Comedy', 'Workplace'], palette: ['#03202a', '#0f8aa0'], pattern: 'grid', font: 'bebas',
    tags: ['office', 'startup', 'chaos'],
    syn: 'Four interns at a streaming company accidentally greenlight a show — and now have to produce it before anyone finds out.' },
  { id: 'flatmates', title: 'Flatmates', type: 'series', year: 2023, age: 'TV-14', seasons: 6,
    genres: ['Comedy', 'Sitcom'], palette: ['#22062a', '#8f2ba0'], pattern: 'fold', font: 'bebas',
    tags: ['roommates', 'rent', 'found family'],
    syn: 'Five strangers split a flat with one bathroom, zero boundaries, and a landlord who may not exist.' },
  { id: 'uncle-finance', title: 'Uncle Finance', type: 'series', year: 2025, age: 'TV-PG', seasons: 2,
    genres: ['Comedy', 'Family'], palette: ['#0a1a2c', '#2e93ff'], pattern: 'rays', font: 'bebas',
    tags: ['uncle', 'advice', 'money'],
    syn: 'A bankrupt accountant gives brutally honest financial advice on the internet — while sleeping on his niece’s couch.' },
  { id: 'brunch-club', title: 'Brunch Club', type: 'series', year: 2022, age: 'TV-MA', seasons: 3,
    genres: ['Comedy', 'Drama'], palette: ['#241206', '#c78a3a'], pattern: 'glow', font: 'serif',
    tags: ['restaurant', 'friendship', 'hangover'],
    syn: 'Every Sunday the same table, the same eggs, and the autopsy of Saturday night.' },
  { id: 'punchline-lane', title: 'Punchline Lane', type: 'series', year: 2025, age: 'TV-14', seasons: 1,
    genres: ['Comedy', 'Stand-up'], palette: ['#200a0a', '#e50914'], pattern: 'strobe', font: 'bebas',
    tags: ['stand-up', 'open mic', 'rivals'],
    syn: 'Two rival comics get locked into co-hosting the city’s worst open mic. The audience is a parole board. Literally.' },
  { id: 'low-stakes', title: 'Low Stakes', type: 'series', year: 2024, age: 'TV-PG', seasons: 2,
    genres: ['Comedy', 'Mockumentary'], palette: ['#0f1510', '#4d7a3d'], pattern: 'grid', font: 'oswald',
    tags: ['fishing club', 'small town', 'mockumentary'],
    syn: 'A documentary crew follows the world’s least competitive competitive fishing club. The drama is off the scale — the fish are not.' },
  { id: 'the-substitute-s', title: 'The Substitute', type: 'series', year: 2023, age: 'TV-14', seasons: 4,
    genres: ['Comedy', 'School'], palette: ['#101b0a', '#6b8f2a'], pattern: 'slash', font: 'bebas',
    tags: ['school', 'teacher', 'improv'],
    syn: 'A burned-out actor becomes a substitute teacher and treats every class like an improv scene. The principal is not amused. The kids are.' },

  // ── Series — action / sci-fi / horror ───────────────────────────────────────
  { id: 'blackout-avenue', title: 'Blackout Avenue', type: 'series', year: 2024, age: 'TV-MA', seasons: 2,
    genres: ['Action', 'Thriller'], palette: ['#0b0b10', '#e50914'], pattern: 'strobe', font: 'bebas',
    tags: ['one night', 'citywide blackout', 'parkour'],
    syn: 'When the grid dies for one night, an EMT must cross forty blocks of chaos to deliver a donor heart before sunrise.' },
  { id: 'zero-kelvin', title: 'Zero Kelvin', type: 'series', year: 2026, age: 'TV-14', seasons: 1,
    genres: ['Sci-Fi', 'Thriller'], palette: ['#041018', '#2aa0c7'], pattern: 'grid', font: 'mono',
    tags: ['cryonics', 'near future', 'ethics'],
    syn: 'The first legally dead patient is revived — and sues for the right to stay dead. Her lawyer died in 2024. Both of them did.' },
  { id: 'orion-falls', title: 'Orion Falls', type: 'series', year: 2025, age: 'TV-14', seasons: 2,
    genres: ['Sci-Fi', 'Mystery', 'Teen'], palette: ['#0d0518', '#5b2bc7'], pattern: 'rays', font: 'oswald',
    tags: ['small town', 'meteor', 'powers'],
    syn: 'A meteor shower gives six teenagers impossible gifts and one shared nightmare they can’t wake up from.' },
  { id: 'the-signal-tide', title: 'The Signal Tide', type: 'series', year: 2023, age: 'TV-MA', seasons: 1,
    genres: ['Sci-Fi', 'Drama'], palette: ['#03141f', '#1e6b8a'], pattern: 'waves', font: 'mono',
    tags: ['first contact', 'ocean', 'linguistics'],
    syn: 'A linguist decodes a message repeating from the deepest trench on earth. It is not a greeting. It is a countdown.' },
  { id: 'marrow-deep', title: 'Marrow Deep', type: 'series', year: 2024, age: 'TV-MA', seasons: 2,
    genres: ['Horror', 'Folk Horror'], palette: ['#120607', '#8f1f1f'], pattern: 'ember', font: 'serif',
    tags: ['cult', 'forest', 'ritual'],
    syn: 'A botanist surveys a dying forest and finds a village that feeds it — one volunteer at a time.' },
  { id: 'moth-house', title: 'Moth House', type: 'series', year: 2025, age: 'TV-MA', seasons: 1,
    genres: ['Horror', 'Mystery'], palette: ['#0a0a08', '#6b6b4d'], pattern: 'dust', font: 'serif',
    tags: ['haunted house', 'inheritance', 'moths'],
    syn: 'She inherited the house with one condition: never cover the mirrors. The moths get angry when you cover the mirrors.' },
  { id: 'dont-answer', title: "Don't Answer", type: 'series', year: 2023, age: 'TV-MA', seasons: 2,
    genres: ['Horror', 'Thriller'], palette: ['#07070c', '#3a3d5b'], pattern: 'strobe', font: 'mono',
    tags: ['phone calls', ' anthology', 'cursed number'],
    syn: 'Everyone in town knows the rule: if the phone rings and the caller ID shows your own name — don’t answer. Someone always does.' },
  { id: 'the-welling', title: 'The Welling', type: 'series', year: 2022, age: 'TV-MA', seasons: 1,
    genres: ['Horror', 'Drama'], palette: ['#050d08', '#1f4d33'], pattern: 'waves', font: 'serif',
    tags: ['well', 'village', 'drought'],
    syn: 'The drought broke the day they opened the old well. The village wishes it hadn’t.' },
  { id: 'feast-of-june', title: 'Feast of June', type: 'series', year: 2024, age: 'TV-MA', seasons: 1,
    genres: ['Horror', 'Folk Horror'], palette: ['#170d04', '#a05b1f'], pattern: 'ember', font: 'serif',
    tags: ['festival', 'harvest', 'cult'],
    syn: 'A food critic visits a remote island’s legendary harvest feast. The menu changes every year. The ingredient doesn’t.' },
  { id: 'strike-vector', title: 'Strike Vector', type: 'series', year: 2025, age: 'TV-14', seasons: 2,
    genres: ['Action', 'Military'], palette: ['#0a0f0a', '#3d5b2c'], pattern: 'slash', font: 'bebas',
    tags: ['pilots', 'squadron', 'rogue mission'],
    syn: 'A disavowed squadron flies the missions no nation will sign for — paid in fuel, secrets, and silence.' },
  { id: 'red-line-pd', title: 'Red Line PD', type: 'series', year: 2023, age: 'TV-MA', seasons: 4,
    genres: ['Action', 'Crime', 'Procedural'], palette: ['#120507', '#c71020'], pattern: 'strobe', font: 'bebas',
    tags: ['police', 'night shift', 'procedural'],
    syn: 'The graveyard shift of District 9 handles what daylight refuses to: the red line calls.' },

  // ── Films ───────────────────────────────────────────────────────────────────
  { id: 'hollow-point', title: 'Hollow Point', type: 'film', year: 2025, age: 'R', durMin: 118,
    genres: ['Action', 'Thriller'], palette: ['#0c0c0f', '#8a8f9e'], pattern: 'slash', font: 'bebas',
    tags: ['sniper', 'one location', 'siege'], featuredFilm: true,
    syn: 'Trapped in a parking structure by the world’s best sniper, a getaway driver has thirteen floors to become harder to kill.' },
  { id: 'crimson-passport', title: 'Crimson Passport', type: 'film', year: 2026, age: 'PG-13', durMin: 124,
    genres: ['Action', 'Spy'], palette: ['#150608', '#e50914'], pattern: 'fold', font: 'oswald',
    tags: ['espionage', 'double agent', 'europe'],
    syn: 'A courier discovers the passport she carries belongs to a woman who has been dead for thirty years — and every intelligence service wants it back.' },
  { id: 'vermillion', title: 'Vermillion', type: 'film', year: 2026, age: 'R', durMin: 139,
    genres: ['Drama', 'Crime'], palette: ['#160505', '#a01f2e'], pattern: 'glow', font: 'serif',
    tags: ['painter', 'heist', 'obsession'],
    syn: 'A forger falls for the detective hunting her masterpiece. The painting is worth nine million. The lie is worth more.' },
  { id: 'silent-run', title: 'Silent Run', type: 'film', year: 2025, age: 'PG-13', durMin: 106,
    genres: ['Action', 'Sci-Fi'], palette: ['#05080f', '#2e93ff'], pattern: 'grid', font: 'mono',
    tags: ['submarine', 'no dialogue', 'stealth'],
    syn: 'A crippled stealth sub must cross enemy waters with its comms dead and its captain unconscious. Told almost entirely without words.' },
  { id: 'night-ferry', title: 'Night Ferry', type: 'film', year: 2026, age: 'TV-MA', durMin: 98,
    genres: ['Thriller', 'Noir'], palette: ['#04070c', '#1e4a8a'], pattern: 'waves', font: 'serif',
    tags: ['ferry', 'one night', 'stowaway'],
    syn: 'The last ferry out of the harbor carries seven passengers, one crew, and a manifest that lists eight.' },
  { id: 'brine-world', title: 'Brine World', type: 'film', year: 2024, age: 'PG-13', durMin: 131,
    genres: ['Sci-Fi', 'Adventure'], palette: ['#031b1e', '#18c6d8'], pattern: 'rays', font: 'oswald',
    tags: ['ocean planet', 'leviathan', 'expedition'],
    syn: 'On a planet with no land, a salvage crew follows a leviathan’s song to the only dry rock in the universe.' },
  { id: 'after-the-flood', title: 'After the Flood', type: 'film', year: 2023, age: 'TV-14', durMin: 112,
    genres: ['Drama'], palette: ['#0d1210', '#4d7a6b'], pattern: 'fold', font: 'serif',
    tags: ['father daughter', 'rebuilding', 'emotional'],
    syn: 'In a drowned valley, a father and daughter rebuild their house one salvaged plank at a time — and rebuild everything else without saying a word.' },
  { id: 'glass-road', title: 'Glass Road', type: 'film', year: 2025, age: 'R', durMin: 127,
    genres: ['Drama', 'Western'], palette: ['#1a1005', '#c78a3a'], pattern: 'dust', font: 'serif',
    tags: ['desert', 'journey', 'redemption'],
    syn: 'Two enemies must carry a pane of cathedral glass across two hundred miles of desert without breaking it — or each other.' },
  { id: 'the-escape-artist', title: 'The Escape Artist', type: 'film', year: 2024, age: 'PG-13', durMin: 115,
    genres: ['Comedy', 'Drama'], palette: ['#120a18', '#8f5bc7'], pattern: 'strobe', font: 'bebas',
    tags: ['magician', 'prison', 'heartwarming'],
    syn: 'A washed-up escape artist is hired to test the world’s most secure prison. He escapes in nineteen minutes. Getting back in is the hard part.' },
  { id: 'low-winter-sun-f', title: 'Harbor Lights', type: 'film', year: 2022, age: 'TV-MA', durMin: 104,
    genres: ['Noir', 'Crime', 'Drama'], palette: ['#05090f', '#31557a'], pattern: 'glow', font: 'serif',
    tags: ['detective', 'winter', 'moody'],
    syn: 'A detective investigates her own partner’s death in a harbor town where the sun sets at 3pm and nobody mourns out loud.' },
  { id: 'cold-open', title: 'Cold Open', type: 'film', year: 2025, age: 'TV-14', durMin: 96,
    genres: ['Comedy', 'Mystery'], palette: ['#071024', '#365aa0'], pattern: 'grid', font: 'bebas',
    tags: ['murder mystery party', 'satire', 'ensemble'],
    syn: 'A murder-mystery weekend goes wrong when the host actually dies — during the icebreaker.' },

    // ── Playable now — open-license films (CC-BY Blender Foundation) ──────────
  // These titles carry `videoUrl`, so the player plays REAL video. Point any
  // fictional title at your own licensed MP4/WebM (videoUrl / episodeVideos)
  // or HLS .m3u8 stream to make it playable too.
  { id: 'big-buck-bunny', title: 'Big Buck Bunny', type: 'film', year: 2008, age: 'TV-PG', durMin: 10,
    genres: ['Animation', 'Comedy', 'Family'], palette: ['#0c2410', '#4d8f2a'], pattern: 'rays', font: 'bebas',
    videoUrl: 'https://cdn.theoplayer.com/video/big_buck_bunny/big_buck_bunny.m3u8',
    tags: ['open movie', 'short', 'forest', 'rabbit', 'CC-BY Blender Foundation'],
    syn: 'A gentle giant of a rabbit wakes to a beautiful spring day — then declares cartoon war on three bullying rodents. (© Blender Foundation, CC-BY 3.0 — open movie.)' },
  { id: 'tears-of-steel', title: 'Tears of Steel', type: 'film', year: 2012, age: 'TV-14', durMin: 12,
    genres: ['Sci-Fi', 'Live Action', 'VFX'], palette: ['#0a0f1c', '#35538a'], pattern: 'grid', font: 'mono',
    videoUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    tags: ['open movie', 'amsterdam', 'robots', 'apocalypse', 'CC-BY Blender Foundation'],
    syn: 'Forty years after a breakup under a bridge in Amsterdam, a group of scientists uses memory itself to weaponize the past against a robot apocalypse. (© Blender Foundation, CC-BY 3.0.)' },
  { id: 'elephants-dream', title: 'Elephants Dream', type: 'film', year: 2006, age: 'TV-PG', durMin: 11,
    genres: ['Animation', 'Sci-Fi', 'Short'], palette: ['#160826', '#8a3dc7'], pattern: 'fold', font: 'serif',
    videoUrl: 'https://cdn.theoplayer.com/video/elephants-dream/playlist.m3u8',
    tags: ['open movie', 'machine', 'surreal', 'CC-BY Blender Foundation'],
    syn: 'Two travelers ride an infinite, malfunctioning machine-world and disagree about what it is. The very first Blender open movie. (© Blender Foundation, CC-BY 3.0 — subtitles & multi-audio included.)' },

  // ── Coming soon ─────────────────────────────────────────────────────────────
  { id: 'red-horizon', title: 'Red Horizon', type: 'series', year: 2027, age: 'TV-MA', seasons: 1,
    comingSoon: 'November', palette: ['#170607', '#e50914'], pattern: 'ember', font: 'bebas',
    genres: ['Sci-Fi', 'Thriller'], tags: ['mars', 'colony', 'sabotage'],
    syn: 'The first Martian colony votes to cut contact with Earth. Someone on the surface disagrees.' },
  { id: 'drift-state', title: 'Drift State', type: 'series', year: 2027, age: 'TV-14', seasons: 1,
    comingSoon: 'December', palette: ['#04101c', '#2e93ff'], pattern: 'waves', font: 'oswald',
    genres: ['Drama', 'Adventure'], tags: ['floating city', 'ocean', 'politics'],
    syn: 'A floating city-state the size of Manhattan drifts into neutral waters — and starts a bidding war between nations.' },
  { id: 'night-market', title: 'Night Market', type: 'film', year: 2027, age: 'R', durMin: 121,
    comingSoon: 'October', palette: ['#120614', '#c72e8f'], pattern: 'strobe', font: 'serif',
    genres: ['Fantasy', 'Thriller'], tags: ['hidden market', 'memories', 'trade'],
    syn: 'Once a year, in a city that never agrees on where, the Night Market opens — selling things that cannot be bought anywhere else. Like October, 1996.' },
  { id: 'the-pale-cart', title: 'The Pale Cartographer', type: 'series', year: 2027, age: 'TV-MA', seasons: 1,
    comingSoon: 'Coming 2027', palette: ['#0c0c0c', '#6b6b8a'], pattern: 'fold', font: 'serif',
    genres: ['Fantasy', 'Mystery'], tags: ['maps', 'afterlife', 'sequel'],
    syn: 'The sequel to a map nobody was meant to finish. A cartography of everywhere the living cannot go.' }
]

// ── deterministic helpers ────────────────────────────────────────────────────
const hash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }

// User-uploaded licensed titles (via the Library Manager — localStorage `sh.custom`)
const CUSTOM_ACCENTS = [['#0b1220', '#2e93ff'], ['#1a070c', '#e50914'], ['#06131f', '#18c6d8']]
function readCustomRaw () {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = JSON.parse(localStorage.getItem('sh.custom') || '[]')
    if (!Array.isArray(raw)) return []
    return raw
      .filter((j) => j && j.id && j.title)
      .map((j, i) => ({
        id: String(j.id),
        custom: true,
        title: String(j.title).slice(0, 80),
        type: j.type === 'series' ? 'series' : 'film',
        year: Number(j.year) || new Date().getFullYear(),
        age: ['TV-MA', 'TV-14', 'TV-PG', 'PG-13', 'R'].includes(j.age) ? j.age : 'TV-14',
        seasons: j.type === 'series' ? Math.max(1, parseInt(j.seasons, 10) || 1) : undefined,
        durMin: j.type !== 'series' ? (parseInt(j.durMin, 10) || 90) : undefined,
        genres: Array.isArray(j.genres) && j.genres.length ? j.genres.map(String).slice(0, 4) : ['Drama'],
        palette: CUSTOM_ACCENTS[i % CUSTOM_ACCENTS.length],
        pattern: 'glow', font: 'bebas',
        tags: Array.isArray(j.tags) ? j.tags.map(String) : ['licensed', 'uploaded'],
        syn: String(j.syn || j.description || `${j.title} — from your licensed library.`),
        videoUrl: typeof j.videoUrl === 'string' && j.videoUrl ? j.videoUrl : undefined,
        episodeVideos: Array.isArray(j.episodeVideos) ? j.episodeVideos.filter((u) => typeof u === 'string' && u) : undefined,
        backdrop: typeof j.backdrop === 'string' && j.backdrop ? j.backdrop : undefined
      }))
  } catch { return [] }
}

const ALL_RAW = [...RAW, ...readCustomRaw()]

const ADVISORY = {
  'TV-MA': 'smoking, language, violence',
  'TV-14': 'fear, language, violence',
  'TV-PG': 'mild language, thematic elements',
  'PG-13': 'violence, some language',
  R: 'strong violence, language'
}

const EPS = [
  ['Cold Open', 'A body, a signal, a debt — the first hour redraws the map.'],
  ['Smoke Signals', 'An old contact resurfaces with information that should have stayed buried.'],
  ['Trust Exercise', 'A test of loyalty goes wrong, and the fallout changes the balance forever.'],
  ['The Ledger', 'Every name in the book has a price. Tonight one gets collected.'],
  ['Fault Lines', 'The ground shifts — literally and otherwise — as alliances crack open.'],
  ['Static', 'A message gets through that was never meant to be heard.'],
  ['Homecoming', 'A return to where it started reveals how much was left unsaid.'],
  ['The Long Way Down', 'There is no clean exit. Only the slow one.'],
  ['Paper Trails', 'The truth is in the paperwork — and someone is shredding fast.'],
  ['Echoes', 'The past repeats itself with a horrifying new ending.'],
  ['Run Silent', 'One hallway, no weapons, and forty minutes of bad decisions.'],
  ['The Crossing', 'To get home, they have to go through the one place no one survives.'],
  ['Zero Hour', 'Everything planned comes due at once.'],
  ['Aftermath', 'The dust settles on a victory that feels nothing like one.'],
  ['Breadcrumbs', 'A trail of small lies finally leads somewhere big.'],
  ['Night Work', 'Whatever the day shift couldn’t fix, the night shift buries.'],
  ['The Offer', 'An offer is made that cannot be refused. It is refused.'],
  ['Red Line', 'Someone crosses the line. Everyone pays the toll.']
]

const CAST = [
  'Anaya Rao', 'Devan Cole', 'Mira Kade', 'Jonas Pike', 'Leandra Moss', 'Rhett Calder',
  'Sofia Venn', 'Idris Hale', 'Petra Lin', 'Marcus Frye', 'Noor Abbasi', 'Tomas Reyes',
  'Elena Marsh', 'Kellan Ward', 'June Park', 'Viktor Saye', 'Amara Osei', 'Rhian Okafor'
]
const CREATORS = ['Sable & Norr', 'M. Vasquez', 'The Dahl Collective', 'Ines Moreau', 'R. Osei-Bonsu', 'Harlan Kydd']

const fmtDur = (min) => `${Math.floor(min / 60)}h ${min % 60}m`

export const SHOWS = ALL_RAW.map((r, i) => {
  const h = hash(r.id)
  const match = 86 + (h % 13)
  const episodes = r.type === 'series'
    ? Array.from({ length: Math.min(8, 5 + (h % 4)) }, (_, k) => ({
        n: k + 1,
        title: EPS[(h + k * 3) % EPS.length][0],
        syn: EPS[(h * 2 + k) % EPS.length][1],
        dur: 39 + ((h + k * 7) % 22) + 'm'
      }))
    : null
  return {
    ...r,
    match,
    episodes,
    len: r.type === 'series' ? `${r.seasons} Season${r.seasons > 1 ? 's' : ''}` : fmtDur(r.durMin),
    advisory: ADVISORY[r.age] || ADVISORY['TV-14'],
    cast: Array.from({ length: 5 }, (_, k) => CAST[(h + k * 5) % CAST.length]),
    creator: CREATORS[h % CREATORS.length],
    flavor: ['Suspenseful', 'Gritty', 'Cerebral', 'Dark', 'Emotional', 'Irreverent'][h % 6],
    searchText: [r.title, r.type, ...r.genres, ...r.tags].join(' ').toLowerCase(),
    rankPos: i
  }
})

export const byId = Object.fromEntries(SHOWS.map((s) => [s.id, s]))

export const FEATURED = ['neon-district', 'iron-harbor', 'the-long-dark'].map((id) => byId[id])

const S = (ids) => ids.map((id) => byId[id]).filter(Boolean)
const series = (ids) => S(ids).filter((x) => x.type === 'series')
const films = (ids) => S(ids).filter((x) => x.type === 'film')

export const ROWS = {
  home: [
    { key: 'trending', title: 'Trending Now', variant: 'land',
      items: S(['neon-district', 'hollow-point', 'group-chat', 'the-long-dark', 'crimson-passport', 'static', 'marrow-deep', 'the-interns', 'vermillion', 'blackout-avenue', 'night-ferry', 'kingdom-of-ash']) },
    { key: 'playnow', title: 'Playable Now · Free & Open Cinema (real streams)', variant: 'land',
      items: S(['big-buck-bunny', 'tears-of-steel', 'elephants-dream']) },
    { key: 'originals', title: 'Only on Series Hub', variant: 'original',
      items: S(['neon-district', 'iron-harbor', 'the-long-dark', 'glasshouse', 'bone-orchard', 'saltline', 'midnight-circuit', 'the-undertow', 'vigil-9', 'kingdom-of-ash']) },
    { key: 'top10', title: 'Top 10 on Series Hub Today', variant: 'top10',
      items: S(['neon-district', 'iron-harbor', 'vigil-9', 'static', 'the-long-dark', 'saltline', 'kingdom-of-ash', 'marrow-deep', 'glasshouse', 'bone-orchard']) },
    { key: 'drama', title: 'Award-Worthy TV Dramas', variant: 'land',
      items: S(['glasshouse', 'paper-straits', 'amber-line', 'the-undertow', 'calling-hours', 'the-gallery', 'stringer', 'verdict', 'after-the-flood']) },
    { key: 'new', title: 'New Releases', variant: 'land',
      items: S(['neon-district', 'the-long-dark', 'vigil-9', 'vermillion', 'zero-kelvin', 'group-chat', 'night-ferry', 'punchline-lane', 'moth-house', 'cold-open']) },
    { key: 'action', title: 'Adrenaline Rush: Action & Thrillers', variant: 'land',
      items: S(['midnight-circuit', 'blackout-avenue', 'hollow-point', 'crimson-passport', 'strike-vector', 'red-line-pd', 'silent-run', 'bone-orchard']) },
    { key: 'scifi', title: 'Sci-Fi & Fantasy Worlds', variant: 'land',
      items: S(['the-long-dark', 'static', 'orion-falls', 'the-signal-tide', 'zero-kelvin', 'kingdom-of-ash', 'brine-world', 'vigil-9']) },
    { key: 'comedy', title: 'Comedies Worth Your Weekend', variant: 'land',
      items: S(['group-chat', 'the-interns', 'flatmates', 'uncle-finance', 'brunch-club', 'punchline-lane', 'low-stakes', 'the-substitute-s', 'cold-open']) },
    { key: 'horror', title: 'Midnight Frights', variant: 'land',
      items: S(['moth-house', 'marrow-deep', 'dont-answer', 'the-welling', 'feast-of-june', 'static']) },
    { key: 'films', title: 'Blockbuster Films', variant: 'land',
      items: S(['vermillion', 'hollow-point', 'crimson-passport', 'night-ferry', 'silent-run', 'brine-world', 'glass-road', 'the-escape-artist']) }
  ],
  series: [
    { key: 'ts-trend', title: 'Trending TV Shows', variant: 'land',
      items: series(['neon-district', 'the-long-dark', 'static', 'group-chat', 'vigil-9', 'saltline', 'verdict', 'orion-falls', 'flatmates', 'marrow-deep']) },
    { key: 'ts-top10', title: 'Top 10 TV Shows Today', variant: 'top10',
      items: series(['neon-district', 'iron-harbor', 'vigil-9', 'static', 'the-long-dark', 'saltline', 'kingdom-of-ash', 'marrow-deep', 'glasshouse', 'bone-orchard']) },
    { key: 'ts-orig', title: 'Series Hub Original Series', variant: 'original',
      items: S(['neon-district', 'iron-harbor', 'the-long-dark', 'glasshouse', 'bone-orchard', 'saltline', 'midnight-circuit', 'the-undertow', 'vigil-9', 'kingdom-of-ash']) },
    { key: 'ts-drama', title: 'TV Dramas', variant: 'land',
      items: series(['glasshouse', 'paper-straits', 'amber-line', 'the-undertow', 'calling-hours', 'the-gallery', 'stringer', 'verdict']) },
    { key: 'ts-comedy', title: 'TV Comedies', variant: 'land',
      items: series(['group-chat', 'the-interns', 'flatmates', 'uncle-finance', 'brunch-club', 'punchline-lane', 'low-stakes', 'the-substitute-s']) },
    { key: 'ts-genre', title: 'Sci-Fi, Fantasy & Horror TV', variant: 'land',
      items: series(['the-long-dark', 'static', 'orion-falls', 'the-signal-tide', 'zero-kelvin', 'kingdom-of-ash', 'marrow-deep', 'moth-house', 'dont-answer', 'the-welling']) }
  ],
  films: [
    { key: 'fm-trend', title: 'Trending Films', variant: 'land',
      items: films(['hollow-point', 'crimson-passport', 'vermillion', 'night-ferry', 'silent-run', 'brine-world', 'glass-road', 'cold-open']) },
    { key: 'fm-play', title: 'Playable Now · Free & Open Cinema (real streams)', variant: 'land',
      items: S(['big-buck-bunny', 'tears-of-steel', 'elephants-dream']) },
    { key: 'fm-action', title: 'Action & Thriller Films', variant: 'land',
      items: films(['hollow-point', 'crimson-passport', 'silent-run', 'night-ferry', 'glass-road']) },
    { key: 'fm-drama', title: 'Critically Acclaimed Dramas', variant: 'land',
      items: films(['vermillion', 'after-the-flood', 'glass-road', 'low-winter-sun-f']) },
    { key: 'fm-scifi', title: 'Sci-Fi Cinema', variant: 'land',
      items: films(['brine-world', 'silent-run', 'the-escape-artist']) },
    { key: 'fm-comedy', title: 'Comedy Films', variant: 'land',
      items: films(['cold-open', 'the-escape-artist']) }
  ],
  fresh: [
    { key: 'nw-week', title: 'New on Series Hub', variant: 'land',
      items: S(['neon-district', 'the-long-dark', 'vigil-9', 'vermillion', 'crimson-passport', 'zero-kelvin', 'night-ferry', 'group-chat', 'red-line-pd']) },
    { key: 'nw-coming', title: 'Worth the Wait: Coming Soon', variant: 'land',
      items: S(['red-horizon', 'drift-state', 'night-market', 'the-pale-cart']) },
    { key: 'nw-series', title: 'New TV Series', variant: 'land',
      items: series(['neon-district', 'the-long-dark', 'vigil-9', 'zero-kelvin', 'group-chat', 'punchline-lane', 'calling-hours', 'orion-falls', 'moth-house']) },
    { key: 'nw-films', title: 'New Films', variant: 'land',
      items: films(['vermillion', 'crimson-passport', 'night-ferry', 'silent-run', 'cold-open', 'hollow-point']) },
    { key: 'nw-again', title: 'Everyone’s Watching', variant: 'land',
      items: S(['neon-district', 'iron-harbor', 'kingdom-of-ash', 'static', 'saltline', 'midnight-circuit', 'the-interns', 'bone-orchard']) }
  ]
}

export function searchCatalog (q) {
  const t = q.trim().toLowerCase()
  if (!t) return []
  const words = t.split(/\s+/)
  return SHOWS.filter((s) => words.every((w) => s.searchText.includes(w)))
    .sort((a, b) => (a.title.toLowerCase().startsWith(t) ? -1 : 0) - (b.title.toLowerCase().startsWith(t) ? -1 : 0) || b.match - a.match)
    .slice(0, 24)
}

export function moreLikeThis (show, n = 9) {
  return SHOWS
    .filter((s) => s.id !== show.id && s.type === show.type)
    .map((s) => [s.genres.filter((g) => show.genres.includes(g)).length + s.match / 1000, s])
    .sort((a, b) => b[0] - a[0])
    .slice(0, n)
    .map(([, s]) => s)
}
