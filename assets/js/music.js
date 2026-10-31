/* Wedding music — user-provided MP3; respects browser user-gesture rules. */
(function () {
  'use strict';
  var audio = new Audio(new URL('assets/audio/wedding-song.mp3', document.baseURI).href);
  audio.loop = true;
  audio.preload = 'none';
  var volume = 0.65;
  audio.volume = volume;
  var resumeAfterVisibility = false;

  function notify() { document.dispatchEvent(new Event('weddingmusicchange')); }
  audio.addEventListener('play', notify);
  audio.addEventListener('pause', notify);
  audio.addEventListener('ended', notify);
  audio.addEventListener('error', notify);

  function play() {
    try {
      var promise = audio.play();
      return Promise.resolve(promise).then(function () { return !audio.paused; }, function () { return false; });
    } catch (e) { return Promise.resolve(false); }
  }
  function pause() { audio.pause(); resumeAfterVisibility = false; }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && !audio.paused) {
      resumeAfterVisibility = true;
      audio.pause();
    } else if (!document.hidden && resumeAfterVisibility) {
      resumeAfterVisibility = false;
      play();
    }
  });
  window.WeddingMusic = {
    play: play,
    pause: pause,
    toggle: function () {
      if (audio.paused) return play();
      pause();
      return Promise.resolve(false);
    },
    setVolume: function (v) {
      volume = Math.min(1, Math.max(0, Number(v) || 0));
      audio.volume = volume;
    },
    get playing() { return !audio.paused; }
  };
})();
