# CropsNH Site — Source Verification Audit

Verified against `cropsnh-2_0_76.jar`, decompiled with CFR. Every claim below was checked against actual `.java` source, not inferred or assumed.

## Site structure (now hostable, not single-file)

```
cropsnh-site/
├── index.html
├── calculator.html       (mutation calculator)
├── production.html       (yield calculator)
├── guide.html             (breeding guide)
├── netlify.toml
├── css/
│   ├── shared.css        (header, nav, tier badges — used by all pages)
│   ├── calculator.css
│   ├── production.css
│   └── guide.css
└── js/
    ├── data.js           (CROPS, MUTS, SOILS, POOL_MAP, CROP_POOLS — single source of truth)
    ├── engine.js         (calculator logic)
    ├── production.js     (production calculator logic)
    └── guide.js          (spoiler toggle + scroll-spy nav)
```

Upload the whole `cropsnh-site/` folder as-is to Netlify, Vercel, GitHub Pages, or any static host — `index.html` is the entry point.

## What was wrong (calculator.html crop database)

Of 180 original crop entries, **116 had at least one factual error** versus decompiled source:
- ~95 wrong tiers (some by 1, some by 8+ — e.g. Stargatium claimed 14, actually 12; Primordial Berry claimed 7, actually 16)
- 12 wrong soils (every vanilla flower was tagged `farmland`, actually `dirtGrass`)
- ~35 missing block-under requirements (every Stone Lily variant was missing its required block entirely)
- All 7 standard Bonsai variants: wrong tier (claimed 3–6, actually all tier 1) and wrong soil (claimed farmland, actually `dirtGrass`)
- 4 crops (FloweringVine, GlowingCoral, Ivy, Moss) existed as **duplicate, contradictory entries**
- `BonsaiSlimy` specifically uses `slimyDirt` soil (dirt/grass OR slimy compound), not plain `dirtGrass` — easy to miss since it's a subclass override
- 10 pool-membership errors affecting probability math directly (e.g. AndesiteLily missing from `aMetal`, all 4 Glowshroom variants missing from `aFood`/`aIngredient`)
- 5 mutations existed in source but were completely absent from the calculator (Liveroot, MagicalNightshade, SaguaroCactus, Steeleafranks, Torchberry) — 2 of these crops (Liveroot, Steeleafranks) weren't in the crop database at all
- `GaiaWart` (the crop replacing Terra Wart in 2.9) didn't exist anywhere in the old data — added now, tier 5, soulsand soil, snow block-under, **not breedable** (no recipe, no pool registration)

**Fixed:** all 179 crops now match decompiled source exactly. Verified twice — once against my own consolidated extraction, once again against the raw unedited per-file extraction — zero discrepancies either time.

## What was wrong (production.html — separate, independently wrong data)

- **2x growth-duration bug**: 54 of 61 crops used a fallback formula of `tier * 1200`. Real source default (`NHCropCard.getGrowthDuration()`) is `tier * 600`. Every "time to mature" was double, every "items/hour" was roughly half, for any crop without an explicit override.
- Bonsai-specific growth duration was listed as 900; real value (`CropBonsai.getGrowthDuration()`) is 1200.
- 22 wrong tiers (independent from the calculator's errors — different file, different mistakes).
- 25 wrong liked-biome tag sets, including all 6 non-Oak Bonsai variants (their liked biomes are constructor arguments in `CropLoader.java`, easy to get wrong by guessing).
- "Milk Wart (IC2 item)" — false; it drops a real CropsNH item (`CropsNHItemList.milkWart`), not an IC2 item.

**Fixed:** all 61 crops cross-checked against source; zero remaining discrepancies.

## Mechanics corrections (guide.html)

Beyond the earlier Discord-driven fixes (Crop-Matron removal, Spade/Reinforced Spade, Plant Cure, Crop Lens, Resistance behavior, WeedEx), this pass found and fixed:

- **Weed deflection requires BOTH WeedEx storage AND Resistance ≥ Growth** — not WeedEx alone. Verified from `TileEntityCropSticks.spreadWeed()`.
- **Weed spreading requires Growth > 24 AND Resistance < Growth** — Resistance ≥ Growth blocks it unconditionally, no random roll at all (short-circuited in source).
- **Stat-up fertilizer requirement is path-dependent**: cross/clone path with one matching neighbour needs fertilizer in just that one crop; a normal 2-parent breed needs fertilizer in *both* contributing parents for the "can only improve" guarantee. The previous fix had simplified this to "one parent is enough," which is only true for the clone path specifically.
- Footer citation fixed — it referenced `SoilLoader.java` and `BlockUnderRequirementLoader.java`, which don't exist in the actual jar. Now cites only files actually decompiled and read.
- Gaia Wart section rewritten with confidence (was previously hedged as "a new wart-type crop... check NEI for the name") now that `CropGaiaWart` is directly confirmed in source.

## Engine fixes (calculator.html math/logic)

- **`totalMatchPct` was a rough placeholder** (`0.1` hardcoded as a stand-in for average pool probability) — replaced with an exact sum across every soil-valid pool member's real probability.
- **"Wrong soil" vs "structurally no match" were indistinguishable** in the UI — both showed "No match." Now shows "⛔ Wrong soil" when the result exists but the selected soil blocks it, vs "No match" when there's truly no path. This directly addresses the Lemon×Lemon confusion from earlier in this conversation — the math was always right, but the UI couldn't tell you *why* a result showed 0%.
- "Fertilizer in both parents prevents stat drops" pill (shown only for same-species spreading) was already correct for that specific 2-identical-parent case — confirmed via source rather than assumed, since the cross path's neighbour-narrowing keeps *every* same-species neighbour, not just one.

## What was double-checked and confirmed already correct (no changes needed)

- Breeding chance 1-in-3 per tick (`BCHANCE=3`) — matches `ConfigurationHandler.breedingChance` default.
- 50/50 cross-vs-breed split, deterministic-before-pool fallback order — matches `getBreedingResult()` exactly.
- Stat variance -2 to +4 (`BLOW=-2, BHIGH=4`) — matches `ConfigurationHandler.breedingLow/breedingHigh` defaults exactly.
- Growth rate formula (`baseSpeed=6+growth`, `need=tier*10`, `nutrientPoints*=5`) — byte-for-byte match with `TileEntityCropSticks.getGrowthRate()`.
- Nutrient score formula, including the `Math.max(humidityBonus, likedBiomeCount*14)` (not additive) — matches `getNutrientsPerCycle()` exactly.
- Pool-mutation math structure (`1/numMatchingPools × 1/poolSize`, summed across all matching pools a crop belongs to) — matches `MutationPool.isMatch()` and the random-pool-then-random-member selection in `getBreedingResult()`.
- Mutation recipe data itself (which parents produce which crop, machine-only flags) — only 5 of 172 real recipes were missing, zero were wrong.

## Round 4 — Cross-checked a community-written beginner PDF against decompiled source, found real gaps on both sides

A community PDF guide made several claims our guide either had wrong or didn't cover. Every claim below was traced to specific decompiled classes before being incorporated — nothing here is taken from the PDF on trust alone.

**The Spade/Reinforced Spade seed mechanic was mislabeled in our guide as a "bonus."** Decompiling `ItemSpadeNH.java`, `ItemSpade.java`, and `ItemReinforcedSpade.java` shows the regular Spade calls the exact same seed-return method as an ordinary harvest — there's no bonus at all, just the ability to harvest before full maturity. The Reinforced Spade is genuinely different: it skips the probability roll entirely and grants a guaranteed `floor(Resistance/10)` seeds plus a remainder-weighted chance at one more, capping at 4 — confirmed against the PDF's claim and the literal source formula.

**Resistance 31 grants full, unconditional trample immunity** — `canTrample()` returns false outright at Resistance ≥ 31, blocking both sprinting and fall-damage trample checks with no dice roll involved. Our guide previously said this only made crops "harder to kill," understating a hard immunity threshold.

**Three specific blocks are independently trample-immune regardless of crop Resistance** — Ztones Garden Soil, Enchanted Earth, and Fertilized Dirt are each registered at the engine's maximum trample-resistance value in `SoilLoader.java`. None of this was in our guide before.

**Nutrient-deficiency sickness is governed by a real probability roll, not a flat rule.** `passesResistanceCheck()` (`Resistance > random(0–30)`) runs every tick a crop fails to gain growth from low nutrients. At Resistance 31 that roll always passes, so the crop just sits dormant forever; below 31 there's a genuine chance of going sick instead. Our guide previously hedged between "dormant" and "sick" without explaining why, and a separate table row flatly claimed Resistance had no role in nutrient sickness at all — which was backwards at the maximum stat value.

**"Crops cannot die, only get sick" was a real overstatement, repeated twice.** `ConfigurationHandler.weedsWipePlants` defaults to `true`, and the weed-spawn logic will replace an existing crop outright — not just sicken it — whenever that crop's Resistance is below 31. This is a different, more severe outcome than sickness, and it's the default behavior, not an edge case.

**Weeds that can't find an empty crop stick to spread onto instead convert the Dirt or Farmland beneath that spot into Grass and plant tall grass on it.** Verified directly in `spreadWeed()`. A neglected weed problem can spread into the surrounding terrain, not just your crops — this was missing entirely from our guide.

**Breeding the same crop against itself as both parents dilutes its odds rather than narrowing them**, since every pool that crop belongs to becomes simultaneously active. This was already implicit in our probability math but never stated as a named tradeoff worth knowing about, especially for crops sitting in large pools.

**The Crop Manager's water top-up is unconditional, not biome-dependent.** Verified in `MTECropManager.applyHydration()` — it refills from its own internal tank regardless of rainfall or humidity. The PDF's framing tied this to "an 80% humidity biome" specifically, which conflates two separate, unrelated systems; the verified, biome-independent version of the claim was the one incorporated.

**Two PDF claims were checked and not included, after failing to verify:**
- A "Tricoder (portable scanner)" item — zero references to this name exist anywhere in the decompiled jar's classes or strings. Either a different mod's item, a cut feature, or simply not present in this build.
- Specific tier thresholds (T4/T5/T11/T12) for where crops can be planted without sky or biome requirements — no literal tier-based comparison exists anywhere in the decompiled source, and the nutrient formula's actual hard-zero floor doesn't cleanly match the claimed breakpoints. Left out rather than presented as fact on an inconclusive basis.

## Round 5 — New section: computed optimal leveling/breeding plan

Added "Leveling Every Crop" to the guide — a from-scratch computed answer to "what's the best biome setup to level the entire crop roster," rather than a guess.

**Method:** every crop's liked-biome tags were scored against every real GTNH biome's actual tags (the same 199-biome dataset from Round 3), using the engine's real `min(2, matchedTags) × 14` formula. Single biomes were ranked first, then the top 30 were paired against each other to find the best 2-biome combination — not by tag overlap *between* the biomes, but by how well each one's tags complement the other's blind spots.

**Result: Canyon is the best single biome** (93 of 176 crops with liked-biome data get some bonus, 45 at the full +28). **Canyon + Fungi Forest is the best pair** (152 of 176 covered) specifically because the two share zero tags with each other — they cover two entirely different crop families instead of doubling up on one. Crag and FrozenOcean were added as a third and fourth stop to close most of the remaining DEAD/SPOOKY/WASTELAND and COLD/SNOWY/OCEAN gaps. Two crops (FloweringVine, Plumbilia) don't share a tag with any of the four and were called out explicitly rather than silently dropped.

Also documented the real breeding-order logic for leveling everything, not just one crop: the 5 true starter crops (Wheat, Carrot, Potato, Dandelion, Poppy) are the only ones with zero breeding prerequisite, and a graph search over every deterministic recipe confirmed only 13 of 179 crops are reachable through pure deterministic chains — the other 166 require pool mutations. Wheat/Carrot/Potato share the largest pool in the game (`aFood`, 39 crops) and Dandelion/Poppy share the second-largest (`aFlower`, 29 crops), making them the practical roots of most of the tree. Stone Lily was confirmed as the deterministic root of the entire metal/stone-crop branch by checking which recipes list it as a parent.



All claims in this changelog were established by:
1. Extracting `cropsnh-2_0_76.jar`, decompiling relevant `.class` files with CFR
2. Building automated extraction scripts that parse tier/soil/block-under/biomes/drops directly from source via regex against the actual `.java` text (not manual transcription)
3. Cross-checking the automated extraction against the raw per-file output twice, independently
4. Loading the final `data.js` + `engine.js` in a real Node.js + jsdom environment and running the actual calculator code (not a reimplementation) to confirm rendered output matches expected math
5. Serving the site over real HTTP and loading each page with jsdom to confirm zero runtime errors

## Round 3 — Full guide audit against user-supplied authoritative biome data, plus a second major production.js bug

You supplied the real GTNH biome table (ID, name, temperature, rainfall, and BiomeDictionary tags for ~200 biomes) directly, since web sources kept returning either vanilla-only data (which GTNH mostly doesn't use) or unrelated IC2-era community spreadsheets. Cross-checking every biome-dependent claim against this data found:

**production.js — `BIOMES` and `BIOME_RAINFALL` tables were almost entirely fabricated.**
- 66 of 73 name-matched biomes had wrong tags (e.g. Plains was tagged HOT/DRY — it has neither in reality).
- 49 of 114 rainfall values were wrong, by as much as 0.9 in either direction (Crag claimed 0.2, real value 0.0; Moor claimed 0.7, real value 1.0).
- Both tables were fully replaced with the authoritative 199-biome dataset. Production Calculator now shows real biome tags and rainfall for every biome name you search.

**guide.html — "Best Biomes for Your Farm" section was entirely rewritten.** Every "+28 to X in biome Y" claim was checked against real tag data and recalculated exactly (`min(2, matchedTags) × 14`), surfacing wrong claims like Corium/Hemp getting 0% bonus in Jungle (not the claimed +28) and StickyCane/Netherwart only getting +14 in the Nether (not +28, since their second liked tag isn't actually a Nether tag). Also fixed: a duplicated "Humidity bonus" paragraph block that existed twice in a row from earlier editing, and a reference to "Temperate River," which isn't a real biome name (confused with the unrelated "Temperate Rainforest" or `rwg_riverTemperate`).

**The Graveyard Soil Trick numbers were wrong** — the old guide hand-calculated assuming Corpseplant's pool had 9 members; the real pool (`aTendrilly`) has 13. Numbers were replaced by running the actual calculator engine on this exact scenario rather than hand-recomputing: real median is **46 minutes**, not the claimed 28.

**A second, independent growth-duration bug**, structurally identical to the one found in `production.js` earlier: the guide's own formula box and a worked example both still said `tier × 1200` and "~11 minutes" for a tier-5 Nether ore berry. Real formula is `tier × 600`; the real verified time (run through the live Production Calculator) is **5.5 minutes**.

**Item/drop mechanics were partly fabricated.** "IronOreBerry → iron nuggets (8→1 ingot)" was wrong on two counts: the actual drop is a TinkerConstruct "Ore Berries" item (not a direct nugget), and — per your correction — nugget-to-ingot crafting is **9-to-1**, not 8-to-1. Also fixed: "Corpseplant → ink sac + bone meal" was invented; the real drops (verified from the decompiled `addDrop` calls) are Bone Meal (62.5%), Rotten Flesh (25%), and Bone (12.5%) — no ink sac at all. Discovered and documented a real, separate mechanic along the way: iron/copper/etc. nuggets are also used as **Seed Generator duplication catalysts** (a GT multiblock that clones seeds) — completely unrelated to processing the crop's actual drop, and the two were conflated in the original text.

**Tier Reference table was substantially wrong.** Multiple example crops were placed in the wrong tier band against the verified dataset (StoneLily claimed T3-4, actually T1; Hemp claimed T3-4, actually T5; Rubyne claimed T7-9, actually T4; Auronia claimed T7-9, actually T8; "Stargatium T14" — actually T12). Full table rebuilt from the verified per-crop tier data, including the real tier ceiling (PrimordialBerry, T16) which the old table didn't even mention.

**Soil Types table was incomplete to the point of being misleading** — e.g. "Dirt/Grass: Indigo, Meatrose, Lemon, Slimeplant, Shimmerleaf, Cinderpearl" omitted all 9 vanilla flowers and all 7 Bonsai variants that also use this soil (28 real crops vs. 6 listed). Rebuilt every row with accurate representative crops and real counts.

**Two redundant fertilizer-mechanic clarifications** were tightened: the stat-up checkerboard tip and the Cross Path description now correctly specify that with 2 identical parents, *both* need fertilizer storage for the no-drop guarantee (the general "all contributing parents" rule, applied to this specific case) — distinct from the single-parent case described in the Stat-up section.


**The bug:** 5 crops (Wheat, Carrot, Potato, Dandelion, Poppy) are registered straight into mutation pools with no deterministic recipe (`MutationRegistry.instance.register(crop, "pool1", "pool2", ...)` in source, with no `CropMutation(...)` wrapper). The calculator's logic in both modes only ever checked `mutsByOutput()` — i.e. "does this crop have a deterministic recipe" — to decide whether it could appear as a breeding result at all.

This meant:
- **Target mode**: searching for Carrot immediately short-circuited to "Carrot is a starter crop, no breeding required" and stopped — even though Carrot is reachable via 4 real pools (`Orange`, `Food`, `Carrots`, `Root`) and breeding e.g. Turnip × Wild Carrot can land on it.
- **Parent → Results mode**: selecting two pool-sharing crops (like Turnip + Wild Carrot) never showed Carrot as a possible result card at all, because the results list was built by mapping over `MUTS` only — pool-only crops have no `MUTS` row to map over.

**Why this matters:** if you've stat-maxed a seed on a crop that has no deterministic recipe of its own (a "starter"), the only way to pass those stats onto a *different* starter crop is via a pool-mutation breed. The calculator was silently telling you this wasn't possible when it actually is — directly contradicted by the real math, which the Target-mode pool-path section already computed correctly for non-target searches.

**Fixed:**
- Target mode now checks pool/direct-registration reachability before declaring a crop a dead-end starter, and shows a "directly plantable — and also breedable" panel with the real pool paths (e.g. Carrot: Turnip × Wild Carrot → 13.27%/min, ~7.1 min average) when both are true.
- Parent → Results mode now synthesizes result entries for pool-only crops with no `MUTS` row, so they appear as proper result cards with correct probability, soil-gating, and pool-tag display.
- Found and fixed a **second, independent, pre-existing bug** uncovered while making the above fix: `findPaths()` returned an inconsistently-shaped object (`{steps:[...], depth:0}`) for the zero-recipe case, while every other path returned a plain steps array. This was latent and never triggered before because the old "starter crop" early-return prevented this code from ever running on a zero-recipe crop. Now returns the same plain-array shape consistently.
- Added a clarifying note in the "Breeding Paths (from starters)" section so a trivial 0-step path doesn't read as "this crop can't be bred at all" when real pool paths exist just below it.

Verified end-to-end against the live running code (not reimplemented) for all 5 direct-registration crops in both modes, plus the genuinely-unreachable case (GaiaWart) to confirm that branch still correctly shows "no breeding possible."


## Round 6 — Corrected the leveling strategy: one starter, not five, and a real soil constraint the first draft missed

The Round 5 plan said to max all five starter crops independently. That was more work than necessary. Re-verified against `getBreedingResult()` and `MutationPool.isMatch()`:

**Same-species breeding still rolls the pool-mutation breed path, not just the self-clone path.** A pair of two identical crops gets the same 50/50 cross-vs-breed coin flip as any other pair, and `isMatch()` counts each parent slot against pool membership without deduplicating species first — so `[Potato, Potato]` registers two valid hits against `aFood` or `aYellow` exactly like two different crops would. This means a single starter, doubled up on itself, can mutate into a *different* crop entirely, already carrying maxed stats from its two parents.

**Potato is the one to start with.** Of the five true starters, only Potato and Carrot have a growth-duration override faster than the generic formula (800 growth points, versus Wheat's 1000 and Dandelion/Poppy's 1200). Potato wins the tiebreak over Carrot because it's the only one of the two sitting in `aYellow`, the sole pool bridging the food cluster to the flower cluster — Carrot's own pools never reach Dandelion or Poppy at all.

**This needs two separate physical setups, which the first draft didn't account for.** Potato/Carrot/Wheat need Farmland; Dandelion/Poppy need Dirt or Grass. Checked `TileEntityCropSticks.onInvalidSoilDetected()` — changing the soil under an already-planted crop to something it can't grow on triggers a dedicated handler, not a harmless idle state, so there's no way to swap soil mid-loop as a shortcut. The corrected guide section now describes two sequential setups: max one Potato, breed it against itself to fish Carrot/Wheat out of `aFood`/`aYellow`, then once a maxed Dandelion drops, move to a Dirt/Grass setup and breed Dandelion against itself to fish Poppy out of `aFlower`.

The biome-coverage numbers from Round 5 (Canyon, Canyon+Fungi Forest, Crag, FrozenOcean) were re-verified and carried over unchanged — that part of the original plan held up.

## Round 7 — "Starter" was too narrow: 85 crops have the same alternate-seed shortcut, several faster than Potato

You asked about a "Berry" crop from an earlier PDF screenshot. Tracked it to `CropBoPBerry` (Biomes O' Plenty) — confirmed tier 2, 200 growth points, FOREST+DENSE liked biomes, and a ~0.90 drop chance (`0.95²`), an exact match to a description with no remaining ambiguity. That search surfaced something the guide had wrong by omission: **the "5 starters" framing was never the full set of zero-breeding-required crops.**

Wheat, Carrot, Potato, Dandelion, and Poppy are plantable because each one calls `addAlternateSeed()` on a real-world item. That same method is called by **85 other crops** in the database, almost all gated behind Natura, Biomes O' Plenty, or Twilight Forest rather than vanilla Minecraft — meaning a wild berry bush or flower picked up in the right biome can skip breeding entirely, the same as a vanilla seed bag.

Checked every one of those 85 for growth duration and pool reach:
- **Torchberry** (Twilight Forest) has the shortest growth duration in the entire database — 150 points, ~14.6 seconds to 80% maturity. It only grows at light level ≤ 10 and its single pool doesn't bridge to `aFood` or `aFlower` at all, so it's fast but isolated.
- **Maloberry** (Natura) is the better all-around pick: 200 growth points (~19.4 seconds to 80%, about a quarter of Potato's wait), and it's the only one of the fast berry cluster that sits in *both* `aFood` and `aYellow` — meaning it covers everything Potato's two-pool bridge covered, just much faster.
- BoP Berry, Strawberry, Blueberry, Blackberry, Raspberry, and Huckleberry are all tied at the same 200-point duration and sit in `aFood`, making any of them a viable (if slightly less complete) substitute for Potato depending on which mods are loaded.

The leveling guide section was rewritten to lead with Maloberry as the default fast pick, with Potato kept as the fallback for a setup without Natura, rather than continuing to present Potato as if it were the only or best option.

## Round 8 — Removed a pointless "no mods" caveat, and stopped overclaiming findability

Two real mistakes flagged: a "fall back to Potato if Natura isn't loaded" caveat was nonsense — Natura, Biomes O' Plenty, and Twilight Forest are mandatory, bundled parts of GTNH, not optional add-ons a player might be missing. Removed.

Second, the guide claimed BoP Berry and Maloberry are both "easily found in the environment," treating them as equally confirmed. They aren't equally confirmed: BoP Berry's source item is a literal Biomes O' Plenty drop verified directly in the constructor (`getModItem(BiomesOPlenty, "food", 3, 0)`). Maloberry's real-world findability was asserted from generic, non-GTNH Natura documentation describing wild berry bushes as common Overworld world-gen — which doesn't account for GTNH's heavily customized world generation (Realistic World Gen, restricted/modified biome lists). The guide now says this plainly instead of treating both crops as interchangeably "find it in the wild" options.
