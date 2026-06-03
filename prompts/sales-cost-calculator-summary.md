# Sales Team Cost Calculator · Executive Summary Prompt

System spec for generating the Sales ROI executive summary from a completed Sales Team Cost Calculator quiz. Stored here so an LLM endpoint can pick it up directly. The front-end (`calculator.html` → `buildExecSummary`) currently uses template-based composition that follows this same structure.

---

## Goal

Answer: is this company's sales function paying for itself, and is it scalable?

Do not repeat the quiz answers. Convert them into a sharp commercial diagnosis using estimated numbers, benchmark comparisons, hidden-cost insights, and a personalised verdict.

Output only the free executive summary.

Length: 180–280 words. Tone: executive, clear, numbers-led, commercial, slightly provocative, useful, not too salesy.

---

## Required Output Structure

Start with:

> Your Sales ROI Snapshot
>
> Based on your answers, your sales engine appears to generate approximately:
>
> €X.XX in new revenue for every €1 invested into sales

Then briefly explain if that is weak, acceptable, healthy, or strong:

| Revenue per €1 invested | Interpretation |
|-------------------------|----------------|
| Under €1                | Sales is not yet paying for itself |
| €1–€2                   | Weak / fragile |
| €2–€4                   | Acceptable but needs optimisation |
| €4–€8                   | Healthy |
| €8+                     | Strong, but check scalability |

Then the personalised diagnosis paragraph, executive verdict, and hook for the full report.

---

## Questions

### Q1 — Sales setup
A. No real sales setup yet
B. Mostly founder-led
C. Founder + freelancer / part-time support
D. 1 full-time salesperson
E. 2–3 full-time salespeople
F. 4+ full-time salespeople
G. Other

### Q2 — Founder/senior leadership weekly sales hours
A. Almost none
B. 1–3 hours
C. 4–7 hours
D. 8–15 hours
E. 15+ hours
F. Sales basically depends on the founder

### Q3 — Why do good leads usually fall off?
A. We reply too slowly
B. Follow-up is not consistent enough
C. The pitch does not create enough urgency
D. No one clearly owns the next step
E. The lead was not qualified properly
F. The founder is still needed to build trust or close
G. The proposal does not convert well enough
H. Price, budget, or timing gets in the way
I. We don't have enough good leads to tell
J. I'm not sure

### Q4 — Usual sales cycle length
A. Same day / impulse decision
B. A few days
C. 1–2 weeks
D. 2–4 weeks
E. 1–3 months
F. 3+ months
G. It varies too much to say
H. I'm not sure

### Q5 — New customers / deals closed per month
A. 0–1
B. 2–5
C. 6–10
D. 11–20
E. 21–50
F. 50+
G. I'm not sure

### Q6 — Ticket size
A. Under €500
B. €500–€2,000
C. €2,000–€10,000
D. €10,000–€50,000
E. €50,000+
F. It varies too much

### Q7 — Lead channels (multi-select)
A. Meta Ads · B. Google Ads · C. LinkedIn Ads · D. TikTok Ads · E. YouTube Ads · F. SEO / organic · G. Referrals · H. Events / partnerships · I. Cold outreach · J. Agencies / lead providers · K. Other · L. No clear source

### Q8 — Monthly paid lead-gen spend
A. €0
B. €1–€1,000
C. €1,000–€3,000
D. €3,000–€7,000
E. €7,000–€15,000
F. €15,000–€30,000
G. €30,000+
H. I'm not sure

### Q9 — Contact details (gate form)
A. Full name · B. Email · C. Country · D. Phone number

### Q10 — Monthly new leads
A. 0–10 · B. 11–30 · C. 31–75 · D. 76–150 · E. 151–300 · F. 300+ · G. I'm not sure

---

## Calculation Model

### Deals closed per month (midpoint)
| Answer | Midpoint |
|--------|----------|
| A 0–1   | 0.5  |
| B 2–5   | 3.5  |
| C 6–10  | 8    |
| D 11–20 | 15.5 |
| E 21–50 | 35.5 |
| F 50+   | 60   |
| G unsure| 1    |

### Ticket size (midpoint)
| Answer | Midpoint |
|--------|----------|
| A Under €500   | €250    |
| B €500–€2,000  | €1,250  |
| C €2,000–€10k  | €6,000  |
| D €10k–€50k    | €30,000 |
| E €50k+        | €75,000 |
| F Varies       | Conservative estimate; flag uncertainty |

### Paid lead-gen spend (midpoint)
| Answer | Midpoint |
|--------|----------|
| A €0          | €0      |
| B €1–€1k      | €500    |
| C €1k–€3k     | €2,000  |
| D €3k–€7k     | €5,000  |
| E €7k–€15k    | €11,000 |
| F €15k–€30k   | €22,500 |
| G €30k+       | €35,000 |
| H unsure      | €1,000  |

### Monthly leads (midpoint)
| Answer | Midpoint |
|--------|----------|
| A 0–10     | 5    |
| B 11–30    | 20.5 |
| C 31–75    | 53   |
| D 76–150   | 113  |
| E 151–300  | 225  |
| F 300+     | 350  |
| G unsure   | 20   |

### Founder hidden cost
`founder hidden cost = weekly founder sales hours × €100 × 4.33`

| Q2 answer | Weekly hours |
|-----------|--------------|
| A Almost none           | 0    |
| B 1–3 hours             | 2    |
| C 4–7 hours             | 5.5  |
| D 8–15 hours            | 11.5 |
| E 15+ hours             | 17.5 |
| F Depends on founder    | 20   |

### Estimated sales labour cost (from Q1 setup)
| Q1 answer | Monthly labour cost |
|-----------|---------------------|
| A No setup        | €0      |
| B Mostly founder  | €500    |
| C Founder + part-time | €1,500 |
| D 1 FTE           | €4,000  |
| E 2–3 FTE         | €10,000 |
| F 4+ FTE          | €18,000 |
| G Other           | Conservative estimate |

### Core formulas
- Estimated monthly new revenue = deals × ticket
- Estimated true sales cost = spend + sales labour + founder hidden cost
- Revenue per €1 invested = revenue ÷ cost
- Lead-to-customer conversion = deals ÷ leads
- Cost per lead = spend ÷ leads
- Cost per closed deal = cost ÷ deals

---

## Choose the Most Relevant Benchmark

Use 1–2 benchmark comparisons maximum. Don't always benchmark lead-to-customer conversion — pick the one that reveals the biggest issue or opportunity.

### Sales ROI
Sales engines often become commercially interesting once they generate €3–€5 back for every €1 invested.

### Lead-to-customer conversion
- Under 2% → below broad benchmark / likely leakage
- 2–5% → around broad B2B benchmark
- 5–10% → healthy
- 10%+ → strong, especially for high-ticket

Suggested wording: "Your estimated lead-to-customer conversion is around X%, which appears above / around / below broad B2B benchmark ranges of roughly 2–5%, depending on industry, lead source, and sales cycle."

### Founder dependency
- 0–3 hrs/week → low dependency
- 4–7 hrs/week → moderate
- 8–15 hrs/week → high
- 15+ hrs/week → critical bottleneck
- Depends on founder → not scalable

Suggested wording: "At roughly X hours/week, founder sales involvement may represent around €X/month in hidden sales cost."

### Cost per lead
"Your estimated cost per lead is around €X. For a high-ticket offer, that may be acceptable — but only if response speed, qualification, and follow-up are strong."

### Sales cycle
"A 1–3 month sales cycle can be normal for a €10k–€50k offer, but it becomes expensive when the founder is still involved in most serious opportunities."

---

## Personalised Diagnosis Logic

Choose one dominant diagnosis. Priority order:

1. **Sales Not Paying for Itself** — ROI under €1, OR ROI €1–€2 + moderate/high founder involvement, OR cost per deal high vs ticket size
2. **Founder Bottleneck** — founder ≥ 8 hrs/week, OR Q2 = F, OR Q3 = F (founder needed to build trust)
3. **Revenue Leakage** — leads ≥ 31/month and deals low/moderate, OR Q3 in {A, B, C, D, E, G}, OR conversion < 2–5%
4. **Paid Acquisition Inefficiency** — spend ≥ €7k/month, OR cost/lead high vs ticket, OR paid active but conversion low
5. **Sales Team Productivity Gap** — has 1+ FTE, deals low, ROI weak, founder still heavy
6. **Lead Volume Problem** — leads 0–30, deals low, paid spend €0 or low
7. **Healthy but Not Scalable** — ROI ≥ €8, conversion healthy, deal value high, BUT founder ≥ 4 hrs/week or follow-up inconsistent

Exception: if ROI is strong but founder involvement is high → Founder Bottleneck or Healthy but Not Scalable, not Sales Not Paying for Itself.

If lead volume is low, avoid over-analysing conversion (sample size too small).

---

## Executive Verdicts + Full Report Hooks

### Sales Not Paying for Itself
Verdict: Your sales setup may be creating activity, but not enough revenue for every €1 invested.
Hook: In the full report, we'll break down what would need to change for your sales engine to become profitable — lowering cost per lead, improving close rate, shortening the sales cycle, or replacing manual sales effort with a managed process.

### Founder Bottleneck
Verdict: Your sales process may be profitable, but founder-dependent sales is expensive sales.
Hook: In the full report, we'll estimate how much founder time could potentially be removed, where handoff should happen, and how a managed sales team could protect conversion while reducing senior leadership involvement.

### Revenue Leakage
Verdict: You may not need more leads first — you may need to stop losing the leads already entering your pipeline.
Hook: In the full report, we'll show where leads may be dropping off, what that could be costing each month, and how a managed sales process could help convert more of the demand already created.

### Lead Volume Problem
Verdict: Before scaling sales headcount, you may need a more predictable lead engine.
Hook: In the full report, we'll estimate how much qualified lead volume may be needed for sales to pay for itself predictably — and whether internal hiring or a managed sales model makes more sense at this stage.

### Paid Acquisition Inefficiency
Verdict: You are already paying for demand — the risk is that your sales process is not extracting enough revenue from it.
Hook: In the full report, we'll estimate where paid demand may be under-monetised and whether better response speed, follow-up, qualification, or outsourcing could improve revenue per €1 spent.

### Sales Team Productivity Gap
Verdict: The question is not whether you have salespeople — it is whether each sales euro is producing enough pipeline and closed revenue.
Hook: In the full report, we'll compare your current sales output against team cost and show whether better management, stronger follow-up, clearer ownership, or outsourcing could improve performance.

### Healthy but Not Scalable
Verdict: Your sales engine appears profitable — now the opportunity is making that performance repeatable without founder pressure.
Hook: In the full report, we'll show what is already working, what may break as volume increases, and where a managed sales process could help scale without unnecessary internal cost.

---

## Writing Rules

- Do not repeat the quiz answers.
- Pick only the 2–3 most important numbers.
- Use "appears," "suggests," "may," "estimated."
- Do not guarantee improvements.
- Do not make legal, financial, or guaranteed performance claims.
- Always explain what the numbers mean commercially.
- Make the final CTA commercially valuable: it should suggest the full report will uncover how to reduce sales cost, improve conversion, recover lost revenue, or decide whether outsourcing sales could outperform the current setup.
