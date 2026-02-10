// PokeMemes #101-151
import type { PokeMemeData } from './pokememeIndex';

export const pokememeData3: PokeMemeData[] = [
  // HODL (Electrode)
  {
    id: 101,
    name: "Hodltrode",
    originalName: "Electrode",
    memeToken: "HODL",
    types: ["Electric"],
    baseStats: { hp: 60, attack: 50, defense: 70, spAttack: 80, spDefense: 80, speed: 150 },
    signatureMove: { name: "Diamond Explosion", type: "Electric", power: 200, accuracy: 100, pp: 5, description: "Explodes with diamond hands energy but never sells", isSignature: true },
    learnableMoves: ["Thunder", "Explosion", "Magnet Rise", "Mirror Coat", "Gyro Ball"],
    description: "About to explode but HODLs anyway. Maximum diamond hands.",
    spriteKey: "pokememe_101_hodltrode"
  },
  // Monke line
  {
    id: 102,
    name: "Monkegg",
    originalName: "Exeggcute",
    memeToken: "Monke",
    types: ["Grass", "Psychic"],
    baseStats: { hp: 60, attack: 40, defense: 80, spAttack: 60, spDefense: 45, speed: 40 },
    evolutionLevel: 0,
    evolvesTo: 103,
    signatureMove: { name: "Monke Together", type: "Psychic", power: 60, accuracy: 100, pp: 20, description: "Monke together strong. Six monke eggs unite.", isSignature: true },
    learnableMoves: ["Confusion", "Leech Seed", "Bullet Seed", "Psychic", "Solar Beam"],
    description: "Six monkey eggs together. Monke together strong.",
    spriteKey: "pokememe_102_monkegg"
  },
  {
    id: 103,
    name: "Monkegutor",
    originalName: "Exeggutor",
    memeToken: "Monke",
    types: ["Grass", "Psychic"],
    baseStats: { hp: 95, attack: 95, defense: 85, spAttack: 125, spDefense: 75, speed: 55 },
    signatureMove: { name: "Return to Monke", type: "Grass", power: 120, accuracy: 90, pp: 10, description: "Returns to monke with devastating primal force", isSignature: true },
    learnableMoves: ["Psychic", "Leaf Storm", "Wood Hammer", "Stomp", "Trick Room"],
    description: "Reject modernity, return to monke. A walking monkey tree.",
    spriteKey: "pokememe_103_monkegutor"
  },
  // Soyjak line
  {
    id: 104,
    name: "Soybone",
    originalName: "Cubone",
    memeToken: "Soyjak",
    types: ["Ground"],
    baseStats: { hp: 50, attack: 50, defense: 95, spAttack: 40, spDefense: 50, speed: 35 },
    evolutionLevel: 28,
    evolvesTo: 105,
    signatureMove: { name: "Soy Point", type: "Ground", power: 65, accuracy: 100, pp: 20, description: "Points excitedly at the enemy with open mouth", isSignature: true },
    learnableMoves: ["Bone Club", "Bonemerang", "Bone Rush", "Earthquake", "Fire Punch"],
    description: "Wears a skull mask. Points at everything with mouth wide open.",
    spriteKey: "pokememe_104_soybone"
  },
  {
    id: 105,
    name: "Soywak",
    originalName: "Marowak",
    memeToken: "Soyjak",
    types: ["Ground"],
    baseStats: { hp: 60, attack: 80, defense: 110, spAttack: 50, spDefense: 80, speed: 45 },
    signatureMove: { name: "Open Mouth Strike", type: "Ground", power: 100, accuracy: 90, pp: 10, description: "Opens mouth wide and strikes with soy bone", isSignature: true },
    learnableMoves: ["Bone Rush", "Earthquake", "Stone Edge", "Swords Dance", "Thunder Punch"],
    description: "Overcame its soy nature. Still points at things excitedly.",
    spriteKey: "pokememe_105_soywak"
  },
  // Pog
  {
    id: 106,
    name: "Pogmonlee",
    originalName: "Hitmonlee",
    memeToken: "Pog",
    types: ["Fighting"],
    baseStats: { hp: 50, attack: 120, defense: 53, spAttack: 35, spDefense: 110, speed: 87 },
    signatureMove: { name: "Poggers Kick", type: "Fighting", power: 130, accuracy: 85, pp: 5, description: "A poggers-worthy kick that goes viral", isSignature: true },
    learnableMoves: ["High Jump Kick", "Mega Kick", "Blaze Kick", "Close Combat", "Earthquake"],
    description: "Its kicks are so poggers. PogChamp face on every hit.",
    spriteKey: "pokememe_106_pogmonlee"
  },
  // Based
  {
    id: 107,
    name: "Basedchan",
    originalName: "Hitmonchan",
    memeToken: "Based",
    types: ["Fighting"],
    baseStats: { hp: 50, attack: 105, defense: 79, spAttack: 35, spDefense: 110, speed: 76 },
    signatureMove: { name: "Based Punch", type: "Fighting", power: 120, accuracy: 90, pp: 10, description: "An extremely based punch. No cap.", isSignature: true },
    learnableMoves: ["Fire Punch", "Ice Punch", "Thunder Punch", "Mach Punch", "Drain Punch"],
    description: "The most based fighter. Every punch is based and redpilled.",
    spriteKey: "pokememe_107_basedchan"
  },
  // GOAT
  {
    id: 108,
    name: "Lickigoat",
    originalName: "Lickitung",
    memeToken: "GOAT",
    types: ["Normal"],
    baseStats: { hp: 90, attack: 55, defense: 75, spAttack: 60, spDefense: 75, speed: 30 },
    signatureMove: { name: "GOAT Lick", type: "Normal", power: 70, accuracy: 100, pp: 15, description: "The Greatest Of All Time lick attack", isSignature: true },
    learnableMoves: ["Lick", "Body Slam", "Power Whip", "Knock Off", "Earthquake"],
    description: "The GOAT of licking. Greatest Of All Time. No debate.",
    spriteKey: "pokememe_108_lickigoat"
  },
  // Cap line
  {
    id: 109,
    name: "Cappfing",
    originalName: "Koffing",
    memeToken: "Cap",
    types: ["Poison"],
    baseStats: { hp: 40, attack: 65, defense: 95, spAttack: 60, spDefense: 45, speed: 35 },
    evolutionLevel: 35,
    evolvesTo: 110,
    signatureMove: { name: "No Cap", type: "Poison", power: 50, accuracy: 100, pp: 25, description: "Attacks with no cap energy. Fr fr.", isSignature: true },
    learnableMoves: ["Sludge", "Smog", "Self-Destruct", "Sludge Bomb", "Toxic"],
    description: "Filled with cap gas. No cap, it's actually toxic.",
    spriteKey: "pokememe_109_cappfing"
  },
  {
    id: 110,
    name: "Capzing",
    originalName: "Weezing",
    memeToken: "Cap",
    types: ["Poison"],
    baseStats: { hp: 65, attack: 90, defense: 120, spAttack: 85, spDefense: 70, speed: 60 },
    signatureMove: { name: "That's Cap", type: "Poison", power: 120, accuracy: 85, pp: 5, description: "Calls cap and unleashes toxic truth gas", isSignature: true },
    learnableMoves: ["Sludge Bomb", "Fire Blast", "Shadow Ball", "Explosion", "Toxic Spikes"],
    description: "Double the heads, double the cap. That's cap fr fr.",
    spriteKey: "pokememe_110_capzing"
  },
  // TRUMP line
  {
    id: 111,
    name: "Trumphorn",
    originalName: "Rhyhorn",
    memeToken: "TRUMP",
    types: ["Ground", "Rock"],
    baseStats: { hp: 80, attack: 85, defense: 95, spAttack: 30, spDefense: 30, speed: 25 },
    evolutionLevel: 42,
    evolvesTo: 112,
    signatureMove: { name: "MAGA Charge", type: "Rock", power: 70, accuracy: 100, pp: 20, description: "Charges with tremendous energy. Believe me.", isSignature: true },
    learnableMoves: ["Horn Attack", "Rock Blast", "Earthquake", "Stone Edge", "Megahorn"],
    description: "Charges forward with a golden horn. Very tremendous.",
    spriteKey: "pokememe_111_trumphorn"
  },
  {
    id: 112,
    name: "Trumpdon",
    originalName: "Rhydon",
    memeToken: "TRUMP",
    types: ["Ground", "Rock"],
    baseStats: { hp: 105, attack: 130, defense: 120, spAttack: 45, spDefense: 45, speed: 40 },
    signatureMove: { name: "Bigly Slam", type: "Rock", power: 110, accuracy: 90, pp: 10, description: "The biggest, most tremendous slam in history. Bigly.", isSignature: true },
    learnableMoves: ["Earthquake", "Stone Edge", "Megahorn", "Fire Punch", "Thunder Punch"],
    description: "The biggest, most tremendous creature. Nobody does it better.",
    spriteKey: "pokememe_112_trumpdon"
  },
  // Wholesome
  {
    id: 113,
    name: "Wholesey",
    originalName: "Chansey",
    memeToken: "Wholesome",
    types: ["Normal"],
    baseStats: { hp: 250, attack: 5, defense: 5, spAttack: 35, spDefense: 105, speed: 50 },
    signatureMove: { name: "Wholesome Heal", type: "Normal", power: 0, accuracy: 100, pp: 10, description: "Heals with pure wholesome energy and love", isSignature: true },
    learnableMoves: ["Soft-Boiled", "Seismic Toss", "Thunder Wave", "Heal Bell", "Counter"],
    description: "Pure wholesome energy. Carries an egg of kindness.",
    spriteKey: "pokememe_113_wholesey"
  },
  // WEN
  {
    id: 114,
    name: "Wentangle",
    originalName: "Tangela",
    memeToken: "WEN",
    types: ["Grass"],
    baseStats: { hp: 65, attack: 55, defense: 115, spAttack: 100, spDefense: 40, speed: 60 },
    signatureMove: { name: "Wen Moon", type: "Grass", power: 80, accuracy: 100, pp: 15, description: "Asks wen moon while whipping with vines", isSignature: true },
    learnableMoves: ["Vine Whip", "Power Whip", "Ancient Power", "Giga Drain", "Sleep Powder"],
    description: "Covered in tangled vines. Always asking wen moon, wen lambo.",
    spriteKey: "pokememe_114_wentangle"
  },
  // Karen
  {
    id: 115,
    name: "Karen Mom",
    originalName: "Kangaskhan",
    memeToken: "Karen",
    types: ["Normal"],
    baseStats: { hp: 105, attack: 95, defense: 80, spAttack: 40, spDefense: 80, speed: 90 },
    signatureMove: { name: "Manager Demand", type: "Normal", power: 100, accuracy: 100, pp: 10, description: "Demands to speak to the manager immediately", isSignature: true },
    learnableMoves: ["Fake Out", "Return", "Sucker Punch", "Earthquake", "Power-Up Punch"],
    description: "A protective Karen mom. Will speak to the manager. NOW.",
    spriteKey: "pokememe_115_karen_mom"
  },
  // SLERF line
  {
    id: 116,
    name: "Slerfea",
    originalName: "Horsea",
    memeToken: "SLERF",
    types: ["Water"],
    baseStats: { hp: 30, attack: 40, defense: 70, spAttack: 70, spDefense: 25, speed: 60 },
    evolutionLevel: 32,
    evolvesTo: 117,
    signatureMove: { name: "Slerf Splash", type: "Water", power: 50, accuracy: 100, pp: 25, description: "An unfortunate slippery splash. Oops.", isSignature: true },
    learnableMoves: ["Bubble", "Water Gun", "Dragon Pulse", "Ice Beam", "Agility"],
    description: "A clumsy seahorse that accidentally burns things. Just like SLERF.",
    spriteKey: "pokememe_116_slerfea"
  },
  {
    id: 117,
    name: "Slerfadra",
    originalName: "Seadra",
    memeToken: "SLERF",
    types: ["Water"],
    baseStats: { hp: 55, attack: 65, defense: 95, spAttack: 95, spDefense: 45, speed: 85 },
    signatureMove: { name: "Slerf Burn", type: "Water", power: 85, accuracy: 100, pp: 15, description: "Burns LP tokens by accident. Classic SLERF.", isSignature: true },
    learnableMoves: ["Hydro Pump", "Dragon Pulse", "Ice Beam", "Signal Beam", "Agility"],
    description: "Accidentally burned its own LP. Still vibing somehow.",
    spriteKey: "pokememe_117_slerfadra"
  },
  // Ratio line
  {
    id: 118,
    name: "Ratiodeen",
    originalName: "Goldeen",
    memeToken: "Ratio",
    types: ["Water"],
    baseStats: { hp: 45, attack: 67, defense: 60, spAttack: 35, spDefense: 50, speed: 63 },
    evolutionLevel: 33,
    evolvesTo: 119,
    signatureMove: { name: "Ratio'd", type: "Water", power: 50, accuracy: 100, pp: 25, description: "Gets ratioed but counter-attacks harder", isSignature: true },
    learnableMoves: ["Horn Attack", "Waterfall", "Megahorn", "Poison Jab", "Agility"],
    description: "A golden fish that ratios everyone in the comments.",
    spriteKey: "pokememe_118_ratiodeen"
  },
  {
    id: 119,
    name: "Ratioking",
    originalName: "Seaking",
    memeToken: "Ratio",
    types: ["Water"],
    baseStats: { hp: 80, attack: 92, defense: 65, spAttack: 65, spDefense: 80, speed: 68 },
    signatureMove: { name: "Counter Ratio", type: "Water", power: 100, accuracy: 90, pp: 10, description: "The ultimate ratio that reverses everything", isSignature: true },
    learnableMoves: ["Megahorn", "Waterfall", "Drill Run", "Poison Jab", "Knock Off"],
    description: "The king of ratios. Nobody out-ratios the Ratioking.",
    spriteKey: "pokememe_119_ratioking"
  },
  // Galaxy Brain line
  {
    id: 120,
    name: "Galaxyu",
    originalName: "Staryu",
    memeToken: "Galaxy Brain",
    types: ["Water"],
    baseStats: { hp: 30, attack: 45, defense: 55, spAttack: 70, spDefense: 55, speed: 85 },
    evolutionLevel: 0,
    evolvesTo: 121,
    signatureMove: { name: "Big Brain", type: "Water", power: 55, accuracy: 100, pp: 25, description: "Thinks with galaxy brain energy", isSignature: true },
    learnableMoves: ["Water Gun", "Rapid Spin", "Psychic", "Thunderbolt", "Ice Beam"],
    description: "A star-shaped creature with a massive brain. Galaxy brain IQ.",
    spriteKey: "pokememe_120_galaxyu"
  },
  {
    id: 121,
    name: "Galaxmie",
    originalName: "Starmie",
    memeToken: "Galaxy Brain",
    types: ["Water", "Psychic"],
    baseStats: { hp: 60, attack: 75, defense: 85, spAttack: 100, spDefense: 85, speed: 115 },
    signatureMove: { name: "Galaxy Brain Blast", type: "Psychic", power: 100, accuracy: 95, pp: 10, description: "An enormous galaxy brain attack of pure intellect", isSignature: true },
    learnableMoves: ["Hydro Pump", "Psychic", "Thunderbolt", "Ice Beam", "Recover"],
    description: "Its core glows with galaxy brain energy. IQ: immeasurable.",
    spriteKey: "pokememe_121_galaxmie"
  },
  // Ligma
  {
    id: 122,
    name: "Mr. Ligma",
    originalName: "Mr. Mime",
    memeToken: "Ligma",
    types: ["Psychic", "Fairy"],
    baseStats: { hp: 40, attack: 45, defense: 65, spAttack: 100, spDefense: 120, speed: 90 },
    signatureMove: { name: "Ligma Wall", type: "Psychic", power: 0, accuracy: 100, pp: 15, description: "Creates an invisible wall of Ligma energy", isSignature: true },
    learnableMoves: ["Psychic", "Dazzling Gleam", "Focus Blast", "Shadow Ball", "Reflect"],
    description: "Mimes invisible walls. What's ligma? Ligma balls.",
    spriteKey: "pokememe_122_mr__ligma"
  },
  // Ohio
  {
    id: 123,
    name: "Ohiother",
    originalName: "Scyther",
    memeToken: "Ohio",
    types: ["Bug", "Flying"],
    baseStats: { hp: 70, attack: 110, defense: 80, spAttack: 55, spDefense: 80, speed: 105 },
    signatureMove: { name: "Ohio Slash", type: "Bug", power: 100, accuracy: 95, pp: 10, description: "Only in Ohio. Slashes with Ohio energy.", isSignature: true },
    learnableMoves: ["X-Scissor", "Aerial Ace", "Swords Dance", "U-turn", "Brick Break"],
    description: "Only in Ohio would a mantis have blade arms. Ohio final boss.",
    spriteKey: "pokememe_123_ohiother"
  },
  // Bruh
  {
    id: 124,
    name: "Bruhjynx",
    originalName: "Jynx",
    memeToken: "Bruh",
    types: ["Ice", "Psychic"],
    baseStats: { hp: 65, attack: 50, defense: 35, spAttack: 115, spDefense: 95, speed: 95 },
    signatureMove: { name: "Bruh Moment", type: "Ice", power: 110, accuracy: 90, pp: 10, description: "Creates a bruh moment that stuns the enemy", isSignature: true },
    learnableMoves: ["Ice Beam", "Psychic", "Lovely Kiss", "Focus Blast", "Nasty Plot"],
    description: "When it appears, everyone says bruh. Maximum bruh energy.",
    spriteKey: "pokememe_124_bruhjynx"
  },
  // PNUT
  {
    id: 125,
    name: "Pnutbuzz",
    originalName: "Electabuzz",
    memeToken: "PNUT",
    types: ["Electric"],
    baseStats: { hp: 65, attack: 83, defense: 57, spAttack: 95, spDefense: 85, speed: 105 },
    signatureMove: { name: "Peanut Zap", type: "Electric", power: 95, accuracy: 100, pp: 10, description: "Zaps with peanut-charged electricity", isSignature: true },
    learnableMoves: ["Thunder Punch", "Thunderbolt", "Cross Chop", "Ice Punch", "Psychic"],
    description: "An electric creature powered by peanuts. PNUT energy.",
    spriteKey: "pokememe_125_pnutbuzz"
  },
  // MICHI
  {
    id: 126,
    name: "Michimarr",
    originalName: "Magmar",
    memeToken: "MICHI",
    types: ["Fire"],
    baseStats: { hp: 65, attack: 95, defense: 57, spAttack: 100, spDefense: 85, speed: 93 },
    signatureMove: { name: "Michi Flame", type: "Fire", power: 110, accuracy: 90, pp: 10, description: "Burns with the fire of the Michi cat meme", isSignature: true },
    learnableMoves: ["Flamethrower", "Fire Blast", "Thunderbolt", "Focus Blast", "Cross Chop"],
    description: "A fire cat creature. The Michi cat in its final form.",
    spriteKey: "pokememe_126_michimarr"
  },
  // Deez
  {
    id: 127,
    name: "Deezir",
    originalName: "Pinsir",
    memeToken: "Deez",
    types: ["Bug"],
    baseStats: { hp: 65, attack: 125, defense: 100, spAttack: 55, spDefense: 70, speed: 85 },
    signatureMove: { name: "Deez Pincers", type: "Bug", power: 110, accuracy: 90, pp: 10, description: "Pinches with the power of deez pincers", isSignature: true },
    learnableMoves: ["X-Scissor", "Superpower", "Stone Edge", "Swords Dance", "Earthquake"],
    description: "Grabs with massive pincers. Deez pincers got you.",
    spriteKey: "pokememe_127_deezir"
  },
  // WAGMI
  {
    id: 128,
    name: "Wagmauros",
    originalName: "Tauros",
    memeToken: "WAGMI",
    types: ["Normal"],
    baseStats: { hp: 75, attack: 100, defense: 95, spAttack: 40, spDefense: 70, speed: 110 },
    signatureMove: { name: "WAGMI Charge", type: "Normal", power: 120, accuracy: 90, pp: 10, description: "We're all gonna make it! Charges with hope!", isSignature: true },
    learnableMoves: ["Body Slam", "Earthquake", "Stone Edge", "Wild Charge", "Zen Headbutt"],
    description: "The ultimate bull of hope. WAGMI! We're all gonna make it!",
    spriteKey: "pokememe_128_wagmauros"
  },
  // Glow Up line
  {
    id: 129,
    name: "Glowkarp",
    originalName: "Magikarp",
    memeToken: "Glow Up",
    types: ["Water"],
    baseStats: { hp: 20, attack: 10, defense: 55, spAttack: 15, spDefense: 20, speed: 80 },
    evolutionLevel: 20,
    evolvesTo: 130,
    signatureMove: { name: "Humble Splash", type: "Water", power: 10, accuracy: 100, pp: 40, description: "A humble splash before the ultimate glow up", isSignature: true },
    learnableMoves: ["Splash", "Tackle", "Flail"],
    description: "Seems useless now. Just wait for the glow up.",
    spriteKey: "pokememe_129_glowkarp"
  },
  {
    id: 130,
    name: "Glowados",
    originalName: "Gyarados",
    memeToken: "Glow Up",
    types: ["Water", "Flying"],
    baseStats: { hp: 95, attack: 125, defense: 79, spAttack: 60, spDefense: 100, speed: 81 },
    signatureMove: { name: "Ultimate Glow Up", type: "Water", power: 150, accuracy: 90, pp: 5, description: "The most insane glow up in history", isSignature: true },
    learnableMoves: ["Hydro Pump", "Hurricane", "Dragon Dance", "Earthquake", "Crunch"],
    description: "The most insane glow up ever. From useless to legendary.",
    spriteKey: "pokememe_130_glowados"
  },
  // Chill Guy
  {
    id: 131,
    name: "Chillpras",
    originalName: "Lapras",
    memeToken: "Chill Guy",
    types: ["Water", "Ice"],
    baseStats: { hp: 130, attack: 85, defense: 80, spAttack: 85, spDefense: 95, speed: 60 },
    signatureMove: { name: "Just Vibing", type: "Ice", power: 100, accuracy: 100, pp: 10, description: "Just vibing and dealing damage. No stress.", isSignature: true },
    learnableMoves: ["Ice Beam", "Surf", "Thunderbolt", "Psychic", "Freeze-Dry"],
    description: "Just a chill guy vibing on the ocean. No worries.",
    spriteKey: "pokememe_131_chillpras"
  },
  // Deepfake
  {
    id: 132,
    name: "Deepfake",
    originalName: "Ditto",
    memeToken: "Deepfake",
    types: ["Normal"],
    baseStats: { hp: 48, attack: 48, defense: 48, spAttack: 48, spDefense: 48, speed: 48 },
    signatureMove: { name: "Deepfake", type: "Normal", power: 0, accuracy: 100, pp: 10, description: "Transforms into a perfect deepfake of the opponent", isSignature: true },
    learnableMoves: ["Transform"],
    description: "Can deepfake itself into anything. Is it real? Nobody knows.",
    spriteKey: "pokememe_132_deepfake"
  },
  // Wojak family (Eevee evolutions)
  {
    id: 133,
    name: "Wojakeon",
    originalName: "Eevee",
    memeToken: "Wojak",
    types: ["Normal"],
    baseStats: { hp: 55, attack: 55, defense: 50, spAttack: 45, spDefense: 65, speed: 55 },
    signatureMove: { name: "Feel Trade", type: "Normal", power: 60, accuracy: 100, pp: 20, description: "Attacks with pure raw emotion", isSignature: true },
    learnableMoves: ["Tackle", "Quick Attack", "Bite", "Swift", "Last Resort"],
    description: "The base Wojak. Can evolve into Doomer, Zoomer, or Bloomer.",
    spriteKey: "pokememe_133_wojakeon"
  },
  {
    id: 134,
    name: "Doomereon",
    originalName: "Vaporeon",
    memeToken: "Doomer",
    types: ["Water"],
    baseStats: { hp: 130, attack: 65, defense: 60, spAttack: 110, spDefense: 95, speed: 65 },
    signatureMove: { name: "Doomer Cry", type: "Water", power: 100, accuracy: 100, pp: 10, description: "Cries with existential doomer dread", isSignature: true },
    learnableMoves: ["Hydro Pump", "Ice Beam", "Shadow Ball", "Wish", "Scald"],
    description: "The sad Wojak evolution. Smokes, existential dread, sad vibes.",
    spriteKey: "pokememe_134_doomereon"
  },
  {
    id: 135,
    name: "Zoomereon",
    originalName: "Jolteon",
    memeToken: "Zoomer",
    types: ["Electric"],
    baseStats: { hp: 65, attack: 65, defense: 60, spAttack: 110, spDefense: 95, speed: 130 },
    signatureMove: { name: "Zoomer Rush", type: "Electric", power: 120, accuracy: 90, pp: 10, description: "Rushes with maximum zoomer energy and TikTok speed", isSignature: true },
    learnableMoves: ["Thunderbolt", "Thunder", "Shadow Ball", "Signal Beam", "Volt Switch"],
    description: "The Zoomer Wojak. Hyper, always on phone, brainrot energy.",
    spriteKey: "pokememe_135_zoomereon"
  },
  {
    id: 136,
    name: "Bloomereon",
    originalName: "Flareon",
    memeToken: "Bloomer",
    types: ["Fire"],
    baseStats: { hp: 65, attack: 130, defense: 60, spAttack: 95, spDefense: 110, speed: 65 },
    signatureMove: { name: "Bloom Blaze", type: "Fire", power: 110, accuracy: 95, pp: 10, description: "Burns with bloomer optimism and positive energy", isSignature: true },
    learnableMoves: ["Flare Blitz", "Superpower", "Fire Blast", "Quick Attack", "Will-O-Wisp"],
    description: "The Bloomer Wojak. Optimistic, happy, touching grass.",
    spriteKey: "pokememe_136_bloomereon"
  },
  // Glitch
  {
    id: 137,
    name: "Glitchgon",
    originalName: "Porygon",
    memeToken: "Glitch",
    types: ["Normal"],
    baseStats: { hp: 65, attack: 60, defense: 70, spAttack: 85, spDefense: 75, speed: 40 },
    signatureMove: { name: "Glitch Attack", type: "Normal", power: 70, accuracy: 100, pp: 15, description: "Attacks with a corrupted glitch. MissingNo vibes.", isSignature: true },
    learnableMoves: ["Tri Attack", "Thunderbolt", "Ice Beam", "Recover", "Conversion"],
    description: "A digital creature full of glitches. MissingNo energy.",
    spriteKey: "pokememe_137_glitchgon"
  },
  // Lord Helix line
  {
    id: 138,
    name: "Helixyte",
    originalName: "Omanyte",
    memeToken: "Lord Helix",
    types: ["Rock", "Water"],
    baseStats: { hp: 35, attack: 40, defense: 100, spAttack: 90, spDefense: 55, speed: 35 },
    evolutionLevel: 40,
    evolvesTo: 139,
    signatureMove: { name: "Helix Prayer", type: "Rock", power: 60, accuracy: 100, pp: 20, description: "Prays to Lord Helix for guidance and power", isSignature: true },
    learnableMoves: ["Water Gun", "Ancient Power", "Surf", "Ice Beam", "Shell Smash"],
    description: "A baby Lord Helix. Praise be. Twitch Plays Pokemon remembers.",
    spriteKey: "pokememe_138_helixyte"
  },
  {
    id: 139,
    name: "Helixstar",
    originalName: "Omastar",
    memeToken: "Lord Helix",
    types: ["Rock", "Water"],
    baseStats: { hp: 70, attack: 60, defense: 125, spAttack: 115, spDefense: 70, speed: 55 },
    signatureMove: { name: "Praise Helix", type: "Rock", power: 130, accuracy: 85, pp: 5, description: "Channels the divine power of Lord Helix", isSignature: true },
    learnableMoves: ["Hydro Pump", "Ice Beam", "Ancient Power", "Earth Power", "Shell Smash"],
    description: "Lord Helix in full glory. Praise be. The one true fossil god.",
    spriteKey: "pokememe_139_helixstar"
  },
  // Dome line
  {
    id: 140,
    name: "Dometop",
    originalName: "Kabuto",
    memeToken: "Dome",
    types: ["Rock", "Water"],
    baseStats: { hp: 30, attack: 80, defense: 90, spAttack: 55, spDefense: 45, speed: 55 },
    evolutionLevel: 40,
    evolvesTo: 141,
    signatureMove: { name: "Dome Shield", type: "Rock", power: 50, accuracy: 100, pp: 25, description: "Protects with the power of Dome", isSignature: true },
    learnableMoves: ["Scratch", "Aqua Jet", "Rock Slide", "X-Scissor", "Swords Dance"],
    description: "Follower of the Dome fossil. The rival of Lord Helix.",
    spriteKey: "pokememe_140_dometop"
  },
  {
    id: 141,
    name: "Domeblade",
    originalName: "Kabutops",
    memeToken: "Dome",
    types: ["Rock", "Water"],
    baseStats: { hp: 60, attack: 115, defense: 105, spAttack: 65, spDefense: 70, speed: 80 },
    signatureMove: { name: "Dome Slash", type: "Rock", power: 110, accuracy: 90, pp: 10, description: "Slashes with Dome's ancient blessing", isSignature: true },
    learnableMoves: ["Stone Edge", "Waterfall", "X-Scissor", "Swords Dance", "Aqua Jet"],
    description: "The blade warrior of Dome. Sharp and ancient.",
    spriteKey: "pokememe_141_domeblade"
  },
  // Gamba
  {
    id: 142,
    name: "Gambadactyl",
    originalName: "Aerodactyl",
    memeToken: "Gamba",
    types: ["Rock", "Flying"],
    baseStats: { hp: 80, attack: 105, defense: 65, spAttack: 60, spDefense: 75, speed: 130 },
    signatureMove: { name: "Gamble Rush", type: "Rock", power: 120, accuracy: 90, pp: 10, description: "Takes a gamble with a devastating all-in dive", isSignature: true },
    learnableMoves: ["Stone Edge", "Earthquake", "Aerial Ace", "Fire Fang", "Crunch"],
    description: "A flying gambler. Goes all in every time. Gamba is life.",
    spriteKey: "pokememe_142_gambadactyl"
  },
  // Grumpy Cat
  {
    id: 143,
    name: "Snarlax",
    originalName: "Snorlax",
    memeToken: "Grumpy Cat",
    types: ["Normal"],
    baseStats: { hp: 160, attack: 110, defense: 65, spAttack: 65, spDefense: 110, speed: 30 },
    signatureMove: { name: "Meh Crush", type: "Normal", power: 140, accuracy: 100, pp: 10, description: "Crushes with maximum grumpy indifference", isSignature: true },
    learnableMoves: ["Body Slam", "Rest", "Sleep Talk", "Earthquake", "Heavy Slam"],
    description: "A giant grumpy sleeping cat. Blocks paths with its attitude.",
    spriteKey: "pokememe_143_snarlax"
  },
  // Drip
  {
    id: 144,
    name: "Dripcuno",
    originalName: "Articuno",
    memeToken: "Drip",
    types: ["Ice", "Flying"],
    baseStats: { hp: 90, attack: 85, defense: 100, spAttack: 95, spDefense: 125, speed: 85 },
    signatureMove: { name: "Ice Drip", type: "Ice", power: 140, accuracy: 90, pp: 5, description: "Freezes with maximum drip. Absolute ice.", isSignature: true },
    learnableMoves: ["Ice Beam", "Hurricane", "Freeze-Dry", "Roost", "Ancient Power"],
    description: "The legendary bird of ice drip. Maximum swag.",
    spriteKey: "pokememe_144_dripcuno"
  },
  // Bussin
  {
    id: 145,
    name: "Bussindos",
    originalName: "Zapdos",
    memeToken: "Bussin",
    types: ["Electric", "Flying"],
    baseStats: { hp: 90, attack: 90, defense: 85, spAttack: 125, spDefense: 90, speed: 100 },
    signatureMove: { name: "Bussin Bolt", type: "Electric", power: 140, accuracy: 90, pp: 5, description: "This bolt is bussin fr fr no cap", isSignature: true },
    learnableMoves: ["Thunderbolt", "Hurricane", "Heat Wave", "Roost", "Volt Switch"],
    description: "The legendary bird of bussin energy. Fr fr.",
    spriteKey: "pokememe_145_bussindos"
  },
  // It's Lit
  {
    id: 146,
    name: "Litres",
    originalName: "Moltres",
    memeToken: "It's Lit",
    types: ["Fire", "Flying"],
    baseStats: { hp: 90, attack: 100, defense: 90, spAttack: 125, spDefense: 85, speed: 90 },
    signatureMove: { name: "Lit Fire", type: "Fire", power: 140, accuracy: 90, pp: 5, description: "It's literally lit. Maximum flames.", isSignature: true },
    learnableMoves: ["Fire Blast", "Hurricane", "Solar Beam", "Roost", "Will-O-Wisp"],
    description: "The legendary bird of fire. It's lit fam. Straight fire.",
    spriteKey: "pokememe_146_litres"
  },
  // Rare line
  {
    id: 147,
    name: "Raretini",
    originalName: "Dratini",
    memeToken: "Rare",
    types: ["Dragon"],
    baseStats: { hp: 41, attack: 64, defense: 45, spAttack: 50, spDefense: 50, speed: 50 },
    evolutionLevel: 30,
    evolvesTo: 148,
    signatureMove: { name: "Rare Find", type: "Dragon", power: 50, accuracy: 100, pp: 25, description: "A rare attack that few have ever witnessed", isSignature: true },
    learnableMoves: ["Wrap", "Dragon Rage", "Aqua Tail", "Dragon Rush", "Dragon Dance"],
    description: "A small rare dragon. Extremely hard to find.",
    spriteKey: "pokememe_147_raretini"
  },
  {
    id: 148,
    name: "Rareair",
    originalName: "Dragonair",
    memeToken: "Rare",
    types: ["Dragon"],
    baseStats: { hp: 61, attack: 84, defense: 65, spAttack: 70, spDefense: 70, speed: 70 },
    evolutionLevel: 55,
    evolvesTo: 149,
    signatureMove: { name: "Ultra Rare", type: "Dragon", power: 80, accuracy: 100, pp: 15, description: "An ultra rare dragon dance of power", isSignature: true },
    learnableMoves: ["Dragon Pulse", "Aqua Tail", "Dragon Dance", "Thunderbolt", "Ice Beam"],
    description: "Its crystal orbs glow with rare energy. Ultra rare specimen.",
    spriteKey: "pokememe_148_rareair"
  },
  {
    id: 149,
    name: "Rarenite",
    originalName: "Dragonite",
    memeToken: "Rare",
    types: ["Dragon", "Flying"],
    baseStats: { hp: 91, attack: 134, defense: 95, spAttack: 100, spDefense: 100, speed: 80 },
    signatureMove: { name: "Legendary Rare", type: "Dragon", power: 150, accuracy: 90, pp: 5, description: "The rarest attack in existence. Legendary.", isSignature: true },
    learnableMoves: ["Outrage", "Extreme Speed", "Fire Punch", "Earthquake", "Dragon Dance"],
    description: "The rarest dragon. Legendary tier. 1 of 1.",
    spriteKey: "pokememe_149_rarenite"
  },
  // GG
  {
    id: 150,
    name: "GGtwo",
    originalName: "Mewtwo",
    memeToken: "GG",
    types: ["Psychic"],
    baseStats: { hp: 106, attack: 110, defense: 90, spAttack: 154, spDefense: 90, speed: 130 },
    signatureMove: { name: "GG EZ", type: "Psychic", power: 200, accuracy: 85, pp: 1, description: "Says GG EZ and unleashes devastating psychic power", isSignature: true },
    learnableMoves: ["Psychic", "Shadow Ball", "Aura Sphere", "Ice Beam", "Recover"],
    description: "The ultimate PokeMeme. When it appears, it's GG. No re.",
    spriteKey: "pokememe_150_ggtwo"
  },
  // OG
  {
    id: 151,
    name: "OGmew",
    originalName: "Mew",
    memeToken: "OG",
    types: ["Psychic"],
    baseStats: { hp: 100, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100 },
    signatureMove: { name: "OG Transform", type: "Psychic", power: 0, accuracy: 100, pp: 10, description: "The OG. Can transform into any meme ever created.", isSignature: true },
    learnableMoves: ["Transform", "Psychic", "Aura Sphere", "Ancient Power", "Metronome"],
    description: "The OG meme. Contains the DNA of all memes ever created.",
    spriteKey: "pokememe_151_ogmew"
  }
];
