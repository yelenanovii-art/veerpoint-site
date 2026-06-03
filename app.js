(function () {
  'use strict';

  /* ───────── Connecting ball ─────────
     Travels between real `.stop` elements on the page. As you scroll,
     the ball jumps from one terracotta stop to the next, sized to
     match each stop. Trail dots lag behind, drawing the "line"
     between consecutive stops. */

  // Mobile MVP: the scroll-following ball is desktop-only. Detect coarse
  // pointers up front and bail before doing any DOM work or attaching the
  // rAF loop — saves CPU on phones and removes the "bouncy" feel users
  // reported. Cursor follower (further down the file) stays on desktop.
  const IS_COARSE_POINTER = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const dotEl    = IS_COARSE_POINTER ? null : document.querySelector('.scroll-dot');
  const trailEls = IS_COARSE_POINTER ? [] : Array.from(document.querySelectorAll('.scroll-trail-dot'));
  const ctaSection = document.getElementById('book');
  const quizDock   = document.getElementById('quizDock');
  const darkSelectors = ['#dashboard', '#process', '#markets', '#principle', '#talk'];

  // Signal to CSS that the JS ball is alive — hides the static fallback
  // quiz button so the morphed ball is the only visible CTA on desktop.
  if (dotEl) document.body.classList.add('ball-active');

  // When the ball is morphed into the "Take the fit quiz" pill (body has
  // `scroll-near-cta`), clicking it should actually open the quiz. The
  // fallback button beneath has the right handler bound on each page
  // (data-quiz handler on about/pricing/how-it-works, or onclick=vpQuizOpen
  // on index.html), but it's set to pointer-events:none so the ball
  // doesn't get double-clicks. Delegate the click programmatically.
  if (dotEl) {
    dotEl.addEventListener('click', () => {
      if (!document.body.classList.contains('scroll-near-cta')) return;
      const fallback = document.querySelector('.quiz-dock-fallback');
      if (fallback) fallback.click();
    });
  }

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

  // Touch viewports fling-scroll much faster than mouse wheels, so the
  // same spring values that feel fluid on desktop look frantic on mobile.
  // Detect coarse pointers and run the ball noticeably calmer.
  const IS_TOUCH = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // Positions are in viewport pixels (because position: fixed)
  const ball = { x: 100, y: 100, vx: 0, vy: 0, size: 14, ts: 14, initialized: false };
  const trail = trailEls.map((_, i) => ({
    x: 100, y: 100,
    // Each trail dot lerps toward the lead ball at a slower rate so they
    // draw a short ribbon behind it. Decelerating lerp (no stored velocity)
    // so trail dots also arrive cleanly without oscillating around the dot.
    lerp: [0.085, 0.060, 0.040][i] || 0.030,
  }));
  const target = { x: 100, y: 100, size: 14 };
  // Remember which stop we're currently "on" so we can add hysteresis to
  // target picking — a new stop has to be meaningfully more centered
  // before we hand off, which kills the twitchy back-and-forth when
  // multiple stops are visible at once.
  let currentStopEl = null;
  let nearCta = false;
  // Decelerating lerp toward target. Replaces the previous spring/damping
  // model which stored velocity and oscillated around the target before
  // settling — that produced the "slowly bouncing around the arriving dot"
  // feel. Lerp asymptotes into the target with no overshoot.
  const POS_LERP  = IS_TOUCH ? 0.10 : 0.16;
  // Hysteresis: a candidate stop must be at least N viewport-px closer to
  // center than our current pick before we switch. Higher = more committed.
  // Touch flings scroll past multiple headings fast; raising the threshold
  // there keeps the ball from hopping between targets mid-fling.
  const SWITCH_THRESHOLD = IS_TOUCH ? 240 : 140;
  // Size lerp tempo — slower on touch so the ball doesn't pulse when scrolling.
  const SIZE_LERP = IS_TOUCH ? 0.012 : 0.025;
  // Snap-to-target threshold: once we're within this many pixels of the
  // target, just lock to it. Kills the asymptotic crawl in the final pixel.
  const SNAP_PX = 0.5;

  function pickTarget() {
    const vh = window.innerHeight || 1;
    const vw = window.innerWidth  || 1;
    const cy = vh / 2;

    // CTA-mode override — desktop only. When the dock anchor is in view the
    // ball morphs into the "Take the fit quiz" pill at the dock. On touch
    // the ball lives on the right edge as a scroll-guide indicator, so a
    // 240px pill on the right would overflow off-screen.
    if (quizDock && !IS_TOUCH) {
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
      // dock missing on this page (or touch mode) — clear morph state
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
    // Visually the period sits on the text baseline — biasing slightly toward
    // the bottom of the bounding rect lands the ball on the actual dot.
    target.y = r.top  + r.height * 0.72;
    if (IS_TOUCH) {
      // Touch: pin to the right edge as a scroll-guide indicator. Y still
      // tracks the current section's headline so the dot drifts down the
      // edge as the user moves through the page.
      target.x = vw - 22;
      target.size = 12;
    } else {
      target.x = r.left + r.width / 2;
      const fs = parseFloat(getComputedStyle(chosen).fontSize);
      target.size = Math.max(10, Math.min(26, fs * 0.18));
    }
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

    // Position lerp · no stored velocity, so the ball decelerates into the
    // target and stops. Snap once we're inside SNAP_PX so we don't crawl
    // the last fraction of a pixel forever.
    const dx = target.x - ball.x;
    const dy = target.y - ball.y;
    if (Math.abs(dx) < SNAP_PX && Math.abs(dy) < SNAP_PX) {
      ball.x = target.x; ball.y = target.y;
    } else {
      ball.x += dx * POS_LERP;
      ball.y += dy * POS_LERP;
    }
    // Gentle lerp on size so the dot grows/shrinks at the same calm tempo as the motion.
    ball.size += (target.size - ball.size) * SIZE_LERP;

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

    // Trail — each dot lerps toward the ball at its own rate.
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      const el = trailEls[i];
      t.x += (ball.x - t.x) * t.lerp;
      t.y += (ball.y - t.y) * t.lerp;
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

  // Skip the entire connecting-ball runtime on touch — no scroll listener,
  // no rAF loop, no DOM writes. Frees CPU on phones and kills the bouncy
  // feel users flagged. Desktop behavior unchanged.
  if (!IS_COARSE_POINTER) {
    refreshStops();
    window.addEventListener('scroll', pickTarget, { passive: true });
    window.addEventListener('resize', () => { refreshStops(); pickTarget(); });
    // Re-collect after fonts load (font-size filter depends on layout)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { refreshStops(); pickTarget(); });
    }
    pickTarget();
    tick();
  }

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
    const STEP_MS = 1700;

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

  /* ───────── Europe map · FLOOR · LIVE ticker + country highlight ─────────
     Right column of the map hosts a terminal-style ticker. Each tick
     prepends a fresh row, trims the oldest past FLOOR_MAX, and pulses
     the country marker for that row's data-country. Paused via
     IntersectionObserver when the map is off-screen. */
  (function initMapFeed() {
    const stage     = document.getElementById('mapStage');
    const floorList = document.getElementById('mapFloorList');
    if (!stage || !floorList) return;

    const markers = Array.from(stage.querySelectorAll('.marker'));
    const arcs    = Array.from(stage.querySelectorAll('.arc'));

    const CYCLE_MS  = 2750;
    const FLOOR_MAX = 4;     // max rows visible in the ticker

    /* Rotation pool · mix of progression milestones and live sales events.
       The cycler picks each in turn and prepends as a fresh row. */
    const FEED = [
      { country: 'ES', city: 'Madrid',     title: 'Deal closed · €38k ARR',          time: 'now' },
      { country: 'UK', city: 'London',     title: 'Pipeline updated · €1.2M added',  time: '2m'  },
      { country: 'NL', city: 'Amsterdam',  title: 'Sequence sent · 28 prospects',    time: '5m'  },
      { country: 'IT', city: 'Milan',      title: 'M3 · First repeatable closes',    time: '12m' },
      { country: 'FR', city: 'Paris',      title: 'Partnership signed',              time: '24m' },
      { country: 'IE', city: 'Dublin',     title: 'Demo moved · Thursday 16:00',     time: '38m' },
      { country: 'ES', city: 'Madrid',     title: 'M6 · Engine self-sustaining',     time: '1h'  },
      { country: 'GR', city: 'Athens',     title: 'Sequence sent · 42 prospects',    time: '1h'  },
      { country: 'BE', city: 'Brussels',   title: 'Pipeline updated · €380k added',  time: '1h'  },
      { country: 'CY', city: 'Nicosia',    title: 'Demo booked · Wed 11:00 EET',     time: '2h'  },
      { country: 'UK', city: 'London',     title: 'M1 · Foundations live',           time: '2h'  },
      { country: 'ES', city: 'Barcelona',  title: 'Partnership signed',              time: '3h'  },
    ];

    /* City → 3-letter code used in the right column of each ticker row */
    const CITY_CODES = {
      Madrid: 'MAD', Barcelona: 'BCN', London: 'LDN', Amsterdam: 'AMS',
      Paris: 'PAR', Dublin: 'DUB', Milan: 'MIL', Athens: 'ATH',
      Brussels: 'BRU', Nicosia: 'NIC',
    };

    /* Country highlight syncs to whichever row is at the top. Clearing
       is-focus then forcing a reflow guarantees the CSS pulse animation
       re-triggers every tick, even if the same country lights up twice
       in a row. */
    function highlightCountry(code) {
      markers.forEach(m => m.classList.remove('is-focus'));
      arcs.forEach(a    => a.classList.remove('is-focus'));
      void stage.offsetWidth;
      markers.forEach(m => { if (m.dataset.country === code) m.classList.add('is-focus'); });
      arcs.forEach(a    => { if (a.dataset.country === code) a.classList.add('is-focus'); });
      stage.classList.add('has-focus');
    }

    /* Build one ticker row · 3-col grid (time / event / city · country) */
    function makeRow(n) {
      const row = document.createElement('div');
      row.className = 'feed-row is-new';
      row.dataset.country = n.country;
      const code = CITY_CODES[n.city] || (n.city || '').slice(0, 3).toUpperCase();
      row.innerHTML =
        '<div class="t">' + n.time + '</div>' +
        '<div class="e">' + n.title + '</div>' +
        '<div class="c">' + code + ' · ' + n.country + '</div>';
      setTimeout(() => row.classList.remove('is-new'), 1000);
      return row;
    }

    /* Position-based time labels so the top row is always 'now' and
       each row below it reads as progressively older. Decoupling the
       label from the FEED entry's own time field guarantees the
       visible feed is always chronological regardless of FEED order
       or cycle wrap. */
    const TIME_SLOTS = ['now', '3m', '12m', '1h'];
    function relabelTimes() {
      const rows = floorList.children;
      for (let i = 0; i < rows.length && i < TIME_SLOTS.length; i++) {
        const t = rows[i].querySelector('.t');
        if (t) t.textContent = TIME_SLOTS[i];
      }
    }

    /* Prepend the new row, trim the oldest if we're over FLOOR_MAX, and
       pulse the matching country marker. */
    let feedIdx = 0;
    function pushRow() {
      const n = FEED[feedIdx % FEED.length];
      feedIdx++;
      const row = makeRow(n);
      floorList.insertBefore(row, floorList.firstChild);
      if (floorList.children.length > FLOOR_MAX) {
        const last = floorList.lastElementChild;
        last.style.transition = 'opacity 0.12s ease, max-height 0.16s ease, padding 0.16s ease';
        last.style.maxHeight = last.getBoundingClientRect().height + 'px';
        void last.offsetWidth;
        requestAnimationFrame(() => {
          last.style.opacity = '0';
          last.style.maxHeight = '0';
          last.style.paddingTop = '0';
          last.style.paddingBottom = '0';
        });
        setTimeout(() => last.remove(), 160);
      }
      relabelTimes();
      highlightCountry(n.country);
    }

    // Pre-rendered HTML ticker rows may have mis-ordered times if the
    // FEED data evolves — relabel them on init so the very first paint
    // is chronological too.
    relabelTimes();

    let timer = null;
    function startCycle() { if (!timer) timer = setInterval(pushRow, CYCLE_MS); }
    function stopCycle()  { if (timer) { clearInterval(timer); timer = null; } }

    /* Pause the cycle when the map scrolls off-screen — battery friendly
       and avoids 50 unseen ticks queuing up. */
    const ioCycle = new IntersectionObserver((entries) => {
      entries.forEach(e => e.isIntersecting ? startCycle() : stopCycle());
    }, { threshold: 0.15 });
    ioCycle.observe(stage);

    // Initial paint · highlight whatever country is at the top of the
    // pre-rendered ticker so the map matches on first view.
    const firstRow = floorList.querySelector('.feed-row');
    if (firstRow) highlightCountry(firstRow.dataset.country);

    /* Live clock for the FLOOR header */
    const elFloorClock = document.getElementById('mapFloorClock');
    if (elFloorClock) {
      const pad = (n) => String(n).padStart(2, '0');
      const paintClock = () => {
        const d = new Date();
        elFloorClock.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
      };
      paintClock();
      setInterval(paintClock, 30000);
    }
  })();

  /* ───────── Real Europe map · D3 + Natural Earth TopoJSON ─────────
     Loads the public-domain world-atlas TopoJSON via CDN, filters to
     European countries, projects them through d3.geoConicConformal
     centred on 15°E / 52°N, renders into a <g class="d3-countries">
     layer inside the existing .map-svg. When that succeeds the hand-
     traced .europe-landmass path hides itself so we don't double up.
     Drag the map to rotate longitude (phi) and tilt latitude (theta);
     the existing markers, arcs, country labels, and FLOOR · LIVE
     highlight integration all keep working because we sit underneath
     them in the SVG paint order. */
  (async function initEuropeD3() {
    const stage = document.getElementById('mapStage');
    if (!stage) return;
    const svg = stage.querySelector('.map-svg');
    if (!svg) return;

    // Wait briefly for the deferred D3 + topojson scripts to settle.
    for (let tries = 0; tries < 30; tries++) {
      if (window.d3 && window.topojson) break;
      await new Promise(r => setTimeout(r, 100));
    }
    if (!window.d3 || !window.topojson) {
      // CDN failed — fall back to the hand-traced path that's already
      // in the SVG. Nothing to do.
      return;
    }

    // ISO 3166-1 numeric IDs for European countries the world-atlas
    // 110m file uses. Includes a generous list so border edges read
    // continuous (Russia/Turkey/Belarus/etc. trimmed by the viewBox).
    const EUROPE_IDS = new Set([
      '008','020','040','056','070','100','112','191','196','203','208',
      '233','246','250','268','276','292','300','336','348','352','372',
      '380','428','438','440','442','470','492','498','499','528','578',
      '616','620','642','643','674','688','703','705','724','752','756',
      '792','804','807','826'
    ]);

    let world;
    try {
      const resp = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
      if (!resp.ok) throw new Error('atlas fetch ' + resp.status);
      world = await resp.json();
    } catch (e) {
      return;
    }

    const countries = window.topojson.feature(world, world.objects.countries);
    const europe = countries.features.filter(f => EUROPE_IDS.has(String(f.id)));
    if (!europe.length) return;

    const VW = 760, VH = 600;

    // Drag offsets — phi rotates longitude, theta tilts latitude.
    let phi = 0, theta = 0;
    function makeProjection() {
      return window.d3.geoConicConformal()
        .rotate([-15 + phi, 0])
        .center([0, 52 + theta])
        .parallels([40, 65])
        .scale(900)
        .translate([VW / 2, VH / 2]);
    }

    let projection = makeProjection();
    let pathGen = window.d3.geoPath(projection);

    // Insert the country layer behind everything else inside the SVG
    // so markers, arcs, and labels sit on top.
    const SVG_NS = 'http://www.w3.org/2000/svg';
    let countryG = svg.querySelector('.d3-countries');
    if (!countryG) {
      countryG = document.createElementNS(SVG_NS, 'g');
      countryG.setAttribute('class', 'd3-countries');
      const defs = svg.querySelector('defs');
      if (defs && defs.nextSibling) {
        svg.insertBefore(countryG, defs.nextSibling);
      } else {
        svg.insertBefore(countryG, svg.firstChild);
      }
    }

    function renderCountries() {
      // Use D3 join semantics manually to keep the file dep-free of D3-
      // selection helpers we don't already use elsewhere.
      const existing = countryG.querySelectorAll('path');
      europe.forEach((feature, i) => {
        let el = existing[i];
        if (!el) {
          el = document.createElementNS(SVG_NS, 'path');
          el.setAttribute('class', 'd3-country');
          el.setAttribute('data-id', String(feature.id));
          countryG.appendChild(el);
        }
        const d = pathGen(feature);
        if (d) el.setAttribute('d', d);
      });
      // Remove any extras (shouldn't happen with stable data but cheap)
      for (let i = europe.length; i < existing.length; i++) {
        existing[i].remove();
      }
    }

    /* City coordinates · lng / lat in the order d3 expects. Used to
       reposition every overlay (markers, HQ arcs, LIVE pills) on the
       same projection as the country fills so they track together
       when the user drags or the map auto-drifts. */
    const CITY_COORDS = {
      barcelona: [2.1734, 41.3851],
      madrid:    [-3.7038, 40.4168],
      dublin:    [-6.2603, 53.3498],
      london:    [-0.1278, 51.5074],
      paris:     [2.3522, 48.8566],
      brussels:  [4.3517, 50.8503],
      amsterdam: [4.9041, 52.3676],
      milan:     [9.1900, 45.4642],
      athens:    [23.7275, 37.9838],
      nicosia:   [33.3823, 35.1856],
    };

    const VB_W = 760, VB_H = 600;
    const markers = Array.from(svg.querySelectorAll('.marker[data-city]'));
    const arcs    = Array.from(svg.querySelectorAll('.arc[data-city]'));
    const pills   = Array.from(document.querySelectorAll('.globe-pill[data-city]'));

    /* One-time normalise of the static markers: shift every child cx/cy
       (and text x/y) by the existing dot anchor so the parent <g>'s
       transform becomes the single source of truth for position. After
       this, repositionOverlays() just sets transform=translate(x,y). */
    markers.forEach(g => {
      if (g.dataset.normalised === 'true') return;
      const dot = g.querySelector('.marker-dot');
      if (!dot) return;
      const ax = parseFloat(dot.getAttribute('cx') || '0');
      const ay = parseFloat(dot.getAttribute('cy') || '0');
      g.querySelectorAll('[cx]').forEach(el => {
        el.setAttribute('cx', parseFloat(el.getAttribute('cx') || '0') - ax);
        el.setAttribute('cy', parseFloat(el.getAttribute('cy') || '0') - ay);
      });
      g.querySelectorAll('text').forEach(el => {
        el.setAttribute('x', parseFloat(el.getAttribute('x') || '0') - ax);
        el.setAttribute('y', parseFloat(el.getAttribute('y') || '0') - ay);
      });
      g.dataset.normalised = 'true';
    });

    function repositionOverlays() {
      // Markers: simple translate of the group origin.
      markers.forEach(g => {
        const coords = CITY_COORDS[g.dataset.city];
        if (!coords) return;
        const pt = projection(coords);
        if (!pt || !isFinite(pt[0]) || !isFinite(pt[1])) return;
        g.setAttribute('transform', `translate(${pt[0]}, ${pt[1]})`);
      });

      // Arcs from Barcelona HQ to each other city · quadratic with the
      // control point lifted off the midpoint so the arc reads as a
      // 'flight path'. Path length recalculated so the stroke-dasharray
      // draw-in animation still works.
      const hq = projection(CITY_COORDS.barcelona);
      if (hq && isFinite(hq[0])) {
        arcs.forEach(p => {
          const coords = CITY_COORDS[p.dataset.city];
          if (!coords) return;
          const target = projection(coords);
          if (!target || !isFinite(target[0])) return;
          const mx = (hq[0] + target[0]) / 2;
          const my = (hq[1] + target[1]) / 2;
          const dx = target[0] - hq[0];
          const dy = target[1] - hq[1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          const arch = Math.min(38, dist * 0.18);
          const cpx = mx;
          const cpy = my - arch;
          p.setAttribute('d', `M ${hq[0]} ${hq[1]} Q ${cpx} ${cpy} ${target[0]} ${target[1]}`);
          // Keep --len roughly accurate so the stroke-dasharray draw-in
          // animation lands cleanly even after the path changes.
          try {
            const len = p.getTotalLength();
            if (isFinite(len) && len > 0) p.style.setProperty('--len', len.toFixed(0));
          } catch (_) { /* getTotalLength can throw on degenerate paths */ }
        });
      }

      // LIVE pills: percentages of the SVG viewBox, which the .map-stage
      // closely matches at the existing 5:4 aspect.
      pills.forEach(pill => {
        const coords = CITY_COORDS[pill.dataset.city];
        if (!coords) return;
        const pt = projection(coords);
        if (!pt || !isFinite(pt[0])) return;
        pill.style.setProperty('--x', ((pt[0] / VB_W) * 100).toFixed(2) + '%');
        pill.style.setProperty('--y', ((pt[1] / VB_H) * 100).toFixed(2) + '%');
      });
    }

    // Re-render everything on every projection update.
    const _renderCountries = renderCountries;
    renderCountries = function () { _renderCountries(); repositionOverlays(); };

    renderCountries();

    // Hide the hand-traced landmass now that the real one is live.
    const handTraced = svg.querySelector('.europe-landmass');
    if (handTraced) handTraced.classList.add('is-replaced');

    // Drag-to-rotate. Pointer events so it works with touch + mouse.
    let dragging = null;
    function onPointerDown(e) {
      dragging = { x: e.clientX, y: e.clientY };
      svg.style.cursor = 'grabbing';
      svg.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - dragging.x;
      const dy = e.clientY - dragging.y;
      dragging = { x: e.clientX, y: e.clientY };
      phi += dx * 0.18;
      theta -= dy * 0.10;
      theta = Math.max(-25, Math.min(25, theta));
      projection = makeProjection();
      pathGen = window.d3.geoPath(projection);
      renderCountries();
    }
    function onPointerUp(e) {
      dragging = null;
      svg.style.cursor = 'grab';
    }
    svg.style.cursor = 'grab';
    svg.addEventListener('pointerdown', onPointerDown);
    svg.addEventListener('pointermove', onPointerMove);
    svg.addEventListener('pointerup', onPointerUp);
    svg.addEventListener('pointercancel', onPointerUp);

    // Subtle auto-drift while the user isn't interacting — gives the
    // map a faint 'breathing' feel without being distracting.
    let lastDrift = performance.now();
    function driftFrame(now) {
      const dt = now - lastDrift;
      lastDrift = now;
      if (!dragging) {
        phi += dt * 0.0008;  // ~1.7°/sec drift, very slow
        projection = makeProjection();
        pathGen = window.d3.geoPath(projection);
        renderCountries();
      }
      requestAnimationFrame(driftFrame);
    }
    // Only drift if the user prefers motion.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(driftFrame);
    }
  })();

  /* ───────── Six-month progression · scroll-driven curve ─────────
     As the user scrolls through .scroll-curve, normalise the section's
     position relative to the viewport into p ∈ [0, 1]. Drives:
       · stroke-dashoffset on the foreground curve (draws as you scroll)
       · cx/cy on the YOU dot via getPointAtLength(p × total)
       · .is-active on each of the 3 milestone dots + their labels
         at the thresholds 0.2 / 0.55 / 0.9 (lines up with M1-2,
         M3-4, M5-6 on the curve). */
  (function initScrollCurve() {
    const section = document.querySelector('.scroll-curve');
    const path    = document.getElementById('scrollCurvePath');
    const dot     = document.getElementById('scrollCurveDot');
    if (!section || !path || !dot) return;

    const stones      = Array.from(section.querySelectorAll('.scroll-curve-svg .ms'));
    const labels      = Array.from(section.querySelectorAll('.ms-label'));
    const phaseTexts  = Array.from(section.querySelectorAll('.phase-text'));
    // Marker positions along the path: Phase 1 sits at ~p=0.18,
    // Phase 2 at ~p=0.55, Phase 3 at ~p=0.93. Thresholds match those
    // so the dots light up exactly when the ball arrives.
    const THRESHOLDS  = [0.18, 0.55, 0.93];
    // Description swaps the moment the ball crosses Phase 2 then
    // Phase 3 — so the text reads as the consequence of arrival.
    const PHASE_BREAKS = [0.55, 0.92];

    let total = path.getTotalLength();
    path.style.strokeDasharray  = total;
    path.style.strokeDashoffset = total;

    // Smoothing: scroll events update pTarget; a rAF loop interpolates
    // pCurrent toward it with LERP. So the dot/curve glide between
    // scroll positions instead of snapping each tick — and we only
    // touch DOM once per frame max.
    let pTarget  = 0;
    let pCurrent = 0;
    let rafRunning = false;
    const LERP = 0.18;          // 0 = no movement, 1 = no smoothing
    const EPSILON = 0.0008;

    function readTarget() {
      const rect = section.getBoundingClientRect();
      const vh   = window.innerHeight || document.documentElement.clientHeight;
      // Scroll window for the animation:
      //   start: top is 200px below the fold (slight early lead-in)
      //   end:   top is 15% down the viewport
      const startTop = vh + 200;
      const endTop   = vh * 0.15;
      const raw      = (startTop - rect.top) / (startTop - endTop);
      const s        = Math.max(0, Math.min(1, raw));
      // Piecewise mapping so the ball lands ON Phase 1 at s=1/3,
      // ON Phase 2 at s=2/3, ON Phase 3 at s=1. Marker positions
      // along the path: ~0.18 / 0.55 / 0.93.
      let p;
      if (s <= 1 / 3) {
        p = s * 3 * 0.18;                              //   0   → 0.18
      } else if (s <= 2 / 3) {
        p = 0.18 + (s - 1 / 3) * 3 * (0.55 - 0.18);    // 0.18  → 0.55
      } else {
        p = 0.55 + (s - 2 / 3) * 3 * (0.93 - 0.55);    // 0.55  → 0.93
      }
      pTarget = p;
    }

    function paint(p) {
      path.style.strokeDashoffset = total * (1 - p);
      const pt = path.getPointAtLength(total * p);
      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);
      for (let i = 0; i < stones.length; i++) {
        const active = p >= THRESHOLDS[i];
        stones[i].classList.toggle('is-active', active);
        labels[i].classList.toggle('is-active', active);
      }
      // Phase index: 0 by default, → 1 past PHASE_BREAKS[0], → 2 past [1]
      const phase = p >= PHASE_BREAKS[1] ? 2 : p >= PHASE_BREAKS[0] ? 1 : 0;
      for (let i = 0; i < phaseTexts.length; i++) {
        phaseTexts[i].classList.toggle('is-active', i === phase);
      }
    }

    function tick() {
      pCurrent += (pTarget - pCurrent) * LERP;
      if (Math.abs(pTarget - pCurrent) < EPSILON) {
        pCurrent = pTarget;
        paint(pCurrent);
        rafRunning = false;
        return;
      }
      paint(pCurrent);
      requestAnimationFrame(tick);
    }

    function kick() {
      if (rafRunning) return;
      rafRunning = true;
      requestAnimationFrame(tick);
    }

    function onScroll() { readTarget(); kick(); }

    // Resize → re-measure path length (responsive SVG)
    function remeasure() {
      total = path.getTotalLength();
      path.style.strokeDasharray = total;
      readTarget();
      pCurrent = pTarget;
      paint(pCurrent);
    }

    readTarget();
    pCurrent = pTarget;
    paint(pCurrent);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', remeasure);
  })();

})();

/* ───────── Quote rotator · cycles the .quote children in .quotes-stage ─────
   Auto-advances the .is-active class every INTERVAL ms with a brief
   cross-fade handled by CSS. Pauses while the band is off-screen
   (IntersectionObserver) so quotes don't tick over silently for users
   who scroll past. Honours prefers-reduced-motion by holding on the
   first quote and not rotating. */
(function initQuoteRotator() {
  const stage = document.getElementById('quotesStage');
  if (!stage) return;
  const quotes = Array.from(stage.querySelectorAll('.quote'));
  if (quotes.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const INTERVAL = 6500;
  let idx = quotes.findIndex(q => q.classList.contains('is-active'));
  if (idx < 0) { idx = 0; quotes[0].classList.add('is-active'); }
  let timer = null;
  function tick() {
    quotes[idx].classList.remove('is-active');
    idx = (idx + 1) % quotes.length;
    quotes[idx].classList.add('is-active');
  }
  function start() { if (!timer) timer = setInterval(tick, INTERVAL); }
  function stop()  { if (timer) { clearInterval(timer); timer = null; } }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => e.isIntersecting ? start() : stop());
  }, { threshold: 0.2 });
  io.observe(stage);
})();

/* ───────── Mobile nav · auto-close burger drawer on link tap ─────────
   The drawer is driven by a checkbox toggle. Without this, tapping a nav
   link smooth-scrolls to the anchor but leaves the drawer covering the
   page so the user has to manually close it. */
(function initMobileNavAutoClose() {
  const toggle = document.getElementById('nav-burger-toggle');
  if (!toggle) return;
  document.querySelectorAll('.nav-links a').forEach((a) => {
    a.addEventListener('click', () => {
      if (toggle.checked) toggle.checked = false;
    });
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
