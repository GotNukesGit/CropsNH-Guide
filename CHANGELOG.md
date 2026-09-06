# CropsNH Site — Source Verification Audit

## September 6, 2026 — Resync to `cropsnh-2.0.114.jar`

Verified by decompiling first-party classes from the user-supplied `cropsnh-2.0.91.jar` and `cropsnh-2.0.114.jar` with CFR 0.152. The `com.gtnewhorizon.cropsnh.shadow` tree was excluded as third-party. No IC2 crop tables, community spreadsheets, or GitHub release notes were used as sources for the data edits below.

### What did not change (re-checked in 2.0.114 crop classes)

- Same 182 crop source files / 181 `CropsNHCrops` entries / 172 deterministic `CropMutation` constructors / 158 pool-registered crops.
- Extracted `getTier`, `getGrowthDuration`, `addDrop`, soil type, sub-soil type, liked biomes, duplication catalysts: **identical** after the `blockUnder` → `subSoil` rename, except Thornvine.

### `js/data.js` pool membership (from `MutationLoader.java` 2.0.114)

Tag strings mapped with this file's existing convention (`food`→`EDIBLE`, `metal`→`METALLIC`, `crystal`→`CRYSTALLINE`, `ingredient`→`POTION_INGREDIENT`, `light`→`EMISSIVE`, `fire`→`FIERY`, `danger`→`DANGEROUS`, `water`→`WATERY`, `magic`→`MAGICAL`, `poison`→`POISONOUS`, `wood`→`WOODEN`). New source tag `void` stored as pool id `VOID` (Enderbloom only) — not assumed to be `VOID_TOUCHED`.

Crops whose pool lists changed:

- **Plumbilia:** dropped `REED`, added `PURPLE` + `TENDRILLY`.
- **Sapphirum:** dropped `METALLIC`, added `BLUE`.
- **Corium:** `COW`/`SILK`/`TENDRILLY` → `BROWN`/`COW`/`MUSHROOM`.
- **EggPlant:** dropped `FLOWER`, added `WHITE`/`MUSHROOM`.
- **Enderbloom:** dropped `SHINY`, added `BLACK`/`VOID`.
- **Slimeplant:** dropped `BUSH`, added `TREE`/`LEAFY`.
- **Tine:** dropped `BUSH`, added `GRAY`/`STEM`/`WOODEN`.
- **Withereed:** dropped `STEM`, added `BLACK`.
- **Corpseplant:** dropped `TENDRILLY`, added `BUSH`/`ADDICTIVE`.
- Added-only color/theme tags: Blazereed `ORANGE`; Creeperweed `GREEN`; Glowheat `YELLOW`+`NETHER`; Goldfish `ORANGE`+`STEM`; Meatrose `RED`; MilkWart `WHITE`; Nickelback `GRAY`; Pyrolusium `RED`.

`POOL_MAP` and `CROP_POOLS` rebuilt from the updated `CROPS[]` arrays so calculator math uses the new membership.

### Guide copy that had to change because the pools changed

- Corium × Corium on graveyard soil is **no longer** a single-result filter. Zomplant is in `BROWN` with Corium, so both Corpseplant and Zomplant can land. Old numeric wait times (28 min / 46 min) removed rather than re-invented.
- In-game / API wording: y−2 requirement is **sub-soil** (`SubSoilRequirement`). Data field name `blockUnder` kept so `engine.js` / `production.js` keep working.

### Other 2.0.114 facts written only where the class text is explicit

- **Thornvine:** `getEntityDamage()` returns `1.0f` (absent in 2.0.91).
- **Gaia Wart item:** no longer extends `ItemFood`; eat action duration 32; potion-clear list unchanged; if IC2 loaded, `reduceRadiationTimer(player, 600)`.
- **Industrial Farm:** `onScrewdriverRightClick` cycles `machineMode`; Seed Bed `getBaseEUt(tier) = GTValues.VP[tier]`.
- **Boot protection:** items and handler types listed from `BootProtectionLoader.java` only.
- Display name **Bamboo Shoot** from `en_US.lang` key `cropsnh_crops.bamboo`.

### Deliberately not changed

- Deterministic parent lists in `MUTS[]` (172 constructors matched).
- Biome tables, growth-duration numbers, drop chances in `production.js` (those fields did not change in crop classes).
- Weed / Resistance / fertilizer-stat rules (not re-audited this pass beyond noting they were not in the 91→114 crop-data diff).
- Any IC2-era crop name, drop, or tier that is not present in these two CropsNH jars.

---

Prior verification rounds (2.0.76 through 2.0.91) remain in git history on this file before this commit.
