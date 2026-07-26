
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

// ── CROP DATABASE (auto-extracted from cropsnh-2.0.85.jar) ─────────────────
// drops: [{item, chance (0-10000), qty}] — chance weights from CropCard.addDrop
// liked: BiomeDictionary tags from addLikedBiomes()
// growth: getGrowthDuration() when not equal to default tier*600 (NHCropCard)
// Source: decompiled CropsNH 2.0.85 only — no external mod docs.
const CROPS=[
  {id:'Allium',name:'Allium',tier:2,liked:['DRY','SANDY','SPARSE'],drops:[{item:'Magenta Dye',ch:10000,qty:1}],growth:600},
  {id:'AluminiumOreBerry',name:'Aluminium Ore Berry',tier:5,liked:['COLD','DRY'],drops:[{item:'Aluminium Ore Berry',ch:10000,qty:6}],growth:6000,blockUnder:'aluminium',note:'TiC req'},
  {id:'AndesiteLily',name:'Andesite Lily',tier:1,liked:['MOUNTAIN','HILLS'],drops:[{item:'Andesite (stone)',ch:10000,qty:1}],blockUnder:'modernAndesite'},
  {id:'ArditeOreBerry',name:'Ardite Ore Berry',tier:5,liked:['NETHER','HOT'],drops:[{item:'Ardite Nugget',ch:10000,qty:1}],growth:6000,blockUnder:'ardite',note:'TiC req'},
  {id:'Argentia',name:'Argentia',tier:7,liked:['MOUNTAIN','HOT'],drops:[{item:'Argentia Leaf',ch:10000,qty:1}],growth:1400,blockUnder:'silver'},
  {id:'Auronia',name:'Auronia',tier:8,liked:['MESA','SANDY'],drops:[{item:'Auronia Leaf',ch:10000,qty:1}],growth:3700,blockUnder:'gold'},
  {id:'AzureBluet',name:'Azure Bluet',tier:2,liked:['HILLS','FOREST','LUSH'],drops:[{item:'Light Gray Dye',ch:10000,qty:1}],growth:600},
  {id:'Bamboo',name:'Bamboo',tier:2,liked:['DENSE','JUNGLE','LUSH','FOREST'],drops:[{item:'BoP bamboo',ch:10000,qty:2}],growth:250,note:'BoP req'},
  {id:'Barley',name:'Barley',tier:2,liked:['PLAINS','DRY'],drops:[{item:'Barley',ch:10000,qty:1}],growth:675,note:'Natura+BoP req'},
  {id:'BasaltLily',name:'Basalt Lily',tier:1,liked:['MOUNTAIN','HILLS'],drops:[{item:'Basalt Dust',ch:10000,qty:9}],blockUnder:'basalt'},
  {id:'Bauxia',name:'Bauxia',tier:6,liked:['COLD','DRY'],drops:[{item:'Bauxia Leaf',ch:10000,qty:1}],growth:1200,blockUnder:'aluminiumBauxite',machine:true},
  {id:'Belladonna',name:'Belladonna',tier:4,liked:['WET','SPOOKY'],drops:[{item:'Belladonna',ch:10000,qty:1}],growth:1100,note:'Witchery req'},
  {id:'BlackGraniteLily',name:'Black Granite Lily',tier:1,liked:['MOUNTAIN','HILLS'],drops:[{item:'Granite Black Dust',ch:10000,qty:9}],blockUnder:'blackGranite'},
  {id:'Blackberry',name:'Blackberry',tier:2,liked:['WET','DENSE','LUSH'],drops:[{item:'Blackberry',ch:10000,qty:3}],growth:200,note:'Natura req'},
  {id:'Blazereed',name:'Blazereed',tier:6,liked:['NETHER','HOT'],drops:[{item:'Blaze Powder',ch:7500,qty:1},{item:'Fermented Spider Eye',ch:2500,qty:1}],note:'TC req'},
  {id:'Blightberry',name:'Blightberry',tier:4,liked:['NETHER','DRY'],drops:[{item:'berry.nether',ch:10000,qty:2}],growth:300,note:'Natura req'},
  {id:'BlueGlowshroom',name:'Blue Glowshroom',tier:3,liked:['NETHER','MUSHROOM','MAGICAL'],drops:[{item:'Blue Glowshroom',ch:10000,qty:1}],growth:600,note:'Natura req'},
  {id:'BlueOrchid',name:'Blue Orchid',tier:2,liked:['WET','SWAMP'],drops:[{item:'Light Blue Dye',ch:10000,qty:1}],growth:600},
  {id:'Blueberry',name:'Blueberry',tier:2,liked:['HILLS','FOREST','LUSH'],drops:[{item:'Blueberry',ch:10000,qty:3}],growth:200,note:'Natura req'},
  {id:'BobsYerUncleRanks',name:'BobsYerUncleRanks',tier:6,liked:['MOUNTAIN','HILLS'],drops:[{item:'Bob\'s Yer Uncle Berry',ch:7500,qty:1},{item:'Emerald',ch:2500,qty:1}],growth:3000,blockUnder:'emerald'},
  {id:'BonsaiAcacia',name:'Bonsai Acacia',tier:1,liked:['HOT','SPARSE','SAVANNA','PLAINS'],drops:[{item:'Acacia Sapling',ch:3000,qty:1},{item:'Acacia Log',ch:6000,qty:10}],growth:1200},
  {id:'BonsaiBirch',name:'Bonsai Birch',tier:1,liked:['FOREST','HILLS'],drops:[{item:'Birch Sapling',ch:3000,qty:1},{item:'Birch Log',ch:6000,qty:10}],growth:1200},
  {id:'BonsaiDarkOak',name:'Bonsai Dark Oak',tier:1,liked:['DENSE','SPOOKY','FOREST'],drops:[{item:'Dark Oak Sapling',ch:3000,qty:1},{item:'Dark Oak Log',ch:6000,qty:10}],growth:1200},
  {id:'BonsaiJungle',name:'Bonsai Jungle',tier:1,liked:['HOT','JUNGLE','WET','DENSE'],drops:[{item:'Jungle Sapling',ch:3000,qty:1},{item:'Jungle Log',ch:6000,qty:10}],growth:1200},
  {id:'BonsaiOak',name:'Bonsai Oak',tier:1,liked:['PLAINS','FOREST','HILLS'],drops:[{item:'Oak Sapling',ch:3000,qty:1},{item:'Oak Log',ch:6000,qty:10},{item:'Apple',ch:500,qty:2}],growth:1200},
  {id:'BonsaiRubber',name:'Bonsai Rubber',tier:1,liked:['CONIFEROUS','FOREST'],drops:[{item:'Rubber Sapling',ch:3000,qty:1},{item:'Rubber Wood',ch:6000,qty:10},{item:'IC2 Resin',ch:500,qty:2}],growth:1200},
  {id:'BonsaiSlimy',name:'Bonsai Slimy',tier:1,liked:['WET','SWAMP'],drops:[{item:'Slime Sapling',ch:3000,qty:1},{item:'Slime Gel',ch:6000,qty:4}],growth:1200,note:'Crop Breeder only: BonsaiJungle + BonsaiRubber + Slimeplant.'},
  {id:'BonsaiSpruce',name:'Bonsai Spruce',tier:1,liked:['FOREST','CONIFEROUS','MOUNTAIN'],drops:[{item:'Spruce Sapling',ch:3000,qty:1},{item:'Spruce Log',ch:6000,qty:10}],growth:1200},
  {id:'BoPBerry',name:'BoP Berry',tier:2,liked:['FOREST','DENSE'],drops:[{item:'BoP food',ch:10000,qty:3}],growth:200,note:'BoP req'},
  {id:'BrownMushroom',name:'Brown Mushroom',tier:1,liked:['MUSHROOM','WET','SWAMP'],drops:[{item:'Brown Mushroom',ch:10000,qty:1}],growth:400},
  {id:'Cactus',name:'Cactus',tier:3,liked:['SANDY','HOT','DRY'],drops:[{item:'Cactus',ch:10000,qty:1}],growth:450},
  {id:'Canola',name:'Canola',tier:4,liked:['COLD','PLAINS'],drops:[{item:'Canola Flower',ch:10000,qty:1}],growth:450},
  {id:'Carrot',name:'Carrot',tier:2,liked:['PLAINS','HOT','SANDY'],drops:[{item:'Carrot',ch:10000,qty:1}],growth:800},
  {id:'Cassitine',name:'Cassitine',tier:6,liked:['COLD','SPARSE','DRY'],drops:[{item:'Tin Dust Tiny',ch:10000,qty:1}],growth:2800,blockUnder:'tin'},
  {id:'Chilly',name:'Chilly',tier:4,liked:['HOT','LUSH'],drops:[{item:'Chilipepper',ch:10000,qty:1}],growth:800},
  {id:'Cinderpearl',name:'Cinderpearl',tier:5,liked:['HOT','DRY','MAGICAL'],drops:[{item:'Thaumcraft blockCustomPlant:3',ch:10000,qty:1}],growth:4000,blockUnder:'blaze',note:'TC req'},
  {id:'ClayLily',name:'Clay Lily',tier:1,liked:['WET','RIVER','SWAMP'],drops:[{item:'Clay',ch:10000,qty:1}],growth:850,blockUnder:'clay'},
  {id:'CobaltOreBerry',name:'Cobalt Ore Berry',tier:5,liked:['NETHER','DRY'],drops:[{item:'Cobalt Nugget',ch:10000,qty:1}],growth:6000,blockUnder:'cobalt',note:'TiC req'},
  {id:'Cocoa',name:'Cocoa',tier:3,liked:['JUNGLE','WET','DENSE','LUSH'],drops:[{item:'Cocoa Beans',ch:10000,qty:1}],growth:1700},
  {id:'Coffee',name:'Coffee',tier:7,liked:['HOT','LUSH','WET'],drops:[{item:'Coffee',ch:10000,qty:1}],growth:2800},
  {id:'CopperOreBerry',name:'Copper Ore Berry',tier:5,liked:['SAVANNA','HOT','SANDY'],drops:[{item:'Copper Ore Berry',ch:10000,qty:6}],growth:6000,blockUnder:'copper',note:'TiC req'},
  {id:'Coppon',name:'Coppon',tier:6,liked:['SAVANNA','HOT','SANDY'],drops:[{item:'Coppon Fiber',ch:10000,qty:1}],growth:1200,blockUnder:'copper'},
  {id:'Corium',name:'Corium',tier:6,liked:['PLAINS','FOREST'],drops:[{item:'Bone',ch:10000,qty:1}],growth:800},
  {id:'Corpseplant',name:'Corpseplant',tier:5,liked:['DEAD','SPOOKY'],drops:[{item:'Bone Meal',ch:6250,qty:1},{item:'Rotten Flesh',ch:2500,qty:1},{item:'Bone',ch:1250,qty:1}],growth:800},
  {id:'Cotton',name:'Cotton',tier:3,liked:['DRY','HOT'],drops:[{item:'Natura barleyFood',ch:10000,qty:1}],growth:900,note:'Natura req'},
  {id:'Creeperweed',name:'Creeperweed',tier:7,liked:['DEAD','SPOOKY'],drops:[{item:'Slimeball',ch:10000,qty:1}],growth:1000},
  {id:'Cucumber',name:'Cucumber',tier:4,liked:['HOT','LUSH'],drops:[{item:'Cucumber',ch:10000,qty:1}],growth:800},
  {id:'Dandelion',name:'Dandelion',tier:2,liked:['PLAINS','FOREST'],drops:[{item:'Dandelion Yellow',ch:10000,qty:1}],growth:600},
  {id:'Dayflower',name:'Dayflower',tier:2,liked:['COLD','HILLS','SPARSE'],drops:[{item:'Cyan Dye',ch:10000,qty:1}],growth:600},
  {id:'DeepslateLily',name:'Deepslate Lily',tier:1,liked:['MOUNTAIN','HILLS'],drops:[{item:'NewHorizonsCoreMod DeepslateDust',ch:10000,qty:9}],blockUnder:'deepslate',note:'EtFuturum req'},
  {id:'Diareed',name:'Diareed',tier:12,liked:['COLD','SPARSE'],drops:[{item:'Diamond',ch:7500,qty:1},{item:'Diamond Dust',ch:2500,qty:1}],blockUnder:'diamond'},
  {id:'DioriteLily',name:'Diorite Lily',tier:1,liked:['MOUNTAIN','HILLS'],drops:[{item:'Diorite (stone)',ch:10000,qty:1}],blockUnder:'modernDiorite'},
  {id:'Duskberry',name:'Duskberry',tier:4,liked:['NETHER','HOT'],drops:[{item:'berry.nether',ch:10000,qty:2}],growth:300,note:'Natura req'},
  {id:'EggPlant',name:'Egg Plant',tier:6,liked:['PLAINS','FOREST'],drops:[{item:'Leather',ch:6000,qty:1},{item:'Feather',ch:3000,qty:1},{item:'Raw Chicken',ch:1000,qty:1}],growth:1200},
  {id:'EmberMoss',name:'Ember Moss',tier:7,liked:['HOT','DRY'],drops:[{item:'Ember Moss',ch:10000,qty:1}],growth:1100,note:'Witchery req'},
  {id:'EndStoneLily',name:'End Stone Lily',tier:1,liked:['END','DRY','COLD'],drops:[{item:'Endstone Dust',ch:10000,qty:2}],growth:850,blockUnder:'endStone'},
  {id:'Enderbloom',name:'Enderbloom',tier:10,liked:['END','COLD'],drops:[{item:'Ender Pearl Dust',ch:6250,qty:1},{item:'Spider Eye',ch:3750,qty:1}],growth:3000,blockUnder:'endStone'},
  {id:'EssenceOreBerry',name:'Essence Ore Berry',tier:5,liked:['MAGICAL','DEAD'],drops:[{item:'Essence Ore Berry',ch:10000,qty:6}],growth:6000,blockUnder:'skull',note:'TiC req'},
  {id:'EvilOre',name:'Evil Ore',tier:8,liked:['HOT','DRY','NETHER'],drops:[{item:'Nether Quartz Dust',ch:6666,qty:1},{item:'Certus Quartz Dust',ch:1667,qty:1},{item:'Nether Quartz',ch:1667,qty:1}],growth:1600},
  {id:'Eyebulb',name:'Eyebulb',tier:1,liked:['NETHER','SPOOKY'],drops:[{item:'BoP flowers',ch:10000,qty:1}],growth:450,note:'BoP req'},
  {id:'Ferrofern',name:'Ferrofern',tier:6,liked:['MOUNTAIN','HILLS'],drops:[{item:'Ferrofern Leaf',ch:10000,qty:1}],growth:2800,blockUnder:'iron'},
  {id:'Fertilia',name:'Fertilia',tier:3,liked:['SWAMP','WET','HOT'],drops:[{item:'Calcite Dust',ch:6250,qty:1},{item:'Phosphate Dust',ch:1250,qty:1},{item:'Apatite Dust',ch:1250,qty:1},{item:'fertilizer',ch:1250,qty:1}]},
  {id:'Flax',name:'Flax',tier:2,liked:['WET','RIVER','BEACH','SANDY'],drops:[{item:'String',ch:10000,qty:1}]},
  {id:'FloweringVine',name:'Flowering Vine',tier:3,liked:['JUNGLE','DENSE'],drops:[{item:'BoP flowerVine',ch:10000,qty:2}],growth:675,note:'BoP req'},
  {id:'GaiaWart',name:'Gaia Wart',tier:5,liked:['SNOWY','COLD'],drops:[{item:'Gaia Wart',ch:10000,qty:1}],growth:1000,blockUnder:'snow',note:'Obtained by growing Nether Wart to maturity on Soul Sand, then right-clicking with Snow Blocks until it converts. Not breedable.'},
  {id:'Galvania',name:'Galvania',tier:6,liked:['DRY','HOT'],drops:[{item:'Galvania Leaf',ch:10000,qty:1}],growth:1200,blockUnder:'zinc'},
  {id:'Garlic',name:'Garlic',tier:3,liked:['PLAINS','DRY'],drops:[{item:'Garlic',ch:10000,qty:1}],growth:450,note:'Witchery req'},
  {id:'Garnydinia',name:'Garnydinia',tier:7,liked:['SAVANNA','SANDY','MESA'],drops:[{item:'Garnet Red Dust',ch:2250,qty:1},{item:'Garnet Yellow Dust',ch:2250,qty:1},{item:'Garnet Red Gem',ch:2250,qty:1},{item:'Garnet Yellow Gem',ch:2250,qty:1},{item:'Garnet Red gemExquisite',ch:250,qty:1},{item:'Garnet Yellow gemExquisite',ch:250,qty:1},{item:'Garnet Red crushedPurified',ch:250,qty:1},{item:'Garnet Yellow crushedPurified',ch:250,qty:1}],growth:850,blockUnder:'garnetGem',machine:true,note:'Crop Synthesizer only. Requires garnet block y-2.'},
  {id:'GlintWeed',name:'Glint Weed',tier:4,liked:['MAGICAL','PLAINS','SANDY'],drops:[{item:'Glint Weed',ch:10000,qty:1}],growth:1100,note:'Witchery req'},
  {id:'Glowflower',name:'Glowflower',tier:3,liked:['WET','LUSH','MAGICAL','FOREST'],drops:[{item:'BoP flowers',ch:10000,qty:2}],growth:2000,note:'BoP req'},
  {id:'Glowheat',name:'Glowheat',tier:4,liked:['PLAINS','HOT','NETHER'],drops:[{item:'Nether Wart',ch:10000,qty:1}],growth:1500,blockUnder:'glowstone'},
  {id:'GlowingCoral',name:'Glowing Coral',tier:5,liked:['OCEAN','RIVER'],drops:[{item:'BoP coral1',ch:10000,qty:2}],growth:450,blockUnder:'glowstone',note:'BoP req'},
  {id:'Glowshroom',name:'Glowshroom',tier:3,liked:['NETHER','MAGICAL','MUSHROOM'],drops:[{item:'BoP mushrooms',ch:10000,qty:1}],growth:600,note:'BoP req'},
  {id:'GodOfThunder',name:'God of Thunder',tier:9,liked:['WASTELAND','SPARSE'],drops:[{item:'Thunder Leaf',ch:10000,qty:1}],growth:3600,blockUnder:'thorium',machine:true,note:'Crop Synthesizer only. Requires thorium block y-2. Extreme rarity crop.'},
  {id:'GoldOreBerry',name:'Gold Ore Berry',tier:5,liked:['MESA','SANDY'],drops:[{item:'Gold Ore Berry',ch:10000,qty:6}],growth:6000,blockUnder:'gold',note:'TiC req'},
  {id:'Goldfish',name:'Goldfish',tier:4,liked:['RIVER','WET','SPOOKY'],drops:[{item:'Goldfish',ch:6000,qty:1}],growth:450},
  {id:'GraniteLily',name:'Granite Lily',tier:1,liked:['MOUNTAIN','HILLS'],drops:[{item:'Granite (stone)',ch:10000,qty:1}],blockUnder:'modernGranite'},
  {id:'Grape',name:'Grape',tier:4,liked:['HOT','DRY','SPARSE'],drops:[{item:'cropGrape',ch:10000,qty:1}],growth:800,note:'Natura req'},
  {id:'GreenGlowshroom',name:'Green Glowshroom',tier:3,liked:['NETHER','MUSHROOM','MAGICAL'],drops:[{item:'Green Glowshroom',ch:10000,qty:1}],growth:600},
  {id:'Hemp',name:'Hemp',tier:5,liked:['DRY','SANDY'],drops:[{item:'Hemp Stem',ch:10000,qty:1}],growth:800},
  {id:'Hops',name:'Hops',tier:5,liked:['PLAINS','LUSH'],drops:[{item:'Hops',ch:10000,qty:1}],growth:2400},
  {id:'Huckleberry',name:'Huckleberry',tier:2,liked:['MOUNTAIN','HILLS','PLAINS','COLD'],drops:[{item:'Huckleberry',ch:10000,qty:1}],growth:200,note:'Natura req'},
  {id:'Indigo',name:'Indigo',tier:2,liked:['WET','LUSH'],drops:[{item:'Indigo Blossom',ch:10000,qty:1}]},
  {id:'InkBloom',name:'Ink Bloom',tier:4,liked:['WET','OCEAN'],drops:[{item:'Ink Sac',ch:10000,qty:1}],growth:600},
  {id:'Iridine',name:'Iridine',tier:12,liked:['SNOWY','COLD'],drops:[{item:'Iridine Flower',ch:7500,qty:1}],blockUnder:'iridium',machine:true,note:'Crop Synthesizer only. Requires iridium block y-2. LUV+ machine tier.'},
  {id:'IronOreBerry',name:'Iron Ore Berry',tier:5,liked:['MOUNTAIN','HILLS'],drops:[{item:'Iron Ore Berry',ch:10000,qty:6}],growth:6000,blockUnder:'iron',note:'TiC req'},
  {id:'Ivy',name:'Ivy',tier:2,liked:['NETHER','JUNGLE','MAGICAL','DENSE'],drops:[{item:'BoP ivy',ch:10000,qty:2}],growth:450,note:'BoP req'},
  {id:'KnightmetalBerry',name:'Knightmetal Berry',tier:8,liked:['SPOOKY','DEAD'],drops:[{item:'Knightmetal Armor Shard',ch:10000,qty:4}],growth:5500,blockUnder:'knightmetal',note:'TiC+TF req'},
  {id:'Lazulia',name:'Lazulia',tier:7,liked:['HOT','SANDY'],drops:[{item:'Lapis Dust',ch:6667,qty:1},{item:'Lapis Lazuli',ch:3333,qty:1}],growth:2800,blockUnder:'lapis'},
  {id:'Lemon',name:'Lemon',tier:4,liked:['HOT','DRY','PLAINS'],drops:[{item:'cropLemon',ch:10000,qty:1}],growth:800},
  {id:'Liveroot',name:'Liveroot',tier:8,liked:['SPOOKY','DENSE'],drops:[{item:'Live Root Dust',ch:7500,qty:1},{item:'TF LiveRoot',ch:7500,qty:1}],note:'TwilightForest req'},
  {id:'MagicalNightshade',name:'Magical Nightshade',tier:13,liked:['MAGICAL','COLD'],drops:[{item:'Magic Essence',ch:10000,qty:1}],growth:23436,blockUnder:'shadowmetal',machine:true,note:'Has alternate seed (CropsNH magic essence item). Also obtainable via Crop Breeder. Requires shadowmetal block y-2. Magical + Cold biomes.'},
  {id:'Malaxia',name:'Malaxia',tier:6,liked:['PLAINS','LUSH'],drops:[{item:'Copper Dust Tiny',ch:10000,qty:1}],growth:2800,blockUnder:'copper'},
  {id:'Maloberry',name:'Maloberry',tier:2,liked:['COLD','WET','LUSH'],drops:[{item:'Maloberry',ch:10000,qty:3}],growth:200,note:'Natura req'},
  {id:'ManaBean',name:'Mana Bean',tier:5,liked:['MAGICAL','FOREST'],drops:[{item:'Mana Bean (AIR)',ch:1666,qty:1},{item:'Mana Bean (FIRE)',ch:1666,qty:1},{item:'Mana Bean (WATER)',ch:1666,qty:1},{item:'Mana Bean (EARTH)',ch:1666,qty:1},{item:'Mana Bean (ORDER)',ch:1666,qty:1},{item:'Mana Bean (ENTROPY)',ch:1666,qty:1}],growth:2000,blockUnder:'mixedCrystalCluster',note:'TC req'},
  {id:'Mandrake',name:'Mandrake',tier:4,liked:['MAGICAL','SPOOKY'],drops:[{item:'Mandrake',ch:10000,qty:1}],growth:1100,note:'Witchery req'},
  {id:'MarbleLily',name:'Marble Lily',tier:1,liked:['MOUNTAIN','HILLS'],drops:[{item:'Marble Dust',ch:10000,qty:9}],blockUnder:'marble'},
  {id:'Meatrose',name:'Meatrose',tier:7,liked:['PLAINS','MAGICAL'],drops:[{item:'Pink Dye',ch:6000,qty:1},{item:'Raw Chicken',ch:1000,qty:1},{item:'Raw Fish',ch:1000,qty:1},{item:'Raw Beef',ch:1000,qty:1},{item:'Egg',ch:1000,qty:1}]},
  {id:'Melon',name:'Melon',tier:2,liked:['WET','LUSH'],drops:[{item:'Melon',ch:6666,qty:4}]},
  {id:'Micadia',name:'Micadia',tier:9,liked:['HILLS','SPARSE'],drops:[{item:'Micadia Flower',ch:10000,qty:1}],growth:1800,blockUnder:'mica',machine:true,note:'Crop Synthesizer only. Requires mica block y-2.'},
  {id:'MilkWart',name:'Milk Wart',tier:6,liked:['PLAINS','LUSH'],drops:[{item:'Milk Wart',ch:10000,qty:1}],growth:2400},
  {id:'Moss',name:'Moss',tier:4,liked:['WET','SWAMP','LUSH'],drops:[{item:'TF tile.TFPlant',ch:500,qty:1},{item:'BoP moss',ch:3000,qty:1},{item:'BoP treeMoss',ch:6500,qty:1}],growth:450,note:'BoP req'},
  {id:'Necrobloom',name:'Necrobloom',tier:3,liked:['DEAD','WASTELAND'],drops:[{item:'poisonPowder',ch:9500,qty:1},{item:'Purple Dye',ch:500,qty:1}]},
  {id:'NetherStoneLily',name:'Nether Stone Lily',tier:1,liked:['NETHER','HOT','DRY'],drops:[{item:'Netherrack Dust',ch:10000,qty:9}],blockUnder:'netherrack'},
  {id:'Netherwart',name:'Nether Wart',tier:5,liked:['NETHER','HOT'],drops:[{item:'Ender Pearl',ch:10000,qty:1}],growth:2000},
  {id:'Nickelback',name:'Nickelback',tier:5,liked:['PLAINS','LUSH'],drops:[{item:'Nickelback Leaf',ch:10000,qty:1}],growth:1000,blockUnder:'nickel'},
  {id:'OilBerry',name:'Oil Berry',tier:4,liked:['HOT','WASTELAND'],drops:[{item:'Oil Berry',ch:10000,qty:2}],growth:1200,machine:true,note:'Crop Breeder only: SoulSandLily + Withereed. Requires oil soil.'},
  {id:'Olivia',name:'Olivia',tier:2,liked:['HILLS','DRY'],drops:[{item:'Olivine Dust',ch:7500,qty:1},{item:'Olivine Gem',ch:2500,qty:1}],growth:400,blockUnder:'olivine',machine:true,note:'Crop Synthesizer only. Requires olivine block y-2.'},
  {id:'Onion',name:'Onion',tier:4,liked:['DRY','SANDY','SPARSE'],drops:[{item:'Onion',ch:10000,qty:1}],growth:800},
  {id:'OrangeTulip',name:'Orange Tulip',tier:2,liked:['PLAINS','WET'],drops:[{item:'Orange Dye',ch:10000,qty:1}],growth:600},
  {id:'Osmianth',name:'Osmianth',tier:12,liked:['OCEAN','RIVER'],drops:[{item:'Osmianth Flower',ch:2500,qty:1}],blockUnder:'osmium',machine:true,note:'Crop Synthesizer only. Requires osmium block y-2. ZPM+ machine tier.'},
  {id:'OxeyeDaisy',name:'Oxeye Daisy',tier:2,liked:['PLAINS','FOREST'],drops:[{item:'Light Gray Dye',ch:10000,qty:1}],growth:600},
  {id:'Papyrus',name:'Papyrus',tier:5,liked:['WET','SWAMP','JUNGLE'],drops:[{item:'Book',ch:10000,qty:1}],growth:450},
  {id:'PinkTulip',name:'Pink Tulip',tier:2,liked:['PLAINS','WET'],drops:[{item:'Pink Dye',ch:10000,qty:1}],growth:600},
  {id:'Platina',name:'Platina',tier:11,liked:['HOT','SANDY'],drops:[{item:'Platina Leaf',ch:10000,qty:1}],blockUnder:'platinum',machine:true,note:'Crop Synthesizer only. Requires platinum block y-2. EV+ machine tier.'},
  {id:'Plumbilia',name:'Plumbilia',tier:6,liked:['SAVANNA','PLAINS'],drops:[{item:'Plumbilia Leaf',ch:10000,qty:1}],growth:1200,blockUnder:'lead'},
  {id:'Plumbshade',name:'Plumbshade',tier:6,liked:['HOT','WET'],drops:[{item:'Lead Dust Tiny',ch:10000,qty:1}],growth:2800,blockUnder:'lead'},
  {id:'Poppy',name:'Poppy',tier:2,liked:['PLAINS','HILLS'],drops:[{item:'Rose Red',ch:10000,qty:1}],growth:600},
  {id:'Potato',name:'Potato',tier:1,liked:['PLAINS','COLD'],drops:[{item:'Potato',ch:10000,qty:1}],growth:800},
  {id:'PrimordialBerry',name:'Primordial Berry',tier:16,liked:['END','MAGICAL'],drops:[{item:'Primordial Pearl (TC ItemEldritchObject:3)',ch:10000,qty:1}],growth:375000,note:'Has alternate seed (Thaumcraft Primordial Pearl). Thaumcraft req.'},
  {id:'Pumpkin',name:'Pumpkin',tier:2,liked:['PLAINS','WET'],drops:[{item:'Pumpkin',ch:10000,qty:1}],growth:1000},
  {id:'PurpleGlowshroom',name:'Purple Glowshroom',tier:3,liked:['NETHER','MUSHROOM','MAGICAL'],drops:[{item:'Purple Glowshroom',ch:10000,qty:1}],growth:600,note:'Natura req'},
  {id:'PurpleTulip',name:'Purple Tulip',tier:2,liked:['WET','PLAINS'],drops:[{item:'Purple Dye',ch:10000,qty:1}],growth:600},
  {id:'Pyrolusium',name:'Pyrolusium',tier:12,liked:['NETHER','HOT'],drops:[{item:'Pyrolusium Leaf',ch:10000,qty:1}],growth:2400,blockUnder:'manganese'},
  {id:'Raspberry',name:'Raspberry',tier:2,liked:['PLAINS','DRY'],drops:[{item:'Raspberry',ch:10000,qty:3}],growth:200,note:'Natura req'},
  {id:'Reactoria',name:'Reactoria',tier:12,liked:['COLD','HOT'],drops:[{item:'Reactoria Leaf',ch:7500,qty:1},{item:'Reactoria Stem',ch:2500,qty:1}],growth:4800,blockUnder:'uranium',machine:true,note:'Crop Synthesizer only. Requires uranium block y-2. ZPM+ machine tier.'},
  {id:'RedGraniteLily',name:'Red Granite Lily',tier:1,liked:['MOUNTAIN','HILLS'],drops:[{item:'Granite Red Dust',ch:10000,qty:9}],blockUnder:'redGranite'},
  {id:'RedMushroom',name:'Red Mushroom',tier:1,liked:['MUSHROOM','WET','SWAMP'],drops:[{item:'Red Mushroom',ch:10000,qty:1}],growth:400},
  {id:'RedStraw',name:'Red Straw',tier:6,liked:['PLAINS','HOT'],drops:[{item:'Redstone',ch:10000,qty:1}],growth:1500,blockUnder:'redstone'},
  {id:'RedTulip',name:'Red Tulip',tier:2,liked:['PLAINS','HOT'],drops:[{item:'Rose Red',ch:10000,qty:1}],growth:600},
  {id:'Rubyne',name:'Rubyne',tier:4,liked:['MOUNTAIN','RIVER'],drops:[{item:'Ruby Dust',ch:7500,qty:1},{item:'Ruby Gem',ch:2500,qty:1}],growth:800,blockUnder:'ruby'},
  {id:'SaguaroCactus',name:'Saguaro Cactus',tier:4,liked:['HOT','DRY','SANDY'],drops:[{item:'Natura Saguaro',ch:5000,qty:2},{item:'Natura saguaro.fruit',ch:5000,qty:3}],growth:450,note:'Natura req'},
  {id:'SaltyRoot',name:'Salty Root',tier:4,liked:['DRY','SANDY','DRY','DEAD'],drops:[{item:'Salty Root',ch:10000,qty:1}],growth:1600},
  {id:'SandLily',name:'Sand Lily',tier:1,liked:['SANDY','DRY','HOT'],drops:[{item:'Sand',ch:10000,qty:4}],blockUnder:'sand'},
  {id:'Sapphirum',name:'Sapphirum',tier:4,liked:['OCEAN','WET','COLD'],drops:[{item:'Sapphire Dust',ch:7500,qty:1},{item:'Sapphire Gem',ch:2500,qty:1}],growth:800,blockUnder:'sapphire'},
  {id:'Scheelinium',name:'Scheelinium',tier:12,liked:['OCEAN','WET','COLD'],drops:[{item:'Scheelinium Leaf',ch:10000,qty:1}],growth:2400,blockUnder:'tungsten',machine:true,note:'Crop Synthesizer only. Requires tungsten block y-2. EV+ machine tier.'},
  {id:'Shimmerleaf',name:'Shimmerleaf',tier:5,liked:['MAGICAL','LUSH'],drops:[{item:'Thaumcraft blockCustomPlant:2',ch:10000,qty:1}],growth:4000,blockUnder:'quicksilver',note:'TC req'},
  {id:'Silviscus',name:'Silviscus',tier:8,liked:['COLD','SNOWY','SPOOKY'],drops:[{item:'Silver Dust Tiny',ch:10000,qty:1}],growth:3700,blockUnder:'silver'},
  {id:'Skyberry',name:'Skyberry',tier:4,liked:['NETHER','DRY'],drops:[{item:'berry.nether',ch:10000,qty:2}],growth:300,note:'Natura req'},
  {id:'Slimeplant',name:'Slimeplant',tier:6,liked:['WET','SWAMP'],drops:[{item:'Paper',ch:10000,qty:1}],growth:1200},
  {id:'Snowbell',name:'Snowbell',tier:4,liked:['SNOWY','COLD'],drops:[{item:'Snowbell',ch:8900,qty:1},{item:'Snowball',ch:1000,qty:1},{item:'Cryolite Dust',ch:250,qty:1}],growth:1100,note:'Witchery req'},
  {id:'SoulSandLily',name:'Soul Sand Lily',tier:2,liked:['NETHER','SPOOKY','SANDY'],drops:[{item:'Nether Brick',ch:2500,qty:1}],growth:2000,blockUnder:'soulSand'},
  {id:'SpaceFlower',name:'Space FlowerS',tier:13,liked:['COLD','DRY','DEAD'],drops:[{item:'Space Flower',ch:10000,qty:1}],growth:15000,blockUnder:'space',machine:true,note:'Crop Synthesizer only. Requires space rock y-2. Galacticraft req. UV+ machine tier.'},
  {id:'SpanishMoss',name:'Spanish Moss',tier:7,liked:['LUSH','WET','FOREST','SWAMP'],drops:[{item:'Spanish Moss',ch:10000,qty:1}],growth:675,note:'Witchery req'},
  {id:'Spidernip',name:'Spidernip',tier:4,liked:['WET','LUSH'],drops:[{item:'String',ch:6666,qty:1},{item:'Gunpowder',ch:1667,qty:1},{item:'Cobweb',ch:1667,qty:1}]},
  {id:'StarWart',name:'Star Wart',tier:12,liked:['NETHER','DEAD'],drops:[{item:'Star Wart',ch:10000,qty:1}],blockUnder:'netherStar',machine:true,note:'Crop Synthesizer only. Requires nether star block y-2. ZPM+ machine tier.'},
  {id:'Stargatium',name:'Stargatium',tier:12,liked:['LUSH','WASTELAND'],drops:[{item:'Stargatium Leaf',ch:7500,qty:1},{item:'Endstone Dust',ch:2500,qty:1}],blockUnder:'naquadah',machine:true,note:'Crop Synthesizer only. Requires end stone y-2 (naquadah). UV+ machine tier.'},
  {id:'Steeleafranks',name:'Steeleafranks',tier:10,liked:['SPOOKY','DEAD'],drops:[{item:'Steeleaf Dust',ch:2500,qty:1},{item:'Steeleaf',ch:2500,qty:1}],blockUnder:'steeleaf',note:'TwilightForest req'},
  {id:'StickyCane',name:'Sticky Cane',tier:4,liked:['WET','HOT','SANDY'],drops:[{item:'IC2 Resin',ch:10000,qty:1}],growth:200},
  {id:'Stingberry',name:'Stingberry',tier:4,liked:['NETHER','HOT'],drops:[{item:'berry.nether',ch:10000,qty:2}],growth:300,note:'Natura req'},
  {id:'StoneLily',name:'Stone Lily',tier:1,liked:['MOUNTAIN','HILLS'],drops:[{item:'Stone Dust',ch:10000,qty:9}],blockUnder:'stone'},
  {id:'Strawberry',name:'Strawberry',tier:2,liked:['PLAINS','LUSH'],drops:[{item:'Strawberry',ch:10000,qty:1}],growth:200,note:'PHC req'},
  {id:'SugarBeet',name:'Sugar Beet',tier:4,liked:['COLD','WET'],drops:[{item:'Sugar Beet',ch:10000,qty:1}],growth:450},
  {id:'SugarCane',name:'Sugar Cane',tier:2,liked:['WET','HOT'],drops:[{item:'Clay',ch:10000,qty:2}],growth:400},
  {id:'Tea',name:'Tea',tier:4,liked:['WET','HILLS','HOT'],drops:[{item:'cropTea',ch:10000,qty:1}],note:'Natura req'},
  {id:'Tearstalks',name:'Tearstalks',tier:8,liked:['NETHER','DEAD'],drops:[{item:'Ghast Tear',ch:6666,qty:1}]},
  {id:'ThauminiteOreBerry',name:'Thauminite Ore Berry',tier:7,liked:['MAGICAL','FOREST'],drops:[{item:'Thauminite Nugget',ch:10000,qty:1}],growth:4500,blockUnder:'thauminite',note:'TiC+TC+ThaumicBases req'},
  {id:'ThaumiumOreBerry',name:'Thaumium Ore Berry',tier:7,liked:['MAGICAL','SPOOKY'],drops:[{item:'Thaumium Nugget',ch:10000,qty:1}],growth:3000,blockUnder:'thaumium',note:'TiC+TC req'},
  {id:'Thiosulfine',name:'Thiosulfine',tier:6,liked:['NETHER','HOT'],drops:[{item:'Thiosulfine Flower',ch:10000,qty:1}],growth:1200,blockUnder:'sulfur'},
  {id:'Thornvine',name:'Thornvine',tier:3,liked:['NETHER','DRY'],drops:[{item:'Natura Thornvines',ch:10000,qty:2}],growth:450,note:'Natura req'},
  {id:'TinOreBerry',name:'Tin Ore Berry',tier:4,liked:['MOUNTAIN','HILLS'],drops:[{item:'Tin Ore Berry',ch:10000,qty:6}],growth:6000,blockUnder:'tin',note:'TiC req'},
  {id:'Tine',name:'Tine',tier:5,liked:['MOUNTAIN','HILLS'],drops:[{item:'Tine Twig',ch:10000,qty:1}],growth:1000,blockUnder:'tin'},
  {id:'Titania',name:'Titania',tier:9,liked:['HOT','SAVANNA'],drops:[{item:'Titania Leaf',ch:10000,qty:1}],growth:1800,blockUnder:'titanium',machine:true,note:'Crop Synthesizer only. Requires titanium block y-2. EV+ machine tier.'},
  {id:'Tomato',name:'Tomato',tier:4,liked:['HOT','WET'],drops:[{item:'Tomato',ch:7500,qty:1},{item:'Max Tomato',ch:2500,qty:1}],growth:800},
  {id:'Torchberry',name:'Torchberry',tier:2,liked:['FOREST','HILLS'],drops:[{item:'Torchberries',ch:10000,qty:1}],growth:150,note:'TF req'},
  {id:'Transformium',name:'Transformium',tier:12,liked:['END','COLD'],drops:[{item:'UUA Berry',ch:9000,qty:1},{item:'UUM Berry',ch:1000,qty:1}],machine:true,note:'Crop Synthesizer only. Extreme late-game. No pool membership.'},
  {id:'Trollplant',name:'Trollplant',tier:6,liked:['SWAMP','SPOOKY'],drops:[{item:'Spinel Gem',ch:6250,qty:1},{item:'Plutonium241 Dust',ch:1250,qty:1},{item:'IC2 Plantball',ch:1250,qty:1},{item:'IC2 Scrap',ch:1250,qty:1}],growth:4800,machine:true,note:'Crop Synthesizer only. Extreme late-game. No pool membership.'},
  {id:'TuffLily',name:'Tuff Lily',tier:1,liked:['MOUNTAIN','HILLS'],drops:[{item:'NewHorizonsCoreMod TuffDust',ch:10000,qty:9}],blockUnder:'tuff',note:'EtFuturum req'},
  {id:'Turnip',name:'Turnip',tier:2,liked:['PLAINS','WET','COLD'],drops:[{item:'Turnip',ch:10000,qty:1}],growth:450,note:'BoP req'},
  {id:'Vine',name:'Vine',tier:2,liked:['LUSH','JUNGLE','WET'],drops:[{item:'Vine',ch:10000,qty:2}],growth:450},
  {id:'VoidOreBerry',name:'Void Ore Berry',tier:7,liked:['MAGICAL','WASTELAND'],drops:[{item:'Void Nugget',ch:10000,qty:1}],growth:4500,note:'TC req'},
  {id:'WaterArtichoke',name:'Water Artichoke',tier:4,liked:['RIVER','WET','OCEAN'],drops:[{item:'Water Artichoke',ch:10000,qty:1}],growth:1100,note:'Witchery req'},
  {id:'Waterlily',name:'Waterlily',tier:2,liked:['WET','SWAMP','RIVER'],drops:[{item:'Pink Dye',ch:20000,qty:2},{item:'Lily Pad',ch:80000,qty:2}],growth:450},
  {id:'Wheat',name:'Wheat',tier:1,liked:['PLAINS','LUSH'],drops:[{item:'Wheat',ch:10000,qty:1}],growth:1000},
  {id:'WhiteTulip',name:'White Tulip',tier:2,liked:['PLAINS','COLD'],drops:[{item:'Light Gray Dye',ch:10000,qty:1}],growth:600},
  {id:'WildCarrot',name:'Wild Carrot',tier:2,liked:['PLAINS','HOT','SANDY'],drops:[{item:'BoP food',ch:10000,qty:1}],growth:450,note:'BoP req'},
  {id:'Withereed',name:'Withereed',tier:8,liked:['DEAD','SPOOKY'],drops:[{item:'Coal Dust',ch:6667,qty:1},{item:'Coal',ch:3333,qty:1},{item:'Nether Star',ch:129,qty:1}],blockUnder:'coal'},
  {id:'Wolfsbane',name:'Wolfsbane',tier:4,liked:['MAGICAL','FOREST','SPOOKY'],drops:[{item:'Wolfs Bane',ch:10000,qty:1}],growth:1100,note:'Witchery req'},
  {id:'Zomplant',name:'Zomplant',tier:3,liked:['DEAD','WASTELAND'],drops:[{item:'Rotten Flesh',ch:9800,qty:1},{item:'Thaumcraft ItemZombieBrain',ch:150,qty:1},{item:'Nether Star',ch:50,qty:1}]}
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
    // Jar: nextInt(10000) >= ch → skip; ch>=10000 is guaranteed (TileEntityCropSticks.harvest)
    const chanceDecimal=Math.min(1, d.ch/10000);
    // Jar: gain bonus +1 item when nextInt(100) <= gain → avg (gain+1)/100
    const avgPerRound=chanceDecimal*(d.qty+((gain+1)/100));
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
