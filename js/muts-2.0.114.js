// CropsNH 2.0.114 deterministic-recipe corrections.
// From MutationLoader.java (CFR 0.152). Must load after data.js and before engine.js
// so STARTERS / NO_RECIPE are built from the patched MUTS list.
(function () {
  if (typeof MUTS === 'undefined') return;

  function key(m) {
    return m.out + '|' + (m.par || []).slice().sort().join('+');
  }

  var drop = {
    'Poppy|BlueOrchid+Waterlily': true,
    'PurpleGlowshroom|BlueGlowshroom+BlueOrchid+Glowflower': true,
    'VoidOreBerry|GoldOreBerry+StoneLily+ThaumiumOreBerry': true
  };
  for (var i = MUTS.length - 1; i >= 0; i--) {
    if (drop[key(MUTS[i])]) MUTS.splice(i, 1);
  }

  function hasOutPar(out, pars) {
    var want = pars.slice().sort().join('+');
    return MUTS.some(function (m) {
      return m.out === out && (m.par || []).slice().sort().join('+') === want;
    });
  }

  function add(out, par) {
    if (!hasOutPar(out, par)) MUTS.push({ out: out, par: par });
  }

  add('BlueGlowshroom', ['BlueOrchid', 'Glowflower']);
  add('PurpleGlowshroom', ['Indigo', 'Glowflower']);
  add('ThaumiumOreBerry', ['StoneLily', 'GoldOreBerry']);
  add('VoidOreBerry', ['ThaumiumOreBerry', 'GoldOreBerry']);
})();
