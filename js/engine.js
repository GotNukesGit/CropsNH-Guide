
function formatPool(p){return p.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}
// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const BC=6,BN=5,MWBA=100,MFBA=100,SKY=2,LBB=14,HHB=14,NPS=5,NPT=10,BCHANCE=3,BLOW=-2,BHIGH=4;
const TICK_RATE=256; // game ticks per crop tick (from source)
const GAME_TPS=20;   // Minecraft ticks/second
const CROP_TICK_SECONDS=TICK_RATE/GAME_TPS; // 12.8 seconds per crop tick
const CROP_TICKS_PER_MINUTE=60/CROP_TICK_SECONDS; // ~4.6875

// Format a per-tick probability as human time
function fmtTime(pPerTick){
  if(pPerTick<=0) return {str:'never',cls:'none'};
  const expectedTicks=1/pPerTick;
  const expectedSeconds=expectedTicks*CROP_TICK_SECONDS;
  const medianTicks=Math.log(0.5)/Math.log(1-pPerTick);
  const medianSeconds=medianTicks*CROP_TICK_SECONDS;
  const pPerMin=1-Math.pow(1-pPerTick,CROP_TICKS_PER_MINUTE);
  let timeStr;
  if(expectedSeconds<120) timeStr=expectedSeconds.toFixed(0)+'s avg';
  else if(expectedSeconds<3600) timeStr=(expectedSeconds/60).toFixed(1)+' min avg';
  else timeStr=(expectedSeconds/3600).toFixed(1)+'h avg';
  let medStr;
  if(medianSeconds<120) medStr=medianSeconds.toFixed(0)+'s';
  else if(medianSeconds<3600) medStr=(medianSeconds/60).toFixed(1)+' min';
  else medStr=(medianSeconds/3600).toFixed(1)+'h';
  const pct=(pPerTick*100);
  const cls=expectedSeconds<300?'high':expectedSeconds<1800?'mid':'low';
  return {str:timeStr, median:medStr, pPerMin:(pPerMin*100).toFixed(2)+'%/min', pct:pct.toFixed(3)+'%/tick', cls};
}
const ENV={sky:true,humid:false,biome1:false,biome2:false,fert:false,water:false};
let mode='parents', selectedParents=[], targetCrop=null, filterMd='match', soilSel='farmland', hideSoilBlocked=false, selectedBiome=null;

// ─── SOIL DEFINITIONS (from SoilLoader.java + CropsNHSoilTypes.java) ─────────
// ─── MUTATIONS (from MutationLoader.java) ────────────────────────────────────
// ─── LOOKUP HELPERS ──────────────────────────────────────────────────────────
const cropById = id => CROPS.find(c=>c.id===id);

// Check if a crop's soil requirement matches the selected soil
// Returns true if crop can land on the selected soil
function soilMatches(cropId) {
  const c = cropById(cropId);
  if (!c) return true; // unknown = assume ok
  return c.soil === soilSel;
}

// Given a list of all result crops (pool members or det results),
// what fraction will be soil-rejected? Used to adjust effective probability.
// P(any valid result) = sum of probabilities of soil-valid results
// Wasted ticks = ticks where result is soil-invalid
function soilRejectionFactor(cropIds) {
  // returns fraction of results that ARE valid (0.0 to 1.0)
  if (!cropIds || !cropIds.length) return 1;
  const valid = cropIds.filter(id => soilMatches(id)).length;
  return valid / cropIds.length;
}
const soilById = id => SOILS.find(s=>s.id===id);
const mutsByOutput = id => MUTS.filter(m=>m.out===id);

// ─── POOL DATA (from MutationLoader.java - source verified) ──────────────────
// POOL_MAP: pool name → array of crops that are MEMBERS (outputs registered to this pool)
// A crop appears in a pool by calling addToMutationPools() - machine-only crops are EXCLUDED
// Pool mutations are the fallback when no deterministic recipe matches.
// Game picks: random matching pool → random member of that pool. No weighting, uniform random.
// BUT: a crop in more pools gets more "lottery tickets" when multiple pools match.
// Compute matching pools for a parent list
// Returns array of {pool, members[]} for pools where >=2 parents are members
// Note: createPoolQueue does NOT deduplicate, so Wheat+Wheat counts as 2 members in EDIBLE
function getMatchingPools(parentIds) {
  const matching = [];
  for (const [pool, members] of Object.entries(POOL_MAP)) {
    let matchCount = 0;
    for (const pid of parentIds) {
      if (members.includes(pid)) matchCount++;
    }
    if (matchCount >= 2) matching.push({pool, members});
  }
  return matching;
}

// Compute probability breakdown for a given output crop given matching pools
// Returns null if crop not reachable via pool
// Probability = (1/numMatchingPools) * (1/poolSize) for each pool the crop appears in
// summed across all matching pools that contain it
function poolProbForCrop(cropId, matchingPools) {
  if (!matchingPools.length) return 0;
  let prob = 0;
  for (const {pool, members} of matchingPools) {
    if (members.includes(cropId)) {
      prob += (1 / matchingPools.length) * (1 / members.length);
    }
  }
  return prob;
}

// Crops that have no mutation recipe = can be obtained without breeding
// Also includes mod-gated crops that can be planted from seeds found in world
const NO_RECIPE = new Set(CROPS.filter(c=>!MUTS.some(m=>m.out===c.id)).map(c=>c.id));
// Crops with mutation recipes that are ALSO directly obtainable (vanilla seeds, world-gen, mod exploration)
// Pathfinder treats these as valid base inputs even though they have a breeding recipe
const ALSO_PLANTABLE = new Set([
  'Pumpkin','Melon','Cocoa','SugarCane','Vine','Waterlily','Cactus','Netherwart',
  'BrownMushroom','RedMushroom','BlueOrchid','AzureBluet','RedTulip','OrangeTulip',
  'PinkTulip','WhiteTulip','Allium','OxeyeDaisy',
  'BonsaiOak','BonsaiBirch','BonsaiSpruce','BonsaiDarkOak','BonsaiAcacia','BonsaiJungle','BonsaiRubber',
  'StoneLily','Blightberry','Duskberry','Skyberry','Stingberry','Thornvine','Shimmerleaf'
]);
const STARTERS = new Set([...NO_RECIPE, ...ALSO_PLANTABLE]);

// ─── NUTRIENT / GROWTH CALC ─────────────────────────────────────────────────
function calcNutrients(){
  let n=BN;
  n+=Math.floor((Math.min(MWBA,ENV.water?100:30)+9)/10);
  n+=Math.floor((Math.min(MFBA,ENV.fert?100:0)+9)/10);
  if(ENV.sky) n+=SKY;
  const lc=ENV.biome2?2:ENV.biome1?1:0;
  const hb=ENV.humid?HHB:0;
  n+=Math.max(hb,lc*LBB);
  return n;
}
function calcGR(np,tier,gr){
  const s=np*NPS, nd=tier*NPT, base=BC+gr;
  if(s>=nd) return Math.floor(base*(100+(s-nd))/100);
  return Math.max(Math.floor(base*(100-(nd-s)*4)/100),0);
}

// ─── BFS PATHFINDER ──────────────────────────────────────────────────────────
function findPaths(targetId, maxDepth=8){
  const target = cropById(targetId);
  if(!target) return [];
  const muts = mutsByOutput(targetId);
  if(!muts.length) return [[{crop:targetId,how:'starter'}]];

  const paths=[];
  for(const mut of muts){
    const visited = new Set([targetId]);
    const subPaths = solveParents(mut, visited, maxDepth);
    if(subPaths){
      for(const sp of subPaths){
        const full = [...sp, {crop:targetId, how:'breed', parents:mut.par, mut}];
        paths.push(full);
      }
    }
  }
  // deduplicate and sort by length
  paths.sort((a,b)=>a.length-b.length);
  // Remove exact duplicates
  const seen=new Set();
  return paths.filter(p=>{
    const key=p.map(s=>s.crop).join('>');
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0,6);
}

function solveParents(mut, visited, depth){
  if(depth<=0) return null;
  const needed = mut.par;
  const results = [[]];
  for(const parentId of needed){
    // If this parent is a starter (no recipe), it's free - skip
    if(isStarter(parentId)) continue;
    // Self-referential: output crop appears as its own parent (2.0.91 pattern)
    // Treat as a starter — you already have it
    if(parentId === mut.out) continue;
    // Cycle detection
    if(visited.has(parentId)) return null;
    const newVisited = new Set(visited);
    newVisited.add(parentId);
    const parentMuts = mutsByOutput(parentId);
    // No mutation recipe but not in starter set = mod-gated/plantable, treat as starter
    if(!parentMuts.length) continue;
    const parentPaths = [];
    for(const pm of parentMuts){
      const subs = solveParents(pm, newVisited, depth-1);
      if(subs){
        for(const s of subs){
          parentPaths.push([...s, {crop:parentId, how:'breed', parents:pm.par, mut:pm}]);
        }
      }
    }
    if(!parentPaths.length) return null; // genuinely stuck
    parentPaths.sort((a,b)=>a.length-b.length);
    const best = parentPaths[0];
    const merged=[];
    for(const r of results){ merged.push([...r,...best]); }
    results.length=0; results.push(...merged);
  }
  return results.length?results:null;
}

function isStarter(id){
  if(STARTERS.has(id)) return true;
  // crops with no mutation recipe = direct plants
  return !MUTS.some(m=>m.out===id);
}

function getPathSoils(steps){
  const soils=new Set();
  for(const s of steps){
    if(s.how==='breed'){
      const c=cropById(s.crop);
      if(c) soils.add(c.soil);
      if(s.mut && s.mut.soilNeeded) soils.add(s.mut.soilNeeded);
    }
  }
  return [...soils];
}

// ─── RENDER PATH ─────────────────────────────────────────────────────────────
function renderPath(steps, idx){
  const isBest=idx===0;
  const uniqueSteps=[];
  const seen=new Set();
  for(const s of steps){
    if(!seen.has(s.crop)){seen.add(s.crop);uniqueSteps.push(s);}
  }
  const chainHtml=uniqueSteps.map((s,i)=>{
    const c=cropById(s.crop);
    const cls=s.crop===steps[steps.length-1].crop?'target':(isStarter(s.crop)?'starter':'');
    const tier=c?`T${c.tier}`:'';
    return `${i>0?'<span class="ps-arr">→</span>':''}<span class="ps-crop ${cls}" title="${c?c.name:s.crop}">${c?c.name:s.crop} ${tier?`<small style="opacity:.6">${tier}</small>`:''}</span>`;
  }).join('');

  const soils=[...new Set(uniqueSteps.map(s=>{const c=cropById(s.crop);return c?c.soil:'farmland';}))];
  const soilHtml=soils.map(s=>{const sd=soilById(s);return `<span class="soil-needed">${sd?sd.name:s}</span>`;}).join(' ');
  const breedSteps=steps.filter(s=>s.how==='breed');
  const hasMachineOnly=breedSteps.some(s=>s.mut&&s.mut.machine);
  const depth=breedSteps.length;

  // Sub-steps detail
  const subSteps=breedSteps.map(s=>{
    const c=cropById(s.crop);
    const pNames=s.parents.filter(p=>p!==s.crop).map(p=>{const pc=cropById(p);return pc?pc.name:p;}).join(' + ');
    return `<span style="color:var(--tx2)">${c?c.name:s.crop}</span> ← ${pNames}${s.mut&&s.mut.req?` <span style="color:var(--amb)">[${s.mut.req}]</span>`:''}${s.mut&&s.mut.machine?` <span style="color:var(--pur)">[Machine only]</span>`:''}`;
  }).join('<br>');

  return `<div class="path-card${isBest?' best':''}">
    <div class="path-steps">${chainHtml}</div>
    <div class="path-meta">
      <span class="pmeta-item${depth<=3?' good':''}">⛏ ${depth} breed step${depth===1?'':'s'}</span>
      ${hasMachineOnly?'<span class="pmeta-item warn">🔩 Machine required</span>':''}
      <span style="font-size:10px;color:var(--tx3)">Soil needed:</span>${soilHtml}
      ${isBest?'<span class="pmeta-item good">★ Shortest path</span>':''}
    </div>
    <div class="path-sub" style="margin-top:8px">${subSteps}</div>
  </div>`;
}

// ─── MUTATION MATCHING & PROBABILITY ─────────────────────────────────────────
// Deterministic: parents exactly match a recipe's parent list (after dedup+sort)
// Pool: fallback when no det match — picks random matching pool, then random member
// Probability per breed-tick:
//   det:  (1/BCHANCE) * 0.5 * (1/numDetMutations)
//   pool: (1/BCHANCE) * 0.5 * sum_over_matching_pools_containing_crop( 1/numMatchingPools * 1/poolSize )
// A crop in multiple matching pools gets that sum — so more pools = higher effective chance

function matchMut(mut, parentIds, matchingPools){
  // Check deterministic: all parents present (after dedup)
  // Exclude self-referential parents (output crop as its own parent, 2.0.91 pattern)
  const pset = new Set(parentIds);
  const externalPars = mut.par.filter(p => p !== mut.out);
  if(externalPars.every(p=>pset.has(p))) return 'deterministic';
  // Check pool: is this crop a member of any matching pool?
  if(matchingPools.some(({pool,members})=>members.includes(mut.out))) return 'pool';
  return 'none';
}

function calcDetProb(numDetMuts){
  return (1/BCHANCE)*0.5*(1/Math.max(1,numDetMuts));
}

function calcPoolProb(cropId, matchingPools){
  return (1/BCHANCE)*0.5*poolProbForCrop(cropId, matchingPools);
}

function fmtProb(p, soilOk, mtype){
  if(p<=0){
    if(mtype!=='none' && soilOk===false) return {str:'⛔ Wrong soil', cls:'none'};
    return {str:'No match',cls:'none'};
  }
  const t=fmtTime(p);
  const str=`${t.pPerMin} · ${t.str}`;
  return {str,cls:t.cls};
}

// ─── MAIN RENDER ─────────────────────────────────────────────────────────────
function render(){
  const content=document.getElementById('content');
  if(mode==='target') return renderTargetMode(content);
  if(mode==='biome') return renderBiomeMode(content);
  if(selectedParents.length<2){
    content.innerHTML=`<div class="hint"><div class="hint-icon">🌱</div><div class="hint-title">Select 2–4 parent crops</div><div style="font-size:11px;max-width:280px;margin-top:4px">Pick crops from the list to see all possible mutations, growth rate, and nutrient breakdown.</div></div>`;
    return;
  }
  const pids=selectedParents.map(p=>p.id);
  const pset=new Set(pids); // deduped set for deterministic check
  const matchingPools=getMatchingPools(pids); // uses full list (non-dedup) for pool check
  const np=calcNutrients();
  const maxNP=calcNutrients.call({sky:true,humid:true,biome2:true,fert:true,water:true})||calcNutrients();

  // Spreading = same crop ×2 → spreading path clones it
  const spreadCrop = selectedParents.length >= 2 && selectedParents.every(p=>p.id===selectedParents[0].id) ? selectedParents[0] : null;
  // Deterministic: deduped parent set matches recipe exactly
  const detMuts=MUTS.filter(m=>m.par.every(p=>pset.has(p)));
  // Pool: any crop that is a member of at least one matching pool
  const poolCropIds=new Set(matchingPools.flatMap(({members})=>members));
  // Pool mutations = all MUTS whose output is in a matching pool AND no det match
  const poolMuts=MUTS.filter(m=>!detMuts.includes(m) && poolCropIds.has(m.out));
  // Pool-only crops = pool members that have no mutation recipe entry in MUTS at all
  // (e.g. Carrot, Potato, Wheat, Dandelion, Poppy — the 5 direct-pool-registration starters)
  // These can never appear via the MUTS.map() below since they have no MUTS row, so synthesize one.
  const allPoolOutputIds=[...poolCropIds].filter(id=>!MUTS.some(m=>m.out===id));

  const syntheticPoolEntries = allPoolOutputIds.map(id => {
    const c = cropById(id);
    return { out: id, par: [], pools: c ? c.pools : [], mtype: 'pool' };
  });

  const allResults=[...MUTS.map(m=>({...m,mtype:matchMut(m,pids,matchingPools)})), ...syntheticPoolEntries];
  allResults.sort((a,b)=>{const o={deterministic:0,pool:1,none:2};return o[a.mtype]-o[b.mtype]||a.out.localeCompare(b.out);});

  const filteredByType=filterMd==='det'?allResults.filter(r=>r.mtype==='deterministic')
    :filterMd==='pool'?allResults.filter(r=>r.mtype==='pool')
    :filterMd==='match'?allResults.filter(r=>r.mtype!=='none')
    :allResults;
  const filtered=hideSoilBlocked?filteredByType.filter(r=>soilMatches(r.out)):filteredByType;

  // Exact total: deterministic branch contributes (1/BCHANCE)*0.5 total (split evenly among detMuts, but as
  // a GROUP probability that's just the full branch chance, since exactly one det result fires if any match).
  // Pool branch: sum the real per-crop probability (calcPoolProb) across every soil-valid pool member.
  const detTotalPct = detMuts.length>0 ? (1/BCHANCE)*0.5*100 : 0;
  const poolTotalPct = matchingPools.length>0
    ? [...poolCropIds].filter(id=>soilMatches(id)).reduce((sum,id)=>sum+calcPoolProb(id,matchingPools),0)*100
    : 0;
  const totalMatchPct = detTotalPct + poolTotalPct;
  const probCls=totalMatchPct>=20?'c-grn':totalMatchPct>=5?'c-amb':totalMatchPct>0?'c-red':'c-gry';
  const poolStr=matchingPools.map(({pool})=>formatPool(pool)).join(', ');
  const soilInfo=soilById(soilSel);

  content.innerHTML=`
<div class="hero">
  <div style="font-size:11px;color:var(--tx3);margin-bottom:10px">
    Parents: <span style="color:var(--tx)">${selectedParents.map(p=>p.name).join(' + ')}</span>
    ${matchingPools.length?` · Active pools: <span style="color:var(--amb)">${matchingPools.length} pools</span>`:''}
    · Soil: <span style="color:var(--tel)">${soilInfo?soilInfo.name:soilSel}</span>
  </div>
  <div class="hero-top">
    <div class="hcard"><div class="hval ${probCls}">${detMuts.length+poolMuts.length}</div><div class="hlbl">Possible mutations</div></div>
    <div class="hcard"><div class="hval ${probCls}">${detMuts.length>0?fmtTime(calcDetProb(detMuts.length)).pPerMin:'—'}</div><div class="hlbl">Per det. result/min</div></div>
    <div class="hcard"><div class="hval c-tel">${fmtTime(spreadCrop?(1/BCHANCE)*0.5:(1/BCHANCE)*0.5*(1/Math.max(1,selectedParents.length))).pPerMin}</div><div class="hlbl">Clone/spread per parent/min</div></div>

    <div class="hcard" style="text-align:left;padding:10px 12px">
      <div style="font-size:10px;color:var(--tx3);margin-bottom:4px">Breed attempt: <strong style="color:var(--tx)">1 in ${BCHANCE}/tick</strong></div>
      <div style="font-size:10px;color:var(--tx3);margin-bottom:2px">50% cross / 50% breed split</div>
      <div style="font-size:10px;color:var(--amb);margin-bottom:2px">Parents must be ≥80% grown to breed</div>
      <div style="font-size:10px;color:var(--tx3)">Stat var: ${BLOW} to +${BHIGH}</div>
    </div>
  </div>
  <div class="nbar-wrap">
    </div>
    <div class="pills">
      <span style="font-size:10px;color:var(--tx3);align-self:center">Nutrient score (growth only, not mutation):</span>
      <span class="pill${ENV.sky?' ok':''}">☀️ Sky ${ENV.sky?'+2':'×0'}</span>
      <span class="pill${ENV.water?' ok':''}">💦 Water ${ENV.water?'+10':'+3'}</span>
      <span class="pill${ENV.fert?' ok':''}">🧪 Fert ${ENV.fert?'+10':'+0'}</span>
      <span class="pill${(ENV.humid||ENV.biome1||ENV.biome2)?' ok':''}">🌿 Biome +${ENV.biome2?28:ENV.biome1?14:ENV.humid?14:0}</span>
      <span class="pill">= ${np} raw nutrients</span>
    </div>
  </div>
</div>
${matchingPools.length ? `
<div class="path-section" style="border-color:var(--amb-b)">
  <h2 style="color:var(--amb)">🎲 Active Pool Mutations (${matchingPools.length} pools match)</h2>
  <div style="font-size:11px;color:var(--tx3);margin-bottom:10px">
    Pools fire as fallback when no deterministic recipe matches.<br>
    Breed path: 1-in-${BCHANCE}/tick × 50% × (1/numPools) × (1/poolSize). Crops in more matching pools have proportionally higher effective chance.
  </div>
  <div style="display:flex;flex-direction:column;gap:8px">
  ${matchingPools.map(({pool,members})=>{
    const label=formatPool(pool);
    const memberHtml=members.map(m=>{
      const c=cropById(m);
      const probTick=(1/BCHANCE)*0.5*(1/matchingPools.length)*(1/members.length);
      const prob=probTick; // keep for title
      const isMut=MUTS.some(mt=>mt.out===m);
      const mSoilOk=soilMatches(m);
      const mSoilDef=c?soilById(c.soil):null;
      const soilLabel=mSoilDef?mSoilDef.name:(c?c.soil:'?');
            var bg=mSoilOk?'var(--bg4)':'var(--red-d)';
      var bd=mSoilOk?'var(--bdr)':'var(--red-b)';
      var cl=mSoilOk?(isMut?'var(--tx)':'var(--tx3)'):'var(--red)';
      var ttl=(mSoilOk?'':'BLOCKED - needs '+soilLabel+' soil. ')+(prob*100).toFixed(3)+'%/tick';
      var inner=mSoilOk?('<span style="color:var(--tx3);margin-left:4px">'+fmtTime(prob).pPerMin+'</span>'):('<span style="color:var(--red);margin-left:4px;font-size:9px">✗ '+soilLabel+'</span>');
      return '<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:'+bg+';border:1px solid '+bd+';color:'+cl+';" title="'+ttl+'">'+m+(isMut?' *':'')+inner+'</span>';
    }).join('');
          var perMemberPct=((1/BCHANCE)*0.5*(1/matchingPools.length)*(1/members.length)*100).toFixed(2);
      return '<div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:7px;padding:10px 12px">'
        +'<div style="font-size:11px;font-weight:600;color:var(--amb);margin-bottom:6px">'+label
        +' <span style="font-weight:400;color:var(--tx3)">'+members.length+' members · '+perMemberPct+'%/tick each</span></div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:4px">'+memberHtml+'</div>'
        +'<div style="font-size:9px;color:var(--tx3);margin-top:5px">* = also has deterministic recipe · <span style="color:var(--red)">Red = blocked by current soil selection</span></div>'
        +'</div>';
  }).join('')}
  </div>
</div>` : ''}
${spreadCrop ? `
<div class="path-section" style="border-color:var(--grn-b)">
  <h2 style="color:var(--grn)">↔ Spreading: ${spreadCrop.name} × ${spreadCrop.name}</h2>
  <div style="font-size:12px;color:var(--tx2);margin-bottom:8px">
    Two <strong>${spreadCrop.name}</strong> adjacent to an empty cross-crop stick have <strong>two</strong> possible outcomes per breed tick:
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
    <div style="background:var(--bg3);border:1px solid var(--grn-b);border-radius:7px;padding:10px 12px">
      <div style="font-size:11px;font-weight:600;color:var(--grn);margin-bottom:4px">⟳ Spreading — 50% of breed ticks</div>
      <div style="font-size:11px;color:var(--tx2)">Picks one neighbour at random to determine the species, then keeps <em>every</em> neighbour of that same species as a stat contributor for the clone.</div>
      <div style="font-size:11px;color:var(--tx3);margin-top:4px">With 2 identical parents → always clones ${spreadCrop.name}, averaging both parents' stats.</div>
      <div style="font-size:12px;font-weight:600;color:var(--grn);margin-top:6px">${fmtTime((1/BCHANCE)*0.5).pPerMin} spread · ~${fmtTime((1/BCHANCE)*0.5).str}</div>
    </div>
    <div style="background:var(--bg3);border:1px solid var(--amb-b);border-radius:7px;padding:10px 12px">
      <div style="font-size:11px;font-weight:600;color:var(--amb);margin-bottom:4px">🧬 Breed path — 50% of breed ticks</div>
      <div style="font-size:11px;color:var(--tx2)">Deterministic recipes require 2 <em>distinct</em> parent species (deduped) — so same-crop pairs have <em>no</em> det match.</div>
      <div style="font-size:11px;color:var(--tx3);margin-top:4px">Falls through to pool mutations (see below).</div>
    </div>
  </div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11px">
    <span class="pill${ENV.fert?' ok':''}">🧪 With 2 identical parents, BOTH need fertilizer storage for stats to only-improve</span>
    <span class="pill">📊 Stat variation: ${BLOW} to +${BHIGH} per trait</span>
    <span class="pill warn">⚠ Parents must be ≥80% grown to participate</span>
  </div>
</div>` : ''}
<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
  <span class="sect-title">🧬 Mutations</span>
  <button class="fbtn${filterMd==='all'?' act':''}" onclick="setFilter('all')">All</button>
  <button class="fbtn${filterMd==='match'?' act':''}" onclick="setFilter('match')">Matches only</button>
  <button class="fbtn${filterMd==='det'?' act':''}" onclick="setFilter('det')">Deterministic</button>
  <button class="fbtn${filterMd==='pool'?' act':''}" onclick="setFilter('pool')">Pool</button>
  <button class="fbtn${hideSoilBlocked?' act':''}" onclick="toggleHideSoilBlocked()" title="Hide results that can't land because the selected soil doesn't match">${hideSoilBlocked?'✓ ':''}🌱 Hide soil-blocked</button>
  <span class="rcount">${filtered.length} shown${hideSoilBlocked&&filteredByType.length>filtered.length?` <span style="color:var(--tx3)">(${filteredByType.length-filtered.length} hidden by soil)</span>`:''}</span>
</div>
<div class="rgrid">
${filtered.map(m=>{
  const oc=cropById(m.out);
  const tier=oc?oc.tier:0;
  const tcls=`t${Math.min(14,tier)}`;
  const soilOk = soilMatches(m.out);
  // Raw prob before soil filter
  const rawProbBase = m.mtype==='deterministic' ? calcDetProb(detMuts.length)
    : m.mtype==='pool' ? calcPoolProb(m.out, matchingPools)
    : 0;
  // Effective prob: if this crop's soil doesn't match, it's 0
  // For pool: also adjust for the fraction of OTHER pool members that ARE valid
  // (those valid ones waste the tick slot competing with this one, rejected ones waste ticks entirely)
  // The actual formula: since each pool pick is independent, soil rejection just zeroes invalid outputs
  const rawProb = soilOk ? rawProbBase : 0;
  const {str,cls}=fmtProb(rawProb, soilOk, m.mtype);
  const soilDef=oc?soilById(oc.soil):null;
  const blockUnder=oc&&oc.blockUnder?oc.blockUnder:null;
  const machineCls=m.machine?'mach':m.mtype==='deterministic'?'det':'pool';
  const machineLabel=m.machine?'🔩 Machine':m.mtype==='deterministic'?'✓ Direct':'~ Pool';
  const cardCls=m.mtype==='deterministic'?'match':m.mtype==='pool'?'pool-m':'nomatch';
  const pNames=m.par.length ? m.par.filter(p=>p!==m.out).map(p=>{const c=cropById(p);return c?c.name:p;}).join(' + ') : '<em style="color:var(--tx3)">no fixed recipe — pool result only</em>';
  const tagHtml=(m.pools||[]).slice(0,4).map(p=>`<span class="mc-tag">${formatPool(p)}</span>`).join('');
  return `<div class="mcard ${cardCls}">
    <div class="mc-top">
      ${tier?`<span class="ct ${tcls}">T${tier}</span>`:''}
      <span class="mc-nm">${m.out.replace(/([A-Z])/g,' $1').trim()}</span>
      <span class="mc-type ${machineCls}">${machineLabel}</span>
    </div>
    <div class="mc-par">Needs: <span>${pNames}</span></div>
    <div class="mc-prob ${cls}" title="${fmtTime(rawProb).pct} per crop tick · median ${fmtTime(rawProb).median}">${str}</div>
    ${m.mtype==='pool'?`<div style="font-size:9px;color:var(--tx3);margin-top:2px">In pools: ${(CROP_POOLS[m.out]||[]).filter(p=>matchingPools.some(mp=>mp.pool===p)).map(p=>`<span style="color:var(--amb)">${formatPool(p)}</span>`).join(', ')}</div>`:''}
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:2px">
      ${soilDef?`<span class="mc-soil" style="${!soilMatches(m.out)?'opacity:.5;text-decoration:line-through':''}" title="y-1: soil block the crop stick sits on">🌱 ${soilDef.name}</span>`:''}
      ${blockUnder?`<span style="font-size:10px;color:var(--pur);background:#2a1040;border:1px solid #3a1060;border-radius:3px;padding:1px 6px" title="y-2: block under the soil">⛏ ${blockUnder}</span>`:''}
      ${!soilMatches(m.out)?`<span style="font-size:10px;color:var(--red);background:var(--red-d);border:1px solid var(--red-b);border-radius:3px;padding:1px 6px">✗ blocked by soil</span>`:''}
    </div>
    ${tagHtml?`<div class="mc-tags">${tagHtml}</div>`:''}
    ${m.req?`<div class="mc-req">⚠ ${m.req}</div>`:''}
  </div>`;
}).join('')}
</div>`;
}

function renderTargetMode(content){
  if(!targetCrop){
    content.innerHTML=`<div class="hint"><div class="hint-icon">🎯</div><div class="hint-title">Search for a target crop</div><div style="font-size:11px;max-width:280px;margin-top:4px">Select the crop you want to produce. The calculator will find the optimal breeding path from starter crops.</div></div>`;
    return;
  }
  const tc=cropById(targetCrop);
  if(!tc){content.innerHTML='<div class="hint"><div class="hint-title">Unknown crop</div></div>';return;}

  const muts=mutsByOutput(targetCrop);
  const targetPoolsCheck = CROP_POOLS[targetCrop] || [];
  const isDirectlyPlantable = STARTERS.has(targetCrop) || !!DIRECT_POOL_REGISTRATIONS[targetCrop];

  if(!muts.length && !targetPoolsCheck.length){
    const noteHtml = tc.note ? `<p style="font-size:12px;color:var(--amb);margin-top:8px;padding:8px 10px;background:var(--bg2);border:1px solid var(--amb-b);border-radius:5px">📋 ${tc.note}</p>` : '';
    const machineNote = tc.machine ? `<p style="font-size:12px;color:var(--tx3);margin-top:6px">This crop has no standard breeding path. Check the Crop Breeder or Crop Synthesizer machine recipes.</p>` : `<p style="font-size:12px;color:var(--tx3);margin-top:6px">This crop can be obtained directly — no breeding required. It has no mutation pool membership so it cannot appear as a breeding result.</p>`;
    content.innerHTML=`<div class="path-section"><h2>🌱 ${tc.name}</h2>${machineNote}${noteHtml}</div>`;
    return;
  }

  // Note shown when a crop is both directly plantable AND reachable via pool mutation —
  // this matters for stat-up: you can breed toward a "starter" crop to inherit averaged parent stats.
  const directlyPlantableNote = (!muts.length && isDirectlyPlantable) ? `
<div class="path-section" style="border-color:var(--grn-b)">
  <h2 style="color:var(--grn)">🌱 ${tc.name} is directly plantable — and also breedable</h2>
  <p style="font-size:12px;color:var(--tx3)">No deterministic recipe exists for ${tc.name}, but it's a member of ${targetPoolsCheck.length} mutation pool${targetPoolsCheck.length===1?'':'s'}, so a pool-mutation breed can still produce it from other parents. This matters if you want to <strong style="color:var(--tx2)">stat-up a directly-planted crop</strong> — breed two pool-sharing parents and any result that lands on ${tc.name} keeps the averaged parent stats (plus fertilizer-gated variation), which is usually faster than waiting on the cross/clone path alone.</p>
</div>` : '';

  const paths=findPaths(targetCrop,12);
  const soil=soilById(tc.soil);
  const blockUnder=tc.blockUnder;


  const directRecipes = muts.length ? muts.map(m=>{
    const pNames=m.par.filter(p=>p!==m.out).map(p=>{const c=cropById(p);return c?c.name:p;}).join(' + ');
    return `<div style="margin-bottom:6px;font-size:12px">
      <span style="color:var(--tx)">${pNames}</span>
      ${m.machine?'<span style="color:var(--pur);margin-left:6px;font-size:10px">[Machine only]</span>':''}
      ${m.req?`<span style="color:var(--amb);margin-left:6px;font-size:10px">[${m.req}]</span>`:''}
    </div>`;
  }).join('') : `<div style="font-size:12px;color:var(--tx3);font-style:italic">No deterministic recipe — ${tc.name} ${isDirectlyPlantable?'is directly plantable and ':''}is only reachable via pool mutation. See "Pool Paths" below.</div>`;

  // ── Pool paths: find all crop pairs that share a pool containing targetCrop ──
  const targetPools = CROP_POOLS[targetCrop] || [];
  // For each pool the target belongs to, find all pairs of OTHER crops in that pool
  // that can breed together to potentially produce the target
  const poolPathRows = [];
  for (const pool of targetPools) {
    const members = POOL_MAP[pool] || [];
    if (members.length < 2) continue;
    // Any single crop present twice, or any 2 different crops in this pool,
    // can trigger a pool mutation roll that may produce the target
    // Show all unique pairs (including same-crop x2)
    const shown = new Set();
    for (let i = 0; i < members.length; i++) {
      for (let j = i; j < members.length; j++) {
        const a = members[i], b = members[j];
        const key = [a,b].sort().join('+');
        if (shown.has(key)) continue;
        shown.add(key);
        // Skip pairs where either parent IS the target crop itself
        // (if you already have Malaxia, you'd spread it, not breed toward it)
        if (a === targetCrop || b === targetCrop) continue;
        // For same crop x2: only valid if crop has pool membership (always true if it's in members)
        // matchingPools for [a,b]: all pools where both appear (count >=2 for same, >=1 each for diff)
        const pids = [a, b];
        const mp = getMatchingPools(pids);
        const prob = calcPoolProb(targetCrop, mp);
        const soilOk = soilMatches(targetCrop);
        const effProb = soilOk ? prob : 0;
        const ca = cropById(a), cb = cropById(b);
        const aName = ca ? ca.name : a;
        const bName = cb ? cb.name : b;
        const aT = ca ? `<span class="ct t${Math.min(14,ca.tier)}">T${ca.tier}</span>` : '';
        const bT = cb ? `<span class="ct t${Math.min(14,cb.tier)}">T${cb.tier}</span>` : '';
        const probFmt = effProb > 0 ? fmtTime(effProb) : null;
        // Note if there's ALSO a det recipe for a+b -> target
        const hasDetPath = MUTS.some(m => m.out===targetCrop && m.par.every(p => pids.includes(p)) && m.par.length === new Set(pids).size);
        poolPathRows.push({pool, a, b, aName, bName, aT, bT, prob: effProb, probFmt, hasDetPath, soilOk});
      }
    }
  }
  // Sort: highest prob first, then by pool
  poolPathRows.sort((x,y) => y.prob - x.prob);
  
  // Group by pool for display
  const poolGroups = {};
  for (const row of poolPathRows) {
    if (!poolGroups[row.pool]) poolGroups[row.pool] = [];
    poolGroups[row.pool].push(row);
  }

  const poolPathsHtml = targetPools.length ? `
<div class="path-section">
  <h2>🎲 Pool Paths to ${tc.name}</h2>
  <div style="font-size:11px;color:var(--tx3);margin-bottom:12px">
    ${tc.name} is a member of <strong style="color:var(--tx)">${targetPools.length}</strong> mutation pool${targetPools.length===1?'':'s'}. 
    Any two crops that are both in one of these pools can randomly produce ${tc.name} via the pool breed path — 
    even without the direct recipe parents. Use this when you have pool-member crops but not the exact deterministic parents.
  </div>
  ${Object.entries(poolGroups).map(([pool, rows]) => {
    const label = formatPool(pool);
    const poolMembers = POOL_MAP[pool] || [];
    return `<div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:8px;padding:12px 14px;margin-bottom:10px">
      <div style="font-size:12px;font-weight:600;color:var(--amb);margin-bottom:8px">
        Pool: <span style="color:var(--gold)">${label}</span>
        <span style="font-weight:400;color:var(--tx3);font-size:11px;margin-left:8px">${poolMembers.length} members total</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px">
      ${rows.map(r => {
        const isDet = r.hasDetPath;
        return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg4);border-radius:5px;border:1px solid ${isDet?'var(--grn-b)':'var(--bdr)'}">
          <span style="font-size:11px;color:var(--tx);min-width:160px">${r.aT} ${r.aName} + ${r.bT} ${r.bName}</span>
          ${isDet?'<span style="font-size:9px;color:var(--grn);background:var(--grn-d);border-radius:3px;padding:1px 5px">✓ also det recipe</span>':''}
          ${r.soilOk && r.prob>0
            ? `<span style="font-size:11px;color:var(--grn);margin-left:auto">${r.probFmt.pPerMin}</span><span style="font-size:10px;color:var(--tx3);margin-left:6px">~${r.probFmt.str}</span>`
            : `<span style="font-size:11px;color:var(--red);margin-left:auto">✗ wrong soil</span>`}
        </div>`;
      }).join('')}
      </div>
    </div>`;
  }).join('')}
</div>` : '';

  content.innerHTML=`
${directlyPlantableNote}
<div class="path-section">
  <h2>🎯 Target: ${tc.name} (Tier ${tc.tier})</h2>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;font-size:11px;align-items:center">
    <span class="ct t${Math.min(14,tc.tier)}">Tier ${tc.tier}</span>
    <span class="pill${soilSel===tc.soil?' ok':' warn'}" title="y-1: soil block - currently selected: ${soilById(soilSel)?soilById(soilSel).name:soilSel}">🌱 Needs: ${soil?soil.name:tc.soil}${soilSel!==tc.soil?' ⚠ (wrong soil selected)':' ✓'}</span>
    ${blockUnder?`<span class="pill warn" title="y-2: block under the soil">⛏ Under soil (y-2): ${blockUnder}</span>`:''}
    ${tc.machine?'<span class="pill warn">🔩 Machine breeding required</span>':''}

  </div>
  <div style="font-size:11px;color:var(--tx3);margin-bottom:10px">Direct breeding recipes (parents for the final step):</div>
  ${directRecipes}
</div>
<div class="path-section">
  <h2>🗺 Breeding Paths (from starters)</h2>
  <div style="font-size:11px;color:var(--tx3);margin-bottom:10px">
    <span class="ps-crop starter">Blue = starter crop</span>&nbsp;
    <span class="ps-crop target">Green = target</span>&nbsp;
    Other = intermediate breed
  </div>
  ${(!muts.length && targetPoolsCheck.length) ? `<div style="font-size:11px;color:var(--amb);margin-bottom:10px">No deterministic recipe chain exists for ${tc.name} — it's planted directly. The 0-step path below just reflects that. For actual breeding routes (e.g. to stat-up onto this crop), see <strong>Pool Paths to ${tc.name}</strong> below.</div>` : ''}
  ${paths.length?`<div class="path-grid">${paths.map((p,i)=>renderPath(p,i)).join('')}</div>`:'<div class="no-path">No breeding path found within depth limit. This crop may require machine-only intermediates or mods not in base GTNH.</div>'}
</div>
${poolPathsHtml}
`;
}

// ─── UI EVENT HANDLERS ────────────────────────────────────────────────────────
function setMode(m){
  mode=m;
  document.getElementById('modeParents').className='fbtn'+(m==='parents'?' act':'');
  document.getElementById('modeTarget').className='fbtn'+(m==='target'?' act':'');
  document.getElementById('modeBiome').className='fbtn'+(m==='biome'?' act':'');
  document.getElementById('modeParentsUI').style.display=m==='parents'?'block':'none';
  document.getElementById('modeTargetUI').style.display=m==='target'?'block':'none';
  document.getElementById('modeBiomeUI').style.display=m==='biome'?'block':'none';
  if(m==='biome'&&!document.getElementById('biomeList').children.length) initBiomeList();
  render();
}
function setFilter(f){filterMd=f;render();}
function toggleHideSoilBlocked(){hideSoilBlocked=!hideSoilBlocked;render();}
function togEnv(k){
  if(k==='biome2'&&!ENV.biome2){ENV.biome1=false;ENV.biome2=true;}
  else if(k==='biome1'&&!ENV.biome1){ENV.biome2=false;ENV.biome1=true;}
  else ENV[k]=!ENV[k];
  ['Sky','Humid','Biome1','Biome2','Fert','Water'].forEach(n=>{
    const key=n[0].toLowerCase()+n.slice(1);
    const btn=document.getElementById('env'+n);
    if(btn) btn.className='etbtn'+(ENV[key]?' act':'');
  });
  render();
}
function upd(){
  render();
}
function filterCrops(){
  const q=document.getElementById('cropSearch').value.toLowerCase();
  renderCropList(q);
}
function filterTargets(){
  const q=document.getElementById('targetSearch').value.toLowerCase();
  renderTargetList(q);
}
function selectCrop(id){
  const c=cropById(id);
  if(!c) return;
  // Count how many slots this crop already occupies
  const slots=selectedParents.map((p,i)=>p.id===id?i:-1).filter(i=>i>=0);
  // If clicking an already-selected crop:
  //   - 0 copies: add it
  //   - 1 copy: add a second copy (for spreading/stat-up)
  //   - 2 copies: remove both (toggle off)
  if(slots.length>=2){
    // remove all copies of this crop
    selectedParents=selectedParents.filter(p=>p.id!==id);
  } else if(selectedParents.length<4){
    selectedParents.push({...c});
  } else {
    selectedParents.shift();
    selectedParents.push({...c});
  }
  renderParentSlots();
  renderCropList();
  render();
}
function removeParent(i){selectedParents.splice(i,1);renderParentSlots();renderCropList();render();}
function selectTarget(id){
  targetCrop=id;
  const c=cropById(id);
  document.getElementById('targetSelected').innerHTML=c
    ?`<span style="color:var(--tx)">Target: <strong>${c.name}</strong> <span class="ct t${Math.min(14,c.tier)}">T${c.tier}</span></span>`
    :'No target selected';
  render();
}
function selectSoil(id){
  soilSel=id;
  renderSoilSelect();
  render();
}
function renderParentSlots(){
  const el=document.getElementById('parentSlots');
  let h='';
  for(let i=0;i<4;i++){
    const p=selectedParents[i];
    if(p){
      h+=`<div class="pslot act"><span class="sl">Parent ${i+1}</span><span class="sc">${p.name}</span><span class="ct t${Math.min(14,p.tier)}">T${p.tier}</span><button class="srm" onclick="removeParent(${i})">×</button></div>`;
    } else if(i<2||(i===2&&selectedParents.length>=2)||(i===3&&selectedParents.length>=3)){
      h+=`<div class="pslot"><span class="sl">Parent ${i+1}</span><span class="se">Click a crop…</span></div>`;
    }
  }
  el.innerHTML=h;
}
function renderCropList(q=''){
  const el=document.getElementById('cropList');
  const lbl=document.getElementById('cropCountLbl');
  q=q||document.getElementById('cropSearch').value.toLowerCase();
  const seen=new Set();
  const items=CROPS.filter(c=>{
    if(seen.has(c.id)) return false;
    seen.add(c.id);
    return !q||c.name.toLowerCase().includes(q)||c.id.toLowerCase().includes(q);
  }).sort((a,b)=>a.tier-b.tier||a.name.localeCompare(b.name));
  lbl.textContent=`(${items.length})`;
  el.innerHTML=items.map(c=>{
    const count=selectedParents.filter(p=>p.id===c.id).length;
    const selCls=count>0?' sel':'';
    const countBadge=count>=2?`<span style="font-size:10px;font-weight:700;color:var(--grn);margin-left:2px">×${count}</span>`:(count===1?'<span style="font-size:9px;color:var(--blu);margin-left:2px">✓</span>':'');
    return `<div class="ci${selCls}" onclick="selectCrop('${c.id}')">
      <span class="cn">${c.name}</span>
      ${countBadge}
      <span class="ct t${Math.min(14,c.tier)}">T${c.tier}</span>
      ${c.machine?'<span style="font-size:9px;color:var(--pur)">M</span>':''}
    </div>`;
  }).join('');
}
function renderTargetList(q=''){
  const el=document.getElementById('targetList');
  q=q||document.getElementById('targetSearch').value.toLowerCase();
  const seen=new Set();
  const items=CROPS.filter(c=>{
    if(seen.has(c.id)) return false;
    seen.add(c.id);
    return !q||c.name.toLowerCase().includes(q)||c.id.toLowerCase().includes(q);
  }).sort((a,b)=>a.tier-b.tier||a.name.localeCompare(b.name));
  el.innerHTML=items.map(c=>{
    const sel=targetCrop===c.id;
    return `<div class="ci${sel?' sel':''}" onclick="selectTarget('${c.id}')">
      <span class="cn">${c.name}</span>
      <span class="ct t${Math.min(14,c.tier)}">T${c.tier}</span>
    </div>`;
  }).join('');
}
function renderSoilSelect(){
  const el=document.getElementById('soilSelect');
  el.innerHTML=SOILS.map(s=>`
    <button class="sbtn${soilSel===s.id?' act':''}" onclick="selectSoil('${s.id}')" title="${s.blocks}">
      <span class="snm">${s.name}</span>
      <span class="snote">${s.note}</span>
    </button>`).join('');
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
renderCropList();
renderTargetList();
renderParentSlots();
renderSoilSelect();
upd();

// ═══ BIOME BROWSER ═══

function biomeTagBonus(liked, biomeTags){
  if(!liked||!liked.length) return 0;
  const n = Math.min(2, liked.filter(t=>biomeTags.has(t)).length);
  return n * 14;
}

function biomeHumidBonus(rain){
  return Math.max(0, Math.min(1, (rain - 0.5) / 0.3)) * 14;
}

function effectiveBiomeBonus(liked, biomeTags, rain){
  return Math.max(biomeTagBonus(liked, biomeTags), biomeHumidBonus(rain));
}

function initBiomeList(){
  const list = document.getElementById('biomeList');
  list.innerHTML = '';
  const names = Object.keys(BIOMES).sort();
  for(const name of names){
    const div = document.createElement('div');
    div.className = 'ci';
    div.textContent = name;
    div.onclick = () => selectBiome(name);
    div.id = 'biomeItem_' + name.replace(/\s+/g,'_');
    list.appendChild(div);
  }
}

function filterBiomes(){
  const q = document.getElementById('biomeSearch').value.toLowerCase();
  const list = document.getElementById('biomeList');
  for(const div of list.children){
    div.style.display = div.textContent.toLowerCase().includes(q) ? '' : 'none';
  }
}

function selectBiome(name){
  selectedBiome = name;
  // Highlight selection
  for(const el of document.getElementById('biomeList').children){
    el.classList.toggle('sel', el.textContent === name);
  }
  render();
}

function renderBiomeMode(content){
  if(!selectedBiome){
    content.innerHTML = `<div class="hint"><div class="hint-icon">🌍</div><div class="hint-title">Select a biome</div><div style="font-size:11px;max-width:280px;margin-top:4px">Search or scroll to pick a biome. You'll see every crop ranked by its tag-match bonus there, with the humidity floor shown separately.</div></div>`;
    return;
  }

  const biomeTags = new Set(BIOMES[selectedBiome] || []);
  const rain = BIOME_RAINFALL[selectedBiome] || 0;
  const humidBonus = Math.round(biomeHumidBonus(rain) * 10) / 10;
  const humidDisplay = humidBonus > 0 ? `+${humidBonus.toFixed(0)} humidity floor (rain ${rain.toFixed(2)})` : `No humidity bonus (rain ${rain.toFixed(2)})`;

  // Score every crop
  const scored = CROPS.map(c => {
    const liked = c.liked || [];
    const tagB = biomeTagBonus(liked, biomeTags);
    const eff = Math.max(tagB, humidBonus);
    return {c, liked, tagB, eff};
  });

  // Sort: full tag match (+28) first, then partial (+14), then humidity-only, then nothing — within each group, tier ascending
  scored.sort((a,b) => {
    if(b.tagB !== a.tagB) return b.tagB - a.tagB;
    if(b.eff !== a.eff) return b.eff - a.eff;
    return a.c.tier - b.c.tier;
  });

  const full28 = scored.filter(x => x.tagB === 28);
  const part14 = scored.filter(x => x.tagB === 14);
  const humidOnly = scored.filter(x => x.tagB === 0 && x.eff > 0);
  const zero = scored.filter(x => x.eff === 0);

  function cropRow(x){
    const {c, liked, tagB, eff} = x;
    const matchedTags = (liked||[]).filter(t => biomeTags.has(t));
    const tagStr = matchedTags.length
      ? matchedTags.map(t=>`<span style="background:var(--grn-d);color:var(--grn);border-radius:3px;padding:1px 5px;font-size:10px">${t}</span>`).join(' ')
      : '';
    const likedStr = (liked||[]).filter(t=>!biomeTags.has(t)).map(t=>`<span style="background:var(--bg3);color:var(--tx3);border-radius:3px;padding:1px 5px;font-size:10px">${t}</span>`).join(' ');
    const bonusBadge = tagB===28
      ? `<span style="color:var(--grn);font-weight:700">+28</span>`
      : tagB===14
      ? `<span style="color:var(--amb);font-weight:700">+14</span>`
      : eff>0
      ? `<span style="color:var(--blu);font-weight:600">+${eff.toFixed(0)} 💧</span>`
      : `<span style="color:var(--tx3)">+0</span>`;
    const soilNote = c.blockUnder ? `<span style="color:var(--pur);font-size:10px"> ⛏${c.blockUnder}</span>` : '';
    const noteStr = c.note ? `<span style="color:var(--amb);font-size:10px"> · ${c.note}</span>` : '';
    return `<div style="display:flex;align-items:baseline;gap:8px;padding:5px 0;border-bottom:1px solid var(--bdr)">
      <span style="min-width:28px;text-align:right">${bonusBadge}</span>
      <span style="min-width:24px;font-size:10px;color:var(--tx3)">T${c.tier}</span>
      <span style="flex:1;font-size:13px">${c.name}${soilNote}${noteStr}</span>
      <span style="font-size:10px;color:var(--tx3)">${tagStr}${likedStr?'<span style="color:var(--bdr2);margin:0 3px">·</span>'+likedStr:''}</span>
    </div>`;
  }

  function section(label, color, items, extra=''){
    if(!items.length) return '';
    return `<div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:${color};margin-bottom:6px;border-bottom:1px solid var(--bdr);padding-bottom:4px">${label} (${items.length})${extra}</div>
      ${items.map(cropRow).join('')}
    </div>`;
  }

  const tagsDisplay = [...biomeTags].map(t=>`<span style="background:var(--bg3);border:1px solid var(--bdr2);border-radius:3px;padding:1px 6px;font-size:11px;margin-right:4px">${t}</span>`).join('');

  content.innerHTML = `
<div style="margin-bottom:16px">
  <h2 style="font-size:15px;margin-bottom:6px">🌍 ${selectedBiome}</h2>
  <div style="margin-bottom:4px">${tagsDisplay}</div>
  <div style="font-size:11px;color:var(--tx3)">${humidDisplay} · ${biomeTags.size} biome tag${biomeTags.size!==1?'s':''}</div>
</div>
${section('🌿 Full match — +28 tag bonus', 'var(--grn)', full28, ' · 2 of liked tags match')}
${section('⬡ Partial match — +14 tag bonus', 'var(--amb)', part14, ' · 1 of liked tags matches')}
${humidBonus>0?section(`💧 Humidity only — +${humidBonus.toFixed(0)} (no tag match)`, 'var(--blu)', humidOnly, ' · no liked tags match, bonus is from rainfall alone'):''}
${zero.length?`<details style="margin-top:8px"><summary style="font-size:11px;color:var(--tx3);cursor:pointer">${zero.length} crops get no bonus here</summary><div style="margin-top:8px">${zero.map(cropRow).join('')}</div></details>`:''}
`;
}
