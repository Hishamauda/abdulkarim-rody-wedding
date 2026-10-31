/* =====================================================================
   Original ambient music, synthesised live with the Web Audio API.
   No audio files and no third-party recordings: a gentle harp/music-box
   arpeggio in D major (I–vi–IV–V…) with a soft pad and a bell melody.
   Starts only after a guest interaction (the "open invitation" tap or
   the music button). Pauses automatically when the tab is hidden.
   ===================================================================== */
(function () {
  'use strict';
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { window.WeddingMusic = null; return; }

  var BPM = 64, BEAT = 60 / BPM, EIGHTH = BEAT / 2;
  var CHORDS = {
    D:  [50, 57, 62, 66, 69, 74],
    Bm: [47, 54, 59, 62, 66, 71],
    G:  [43, 50, 55, 59, 62, 67],
    A:  [45, 52, 57, 61, 64, 69],
    Fm: [42, 49, 54, 57, 61, 66]   // F# minor
  };
  var BARS = ['D', 'Bm', 'G', 'A', 'D', 'Fm', 'G', 'A'];
  var MELODY = [
    [[0, 78, 2], [2, 81, 1], [3, 78, 1]],
    [[0, 74, 3], [3, 78, 1]],
    [[0, 79, 2], [2, 78, 1], [3, 76, 1]],
    [[0, 76, 2], [2, 69, 2]],
    [[0, 78, 1.5], [1.5, 76, 0.5], [2, 74, 2]],
    [[0, 73, 2], [2, 69, 2]],
    [[0, 71, 2], [2, 74, 2]],
    [[0, 76, 3], [3, 73, 1]]
  ];
  var ARP = [0, 1, 2, 3, 4, 3, 2, 1];

  var ctx = null, master = null, dry = null, wet = null, timer = null;
  var step = 0, nextTime = 0, playing = false, volume = 0.22;

  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function impulse(seconds) {
    var rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    var buf = ctx.createBuffer(2, len, rate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return buf;
  }

  function setup() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.02; comp.release.value = 0.4;
    var tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 3600;
    dry = ctx.createGain(); dry.gain.value = 0.72;
    wet = ctx.createGain(); wet.gain.value = 0.42;
    var verb = ctx.createConvolver(); verb.buffer = impulse(3.4);
    dry.connect(tone); wet.connect(verb); verb.connect(tone);
    tone.connect(master); master.connect(comp); comp.connect(ctx.destination);
  }

  function voice(t, midi, gain, decay, partials) {
    var out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    out.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    out.connect(dry); out.connect(wet);
    partials.forEach(function (p) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = p[2] || 'sine';
      o.frequency.value = hz(midi) * p[0];
      g.gain.value = p[1];
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + decay + 0.05);
    });
  }

  function pad(t, chord, dur) {
    var out = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 900;
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(0.035, t + 1.4);
    out.gain.setValueAtTime(0.035, t + dur - 0.6);
    out.gain.linearRampToValueAtTime(0.0001, t + dur + 0.8);
    lp.connect(out); out.connect(dry); out.connect(wet);
    [chord[1], chord[2], chord[3]].forEach(function (m, i) {
      [-4, 4].forEach(function (cents) {
        var o = ctx.createOscillator();
        o.type = i === 0 ? 'triangle' : 'sine';
        o.frequency.value = hz(m); o.detune.value = cents;
        o.connect(lp); o.start(t); o.stop(t + dur + 1);
      });
    });
  }

  function schedule() {
    while (nextTime < ctx.currentTime + 0.15) {
      var bar = Math.floor(step / 8) % BARS.length, pos = step % 8;
      var chord = CHORDS[BARS[bar]];
      var accent = pos === 0 ? 1 : (pos === 4 ? 0.8 : 0.62);
      voice(nextTime, chord[ARP[pos]] + (pos === 0 ? 0 : 12), 0.05 * accent, 2.6,
            [[1, 1], [2, 0.22], [3, 0.06, 'triangle']]);
      if (pos === 0) {
        pad(nextTime, chord, BEAT * 4);
        MELODY[bar].forEach(function (n) {
          voice(nextTime + n[0] * BEAT, n[1], 0.06, 3.2 + n[2] * 0.5, [[1, 1], [2.002, 0.28], [3.01, 0.1], [4.2, 0.03]]);
        });
      }
      nextTime += EIGHTH; step++;
    }
  }

  function play() {
    if (!ctx) setup();
    if (ctx.state === 'suspended') ctx.resume();
    if (playing) return Promise.resolve(true);
    playing = true;
    nextTime = ctx.currentTime + 0.08;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
    master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2.6);
    timer = setInterval(schedule, 30);
    schedule();
    return Promise.resolve(true);
  }

  function pause() {
    if (!ctx || !playing) return;
    playing = false;
    clearInterval(timer); timer = null;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0.0001, t + 0.7);
    setTimeout(function () { if (!playing && ctx) ctx.suspend(); }, 900);
  }

  var resumeOnShow = false;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && playing) { resumeOnShow = true; pause(); }
    else if (!document.hidden && resumeOnShow) { resumeOnShow = false; play(); }
  });

  window.WeddingMusic = {
    play: play, pause: pause,
    toggle: function () { if (playing) { pause(); return false; } play(); return true; },
    setVolume: function (v) { volume = v; },
    get playing() { return playing; }
  };
})();
