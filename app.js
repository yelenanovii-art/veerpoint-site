(function () {
  'use strict';

  /* ───────── Connecting ball ─────────
     Travels between real `.stop` elements on the page. As you scroll,
     the ball jumps from one terracotta stop to the next, sized to
     match each stop. Trail dots lag behind, drawing the "line"
     between consecutive stops. */

  const dotEl    = document.querySelector('.scroll-dot');
  const trailEls = Array.from(document.querySelectorAll('.scroll-trail-dot'));
  const ctaSection = document.getElementById('book');
  const quizDock   = document.getElementById('quizDock');
  const darkSelectors = ['#dashboard', '#process', '#markets', '#principle', '#talk'];

  // Signal to CSS that the JS ball is alive — hides the static fallback
  // quiz button so the morphed ball is the only visible CTA on desktop.
  if (dotEl) document.body.classList.add('ball-active');

  // Filter `.stop` elements down to ones inside true section headlines —
  // only stops nested inside an <h1> or <h2>. Skips card titles, founder
  // names, FAQ questions, stage names and any other smaller display text.
  function isTargetable(stop) {
    if (stop.closest('.nav, footer, .scroll-dot, .quiz-overlay, .top-strip')) return false;
    if (!stop.offsetParent && stop.getClientRects().length === 0) return false;
    return !!stop.closest('h1, h2');
  }

  let stops = [];
  function refreshStops() {
    stops = Array.from(document.querySelectorAll('.stop')).filter(isTargetable);
  }

  // Positions are in viewport pixels (because position: fixed)
  const ball = { x: 100, y: 100, vx: 0, vy: 0, size: 14, ts: 14, initialized: false };
  const trail = trailEls.map((_, i) => ({
    x: 100, y: 100, vx: 0, vy: 0,
    // Each trail dot is progressively softer, drawing a longer ribbon behind.
    k: [0.025, 0.016, 0.011][i] || 0.009,
    d: [0.92, 0.94, 0.95][i]    || 0.96,
  }));
  const target = { x: 100, y: 100, size: 14 };
  // Remember which stop we're currently "on" so we can add hysteresis to
  // target picking — a new stop has to be meaningfully more centered
  // before we hand off, which kills the twitchy back-and-forth when
  // multiple stops are visible at once.
  let currentStopEl = null;
  let nearCta = false;
  // Very gentle spring + heavy damping → slow, fluid drift instead of bouncy follow.
  const SPRING  = 0.018;
  const DAMPING = 0.94;
  // Hysteresis: a candidate stop must be at least N viewport-px closer to
  // center than our current pick before we switch. Higher = more committed.
  const SWITCH_THRESHOLD = 140;

  function pickTarget() {
    const vh = window.innerHeight || 1;
    const vw = window.innerWidth  || 1;
    const cy = vh / 2;

    // CTA-mode override — when the dock anchor (after the closing-list) is
    // in view, the ball morphs into the "Take the fit quiz" pill and lands
    // ON the dock so it sits in the content flow, not floating above.
    if (quizDock) {
      const dr = quizDock.getBoundingClientRect();
      const inCta = dr.top < vh * 0.80 && dr.bottom > vh * 0.10;
      if (inCta !== nearCta) {
        nearCta = inCta;
        document.body.classList.toggle('scroll-near-cta', inCta);
      }
      if (inCta) {
        target.x = dr.left + dr.width / 2;
        target.y = dr.top  + dr.height / 2;
        target.size = 56;
        return;
      }
    } else if (nearCta) {
      // dock missing on this page — clear morph state
      nearCta = false;
      document.body.classList.remove('scroll-near-cta');
    }

    // Pick the most-centered visible .stop in viewport, with hysteresis:
    // we only hand off to a new stop if it's meaningfully closer to
    // viewport center than the one we're currently riding. Keeps the ball
    // "committed" instead of twitching between adjacent stops.
    let best = null, bestDist = Infinity;
    let currentDist = Infinity;
    for (const s of stops) {
      const r = s.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) continue;
      const mid = r.top + r.height / 2;
      const dist = Math.abs(mid - cy);
      if (dist < bestDist) { bestDist = dist; best = s; }
      if (s === currentStopEl) currentDist = dist;
    }
    if (!best) return; // no visible stop — keep last target

    // Stay on current stop unless `best` is clearly more centered.
    let chosen = best;
    if (currentStopEl && currentStopEl !== best && currentDist - bestDist < SWITCH_THRESHOLD) {
      // Also make sure the current stop is still in view at all.
      const cr = currentStopEl.getBoundingClientRect();
      if (cr.bottom > -40 && cr.top < vh + 40) {
        chosen = currentStopEl;
      }
    }
    currentStopEl = chosen;

    const r = chosen.getBoundingClientRect();
    target.x = r.left + r.width / 2;
    // Visually the period sits on the text baseline — biasing slightly toward
    // the bottom of the bounding rect lands the ball on the actual dot.
    target.y = r.top  + r.height * 0.72;
    const fs = parseFloat(getComputedStyle(chosen).fontSize);
    target.size = Math.max(10, Math.min(26, fs * 0.18));
  }

  function tick() {
    // First frame after positions are known — snap ball + trail to target so
    // we don't see a long traversal from offscreen on initial load.
    if (!ball.initialized && (target.x !== 100 || target.y !== 100)) {
      ball.x = target.x; ball.y = target.y; ball.size = target.size;
      trail.forEach(t => { t.x = target.x; t.y = target.y; });
      ball.initialized = true;
      dotEl.classList.add('ready');
      trailEls.forEach(el => el.classList.add('ready'));
    }

    // Spring physics — position
    ball.vx = ball.vx * DAMPING + (target.x - ball.x) * SPRING;
    ball.vy = ball.vy * DAMPING + (target.y - ball.y) * SPRING;
    ball.x += ball.vx;
    ball.y += ball.vy;
    // Gentle lerp on size so the dot grows/shrinks at the same calm tempo as the motion.
    ball.size += (target.size - ball.size) * 0.025;

    if (dotEl) {
      dotEl.style.left = ball.x + 'px';
      dotEl.style.top  = ball.y + 'px';
      if (!nearCta) {
        const s = ball.size.toFixed(1) + 'px';
        dotEl.style.width  = s;
        dotEl.style.height = s;
      } else {
        dotEl.style.width  = '';
        dotEl.style.height = '';
      }
    }

    // Trail — each dot lerps toward the ball with its own k/d
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      const el = trailEls[i];
      t.vx = t.vx * t.d + (ball.x - t.x) * t.k;
      t.vy = t.vy * t.d + (ball.y - t.y) * t.k;
      t.x += t.vx;
      t.y += t.vy;
      if (el) {
        el.style.left = t.x + 'px';
        el.style.top  = t.y + 'px';
      }
    }

    // Dark-section contrast based on ball Y in viewport
    let onDark = false;
    for (const sel of darkSelectors) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top < ball.y && r.bottom > ball.y) { onDark = true; break; }
    }
    document.body.classList.toggle('scroll-on-dark', onDark);

    requestAnimationFrame(tick);
  }

  refreshStops();
  window.addEventListener('scroll', pickTarget, { passive: true });
  window.addEventListener('resize', () => { refreshStops(); pickTarget(); });
  // Re-collect after fonts load (font-size filter depends on layout)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { refreshStops(); pickTarget(); });
  }
  pickTarget();
  tick();

  /* ───────── Spotlight cards · cursor-tracking glow ─────────
     Pointer position written as --gx / --gy on each [data-glow] card.
     Card CSS uses those vars in a fixed-attachment radial gradient. */
  const glowCards = document.querySelectorAll('[data-glow]');
  if (glowCards.length) {
    let raf = 0, lastX = 0, lastY = 0;
    const flush = () => {
      raf = 0;
      for (const c of glowCards) {
        c.style.setProperty('--gx', lastX);
        c.style.setProperty('--gy', lastY);
      }
    };
    document.addEventListener('pointermove', (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!raf) raf = requestAnimationFrame(flush);
    }, { passive: true });
  }

  /* ───────── IntersectionObserver · reveal animations ───────── */
  const reveals = document.querySelectorAll('.vp-reveal, .vp-fade');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vp-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => io.observe(el));

  /* ───────── Hero · live ops floor terminal ───────── */
  (function initFloor() {
    const card  = document.getElementById('heroFloor');
    const list  = document.getElementById('floorFeed');
    const clock = document.getElementById('floorClock');
    const elPipe  = document.getElementById('floorPipe');
    const elDemos = document.getElementById('floorDemos');
    const elClose = document.getElementById('floorClose');
    if (!card || !list || !clock) return;

    const TEMPLATES = [
      { e: 'Demo booked',          v: null,        city: 'BLN · DE' },
      { e: 'Demo booked',          v: null,        city: 'LDN · UK' },
      { e: 'Demo booked',          v: null,        city: 'AMS · NL' },
      { e: 'Qualified · won',      v: null,        city: 'PAR · FR' },
      { e: 'Qualified · won',      v: null,        city: 'MAD · ES' },
      { e: 'Sequence sent',        v: '· 42 prospects', city: 'BCN · ES' },
      { e: 'Sequence sent',        v: '· 28 prospects', city: 'STK · SE' },
      { e: 'Proposal out',         v: null,        city: 'MIL · IT' },
      { e: 'Proposal out',         v: null,        city: 'DUB · IE' },
      { e: 'Discovery scheduled',  v: null,        city: 'CPH · DK' },
      { e: 'Discovery scheduled',  v: null,        city: 'BRU · BE' },
      { e: 'Closed',               v: '· €38k ARR', city: 'BLN · DE' },
      { e: 'Closed',               v: '· €72k ARR', city: 'LDN · UK' },
      { e: 'Closed',               v: '· €24k ARR', city: 'WAR · PL' },
      { e: 'Reply rate · 7d',      v: '· 6.8%',    city: 'AVG' },
      { e: 'Pipeline added',       v: '· €1.2M',   city: 'Q-LIVE' },
      { e: 'Call notes synced',    v: '· 14 calls', city: 'CRM' },
      { e: 'Negotiation · live',   v: null,        city: 'VIE · AT' },
      { e: 'Follow-up sent',       v: '· 31 threads', city: 'MUC · DE' },
      { e: 'Demo · rebooked',      v: null,        city: 'LIS · PT' },
    ];

    /* Build a starting feed with stamps walking backward from "now" */
    const MAX_ROWS = 11;
    const STEP_MS = 3400;

    let pipelineM = 4.2;
    let demos = 38;
    let closes = 12;

    function pad(n) { return String(n).padStart(2, '0'); }
    function bcnTime() {
      try {
        return new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false
        }).format(new Date());
      } catch (_) { return '--:--'; }
    }
    function stampFromOffsetSec(offsetSec) {
      const d = new Date(Date.now() - offsetSec * 1000);
      const h = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', hour12: false }).format(d);
      const m = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', minute: '2-digit' }).format(d);
      return h + ':' + pad(parseInt(m, 10));
    }
    function pick() {
      return TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    }
    function rowHTML(stamp, t) {
      const v = t.v ? ' <span class="v">' + t.v + '</span>' : '';
      return '<div class="t">' + stamp + '</div>' +
             '<div class="e">' + t.e + v + '</div>' +
             '<div class="c">' + t.city + '</div>';
    }
    function pushRow(t, isNew) {
      const stamp = isNew ? bcnTime() : stampFromOffsetSec((list.children.length + 1) * 70 + Math.floor(Math.random() * 40));
      const row = document.createElement('div');
      row.className = 'feed-row' + (isNew ? ' is-new' : '');
      row.innerHTML = rowHTML(stamp, t);
      list.prepend(row);
      while (list.children.length > MAX_ROWS) {
        list.removeChild(list.lastChild);
      }
      /* drift stats subtly to feel alive */
      if (isNew) {
        if (/Closed/.test(t.e))             { closes += 1; elClose.innerHTML = closes + '<span class="stop">.</span>'; }
        if (/Demo booked|Demo · rebooked/.test(t.e)) { demos += 1; elDemos.textContent = demos; }
        if (/Pipeline added|Proposal out|Qualified/.test(t.e)) {
          pipelineM = Math.round((pipelineM + 0.07 + Math.random() * 0.1) * 10) / 10;
          elPipe.textContent = '€' + pipelineM.toFixed(1) + 'M';
        }
      }
    }

    /* Seed initial rows · oldest at bottom, freshest at top */
    for (let i = MAX_ROWS - 1; i >= 0; i--) pushRow(pick(), false);

    clock.textContent = bcnTime();
    setInterval(() => { clock.textContent = bcnTime(); }, 1000);

    /* Cycle new events */
    setInterval(() => { pushRow(pick(), true); }, STEP_MS);
  })();

  /* ───────── Outcome curve · YOU-dot walks M01 → M06 on scroll ───────── */
  (function initCurve() {
    const section = document.getElementById('dashboard');
    const panel = document.getElementById('curvePanel');
    const path  = document.getElementById('curvePath');
    const trail = document.getElementById('curveTrail');
    const dot   = document.getElementById('curveDot');
    const label = document.getElementById('curveLabel');
    const stagesEl = document.getElementById('curveStages');
    if (!section || !panel || !path || !dot || !label || !trail || !stagesEl) return;

    let total = 0;
    function readPathLength() {
      try { total = path.getTotalLength() || 0; } catch (_) { total = 0; }
      if (total > 0) {
        trail.style.strokeDasharray  = total + ' ' + total;
        trail.style.strokeDashoffset = total;
      }
    }
    readPathLength();

    const stageSpans = Array.from(stagesEl.children);

    function setProgress(p) {
      if (!total) { readPathLength(); if (!total) return; }
      p = Math.max(0, Math.min(1, p));
      const pt = path.getPointAtLength(p * total);
      if (!pt || isNaN(pt.x)) return;

      dot.setAttribute('cx', pt.x.toFixed(2));
      dot.setAttribute('cy', pt.y.toFixed(2));

      trail.style.strokeDashoffset = (total * (1 - p)).toFixed(2);

      const month = Math.max(1, Math.min(6, Math.ceil(p * 6) || 1));
      const mLabel = 'YOU · M' + String(month).padStart(2, '0');
      if (label.textContent !== mLabel) label.textContent = mLabel;

      const labelX = Math.min(540, Math.max(2, pt.x - 14));
      const labelY = Math.max(20, pt.y - 14);
      label.setAttribute('x', labelX.toFixed(2));
      label.setAttribute('y', labelY.toFixed(2));

      stageSpans.forEach(s => s.classList.toggle('on', parseInt(s.dataset.m, 10) === month));
    }

    function compute() {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      /* progress = 0 when the section top reaches 70% of viewport;
         progress = 1 when the section bottom passes 30% of viewport. */
      const startY = vh * 0.70;   /* enter point · section top below this → still 0 */
      const endY   = vh * 0.30;   /* exit  point · section bottom above this → 1 */
      const sectionStartProgress = (startY - rect.top) / (rect.height + (startY - endY));
      setProgress(sectionStartProgress);
    }

    let raf = 0;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; compute(); });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', () => { readPathLength(); compute(); });

    /* Initial paint · path metrics may not be ready yet, run again on next frame */
    compute();
    requestAnimationFrame(() => { readPathLength(); compute(); });
  })();

  /* ───────── Europe map · hover-driven side panel + live clocks ───────── */
  (function initMap() {
    const stage  = document.getElementById('mapStage');
    const panel  = document.getElementById('mapPanel');
    if (!stage || !panel) return;

    const CITIES = {
      barcelona:  { name: 'Barcelona',  country: 'Spain · Operations HQ',     tz: 'Europe/Madrid',     zone: 'CET',  tier: 'HQ',     specialty: 'Full-cycle sales · founders’ team', engagements: 'Live ops · all stages',          desc: 'Where every engagement starts. Discovery, strategy and the senior operators who close. Calls into your buyers’ timezones, never ours.' },
      london:     { name: 'London',     country: 'United Kingdom · Hub',       tz: 'Europe/London',     zone: 'GMT',  tier: 'HUB',    specialty: 'Tech · SaaS · fintech buyers',                engagements: 'Senior ops on-call',              desc: 'Hub for UK and Ireland motions. English-language outbound, mid-market and enterprise SaaS, fintech ICPs covered weekly.' },
      berlin:     { name: 'Berlin',     country: 'Germany · Hub',              tz: 'Europe/Berlin',     zone: 'CET',  tier: 'HUB',    specialty: 'DACH · deep-tech · industrial',              engagements: 'German + English motions',        desc: 'DACH hub. Local-language sequences for Germany, Austria and German-speaking Switzerland. Deep-tech and B2B SaaS.' },
      stockholm:  { name: 'Stockholm',  country: 'Sweden · Hub',               tz: 'Europe/Stockholm',  zone: 'CET',  tier: 'HUB',    specialty: 'Nordic SaaS · hospitality · D2C',             engagements: 'Pan-Nordic outbound',             desc: 'Nordic hub. Stockholm, Oslo, Copenhagen, Helsinki coverage. SaaS, hospitality groups, premium D2C brands.' },
      madrid:     { name: 'Madrid',     country: 'Spain',                      tz: 'Europe/Madrid',     zone: 'CET',  tier: 'MARKET', specialty: 'Spanish SMB · real estate',                  engagements: 'ES outbound · weekly',            desc: 'Iberia coverage out of HQ. Spanish-language sequences for property, hospitality and SMB SaaS.' },
      lisbon:     { name: 'Lisbon',     country: 'Portugal',                   tz: 'Europe/Lisbon',     zone: 'WET',  tier: 'MARKET', specialty: 'PT · PALOP · startup founders',              engagements: 'EN + PT motions',                  desc: 'Founder-dense market. Portuguese-speaking sequences, plus English-first for startups.' },
      dublin:     { name: 'Dublin',     country: 'Ireland',                    tz: 'Europe/Dublin',     zone: 'GMT',  tier: 'MARKET', specialty: 'EU HQ buyers · EMEA leaders',                  engagements: 'Cross-Atlantic prep',              desc: 'EU HQs for US-headquartered tech companies. EMEA expansion plays into and out of Dublin.' },
      paris:      { name: 'Paris',      country: 'France',                     tz: 'Europe/Paris',      zone: 'CET',  tier: 'MARKET', specialty: 'FR · luxury · tech · hospitality',          engagements: 'French-language motions',          desc: 'Native French outbound. Luxury, hospitality, B2B SaaS, scaleups with French enterprise targets.' },
      brussels:   { name: 'Brussels',   country: 'Belgium',                    tz: 'Europe/Brussels',   zone: 'CET',  tier: 'MARKET', specialty: 'BeNeLux SMB · EU institutions',               engagements: 'Bilingual FR/NL',                  desc: 'BeNeLux coverage. FR/NL bilingual sequences. Useful corner for EU institutions and policy buyers.' },
      amsterdam:  { name: 'Amsterdam',  country: 'Netherlands',                tz: 'Europe/Amsterdam',  zone: 'CET',  tier: 'MARKET', specialty: 'NL tech · scale-ups · D2C',                  engagements: 'English-first NL motion',          desc: 'Dutch tech and scale-up market. English-first outbound, mid-market SaaS, premium D2C.' },
      copenhagen: { name: 'Copenhagen', country: 'Denmark',                    tz: 'Europe/Copenhagen', zone: 'CET',  tier: 'MARKET', specialty: 'Nordic SaaS · climate-tech',                engagements: 'Nordic motion ext.',                desc: 'Climate-tech, B2B SaaS, design-led products. Covered as part of the Stockholm hub motion.' },
      warsaw:     { name: 'Warsaw',     country: 'Poland',                     tz: 'Europe/Warsaw',     zone: 'CET',  tier: 'MARKET', specialty: 'CEE expansion · fintech',                    engagements: 'PL + EN motions',                  desc: 'Central-Eastern Europe entry market. Local-language and English-first outbound for fintech and SaaS.' },
      munich:     { name: 'Munich',     country: 'Germany',                    tz: 'Europe/Berlin',     zone: 'CET',  tier: 'MARKET', specialty: 'Industrial · enterprise SaaS',              engagements: 'DACH motion ext.',                 desc: 'Bavarian industrial and enterprise SaaS buyers. Covered as part of the Berlin hub motion.' },
      vienna:     { name: 'Vienna',     country: 'Austria',                    tz: 'Europe/Vienna',     zone: 'CET',  tier: 'MARKET', specialty: 'AT · CEE crossroads',                          engagements: 'DACH motion ext.',                 desc: 'Austria plus CEE crossroads. German-language outbound, mid-market SaaS, hospitality groups.' },
      milan:      { name: 'Milan',      country: 'Italy',                      tz: 'Europe/Rome',       zone: 'CET',  tier: 'MARKET', specialty: 'IT SMB · fashion-adjacent SaaS',            engagements: 'IT motions · weekly',           desc: 'Italian SMB and mid-market. Local-language sequences, fashion-adjacent SaaS and premium D2C.' },
      rome:       { name: 'Rome',       country: 'Italy',                      tz: 'Europe/Rome',       zone: 'CET',  tier: 'MARKET', specialty: 'IT enterprise · hospitality',                engagements: 'IT motion ext.',                  desc: 'Enterprise and hospitality coverage in central/southern Italy. Local-language outbound out of the Milan motion.' },
    };

    const order = ['barcelona','london','berlin','stockholm','paris','amsterdam','dublin','copenhagen','milan','rome','vienna','munich','madrid','lisbon','brussels','warsaw'];

    const elTime    = document.getElementById('mpTime');
    const elZone    = document.getElementById('mpZone');
    const elDelta   = document.getElementById('mpDelta');
    const elCity    = document.getElementById('mpCity');
    const elCountry = document.getElementById('mpCountry');
    const elTier    = document.getElementById('mpTier');
    const elSpec    = document.getElementById('mpSpec');
    const elEng     = document.getElementById('mpEng');
    const elDesc    = document.getElementById('mpDesc');
    const elIndex   = document.getElementById('mpIndex');

    let currentKey = 'barcelona';

    function localTime(tz) {
      try {
        return new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
      } catch (_) {
        return '--:--';
      }
    }
    function localHours(tz) {
      try {
        return parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }).format(new Date()), 10);
      } catch (_) {
        return 12;
      }
    }
    function tzDelta(tz) {
      if (tz === 'Europe/Madrid') return 'LOCAL';
      const here = localHours('Europe/Madrid');
      const there = localHours(tz);
      let diff = there - here;
      if (diff > 12) diff -= 24;
      if (diff < -12) diff += 24;
      if (diff === 0) return '± 0H VS HQ';
      const sign = diff > 0 ? '+' : '−';
      return sign + Math.abs(diff) + 'H VS HQ';
    }

    function setCity(key) {
      const c = CITIES[key];
      if (!c) return;
      currentKey = key;

      const idx = order.indexOf(key);
      elIndex.textContent = 'CITY · ' + String(idx + 1).padStart(2, '0') + ' / 16';
      elTier.textContent = c.tier;
      elCity.textContent = c.name;
      elCountry.textContent = c.country;
      elTime.textContent = localTime(c.tz);
      elZone.textContent = c.zone;
      elDelta.textContent = tzDelta(c.tz);
      elSpec.textContent = c.specialty;
      elEng.textContent = c.engagements;
      elDesc.textContent = c.desc;

      const markers = stage.querySelectorAll('.marker');
      const arcs = stage.querySelectorAll('.arc');
      markers.forEach(m => m.classList.toggle('is-focus', m.dataset.city === key));
      arcs.forEach(a => a.classList.toggle('is-focus', a.dataset.city === key));
      stage.classList.toggle('has-focus', key !== 'barcelona');
    }

    /* ───── Interactive state ─────
       pinnedKey   · a city locked by click/tap (null = unlocked)
       lastTouchAt · last hover/focus/click timestamp; used to pause auto-cycle
       cycleIdx    · current position in the auto-cycle rotation */
    let pinnedKey = null;
    let lastTouchAt = 0;
    let cycleIdx = 0;
    const HOVER_QUIET_MS = 1800;   // auto-cycle waits this long after last user action
    const CYCLE_MS       = 3200;   // tick interval

    const elHint = document.getElementById('mpHint');
    function syncHint() {
      if (!elHint) return;
      elHint.textContent = pinnedKey
        ? 'Pinned · click again to release'
        : 'Click any marker to pin';
    }
    function unpin() {
      pinnedKey = null;
      stage.classList.remove('has-pin');
      syncHint();
    }
    function pin(key) {
      pinnedKey = key;
      stage.classList.add('has-pin');
      syncHint();
    }

    /* Bind hover / focus / click on each marker */
    stage.querySelectorAll('.marker').forEach(m => {
      const key = m.dataset.city;
      m.addEventListener('pointerenter', () => {
        lastTouchAt = Date.now();
        if (!pinnedKey) {
          setCity(key);
          // keep the auto-cycle index in sync so it resumes near where the user was
          const i = order.indexOf(key);
          if (i >= 0) cycleIdx = i;
        }
      });
      m.addEventListener('focusin', () => {
        lastTouchAt = Date.now();
        if (!pinnedKey) {
          setCity(key);
          const i = order.indexOf(key);
          if (i >= 0) cycleIdx = i;
        }
      });
      m.addEventListener('click', (e) => {
        e.stopPropagation();
        lastTouchAt = Date.now();
        if (pinnedKey === key) { unpin(); setCity('barcelona'); }
        else                   { pin(key); setCity(key); }
      });
      m.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (pinnedKey === key) { unpin(); setCity('barcelona'); }
          else                   { pin(key); setCity(key); }
        }
      });
      m.setAttribute('tabindex', '0');
      m.setAttribute('role', 'button');
      m.setAttribute('aria-label', (CITIES[key] && CITIES[key].name) || key);
    });

    /* Leaving the stage returns to HQ — but only if nothing is pinned */
    stage.addEventListener('pointerleave', () => {
      if (!pinnedKey) setCity('barcelona');
    });

    /* Click on empty stage area unpins */
    stage.addEventListener('click', (e) => {
      if (e.target.closest('.marker')) return; // marker clicks handled above
      if (pinnedKey) { unpin(); setCity('barcelona'); }
    });

    /* Esc unpins from anywhere */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && pinnedKey) { unpin(); setCity('barcelona'); }
    });

    /* Auto-cycle when idle · the map feels alive even when no one's hovering.
       Pauses when pinned, when user is interacting, or when stage isn't in view. */
    setInterval(() => {
      if (pinnedKey) return;
      if (Date.now() - lastTouchAt < HOVER_QUIET_MS) return;
      if (!stage.classList.contains('vp-in')) return;
      cycleIdx = (cycleIdx + 1) % order.length;
      setCity(order[cycleIdx]);
    }, CYCLE_MS);

    /* Live-clock tick · refresh every second for current city */
    setInterval(() => {
      const c = CITIES[currentKey];
      if (!c) return;
      elTime.textContent = localTime(c.tz);
      elDelta.textContent = tzDelta(c.tz);
    }, 1000);

    /* Initial paint */
    setCity('barcelona');
    stage.classList.remove('has-focus');
  })();

  /* ───────── Fit quiz · 5 Qs, scored, result ───────── */
  const QUIZ = [
    {
      eyebrow: 'Q · 01 of 05',
      q: 'Where are you in your sales motion right now?',
      opts: [
        ['Funded and launched. Founders still on every call.', 3],
        ['Existing team. Need to enter a new market or segment.', 3],
        ['Working sales motion, but plateauing on output.', 2],
        ['Just exploring, pre-funding or pre-product.', 0],
      ]
    },
    {
      eyebrow: 'Q · 02 of 05',
      q: 'Funding and stage?',
      opts: [
        ['Pre-seed → Series A · raised in the last 24 months.', 3],
        ['Series A+ · revenue-scaling, expansion mode.', 3],
        ['Post-exit founders building the next thing.', 3],
        ['Bootstrapped, profitable.', 2],
        ['Not raised yet.', 0],
      ]
    },
    {
      eyebrow: 'Q · 03 of 05',
      q: 'Average deal size · annual contract value?',
      opts: [
        ['$10k+ ARR · mid-market or enterprise.', 3],
        ['$2k → $10k ARR · SMB-heavy.', 3],
        ['Under $2k ARR · PLG-led.', 1],
        ['Not sure yet, pricing still moving.', 1],
      ]
    },
    {
      eyebrow: 'Q · 04 of 05',
      q: 'Where is revenue actually stuck today?',
      opts: [
        ['No pipeline · we don’t know who to call.', 3],
        ['Pipeline exists, but conversion is poor.', 3],
        ['Founders carrying every deal personally.', 3],
        ['Capped by hiring · can’t add headcount this quarter.', 3],
        ['Honestly, not sure where the leak is.', 2],
      ]
    },
    {
      eyebrow: 'Q · 05 of 05',
      q: 'When do you need a working motion?',
      opts: [
        ['This quarter · investors are watching.', 3],
        ['Within the next 6 months.', 3],
        ['Within a year, no acute pressure.', 2],
        ['No real urgency.', 1],
      ]
    },
  ];

  const overlay = document.getElementById('quiz');
  const stage = document.getElementById('quiz-stage');
  const progress = document.querySelector('.quiz-progress');
  let state = { i: 0, scores: [] };

  function renderQuestion() {
    const Q = QUIZ[state.i];
    progress.style.setProperty('--p', ((state.i + 1) / (QUIZ.length + 1) * 100) + '%');
    stage.innerHTML = `
      <div class="quiz-eyebrow">${Q.eyebrow}</div>
      <h3 class="quiz-q">${Q.q.replace(/\.$/, '<span class="stop">.</span>').replace(/\?$/, '<span class="stop">?</span>')}</h3>
      <div class="quiz-opts">
        ${Q.opts.map((o, idx) => `<button class="quiz-opt" data-score="${o[1]}" data-idx="${idx}">${o[0]}</button>`).join('')}
      </div>
      <div class="quiz-nav">
        <button class="quiz-back" type="button" ${state.i === 0 ? 'disabled' : ''} data-back>← Back</button>
        <span>${state.i + 1} of ${QUIZ.length}</span>
      </div>
    `;
    stage.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        state.scores[state.i] = parseInt(btn.dataset.score, 10);
        if (state.i < QUIZ.length - 1) {
          state.i += 1;
          renderQuestion();
        } else {
          renderResult();
        }
      });
    });
    const back = stage.querySelector('[data-back]');
    if (back) back.addEventListener('click', () => {
      if (state.i > 0) { state.i -= 1; renderQuestion(); }
    });
  }

  function renderResult() {
    const total = state.scores.reduce((a, b) => a + b, 0);
    const max = 15;
    progress.style.setProperty('--p', '100%');

    let tag, tagClass, h, body;
    if (total >= 13) {
      tag = 'Fit · move fast';
      tagClass = '';
      h = 'You’re our sweet spot<span class="stop">.</span>';
      body = 'Funded, motion gap is real, urgency is now. A 6-month cycle will give you a forecastable pipeline by Stage 02 and closed business in Stage 03. Discovery call is the next step.';
    } else if (total >= 9) {
      tag = 'Worth a call';
      tagClass = 'warm';
      h = 'Promising. Discovery will sort it<span class="stop">.</span>';
      body = 'There’s a real gap here, but the right shape isn’t obvious from the answers alone. A 30-minute Discovery call will tell both of us whether Veerpoint is the right tool, or whether we’d point you to a hire instead.';
    } else {
      tag = 'Not yet · we’d be honest';
      tagClass = 'cool';
      h = 'We’d probably wait. Or send you elsewhere<span class="stop">.</span>';
      body = 'Either the urgency, the funding, or the deal economics suggest a 6-month senior-operator engagement isn’t the right tool right now. Happy to point you at a junior hire, a contractor, or back to founder-led for another quarter. Tell us where you’re actually stuck.';
    }

    stage.innerHTML = `
      <div class="quiz-eyebrow">Result · score ${total} / ${max}</div>
      <span class="quiz-result-tag ${tagClass}">${tag}</span>
      <h3 class="quiz-result-h">${h}</h3>
      <p class="quiz-result-body">${body}</p>
      <div class="quiz-result-ctas">
        <a class="btn btn-primary" href="#book" data-quiz-close>Book a Discovery call <span class="arrow">→</span></a>
        <button class="btn btn-ghost" type="button" data-quiz-restart>Retake the quiz</button>
      </div>
    `;

    stage.querySelectorAll('[data-quiz-close]').forEach(b => b.addEventListener('click', closeQuiz));
    const restart = stage.querySelector('[data-quiz-restart]');
    if (restart) restart.addEventListener('click', () => { state = { i: 0, scores: [] }; renderQuestion(); });
  }

  function openQuiz() {
    state = { i: 0, scores: [] };
    renderQuestion();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeQuiz() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-quiz]').forEach(el => el.addEventListener('click', (e) => {
    e.preventDefault();
    openQuiz();
  }));
  document.querySelectorAll('[data-quiz-close]').forEach(el => el.addEventListener('click', closeQuiz));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeQuiz(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeQuiz();
  });
})();

/* ───────── Cursor / touch dot · the brand stop, following the pointer ─────────
   Desktop: small terracotta circle trailing the cursor with a smooth lerp,
   swelling when over interactive elements.
   Touch:   same dot appears at the touch point, follows finger drag, fades
   out shortly after release. Hidden under prefers-reduced-motion. */
(function initCursorDot() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  if (isCoarse) dot.classList.add('touch');
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let dx = mx, dy = my;        // current rendered position
  let visible = false;
  let overInteractive = false;
  let fadeTimer = null;

  function setOver(on) {
    if (on === overInteractive) return;
    overInteractive = on;
    dot.classList.toggle('over', on);
  }
  function show() {
    if (visible) return;
    visible = true;
    dot.classList.add('show');
  }
  function hide() {
    visible = false;
    dot.classList.remove('show');
    dot.classList.remove('over');
    overInteractive = false;
  }
  function scheduleHide(ms) {
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(hide, ms);
  }

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    show();
    const t = e.target;
    const isClick = !!(t && t.closest && t.closest('a, button, [data-quiz], .marker, .quiz-opt, [role="button"]'));
    setOver(isClick);
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      // On touch we only show while the finger is on screen — keep refreshing
      // the auto-hide so a held drag stays visible.
      scheduleHide(900);
    }
  }, { passive: true });

  window.addEventListener('pointerdown', (e) => {
    mx = e.clientX;
    my = e.clientY;
    // snap when the touch starts so the dot doesn't fly in from offscreen
    if (!visible) { dx = mx; dy = my; }
    show();
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      dot.classList.add('tap');
      setTimeout(() => dot.classList.remove('tap'), 280);
    }
  }, { passive: true });

  window.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      scheduleHide(600);
    }
  }, { passive: true });

  window.addEventListener('pointercancel', () => scheduleHide(200), { passive: true });

  // Mouse-only: hide when the cursor leaves the viewport.
  document.addEventListener('mouseleave', () => {
    if (!isCoarse) hide();
  });

  /* lerp factor — small = slower, more fluid lag behind pointer.
     Touch wants a snappier follow so it doesn't trail behind a fast drag. */
  const LERP = isCoarse ? 0.32 : 0.18;

  function frame() {
    dx += (mx - dx) * LERP;
    dy += (my - dy) * LERP;
    dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
