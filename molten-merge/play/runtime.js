// Molten Merge - the Android stand-in for the TikTok runtime, so game/game.js runs unchanged in a WebView.
// (c) 2026 TECHNOTOUCH METALS TRADING L.L.C. All rights reserved.
// TikTok-only features (ads, login, shortcuts) are left out on purpose: the game hides them when absent.
(function () {
  const stage = document.getElementById('stage');
  const listeners = { start: [], move: [], end: [], show: [], hide: [], resize: [] };
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const mixer = AudioCtx ? new AudioCtx() : null;
  const decoded = {};
  let onScreen = false;

  function decode(path) {
    if (!decoded[path]) {
      const raw = atob(window.MOLTEN_SOUNDS[path]);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      decoded[path] = mixer.decodeAudioData(bytes.buffer);
    }
    return decoded[path];
  }

  function createSound() {
    let path = '', loop = false, volume = 1, voice = null, serial = 0;
    const sound = {
      set src(v) { path = v; },
      set loop(v) { loop = v; },
      set volume(v) { volume = v; },
      play() {
        if (!mixer) return;
        sound.stop();
        const ticket = ++serial;
        mixer.resume();
        decode(path).then((buffer) => {
          if (ticket !== serial) return;
          const gain = mixer.createGain();
          gain.gain.value = volume;
          gain.connect(mixer.destination);
          voice = mixer.createBufferSource();
          voice.buffer = buffer;
          voice.loop = loop;
          voice.connect(gain);
          voice.start();
        }).catch(() => {});
      },
      pause() { sound.stop(); },
      stop() {
        serial++;
        if (voice) { try { voice.stop(); } catch (e) { /* already ended */ } voice = null; }
      },
    };
    return sound;
  }

  window.tt = {
    createCanvas() {
      const canvas = document.createElement('canvas');
      if (!onScreen) { onScreen = true; stage.appendChild(canvas); }
      return canvas;
    },
    getSystemInfoSync() {
      const h = window.innerHeight;
      return {
        windowWidth: window.innerWidth, windowHeight: h, pixelRatio: window.devicePixelRatio || 2,
        language: navigator.language, safeArea: { top: 0, bottom: h }, statusBarHeight: 0,
      };
    },
    // There is no TikTok capsule here, and the Activity already keeps the WebView inside the safe area.
    getMenuButtonBoundingClientRect: () => ({ bottom: 6 }),
    onTouchStart: (f) => listeners.start.push(f),
    onTouchMove: (f) => listeners.move.push(f),
    onTouchEnd: (f) => listeners.end.push(f),
    onTouchCancel() {},
    onShow: (f) => listeners.show.push(f),
    onHide: (f) => listeners.hide.push(f),
    onWindowResize: (f) => listeners.resize.push(f),
    getStorageSync(key) {
      try { return localStorage.getItem(key) || ''; } catch (e) { return ''; }
    },
    setStorageSync(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* play without persistence */ }
    },
    createInnerAudioContext: createSound,
  };

  const asTouch = (e) => ({ clientX: e.clientX, clientY: e.clientY });
  let active = false;
  stage.addEventListener('pointerdown', (e) => {
    active = true;
    const t = asTouch(e);
    listeners.start.forEach((f) => f({ touches: [t], changedTouches: [t] }));
  });
  window.addEventListener('pointermove', (e) => {
    if (!active) return;
    const t = asTouch(e);
    listeners.move.forEach((f) => f({ touches: [t], changedTouches: [t] }));
  });
  const release = (e) => {
    if (!active) return;
    active = false;
    const t = asTouch(e);
    listeners.end.forEach((f) => f({ touches: [], changedTouches: [t] }));
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('resize', () => listeners.resize.forEach((f) => f()));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      listeners.hide.forEach((f) => f());
      if (mixer) mixer.suspend();
    } else {
      if (mixer) mixer.resume();
      listeners.show.forEach((f) => f());
    }
  });

  // The WebView can report a zero size until its first layout, so the game waits for a real one.
  (function boot() {
    if (window.innerWidth > 0 && window.innerHeight > 0) {
      const script = document.createElement('script');
      script.src = 'game.js';
      document.body.appendChild(script);
    } else requestAnimationFrame(boot);
  }());
}());
