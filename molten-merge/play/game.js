// MOLTEN MERGE
// (c) 2026 TECHNOTOUCH METALS TRADING L.L.C. All rights reserved.
// Entry point for the TikTok Mini Games native runtime. Every asset is generated in code.
'use strict';

// ---------------------------------------------------------------- configuration
// Fill these in from the TikTok Developer Portal before uploading.
const CONFIG = {
  version: '1.0.0',
  company: 'TECHNOTOUCH METALS TRADING L.L.C',
  rewardedAdUnitId: '',  // In-App Ads > rewarded ad unit id
  loginBackendUrl: '',   // optional: your server that exchanges the login code for an open_id
};

// ---------------------------------------------------------------- platform
const TT = (typeof TTMinis !== 'undefined' && TTMinis.game) ? TTMinis.game : tt;
const PREVIEW = typeof globalThis !== 'undefined' && !!globalThis.MOLTEN_PREVIEW;
const canUse = (name) => {
  if (typeof TT[name] !== 'function') return false;
  try { return TT.canIUse ? TT.canIUse(name) !== false : true; } catch (e) { return true; }
};
const raf = typeof requestAnimationFrame === 'function'
  ? (fn) => requestAnimationFrame(fn)
  : (TT.requestAnimationFrame ? (fn) => TT.requestAnimationFrame(fn) : (fn) => setTimeout(fn, 16));

const canvas = TT.createCanvas(); // the first canvas is the on-screen one
const ctx = canvas.getContext('2d');

// ---------------------------------------------------------------- data
const METALS = [
  { sym: 'Al', en: 'Aluminum', ar: 'ألمنيوم', hi: '#f2f7fc', mid: '#b4c4d4', lo: '#5d6f82', ink: '#27323e' },
  { sym: 'Zn', en: 'Zinc', ar: 'زنك', hi: '#c8f2ea', mid: '#5fb8ad', lo: '#1f6660', ink: '#0d3431' },
  { sym: 'Cu', en: 'Copper', ar: 'نحاس', hi: '#ffc79c', mid: '#e27a3c', lo: '#7d3210', ink: '#451a06' },
  { sym: 'Ni', en: 'Nickel', ar: 'نيكل', hi: '#e2f6b8', mid: '#93c455', lo: '#44701f', ink: '#22390d' },
  { sym: 'Sn', en: 'Tin', ar: 'قصدير', hi: '#e5dcff', mid: '#a58fe0', lo: '#4f3d94', ink: '#261a55' },
  { sym: 'Co', en: 'Cobalt', ar: 'كوبالت', hi: '#b8d8ff', mid: '#3b7fe6', lo: '#123a8c', ink: '#ffffff' },
  { sym: 'Ag', en: 'Silver', ar: 'فضة', hi: '#ffffff', mid: '#dbe3ec', lo: '#8496a8', ink: '#2c3946' },
  { sym: 'Ti', en: 'Titanium', ar: 'تيتانيوم', hi: '#f6c6ff', mid: '#b950d0', lo: '#5a1a70', ink: '#ffffff' },
  { sym: 'Au', en: 'Gold', ar: 'ذهب', hi: '#fff4b0', mid: '#ffc628', lo: '#a06a00', ink: '#5a3a00' },
  { sym: 'Pt', en: 'Platinum', ar: 'بلاتين', hi: '#ffffff', mid: '#bff3ff', lo: '#4d8fb8', ink: '#123a52' },
];
const MAX_TIER = METALS.length - 1;
const WILD = METALS.length; // the Catalyst: upgrades any metal it touches
const CATALYST = { sym: '', hi: '#ffffff', mid: '#ff5fd2', lo: '#5a2bd8', ink: '#ffffff' };
const RADII = [0.05, 0.064, 0.08, 0.098, 0.118, 0.142, 0.168, 0.198, 0.232, 0.27, 0.074];
const FACTS = {
  en: ['', '', 'Carries electricity in almost every home', 'A key ingredient of stainless steel', 'Coats food cans against corrosion',
    'Gives glass a deep blue color', 'The best electrical conductor of all metals', 'As strong as steel at nearly half the weight',
    'Never rusts or tarnishes', 'Cleans car exhaust in catalytic converters'],
  ar: ['', '', 'ينقل الكهرباء في كل بيت تقريبًا', 'مكوّن أساسي في الفولاذ المقاوم للصدأ', 'يغلّف علب الطعام ليحميها من التآكل',
    'يمنح الزجاج لونًا أزرق عميقًا', 'أفضل المعادن توصيلًا للكهرباء', 'بقوة الفولاذ وبنصف وزنه تقريبًا',
    'لا يصدأ ولا يفقد بريقه', 'ينقّي عوادم السيارات في المحوّلات الحفّازة'],
};
const RANKS = [[60000, 'Forge Legend', 'أسطورة الفرن'], [20000, 'Master Smith', 'معلّم حدادة'], [5000, 'Smith', 'حدّاد'], [0, 'Apprentice', 'متدرّب']];
const DROP_WEIGHTS = [34, 28, 20, 12, 6];

const TEXT = {
  en: {
    play: 'PLAY', best: 'BEST', score: 'SCORE', next: 'NEXT', order: 'ORDER', drops: 'drops',
    forge: (n, m) => `Forge ${n} ${m}`, hot: 'HOT', melt: 'MELT', heat: 'Heating...', pause: 'PAUSED',
    resume: 'RESUME', restart: 'RESTART', menu: 'MENU', over: 'CRUCIBLE FULL', again: 'PLAY AGAIN',
    revive: 'WATCH AD TO REVIVE', record: 'NEW RECORD!', top: 'Best metal', about: 'ABOUT', back: 'BACK',
    sound: 'Sound', music: 'Music', on: 'ON', off: 'OFF', lang: 'العربية', tag: 'Drop. Fuse. Forge platinum.',
    howAim: 'Drag to aim, release to drop', howFuse: 'Two identical metals fuse into a rarer one',
    orderDone: 'ORDER COMPLETE!', orderLost: 'Order expired', hotNow: (m) => `${m} is HOT: double points`,
    combo: (n) => `COMBO x${n}`, pure: 'PURE PLATINUM!', adFail: 'Ad not available, try later',
    shortcut: 'Add to Home: +1 Melt', profile: 'Visit Profile: +1 Melt', gift: '+1 Free Melt!', noGift: 'Reward already claimed',
    presents: 'presents', collection: 'Forged', rights: 'All rights reserved.',
    swap: 'SWAP', catalyst: 'Catalyst incoming: it upgrades any metal!', adCat: 'AD: Catalyst', newMetal: (m) => `NEW METAL: ${m}`,
    daily: (m) => `Daily: forge ${m}`, dailyDone: (n) => `Daily complete! Streak: ${n}`, dailyWin: 'DAILY COMPLETE: +1 Melt', rank: 'Rank',
    aboutBody: 'Molten Merge is an original game created and owned by TECHNOTOUCH METALS TRADING L.L.C. Points have no cash value.',
  },
  ar: {
    play: 'العب', best: 'الأفضل', score: 'النقاط', next: 'التالي', order: 'طلبية', drops: 'إسقاط',
    forge: (n, m) => `اصنع ${n} ${m}`, hot: 'رائج', melt: 'صهر', heat: 'يسخن...', pause: 'إيقاف مؤقت',
    resume: 'متابعة', restart: 'إعادة', menu: 'القائمة', over: 'امتلأت البوتقة', again: 'العب مجددًا',
    revive: 'شاهد إعلانًا للاستمرار', record: 'رقم قياسي جديد!', top: 'أفضل معدن', about: 'حول اللعبة', back: 'رجوع',
    sound: 'المؤثرات', music: 'الموسيقى', on: 'تشغيل', off: 'إيقاف', lang: 'English', tag: 'أسقط. ادمج. اصنع البلاتين.',
    howAim: 'اسحب للتصويب وارفع إصبعك للإسقاط', howFuse: 'كل معدنين متطابقين يندمجان في معدن أندر',
    orderDone: 'اكتملت الطلبية!', orderLost: 'انتهت الطلبية', hotNow: (m) => `${m} رائج: نقاط مضاعفة`,
    combo: (n) => `سلسلة x${n}`, pure: 'بلاتين خالص!', adFail: 'الإعلان غير متاح الآن',
    shortcut: 'أضف للشاشة: +1 صهر', profile: 'زيارة الملف: +1 صهر', gift: '+1 صهر مجاني!', noGift: 'تم استلام المكافأة',
    presents: 'تقدّم', collection: 'المصنوع', rights: 'جميع الحقوق محفوظة.',
    swap: 'تبديل', catalyst: 'المحفّز قادم: يرقّي أي معدن!', adCat: 'إعلان: محفّز', newMetal: (m) => `معدن جديد: ${m}`,
    daily: (m) => `مهمة اليوم: اصنع ${m}`, dailyDone: (n) => `أنجزت مهمة اليوم! السلسلة: ${n}`, dailyWin: 'أنجزت المهمة: +1 صهر', rank: 'اللقب',
    aboutBody: 'Molten Merge لعبة أصلية من إنتاج وملكية TECHNOTOUCH METALS TRADING L.L.C. النقاط ليس لها أي قيمة نقدية.',
  },
};

// ---------------------------------------------------------------- save data
const SAVE_KEY = 'molten_merge_v1';
const save = { best: 0, tokens: 0, seen: 0, sound: true, music: true, lang: '', tutorial: false, dailyDay: 0, streak: 0 };

function applySave(raw) {
  if (!raw) return;
  try { Object.assign(save, typeof raw === 'string' ? JSON.parse(raw) : raw); } catch (e) { /* first run */ }
}
function loadSave() {
  try {
    if (TT.getStorageSync) { applySave(TT.getStorageSync(SAVE_KEY)); return; }
    if (TT.getStorage) TT.getStorage({ key: SAVE_KEY, success: (res) => applySave(res.data), fail: () => {} });
  } catch (e) { /* storage unavailable: play without persistence */ }
}
function persist() {
  const data = JSON.stringify(save);
  try {
    if (TT.setStorageSync) TT.setStorageSync(SAVE_KEY, data);
    else if (TT.setStorage) TT.setStorage({ key: SAVE_KEY, data, fail: () => {} });
  } catch (e) { /* storage unavailable */ }
}

// ---------------------------------------------------------------- audio
const audio = {
  pool: {}, bgm: null, started: false,
  sfx(name) {
    if (!save.sound || !TT.createInnerAudioContext) return;
    try {
      const list = this.pool[name] || (this.pool[name] = { i: 0, items: [] });
      if (list.items.length < 2) {
        const a = TT.createInnerAudioContext();
        a.src = `audio/${name}.wav`;
        a.volume = 0.8;
        list.items.push(a);
      }
      const a = list.items[list.i++ % list.items.length];
      a.stop();
      a.play();
    } catch (e) { /* sound is optional */ }
  },
  startBgm() {
    this.started = true;
    if (!save.music || !TT.createInnerAudioContext) return;
    try {
      if (!this.bgm) {
        this.bgm = TT.createInnerAudioContext();
        this.bgm.src = 'audio/bgm.wav';
        this.bgm.loop = true;
        this.bgm.volume = 0.45;
      }
      this.bgm.play();
    } catch (e) { /* sound is optional */ }
  },
  pauseBgm() {
    try { if (this.bgm) this.bgm.pause(); } catch (e) { /* sound is optional */ }
  },
};

// ---------------------------------------------------------------- layout
let W = 375, H = 667, DPR = 2, S = 1;
let hudY = 50, orderY = 100, boxX = 12, boxW = 350, boxTop = 260, boxBottom = 560, holdY = 200;
let bottomY = 570, safeBottom = 0;
const sprites = [];
let backdrop = null;

function layout() {
  const sys = TT.getSystemInfoSync();
  W = sys.windowWidth; H = sys.windowHeight;
  DPR = Math.min(sys.pixelRatio || 2, 3);
  S = Math.max(0.82, Math.min(1.3, W / 375));
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);

  const safeTop = (sys.safeArea && sys.safeArea.top) || sys.statusBarHeight || 0;
  safeBottom = sys.safeArea ? Math.max(0, sys.windowHeight - sys.safeArea.bottom) : 0;
  hudY = safeTop + 46; // the row above stays clear for the TikTok capsule button
  if (TT.getMenuButtonBoundingClientRect) {
    try {
      const rect = TT.getMenuButtonBoundingClientRect();
      if (rect && rect.bottom) hudY = rect.bottom + 8;
    } catch (e) { /* keep the default inset */ }
  }
  orderY = hudY + 50 * S;
  const zone = (W - 24) * 0.236 + 18;
  boxTop = orderY + 50 * S + zone;
  const reserved = safeBottom + 92 * S;
  boxBottom = H - reserved;
  boxW = Math.min(W - 24, (boxBottom - boxTop) * 0.86);
  boxX = (W - boxW) / 2;
  holdY = boxTop - boxW * RADII[4] - 8;
  bottomY = boxBottom + 8;
  buildSprites();
  buildBackdrop();
}

const radius = (tier) => RADII[tier] * boxW;

function makeLayer(w, h) {
  const layer = TT.createCanvas();
  layer.width = Math.ceil(w);
  layer.height = Math.ceil(h);
  return layer;
}

function buildSprites() {
  for (let t = 0; t <= WILD; t++) {
    const m = t === WILD ? CATALYST : METALS[t];
    const r = radius(t) * DPR;
    const size = r * 2 + 4;
    const layer = sprites[t] || (sprites[t] = makeLayer(size, size));
    layer.width = Math.ceil(size); layer.height = Math.ceil(size);
    const g = layer.getContext('2d');
    const c = size / 2;
    g.clearRect(0, 0, size, size);
    const body = g.createRadialGradient(c - r * 0.35, c - r * 0.42, r * 0.08, c, c, r);
    body.addColorStop(0, m.hi); body.addColorStop(0.55, m.mid); body.addColorStop(1, m.lo);
    g.fillStyle = body;
    g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.fill();
    // Forged rim and reflected light.
    g.lineWidth = Math.max(1, r * 0.05);
    g.strokeStyle = 'rgba(0,0,0,0.28)';
    g.beginPath(); g.arc(c, c, r - g.lineWidth / 2, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.3)';
    g.beginPath(); g.arc(c, c, r * 0.84, Math.PI * 0.15, Math.PI * 0.75); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.75)';
    g.beginPath(); g.ellipse(c - r * 0.36, c - r * 0.46, r * 0.26, r * 0.14, -0.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = m.ink;
    g.font = `800 ${Math.round(r * 0.78)}px sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(m.sym, c, c + r * 0.05);
    if (t === WILD) {
      g.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4, d = i % 2 ? r * 0.2 : r * 0.72;
        g.lineTo(c + Math.cos(a) * d, c + Math.sin(a) * d);
      }
      g.closePath();
      g.fill();
    }
  }
}

function buildBackdrop() {
  backdrop = backdrop || makeLayer(W * DPR, H * DPR);
  backdrop.width = Math.ceil(W * DPR); backdrop.height = Math.ceil(H * DPR);
  const g = backdrop.getContext('2d');
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#120b1e'); sky.addColorStop(0.6, '#1d0f1c'); sky.addColorStop(1, '#3a1409');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W / 2, H, 10, W / 2, H, H * 0.7);
  glow.addColorStop(0, 'rgba(255,110,30,0.42)'); glow.addColorStop(1, 'rgba(255,110,30,0)');
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- helpers
const T = (key) => TEXT[save.lang === 'ar' ? 'ar' : 'en'][key];
const metalName = (tier) => METALS[tier][save.lang === 'ar' ? 'ar' : 'en'];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const textDirection = (str) => (/[؀-ۿ]/.test(str) ? 'rtl' : 'ltr');
const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
const dailyTier = () => 5 + (today() % 3);
const rankName = (score) => RANKS.find((r) => score >= r[0])[save.lang === 'ar' ? 2 : 1];

function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(str, x, y, size, color, align, weight) {
  ctx.direction = textDirection(str);
  ctx.font = `${weight || 700} ${Math.round(size)}px sans-serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color || '#fff';
  ctx.fillText(str, x, y);
}

function fitText(str, x, y, size, maxW, color, align, weight) {
  ctx.font = `${weight || 700} ${Math.round(size)}px sans-serif`;
  const w = ctx.measureText(str).width;
  text(str, x, y, w > maxW ? size * maxW / w : size, color, align, weight);
}

function wrapText(str, x, y, maxW, size, lineH, color) {
  ctx.font = `500 ${Math.round(size)}px sans-serif`;
  let line = '';
  for (const word of str.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxW && line) {
      text(line, x, y, size, color, 'center', 500);
      y += lineH; line = word;
    } else line = next;
  }
  if (line) text(line, x, y, size, color, 'center', 500);
  return y + lineH;
}

function drawOrb(tier, x, y, r, angle) {
  const sprite = sprites[tier];
  const base = radius(tier);
  const d = (base * 2 + 4 / DPR) * (r / base);
  if (angle) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);
    ctx.drawImage(sprite, -d / 2, -d / 2, d, d);
    ctx.restore();
  } else ctx.drawImage(sprite, x - d / 2, y - d / 2, d, d);
}

// ---------------------------------------------------------------- game state
let screen = 'splash';
let screenTime = 0, clock = 0;
let orbs = [], sparks = [], rings = [], floats = [], embers = [];
let game = null;
let toast = null;
let banner = null;
let shake = 0;
let pointer = { down: false, aim: false, x: 0 };
let buttons = [];
let pressed = null;
let pendingEntrance = false;
let adBusy = false;

function newGame() {
  orbs = []; sparks = []; rings = []; floats = [];
  game = {
    score: 0, level: 1, heat: 0, topTier: 0, combo: 0, comboTime: 0,
    current: rollDrop(0), next: rollDrop(0), aimX: boxX + boxW / 2, cooldown: 0,
    overTime: 0, danger: 0, drops: 0, hot: -1, hotLeft: 9, order: null, revived: false,
    record: false, tutorial: !save.tutorial, grace: 0, shown: 0,
    swaps: 1, swapIn: 0, wildIn: pick(14, 20), adCats: 0,
  };
  newOrder();
}

function rollDrop(top) {
  const limit = top >= 5 ? 4 : top >= 3 ? 3 : 2;
  let total = 0;
  for (let i = 0; i <= limit; i++) total += DROP_WEIGHTS[i];
  let roll = Math.random() * total;
  for (let i = 0; i <= limit; i++) {
    roll -= DROP_WEIGHTS[i];
    if (roll <= 0) return i;
  }
  return 0;
}

function newOrder() {
  const high = clamp(game.topTier + 1, 2, 7);
  const tier = pick(Math.max(2, high - 2), high);
  const need = tier <= 3 ? pick(2, 3) : tier <= 5 ? pick(1, 2) : 1;
  game.order = {
    tier, need, got: 0,
    dropsLeft: need * (6 + tier * 3) + 6,
    reward: (tier + 1) * (tier + 1) * 20 * need,
  };
}

function addOrb(tier, x, y, vx, vy, grow) {
  const r = radius(tier);
  const orb = { tier, x, y, vx: vx || 0, vy: vy || 0, r: grow ? r * 0.6 : r, full: r, m: r * r, ang: rand(-0.4, 0.4), av: 0, age: 0, dead: false };
  orbs.push(orb);
  return orb;
}

function dropOrb() {
  const g = game;
  if (g.cooldown > 0) return;
  const r = radius(g.current);
  const x = clamp(g.aimX, boxX + r, boxX + boxW - r);
  addOrb(g.current, x, holdY, 0, 90);
  audio.sfx('drop');
  g.current = g.next;
  g.next = rollDrop(g.topTier);
  g.cooldown = 0.42;
  g.drops++;
  g.wildIn--;
  if (g.wildIn <= 0) {
    g.next = WILD;
    g.wildIn = pick(20, 30);
    showToast(T('catalyst'));
  }
  if (g.swaps === 0 && --g.swapIn <= 0) g.swaps = 1;
  if (g.tutorial) { g.tutorial = false; save.tutorial = true; persist(); }

  g.order.dropsLeft--;
  if (g.order.dropsLeft <= 0) {
    addFloat(W / 2, boxTop + 40, T('orderLost'), '#ffb4a2', 18);
    newOrder();
  }
  g.hotLeft--;
  if (g.hotLeft <= 0) {
    g.hot = pick(1, clamp(g.topTier, 2, 7));
    g.hotLeft = 16;
    showToast(T('hotNow')(metalName(g.hot)));
  }
}

function swapMetals() {
  const g = game;
  if (g.swaps <= 0) return;
  const held = g.current;
  g.current = g.next; g.next = held;
  g.swaps = 0; g.swapIn = 8;
}

function grantAdCatalyst() {
  game.adCats++;
  game.next = WILD;
  showToast(T('catalyst'));
}

function addFloat(x, y, str, color, size) {
  floats.push({ x, y, str, color, size: size * S, life: 1.1 });
}

function showToast(str) { toast = { str, life: 2.3 }; }

function burst(x, y, color, count, power) {
  for (let i = 0; i < count && sparks.length < 240; i++) {
    const a = rand(0, Math.PI * 2), v = rand(0.25, 1) * power;
    sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.2, life: rand(0.35, 0.8), max: 0.8, size: rand(1.5, 3.6) * S, color });
  }
}

function fuse(a, b) {
  const g = game;
  a.dead = b.dead = true;
  if (a.tier === WILD && b.tier === WILD) {
    burst(a.x, a.y, CATALYST.mid, 40, 300);
    return;
  }
  const wild = a.tier === WILD || b.tier === WILD;
  const base = a.tier === WILD ? b : a;
  const tier = base.tier + 1;
  const total = a.m + b.m;
  const x = wild ? base.x : (a.x * a.m + b.x * b.m) / total;
  const y = wild ? base.y : (a.y * a.m + b.y * b.m) / total;
  if (wild) burst(x, y, CATALYST.mid, 34, 300);

  g.combo = g.comboTime > 0 ? g.combo + 1 : 1;
  g.comboTime = 1;
  const multiplier = Math.min(3, 1 + (g.combo - 1) * 0.25);

  if (base.tier === MAX_TIER) {
    const bonus = Math.round(5000 * multiplier);
    g.score += bonus;
    addFloat(x, y - 20, `${T('pure')} +${bonus}`, METALS[MAX_TIER].hi, 24);
    burst(x, y, METALS[MAX_TIER].mid, 120, 520);
    rings.push({ x, y, r: 10, max: boxW, life: 0.7, color: METALS[MAX_TIER].hi });
    shake = 16;
    audio.sfx('order');
    return;
  }

  const hot = tier === g.hot;
  const points = Math.round((tier + 1) * (tier + 2) * 5 * multiplier * (hot ? 2 : 1));
  g.score += points;
  g.heat = Math.min(1, g.heat + 0.05 + tier * 0.012);
  g.topTier = Math.max(g.topTier, tier);
  const bit = 1 << tier;
  if (!(save.seen & bit)) {
    save.seen |= bit;
    persist();
    if (tier >= 2) banner = { tier, title: T('newMetal')(metalName(tier)), line: FACTS[save.lang === 'ar' ? 'ar' : 'en'][tier], life: 3 };
  }
  if (tier === dailyTier() && save.dailyDay !== today()) {
    save.streak = save.dailyDay === today() - 1 ? save.streak + 1 : 1;
    save.dailyDay = today();
    save.tokens++;
    persist();
    banner = { tier, title: T('dailyWin'), line: T('dailyDone')(save.streak), life: 3 };
    audio.sfx('order');
  }

  addOrb(tier, x, y, (a.vx + b.vx) / 2, (a.vy + b.vy) / 2 - 50, true);
  const m = METALS[tier];
  burst(x, y, m.mid, 14 + tier * 4, 170 + tier * 26);
  rings.push({ x, y, r: radius(tier) * 0.6, max: radius(tier) * 2, life: 0.32, color: m.hi });
  addFloat(x, y - 6, `+${points}`, hot ? '#ffd36a' : '#fff', 15 + tier);
  if (g.combo >= 2) addFloat(x, y - 28, T('combo')(g.combo), '#ffb040', 17);
  shake = Math.max(shake, tier * 1.1);
  if (tier >= 5 && canUse('vibrateShort')) {
    try { TT.vibrateShort({ type: 'medium', fail: () => {} }); } catch (e) { /* haptics are optional */ }
  }
  audio.sfx('merge' + Math.min(4, Math.floor(tier / 2)));

  const order = g.order;
  if (tier === order.tier) {
    order.got++;
    if (order.got >= order.need) {
      g.score += order.reward;
      g.heat = Math.min(1, g.heat + 0.34);
      g.level++;
      addFloat(W / 2, boxTop + 34, `${T('orderDone')} +${order.reward}`, '#7dffa8', 20);
      audio.sfx('order');
      newOrder();
    }
  }
}

function meltLowest() {
  const g = game;
  if (g.heat >= 1) g.heat = 0;
  else if (save.tokens > 0) { save.tokens--; persist(); } else return;
  let low = MAX_TIER;
  for (const o of orbs) low = Math.min(low, o.tier);
  let removed = 0;
  for (let pass = 0; pass < 2; pass++) {
    for (const o of orbs) {
      if (o.tier === low + pass && !o.dead) {
        o.dead = true; removed++;
        burst(o.x, o.y, '#ff9a3c', 12, 200);
        g.score += 10 * (o.tier + 1);
      }
    }
    if (removed >= 4) break;
  }
  orbs = orbs.filter((o) => !o.dead);
  rings.push({ x: W / 2, y: boxBottom, r: 20, max: boxW, life: 0.55, color: '#ffb040' });
  shake = 10;
  audio.sfx('melt');
}

function revive() {
  const g = game;
  g.revived = true;
  let low = MAX_TIER;
  for (const o of orbs) low = Math.min(low, o.tier);
  for (const o of orbs) {
    if (o.tier <= low + 2 || o.y - o.r < boxTop + boxW * 0.16) {
      o.dead = true;
      burst(o.x, o.y, '#ff9a3c', 8, 200);
    }
  }
  orbs = orbs.filter((o) => !o.dead);
  g.overTime = 0; g.grace = 2.5;
  audio.sfx('melt');
  setScreen('play');
}

function endGame() {
  const g = game;
  g.shown = g.score;
  g.record = g.score > save.best;
  if (g.record) save.best = g.score;
  persist();
  audio.sfx('over');
  setScreen('over');
}

function setScreen(name) {
  screen = name;
  screenTime = 0;
  pointer.aim = false;
  toast = null;
  banner = null;
}

// ---------------------------------------------------------------- physics
const STEP = 1 / 120;
let acc = 0;

function physics(dt) {
  acc = Math.min(acc + dt, STEP * 6);
  while (acc >= STEP) { stepWorld(STEP); acc -= STEP; }
}

function stepWorld(dt) {
  const gravity = 1650 * (boxW / 350);
  const left = boxX, right = boxX + boxW, floor = boxBottom - 8;
  for (const o of orbs) {
    o.age += dt;
    if (o.r < o.full) o.r = Math.min(o.full, o.r + o.full * dt * 5);
    o.vy += gravity * dt;
    o.vx *= 0.9985;
    o.x += o.vx * dt; o.y += o.vy * dt;
    o.ang += o.av * dt;
    o.av *= 0.992;
    if (o.x - o.r < left) { o.x = left + o.r; o.vx = Math.abs(o.vx) * 0.25; }
    if (o.x + o.r > right) { o.x = right - o.r; o.vx = -Math.abs(o.vx) * 0.25; }
    if (o.y + o.r > floor) {
      o.y = floor - o.r;
      o.vy = -Math.abs(o.vy) * 0.12;
      o.vx *= 0.96;
      o.av = o.vx / o.r;
    }
  }
  const n = orbs.length;
  for (let i = 0; i < n; i++) {
    const a = orbs[i];
    if (a.dead) continue;
    for (let j = i + 1; j < n; j++) {
      const b = orbs[j];
      if (b.dead) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const reach = a.r + b.r;
      const d2 = dx * dx + dy * dy;
      if (d2 >= reach * reach) continue;
      if (a.tier === b.tier || a.tier === WILD || b.tier === WILD) { fuse(a, b); break; }
      const d = Math.sqrt(d2) || 0.01;
      const nx = dx / d, ny = dy / d, overlap = reach - d;
      const ma = b.m / (a.m + b.m), mb = a.m / (a.m + b.m);
      a.x -= nx * overlap * ma * 0.7; a.y -= ny * overlap * ma * 0.7;
      b.x += nx * overlap * mb * 0.7; b.y += ny * overlap * mb * 0.7;
      const rvx = b.vx - a.vx, rvy = b.vy - a.vy;
      const along = rvx * nx + rvy * ny;
      if (along < 0) {
        const impulse = -1.12 * along;
        a.vx -= nx * impulse * ma; a.vy -= ny * impulse * ma;
        b.vx += nx * impulse * mb; b.vy += ny * impulse * mb;
        const slide = rvx * -ny + rvy * nx;
        a.av += slide * 0.0016; b.av -= slide * 0.0016;
      }
    }
  }
  if (orbs.some((o) => o.dead)) orbs = orbs.filter((o) => !o.dead);
}

function updateGame(dt) {
  const g = game;
  physics(dt);
  g.cooldown = Math.max(0, g.cooldown - dt);
  g.shown += Math.ceil((g.score - g.shown) * Math.min(1, dt * 12));
  g.grace = Math.max(0, g.grace - dt);
  if (g.comboTime > 0) { g.comboTime -= dt; if (g.comboTime <= 0) g.combo = 0; }

  let above = false;
  for (const o of orbs) if (o.age > 1.3 && o.y - o.r < boxTop) above = true;
  g.overTime = above && g.grace <= 0 ? g.overTime + dt : Math.max(0, g.overTime - dt * 2);
  g.danger = clamp(g.overTime / 2.6, 0, 1);
  if (g.overTime >= 2.6) endGame();
}

function updateEffects(dt) {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i];
    p.life -= dt;
    if (p.life <= 0) { sparks[i] = sparks[sparks.length - 1]; sparks.pop(); continue; }
    p.vy += 620 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
  }
  for (let i = rings.length - 1; i >= 0; i--) {
    rings[i].life -= dt;
    if (rings[i].life <= 0) rings.splice(i, 1);
    else rings[i].r += (rings[i].max - rings[i].r) * dt * 9;
  }
  for (let i = floats.length - 1; i >= 0; i--) {
    floats[i].life -= dt;
    floats[i].y -= 42 * dt;
    if (floats[i].life <= 0) floats.splice(i, 1);
  }
  if (toast) { toast.life -= dt; if (toast.life <= 0) toast = null; }
  if (banner) { banner.life -= dt; if (banner.life <= 0) banner = null; }
  shake *= Math.pow(0.0015, dt);
  if (shake < 0.2) shake = 0;

  if (embers.length < 26 && Math.random() < dt * 12) {
    embers.push({ x: rand(0, W), y: H + 6, v: rand(26, 70), sway: rand(0, 6), size: rand(0.8, 2.2) * S, life: rand(4, 9) });
  }
  for (let i = embers.length - 1; i >= 0; i--) {
    const e = embers[i];
    e.life -= dt; e.y -= e.v * dt; e.x += Math.sin(clock * 1.3 + e.sway) * 12 * dt;
    if (e.life <= 0 || e.y < -8) embers.splice(i, 1);
  }
}

// ---------------------------------------------------------------- UI
function button(id, x, y, w, h, label, style, onTap) {
  const down = pressed === id;
  const r = Math.min(h / 2, 16 * S);
  const palette = {
    gold: ['#ffe07a', '#f59a1b', '#4a2300'],
    steel: ['#4b4557', '#2c2736', '#fff'],
    green: ['#8cf2a8', '#27a860', '#04301a'],
    ghost: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.06)', '#fff'],
  }[style || 'steel'];
  const py = down ? y + 2 : y;
  const fill = ctx.createLinearGradient(0, py, 0, py + h);
  fill.addColorStop(0, palette[0]); fill.addColorStop(1, palette[1]);
  ctx.fillStyle = fill;
  rr(x, py, w, h, r); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1;
  rr(x + 0.5, py + 0.5, w - 1, h - 1, r); ctx.stroke();
  if (label) fitText(label, x + w / 2, py + h / 2 + 1, Math.min(h * 0.42, 20 * S), w - 16, palette[2], 'center', 800);
  buttons.push({ id, x, y, w, h, onTap });
}

function drawEmbers() {
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,140,50,0.75)';
  for (const e of embers) {
    ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
}

function drawBackdrop() {
  ctx.drawImage(backdrop, 0, 0, W, H);
  drawEmbers();
}

function drawCrucible() {
  const g = game;
  const x = boxX, w = boxW, top = boxTop, bottom = boxBottom;
  const well = ctx.createLinearGradient(0, top, 0, bottom);
  well.addColorStop(0, 'rgba(24,16,34,0.72)'); well.addColorStop(1, 'rgba(62,20,12,0.92)');
  ctx.fillStyle = well;
  rr(x - 4, top - 8, w + 8, bottom - top + 14, 14);
  ctx.fill();

  // Molten pool, with a slow surface swell.
  const base = bottom - 14;
  ctx.beginPath();
  ctx.moveTo(x, bottom + 2);
  for (let i = 0; i <= 18; i++) {
    const px = x + (w * i) / 18;
    ctx.lineTo(px, base + Math.sin(i * 0.9 + clock * 2.2) * 2.6 + Math.sin(i * 0.37 - clock * 1.3) * 2);
  }
  ctx.lineTo(x + w, bottom + 2);
  ctx.closePath();
  const lava = ctx.createLinearGradient(0, base - 4, 0, bottom);
  lava.addColorStop(0, '#ffd166'); lava.addColorStop(0.5, '#ff7a1a'); lava.addColorStop(1, '#c62f0a');
  ctx.fillStyle = lava;
  ctx.fill();

  ctx.strokeStyle = '#6a6175';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 3, top - 6); ctx.lineTo(x - 3, bottom + 3); ctx.lineTo(x + w + 3, bottom + 3); ctx.lineTo(x + w + 3, top - 6);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 4, top - 6); ctx.lineTo(x - 4, bottom + 2);
  ctx.stroke();

  // Fill line, which warns as it reddens.
  const alert = g ? g.danger : 0;
  const pulse = alert > 0 ? 0.5 + 0.5 * Math.sin(clock * 14) : 0;
  ctx.strokeStyle = alert > 0 ? `rgba(255,${80 - pulse * 60},60,${0.6 + pulse * 0.4})` : 'rgba(255,255,255,0.22)';
  ctx.lineWidth = alert > 0 ? 2.5 : 1.5;
  ctx.setLineDash([8, 7]);
  ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + w, top); ctx.stroke();
  ctx.setLineDash([]);
}

function drawOrbs() {
  const hot = game ? game.hot : -1;
  for (const o of orbs) {
    if (o.tier === hot) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(255,170,60,${0.4 + 0.3 * Math.sin(clock * 6)})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r + 2, 0, Math.PI * 2); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
    // Metals rock but never flip, so symbols stay readable. The Catalyst spins.
    drawOrb(o.tier, o.x, o.y, o.r, o.tier === WILD ? clock * 3 : Math.sin(o.ang) * 0.4);
  }
}

function drawEffects() {
  ctx.globalCompositeOperation = 'lighter';
  for (const p of sparks) {
    ctx.globalAlpha = clamp(p.life / p.max * 1.5, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  for (const r of rings) {
    ctx.globalAlpha = clamp(r.life * 3, 0, 0.8);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = clamp(r.life, 0, 0.22);
    ctx.fillStyle = r.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  for (const f of floats) {
    ctx.globalAlpha = clamp(f.life * 2, 0, 1);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.font = `800 ${Math.round(f.size)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.direction = textDirection(f.str);
    ctx.strokeText(f.str, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.str, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}

function drawHud() {
  const g = game;
  const pad = Math.max(12, boxX);
  text(String(g.shown), pad, hudY + 15 * S, 30 * S, '#fff', 'left', 800);
  text(`${T('best')} ${Math.max(save.best, g.score)}`, pad, hudY + 37 * S, 12 * S, '#c9b8a8', 'left', 600);
  text(`Lv ${g.level}`, W / 2, hudY + 17 * S, 18 * S, '#ffd36a', 'center', 800);
  const size = 38 * S;
  button('pause', W - pad - size, hudY + 2, size, size, 'II', 'ghost', () => setScreen('pause'));

  // Order board.
  const o = g.order;
  const h = 42 * S, x = pad, w = W - pad * 2, y = orderY;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  rr(x, y, w, h, 12 * S); ctx.fill();
  const iconR = 14 * S;
  drawOrb(o.tier, x + 22 * S, y + h / 2, iconR, 0);
  const left = x + 44 * S;
  const room = w - 44 * S - 92 * S;
  fitText(T('forge')(o.need, metalName(o.tier)), left + room / 2, y + 14 * S, 14 * S, room, '#fff', 'center', 700);
  const barY = y + 27 * S, barW = room;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  rr(left, barY, barW, 6 * S, 3 * S); ctx.fill();
  if (o.got > 0) {
    ctx.fillStyle = '#7dffa8';
    rr(left, barY, Math.max(6 * S, barW * o.got / o.need), 6 * S, 3 * S); ctx.fill();
  }
  text(`${o.dropsLeft} ${T('drops')}`, x + w - 50 * S, y + 13 * S, 11 * S, '#ffdcb0', 'center', 700);
  if (g.hot >= 0) {
    drawOrb(g.hot, x + w - 74 * S, y + 29 * S, 8 * S, 0);
    text(`${T('hot')} x2`, x + w - 38 * S, y + 29 * S, 11 * S, '#ffb040', 'center', 800);
  }

  // Held metal, aim guide and the next metal.
  if (screen === 'play') {
    const r = radius(g.current);
    const hx = clamp(g.aimX, boxX + r, boxX + boxW - r);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 8]);
    ctx.beginPath(); ctx.moveTo(hx, holdY + r); ctx.lineTo(hx, boxBottom - 14); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = g.cooldown > 0 ? 0.55 : 1;
    drawOrb(g.current, hx, holdY, r, g.current === WILD ? clock * 3 : 0);
    ctx.globalAlpha = 1;
  }
  const nextX = W - pad - 22 * S, nextY = orderY + h + 30 * S;
  text(T('next'), nextX, nextY - 21 * S, 10 * S, '#c9b8a8', 'center', 700);
  drawOrb(g.next, nextX, nextY, Math.min(radius(g.next), 15 * S), 0);
  if (screen === 'play') {
    const ready = g.swaps > 0;
    text(ready ? T('swap') : String(g.swapIn), nextX, nextY + 23 * S, 11 * S, ready ? '#7dffa8' : '#8f8496', 'center', 800);
    buttons.push({ id: 'swap', x: nextX - 30 * S, y: nextY - 30 * S, w: 60 * S, h: 64 * S, onTap: swapMetals });
  }
}

function drawLadder(y) {
  const size = Math.min(26 * S, (W - 24) / METALS.length - 4);
  const gap = (Math.min(W - 24, 360 * S) - size * METALS.length) / (METALS.length - 1);
  let x = (W - (size * METALS.length + gap * (METALS.length - 1))) / 2 + size / 2;
  for (let t = 0; t <= MAX_TIER; t++) {
    const known = t < 2 || (save.seen & (1 << t));
    ctx.globalAlpha = known ? 1 : 0.2;
    drawOrb(t, x, y, size / 2, 0);
    x += size + gap;
  }
  ctx.globalAlpha = 1;
}

function drawBottomBar() {
  const g = game;
  drawLadder(bottomY + 14 * S);
  const offerAd = rewardsReady() && g.adCats < 2 && screen === 'play';
  const total = Math.min(W - 32, 320 * S), adW = offerAd ? 104 * S : 0;
  const y = bottomY + 32 * S, h = 42 * S, w = total - (offerAd ? adW + 8 : 0), x = (W - total) / 2;
  if (offerAd) button('adcat', x + w + 8, y, adW, h, T('adCat'), 'green', () => showRewardedAd(grantAdCatalyst));
  const ready = g.heat >= 1 || save.tokens > 0;
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  rr(x, y, w, h, 14 * S); ctx.fill();
  if (g.heat > 0) {
    const fill = ctx.createLinearGradient(x, 0, x + w, 0);
    fill.addColorStop(0, '#ff5a1f'); fill.addColorStop(1, '#ffc642');
    ctx.fillStyle = fill;
    rr(x, y, Math.max(28 * S, w * g.heat), h, 14 * S); ctx.fill();
  }
  if (ready) {
    ctx.strokeStyle = `rgba(255,240,180,${0.6 + 0.4 * Math.sin(clock * 7)})`;
    ctx.lineWidth = 2;
    rr(x, y, w, h, 14 * S); ctx.stroke();
  }
  const label = ready ? `${T('melt')}${save.tokens > 0 ? ` (${save.tokens})` : ''}` : T('heat');
  text(label, x + w / 2, y + h / 2 + 1, 17 * S, ready ? '#fff' : 'rgba(255,255,255,0.65)', 'center', 800);
  buttons.push({ id: 'melt', x, y, w, h, onTap: () => { if (ready) meltLowest(); } });
}

function drawTutorial() {
  const y = (boxTop + boxBottom) / 2;
  const sweep = Math.sin(clock * 2.4) * boxW * 0.28;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.arc(W / 2 + sweep, y - 34 * S, 11 * S, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(W / 2 + sweep, y - 34 * S, 17 * S, 0, Math.PI * 2); ctx.stroke();
  fitText(T('howAim'), W / 2, y + 2 * S, 16 * S, boxW - 24, '#fff', 'center', 700);
  fitText(T('howFuse'), W / 2, y + 26 * S, 13 * S, boxW - 24, '#ffdcb0', 'center', 600);
}

function drawPlayfield() {
  drawBackdrop();
  ctx.save();
  if (shake > 0) ctx.translate(rand(-shake, shake) * 0.5, rand(-shake, shake) * 0.5);
  drawCrucible();
  drawOrbs();
  drawEffects();
  ctx.restore();
  drawHud();
  drawBottomBar();
  if (game.tutorial && screen === 'play') drawTutorial();
  if (game.danger > 0) {
    ctx.fillStyle = `rgba(255,30,10,${game.danger * 0.16 * (0.6 + 0.4 * Math.sin(clock * 14))})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function drawToast() {
  if (!toast) return;
  ctx.globalAlpha = clamp(toast.life * 3, 0, 1);
  const y = boxTop + 16 * S, h = 30 * S, w = Math.min(W - 40, 320 * S);
  ctx.fillStyle = 'rgba(20,10,20,0.85)';
  rr((W - w) / 2, y, w, h, h / 2); ctx.fill();
  fitText(toast.str, W / 2, y + h / 2 + 1, 13 * S, w - 20, '#ffdc9a', 'center', 700);
  ctx.globalAlpha = 1;
}

function drawBanner() {
  if (!banner) return;
  ctx.globalAlpha = clamp(Math.min(banner.life * 3, (3 - banner.life) * 6), 0, 1);
  const w = Math.min(W - 32, 330 * S), h = 62 * S, x = (W - w) / 2, y = boxTop + 54 * S;
  ctx.fillStyle = 'rgba(24,12,28,0.92)';
  rr(x, y, w, h, 16 * S); ctx.fill();
  ctx.strokeStyle = 'rgba(255,200,110,0.6)';
  ctx.lineWidth = 1.5;
  rr(x, y, w, h, 16 * S); ctx.stroke();
  drawOrb(banner.tier, x + 34 * S, y + h / 2, 21 * S, 0);
  const room = w - 76 * S, mid = x + 64 * S + room / 2;
  fitText(banner.title, mid, y + 22 * S, 16 * S, room, '#ffd36a', 'center', 800);
  fitText(banner.line, mid, y + 43 * S, 12.5 * S, room, '#f0e4d8', 'center', 600);
  ctx.globalAlpha = 1;
}

function drawTitle(y) {
  const fill = ctx.createLinearGradient(0, y - 46 * S, 0, y + 50 * S);
  fill.addColorStop(0, '#fff3b8'); fill.addColorStop(0.5, '#ffb02e'); fill.addColorStop(1, '#ff5a1f');
  ctx.font = `900 ${Math.round(50 * S)}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = fill;
  ctx.fillText('MOLTEN', W / 2, y - 24 * S);
  ctx.fillText('MERGE', W / 2, y + 26 * S);
}

function grantToken() {
  save.tokens++;
  persist();
  showToast(T('gift'));
  audio.sfx('order');
}

function claimShortcut() {
  TT.addShortcut({
    success: () => TT.getShortcutMissionReward({
      success: ({ canReceiveReward }) => { if (canReceiveReward) grantToken(); else showToast(T('noGift')); },
      fail: () => {},
    }),
    fail: () => {},
  });
}

function claimProfile() {
  TT.startEntranceMission({ success: () => { pendingEntrance = true; }, fail: () => {} });
}

function checkEntranceReward() {
  pendingEntrance = false;
  TT.getEntranceMissionReward({
    success: ({ canReceiveReward }) => { if (canReceiveReward) grantToken(); },
    fail: () => {},
  });
}

function drawMenu() {
  drawBackdrop();
  // Metals orbit slowly behind the title.
  for (let t = 0; t <= MAX_TIER; t++) {
    const a = clock * 0.22 + (t / METALS.length) * Math.PI * 2;
    const x = W / 2 + Math.cos(a) * W * 0.42;
    const y = H * 0.27 + Math.sin(a) * H * 0.16;
    ctx.globalAlpha = 0.5 + 0.5 * ((Math.sin(a) + 1) / 2);
    drawOrb(t, x, y, (11 + t * 1.9) * S, 0);
  }
  ctx.globalAlpha = 1;
  drawTitle(H * 0.27);
  fitText(T('tag'), W / 2, H * 0.27 + 72 * S, 15 * S, W - 40, '#ffdcb0', 'center', 600);

  const w = Math.min(W - 72, 270 * S), x = (W - w) / 2;
  let y = H * 0.5;
  button('play', x, y, w, 62 * S, T('play'), 'gold', () => { newGame(); setScreen('play'); });
  y += 72 * S;
  text(`${T('best')}: ${save.best}`, W / 2, y + 2, 16 * S, '#fff', 'center', 700);
  y += 22 * S;
  text(T('collection'), W / 2, y + 2, 11 * S, '#c9b8a8', 'center', 600);
  drawLadder(y + 22 * S);
  y += 46 * S;
  const dailyDone = save.dailyDay === today();
  fitText(dailyDone ? T('dailyDone')(save.streak) : T('daily')(metalName(dailyTier())), W / 2, y, 13 * S, W - 40, dailyDone ? '#7dffa8' : '#ffd36a', 'center', 700);
  y += 16 * S;

  const half = (w - 8) / 2, small = 38 * S;
  button('sound', x, y, half, small, `${T('sound')}: ${save.sound ? T('on') : T('off')}`, 'ghost', () => {
    save.sound = !save.sound; persist();
  });
  button('music', x + half + 8, y, half, small, `${T('music')}: ${save.music ? T('on') : T('off')}`, 'ghost', () => {
    save.music = !save.music; persist();
    if (save.music) audio.startBgm(); else audio.pauseBgm();
  });
  y += small + 8;
  button('lang', x, y, half, small, T('lang'), 'ghost', () => {
    save.lang = save.lang === 'ar' ? 'en' : 'ar'; persist();
  });
  button('about', x + half + 8, y, half, small, T('about'), 'ghost', () => setScreen('about'));
  y += small + 8;
  if (canUse('addShortcut')) {
    button('shortcut', x, y, half, small, T('shortcut'), 'steel', claimShortcut);
  }
  if (canUse('startEntranceMission')) {
    button('profile', x + half + 8, y, half, small, T('profile'), 'steel', claimProfile);
  }
  text(`© 2026 ${CONFIG.company}`, W / 2, H - safeBottom - 14 * S, 10 * S, 'rgba(255,255,255,0.55)', 'center', 500);
}

function drawPanel(h) {
  ctx.fillStyle = 'rgba(8,4,12,0.72)';
  ctx.fillRect(0, 0, W, H);
  const w = Math.min(W - 40, 320 * S), x = (W - w) / 2, y = (H - h) / 2;
  const fill = ctx.createLinearGradient(0, y, 0, y + h);
  fill.addColorStop(0, '#2c2036'); fill.addColorStop(1, '#1b1220');
  ctx.fillStyle = fill;
  rr(x, y, w, h, 20 * S); ctx.fill();
  ctx.strokeStyle = 'rgba(255,190,110,0.35)';
  ctx.lineWidth = 1.5;
  rr(x, y, w, h, 20 * S); ctx.stroke();
  return { x, y, w };
}

function drawPause() {
  const p = drawPanel(292 * S);
  const bw = p.w - 48 * S, bx = p.x + 24 * S, bh = 48 * S;
  let y = p.y + 34 * S;
  text(T('pause'), W / 2, y, 24 * S, '#ffd36a', 'center', 800);
  y += 30 * S;
  button('resume', bx, y, bw, bh, T('resume'), 'gold', () => setScreen('play'));
  y += bh + 10 * S;
  button('restart', bx, y, bw, bh, T('restart'), 'steel', () => { newGame(); setScreen('play'); });
  y += bh + 10 * S;
  button('tomenu', bx, y, bw, bh, T('menu'), 'steel', () => {
    if (game.score > save.best) { save.best = game.score; persist(); }
    setScreen('menu');
  });
  y += bh + 10 * S;
  const half = (bw - 8) / 2;
  button('psound', bx, y, half, 36 * S, `${T('sound')}: ${save.sound ? T('on') : T('off')}`, 'ghost', () => {
    save.sound = !save.sound; persist();
  });
  button('pmusic', bx + half + 8, y, half, 36 * S, `${T('music')}: ${save.music ? T('on') : T('off')}`, 'ghost', () => {
    save.music = !save.music; persist();
    if (save.music) audio.startBgm(); else audio.pauseBgm();
  });
}

function rewardsReady() {
  return (PREVIEW || !!CONFIG.rewardedAdUnitId) && typeof TT.createRewardedVideoAd === 'function';
}

function showRewardedAd(onReward) {
  if (adBusy) return;
  adBusy = true;
  const ad = TT.createRewardedVideoAd({ adUnitId: CONFIG.rewardedAdUnitId || 'preview' });
  audio.pauseBgm();
  const finish = () => {
    adBusy = false;
    ad.offClose(onClose);
    ad.offError(onError);
    if (audio.started) audio.startBgm();
  };
  const onClose = (res) => { finish(); if (res && res.isEnded) onReward(); };
  const onError = () => { finish(); showToast(T('adFail')); };
  ad.onClose(onClose);
  ad.onError(onError);
  ad.show().catch(onError);
}

function drawOver() {
  const g = game;
  const canRevive = !g.revived && rewardsReady();
  const p = drawPanel((canRevive ? 392 : 334) * S);
  const bw = p.w - 48 * S, bx = p.x + 24 * S, bh = 50 * S;
  let y = p.y + 36 * S;
  fitText(T('over'), W / 2, y, 24 * S, p.w - 32, '#ff9a5c', 'center', 800);
  y += 40 * S;
  text(String(g.score), W / 2, y, 42 * S, '#fff', 'center', 800);
  y += 30 * S;
  if (g.record) text(T('record'), W / 2, y, 15 * S, '#7dffa8', 'center', 800);
  else text(`${T('best')}: ${save.best}`, W / 2, y, 14 * S, '#c9b8a8', 'center', 600);
  y += 32 * S;
  drawOrb(g.topTier, W / 2 - 62 * S, y, 16 * S, 0);
  fitText(`${T('top')}: ${metalName(g.topTier)}`, W / 2 + 12 * S, y, 14 * S, 130 * S, '#ffdcb0', 'center', 700);
  y += 26 * S;
  text(`${T('rank')}: ${rankName(g.score)}`, W / 2, y, 14 * S, '#ffd36a', 'center', 800);
  y += 24 * S;
  if (canRevive) {
    button('revive', bx, y, bw, bh, T('revive'), 'green', () => showRewardedAd(revive));
    y += bh + 8 * S;
  }
  button('again', bx, y, bw, bh, T('again'), 'gold', () => { newGame(); setScreen('play'); });
  y += bh + 8 * S;
  button('overmenu', bx, y, bw, 42 * S, T('menu'), 'steel', () => setScreen('menu'));
}

function drawAbout() {
  drawBackdrop();
  drawTitle(H * 0.24);
  const y = wrapText(T('aboutBody'), W / 2, H * 0.24 + 90 * S, W - 56, 15 * S, 23 * S, '#f0e4d8');
  text(`© 2026 ${CONFIG.company}`, W / 2, y + 16 * S, 12 * S, '#ffd36a', 'center', 700);
  text(T('rights'), W / 2, y + 36 * S, 12 * S, '#c9b8a8', 'center', 500);
  text(`v${CONFIG.version}`, W / 2, y + 56 * S, 11 * S, '#8f8496', 'center', 500);
  const w = Math.min(W - 72, 220 * S);
  button('aboutback', (W - w) / 2, y + 84 * S, w, 48 * S, T('back'), 'gold', () => setScreen('menu'));
}

function drawSplash() {
  drawBackdrop();
  ctx.globalAlpha = clamp(Math.min(screenTime * 3, (1.7 - screenTime) * 3), 0, 1);
  fitText(CONFIG.company, W / 2, H * 0.46, 19 * S, W - 40, '#ffd36a', 'center', 800);
  text(T('presents'), W / 2, H * 0.46 + 30 * S, 13 * S, '#c9b8a8', 'center', 500);
  ctx.globalAlpha = 1;
  if (screenTime > 1.7) setScreen('menu');
}

// ---------------------------------------------------------------- frame loop
let lastTime = 0;
let reported = false;

function frame(now) {
  raf(frame);
  const stamp = typeof now === 'number' ? now : Date.now();
  const dt = Math.min(0.05, lastTime ? (stamp - lastTime) / 1000 : 0.016);
  lastTime = stamp;
  clock += dt;
  screenTime += dt;

  if (screen === 'play') updateGame(dt);
  updateEffects(dt);

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  buttons = [];
  if (screen === 'splash') drawSplash();
  else if (screen === 'menu') drawMenu();
  else if (screen === 'about') drawAbout();
  else {
    drawPlayfield();
    // Panels own the taps while they are open.
    if (screen !== 'play') buttons = [];
    if (screen === 'pause') drawPause();
    if (screen === 'over') drawOver();
  }
  drawToast();
  drawBanner();

  if (!reported) {
    reported = true;
    if (typeof TT.setLoadingProgress === 'function') {
      try { TT.setLoadingProgress({ progress: 1 }); } catch (e) { /* older base library */ }
    }
  }
}

// ---------------------------------------------------------------- input
function hit(x, y) {
  for (let i = buttons.length - 1; i >= 0; i--) {
    const b = buttons[i];
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
  }
  return null;
}

const point = (e) => {
  const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
  return t ? { x: t.clientX, y: t.clientY } : null;
};

TT.onTouchStart((e) => {
  const p = point(e);
  if (!p) return;
  if (!audio.started) audio.startBgm();
  const b = hit(p.x, p.y);
  if (b) { pressed = b.id; return; }
  if (screen === 'play') {
    pointer.aim = true;
    game.aimX = p.x;
  }
});

TT.onTouchMove((e) => {
  const p = point(e);
  if (p && pointer.aim && screen === 'play') game.aimX = p.x;
});

TT.onTouchEnd((e) => {
  const p = point(e);
  if (pressed) {
    const b = p && hit(p.x, p.y);
    if (b && b.id === pressed) {
      if (b.id !== 'melt') audio.sfx('tap');
      b.onTap();
    }
    pressed = null;
    return;
  }
  if (pointer.aim && screen === 'play') {
    pointer.aim = false;
    dropOrb();
  }
});

if (TT.onTouchCancel) TT.onTouchCancel(() => { pressed = null; pointer.aim = false; });

// ---------------------------------------------------------------- lifecycle
if (TT.onHide) TT.onHide(() => {
  audio.pauseBgm();
  persist();
  if (screen === 'play') setScreen('pause');
});
if (TT.onShow) TT.onShow(() => {
  lastTime = 0;
  if (audio.started && !adBusy) audio.startBgm();
  if (pendingEntrance) checkEntranceReward();
});
if (TT.onWindowResize) TT.onWindowResize(layout);

function login() {
  if (typeof TT.login !== 'function') return;
  TT.login({
    success: (result) => {
      if (CONFIG.loginBackendUrl && TT.request) {
        TT.request({ url: CONFIG.loginBackendUrl, method: 'POST', data: { code: result.code }, fail: () => {} });
      }
    },
    fail: () => {}, // the game stays fully playable without an account
  });
}

loadSave();
if (!save.lang) {
  const language = String(TT.getSystemInfoSync().language || 'en').toLowerCase();
  save.lang = language.indexOf('ar') === 0 ? 'ar' : 'en';
}
layout();
login();
raf(frame);

if (PREVIEW) {
  globalThis.__molten = {
    get game() { return game; }, get orbs() { return orbs; }, get screen() { return screen; },
    setScreen, addOrb, dropOrb, newGame, stepWorld, updateGame, boxBounds: () => ({ boxX, boxW, boxTop, boxBottom }),
  };
}
