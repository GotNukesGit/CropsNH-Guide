// CropsNH 2.0.114 production-calculator corrections.
// Loaded after js/production.js. Formulas from TileEntityCropSticks / CropCard
// in cropsnh-2.0.114.jar (CFR 0.152, first-party only).
(function () {
  if (typeof CROPS === 'undefined') return;

  // CropCard.getDropChance() overrides (default is Math.pow(0.95, tier)).
  const DROP_CHANCE = {
    Glowheat: 1.5,
    Netherwart: 2.0,
    SaltyRoot: 4.0,
    GaiaWart: 0.8,
    PrimordialBerry: 0.5,
    RedStraw: 0.85
  };
  CROPS.forEach(function (c) {
    if (DROP_CHANCE[c.id] != null) c.dropChance = DROP_CHANCE[c.id];
  });

  // Drop item labels taken from the same ItemStack the crop registers.
  // Netherwart: addDrop(Items.field_151075_bm) + unlocalized item.netherStalkSeeds.name
  // Glowheat: glowstone sub-soil + dustGlowstone catalyst + Items.field_151114_aO (glowstone dust)
  var nw = CROPS.find(function (c) { return c.id === 'Netherwart'; });
  if (nw && nw.drops && nw.drops[0]) nw.drops[0].item = 'Nether Wart';
  var gh = CROPS.find(function (c) { return c.id === 'Glowheat'; });
  if (gh && gh.drops && gh.drops[0]) gh.drops[0].item = 'Glowstone Dust';

  // Source: likedBiomeTagsCount = Math.min(2, count)
  calcNutrients = function (likedCount) {
    likedCount = Math.min(2, likedCount);
    const humBonus = selectedBiome ? calcHumidityBonus(selectedBiome) : 0;
    const likedBonus = likedCount * LBB;
    let n = BN;
    n += waterFull ? 10 : 3;
    n += fertFull ? 10 : 0;
    n += hasSky ? SKY : 0;
    n += Math.max(humBonus, likedBonus);
    return n;
  };

  // Source: TileEntityCropSticks.getGrowthRate — all integer arithmetic.
  calcGrowthRate = function (np, tier, growth) {
    var nutrientPoints = np * NPS;
    var need = tier * NPT;
    if (need < 0) return 0;
    var baseSpeed = BC + growth;
    if (nutrientPoints >= need) {
      return Math.floor(baseSpeed * (100 + (nutrientPoints - need)) / 100);
    }
    return Math.max(Math.floor(baseSpeed * (100 - (need - nutrientPoints) * 4) / 100), 0);
  };

  // Source: getAvgDropRounds = getDropChance() * 1.03^gain
  calcAvgDropRounds = function (tier, gain) {
    var crop = typeof selectedCrop === 'string' ? CROPS.find(function (c) { return c.id === selectedCrop; }) : null;
    var dc = (crop && crop.dropChance != null) ? crop.dropChance : Math.pow(0.95, tier);
    return dc * Math.pow(1.03, gain);
  };

  var _render = render;
  render = function () {
    _render();
    if (!selectedBiome || !selectedCrop) return;
    var crop = CROPS.find(function (c) { return c.id === selectedCrop; });
    if (!crop) return;
    var biomeTags = BIOMES[selectedBiome] || [];
    var rawMatches = crop.liked.filter(function (t) { return biomeTags.indexOf(t) >= 0; }).length;
    var capped = Math.min(2, rawMatches);
    if (rawMatches > 2) {
      var note = document.createElement('div');
      note.style.cssText = 'margin-top:8px;font-size:11px;color:var(--amb)';
      note.textContent = 'Liked-tag bonus is capped at 2 matches (+28). This biome matches ' + rawMatches + ' tags; extras do not add nutrients.';
      var block = document.querySelector('.result-block');
      if (block) block.appendChild(note);
    }
    if (crop.dropChance != null) {
      var spans = document.querySelectorAll('.result-block span');
      for (var i = 0; i < spans.length; i++) {
        if (spans[i].textContent.indexOf('Base drop chance') >= 0) {
          var strong = spans[i].querySelector('strong');
          if (strong) strong.textContent = (crop.dropChance * 100).toFixed(2) + '%';
          spans[i].innerHTML = spans[i].innerHTML.replace(/\(0\.95\^T\d+\)/, '(getDropChance override ' + crop.dropChance + ')');
        }
      }
    }
  };
})();
