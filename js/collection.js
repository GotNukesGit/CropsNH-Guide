const LS_KEY = 'cropsnh-owned-seeds-v1';
const BCHANCE = 3;
const TICK_S = 12.8;
const DEFAULT_OWNED = ['BoPBerry'];
const PLANTABLES = [
  'Wheat','Carrot','Potato','Dandelion','Poppy','Pumpkin','Melon','Cocoa','SugarCane','Vine',
  'Waterlily','Cactus','Netherwart','BrownMushroom','RedMushroom','BlueOrchid','AzureBluet',
  'RedTulip','OrangeTulip','PinkTulip','WhiteTulip','Allium','OxeyeDaisy',
  'BonsaiOak','BonsaiBirch','BonsaiSpruce','BonsaiDarkOak','BonsaiAcacia','BonsaiJungle','BonsaiRubber',
  'StoneLily','Blightberry','Duskberry','Skyberry','Stingberry','Thornvine','Shimmerleaf',
  'PrimordialBerry','Trollplant','GaiaWart','ThaumiumOreBerry','BlueGlowshroom','Eyebulb','Glowflower'
];

function uniqueCrops() {
  const seen = new Set();
  return CROPS.filter(c => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  }).sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
}

function loadOwned() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {}
  return new Set(DEFAULT_OWNED);
}
function saveOwned(set) {
  localStorage.setItem(LS_KEY, JSON.stringify([...set]));
}

let owned = loadOwned();

function cropById(id) { return CROPS.find(c => c.id === id); }
function soilName(id) {
  const s = (typeof SOILS !== 'undefined' ? SOILS : []).find(x => x.id === id);
  return s ? s.name : id;
}

function fmtTime(p) {
  if (!p || p <= 0) return '\u2014';
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

function recipesFor(out) {
  return MUTS.filter(m => m.out === out);
}

function bestForTarget(targetId, ownedSet) {
  const crop = cropById(targetId);
  if (!crop) return null;
  const recs = recipesFor(targetId);
  let best = null;

  function consider(row) {
    if (!best || row.p > best.p) best = row;
  }

  recs.forEach(m => {
    const pars = (m.par || []).filter(p => p !== targetId);
    if (!pars.length) return;
    if (!pars.every(p => ownedSet.has(p))) return;
    const p = (1 / BCHANCE) * 0.5;
    consider({
      out: targetId,
      name: crop.name,
      soil: crop.soil,
      blockUnder: crop.blockUnder,
      parents: pars,
      kind: m.machine ? 'mach' : 'det',
      machine: !!m.machine,
      p: m.machine ? 1 : p,
      note: m.machine ? 'Crop Synthesizer / machine recipe' : 'Deterministic field recipe'
    });
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
      consider({
        out: targetId,
        name: crop.name,
        soil: crop.soil,
        blockUnder: crop.blockUnder,
        parents: a === b ? [a, a] : [a, b],
        kind: 'pool',
        machine: false,
        p,
        note: 'Pool ' + poolsHit.join(', ')
      });
    }
  }

  if (!best && !recs.length && !((crop.pools || []).length)) {
    return {
      out: targetId,
      name: crop.name,
      soil: crop.soil,
      blockUnder: crop.blockUnder,
      parents: [],
      kind: 'none',
      machine: !!crop.machine,
      p: 0,
      note: crop.note || 'No field recipe \u2014 plant or machine'
    };
  }
  return best;
}

function computeNext() {
  const missing = uniqueCrops().filter(c => !owned.has(c.id));
  const rows = [];
  missing.forEach(c => {
    const r = bestForTarget(c.id, owned);
    if (r) rows.push(r);
  });
  rows.sort((a, b) => {
    const rank = k => k === 'det' ? 0 : k === 'mach' ? 1 : k === 'pool' ? 2 : 3;
    if (rank(a.kind) !== rank(b.kind)) return rank(a.kind) - rank(b.kind);
    return b.p - a.p;
  });
  return rows;
}

function parentNames(ids) {
  return ids.map(id => {
    const c = cropById(id);
    return c ? c.name : id;
  }).join(' + ');
}

function renderResults() {
  const el = document.getElementById('results');
  const rows = computeNext();
  const now = rows.filter(r => r.kind === 'det' || r.kind === 'mach' || (r.kind === 'pool' && r.p > 0));
  if (!owned.size) {
    el.innerHTML = '<div class="hint">Tick at least one owned crop.</div>';
    return;
  }
  if (!now.length) {
    el.innerHTML = '<div class="hint">Nothing new is reachable from the current set. Add a world-plantable or a missing parent.</div>';
    return;
  }
  const head = '<div class="row head"><div>New seed</div><div>Use these parents</div><div>Type</div><div>Time</div><div>Soil</div></div>';
  const body = now.map(r => {
    const kindLbl = r.kind === 'det' ? 'Direct' : r.kind === 'mach' ? 'Machine' : r.kind === 'pool' ? 'Pool' : 'Other';
    const kindCls = 'kind-' + r.kind;
    const time = r.kind === 'mach' ? 'machine' : fmtTime(r.p);
    const soil = soilName(r.soil) + (r.blockUnder ? ' \u00b7 y\u22122 ' + r.blockUnder : '');
    const c = cropById(r.out);
    return '<div class="row"><div class="nm">' + r.name + (c ? ' <span class="ct t' + Math.min(14, c.tier) + '">T' + c.tier + '</span>' : '') + '</div><div class="parents">' + parentNames(r.parents) + '<div style="font-size:10px;color:var(--tx3)">' + (r.note || '') + '</div></div><div class="' + kindCls + '">' + kindLbl + '</div><div class="time">' + time + '</div><div class="soil">' + soil + '<button class="fbtn" style="margin-left:8px" onclick="claimSeed(\'' + r.out + '\')">+ Have</button></div></div>';
  }).join('');
  el.innerHTML = head + body;
}

function renderOwnedList() {
  const q = (document.getElementById('ownedSearch').value || '').toLowerCase();
  const el = document.getElementById('ownedList');
  const items = uniqueCrops().filter(c =>
    !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
  ).sort((a, b) => (owned.has(b.id) - owned.has(a.id)) || a.tier - b.tier || a.name.localeCompare(b.name));
  document.getElementById('ownedCount').textContent = '(' + owned.size + ')';
  el.innerHTML = items.map(c => {
    const on = owned.has(c.id);
    return '<label class="ci' + (on ? ' on' : '') + '"><input type="checkbox" ' + (on ? 'checked' : '') + ' onchange="toggleOwned(\'' + c.id + '\', this.checked)"><span style="flex:1">' + c.name + '</span><span class="ct t' + Math.min(14, c.tier) + '">T' + c.tier + '</span></label>';
  }).join('');
}

function toggleOwned(id, on) {
  if (on) owned.add(id); else owned.delete(id);
  saveOwned(owned);
  renderOwnedList();
  renderResults();
}
function claimSeed(id) {
  owned.add(id);
  saveOwned(owned);
  renderOwnedList();
  renderResults();
  const box = document.getElementById('ownedList');
  if (box) box.scrollTop = 0;
}
function markPlantables() {
  PLANTABLES.forEach(id => { if (cropById(id)) owned.add(id); });
  saveOwned(owned);
  renderOwnedList();
  renderResults();
}
function clearOwned() {
  owned = new Set(DEFAULT_OWNED);
  saveOwned(owned);
  renderOwnedList();
  renderResults();
}

renderOwnedList();
renderResults();
