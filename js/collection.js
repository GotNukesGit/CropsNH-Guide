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
    if (!pars.length || !pars.every(p => ownedSet.has(p))) return;
    consider({ out: targetId, name: crop.name, soil: crop.soil, blockUnder: crop.blockUnder, parents: pars, kind: m.machine ? 'mach' : 'det', p: m.machine ? 1 : (1 / BCHANCE) * 0.5 });
  });
  const ownedArr = [...ownedSet];
  for (let i = 0; i < ownedArr.length; i++) {
    for (let j = i; j < ownedArr.length; j++) {
      const a = ownedArr[i], b = ownedArr[j];
      if (a === targetId || b === targetId) continue;
      const mp = matchingPools([a, b]);
      const p = poolProb(targetId, mp);
      if (p <= 0) continue;
      consider({ out: targetId, name: crop.name, soil: crop.soil, blockUnder: crop.blockUnder, parents: a === b ? [a, a] : [a, b], kind: 'pool', p });
    }
  }
  return best;
}
function computeNext() {
  const rows = [];
  uniqueCrops().filter(c => !owned.has(c.id)).forEach(c => { const r = bestForTarget(c.id, owned); if (r) rows.push(r); });
  rows.sort((a, b) => {
    const rank = k => k === 'det' ? 0 : k === 'mach' ? 1 : 2;
    if (rank(a.kind) !== rank(b.kind)) return rank(a.kind) - rank(b.kind);
    return b.p - a.p;
  });
  return rows;
}
function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function drawGlowChart(top) {
  const parents = [], seen = {};
  top.forEach(r => (r.parents || []).forEach(id => { if (!seen[id]) { seen[id] = 1; parents.push(id); } }));
  const W = 900, leftX = 130, rightX = 700;
  const H = Math.max(520, Math.max(parents.length, top.length) * 62 + 90);
  function py(i, n) { return n <= 1 ? H / 2 : 50 + i * ((H - 90) / Math.max(1, n - 1)); }
  const pPos = {};
  parents.forEach((id, i) => { pPos[id] = { x: leftX, y: py(i, parents.length) }; });
  let edges = '', pNodes = '', tNodes = '';
  top.forEach((r, ti) => {
    const ty = py(ti, top.length);
    const col = r.kind === 'det' ? '#4ade80' : r.kind === 'mach' ? '#c4b5fd' : '#fbbf24';
    (r.parents || []).forEach(id => {
      const p = pPos[id]; if (!p) return;
      const mid = (p.x + rightX) / 2;
      edges += '<path d="M' + p.x + ',' + p.y + ' C' + mid + ',' + p.y + ' ' + mid + ',' + ty + ' ' + rightX + ',' + ty + '" fill="none" stroke="' + col + '" stroke-width="2" opacity=".6" filter="url(#glow)"/>';
    });
    const soil = soilName(r.soil);
    const time = r.kind === 'mach' ? 'machine' : fmtTime(r.p);
    tNodes += '<g style="cursor:pointer" onclick="claimSeed(\'' + r.out + '\')"><circle cx="' + rightX + '" cy="' + ty + '" r="22" fill="#2a1a06" stroke="' + col + '" stroke-width="2.5" filter="url(#glowA)"/><text x="' + rightX + '" y="' + (ty + 4) + '" text-anchor="middle" fill="#fff7d6" font-size="11" font-weight="700">' + (ti + 1) + '</text><text x="' + (rightX + 34) + '" y="' + (ty - 6) + '" fill="#fde68a" font-size="13" font-weight="700">' + esc(r.name) + '</text><text x="' + (rightX + 34) + '" y="' + (ty + 10) + '" fill="#7dd3c7" font-size="10">' + esc(soil) + ' · ' + time + ' · tap</text></g>';
  });
  parents.forEach(id => {
    const c = cropById(id), p = pPos[id];
    pNodes += '<g><circle cx="' + p.x + '" cy="' + p.y + '" r="18" fill="#0d2a1c" stroke="#4ade80" stroke-width="2" filter="url(#glowG)"/><text x="' + p.x + '" y="' + (p.y + 32) + '" text-anchor="middle" fill="#9aefc0" font-size="11">' + esc(c ? c.name : id) + '</text></g>';
  });
  return '<div class="stage"><svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + Math.min(H, 720) + '"><defs><filter id="glow"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="glowG"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="glowA"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><text x="130" y="22" text-anchor="middle" fill="#5a8a70" font-size="10" letter-spacing="2">OWNED</text><text x="700" y="22" text-anchor="middle" fill="#a78b3a" font-size="10" letter-spacing="2">NEXT 10</text>' + edges + pNodes + tNodes + '</svg></div><div class="legend"><span style="color:#4ade80">Direct</span><span style="color:#fbbf24">Pool</span><span style="color:#c4b5fd">Machine</span><span>Tap a numbered orb to mark owned</span></div>';
}
function renderResults() {
  const el = document.getElementById('results');
  const now = computeNext().filter(r => soilAvailable(r.soil) && (r.kind === 'det' || r.kind === 'mach' || (r.kind === 'pool' && r.p > 0)));
  if (!owned.size) { el.innerHTML = '<div class="hint">Tick at least one owned crop.</div>'; return; }
  if (!now.length) { el.innerHTML = '<div class="hint">Nothing new is reachable. Tick another soil or parent.</div>'; return; }
  el.innerHTML = drawGlowChart(now.slice(0, 10));
}
function renderOwnedList() {
  const q = (document.getElementById('ownedSearch').value || '').toLowerCase();
  const el = document.getElementById('ownedList');
  const items = uniqueCrops().filter(c => !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
    .sort((a, b) => (owned.has(b.id) - owned.has(a.id)) || a.tier - b.tier || a.name.localeCompare(b.name));
  document.getElementById('ownedCount').textContent = '(' + owned.size + ')';
  el.innerHTML = items.map(c => {
    const on = owned.has(c.id);
    return '<label class="ci' + (on ? ' on' : '') + '"><input type="checkbox" ' + (on ? 'checked' : '') + ' onchange="toggleOwned(\'' + c.id + '\', this.checked)"><span style="flex:1">' + c.name + '</span></label>';
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
}
function markPlantables() {
  PLANTABLES.forEach(id => { if (cropById(id)) owned.add(id); });
  saveOwned(owned); renderOwnedList(); renderResults();
}
function clearOwned() {
  owned = new Set(DEFAULT_OWNED); saveOwned(owned); renderOwnedList(); renderResults();
}
renderSoils(); renderOwnedList(); renderResults();
