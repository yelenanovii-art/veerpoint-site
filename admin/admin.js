/* ──────────────────────────────────────────────────────────
   Veerpoint · Admin · shared JS
   Mock data + UI helpers. Demo-only — no real backend.
   ────────────────────────────────────────────────────────── */

/* ============ AUTH GATE ============ */
(function gate() {
  if (location.pathname.endsWith('/admin/') || location.pathname.endsWith('/admin/index.html')) return;
  if (location.pathname.endsWith('/index.html') && location.pathname.includes('/admin/')) return;
  if (!sessionStorage.getItem('vp-admin-auth')) {
    location.replace('index.html');
  }
})();

/* ============ MOCK DATA ============ */
const VP = {
  user: { name: 'Elena Novikova', email: 'elena@veerpoint.io', role: 'Founder · CMO' },

  nav: [
    { section: 'WORKSPACE', items: [
      { href: 'dashboard.html', label: 'Dashboard',     icon: '▦' },
      { href: 'leads.html',     label: 'Leads',         icon: '◉', count: 47 },
      { href: 'behavior.html',  label: 'User behavior', icon: '⇄' },
    ]},
    { section: 'BUILD', items: [
      { href: 'content.html',     label: 'Content & blog', icon: '✎', count: 3 },
      { href: 'automations.html', label: 'Automations',    icon: '⚡' },
    ]},
    { section: 'CONNECT', items: [
      { href: 'integrations.html', label: 'Integrations', icon: '⌬' },
      { href: 'team.html',         label: 'Team',         icon: '◐' },
    ]},
  ],

  kpis: {
    leads:        { value: 247, delta: '+18%', dir: 'up',  label: 'Leads · 30d',    spark: [12,14,11,18,15,22,19,26,24,28,32,29,35,38,42] },
    qualified:    { value: 84,  delta: '+24%', dir: 'up',  label: 'MQLs · 30d',     spark: [4,5,4,7,6,9,8,11,12,10,14,15,13,17,18] },
    pipeline:     { value: '€2.1M', delta: '+€480k', dir: 'up', label: 'Pipeline · ARR', spark: [380,420,440,580,640,720,840,920,1100,1280,1420,1640,1820,1980,2100] },
    closed:       { value: '€186k', delta: '+€38k',  dir: 'up', label: 'Closed · 30d', spark: [0,12,8,28,22,18,32,38,44,52,68,72,84,98,124] },
    avgDeal:      { value: '€31k', delta: '-3%',    dir: 'down', label: 'Avg ACV',     spark: [34,33,35,32,34,33,32,33,31,32,31,30,31,30,31] },
    convRate:     { value: '34%', delta: '+6 pts',  dir: 'up', label: 'Lead → MQL',   spark: [22,24,23,25,26,28,27,29,30,31,32,30,33,34,34] },
    cac:          { value: '€280', delta: '-€42',   dir: 'up', label: 'Blended CAC',  spark: [340,330,320,310,300,290,310,290,280,290,270,280,280,275,280] },
    siteVisits:   { value: '12.4k', delta: '+22%',  dir: 'up', label: 'Site visits · 30d', spark: [320,380,420,520,580,640,720,780,840,920,1080,1180,1260,1340,1420] },
  },

  leads: [
    { id: 'L-2847', name: 'Jordan Mensah',   company: 'Lumen Tech',         email: 'jordan@lumen.io',         source: 'Calculator',  stage: 'hot',   value: '€85k', ts: '2m ago',  market: 'EU',  motion: 'AE expansion',     icp: 'Series A · B2B SaaS', synced: false },
    { id: 'L-2846', name: 'Aisha Patel',     company: 'Northwind Health',   email: 'aisha@northwind.health',  source: 'Fit quiz',    stage: 'warm',  value: '€42k', ts: '14m ago', market: 'UK',  motion: 'First GTM',        icp: 'Pre-seed · health',  synced: true  },
    { id: 'L-2845', name: 'Pavel Sørensen',  company: 'Skyfall Studios',    email: 'pavel@skyfall.no',        source: 'Book a call', stage: 'hot',   value: '€120k', ts: '38m ago', market: 'NORDIC', motion: 'Country lead',  icp: 'Series B · gaming',  synced: true  },
    { id: 'L-2844', name: 'Sarah Klein',     company: 'Treloar & Co',       email: 'skleinhotz@treloar.de',   source: 'Calculator',  stage: 'warm',  value: '€55k', ts: '1h ago',  market: 'DACH', motion: 'New market',      icp: 'Series A · fintech', synced: false },
    { id: 'L-2843', name: 'Marcus Chen',     company: 'Brightform',         email: 'mchen@brightform.io',     source: 'Calculator',  stage: 'new',   value: '—',    ts: '2h ago',  market: 'US',  motion: 'First GTM',        icp: 'Seed · dev tools',   synced: false },
    { id: 'L-2842', name: 'Imani Okafor',    company: 'Veridian Loop',      email: 'imani@veridian.app',      source: 'Fit quiz',    stage: 'warm',  value: '€38k', ts: '3h ago',  market: 'UK',  motion: 'AE expansion',     icp: 'Series A · vertical SaaS', synced: true },
    { id: 'L-2841', name: 'Lukas Berg',      company: 'Norddata',           email: 'lukas@norddata.se',       source: 'Book a call', stage: 'hot',   value: '€95k', ts: '5h ago',  market: 'NORDIC', motion: 'New market',    icp: 'Series B · data',    synced: true  },
    { id: 'L-2840', name: 'Priya Raman',     company: 'Atlas Onboard',      email: 'priya@atlas.so',          source: 'Calculator',  stage: 'cold',  value: '—',    ts: '8h ago',  market: 'US',  motion: 'First GTM',        icp: 'Pre-seed · ops',     synced: false },
    { id: 'L-2839', name: 'Tomás Riveira',   company: 'Cumulo Sales',       email: 'tomas@cumulo.es',         source: 'Newsletter',  stage: 'warm',  value: '€28k', ts: '12h ago', market: 'EU',  motion: 'Pricing review',   icp: 'Series A · sales tech', synced: false },
    { id: 'L-2838', name: 'Hanna Nyström',   company: 'Borealis Sound',     email: 'hanna@borealis.fi',       source: 'Fit quiz',    stage: 'hot',   value: '€72k', ts: '1d ago',  market: 'NORDIC', motion: 'Country lead',  icp: 'Series A · audio',   synced: true  },
    { id: 'L-2837', name: 'Daniel Okuda',    company: 'Quarry Logistics',   email: 'd.okuda@quarry.co.uk',    source: 'Book a call', stage: 'warm',  value: '€48k', ts: '1d ago',  market: 'UK',  motion: 'Pipeline rebuild', icp: 'Series B · logistics', synced: true },
    { id: 'L-2836', name: 'Léa Marchetti',   company: 'Pavia Studio',       email: 'lea@paviastudio.fr',      source: 'Calculator',  stage: 'cold',  value: '—',    ts: '2d ago',  market: 'EU',  motion: 'First GTM',        icp: 'Seed · creative tools', synced: false },
  ],

  activity: [
    { icon: '◉', t: "<span class='who'>Jordan Mensah</span> completed the <strong>Anti-Hiring Calculator</strong>. Inferred ACV €85k.", time: '2m ago' },
    { icon: '✉', t: "Discovery email sent to <span class='who'>Aisha Patel</span> via Resend.", time: '14m ago' },
    { icon: '⌬', t: "<strong>HubSpot</strong> sync ran. 3 contacts created, 0 updated, 0 errors.", time: '22m ago' },
    { icon: '◉', t: "<span class='who'>Pavel Sørensen</span> booked a Discovery call for Thursday 16:00 CET.", time: '38m ago' },
    { icon: '⚡', t: "Automation <strong>Calculator → Discovery email</strong> fired (4 times today).", time: '1h ago' },
    { icon: '✎', t: "<span class='who'>Anton</span> drafted blog post <strong>“The €425k cost of a wrong VP Sales.”</strong>", time: '2h ago' },
    { icon: '◉', t: "<span class='who'>Marcus Chen</span> submitted the 60-second fit quiz. Tag: <em>first-GTM</em>.", time: '2h ago' },
    { icon: '⌬', t: "<strong>Plausible</strong> reported 1,840 visits in last 24h (+18% vs. prior).", time: '3h ago' },
    { icon: '✉', t: "Quiz follow-up sent to <span class='who'>Imani Okafor</span> · template: <em>fit-quiz-warm</em>.", time: '3h ago' },
    { icon: '⚡', t: "Slack alert sent to <strong>#sales-veerpoint</strong> for hot lead from Skyfall Studios.", time: '4h ago' },
  ],

  funnel: [
    { stage: 'Visited site',          n: 12420, pct: 100 },
    { stage: 'Engaged with content',  n:  4280, pct:  34 },
    { stage: 'Started a tool',        n:  1140, pct:   9 },
    { stage: 'Completed a tool',      n:   486, pct:   4 },
    { stage: 'Shared contact',        n:   247, pct:   2 },
    { stage: 'Booked Discovery',      n:    84, pct:  0.7 },
    { stage: 'Closed-won',            n:     6, pct:  0.05 },
  ],

  topPages: [
    { path: '/',                   visits: 6420, scroll: 78, ts: 142 },
    { path: '/calculator',         visits: 2380, scroll: 92, ts: 318 },
    { path: '/pricing',            visits: 1840, scroll: 71, ts: 184 },
    { path: '/how-it-works',       visits: 1260, scroll: 64, ts: 156 },
    { path: '/about',              visits:  840, scroll: 58, ts: 122 },
    { path: '/pricing#faq',        visits:  420, scroll: 88, ts: 220 },
    { path: '/calculator#footnote', visits: 180, scroll: 95, ts: 380 },
  ],

  integrations: [
    { id: 'hubspot',   name: 'HubSpot',    logo: 'Hs', tag: 'CRM',           desc: 'Two-way sync for leads, deals, and contacts. Pipeline stages, lifecycle, owner assignment.', connected: false, color: '#FF7A59' },
    { id: 'plausible', name: 'Plausible',  logo: 'Pl', tag: 'ANALYTICS',     desc: 'Privacy-friendly site analytics. Page views, sources, custom events, conversions.', connected: false, color: '#5850EC' },
    { id: 'resend',    name: 'Resend',     logo: 'Re', tag: 'EMAIL',         desc: 'Transactional email for confirmations, reminders, follow-ups. DKIM + SPF managed.', connected: false, color: '#000000' },
    { id: 'slack',     name: 'Slack',      logo: 'Sl', tag: 'NOTIFICATIONS', desc: 'Real-time alerts on lead capture, quiz completions, calendar bookings.', connected: false, color: '#4A154B' },
    { id: 'google',    name: 'Google Cal', logo: 'Gc', tag: 'BOOKING',       desc: 'Pull team availability and post booked discovery calls to your shared calendar.', connected: false, color: '#4285F4' },
    { id: 'sanity',    name: 'Sanity',     logo: 'Sa', tag: 'CMS',           desc: 'Manage blog posts, case studies, and team bios from a structured editor (optional).', connected: false, color: '#F03E2F' },
    { id: 'zapier',    name: 'Zapier',     logo: 'Za', tag: 'AUTOMATION',    desc: 'Connect to 6,000+ tools. Use for niche workflows that don’t need a custom integration.', connected: false, color: '#FF4F00' },
    { id: 'stripe',    name: 'Stripe',     logo: 'St', tag: 'PAYMENTS',      desc: 'Optional. For invoicing retainers and tracking commission payouts.', connected: false, color: '#635BFF' },
    { id: 'linkedin',  name: 'LinkedIn',   logo: 'Li', tag: 'OUTREACH',      desc: 'Match leads against LinkedIn data for enrichment. Surface mutual connections.', connected: false, color: '#0A66C2' },
  ],

  automations: [
    { id: 'a1', name: 'Calculator completed → Discovery email',  trigger: 'Form: anti-hiring-calculator submitted',  action: 'Send Resend template · discovery-warm', enabled: true,  runs: 142, last: '2m ago' },
    { id: 'a2', name: 'Fit quiz HOT → Slack alert + AE assigned', trigger: 'Quiz score ≥ 80',                          action: 'Post to #sales-veerpoint · assign to Anton', enabled: true,  runs: 31,  last: '1h ago' },
    { id: 'a3', name: 'Book a call → HubSpot deal stage = Discovery', trigger: 'Calendly event created',              action: 'Create HubSpot deal · stage Discovery', enabled: true,  runs: 28,  last: '4h ago' },
    { id: 'a4', name: 'Quiz completed (any) → Tag in CRM',         trigger: '60-second fit quiz submitted',           action: 'HubSpot · add tag fit-quiz + score', enabled: true,  runs: 96,  last: '3h ago' },
    { id: 'a5', name: 'No reply in 48h → Founder nudge email',     trigger: 'Lead untouched for 48h · stage warm/hot', action: 'Send Resend template · founder-nudge', enabled: false, runs: 12,  last: '3d ago' },
    { id: 'a6', name: 'Blog published → LinkedIn + newsletter',    trigger: 'Blog post status = published',           action: 'Post to LinkedIn · queue for next newsletter', enabled: false, runs: 0, last: '—' },
    { id: 'a7', name: 'Lead value > €50k → Founder ping',          trigger: 'Inferred ACV ≥ €50k',                    action: 'SMS Anton + add to Discovery shortlist', enabled: true,  runs: 18,  last: '38m ago' },
  ],

  blogPosts: [
    { id: 'b1', title: 'The €425k cost of a wrong VP Sales',                   status: 'Draft',       author: 'Anton Voronov', date: '2026-05-12', words: 1840 },
    { id: 'b2', title: 'Why first GTM doesn\'t need a VP — it needs operators', status: 'Published',   author: 'Pablo Reyes',   date: '2026-04-28', words: 2100 },
    { id: 'b3', title: 'What the Calculator actually computes (math + sources)', status: 'In review',   author: 'Dylan Auerbach', date: '2026-05-09', words: 1620 },
    { id: 'b4', title: 'Six-month cycles: why we won\'t do anything shorter',   status: 'Published',   author: 'Anton Voronov', date: '2026-04-14', words: 1280 },
    { id: 'b5', title: 'Pipeline ≠ pipeline: how we count an ICP-fit deal',     status: 'Idea',        author: 'Pablo Reyes',   date: '2026-05-08', words: 0    },
  ],

  events: [
    { id: 'e1', name: 'SaaStr Europa',          date: '2026-06-04', city: 'Barcelona, ES',  status: 'Hosting',  attendees: 4 },
    { id: 'e2', name: 'Founder dinner · Berlin', date: '2026-06-18', city: 'Berlin, DE',     status: 'Planning', attendees: 12 },
    { id: 'e3', name: 'Pavilion CMO breakfast',  date: '2026-07-02', city: 'Amsterdam, NL',  status: 'Confirmed', attendees: 28 },
    { id: 'e4', name: 'GTM podcast taping',      date: '2026-07-15', city: 'Remote',         status: 'Booked',   attendees: 2 },
  ],

  team: [
    { name: 'Elena Novikova', role: 'Founder · CMO',         email: 'elena@veerpoint.io',    last: 'Now',     status: 'Online' },
    { name: 'Anton Voronov',  role: 'Founder · Head of Sales', email: 'anton@veerpoint.io', last: '14m ago', status: 'Online' },
    { name: 'Pablo Reyes',    role: 'Operator · Closer',     email: 'pablo@veerpoint.io',   last: '2h ago',  status: 'Away' },
    { name: 'Dylan Auerbach', role: 'Operator · Closer',     email: 'dylan@veerpoint.io',   last: '1d ago',  status: 'Offline' },
  ],
};

/* ============ RENDER: SIDEBAR + TOPBAR ============ */
function renderShell(activePage) {
  const sidebarEl = document.getElementById('sidebar');
  if (sidebarEl) sidebarEl.innerHTML = `
    <div class="sidebar-brand">
      <span class="wm">Veerpoint<span class="stop">.</span></span>
      <span class="badge">ADMIN</span>
    </div>
    ${VP.nav.map(group => `
      <div class="sidebar-section">
        <div class="sidebar-section-hd">${group.section}</div>
        <div class="sidebar-nav">
          ${group.items.map(item => `
            <a href="${item.href}" class="${activePage === item.href ? 'active' : ''}">
              <span class="icon">${item.icon}</span>
              <span>${item.label}</span>
              ${item.count ? `<span class="count">${item.count}</span>` : ''}
            </a>
          `).join('')}
        </div>
      </div>
    `).join('')}
    <div class="sidebar-bottom">
      <a href="#" class="sidebar-user">
        <div class="avatar">${VP.user.name.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <div class="name">${VP.user.name}</div>
          <div class="role">${VP.user.role}</div>
        </div>
      </a>
    </div>
  `;

  // Top-strip demo ribbon if not already there
  if (!document.querySelector('.demo-ribbon')) {
    const ribbon = document.createElement('div');
    ribbon.className = 'demo-ribbon';
    ribbon.innerHTML = '<span class="dot"></span>VEERPOINT · ADMIN · DEMO PROTOTYPE · ALL DATA IS MOCKED';
    document.body.prepend(ribbon);
  }
}

/* ============ SVG SPARKLINE ============ */
function sparkline(values, w = 160, h = 36, color = '#A04022') {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  return `
    <svg class="kpi-sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="0,${h} ${pts} ${w},${h}" fill="${color}" opacity="0.08"/>
    </svg>
  `;
}

/* ============ KPI CARD HTML ============ */
function renderKpi(k) {
  const arrow = k.dir === 'up' ? '↑' : k.dir === 'down' ? '↓' : '→';
  return `
    <div class="kpi">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-delta ${k.dir}">${arrow} ${k.delta} <span style="color:var(--vp-muted)">vs prior 30d</span></div>
      ${sparkline(k.spark)}
    </div>
  `;
}

/* ============ LINE CHART (simple SVG) ============ */
function lineChart(values, w = 720, h = 220, labels = []) {
  const max = Math.max(...values) * 1.1;
  const min = 0;
  const padL = 36, padR = 12, padT = 12, padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const step = innerW / (values.length - 1);
  const yToPx = (v) => padT + innerH - ((v - min) / (max - min)) * innerH;
  const pts = values.map((v, i) => `${padL + i * step},${yToPx(v)}`).join(' ');
  // Y-axis gridlines
  const grids = [0, 0.25, 0.5, 0.75, 1].map(p => {
    const y = padT + innerH * (1 - p);
    const labelVal = Math.round(min + (max - min) * p);
    return `
      <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#E5E5E5" stroke-width="1" stroke-dasharray="${p === 0 ? '0' : '2,3'}"/>
      <text x="${padL - 8}" y="${y + 3}" font-family="Geist Mono" font-size="9" fill="#9C9C9F" text-anchor="end">${labelVal}</text>
    `;
  }).join('');
  // X-axis labels (just first, mid, last)
  const xs = labels.length ? [0, Math.floor(labels.length / 2), labels.length - 1].map(i => `
    <text x="${padL + i * step}" y="${h - 8}" font-family="Geist Mono" font-size="9" fill="#9C9C9F" text-anchor="middle">${labels[i]}</text>
  `).join('') : '';
  return `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%; height:${h}px; display:block">
      ${grids}
      <polyline points="${pts}" fill="none" stroke="#A04022" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${padL},${padT + innerH} ${pts} ${w - padR},${padT + innerH}" fill="#A04022" opacity="0.06"/>
      ${values.map((v, i) => `<circle cx="${padL + i * step}" cy="${yToPx(v)}" r="3" fill="#A04022"/>`).join('')}
      ${xs}
    </svg>
  `;
}

/* ============ BAR CHART (horizontal) ============ */
function barChart(data, w = 720, h = 240) {
  const max = Math.max(...data.map(d => d.value));
  const barH = 22;
  const gap = 8;
  return `
    <svg viewBox="0 0 ${w} ${data.length * (barH + gap)}" style="width:100%; height:${data.length * (barH + gap)}px; display:block">
      ${data.map((d, i) => {
        const y = i * (barH + gap);
        const barW = (d.value / max) * (w - 200);
        return `
          <text x="0" y="${y + barH / 2 + 4}" font-family="Inter" font-size="12" fill="#48484A">${d.label}</text>
          <rect x="160" y="${y}" width="${barW}" height="${barH}" fill="#A04022" opacity="0.85" rx="3"/>
          <text x="${160 + barW + 8}" y="${y + barH / 2 + 4}" font-family="Geist Mono" font-size="11" fill="#1C1C1E">${d.display || d.value}</text>
        `;
      }).join('')}
    </svg>
  `;
}

/* ============ FUNNEL ============ */
function funnelChart(stages, w = 720) {
  const maxN = stages[0].n;
  return `
    <div style="display: flex; flex-direction: column; gap: 4px;">
      ${stages.map((s, i) => {
        const pctOfMax = (s.n / maxN) * 100;
        return `
          <div style="display: grid; grid-template-columns: 200px 1fr 80px 60px; gap: 12px; align-items: center; padding: 6px 0;">
            <div style="font-size: 13px; color: var(--vp-ink);">${s.stage}</div>
            <div style="background: var(--vp-paper); height: 28px; border-radius: 4px; overflow: hidden; position: relative;">
              <div style="background: var(--vp-terracotta); opacity: ${0.95 - i * 0.10}; height: 100%; width: ${pctOfMax}%; transition: width 0.6s;"></div>
            </div>
            <div style="font-family: var(--vp-font-mono); font-size: 12px; text-align: right;">${s.n.toLocaleString()}</div>
            <div style="font-family: var(--vp-font-mono); font-size: 11px; color: var(--vp-muted); text-align: right;">${s.pct}%</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* ============ TOASTS ============ */
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  const colors = {
    info: { bg: 'var(--vp-ink)', fg: 'var(--vp-warm-white)' },
    success: { bg: 'var(--vp-green)', fg: 'white' },
    error: { bg: 'var(--vp-terracotta)', fg: 'white' },
  };
  el.style.cssText = `
    position: fixed; bottom: 24px; right: 24px;
    background: ${colors[type].bg}; color: ${colors[type].fg};
    padding: 12px 18px; border-radius: 8px;
    font-size: 13px; font-weight: 500;
    box-shadow: 0 12px 28px rgba(0,0,0,0.16);
    z-index: 300; opacity: 0; transform: translateY(8px);
    transition: all 0.2s;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => el.remove(), 220);
  }, 2400);
}

/* expose globally */
window.VP = VP;
window.renderShell = renderShell;
window.sparkline = sparkline;
window.renderKpi = renderKpi;
window.lineChart = lineChart;
window.barChart = barChart;
window.funnelChart = funnelChart;
window.toast = toast;
