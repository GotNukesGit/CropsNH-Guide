const LS_KEY = 'cropsnh-owned-seeds-v1';
const LS_SOIL = 'cropsnh-owned-soils-v1';
const BCHANCE = 3;
const TICK_S = 12.8;
const DEFAULT_OWNED = ['BoPBerry'];
const DEFAULT_SOILS = ['farmland', 'dirtGrass'];
const SOIL_SATISFIED_BY = {
  farmland: ['farmland'], dirtGrass: ['dirtGrass'], stone: ['stone'], sand: ['sand'],
  soulsand: ['soulsand'], netherrack: ['netherrack'], graveyard: ['graveyard'], slimy: ['slimy'],
  slimyDirt: ['slimyDirt', 'dirtGrass', 'slimy'], end: ['end'], mycelium: ['mycelium'],
  thaumLogs: ['thaumLogs'], brick: ['brick'], gravel: ['gravel'], oilSands: ['oilSands'],
  oil: ['oil', 'sand', 'gravel', 'soulsand', 'oilSands'],
  mushroom: ['mushroom', 'dirtGrass', 'stone', 'mycelium'],
  netherMushroom: ['netherMushroom', 'dirtGrass', 'stone', 'mycelium', 'netherrack'],
  sugarcane: ['sugarcane', 'sand', 'dirtGrass']
};
const PLANTABLES = ['Wheat','Carrot','Potato','Dandelion','Poppy','Pumpkin','Melon','Cocoa','SugarCane','Vine','Waterlily','Cactus','Netherwart','BrownMushroom','RedMushroom','BlueOrchid','AzureBluet','RedTulip','OrangeTulip','PinkTulip','WhiteTulip','Allium','OxeyeDaisy','BonsaiOak','BonsaiBirch','BonsaiSpruce','BonsaiDarkOak','BonsaiAcacia','BonsaiJungle','BonsaiRubber','StoneLily','Blightberry','Duskberry','Skyberry','Stingberry','Thornvine','Shimmerleaf','PrimordialBerry','Trollplant','GaiaWart','ThaumiumOreBerry','BlueGlowshroom','Eyebulb','Glowflower'];
function uniqueCrops() {
  const seen = new Set();
  return CROPS.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; })
    .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
}
function loadOwned() {
  try { const raw = localStorage.getItem(LS_KEY); if (raw) return new Set(JSON.parse(raw)); } catch (e) {}
  return new Set(DEFAULT_OWNED);
}
function saveOwned(set) { localStorage.setItem(LS_KEY, JSON.stringify([...set])); }
let owned = loadOwned();
function loadSoils() {
  try { const raw = localStorage.getItem(LS_SOIL); if (raw) return new Set(JSON.parse(raw)); } catch (e) {}
  return new Set(DEFAULT_SOILS);
}
function saveSoils() { localStorage.setItem(LS_SOIL, JSON.stringify([...ownedSoils])); }
let ownedSoils = loadSoils();
function soilAvailable(cropSoil) {
  if (!cropSoil) return true;
  if (!ownedSoils.size) return false;
  const need = SOIL_SATISFIED_BY[cropSoil] || [cropSoil];
  return need.some(id => ownedSoils.has(id));
}
function cropById(id) { return CROPS.find(c => c.id === id); }
function soilName(id) {
  const s = (typeof SOILS !== 'undefined' ? SOILS : []).find(x => x.id === id);
  return s ? s.name : id;
}
function fmtTime(p) {
  if (!p || p <= 0) return '-';
  const exp = (1 / p) * TICK_S;
  if (exp < 120) return Math.round(exp) + 's avg';
  if (exp < 3600) return (exp / 60).toFixed(1) + ' min avg';
  return (exp / 3600).toFixed(1) + 'h avg';
}
function matchingPools(parentIds) {
  const out = [];
  if (typeof POOL_MAP === 'undefined') return out;
  for (const [pool, members] of Object.entries(POOL_MAP)) {
    let n = 0;
    for (const id of parentIds) if (members.indexOf(id) >= 0) n++;
    if (n >= 2) out.push({ pool, members });
  }
  return out;
}
function poolProb(target, pools) {
  if (!pools.length) return 0;
  let p = 0;
  for (const { members } of pools) {
    if (members.indexOf(target) >= 0) p += (1 / pools.length) * (1 / members.length);
  }
  return (1 / BCHANCE) * 0.5 * p;
}
function recipesFor(out) { return MUTS.filter(m => m.out === out); }
function bestForTarget(targetId, ownedSet) {
  const crop = cropById(targetId);
  if (!crop) return null;
  const recs = recipesFor(targetId);
  let best = null;
  function consider(row) { if (!best || row.p > best.p) best = row; }
  recs.forEach(m => {
    const pars = (m.par || []).filter(p => p !== targetId);
    if (!pars.length) return;
    if (!pars.every(p => ownedSet.has(p))) return;
    consider({ out: targetId, name: crop.name, soil: crop.soil, blockUnder: crop.blockUnder, parents: pars, kind: m.machine ? 'mach' : 'det', machine: !!m.machine, p: m.machine ? 1 : (1 / BCHANCE) * 0.5, note: m.machine ? 'Crop Synthesizer' : 'Deterministic' });
  });
  const ownedArr = [...ownedSet];
  for (let i = 0; i < ownedArr.length; i++) {
    for (let j = i; j < ownedArr.length; j++) {
      const a = ownedArr[i], b = ownedArr[j];
      if (a === targetId || b === targetId) continue;
      const mp = matchingPools([a, b]);
      const p = poolProb(targetId, mp);
      if (p <= 0) continue;
      const poolsHit = mp.filter(x => x.members.indexOf(targetId) >= 0).map(x => x.pool);
      consider({ out: targetId, name: crop.name, soil: crop.soil, blockUnder: crop.blockUnder, parents: a === b ? [a, a] : [a, b], kind: 'pool', machine: false, p, note: 'Pool ' + poolsHit.join(', ') });
    }
  }
  return best;
}
function computeNext() {
  const missing = uniqueCrops().filter(c => !owned.has(c.id));
  const rows = [];
  missing.forEach(c => { const r = bestForTarget(c.id, owned); if (r) rows.push(r); });
  rows.sort((a, b) => {
    const rank = k => k === 'det' ? 0 : k === 'mach' ? 1 : k === 'pool' ? 2 : 3;
    if (rank(a.kind) !== rank(b.kind)) return rank(a.kind) - rank(b.kind);
    return b.p - a.p;
  });
  return rows;
}
function renderResults() {
  const el = document.getElementById('results');
  const now = computeNext().filter(r => soilAvailable(r.soil) && (r.kind === 'det' || r.kind === 'mach' || (r.kind === 'pool' && r.p > 0)));
  if (!owned.size) { el.innerHTML = '<div class="hint">Tick at least one owned crop.</div>'; return; }
  if (!now.length) { el.innerHTML = '<div class="hint">Nothing new is reachable. Tick another soil or parent.</div>'; return; }
  const body = now.slice(0, 10).map((r, i) => {
    const kindLbl = r.kind === 'det' ? 'Direct' : r.kind === 'mach' ? 'Machine' : 'Pool';
    const time = r.kind === 'mach' ? 'machine' : fmtTime(r.p);
    const soil = soilName(r.soil) + (r.blockUnder ? ' / y-2 ' + r.blockUnder : '');
    const c = cropById(r.out);
    const parents = (r.parents || []).map(id => {
      const p = cropById(id);
      return '<div class="node have">' + (p ? p.name : id) + '</div>';
    }).join('<span class="arrow">+</span>');
    return '<div class="flow-step"><div class="flow-row"><span class="pill">' + (i + 1) + '</span>' + parents +
      '<span class="arrow">-></span><div class="node soil">' + soil + '</div><span class="arrow">-></span>' +
      '<div class="node next">' + r.name + (c ? ' T' + c.tier : '') + '</div></div>' +
      '<div class="flow-meta"><span class="kind-' + r.kind + '">' + kindLbl + '</span><span>' + time + '</span><span>' + (r.note || '') +
      '</span><button class="fbtn act" onclick="claimSeed(\'' + r.out + '\')">+ Have</button></div></div>';
  }).join('');
  el.innerHTML = '<div class="flow">' + body + '</div>';
}
function renderOwnedList() {
  const q = (document.getElementById('ownedSearch').value || '').toLowerCase();
  const el = document.getElementById('ownedList');
  const items = uniqueCrops().filter(c => !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
    .sort((a, b) => (owned.has(b.id) - owned.has(a.id)) || a.tier - b.tier || a.name.localeCompare(b.name));
  document.getElementById('ownedCount').textContent = '(' + owned.size + ')';
  el.innerHTML = items.map(c => {
    const on = owned.has(c.id);
    return '<label class="ci' + (on ? ' on' : '') + '"><input type="checkbox" ' + (on ? 'checked' : '') + ' onchange="toggleOwned(\'' + c.id + '\', this.checked)"><span style="flex:1">' + c.name + '</span><span class="ct t' + Math.min(14, c.tier) + '">T' + c.tier + '</span></label>';
  }).join('');
}
function toggleOwned(id, on) { if (on) owned.add(id); else owned.delete(id); saveOwned(owned); renderOwnedList(); renderResults(); }
function renderSoils() {
  const el = document.getElementById('soilPills');
  if (!el || typeof SOILS === 'undefined') return;
  el.innerHTML = SOILS.map(s => '<button class="fbtn' + (ownedSoils.has(s.id) ? ' act' : '') + '" onclick="toggleSoil(\'' + s.id + '\')">' + s.name + '</button>').join('');
}
function toggleSoil(id) {
  if (ownedSoils.has(id)) ownedSoils.delete(id); else ownedSoils.add(id);
  saveSoils(); renderSoils(); renderResults();
}
function claimSeed(id) {
  owned.add(id); saveOwned(owned); renderOwnedList(); renderResults();
  const box = document.getElementById('ownedList'); if (box) box.scrollTop = 0;
}
function markPlantables() {
  PLANTABLES.forEach(id => { if (cropById(id)) owned.add(id); });
  saveOwned(owned); renderOwnedList(); renderResults();
}
function clearOwned() {
  owned = new Set(DEFAULT_OWNED); saveOwned(owned); renderOwnedList(); renderResults();
}
renderSoils(); renderOwnedList(); renderResults();
