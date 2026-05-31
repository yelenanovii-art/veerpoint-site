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
      highlightCountry(n.country);
    }

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

    const stones = Array.from(section.querySelectorAll('.scroll-curve-svg .ms'));
    const labels = Array.from(section.querySelectorAll('.ms-label'));
    const THRESHOLDS = [0.20, 0.55, 0.90];

    let total = path.getTotalLength();
    path.style.strokeDasharray  = total;
    path.style.strokeDashoffset = total;

    function compute() {
      const rect = section.getBoundingClientRect();
      const vh   = window.innerHeight || document.documentElement.clientHeight;
      // Animate while the section overlaps the viewport. p = 0 when its
      // top is at vh (just entered from the bottom); p = 1 when its
      // bottom hits the top.
      const span = rect.height + vh;
      const raw  = (vh - rect.top) / span;
      const p    = Math.max(0, Math.min(1, raw));

      path.style.strokeDashoffset = total * (1 - p);
      const pt = path.getPointAtLength(total * p);
      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);

      for (let i = 0; i < stones.length; i++) {
        const active = p >= THRESHOLDS[i];
        stones[i].classList.toggle('is-active', active);
        labels[i].classList.toggle('is-active', active);
      }
    }

    // Resize → re-measure path length (responsive SVG)
    function remeasure() { total = path.getTotalLength(); path.style.strokeDasharray = total; compute(); }

    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', remeasure);
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
  // index.html ships its own quiz markup (#vpQuiz) wired with inline
  // vpQuizOpen() and doesn't have this overlay — skip wiring to avoid a
  // TypeError on overlay.addEventListener below.
  if (!overlay || !stage || !progress) return;
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
