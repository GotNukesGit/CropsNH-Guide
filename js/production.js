
// ── CONSTANTS ────────────────────────────────────────────────────────────────
const TICK_RATE=256, GAME_TPS=20, CROP_TICK_S=TICK_RATE/GAME_TPS; // 12.8s
const BC=6, BN=5, NPS=5, NPT=10, SKY=2, LBB=14, HHB=14;

// ── STATE ────────────────────────────────────────────────────────────────────
let selectedBiome=null, selectedCrop=null, cropQty=9;
let hasSky=true, waterFull=true, fertFull=true;

// ── BIOME DATABASE ───────────────────────────────────────────────────────────
// Source: Forge BiomeDictionary + BoP biome registrations
const BIOMES={
  "Ocean":["OCEAN"],
  "Plains":["PLAINS"],
  "Desert":["HOT","DRY","SANDY"],
  "Extreme Hills":["MOUNTAIN","HILLS"],
  "Forest":["FOREST"],
  "Taiga":["COLD","CONIFEROUS","FOREST"],
  "Swampland":["WET","SWAMP"],
  "River":["RIVER"],
  "Hell":["HOT","DRY","NETHER"],
  "Sky":["COLD","DRY","END"],
  "FrozenOcean":["COLD","OCEAN","SNOWY"],
  "FrozenRiver":["COLD","RIVER","SNOWY"],
  "Ice Plains":["COLD","SNOWY","WASTELAND"],
  "Ice Mountains":["COLD","MOUNTAIN","SNOWY"],
  "MushroomIsland":["MUSHROOM"],
  "MushroomIslandShore":["MUSHROOM","BEACH"],
  "Beach":["BEACH"],
  "DesertHills":["HOT","DRY","HILLS","SANDY"],
  "ForestHills":["FOREST","HILLS"],
  "TaigaHills":["COLD","CONIFEROUS","FOREST","HILLS"],
  "Extreme Hills Edge":["MOUNTAIN"],
  "Jungle":["HOT","DENSE","WET","JUNGLE"],
  "JungleHills":["HOT","DENSE","WET","JUNGLE","HILLS"],
  "JungleEdge":["HOT","WET","JUNGLE","FOREST"],
  "Deep Ocean":["OCEAN"],
  "Stone Beach":["BEACH"],
  "Cold Beach":["COLD","SNOWY","BEACH"],
  "Birch Forest":["FOREST"],
  "Birch Forest Hills":["FOREST","HILLS"],
  "Roofed Forest":["DENSE","SPOOKY","FOREST"],
  "Cold Taiga":["COLD","CONIFEROUS","FOREST","SNOWY"],
  "Cold Taiga Hills":["COLD","CONIFEROUS","FOREST","HILLS","SNOWY"],
  "Mega Taiga":["COLD","CONIFEROUS","FOREST"],
  "Mega Taiga Hills":["COLD","CONIFEROUS","FOREST","HILLS"],
  "Extreme Hills+":["SPARSE","FOREST","MOUNTAIN"],
  "Savanna":["HOT","SPARSE","SAVANNA","PLAINS"],
  "Savanna Plateau":["HOT","SPARSE","SAVANNA","PLAINS"],
  "Mesa":["MESA","SANDY"],
  "Mesa Plateau F":["SPARSE","MESA","SANDY"],
  "Mesa Plateau":["MESA","SANDY"],
  "Alps Forest":["COLD","FOREST","MOUNTAIN","SNOWY"],
  "Alps":["COLD","MOUNTAIN","SNOWY"],
  "Arctic":["COLD","DEAD","SNOWY","WASTELAND"],
  "Bamboo Forest":["DENSE","JUNGLE","LUSH","FOREST"],
  "Bayou":["WET","LUSH","OCEAN","RIVER","SWAMP"],
  "Bog":["WET","DEAD","FOREST","SWAMP"],
  "Boreal Forest":["DENSE","CONIFEROUS","LUSH","FOREST"],
  "Brushland":["HOT","DRY","SAVANNA","PLAINS"],
  "Canyon":["HOT","SPARSE","DRY","MOUNTAIN","HILLS","SANDY"],
  "Canyon Ravine":["HOT","DRY","HILLS","SANDY"],
  "Chaparral":["SPARSE","PLAINS"],
  "Cherry Blossom Grove":["LUSH","MAGICAL","FOREST"],
  "Coniferous Forest":["DENSE","CONIFEROUS","FOREST","HILLS"],
  "Coral Reef":["OCEAN","RIVER"],
  "Crag":["DRY","SPOOKY","DEAD","MOUNTAIN","WASTELAND"],
  "Dead Forest":["SPARSE","SPOOKY","DEAD","FOREST"],
  "Dead Swamp":["SPARSE","SPOOKY","DEAD","SWAMP"],
  "Deciduous Forest":["DENSE","DRY","FOREST"],
  "Dry River":["HOT","DRY","PLAINS","SANDY"],
  "Eucalyptus Forest":["HOT","WET","PLAINS"],
  "Fen":["WET","DEAD","FOREST","SWAMP"],
  "Flower Field":["LUSH","PLAINS"],
  "Frost Forest":["COLD","SPARSE","FOREST","SNOWY"],
  "Fungi Forest":["WET","LUSH","MUSHROOM","MAGICAL","FOREST","SWAMP"],
  "Garden":["LUSH","MAGICAL","PLAINS"],
  "Glacier":["COLD","DEAD","HILLS","SNOWY"],
  "Grassland":["SPARSE","LUSH","PLAINS","HILLS","SWAMP"],
  "Grove":["DENSE","LUSH","FOREST","PLAINS"],
  "Heathland":["DRY","SAVANNA","PLAINS"],
  "Highland":["SPARSE","MOUNTAIN","HILLS"],
  "Jade Cliffs":["DENSE","FOREST","MOUNTAIN"],
  "Kelp Forest":["OCEAN","RIVER","FOREST"],
  "Land of Lakes":["WET","PLAINS"],
  "Land of Lakes Marsh":["WET","SWAMP"],
  "Lavender Fields":["SPARSE","LUSH","PLAINS"],
  "Lush Desert":["HOT","DRY","SAVANNA","LUSH","SANDY"],
  "Lush River":["RIVER","PLAINS"],
  "Lush Swamp":["WET","LUSH","OCEAN","RIVER","SWAMP"],
  "Mangrove":["WET","LUSH","OCEAN","RIVER","FOREST"],
  "Maple Woods":["COLD","FOREST"],
  "Marsh":["SPARSE","WET","LUSH","OCEAN","RIVER","SWAMP"],
  "Meadow Forest":["LUSH","FOREST","PLAINS"],
  "Meadow":["LUSH","FOREST","PLAINS"],
  "Moor":["SPARSE","WET","HILLS","SWAMP"],
  "Mountain":["DRY","FOREST","MOUNTAIN"],
  "Mystic Grove":["WET","LUSH","MAGICAL","FOREST"],
  "Oasis":["HOT","DRY","JUNGLE","LUSH","SANDY"],
  "Ominous Woods":["SPOOKY","DEAD","MAGICAL","FOREST","SWAMP"],
  "Orchard":["SPARSE","LUSH","FOREST","PLAINS"],
  "Origin Valley":["PLAINS"],
  "Outback":["HOT","DRY","SAVANNA","PLAINS","SANDY"],
  "Polar Chasm":["HOT","DRY","SAVANNA","PLAINS"],
  "Prairie":["SPARSE","DRY","PLAINS"],
  "Quagmire":["WET","SPOOKY","DEAD","SWAMP","WASTELAND"],
  "Rainforest":["DENSE","WET","JUNGLE","LUSH","FOREST","HILLS"],
  "Redwood Forest":["DENSE","CONIFEROUS","FOREST"],
  "Sacred Springs":["DENSE","WET","LUSH","MAGICAL","FOREST","MOUNTAIN"],
  "Scrubland":["HOT","SPARSE","DRY","SAVANNA","PLAINS"],
  "Seasonal Forest Clearing":["PLAINS"],
  "Seasonal Forest":["DENSE","LUSH","FOREST"],
  "Shield":["WET","CONIFEROUS","OCEAN","RIVER","FOREST"],
  "Shrubland":["SPARSE","DRY","PLAINS"],
  "Silkglades":["SPOOKY","DEAD","FOREST","SWAMP"],
  "Sludgepit":["WET","SPOOKY","DEAD","FOREST","SWAMP","WASTELAND"],
  "Snowy Coniferous Forest":["COLD","DENSE","CONIFEROUS","FOREST","HILLS","SNOWY"],
  "Spectral Garden":["HOT","DRY","SAVANNA","PLAINS"],
  "Spruce Woods":["DENSE","CONIFEROUS","LUSH","FOREST"],
  "Steppe":["HOT","SPARSE","DRY","SAVANNA","DEAD","PLAINS","SANDY"],
  "Temperate Rainforest":["WET","CONIFEROUS","LUSH","FOREST","HILLS"],
  "Thicket":["DENSE","DRY","DEAD","FOREST","PLAINS"],
  "Tropical Rainforest":["HOT","DENSE","WET","JUNGLE","LUSH"],
  "Tropics":["WET","JUNGLE","LUSH","OCEAN","RIVER","BEACH"],
  "Tundra":["COLD","SPARSE","DRY","DEAD","WASTELAND"],
  "Visceral Heap":["SPOOKY","NETHER"],
  "Volcano":["HOT","DRY","MOUNTAIN","WASTELAND"],
  "Wasteland":["SPARSE","SPOOKY","DEAD","WASTELAND"],
  "Wetland":["DENSE","WET","LUSH","FOREST","SWAMP"],
  "Woodland":["DENSE","DRY","FOREST"],
  "Xeric Shrubland":["HOT","PLAINS","SANDY"],
  "Dense Forest":["PLAINS"],
  "Ocean Oil Field":["OCEAN","RIVER"],
  "Desert Oil Field":["SANDY"],
  "Boneyard":["SPOOKY","NETHER","WASTELAND"],
  "Sunflower Plains":["PLAINS"],
  "Desert M":["HOT","DRY","PLAINS","SANDY"],
  "Extreme Hills M":["HILLS"],
  "Flower Forest":["FOREST","HILLS"],
  "Taiga M":["HILLS"],
  "Swampland M":["WET","SWAMP"],
  "Corrupted Sands":["SPOOKY","NETHER","SANDY"],
  "Phantasmagoric Inferno":["SPOOKY","NETHER"],
  "Undergarden":["JUNGLE","SPOOKY","NETHER"],
  "Ice Plains Spikes":["COLD","HILLS","SNOWY"],
  "moon":["COLD","DRY","DEAD"],
  "marsFlat":["COLD","DRY","DEAD","SANDY"],
  "asteroids":["COLD","DRY","SPOOKY","DEAD"],
  "space":["DRY","PLAINS"],
  "Jungle M":["HOT","WET","HILLS"],
  "JungleEdge M":["HOT","HILLS"],
  "Birch Forest M":["HILLS"],
  "Birch Forest Hills M":["HILLS"],
  "Roofed Forest M":["HILLS"],
  "Cold Taiga M":["COLD","HILLS","SNOWY"],
  "Mega Spruce Taiga":["DENSE","FOREST"],
  "Mega Spruce Taiga 2":["DENSE","FOREST"],
  "Extreme Hills+ M":["HILLS"],
  "Savanna M":["HOT","SPARSE","DRY","SAVANNA","HILLS"],
  "Savanna Plateau M":["HOT","SPARSE","DRY","SAVANNA","HILLS"],
  "Mesa (Bryce)":["HOT","DRY","PLAINS","SANDY"],
  "Mesa Plateau F M":["HOT","DRY","FOREST","SANDY"],
  "Mesa Plateau M":["HOT","DRY","PLAINS","SANDY"],
  "Twilight Clearing":["SPARSE","PLAINS"],
  "Dark Forest":["DENSE","SPOOKY","FOREST"],
  "Dark Forest Center":["DENSE","SPOOKY","MAGICAL","FOREST"],
  "Deep Mushroom Forest":["MUSHROOM","FOREST"],
  "Fire Swamp":["HOT","SWAMP","WASTELAND"],
  "Twilight Glacier":["COLD","SNOWY","WASTELAND"],
  "Twilight Highlands":["CONIFEROUS","FOREST","MOUNTAIN"],
  "Highlands Center":["DRY","DEAD","MESA","WASTELAND"],
  "Twilight Lake":["OCEAN"],
  "Firefly Forest":["LUSH","FOREST"],
  "Mushroom Forest":["MUSHROOM","FOREST"],
  "Oak Savanna":["SPARSE","FOREST"],
  "Twilight Stream":["RIVER"],
  "Twilight Swamp":["WET","SWAMP"],
  "Thornlands":["DRY","DEAD","HILLS","WASTELAND"],
  "Twilight Forest":["FOREST"],
  "Dense Twilight Forest":["DENSE","FOREST"],
  "Enchanted Forest":["MAGICAL","FOREST"],
  "Eerie":["SPOOKY","MAGICAL"],
  "Eldritch":["SPOOKY","END","MAGICAL"],
  "Magical Forest":["MAGICAL","FOREST"],
  "Tainted Land":["MAGICAL","WASTELAND"],
  "Snowy Forest":["COLD","CONIFEROUS","FOREST","SNOWY"],
  "Toxic Everglades":["DENSE","DEAD","FOREST","HILLS"],
  "rwg_riverIce":["COLD","RIVER","SNOWY"],
  "rwg_riverCold":["COLD","CONIFEROUS","RIVER","FOREST"],
  "rwg_riverTemperate":["COLD","RIVER","FOREST"],
  "rwg_riverHot":["HOT","DRY","RIVER","SANDY"],
  "rwg_riverWet":["HOT","WET","JUNGLE","RIVER"],
  "rwg_riverOasis":["HOT","WET","JUNGLE","RIVER"],
  "rwg_oceanIce":["COLD","OCEAN","SNOWY","BEACH"],
  "rwg_oceanCold":["COLD","CONIFEROUS","OCEAN","FOREST","BEACH"],
  "rwg_oceanTemperate":["COLD","OCEAN","FOREST","BEACH"],
  "rwg_oceanHot":["HOT","DRY","OCEAN","SANDY","BEACH"],
  "rwg_oceanOasis":["HOT","WET","JUNGLE","OCEAN","BEACH"],
  "rwg_snowDesert":["COLD","SNOWY","WASTELAND"],
  "rwg_coldPlains":["COLD","WASTELAND"],
  "rwg_coldForest":["COLD","DENSE","CONIFEROUS","FOREST","HILLS"],
  "rwg_hotPlains":["HOT","SPARSE","SAVANNA","PLAINS"],
  "rwg_hotForest":["HOT","SPARSE","SAVANNA","PLAINS"],
  "rwg_hotDesert":["HOT","DRY","SANDY"],
  "rwg_plains":["PLAINS"],
  "rwg_tropical":["HOT","WET","JUNGLE"],
  "rwg_redwood":["COLD","CONIFEROUS","FOREST"],
  "rwg_jungle":["HOT","WET","JUNGLE"],
  "rwg_oasis":["HOT","WET","PLAINS"],
  "rwg_temperateForest":["PLAINS"],
  "rwg_oceanWet":["HOT","WET","JUNGLE","OCEAN","BEACH"],
};

// ── BIOME RAINFALL ───────────────────────────────────────────────────────────
// Source: BiomeGenBase + BoP BiomeRegistry rainfall values
// Used for humidity bonus: clamp((rainfall-0.5)/(0.8-0.5),0,1) × 14
const BIOME_RAINFALL={"Ocean":0.5,"Plains":0.4,"Desert":0.0,"Extreme Hills":0.3,"Forest":0.8,"Taiga":0.8,"Swampland":0.9,"River":0.5,"Hell":0.0,"Sky":0.5,"FrozenOcean":0.5,"FrozenRiver":0.5,"Ice Plains":0.5,"Ice Mountains":0.5,"MushroomIsland":1.0,"MushroomIslandShore":1.0,"Beach":0.4,"DesertHills":0.0,"ForestHills":0.8,"TaigaHills":0.8,"Extreme Hills Edge":0.3,"Jungle":0.9,"JungleHills":0.9,"JungleEdge":0.8,"Deep Ocean":0.5,"Stone Beach":0.3,"Cold Beach":0.3,"Birch Forest":0.6,"Birch Forest Hills":0.6,"Roofed Forest":0.8,"Cold Taiga":0.4,"Cold Taiga Hills":0.4,"Mega Taiga":0.8,"Mega Taiga Hills":0.8,"Extreme Hills+":0.3,"Savanna":0.0,"Savanna Plateau":0.0,"Mesa":0.0,"Mesa Plateau F":0.0,"Mesa Plateau":0.0,"Alps Forest":0.5,"Alps":0.5,"Arctic":0.5,"Bamboo Forest":0.9,"Bayou":0.9,"Bog":0.9,"Boreal Forest":0.6,"Brushland":0.1,"Canyon":0.3,"Canyon Ravine":0.3,"Chaparral":0.6,"Cherry Blossom Grove":0.8,"Coniferous Forest":0.5,"Coral Reef":0.9,"Crag":0.0,"Dead Forest":0.3,"Dead Swamp":0.9,"Deciduous Forest":0.8,"Dry River":0.0,"Eucalyptus Forest":1.0,"Fen":0.4,"Flower Field":0.7,"Frost Forest":0.5,"Fungi Forest":1.0,"Garden":0.8,"Glacier":0.2,"Grassland":0.7,"Grove":0.8,"Heathland":0.2,"Highland":0.8,"Jade Cliffs":0.9,"Kelp Forest":0.9,"Land of Lakes":0.9,"Land of Lakes Marsh":0.9,"Lavender Fields":0.7,"Lush Desert":0.5,"Lush River":0.8,"Lush Swamp":1.0,"Mangrove":0.9,"Maple Woods":0.8,"Marsh":0.9,"Meadow Forest":0.7,"Meadow":0.7,"Moor":1.0,"Mountain":0.1,"Mystic Grove":1.0,"Oasis":0.3,"Ominous Woods":0.9,"Orchard":0.7,"Origin Valley":0.8,"Outback":0.05,"Polar Chasm":0.0,"Prairie":0.3,"Quagmire":0.9,"Rainforest":1.0,"Redwood Forest":0.7,"Sacred Springs":0.5,"Scrubland":0.0,"Seasonal Forest Clearing":0.8,"Seasonal Forest":0.8,"Shield":0.8,"Shrubland":0.05,"Silkglades":0.9,"Sludgepit":0.9,"Snowy Coniferous Forest":0.5,"Spectral Garden":0.0,"Spruce Woods":0.8,"Steppe":0.05,"Temperate Rainforest":1.2,"Thicket":0.2,"Tropical Rainforest":1.0,"Tropics":1.0,"Tundra":0.5,"Visceral Heap":0.0,"Volcano":0.05,"Wasteland":0.05,"Wetland":0.9,"Woodland":0.4,"Xeric Shrubland":0.2,"Dense Forest":0.7,"Ocean Oil Field":0.5,"Desert Oil Field":0.0,"Boneyard":0.0,"Sunflower Plains":0.4,"Desert M":0.0,"Extreme Hills M":0.3,"Flower Forest":0.8,"Taiga M":0.8,"Swampland M":0.9,"Corrupted Sands":0.0,"Phantasmagoric Inferno":0.0,"Undergarden":0.0,"Ice Plains Spikes":0.5,"moon":0.0,"marsFlat":0.0,"asteroids":0.0,"space":0.0,"Jungle M":0.9,"JungleEdge M":0.8,"Birch Forest M":0.6,"Birch Forest Hills M":0.6,"Roofed Forest M":0.8,"Cold Taiga M":0.4,"Mega Spruce Taiga":0.8,"Mega Spruce Taiga 2":0.8,"Extreme Hills+ M":0.3,"Savanna M":0.0,"Savanna Plateau M":0.0,"Mesa (Bryce)":0.0,"Mesa Plateau F M":0.0,"Mesa Plateau M":0.0,"Twilight Clearing":0.4,"Dark Forest":0.8,"Dark Forest Center":0.8,"Deep Mushroom Forest":1.0,"Fire Swamp":0.4,"Twilight Glacier":0.1,"Twilight Highlands":0.7,"Highlands Center":0.2,"Twilight Lake":1.0,"Firefly Forest":1.0,"Mushroom Forest":0.8,"Oak Savanna":0.0,"Twilight Stream":1.0,"Twilight Swamp":0.9,"Thornlands":0.2,"Twilight Forest":0.5,"Dense Twilight Forest":0.8,"Enchanted Forest":0.5,"Eerie":0.5,"Eldritch":0.5,"Magical Forest":0.6,"Tainted Land":0.5,"Snowy Forest":0.9,"Toxic Everglades":0.7,"rwg_riverIce":0.1,"rwg_riverCold":0.4,"rwg_riverTemperate":0.6,"rwg_riverHot":0.2,"rwg_riverWet":0.9,"rwg_riverOasis":0.9,"rwg_oceanIce":0.1,"rwg_oceanCold":0.4,"rwg_oceanTemperate":0.6,"rwg_oceanHot":0.2,"rwg_oceanOasis":0.9,"rwg_snowDesert":0.1,"rwg_coldPlains":0.2,"rwg_coldForest":0.4,"rwg_hotPlains":0.1,"rwg_hotForest":0.2,"rwg_hotDesert":0.0,"rwg_plains":0.4,"rwg_tropical":0.8,"rwg_redwood":0.6,"rwg_jungle":0.9,"rwg_oasis":0.9,"rwg_temperateForest":0.6,"rwg_oceanWet":0.9};

function calcHumidityBonus(biome){
  const r=BIOME_RAINFALL[biome]||0.5;
  const h=Math.max(0,Math.min(1,(r-0.5)/0.3));
  return Math.floor(h*14);
}

// ── CROP DATABASE ─────────────────────────────────────────────────────────────
// drops: [{item, chance (0-10000), qty, qtyExtra}]
// chance is out of 10000. qty=base stack size, qtyExtra=gain bonus item
// likedBiomes: Forge BiomeDictionary.Type tags from addLikedBiomes() in source
// growthDuration: total growth points needed to mature (from getGrowthDuration())
// Default: tier * 1200 per NHCropCard (overridden by some crops)
// dropChance: per-round drop chance = 0.95^tier (base formula)
// avgDropRounds = dropChance * 1.03^Gain
const CROPS=[
  // Food / Vanilla
  {id:'Wheat',name:'Wheat',tier:1,liked:['PLAINS','LUSH'],drops:[{item:'Wheat',ch:10000,qty:1}]},
  {id:'Carrot',name:'Carrot',tier:2,liked:['PLAINS','HOT','SANDY'],drops:[{item:'Carrot',ch:10000,qty:1}]},
  {id:'Potato',name:'Potato',tier:1,liked:['COLD','PLAINS'],drops:[{item:'Potato',ch:10000,qty:1}]},
  {id:'Melon',name:'Melon',tier:2,liked:['LUSH','WET'],drops:[{item:'Melon Slice',ch:10000,qty:1}]},
  {id:'Pumpkin',name:'Pumpkin',tier:2,liked:['PLAINS','WET'],drops:[{item:'Pumpkin',ch:10000,qty:1}]},
  {id:'Cocoa',name:'Cocoa',tier:3,liked:['DENSE','JUNGLE','LUSH','WET'],drops:[{item:'Cocoa Beans',ch:10000,qty:1}]},
  {id:'SugarCane',name:'Sugar Cane',tier:2,liked:['HOT','WET'],drops:[{item:'Sugar Cane',ch:10000,qty:1}]},
  {id:'Cactus',name:'Cactus',tier:3,liked:['DRY','HOT','SANDY'],drops:[{item:'Cactus',ch:10000,qty:1}]},
  {id:'Netherwart',name:'Nether Wart',tier:5,liked:['NETHER','HOT'],drops:[{item:'Nether Wart',ch:10000,qty:1}]},
  // Mob crops
  {id:'Corium',name:'Corium',tier:6,liked:['PLAINS','FOREST'],drops:[{item:'Leather',ch:10000,qty:1}]},
  {id:'EggPlant',name:'Egg Plant',tier:6,liked:['PLAINS','FOREST'],drops:[{item:'Egg',ch:6000,qty:1},{item:'Feather',ch:3000,qty:1},{item:'Raw Chicken',ch:1000,qty:1}]},
  {id:'Slimeplant',name:'Slimeplant',tier:6,liked:['SWAMP','WET'],drops:[{item:'Slimeball',ch:10000,qty:1}]},
  {id:'Corpseplant',name:'Corpseplant',tier:5,liked:['DEAD','SPOOKY'],drops:[{item:'Ink Sac (dye:15)',ch:6250,qty:1},{item:'Rotten Flesh',ch:2500,qty:1},{item:'Bone',ch:1250,qty:1}]},
  {id:'Zomplant',name:'Zomplant',tier:3,liked:['DEAD','WASTELAND'],drops:[{item:'Rotten Flesh',ch:9850,qty:1},{item:'Zombie Brain (TC)',ch:150,qty:1}],note:'TC: Zombie Brain replaces flesh'},
  {id:'Enderbloom',name:'Enderbloom',tier:10,liked:['END','COLD'],drops:[{item:'Ender Pearl Dust',ch:6250,qty:1},{item:'Ender Pearl',ch:2500,qty:1},{item:'Eye of Ender',ch:1250,qty:1}]},
  {id:'Creeperweed',name:'Creeperweed',tier:7,liked:['DEAD','SPOOKY'],drops:[{item:'Gunpowder',ch:10000,qty:1}]},
  {id:'Spidernip',name:'Spidernip',tier:4,liked:['WET','LUSH'],drops:[{item:'String',ch:6666,qty:1},{item:'Spider Eye',ch:1667,qty:1},{item:'Cobweb',ch:1667,qty:1}]},
  {id:'Goldfish',name:'Goldfish',tier:4,liked:['RIVER','SPOOKY','WET'],drops:[{item:'Goldfish',ch:6000,qty:1}]},
  {id:'Meatrose',name:'Meatrose',tier:7,liked:['MAGICAL','PLAINS'],drops:[{item:'Pink Dye',ch:6000,qty:1},{item:'Raw Chicken',ch:1000,qty:1},{item:'Raw Fish',ch:1000,qty:1},{item:'Raw Beef',ch:1000,qty:1},{item:'Raw Porkchop',ch:1000,qty:1}]},
  {id:'Inkbloom',name:'Ink Bloom',tier:4,liked:['OCEAN','WET'],drops:[{item:'Ink Sac',ch:10000,qty:1}]},
  {id:'Tearstalks',name:'Tearstalks',tier:8,liked:['DEAD','NETHER'],drops:[{item:'Ghast Tear',ch:6666,qty:1}]},
  {id:'MilkWart',name:'Milk Wart',tier:6,liked:['LUSH','PLAINS'],drops:[{item:'Milk Wart',ch:10000,qty:1}]},
  // Material crops
  {id:'Flax',name:'Flax',tier:2,liked:['BEACH','RIVER','SANDY','WET'],drops:[{item:'String',ch:10000,qty:1}]},
  {id:'Hemp',name:'Hemp',tier:5,liked:['DRY','SANDY'],drops:[{item:'Hemp Stem',ch:10000,qty:1}]},
  {id:'Papyrus',name:'Papyrus',tier:5,liked:['JUNGLE','SWAMP','WET'],drops:[{item:'Paper',ch:10000,qty:1}]},
  {id:'StickyCane',name:'Sticky Cane',tier:4,liked:['HOT','WET','SANDY'],drops:[{item:'IC2 Resin',ch:10000,qty:1}]},
  {id:'Indigo',name:'Indigo',tier:2,liked:['WET','LUSH'],drops:[{item:'Indigo Blossom',ch:10000,qty:1}]},
  {id:'Canola',name:'Canola',tier:4,liked:['COLD','PLAINS'],drops:[{item:'Canola Flower',ch:10000,qty:1}]},
  {id:'SaltyRoot',name:'Salty Root',tier:4,liked:['SANDY','DRY'],drops:[{item:'Salty Root (item)',ch:10000,qty:1}]},
  {id:'Redstraw',name:'Red Straw',tier:6,liked:['HOT','PLAINS'],drops:[{item:'Redstone Dust',ch:10000,qty:1}]},
  {id:'Withereed',name:'Withereed',tier:8,liked:['DEAD','SPOOKY'],drops:[{item:'Coal Dust',ch:6667,qty:1},{item:'Coal',ch:3333,qty:1},{item:'Wither Skeleton Skull',ch:129,qty:1}]},
  // Ore/metal crops
  {id:'StoneLily',name:'Stone Lily',tier:1,liked:['MOUNTAIN','HILLS'],drops:[{item:'Stone Dust ×9',ch:10000,qty:9}]},
  {id:'Ferrofern',name:'Ferrofern',tier:6,liked:['MOUNTAIN','HILLS'],drops:[{item:'Ferrofern Leaf',ch:10000,qty:1}],note:'Process leaf for iron'},
  {id:'Coppon',name:'Coppon',tier:6,liked:['SAVANNA','HOT','SANDY'],drops:[{item:'Coppon Fiber',ch:10000,qty:1}],note:'Process fiber for copper'},
  {id:'Tine',name:'Tine',tier:5,liked:['MOUNTAIN','HILLS'],drops:[{item:'Tine Twig',ch:10000,qty:1}],note:'Process twig for tin'},
  {id:'Nickelback',name:'Nickelback',tier:5,liked:['LUSH','PLAINS'],drops:[{item:'Nickelback Leaf',ch:10000,qty:1}],note:'Process leaf for nickel'},
  {id:'Galvania',name:'Galvania',tier:6,liked:['DRY','HOT'],drops:[{item:'Galvania Leaf',ch:10000,qty:1}],note:'Process for zinc/galvanized'},
  {id:'Argentia',name:'Argentia',tier:7,liked:['HOT','MOUNTAIN'],drops:[{item:'Argentia Leaf',ch:10000,qty:1}],note:'Process for silver'},
  {id:'Auronia',name:'Auronia',tier:8,liked:['MESA','SANDY'],drops:[{item:'Auronia Leaf',ch:10000,qty:1}],note:'Process for gold'},
  {id:'Plumbilia',name:'Plumbilia',tier:6,liked:['PLAINS','SAVANNA'],drops:[{item:'Plumbilia Leaf',ch:10000,qty:1}],note:'Process for lead'},
  {id:'Lazulia',name:'Lazulia',tier:7,liked:['HOT','SANDY'],drops:[{item:'Lapis Dust',ch:6667,qty:1},{item:'Lapis Lazuli',ch:3333,qty:1}]},
  {id:'Rubyne',name:'Rubyne',tier:4,liked:['MOUNTAIN','RIVER'],drops:[{item:'Ruby Dust',ch:7500,qty:1},{item:'Ruby Gem',ch:2500,qty:1}]},
  {id:'Sapphirum',name:'Sapphirum',tier:4,liked:['COLD','OCEAN','WET'],drops:[{item:'Sapphire Dust',ch:7500,qty:1},{item:'Sapphire Gem',ch:2500,qty:1}]},
  {id:'Diareed',name:'Diareed',tier:12,liked:['COLD','SPARSE'],drops:[{item:'Diamond',ch:7500,qty:1},{item:'Diamond Dust',ch:2500,qty:1}]},
  // Ore Berries
  {id:'IronOreBerry',name:'Iron Ore Berry',tier:5,liked:['MOUNTAIN','HILLS'],drops:[{item:'Iron Ore Berry',ch:10000,qty:1}],note:'Drops a TinkerConstruct Ore Berries item — smelt into iron nugget, then 9 nuggets = 1 ingot (exact berry-to-nugget smelting ratio not verified)'},
  {id:'GoldOreBerry',name:'Gold Ore Berry',tier:5,liked:['MESA','SANDY'],drops:[{item:'Gold Ore Berry',ch:10000,qty:1}],note:'Smelt 8 berries = 1 gold nugget'},
  {id:'CopperOreBerry',name:'Copper Ore Berry',tier:5,liked:['SAVANNA','HOT','SANDY'],drops:[{item:'Copper Ore Berry',ch:10000,qty:1}]},
  {id:'TinOreBerry',name:'Tin Ore Berry',tier:4,liked:['MOUNTAIN','HILLS'],drops:[{item:'Tin Ore Berry',ch:10000,qty:1}]},
  {id:'AluminiumOreBerry',name:'Aluminium Ore Berry',tier:5,liked:['COLD','DRY'],drops:[{item:'Aluminium Ore Berry',ch:10000,qty:1}]},
  {id:'ArditeOreBerry',name:'Ardite Ore Berry',tier:5,liked:['NETHER','HOT'],drops:[{item:'Ardite Nugget',ch:10000,qty:1}]},
  {id:'CobaltOreBerry',name:'Cobalt Ore Berry',tier:5,liked:['NETHER','DRY'],drops:[{item:'Cobalt Nugget',ch:10000,qty:1}]},
  {id:'ThaumiumOreBerry',name:'Thaumium Ore Berry',tier:7,liked:['MAGICAL','SPOOKY'],drops:[{item:'Thaumium Nugget',ch:10000,qty:1}]},
  {id:'VoidOreBerry',name:'Void Ore Berry',tier:7,liked:['MAGICAL','WASTELAND'],drops:[{item:'Void Nugget',ch:10000,qty:1}]},
  {id:'KnightmetalBerry',name:'Knightmetal Berry',tier:8,liked:['DEAD','SPOOKY'],drops:[{item:'Knightmetal Armor Shard',ch:10000,qty:1}]},
  {id:'Steeleafranks',name:'Steeleafranks',tier:10,liked:['SPOOKY','DEAD'],drops:[{item:'Steeleaf Dust',ch:10000,qty:1}],note:'Requires Steeleaf block at y-2 · TF req',blockUnder:'steeleaf'},
  {id:'Barley',name:'Barley',tier:2,liked:['PLAINS','DRY'],drops:[{item:'Barley (Natura)',ch:10000,qty:1}],note:'Brew recipes (alcohol)'},
  {id:'Bauxia',name:'Bauxia',tier:6,liked:['COLD','DRY'],drops:[{item:'Bauxia Leaf',ch:10000,qty:1}],note:'Process for bauxite/aluminium · EV machine req',blockUnder:'aluminiumBauxite'},
  {id:'Blackberry',name:'Blackberry',tier:2,liked:['WET','DENSE','LUSH'],drops:[{item:'Blackberry (Natura)',ch:10000,qty:1}],note:'Berry → sugar · Natura req'},
  {id:'Blueberry',name:'Blueberry',tier:2,liked:['HILLS','FOREST','LUSH'],drops:[{item:'Blueberry (Natura)',ch:10000,qty:1}],note:'Berry → sugar · Natura req'},
  {id:'BobsYerUncleRanks',name:"Bob's Yer Uncle Ranks",tier:6,liked:['MOUNTAIN','HILLS'],drops:[{item:'Emerald Dust',ch:10000,qty:1}],note:'stone+emerald y-2',blockUnder:'emerald'},
  {id:'Coffee',name:'Coffee',tier:7,liked:['HOT','LUSH','WET'],drops:[{item:'Coffee Beans',ch:10000,qty:1}],note:'Brew for caffeine/stimulants'},
  {id:'EssenceOreBerry',name:'Essence Ore Berry',tier:5,liked:['MAGICAL','DEAD'],drops:[{item:'Essence of Knowledge',ch:10000,qty:1}],note:'TiC · skull y-2',blockUnder:'skull'},
  {id:'GaiaWart',name:'Gaia Wart',tier:5,liked:['SNOWY','COLD'],drops:[{item:'Gaia Wart',ch:10000,qty:1}],note:'Brew recipes · soulsand+snow y-2',blockUnder:'snow'},
  {id:'GlowingCoral',name:'Glowing Coral',tier:5,liked:['OCEAN','RIVER'],drops:[{item:'Glowstone Dust',ch:10000,qty:1}],note:'BoP req · clay y-2',blockUnder:'clay'},
  {id:'Hops',name:'Hops',tier:5,liked:['PLAINS','LUSH'],drops:[{item:'Hops',ch:10000,qty:1}],note:'Brew recipes (beer/alcohol)'},
  {id:'Huckleberry',name:'Huckleberry',tier:2,liked:['MOUNTAIN','HILLS','PLAINS','COLD'],drops:[{item:'Huckleberry (Natura)',ch:10000,qty:1}],note:'Berry → sugar · Natura req'},
  {id:'Iridine',name:'Iridine',tier:12,liked:['SNOWY','COLD'],drops:[{item:'Iridine Flower',ch:10000,qty:1}],note:'Process for iridium · stone+iridium y-2 · LUV machine req',blockUnder:'iridium'},
  {id:'Lemon',name:'Lemon',tier:4,liked:['HOT','DRY','PLAINS'],drops:[{item:'Lemon',ch:10000,qty:1}],note:'Food/brewing'},
  {id:'Micadia',name:'Micadia',tier:9,liked:['HILLS','SPARSE'],drops:[{item:'Micadia Flower',ch:10000,qty:1}],note:'Process for mica · stone+mica y-2',blockUnder:'mica'},
  {id:'OilBerry',name:'Oil Berry',tier:4,liked:['HOT','WASTELAND'],drops:[{item:'Oil Berry',ch:10000,qty:1}],note:'Oil extraction · stone soil'},
  {id:'Osmianth',name:'Osmianth',tier:12,liked:['OCEAN','RIVER'],drops:[{item:'Osmianth Flower',ch:10000,qty:1}],note:'Process for osmium · stone+osmium y-2 · ZPM machine req',blockUnder:'osmium'},
  {id:'Platina',name:'Platina',tier:11,liked:['HOT','SANDY'],drops:[{item:'Platina Leaf',ch:10000,qty:1}],note:'Process for platinum · stone+platinum y-2 · EV machine req',blockUnder:'platinum'},
  {id:'Pyrolusium',name:'Pyrolusium',tier:12,liked:['NETHER','HOT'],drops:[{item:'Pyrolusium Leaf',ch:10000,qty:1}],note:'Process for manganese · stone+manganese y-2',blockUnder:'manganese'},
  {id:'Raspberry',name:'Raspberry',tier:2,liked:['PLAINS','DRY'],drops:[{item:'Raspberry (Natura)',ch:10000,qty:1}],note:'Berry → sugar · Natura req'},
  {id:'Reactoria',name:'Reactoria',tier:12,liked:['COLD','HOT'],drops:[{item:'Reactoria Leaf',ch:10000,qty:1}],note:'Process for uranium · stone+uranium y-2 · ZPM machine req',blockUnder:'uranium'},
  {id:'Scheelinium',name:'Scheelinium',tier:12,liked:['OCEAN','WET','COLD'],drops:[{item:'Scheelinium Leaf',ch:10000,qty:1}],note:'Process for tungsten · stone+tungsten y-2 · EV machine req',blockUnder:'tungsten'},
  {id:'SpaceFlower',name:'Space Flower',tier:13,liked:['COLD','DRY','DEAD'],drops:[{item:'Space Flower',ch:10000,qty:1}],note:'Process for meteoritic iron · space y-2 · Galacticraft req · UV machine req',blockUnder:'space'},
  {id:'StarWart',name:'Star Wart',tier:12,liked:['NETHER','DEAD'],drops:[{item:'Star Wart',ch:10000,qty:1}],note:'Process for nether star dust · netherStar y-2 · ZPM machine req',blockUnder:'netherStar'},
  {id:'Stargatium',name:'Stargatium',tier:12,liked:['LUSH','WASTELAND'],drops:[{item:'Stargatium Leaf',ch:10000,qty:1}],note:'Process for naquadah · endStone y-2 · UV machine req',blockUnder:'endStone'},
  {id:'Strawberry',name:'Strawberry',tier:2,liked:['PLAINS','LUSH'],drops:[{item:'Strawberry',ch:10000,qty:1}],note:'Berry → sugar'},
  {id:'SugarBeet',name:'Sugar Beet',tier:4,liked:['COLD','WET'],drops:[{item:'Sugar Dust',ch:10000,qty:1}],note:'Direct sugar production'},
  {id:'Tea',name:'Tea',tier:4,liked:['WET','HILLS','HOT'],drops:[{item:'Tea Leaves',ch:10000,qty:1}],note:'Brew for tea'},
  {id:'ThauminiteOreBerry',name:'Thauminite Ore Berry',tier:7,liked:['MAGICAL','FOREST'],drops:[{item:'Thauminite Nugget',ch:10000,qty:1}],note:'TC · thauminite y-2',blockUnder:'thauminite'},
  {id:'Thiosulfine',name:'Thiosulfine',tier:6,liked:['NETHER','HOT'],drops:[{item:'Thiosulfine Flower',ch:10000,qty:1}],note:'Sulfur extraction · stone+sulfur y-2',blockUnder:'sulfur'},
  {id:'Titania',name:'Titania',tier:9,liked:['HOT','SAVANNA'],drops:[{item:'Titania Leaf',ch:10000,qty:1}],note:'Process for titanium · stone+titanium y-2 · EV machine req',blockUnder:'titanium'},
  {id:'Vine',name:'Vine',tier:2,liked:['LUSH','JUNGLE','WET'],drops:[{item:'Vine',ch:10000,qty:1}],note:'Distillery (alcohol)'},
  // Bonsais
  {id:'BonsaiOak',name:'Bonsai Oak',tier:1,liked:['PLAINS','FOREST','HILLS'],drops:[{item:'Oak Sapling',ch:3000,qty:2},{item:'Oak Log',ch:6000,qty:10},{item:'Apple',ch:500,qty:2}],growth:1200},
  {id:'BonsaiBirch',name:'Bonsai Birch',tier:1,liked:['FOREST','HILLS'],drops:[{item:'Birch Sapling',ch:3000,qty:2},{item:'Birch Log',ch:6000,qty:10}],growth:1200},
  {id:'BonsaiSpruce',name:'Bonsai Spruce',tier:1,liked:['FOREST','CONIFEROUS','MOUNTAIN'],drops:[{item:'Spruce Sapling',ch:3000,qty:2},{item:'Spruce Log',ch:6000,qty:10}],growth:1200},
  {id:'BonsaiJungle',name:'Bonsai Jungle',tier:1,liked:['HOT','JUNGLE','WET','DENSE'],drops:[{item:'Jungle Sapling',ch:3000,qty:2},{item:'Jungle Log',ch:6000,qty:10}],growth:1200},
  {id:'BonsaiAcacia',name:'Bonsai Acacia',tier:1,liked:['HOT','SPARSE','SAVANNA','PLAINS'],drops:[{item:'Acacia Sapling',ch:3000,qty:2},{item:'Acacia Log',ch:6000,qty:10}],growth:1200},
  {id:'BonsaiDarkOak',name:'Bonsai Dark Oak',tier:1,liked:['DENSE','SPOOKY','FOREST'],drops:[{item:'Dark Oak Sapling',ch:3000,qty:2},{item:'Dark Oak Log',ch:6000,qty:10}],growth:1200},
  {id:'BonsaiRubber',name:'Bonsai Rubber',tier:1,liked:['CONIFEROUS','FOREST'],drops:[{item:'Rubber Sapling',ch:3000,qty:2},{item:'Rubber Wood',ch:6000,qty:10},{item:'IC2 Resin',ch:500,qty:2}],growth:1200},
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function calcNutrients(likedCount){
  const humBonus=selectedBiome?calcHumidityBonus(selectedBiome):0;
  const likedBonus=likedCount*LBB;
  let n=BN;
  n+=waterFull?10:3;
  n+=fertFull?10:0;
  n+=hasSky?SKY:0;
  // Source: max(humidityBonus, likedBiomeBionus) - they don't stack
  n+=Math.max(humBonus, likedBonus);
  return n;
}

function calcGrowthRate(np,tier,growth){
  const s=np*NPS, nd=tier*NPT, base=BC+growth;
  if(s>=nd) return base*(100+s-nd)/100;
  return Math.max(base*(100-(nd-s)*4)/100,0);
}

function calcGrowthDuration(crop){
  return crop.growth || (crop.tier * 600);
}

function calcAvgDropRounds(tier, gain){
  const dropChance = Math.pow(0.95, tier);
  return dropChance * Math.pow(1.03, gain);
}

function fmtNum(n,dp=2){
  if(n>=1000000) return (n/1000000).toFixed(1)+'M';
  if(n>=1000) return (n/1000).toFixed(1)+'K';
  return n.toFixed(dp);
}

function fmtTime(seconds){
  if(seconds<60) return seconds.toFixed(0)+'s';
  if(seconds<3600) return (seconds/60).toFixed(1)+' min';
  return (seconds/3600).toFixed(2)+'h';
}

// ── BIOME SELECT ─────────────────────────────────────────────────────────────
function filterBiomes(){
  const q=document.getElementById('biomeSearch').value.toLowerCase();
  const sel=document.getElementById('biomeSelect');
  sel.innerHTML='';
  Object.keys(BIOMES).filter(b=>!q||b.toLowerCase().includes(q)).sort().forEach(b=>{
    const opt=document.createElement('option');
    opt.value=b; opt.textContent=b;
    if(b===selectedBiome) opt.selected=true;
    sel.appendChild(opt);
  });
}

function onBiomeChange(){
  const sel=document.getElementById('biomeSelect');
  selectedBiome=sel.value||null;
  renderBiomeTags();
  render();
}

function renderBiomeTags(){
  const el=document.getElementById('biomeTags');
  const note=document.getElementById('biomeNote');
  if(!selectedBiome){el.innerHTML='';note.style.display='none';return;}
  const tags=BIOMES[selectedBiome]||[];
  el.innerHTML=tags.map(t=>`<span class="btag">${t}</span>`).join('');
  note.style.display='block';
  note.className='biome-note';
  note.textContent=`${tags.length} tags: ${tags.join(', ')}`;
}

// ── CROP LIST ────────────────────────────────────────────────────────────────
function filterCrops(){
  const q=document.getElementById('cropSearch').value.toLowerCase();
  renderCropList(q);
}

function renderCropList(q=''){
  const el=document.getElementById('cropList');
  const items=CROPS.filter(c=>!q||c.name.toLowerCase().includes(q)||c.id.toLowerCase().includes(q))
    .sort((a,b)=>a.tier-b.tier||a.name.localeCompare(b.name));
  el.innerHTML=items.map(c=>`
    <div class="cp-item${selectedCrop===c.id?' sel':''}" onclick="selectCrop('${c.id}')">
      <span class="cp-name">${c.name}</span>
      <span class="ct t${Math.min(14,c.tier)}">T${c.tier}</span>
    </div>`).join('');
}

function selectCrop(id){
  selectedCrop=id;
  renderCropList(document.getElementById('cropSearch').value.toLowerCase());
  render();
}

// ── CONTROLS ─────────────────────────────────────────────────────────────────
function setSky(v){
  hasSky=v;
  document.getElementById('skyYes').className='sky-btn'+(v?' act':'');
  document.getElementById('skyNo').className='sky-btn'+(!v?' act':'');
  render();
}

function setWater(v){
  waterFull=v;
  document.getElementById('waterFull').className=v?'act':'';
  document.getElementById('waterLow').className=!v?'act':'';
  render();
}

function setFert(v){
  fertFull=v;
  document.getElementById('fertFull').className=v?'act':'';
  document.getElementById('fertNone').className=!v?'act':'';
  render();
}

function setQty(n){
  cropQty=n;
  document.getElementById('cropQty').value=n;
  document.querySelectorAll('.preset-btn').forEach(b=>b.classList.remove('act'));
  document.querySelectorAll('.preset-btn').forEach(b=>{
    if(parseInt(b.textContent)===n) b.classList.add('act');
  });
  render();
}

function adjQty(d){
  const v=Math.max(1,(parseInt(document.getElementById('cropQty').value)||1)+d);
  document.getElementById('cropQty').value=v;
  cropQty=v;
  render();
}

function upd(){
  document.getElementById('statGainV').textContent=document.getElementById('statGain').value;
  document.getElementById('statGrowthV').textContent=document.getElementById('statGrowth').value;
  cropQty=Math.max(1,parseInt(document.getElementById('cropQty').value)||1);
  render();
}

// ── MAIN RENDER ──────────────────────────────────────────────────────────────
function render(){
  const content=document.getElementById('content');
  if(!selectedBiome||!selectedCrop){
    content.innerHTML=`<div class="hint"><div class="hint-icon">📊</div><div class="hint-title">Select a biome and crop to calculate production</div><div style="font-size:12px;color:var(--tx3);max-width:340px;margin-top:4px">Choose your in-game biome and the crop you're farming. The calculator works out nutrients, growth rate, time to mature, and expected items per hour.</div></div>`;
    return;
  }

  const crop=CROPS.find(c=>c.id===selectedCrop);
  if(!crop) return;

  const gain=parseInt(document.getElementById('statGain').value);
  const growth=parseInt(document.getElementById('statGrowth').value);
  const qty=Math.max(1,parseInt(document.getElementById('cropQty').value)||1);

  const biomeTags=BIOMES[selectedBiome]||[];
  const likedMatches=crop.liked.filter(t=>biomeTags.includes(t));
  const likedCount=likedMatches.length;
  const humBonus=calcHumidityBonus(selectedBiome);
  const likedBonus=likedCount*14;
  const effBonus=Math.max(humBonus,likedBonus);
  const rainfall=(BIOME_RAINFALL[selectedBiome]||0).toFixed(2);
  const bonusSrc=likedBonus>humBonus?'biome tags':humBonus>likedBonus?'humidity':'tied';
  const bonusCls=effBonus>=28?'c-grn':effBonus>=14?'c-amb':'c-gry';

  const np=calcNutrients(likedCount);
  const gr=calcGrowthRate(np,crop.tier,growth);
  const growthDur=calcGrowthDuration(crop);

  const ticksToMature = gr>0 ? growthDur/gr : Infinity;
  const secondsToMature = ticksToMature * CROP_TICK_S;

  const avgRounds=calcAvgDropRounds(crop.tier,gain);
  const harvestsPerHour = gr>0 ? 3600/secondsToMature : 0;
  const harvestsPerHourPerCrop = harvestsPerHour;

  const grCls=gr<=0?'c-red':gr>50?'c-grn':gr>20?'c-amb':'c-blu';
  const timeCls=gr<=0?'c-red':secondsToMature<300?'c-grn':secondsToMature<900?'c-amb':'c-blu';
  const biomeCls=likedCount>=2?'c-grn':likedCount===1?'c-amb':'c-gry';

  // Per-drop calculations
  const dropRows=crop.drops.map(d=>{
    const chanceDecimal=d.ch/10000;
    const avgPerRound=chanceDecimal*(d.qty+(gain/100));
    const avgPerHarvest=avgRounds*avgPerRound;
    const perHour=avgPerHarvest*harvestsPerHour;
    const perHourTotal=perHour*qty;
    return {
      item:d.item,
      ch:d.ch,
      chPct:(d.ch/100).toFixed(2),
      avgPerHarvest:avgPerHarvest,
      perHourPer:perHour,
      perHourTotal:perHourTotal,
      perDay:perHourTotal*24,
    };
  });

  const biomeTagHtml=biomeTags.map(t=>{
    const isLiked=crop.liked.includes(t);
    return `<span class="btag${isLiked?' match':''}">${t}</span>`;
  }).join('');
  const likedTagHtml=crop.liked.map(t=>{
    const inBiome=biomeTags.includes(t);
    return `<span class="btag${inBiome?' match':' match1'}">${t}</span>`;
  }).join('');

  content.innerHTML=`
<div class="result-block">
  <h2>🌿 ${crop.name} in ${selectedBiome}</h2>
  <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">
    <div style="flex:1;min-width:200px">
      <div style="font-size:11px;color:var(--tx3);margin-bottom:5px">Biome tags (${biomeTags.length})</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">${biomeTagHtml}</div>
    </div>
    <div style="flex:1;min-width:160px">
      <div style="font-size:11px;color:var(--tx3);margin-bottom:5px">Crop likes (${crop.liked.length} tags)</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">${likedTagHtml}</div>
      <div style="font-size:11px;margin-top:5px">
        ${(function(){
          var msg='';
          if(likedBonus>=28) msg=likedCount+' liked tags match (+28). Humidity +'+humBonus+' (rainfall '+rainfall+') — tags win.';
          else if(humBonus>likedBonus&&likedBonus>0) msg=likedCount+' liked tag(s) match (+'+likedBonus+') but humidity wins (+'+humBonus+', rainfall '+rainfall+').';
          else if(humBonus>likedBonus) msg='No liked tags match — humidity gives +'+humBonus+' (rainfall '+rainfall+').';
          else if(likedBonus>0) msg=likedCount+' of '+crop.liked.length+' liked tags match (+'+likedBonus+'). Humidity +'+humBonus+' (rainfall '+rainfall+').';
          else msg='No liked tags match and low humidity (rainfall '+rainfall+') — no bonus.';
          return '<span style="color:'+bonusCls+'">'+msg+'</span>';
        })()}
      </div>
    </div>
  </div>
  <div class="env-grid">
    <div class="env-card"><div class="env-val ${bonusCls}">+${effBonus}</div><div class="env-lbl">Bonus (${bonusSrc})</div></div>
    <div class="env-card" title="Rainfall: ${rainfall}"><div class="env-val ${humBonus>0?'c-tel':'c-gry'}">${humBonus>0?'+'+humBonus:'—'}</div><div class="env-lbl">Humidity (+${rainfall})</div></div>
    <div class="env-card"><div class="env-val c-tel">${np}</div><div class="env-lbl">Nutrient score</div></div>
    <div class="env-card"><div class="env-val ${np*NPS>=crop.tier*NPT?'c-grn':'c-red'}">${np*NPS>=crop.tier*NPT?'✓ OK':'⚠ LOW'}</div><div class="env-lbl">vs T${crop.tier} need (${crop.tier*NPT})</div></div>
    <div class="env-card"><div class="env-val ${grCls}">${gr<=0?'SICK':gr.toFixed(1)}</div><div class="env-lbl">Growth pts/tick</div></div>
    <div class="env-card"><div class="env-val ${timeCls}">${gr<=0?'∞':fmtTime(secondsToMature)}</div><div class="env-lbl">Time to mature</div></div>
    <div class="env-card"><div class="env-val c-gold">${gr<=0?'0':harvestsPerHour.toFixed(2)}</div><div class="env-lbl">Harvests/hr/crop</div></div>
  </div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;font-size:11px;color:var(--tx3)">
    <span>Avg drop rounds/harvest: <strong style="color:var(--tx)">${avgRounds.toFixed(3)}</strong></span>
    <span>·</span>
    <span>Base drop chance: <strong style="color:var(--tx)">${(Math.pow(0.95,crop.tier)*100).toFixed(2)}%</strong> (0.95^T${crop.tier})</span>
    <span>·</span>
    <span>Gain ${gain}: <strong style="color:var(--tx)">×${Math.pow(1.03,gain).toFixed(3)}</strong> multiplier</span>
    ${gr<=0?'<span style="color:var(--red);font-weight:600">⚠ Crop will get SICK — not enough nutrients for tier '+crop.tier+'</span>':''}
  </div>
</div>

<div class="result-block">
  <h2>📦 Drop Table & Production</h2>
  <div style="font-size:11px;color:var(--tx3);margin-bottom:10px">
    Per drop roll: <code style="background:var(--bg4);padding:1px 5px;border-radius:3px;font-size:11px">avgDropRounds × itemChance × (qty + Gain/100)</code>
    · qty=${qty} crop${qty===1?'':'s'}
  </div>
  <table class="drop-table">
    <tr>
      <th>Item</th>
      <th>Roll chance</th>
      <th>Avg / harvest</th>
      <th>Per crop / hr</th>
      <th style="color:var(--grn)">${qty} crops / hr</th>
      <th style="color:var(--amb)">${qty} crops / day</th>
    </tr>
    ${dropRows.map(d=>`<tr>
      <td><span class="item-name">${d.item}</span></td>
      <td>${d.chPct}%</td>
      <td>${d.avgPerHarvest.toFixed(3)}</td>
      <td>${gr<=0?'—':d.perHourPer.toFixed(2)}</td>
      <td style="color:var(--grn);font-weight:600">${gr<=0?'—':fmtNum(d.perHourTotal)}</td>
      <td style="color:var(--amb);font-weight:600">${gr<=0?'—':fmtNum(d.perDay)}</td>
    </tr>`).join('')}
  </table>
  ${crop.note?`<div style="font-size:11px;color:var(--amb);margin-top:8px;background:var(--amb-d);border:1px solid var(--amb-b);border-radius:5px;padding:6px 10px">ℹ ${crop.note}</div>`:''}
</div>

${gr>0?`
<div class="result-block">
  <h2>⏱ Production at different crop counts</h2>
  <table class="drop-table">
    <tr><th>Crops</th>${dropRows.map(d=>`<th>${d.item} /hr</th>`).join('')}</tr>
    ${[1,4,9,16,25,36,64,100].map(n=>`<tr>
      <td style="color:${n===qty?'var(--grn)':'var(--tx2)'};font-weight:${n===qty?700:400}">${n}${n===qty?' ★':''}</td>
      ${dropRows.map(d=>`<td style="color:${n===qty?'var(--grn)':'var(--tx2)'}">${fmtNum(d.perHourPer*n)}</td>`).join('')}
    </tr>`).join('')}
  </table>
</div>`:''}
`;
}

// ── INIT ──────────────────────────────────────────────────────────────────────
filterBiomes();
renderCropList();
