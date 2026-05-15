/* ──────────────────────────────────────────────────────────
   Veerpoint · Admin · shared JS
   Mock data + UI helpers. Demo-only — no real backend.
   ────────────────────────────────────────────────────────── */

/* ============ AUTH GATE ============ */
(function gate() {
  if (location.pathname.endsWith('/admin/') || location.pathname.endsWith('/admin/index.html')) return;
  if (!sessionStorage.getItem('vp-admin-auth')) {
    location.replace('index.html');
  }
})();

/* ============ MOCK DATA ============ */
const VP = {
  user: { name: 'Elena Novikova', email: 'elena@veerpoint.io', role: 'Founder · CMO' },

  nav: [
    { section: 'WORKSPACE', items: [
      { href: 'dashboard.html',     label: 'Dashboard',     icon: '▦' },
      { href: 'notifications.html', label: 'Notifications', icon: '◔', count: 7 },
    ]},
    { section: 'GROW', items: [
      { href: 'leads.html',       label: 'Leads',         icon: '◉', count: 47 },
      { href: 'behavior.html',    label: 'User behavior', icon: '⇄' },
      { href: 'experiments.html', label: 'Experiments',   icon: '◐' },
      { href: 'outbound.html',    label: 'Outbound',      icon: '✉' },
    ]},
    { section: 'RUN', items: [
      { href: 'clients.html',  label: 'Clients',  icon: '◈', count: 6 },
      { href: 'capacity.html', label: 'Capacity', icon: '◇' },
      { href: 'activity.html', label: 'Activity', icon: '☷' },
      { href: 'revenue.html',  label: 'Revenue',  icon: '€' },
    ]},
    { section: 'OPERATE', items: [
      { href: 'goals.html',       label: 'Goals & OKRs',    icon: '◎' },
      { href: 'kb.html',          label: 'Knowledge base',  icon: '☰' },
      { href: 'content.html',     label: 'Content & blog',  icon: '✎', count: 3 },
      { href: 'automations.html', label: 'Automations',     icon: '⚡' },
    ]},
    { section: 'CONNECT', items: [
      { href: 'integrations.html', label: 'Integrations', icon: '⌬' },
      { href: 'team.html',         label: 'Team',         icon: '◐' },
      { href: 'audit.html',        label: 'Audit log',    icon: '⎙' },
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
    mrr:          { value: '€72k', delta: '+€12k',  dir: 'up', label: 'MRR · retainers', spark: [36,36,36,48,48,48,48,60,60,60,60,72,72,72,72] },
    runway:       { value: '14 mo', delta: '+2 mo', dir: 'up', label: 'Cash runway',    spark: [10,10,11,11,12,12,12,13,13,13,14,14,14,14,14] },
    utilization:  { value: '78%',   delta: '+8 pts', dir: 'up', label: 'Operator util', spark: [62,64,66,68,70,68,72,74,75,76,77,78,78,77,78] },
    commission:   { value: '€38k', delta: '+€11k', dir: 'up',  label: 'Commission · 30d', spark: [4,5,7,8,10,12,14,16,20,22,26,28,32,36,38] },
  },

  /* ───── LEADS ───── */
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

  /* ───── CLIENTS (active engagements) ───── */
  clients: [
    { id: 'C-014', name: 'Revolut Business',   stage: 'Steady state',  retainer: 14000, commission: 12, mrr: 14000, startDate: '2026-01-12', renewDate: '2026-07-12', operator: 'Anton Voronov',  market: 'UK',     pipelineGen: '€780k', closed: '€312k', health: 'green',  motion: 'AE expansion' },
    { id: 'C-013', name: 'Skyfall Studios',    stage: 'Pipeline',      retainer: 12000, commission: 10, mrr: 12000, startDate: '2026-03-04', renewDate: '2026-09-04', operator: 'Pablo Reyes',    market: 'NORDIC', pipelineGen: '€420k', closed: '€88k',  health: 'green',  motion: 'Country lead' },
    { id: 'C-012', name: 'Norddata',           stage: 'Pipeline',      retainer: 12000, commission: 10, mrr: 12000, startDate: '2026-02-18', renewDate: '2026-08-18', operator: 'Pablo Reyes',    market: 'NORDIC', pipelineGen: '€340k', closed: '€72k',  health: 'amber',  motion: 'New market'    },
    { id: 'C-011', name: 'Cumulo Sales',       stage: 'Discovery',     retainer: 10000, commission: 10, mrr: 10000, startDate: '2026-04-22', renewDate: '2026-10-22', operator: 'Dylan Auerbach', market: 'EU',     pipelineGen: '€140k', closed: '€0',    health: 'green',  motion: 'Pricing review' },
    { id: 'C-010', name: 'Quarry Logistics',   stage: 'Off-ramp',      retainer: 8000,  commission: 8,  mrr: 8000,  startDate: '2025-11-08', renewDate: '2026-05-08', operator: 'Anton Voronov',  market: 'UK',     pipelineGen: '€1.1M', closed: '€420k', health: 'green',  motion: 'Pipeline rebuild' },
    { id: 'C-009', name: 'Treloar & Co',       stage: 'Steady state',  retainer: 16000, commission: 12, mrr: 16000, startDate: '2026-01-20', renewDate: '2026-07-20', operator: 'Dylan Auerbach', market: 'DACH',   pipelineGen: '€620k', closed: '€180k', health: 'amber',  motion: 'New market'    },
  ],

  /* ───── OPERATORS (capacity) ───── */
  operators: [
    { name: 'Anton Voronov',   role: 'Founder · Senior closer', avail: 'Full', clients: ['Revolut Business', 'Quarry Logistics'], utilization: 92, callsWk: 22, pipelineCreated30d: '€420k', capacity: 100, used: 92 },
    { name: 'Pablo Reyes',     role: 'Operator · Senior closer', avail: 'Full', clients: ['Skyfall Studios', 'Norddata'],         utilization: 88, callsWk: 18, pipelineCreated30d: '€380k', capacity: 100, used: 88 },
    { name: 'Dylan Auerbach',  role: 'Operator · Senior closer', avail: 'Full', clients: ['Cumulo Sales', 'Treloar & Co'],        utilization: 76, callsWk: 16, pipelineCreated30d: '€280k', capacity: 100, used: 76 },
    { name: 'Mei Nakamura',    role: 'Operator · Mid-cycle',     avail: 'Bench', clients: [],                                      utilization: 0,  callsWk: 0,  pipelineCreated30d: '—',     capacity: 100, used: 0  },
    { name: 'Søren Halvorsen', role: 'Operator · Senior closer', avail: 'Onboarding', clients: ['Treloar & Co (shadow)'],          utilization: 35, callsWk: 6,  pipelineCreated30d: '€60k',  capacity: 100, used: 35 },
  ],

  /* ───── ACTIVITY LOG (cross-entity) ───── */
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

  /* ───── DETAILED ACTIVITY (for /activity page) ───── */
  activityTimeline: [
    { kind: 'call',     who: 'Anton Voronov',   target: 'Revolut Business · GTM',    summary: 'Pipeline review · 14 deals on the floor, 3 stuck on legal. Anton agreed to escalate to GC.', when: '12m ago',  duration: '46m' },
    { kind: 'email',    who: 'Pablo Reyes',     target: 'Skyfall Studios · Pavel',   summary: 'Sent contract for €120k deal. Reply expected Thursday.', when: '38m ago', duration: '—' },
    { kind: 'linkedin', who: 'Dylan Auerbach',  target: 'Sarah Klein · Treloar',     summary: 'Replied to Sarah\'s LinkedIn DM re: pricing. Booked second call.', when: '1h ago', duration: '—' },
    { kind: 'call',     who: 'Anton Voronov',   target: 'Jordan Mensah · Lumen',     summary: 'Discovery call. ICP fit confirmed. Series A SaaS, €1.5M ARR target. Next: scope conversation Tue.', when: '2h ago', duration: '32m' },
    { kind: 'note',     who: 'Pablo Reyes',     target: 'Norddata',                  summary: 'Note: legal pushback on commission clause. Drafting revised SOW v2.', when: '3h ago', duration: '—' },
    { kind: 'demo',     who: 'Dylan Auerbach',  target: 'Cumulo Sales',              summary: 'Live demo with founder + head of growth. They love the pricing review angle.', when: '4h ago', duration: '52m' },
    { kind: 'email',    who: 'Anton Voronov',   target: 'Hanna Nyström · Borealis',  summary: 'Follow-up sent with case study from Skyfall. Ask: 20-min next week.', when: '6h ago', duration: '—' },
    { kind: 'call',     who: 'Pablo Reyes',     target: 'Quarry Logistics',          summary: 'Renewal conversation. Daniel will recommend extension to CFO. Hopeful on signature this week.', when: '8h ago', duration: '38m' },
    { kind: 'linkedin', who: 'Dylan Auerbach',  target: 'Cold outreach · DACH list', summary: 'Sent 14 connection requests to Series A CROs. 4 accepts in first hour.', when: '1d ago', duration: '—' },
    { kind: 'call',     who: 'Anton Voronov',   target: 'Imani Okafor · Veridian',   summary: 'Discovery. Strong fit but timing is Q3. Marked stage = warm/long-cycle.', when: '1d ago', duration: '28m' },
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
    { id: 'gong',      name: 'Gong',       logo: 'Go', tag: 'CALL INTEL',    desc: 'Record + transcribe calls. Surface objections, sentiment, talk patterns per operator.', connected: false, color: '#8C5BFF' },
    { id: 'beehiiv',   name: 'Beehiiv',    logo: 'Be', tag: 'NEWSLETTER',    desc: 'Sync newsletter signups to leads. Track open / click rates on broadcasts.', connected: false, color: '#F8C400' },
    { id: 'apollo',    name: 'Apollo',     logo: 'Ap', tag: 'PROSPECTING',   desc: 'Build target lists by ICP filters. Push into sequences automatically.', connected: false, color: '#005FF9' },
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
    { id: 'e1', name: 'SaaStr Europa',           date: '2026-06-04', city: 'Barcelona, ES',  status: 'Hosting',   attendees: 4  },
    { id: 'e2', name: 'Founder dinner · Berlin', date: '2026-06-18', city: 'Berlin, DE',     status: 'Planning',  attendees: 12 },
    { id: 'e3', name: 'Pavilion CMO breakfast',  date: '2026-07-02', city: 'Amsterdam, NL',  status: 'Confirmed', attendees: 28 },
    { id: 'e4', name: 'GTM podcast taping',      date: '2026-07-15', city: 'Remote',         status: 'Booked',    attendees: 2  },
  ],

  team: [
    { name: 'Elena Novikova', role: 'Founder · CMO',           email: 'elena@veerpoint.io',  last: 'Now',     status: 'Online' },
    { name: 'Anton Voronov',  role: 'Founder · Head of Sales', email: 'anton@veerpoint.io',  last: '14m ago', status: 'Online' },
    { name: 'Pablo Reyes',    role: 'Operator · Closer',       email: 'pablo@veerpoint.io',  last: '2h ago',  status: 'Away'   },
    { name: 'Dylan Auerbach', role: 'Operator · Closer',       email: 'dylan@veerpoint.io',  last: '1d ago',  status: 'Offline'},
  ],

  /* ───── OUTBOUND SEQUENCES ───── */
  sequences: [
    { id: 's1', name: 'Series-A · DACH · founder-led',     icp: 'Series A · DACH · founder-led GTM',  sent: 248, opened: 162, replied: 38, booked: 11, status: 'Active' },
    { id: 's2', name: 'Series-A · UK · 1 AE in seat',      icp: 'Series A · UK · single-AE struggle', sent: 184, opened: 122, replied: 27, booked: 8,  status: 'Active' },
    { id: 's3', name: 'Series-B · Nordics · new market',   icp: 'Series B · NORDIC · expansion play', sent:  96, opened:  68, replied: 19, booked: 7,  status: 'Active' },
    { id: 's4', name: 'Seed · US · post-fundraise',        icp: 'Seed · US · fresh round',            sent:  72, opened:  44, replied: 11, booked: 4,  status: 'Paused' },
    { id: 's5', name: 'Series-A · EU · sales-tech ICPs',   icp: 'Series A · EU · sales tooling',      sent: 144, opened:  94, replied: 18, booked: 5,  status: 'Active' },
  ],
  prospectLists: [
    { name: 'Series-A · DACH · 200 founders',  size: 200, source: 'Apollo + LinkedIn',     filters: '€2M-10M ARR · 10-30 FTE · DACH HQ',     status: 'Live' },
    { name: 'Series-B · NORDIC expansion',     size: 84,  source: 'Apollo',                filters: 'Series B raised in 2025 · NORDIC HQ',   status: 'Live' },
    { name: 'UK · 1-AE companies',             size: 312, source: 'LinkedIn Sales Nav',    filters: 'UK · 1 AE on LinkedIn · 12-50 FTE',    status: 'Live' },
    { name: 'Sales-tech · open jobs',          size: 56,  source: 'Apollo + job boards',   filters: 'Hiring VP Sales · sales-tech vertical', status: 'Building' },
  ],

  /* ───── EXPERIMENTS ───── */
  experiments: [
    { id: 'x1', name: 'Hero headline · "advise" vs "close"',        page: '/',           variants: 2, sampled: 4280, lift: '+24%', winner: 'B',  status: 'Concluded', desc: '"We don\'t advise on sales. We close it." beat "Senior operators run your sales cycle." by 24% on quiz starts.' },
    { id: 'x2', name: 'Calculator email gate · placement',           page: '/calculator', variants: 3, sampled: 1140, lift: '+18%', winner: 'C',  status: 'Concluded', desc: 'Gate AFTER showing the result (variant C) converted 18% better than gate before result (A).' },
    { id: 'x3', name: 'Pricing CTA · "Scope a cycle" vs "Get scope"', page: '/pricing',    variants: 2, sampled:  624, lift: '+9%',  winner: 'A',  status: 'Concluded', desc: '"Scope a cycle" produced 9% more clicks. Kept as the canonical CTA copy.' },
    { id: 'x4', name: 'Quiz length · 5 vs 8 questions',              page: '/',           variants: 2, sampled:  420, lift: '—',    winner: '—', status: 'Running',   desc: 'Currently sampling. Need 600 more sessions to reach significance.' },
    { id: 'x5', name: 'Calculator default ARR · €1M vs €1.5M',       page: '/calculator', variants: 2, sampled:  180, lift: '—',    winner: '—', status: 'Running',   desc: 'Testing if higher anchor inflates inferred ACV in the email gate.' },
  ],

  /* ───── GOALS / OKRS ───── */
  goals: {
    quarter: 'Q2 2026',
    objectives: [
      { title: 'Reach €100k MRR by end of Q2',                 progress: 72, target: '€100k', current: '€72k',     status: 'On-track' },
      { title: 'Close 2 net-new clients per month',            progress: 50, target: '6 new',  current: '3 new',    status: 'At-risk' },
      { title: 'Lift Calculator → contact share to 30%',       progress: 84, target: '30%',    current: '25%',      status: 'On-track' },
      { title: 'Add 1 operator to the bench',                  progress: 50, target: '1 hire', current: 'In trial', status: 'On-track' },
      { title: 'Ship case studies for Revolut, Skyfall, Quarry', progress: 33, target: '3',      current: '1 done',  status: 'At-risk' },
      { title: 'Operator utilization average ≥ 80%',           progress: 95, target: '80%',    current: '78%',      status: 'On-track' },
    ]
  },

  /* ───── KNOWLEDGE BASE ───── */
  kb: [
    { id: 'kb1', cat: 'Discovery', title: 'The Veerpoint Discovery script (v4)',            updated: '2 days ago',  reads: 142 },
    { id: 'kb2', cat: 'Discovery', title: 'Three questions we always ask in the first 10m', updated: '4 days ago',  reads: 96  },
    { id: 'kb3', cat: 'Pricing',   title: 'How to talk about retainer + commission',         updated: '1 week ago',  reads: 168 },
    { id: 'kb4', cat: 'Pricing',   title: 'Pushback playbook · "this is more than a VP"',    updated: '1 week ago',  reads: 88  },
    { id: 'kb5', cat: 'ICP',       title: 'When to disqualify · the 7 red flags',            updated: '3 days ago',  reads: 124 },
    { id: 'kb6', cat: 'ICP',       title: 'The "ideal Veerpoint client" one-pager',          updated: '5 days ago',  reads: 76  },
    { id: 'kb7', cat: 'Closing',   title: 'Sending the SOW · template + redlines',           updated: '2 weeks ago', reads: 64  },
    { id: 'kb8', cat: 'Closing',   title: 'Handling legal pushback on commission clause',    updated: '6 days ago',  reads: 42  },
    { id: 'kb9', cat: 'Onboarding', title: 'Operator week 1 · what to do',                    updated: '1 week ago',  reads: 38  },
    { id: 'kb10', cat: 'Onboarding', title: 'How we shadow client calls before going solo',   updated: '2 weeks ago', reads: 28  },
    { id: 'kb11', cat: 'Tools',    title: 'Calculator math · sources + assumptions',          updated: '3 days ago',  reads: 112 },
    { id: 'kb12', cat: 'Tools',    title: 'HubSpot setup we use for every client',            updated: '2 weeks ago', reads: 56  },
  ],

  /* ───── AUDIT LOG ───── */
  audit: [
    { who: 'Anton Voronov',  what: 'changed lead L-2845 stage',         from: 'warm',  to: 'hot',  when: '2m ago',   ip: '92.40.x.x',  city: 'Barcelona' },
    { who: 'Pablo Reyes',    what: 'added note on client C-013',         from: '—',     to: '—',    when: '14m ago',  ip: '94.61.x.x',  city: 'Madrid' },
    { who: 'Elena Novikova', what: 'enabled automation a2',              from: 'off',   to: 'on',   when: '38m ago',  ip: '91.220.x.x', city: 'Barcelona' },
    { who: 'Dylan Auerbach', what: 'published blog post b2',             from: 'draft', to: 'pub',  when: '1h ago',   ip: '188.81.x.x', city: 'Lisbon' },
    { who: 'Anton Voronov',  what: 'rotated API token vp_live_••3a8c',    from: '—',     to: 'new',  when: '2h ago',   ip: '92.40.x.x',  city: 'Barcelona' },
    { who: 'Elena Novikova', what: 'connected integration · plausible',  from: 'off',   to: 'on',   when: '2h ago',   ip: '91.220.x.x', city: 'Barcelona' },
    { who: 'Pablo Reyes',    what: 'invited teammate søren@veerpoint.io', from: '—',     to: '—',    when: '4h ago',   ip: '94.61.x.x',  city: 'Madrid' },
    { who: 'Dylan Auerbach', what: 'edited site page /pricing',          from: '—',     to: '—',    when: '6h ago',   ip: '188.81.x.x', city: 'Lisbon' },
    { who: 'Elena Novikova', what: 'exported leads · CSV',               from: '—',     to: '—',    when: '1d ago',   ip: '91.220.x.x', city: 'Barcelona' },
    { who: 'Anton Voronov',  what: 'changed client C-010 stage',         from: 'steady', to: 'off-ramp', when: '1d ago', ip: '92.40.x.x', city: 'Barcelona' },
  ],

  /* ───── NOTIFICATIONS ───── */
  notifications: [
    { id: 'n1', kind: 'hot-lead',  title: 'Hot lead · Pavel Sørensen (€120k)',  body: 'Booked Discovery for Thursday 16:00 CET. Open in Leads.',                  when: '38m ago', read: false },
    { id: 'n2', kind: 'hot-lead',  title: 'Hot lead · Jordan Mensah (€85k)',    body: 'Completed Calculator. Inferred ACV €85k. Series A SaaS, EU.',              when: '2m ago',  read: false },
    { id: 'n3', kind: 'system',    title: 'HubSpot sync · 3 new contacts',      body: 'Synced this morning at 09:00 CET. No errors.',                              when: '22m ago', read: false },
    { id: 'n4', kind: 'mention',   title: 'Anton mentioned you in C-013',       body: '“@elena — Pavel wants to confirm the social/PR clause. Can you weigh in?”', when: '1h ago',  read: false },
    { id: 'n5', kind: 'goal',      title: 'Goal at-risk · 2 new clients/mo',    body: 'Currently 3 of 6 for Q2. May needs at least 2 more signed.',                when: '3h ago',  read: false },
    { id: 'n6', kind: 'task',      title: 'Renewal due in 7 days · Quarry',     body: 'Quarry Logistics renewal conversation scheduled. Final SOW pending.',      when: '1d ago',  read: true  },
    { id: 'n7', kind: 'system',    title: 'New API token created',              body: 'Personal access token vp_live_••3a8c · Anton',                              when: '2h ago',  read: true  },
    { id: 'n8', kind: 'mention',   title: 'Pablo asked about Norddata SOW',     body: '“Legal wants to redline section 4.3. Worth a quick call.”',                  when: '3h ago',  read: true  },
  ],
};

/* ============ RENDER: SIDEBAR + GLOBAL FEATURES ============ */
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

  // Demo ribbon
  if (!document.querySelector('.demo-ribbon')) {
    const ribbon = document.createElement('div');
    ribbon.className = 'demo-ribbon';
    ribbon.innerHTML = '<span class="dot"></span>VEERPOINT · ADMIN · DEMO PROTOTYPE · ALL DATA IS MOCKED';
    document.body.prepend(ribbon);
  }

  // Mobile menu trigger (injected into topbar)
  injectMobileMenu();

  // AI copilot + command palette · global
  injectCopilot();
  injectPalette();
}

/* ============ MOBILE MENU ============ */
function injectMobileMenu() {
  const topbar = document.querySelector('.topbar');
  if (!topbar || topbar.querySelector('.mobile-menu-btn')) return;
  const btn = document.createElement('button');
  btn.className = 'mobile-menu-btn';
  btn.setAttribute('aria-label', 'Toggle menu');
  btn.innerHTML = '<span></span><span></span><span></span>';
  btn.addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
    btn.classList.toggle('on');
  });
  topbar.prepend(btn);
}

/* ============ AI COPILOT ============ */
function injectCopilot() {
  if (document.getElementById('copilot-fab')) return;
  const fab = document.createElement('button');
  fab.id = 'copilot-fab';
  fab.className = 'copilot-fab';
  fab.title = 'Veerpoint Copilot · ask anything (⌘/)';
  fab.innerHTML = '<span>✦</span>';
  fab.addEventListener('click', toggleCopilot);
  document.body.appendChild(fab);

  const panel = document.createElement('div');
  panel.id = 'copilot-panel';
  panel.className = 'copilot-panel';
  panel.innerHTML = `
    <div class="copilot-head">
      <div class="copilot-title"><span>✦</span> Veerpoint Copilot<span class="stop">.</span></div>
      <button class="copilot-close" onclick="toggleCopilot()">✕</button>
    </div>
    <div class="copilot-body" id="copilot-body">
      <div class="copilot-msg from-ai">
        <div class="copilot-msg-who">COPILOT</div>
        <div>Hey Elena. Quick pulse on this week:</div>
        <div style="margin-top:8px">
          • <strong>Pipeline is up €480k</strong> (Pavel + Hanna + Jordan drove most of it).<br>
          • <strong>Goal at-risk:</strong> 2 net-new clients/mo. You're at 3 of 6 for Q2. May needs 2 more signed.<br>
          • <strong>Stalled deal:</strong> Norddata · legal pushback on commission clause. Pablo's drafting v2 — worth a nudge?
        </div>
      </div>
      <div class="copilot-suggest" id="copilot-suggest">
        <div class="copilot-suggest-hd">TRY ASKING</div>
        <button onclick="copilotAsk('Summarize where we are with Skyfall Studios')">Summarize where we are with Skyfall Studios</button>
        <button onclick="copilotAsk('Draft a follow-up to Jordan Mensah')">Draft a follow-up to Jordan Mensah</button>
        <button onclick="copilotAsk('Which leads went cold this week?')">Which leads went cold this week?</button>
        <button onclick="copilotAsk('What changed in pipeline vs last week?')">What changed in pipeline vs last week?</button>
        <button onclick="copilotAsk('Who has capacity for a new client?')">Who has capacity for a new client?</button>
      </div>
    </div>
    <form class="copilot-input" onsubmit="copilotSubmit(event)">
      <input type="text" id="copilot-input" placeholder="Ask the Copilot anything…" autocomplete="off">
      <button type="submit">↵</button>
    </form>
  `;
  document.body.appendChild(panel);
}
function toggleCopilot() {
  document.getElementById('copilot-panel').classList.toggle('open');
  if (document.getElementById('copilot-panel').classList.contains('open')) {
    setTimeout(() => document.getElementById('copilot-input').focus(), 100);
  }
}
function copilotSubmit(e) {
  e.preventDefault();
  const v = document.getElementById('copilot-input').value.trim();
  if (!v) return;
  copilotAsk(v);
  document.getElementById('copilot-input').value = '';
}
function copilotAsk(q) {
  const body = document.getElementById('copilot-body');
  const suggest = document.getElementById('copilot-suggest');
  if (suggest) suggest.style.display = 'none';
  const userMsg = document.createElement('div');
  userMsg.className = 'copilot-msg from-user';
  userMsg.innerHTML = `<div class="copilot-msg-who">YOU</div><div>${q.replace(/</g,'&lt;')}</div>`;
  body.appendChild(userMsg);

  const thinking = document.createElement('div');
  thinking.className = 'copilot-msg from-ai thinking';
  thinking.innerHTML = `<div class="copilot-msg-who">COPILOT</div><div><span class="dot-pulse"></span><span class="dot-pulse"></span><span class="dot-pulse"></span></div>`;
  body.appendChild(thinking);
  body.scrollTop = body.scrollHeight;

  setTimeout(() => {
    thinking.remove();
    const ai = document.createElement('div');
    ai.className = 'copilot-msg from-ai';
    ai.innerHTML = `<div class="copilot-msg-who">COPILOT</div><div>${copilotAnswer(q)}</div>`;
    body.appendChild(ai);
    body.scrollTop = body.scrollHeight;
  }, 1200);
}
function copilotAnswer(q) {
  const t = q.toLowerCase();
  if (t.includes('skyfall')) {
    return `<strong>Skyfall Studios · C-013</strong><br>
      Pablo's running the cycle. Started 4 Mar, renewal 4 Sep. Stage: <em>Pipeline</em>. Health: green.<br>
      • €420k pipeline created, €88k closed.<br>
      • Last action: contract sent for the €120k Pavel deal (38m ago). Reply expected Thursday.<br>
      • Next: pricing review with their CRO Tuesday 11:00 CET.<br>
      <em>Suggested move</em>: ping Pavel today asking if Thursday still works — keeps momentum.`;
  }
  if (t.includes('jordan') || t.includes('mensah')) {
    return `Drafted a follow-up. Tone: warm + specific. Want me to send via Resend?<br><br>
      <em style="background:var(--vp-paper); display:block; padding:10px 12px; border-left:3px solid var(--vp-terracotta); margin-top:8px">
      Hi Jordan — saw you ran the Calculator and the math landed at €85k. That tracks with what we see at Series A SaaS in the EU.<br><br>
      One question before I send a scope: are you currently 1 AE running everything, or is there a founder doing demos? It changes what a Veerpoint cycle looks like.<br><br>
      30 min on Thursday? — Anton
      </em>`;
  }
  if (t.includes('cold')) {
    return `<strong>3 leads went cold in the last 7 days:</strong><br>
      • <strong>Priya Raman (Atlas Onboard)</strong> · last touch 8h ago, no reply to discovery email · suggested: founder nudge<br>
      • <strong>Léa Marchetti (Pavia Studio)</strong> · 2 days, no reply to Calculator follow-up · suggested: re-engage with case study<br>
      • <strong>Sarah Klein (Treloar)</strong> · technically warm but slipping, 26 hours since last LinkedIn DM · suggested: drop a voice note`;
  }
  if (t.includes('pipeline') && t.includes('last week')) {
    return `<strong>Pipeline · this week vs last:</strong><br>
      • <strong>+€480k net</strong> created (€680k in, €200k slipped/lost)<br>
      • <strong>Top gainers</strong>: Pavel Sørensen €120k (NEW), Hanna Nyström €72k (NEW), Jordan Mensah €85k (NEW)<br>
      • <strong>Losses</strong>: Berkshire Ops -€140k (no fit), Atlas -€60k (timing)<br>
      • <strong>Velocity</strong>: avg time-in-stage down 18% — discovery → SOW faster than last quarter`;
  }
  if (t.includes('capacity') || t.includes('bandwidth')) {
    return `<strong>Operator capacity right now:</strong><br>
      • <strong>Mei Nakamura</strong> · 0% utilized · on the bench, ready for a new client<br>
      • <strong>Søren Halvorsen</strong> · 35% · shadowing Dylan, can take a co-pilot role from week 3<br>
      • <strong>Dylan</strong> · 76% · could take one more if the motion is light<br>
      • <strong>Anton, Pablo</strong> · 90%+ · no new clients this month<br>
      <em>Recommendation</em>: Mei is your slot. Ideal fit: Series A EU, AE-expansion motion.`;
  }
  return `I'd answer "${q.replace(/</g,'&lt;')}" by querying leads, clients, and the activity log. In the real version I'll cite specific records. For this demo, the wiring's not live yet — but the answers above are how it'll work.`;
}

/* ============ COMMAND PALETTE ============ */
function injectPalette() {
  if (document.getElementById('palette')) return;
  const p = document.createElement('div');
  p.id = 'palette';
  p.className = 'palette';
  p.innerHTML = `
    <div class="palette-modal">
      <div class="palette-input-wrap">
        <span>⌕</span>
        <input id="palette-input" type="text" placeholder="Jump to anything · leads, clients, pages, automations…" autocomplete="off">
        <span class="kbd">Esc</span>
      </div>
      <div class="palette-results" id="palette-results"></div>
      <div class="palette-foot">
        <span><span class="kbd">↑↓</span> navigate</span>
        <span><span class="kbd">↵</span> open</span>
        <span><span class="kbd">⌘K</span> close</span>
      </div>
    </div>
  `;
  document.body.appendChild(p);

  const items = [
    ...VP.nav.flatMap(g => g.items.map(i => ({ label: i.label, sub: 'Page · ' + g.section, href: i.href }))),
    ...VP.leads.map(l => ({ label: l.name + ' · ' + l.company, sub: 'Lead · ' + l.stage.toUpperCase(), href: 'leads.html?id=' + l.id })),
    ...VP.clients.map(c => ({ label: c.name, sub: 'Client · ' + c.stage, href: 'clients.html' })),
    ...VP.blogPosts.map(b => ({ label: b.title, sub: 'Blog · ' + b.status, href: 'content.html' })),
    ...VP.automations.map(a => ({ label: a.name, sub: 'Automation', href: 'automations.html' })),
    { label: 'Invite a teammate', sub: 'Action', href: 'team.html' },
    { label: 'Export leads CSV',  sub: 'Action', href: 'leads.html' },
    { label: 'Sign out',          sub: 'Action', href: 'index.html', signout: true },
  ];

  let sel = 0;
  function render(q = '') {
    const qq = q.toLowerCase();
    const filtered = items.filter(x => x.label.toLowerCase().includes(qq) || x.sub.toLowerCase().includes(qq)).slice(0, 10);
    sel = Math.min(sel, Math.max(0, filtered.length - 1));
    document.getElementById('palette-results').innerHTML = filtered.length === 0
      ? `<div style="padding: 30px 20px; text-align:center; color:var(--vp-muted); font-size:13px">No matches for "${q}"</div>`
      : filtered.map((x, i) => `
        <div class="palette-row ${i === sel ? 'sel' : ''}" data-href="${x.href}" data-idx="${i}" ${x.signout ? 'data-signout="1"' : ''}>
          <span class="label">${x.label}</span>
          <span class="sub">${x.sub}</span>
        </div>
      `).join('');
    // Bind clicks
    document.querySelectorAll('.palette-row').forEach(r => {
      r.addEventListener('click', () => {
        if (r.dataset.signout) sessionStorage.removeItem('vp-admin-auth');
        location.href = r.dataset.href;
      });
    });
  }
  function open() { p.classList.add('open'); setTimeout(() => document.getElementById('palette-input').focus(), 50); render(''); }
  function close() { p.classList.remove('open'); document.getElementById('palette-input').value = ''; sel = 0; }

  document.getElementById('palette-input').addEventListener('input', e => { sel = 0; render(e.target.value); });
  document.getElementById('palette-input').addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { sel++; render(e.target.value); e.preventDefault(); }
    if (e.key === 'ArrowUp')   { sel = Math.max(0, sel - 1); render(e.target.value); e.preventDefault(); }
    if (e.key === 'Enter')     {
      const r = document.querySelector('.palette-row.sel');
      if (r) { if (r.dataset.signout) sessionStorage.removeItem('vp-admin-auth'); location.href = r.dataset.href; }
    }
    if (e.key === 'Escape') close();
  });
  p.addEventListener('click', e => { if (e.target === p) close(); });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); p.classList.contains('open') ? close() : open(); }
    if ((e.metaKey || e.ctrlKey) && e.key === '/') { e.preventDefault(); toggleCopilot(); }
    if (e.key === 'Escape' && p.classList.contains('open')) close();
  });
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

/* ============ LINE CHART ============ */
function lineChart(values, w = 720, h = 220, labels = []) {
  const max = Math.max(...values) * 1.1;
  const min = 0;
  const padL = 36, padR = 12, padT = 12, padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const step = innerW / (values.length - 1);
  const yToPx = (v) => padT + innerH - ((v - min) / (max - min)) * innerH;
  const pts = values.map((v, i) => `${padL + i * step},${yToPx(v)}`).join(' ');
  const grids = [0, 0.25, 0.5, 0.75, 1].map(p => {
    const y = padT + innerH * (1 - p);
    const labelVal = Math.round(min + (max - min) * p);
    return `
      <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#E5E5E5" stroke-width="1" stroke-dasharray="${p === 0 ? '0' : '2,3'}"/>
      <text x="${padL - 8}" y="${y + 3}" font-family="Geist Mono" font-size="9" fill="#9C9C9F" text-anchor="end">${labelVal}</text>
    `;
  }).join('');
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

/* ============ BAR CHART ============ */
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

/* ============ DONUT / PROGRESS RING ============ */
function ringChart(pct, size = 90, color = '#A04022') {
  const r = size / 2 - 6;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - pct / 100);
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#E5E5E5" stroke-width="6"/>
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${color}" stroke-width="6"
              stroke-dasharray="${circ}" stroke-dashoffset="${off}" stroke-linecap="round"
              transform="rotate(-90 ${c} ${c})"/>
      <text x="${c}" y="${c + 4}" text-anchor="middle" font-family="Inter Tight" font-size="${size / 4}" font-weight="700" fill="#1C1C1E">${pct}%</text>
    </svg>
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

window.VP = VP;
window.renderShell = renderShell;
window.sparkline = sparkline;
window.renderKpi = renderKpi;
window.lineChart = lineChart;
window.barChart = barChart;
window.funnelChart = funnelChart;
window.ringChart = ringChart;
window.toast = toast;
window.toggleCopilot = toggleCopilot;
window.copilotAsk = copilotAsk;
window.copilotSubmit = copilotSubmit;
