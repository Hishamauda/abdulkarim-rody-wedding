// End-to-end QA with Playwright.
//   node tools/qa.mjs [baseUrl]        (default http://127.0.0.1:8765/)
// Writes qa/QA_REPORT.md, qa/qa-results.json and screenshots in qa/screenshots/.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/';
const LIVE = !BASE.includes('127.0.0.1') && !BASE.includes('localhost');
const SHOTS = path.join(ROOT, 'qa', LIVE ? 'screenshots-live' : 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const sb = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'assets/js/config.js'), 'utf8'), sb);
const C = sb.window.WEDDING;

const results = [];
function check(group, name, ok, detail = '') { results.push({ group, name, ok: !!ok, detail: String(detail) }); }
const VIEWPORTS = [[360, 780], [390, 844], [430, 932], [768, 1024], [1440, 900]];
const APPROVED = [
  'عبد الكريم', 'رودي', 'محمد عبد الكريم بستان', 'أبو عبد الكريم', 'كمال أمين النفار', 'أبو أمين',
  'قاعة روفان', 'غزة – بجوار برج الشفاء', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'بكل الحب والفرح', 'يتشرّف السيدان',
  'بدعوتكم لمشاركتهم فرحة زفاف ابنيهما', 'في ليلةٍ تزدان بحضوركم، وتكتمل فرحتها بلقائكم.', '12 نوفمبر 2026', '12-11-2026',
  'دعوة خاصة إلى ليلة لا تُنسى', 'افتح الدعوة', 'ليلةٌ من العمر... تكتمل بوجودكم.', '4:00 مساءً',
  'بداية مراسم حفل الزفاف', 'دخول العروسين', 'مراسم تبديل المحابس', 'فقرات حفل الزفاف', '4:30 مساءً', '5:00 مساءً', '5:15 مساءً',
  'بكل محبة وتقدير', 'لأحبتنا الصغار مكانةٌ في قلوبنا، ولأمسيتنا خصوصيتها؛ لذا نرجو أن يكون حضوركم الكريم دون اصطحاب الأطفال.',
  'شاكرين لكم تفهّمكم وتقديركم.', 'أهدونا الحب غيباً بالدعاء', 'بارك الله لنا وبارك علينا وجمع بيننا في خير.',
  'بعض الليالي لا تُنسى، لأنها تجمع من نحب.', 'وبحضوركم... تصبح ليلتنا ذكرى من العمر.', 'ننتظركم بكل محبة',
];
const FORBIDDEN = /هدي[ةه]|هدايا|تحويل|بنك|حساب بنكي|محفظ|QR|دفع|wallet|bank|gift|payment|iban/i;

const browser = await chromium.launch();

async function openPage(vw, vh, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: vw < 800 ? 2 : 1,
    isMobile: vw < 800, hasTouch: vw < 800, locale: 'ar', permissions: ['clipboard-read', 'clipboard-write'],
    reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const log = { errors: [], bad: [], bytes: 0 };
  page.on('console', (m) => { if (m.type() === 'error') log.errors.push(m.text()); });
  page.on('pageerror', (e) => log.errors.push(e.message));
  page.on('response', async (r) => {
    if (r.status() >= 400) log.bad.push(r.status() + ' ' + r.url());
    try { const b = await r.body(); log.bytes += b.length; } catch (e) { /* redirects */ }
  });
  if (opts.clock) await page.clock.install({ time: opts.clock });
  if (opts.share) await page.addInitScript(() => { window.__shared = null; navigator.share = (d) => { window.__shared = d; return Promise.resolve(); }; });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page, log };
}
async function settle(page, ms) { await page.waitForTimeout(ms); }
const shot = (page, o) => page.screenshot({ ...o, path: o.path.replace(/\.png$/, '.jpg'), type: 'jpeg', quality: 80 });

// ------------------------------------------------------------ per viewport
for (const [vw, vh] of VIEWPORTS) {
  const tag = `${vw}px`;
  const { ctx, page, log } = await openPage(vw, vh);
  const dir = path.join(SHOTS, String(vw)); fs.mkdirSync(dir, { recursive: true });
  check(tag, 'Envelope scene visible on load', await page.isVisible('#envelopeScene'));
  check(tag, 'Content inert before opening', await page.evaluate(() => document.getElementById('main').inert === true));
  await shot(page, { path: path.join(dir, '01-envelope.png') });
  await page.click('#openInvitation');
  await settle(page, 1200);
  await shot(page, { path: path.join(dir, '02-opening.png') });
  await settle(page, 2600);
  check(tag, 'Envelope opens and is removed', await page.evaluate(() => document.getElementById('envelopeScene').hidden));
  check(tag, 'Content interactive after opening', await page.evaluate(() => !document.getElementById('main').inert));
  check(tag, 'Focus moved to names heading', await page.evaluate(() => document.activeElement && document.activeElement.id === 'namesHeading'));
  const anim = await page.evaluate(() => getComputedStyle(document.querySelector('.name-groom')).animationName);
  check(tag, 'Names writing animation runs', /write/.test(anim), anim);
  await settle(page, 2600);
  await shot(page, { path: path.join(dir, '03-names.png') });
  const nb = await page.evaluate(() => [...document.querySelectorAll('.name, .names-amp')].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.right, e.textContent]; }));
  check(tag, 'Couple names fully inside the viewport (not clipped)', nb.every(([l, r]) => l >= 0 && r <= vw), JSON.stringify(nb.map((x) => [Math.round(x[0]), Math.round(x[1])])));
  for (const id of ['invitation', 'venue', 'countdown', 'program', 'etiquette', 'prayer', 'finale']) {
    await page.evaluate((id) => document.getElementById(id).scrollIntoView({ behavior: 'instant', block: 'start' }), id);
    await settle(page, id === 'prayer' ? 4400 : 2200);
    await shot(page, { path: path.join(dir, `${id}.png`) });
  }
  const sw = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  check(tag, 'No horizontal scrolling', sw[0] <= sw[1], `scrollWidth ${sw[0]} / viewport ${sw[1]}`);
  // full page after all reveals
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 600);
  await shot(page, { path: path.join(dir, '00-fullpage.png'), fullPage: true });
  check(tag, 'No console errors', log.errors.length === 0, log.errors.join(' | '));
  check(tag, 'All assets loaded (no 4xx/5xx)', log.bad.length === 0, log.bad.join(' | '));
  if (vw === 390) check('Performance', 'Total transfer size (390px run)', log.bytes < 900 * 1024, `${Math.round(log.bytes / 1024)} KB`);
  // small touch targets
  const small = await page.evaluate(() => [...document.querySelectorAll('a,button')].filter((e) => {
    if (e.closest('[hidden]') || e.classList.contains('skip-link')) return false;
    const r = e.getBoundingClientRect(); return r.width > 0 && (r.width < 44 || r.height < 44); }).map((e) => e.id || e.className));
  check(tag, 'Touch targets ≥ 44×44 px', small.length === 0, small.join(', '));
  await ctx.close();
}

// ------------------------------------------------------------ content & functions (390px)
{
  const { ctx, page, log } = await openPage(390, 844, { share: false });
  await page.click('#openInvitation');
  await settle(page, 3800);
  const body = await page.evaluate(() => document.body.innerText + '\n' + document.getElementById('envelopeScene').textContent);
  const html = await page.content();
  const missing = APPROVED.filter((t) => !body.includes(t));
  check('Content', 'Every approved Arabic text is present verbatim', missing.length === 0, missing.join(' | '));
  check('Content', 'Parents’ names and kunyas exact',
    body.includes('محمد عبد الكريم بستان') && body.includes('«أبو عبد الكريم»') && body.includes('كمال أمين النفار') && body.includes('«أبو أمين»'));
  check('Content', 'No gifts / payments / bank / wallet / QR anywhere', !FORBIDDEN.test(body) && !FORBIDDEN.test(html),
    (body.match(FORBIDDEN) || html.match(FORBIDDEN) || [''])[0]);
  const bound = await page.evaluate(() => [...document.querySelectorAll('[data-text]')].map((e) => [e.dataset.text, e.textContent]));
  const get = (p) => p.split('.').reduce((o, k) => (o == null ? o : o[k]), C);
  const mism = bound.filter(([k, v]) => get(k) !== v);
  check('Content', 'All bound texts equal config.js', mism.length === 0, JSON.stringify(mism.slice(0, 3)));
  const iso = await page.evaluate(() => window.__WEDDING_START__);
  check('Date', 'Ceremony start = 12-11-2026 16:00 Asia/Gaza (14:00 UTC)', iso === '2026-11-12T14:00:00.000Z', iso);
  const wd = await page.evaluate(() => new Intl.DateTimeFormat('ar', { weekday: 'long', timeZone: 'Asia/Gaza' }).format(new Date('2026-11-12T14:00:00Z')));
  check('Date', 'Day of the week is Thursday (الخميس)', wd === 'الخميس', wd);
  const dateVisual = await page.evaluate(() => { const b = document.querySelector('.venue-when bdi'); return [getComputedStyle(b).direction, b.textContent]; });
  check('Date', 'Numeric date isolated LTR (cannot flip to 2026-11-12)', dateVisual[0] === 'ltr' && dateVisual[1] === '12-11-2026', dateVisual.join(' '));
  // countdown now
  const cdv = await page.evaluate(() => ['cdDays', 'cdHours', 'cdMinutes', 'cdSeconds'].map((i) => document.getElementById(i).textContent));
  const ms = new Date('2026-11-12T14:00:00Z') - Date.now();
  const expDays = Math.floor(ms / 86400000);
  check('Countdown', 'Live countdown matches time to 16:00 Gaza', Number(cdv[0]) === expDays || Number(cdv[0]) === expDays - 1, cdv.join(':') + ` (expected days ${expDays})`);
  await settle(page, 1100);
  const cdv2 = await page.evaluate(() => document.getElementById('cdSeconds').textContent);
  check('Countdown', 'Countdown ticks every second', cdv2 !== cdv[3], `${cdv[3]} → ${cdv2}`);
  // timeline
  const tli = await page.evaluate(() => [...document.querySelectorAll('.tl-item')].map((li) => li.innerText.replace(/\s+/g, ' ').trim()));
  check('Timeline', '4 approved timeline entries in order', tli.length === 4 && C.timeline.every((t, i) => tli[i].includes(t.time) && tli[i].includes(t.title)), tli.join(' / '));
  await page.evaluate(() => document.getElementById('program').scrollIntoView({ behavior: 'instant' }));
  await settle(page, 400);
  const p1 = await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('timeline')).getPropertyValue('--p')) || 0);
  await page.mouse.wheel(0, 500); await settle(page, 500);
  const p2 = await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('timeline')).getPropertyValue('--p')) || 0);
  const lit = await page.evaluate(() => document.querySelectorAll('.tl-item.is-lit').length);
  check('Timeline', 'Gold line lights up progressively while scrolling', p2 > p1 && lit >= 1, `--p ${p1.toFixed(2)} → ${p2.toFixed(2)}, lit ${lit}`);
  // maps & calendar
  const maps = await page.getAttribute('#mapsLink', 'href');
  check('Venue', 'Google Maps opens a text search for the venue (no invented coordinates)',
    maps.startsWith('https://www.google.com/maps/search/?api=1&query=') && decodeURIComponent(maps.split('query=')[1]) === C.venue.mapsQuery, decodeURIComponent(maps));
  await page.evaluate(() => document.getElementById('venue').scrollIntoView({ behavior: 'instant' }));
  await settle(page, 600);
  await page.click('#calendarToggle');
  check('Calendar', 'Save-the-date menu opens', await page.isVisible('#calendarOptions'));
  const gcal = await page.getAttribute('#gcalLink', 'href');
  check('Calendar', 'Google Calendar link has the right UTC times', gcal.includes('dates=20261112T140000Z/20261112T190000Z') && gcal.includes('ctz=Asia%2FGaza'), gcal.slice(0, 160));
  const ics = await page.evaluate(async () => { const r = await fetch('assets/wedding.ics'); return [r.status, r.headers.get('content-type'), await r.text()]; });
  check('Calendar', '.ics file served and correct', ics[0] === 200 && ics[2].includes('DTSTART:20261112T140000Z') && ics[2].includes('SUMMARY:'), `${ics[0]} ${ics[1]}`);
  // share fallback (no Web Share in desktop Chromium) -> copies link
  await page.click('#shareButton');
  await settle(page, 500);
  const toast = await page.textContent('#toast');
  let clip = '';
  try { clip = await page.evaluate(() => navigator.clipboard.readText()); } catch (e) { clip = 'n/a'; }
  check('Share', 'Without Web Share API the link is copied + confirmation toast', toast.includes('تم نسخ رابط الدعوة') && (clip === C.site.url || clip === 'n/a'), `${toast} / ${clip}`);
  // nav
  await page.click('a[data-nav="program"]'); await settle(page, 1400);
  const navOk = await page.evaluate(() => { const r = document.getElementById('program').getBoundingClientRect(); return r.top < innerHeight * 0.5 && r.bottom > 0; });
  check('Navigation', 'Bottom nav scrolls to the programme', navOk);
  const cur = await page.evaluate(() => document.querySelector('[data-nav="program"]').getAttribute('aria-current'));
  check('Navigation', 'Active nav item announced (aria-current)', cur === 'location', cur);
  await page.click('a[data-nav="venue"]'); await settle(page, 1400);
  check('Navigation', 'Bottom nav scrolls to the venue', await page.evaluate(() => { const r = document.getElementById('venue').getBoundingClientRect(); return r.top < innerHeight * 0.5 && r.bottom > 0; }));
  // music
  const m0 = await page.getAttribute('#musicButton', 'aria-pressed');
  await page.click('#musicButton'); await settle(page, 300);
  const m1 = await page.getAttribute('#musicButton', 'aria-pressed');
  check('Music', 'Music toggles (started by the guest’s tap on “open”, button switches it)', m0 !== m1, `${m0} → ${m1}`);
  check('Console', 'No console errors during functional run', log.errors.length === 0, log.errors.join(' | '));
  await ctx.close();
}

// Web Share API path
{
  const { ctx, page } = await openPage(390, 844, { share: true });
  await page.click('#openInvitation'); await settle(page, 3800);
  await page.click('#shareButton'); await settle(page, 300);
  const d = await page.evaluate(() => window.__shared);
  check('Share', 'Web Share API used when available (title, text, url)', d && d.url === C.site.url && d.text === C.texts.shareText, JSON.stringify(d));
  await ctx.close();
}
// music must not start before interaction
{
  const { ctx, page } = await openPage(390, 844);
  await settle(page, 1500);
  check('Music', 'No music before the guest interacts', (await page.getAttribute('#musicButton', 'aria-pressed')) === 'false');
  await ctx.close();
}
// keyboard
{
  const { ctx, page } = await openPage(1440, 900);
  await page.keyboard.press('Enter'); // focus starts on the open button
  await settle(page, 3800);
  check('Keyboard', 'Invitation opens with the keyboard (Enter on focused button)', await page.evaluate(() => document.getElementById('envelopeScene').hidden));
  const stops = [];
  for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); stops.push(await page.evaluate(() => { const a = document.activeElement; return (a.id || a.getAttribute('data-nav') || a.className || a.tagName).toString().slice(0, 24); })); }
  check('Keyboard', 'Tab reaches buttons, links and the bottom nav', ['mapsLink', 'calendarToggle', 'home', 'shareButton', 'musicButton'].every((s) => stops.includes(s)), stops.join(' → '));
  const focusStyle = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  check('Keyboard', 'Visible focus indicator', focusStyle !== 'none', focusStyle);
  await ctx.close();
}
// reduced motion
{
  const { ctx, page } = await openPage(390, 844, { reduced: true });
  await page.click('#openInvitation'); await settle(page, 400);
  const st = await page.evaluate(() => [document.getElementById('envelopeScene').hidden, getComputedStyle(document.querySelector('.name-groom')).maskImage || getComputedStyle(document.querySelector('.name-groom')).webkitMaskImage]);
  check('Accessibility', 'prefers-reduced-motion: instant open, no masking/parallax', st[0] === true && (st[1] === 'none' || !st[1]), JSON.stringify(st));
  await shot(page, { path: path.join(SHOTS, 'reduced-motion-390.png') });
  await ctx.close();
}
// after the ceremony starts
{
  const { ctx, page } = await openPage(390, 844, { clock: new Date('2026-11-12T14:00:05Z') });
  await page.click('#openInvitation'); await page.clock.runFor(4000);
  const done = [await page.isVisible('#countdownDone'), await page.textContent('#countdownDone'), await page.isVisible('#countdownGrid')];
  check('Countdown', 'At 16:00 Gaza the countdown turns into the welcome message', done[0] === true && done[2] === false && done[1] === C.texts.countdownDone, done[1]);
  await page.evaluate(() => document.getElementById('countdown').scrollIntoView({ behavior: 'instant' }));
  await page.clock.runFor(2500);
  await shot(page, { path: path.join(SHOTS, 'countdown-after-start-390.png') });
  await ctx.close();
}
// colour contrast of text tokens (WCAG)
{
  const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const pairs = [['Espresso text on Ivory', '#30251E', '#FAF8F4', 4.5], ['Soft text #5A4A3D on Pearl', '#5A4A3D', '#F4EFE8', 4.5],
    ['Gold-ink #8A6A35 small text on Ivory', '#8A6A35', '#FAF8F4', 4.5], ['Gold-deep #6E5328 on Pearl', '#6E5328', '#F4EFE8', 4.5],
    ['Antique gold #A88348 (large display only) on Ivory', '#A88348', '#FAF8F4', 3], ['Button text on gold-ink', '#FFFDF8', '#8A6A35', 4.5]];
  for (const [n, a, b, min] of pairs) { const v = cr(a, b); check('Contrast', n, v >= min, `${v.toFixed(2)}:1 (min ${min})`); }
}
await browser.close();

// ------------------------------------------------------------ report
const ok = results.filter((r) => r.ok).length;
fs.writeFileSync(path.join(ROOT, 'qa', LIVE ? 'qa-results-live.json' : 'qa-results.json'), JSON.stringify({ base: BASE, date: new Date().toISOString(), ok, total: results.length, results }, null, 1));
const md = [`# QA ${LIVE ? '(live)' : '(local)'} — ${BASE}`, '', `**${ok}/${results.length} checks passed** — ${new Date().toISOString()}`, '',
  '| Group | Check | Result | Detail |', '|---|---|---|---|',
  ...results.map((r) => `| ${r.group} | ${r.name} | ${r.ok ? '✅' : '❌'} | ${r.detail.replace(/\|/g, '/').slice(0, 160)} |`)].join('\n');
fs.writeFileSync(path.join(ROOT, 'qa', LIVE ? 'QA_REPORT_LIVE.md' : 'QA_REPORT.md'), md + '\n');
console.log(`${ok}/${results.length} passed`);
results.filter((r) => !r.ok).forEach((r) => console.log('FAIL', r.group, '-', r.name, '-', r.detail));
