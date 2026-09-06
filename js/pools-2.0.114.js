// CropsNH 2.0.114 pool overrides — from MutationLoader.java (first-party CFR only).
// Loaded after js/data.js. Rebuilds POOL_MAP and CROP_POOLS from CROPS[].
(function () {
  if (typeof CROPS === 'undefined') return;
  const pools = {
    Plumbilia: ['DENSE', 'LEAD', 'METALLIC', 'PURPLE', 'TENDRILLY'],
    Sapphirum: ['BLUE', 'CRYSTALLINE', 'SHINY'],
    Corium: ['BROWN', 'COW', 'MUSHROOM'],
    EggPlant: ['ADDICTIVE', 'CHICKEN', 'EDIBLE', 'MUSHROOM', 'WHITE'],
    Enderbloom: ['ALIEN', 'BLACK', 'FLOWER', 'MAGICAL', 'VOID'],
    Slimeplant: ['EVIL', 'GREEN', 'LEAFY', 'POTION_INGREDIENT', 'STICKY', 'TREE'],
    Tine: ['GRAY', 'METALLIC', 'SHINY', 'STEM', 'TIN', 'WOODEN'],
    Withereed: ['BLACK', 'COAL', 'FIERY', 'REED', 'SULFUR', 'UNDEAD'],
    Corpseplant: ['ADDICTIVE', 'BROWN', 'BUSH', 'EDIBLE', 'EVIL', 'POISONOUS', 'UNDEAD'],
    Blazereed: ['BLAZE', 'EVIL', 'FIERY', 'NETHER', 'ORANGE', 'POTION_INGREDIENT', 'REED', 'SULFUR'],
    Creeperweed: ['COAL', 'EVIL', 'FIERY', 'GREEN', 'POTION_INGREDIENT', 'SALTPETER', 'SULFUR', 'TENDRILLY'],
    Glowheat: ['CRYSTALLINE', 'EMISSIVE', 'NETHER', 'POTION_INGREDIENT', 'SHINY', 'WHEAT', 'YELLOW'],
    Goldfish: ['ADDICTIVE', 'DANGEROUS', 'EDIBLE', 'FISH', 'NETHER', 'ORANGE', 'STEM', 'WATERY'],
    Meatrose: ['CHICKEN', 'COW', 'EDIBLE', 'FISH', 'FLOWER', 'RED'],
    MilkWart: ['COW', 'EDIBLE', 'HEALING', 'WHITE'],
    Nickelback: ['FIERY', 'GRAY', 'METALLIC'],
    Pyrolusium: ['BUSH', 'METALLIC', 'RED']
  };
  CROPS.forEach(function (c) {
    if (pools[c.id]) c.pools = pools[c.id].slice();
  });
  const map = {};
  const byCrop = {};
  CROPS.forEach(function (c) {
    const list = (c.pools || []).slice().sort();
    byCrop[c.id] = list;
    list.forEach(function (p) {
      if (!map[p]) map[p] = [];
      map[p].push(c.id);
    });
  });
  Object.keys(map).forEach(function (p) { map[p].sort(); });
  POOL_MAP = map;
  CROP_POOLS = byCrop;
})();
