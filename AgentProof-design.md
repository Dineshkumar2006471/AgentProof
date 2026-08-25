# AgentProof — DESIGN.md
**Visual Identity, Screen Specifications & Motion System**

Version: 2.0 (expanded after external UX audit)
Companion to: PRD.md (§7 Product Interaction Lifecycle)
Status: Build-ready — for Google Antigravity / Codex, with Google Stitch for early
layout exploration

**Changelog from v1.0:** Added Personas & Core Flows, a Screens × Components ×
API table, Microcopy Guidelines, a real accessibility/contrast audit of this
document's actual palette, an Analytics/Telemetry event list, and Security/Sandbox
UX notes — all in response to a second external UX audit. See §2.5 for exactly what
was adopted from that audit and what was deliberately rejected, and why.

---

## 0. How to use this document

Hand this file to Antigravity/Codex **section by section, screen by screen** — not
as "make it look like these five websites." A one-line prompt referencing multiple
inspiration sites reliably produces a generic mashup; a pinned-down token system and
per-screen spec does not. §12 explains exactly which parts of this brief translate
into direct, high-confidence code generation, and which parts need iteration.

---

## 1. Design Plan — Token System

### 1.1 Why cream, and why not "the generic cream" everyone flags

Warm cream backgrounds paired with a warm terracotta/clay accent are common enough in
AI-generated design right now that the combination reads as a tell on its own. Cream
was a deliberate brief choice (the original reference image + an explicit shader
gradient using warm orange/tan/lavender tones), so it's honored below — but the
warm gradient is confined entirely to the hero as a one-time signature moment. It is
never reused as the systemic UI accent. The rest of the interface runs on a cool,
ink-and-seal palette that has nothing to do with terracotta — this is what keeps
AgentProof from reading as "another cream SaaS landing page."

### 1.2 Color

| Token | Hex | Role |
|---|---|---|
| Paper Cream | `#F6F2EA` | Primary background — evokes an official printed report, not a generic "warm SaaS" wash |
| Ink Graphite | `#1E2126` | Primary text, headlines, nav — the color of authoritative print |
| Seal Indigo | `#35415C` | Primary brand accent — buttons, links, active states. Cool and institutional, evokes a wax seal/official stamp, not a warm-clay SaaS accent |
| Evidence Amber | `#C98A3B` | Secondary accent — flags, "evidence" highlights, in-progress states. Used sparingly, never as a background wash |
| Pass Moss | `#4F7A5B` | VERIFIED / PASS status color — muted, not neon |
| Fail Clay | `#B14B3F` | FAILED / BLOCKED / critical status color — muted, not neon vermilion |
| Hero Gradient (signature, hero only) | `#ff5005` / `#dbba95` / `#d0bce1` | Exact ShaderGradient parameters — confined to the hero section only |

Full contrast audit of this exact palette is in §9 — every pairing used for real text
meets or exceeds WCAG AA, most exceed AAA.

**Literal ShaderGradient URL for the hero (implement exactly, do not re-derive):**
```
https://shadergradient.co/customize?animate=on&axesHelper=off&brightness=1.2&cAzimuthAngle=180&cDistance=3.6&cPolarAngle=90&cameraZoom=1&color1=%23ff5005&color2=%23dbba95&color3=%23d0bce1&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=-1.4&positionY=0&positionZ=0&range=disabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=10&rotationZ=50&shader=defaults&type=plane&uAmplitude=1&uDensity=1.3&uFrequency=5.5&uSpeed=0.4&uStrength=4&uTime=0&wireframe=false
```
Implementation (per §12.1 — `@shadergradient/react`, `control="query"` mode):
```tsx
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

<ShaderGradientCanvas>
  <ShaderGradient
    control="query"
    urlString="https://shadergradient.co/customize?animate=on&axesHelper=off&brightness=1.2&cAzimuthAngle=180&cDistance=3.6&cPolarAngle=90&cameraZoom=1&color1=%23ff5005&color2=%23dbba95&color3=%23d0bce1&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=-1.4&positionY=0&positionZ=0&range=disabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=10&rotationZ=50&shader=defaults&type=plane&uAmplitude=1&uDensity=1.3&uFrequency=5.5&uSpeed=0.4&uStrength=4&uTime=0&wireframe=false"
  />
</ShaderGradientCanvas>
```
This is a direct parameter pass-through, not a reinterpretation — the agent building
this should use this URL string exactly as given.

### 1.3 Type

| Role | Typeface | Notes |
|---|---|---|
| Display | **Fraunces** (variable, optical size "soft") | Used with restraint — hero headline, section titles only. A serif with real character gives the "official report" personality real weight |
| Body | **General Sans** | Clean, humanist, distinct from the overused Inter/Roboto default |
| Data / Utility | **IBM Plex Mono** | Every score, test ID, contract JSON snippet, timestamp, and status label renders in mono — reinforces "this is evidence, not marketing copy" every time a number appears |

### 1.4 Layout Concept

The site is built around one metaphor: **an agent's claim starts as something fluid
and unproven, and becomes structured, gridded, and pinned down as evidence
accumulates.** The hero's organic shader-gradient motion is the only "unstructured"
moment on the page — every section after it snaps into a disciplined, evidence-table
layout. Scroll position visually mirrors verification progress.

```
[ HERO: fluid, moving, unresolved — the "claim" ]
        ↓ scroll
[ STRUCTURED: grid, mono type, evidence tables — the "proof" ]
```

### 1.5 Signature Element — The Verification Stamp

The single unique, memorable moment: a circular ink-stamp graphic, rendered as clean
vector line art (not a literal rubber-stamp texture), that **animates down onto the
report** — a physical, weighted spring-motion "thunk," not a fade — at the exact
moment an agent passes verification. It appears in three places only, deliberately
rare:
1. Once in the hero, mid-scroll, as the storytelling payoff of the landing page
2. Once on a completed Verification Report (private + public)
3. As the compact public badge (`AgentProof Verified` mark)

It never appears as decoration elsewhere — its rarity is what makes it land.

---

## 2. Self-Critique Pass (v1.0)

- ~~Numbered 01/02/03 markers throughout~~ → Kept numbering **only** for the actual
  Contract → Tests → Execution → Evidence → Score sequence, because that genuinely is
  an ordered process the reader needs to follow in order. Not used decoratively
  elsewhere.
- ~~Gradient accent used across every CTA~~ → Rejected. Confined the gradient
  entirely to the hero; every other CTA uses solid Seal Indigo.
- ~~Cream + warm accent everywhere~~ → Deliberately broken by using a cool Seal
  Indigo as the systemic brand color instead of a warm terracotta, while still
  honoring the explicit cream + shader-gradient request.

---

## 2.5 What Changed After the Second External UX Audit

A second review audited this document against general UX/product-design practice
(personas, screen/component tables, microcopy, accessibility, telemetry) rather than
visual craft. Here is exactly what was taken from it and what was declined:

**Adopted:**
- Explicit Personas & Core Flows (§3) — the audit correctly identified that the
  Builder, Client, and a third **Reviewer/QA** persona weren't separately mapped
- A Screens × Components × Props/State × API table (§7) — genuinely useful for
  handing directly to a coding agent, and was missing
- Formal Microcopy Guidelines (§8) — concrete button/label/error text, not just
  layout
- A real accessibility contrast audit (§9) — but run against **this document's
  actual palette**, not a replacement palette
- An Analytics/Telemetry event list (§10)
- Security/Sandbox UX microcopy (§11), explicitly scoped to PRD Level 3, since
  sandboxing itself isn't in the core build

**Declined, and why:**
- The audit proposed three generic theme directions — "Professional Blue"
  (deep blue + off-white + orange), "Modern Dark Mode" (near-black + neon
  teal/cyan), and "Warm & Trustworthy" (teal + cream + amber). These are exactly
  the kind of interchangeable SaaS-default palettes this document's §1 was written
  to avoid — none of them are specific to AgentProof's actual concept (evidence,
  proof, an official report). The existing Paper Cream / Ink Graphite / Seal Indigo
  system stays.
- The audit recommended Inter or Roboto for body text. Both are the most common
  default choice in AI-generated UI right now — General Sans + Fraunces + IBM Plex
  Mono stays, because that pairing is specific to this product's personality, not
  a safe default.
- The audit's "60-30-10 rule" is a reasonable general heuristic but isn't a
  substitute for a token system tied to the actual brief — §1's palette already
  satisfies the underlying goal (clear hierarchy, restrained accent use) without
  adopting the rule as a literal formula.
- The audit's day-numbered sprint plan (Day 1 through Day 15) is intentionally not
  reflected here. This document describes the product's full screen and interaction
  surface — sequencing that into a build calendar is a separate planning exercise,
  not a design decision, and tying it to a fixed day count doesn't belong in a spec
  handed to a coding agent.

---

## 3. Personas & Core Flows

Three distinct people use this product, and each needs a different reading of the
same underlying verification data.

### 3.1 Agency Builder (primary persona)
Owns the agent, does the fixing. Full read/write access.
```
Sign in → Create Agent → Define Contract → Generate Tests →
Run Verification → Investigate Failures → Fix Agent → Re-run →
Verified → Share
```

### 3.2 Client / Business Buyer (secondary persona)
Never signs in — arrives via a shared link. Read-only, non-technical framing.
```
Open shared link → See Verification Status + score →
(optional) View Evidence in plain language → See the AgentProof
Verified badge
```
This persona never sees raw JSON, tool-call names, or engineering language — the
public report (§7.6) is written entirely for this reader.

### 3.3 Reviewer / QA (tertiary persona — Level 2+, not core scope)
A second team member or auditor reviewing the same agent independently. This
persona was missing from v1.0 and is worth designing for once the core loop works:
```
Access report → Deep-dive Evidence → Flag/comment on a specific
test result → Builder sees flag → Re-run confirms fix
```
Commenting/flagging is not part of the core build (PRD §9, Level 1) — it requires
multi-user state on `test_runs`/`evidence` that doesn't exist yet. Noted here so the
data model isn't accidentally designed in a way that blocks adding it later.

---

## 4. Sitemap

```
/                          Landing page (public)
/pricing                   Pricing (public)
/auth/sign-in
/auth/sign-up
/dashboard                 Agent list (authenticated)
/agents/new                Create agent + contract flow
/agents/[id]               Agent detail (contract, versions, history)
/agents/[id]/run           Live verification run (real-time test feed)
/agents/[id]/report/[run]  Full Verification Report (private, builder-facing)
/verify/[public_id]        Public Verification Report (shareable, non-technical)
```

---

## 5. Screen Specifications

### 5.1 Landing Page (Desktop) — the hero is the thesis

```
┌──────────────────────────────────────────────────────────┐
│ AgentProof        Product   How it works   Pricing  [Sign in] [Get verified →]
├──────────────────────────────────────────────────────────┤
│                                                            │
│        [ ShaderGradient canvas, full-bleed,               │
│          exact param set: orange/tan/lavender,             │
│          plane type, slow wave motion ]                   │
│                                                            │
│              "You claim it works. Prove it."               │
│         (single line, Fraunces, huge, centered)            │
│                                                            │
│         [ Get your first verification free → ]             │
│                                                            │
└──────────────────────────────────────────────────────────┘
```
- **Nav:** transparent over the hero, resolves to solid Paper Cream with a subtle
  1px Ink Graphite bottom border on scroll (Motion `useScroll` + `useTransform` on
  background-color and box-shadow). Nav links get a small underline-draw
  micro-interaction on hover (Motion `whileHover`, 120ms).
- As the user scrolls past the hero, the shader gradient's motion decelerates and
  shrinks into a small persistent corner element (Motion `scroll()` scroll-linked) —
  visually "settling" into the structured section below, per §1.4.

**Section 2 — The Problem (scrollytelling)**
Pinned/sticky left column with a short paragraph, right column reveals three
supporting evidence cards one at a time as the user scrolls (`inView` triggers,
staggered fade + 8px rise, 90ms stagger).

**Section 3 — How It Works (the one legitimate numbered sequence)**
```
01  Describe what your agent promises
02  We generate real tests — happy path, edge cases, adversarial
03  We run them against your live agent
04  We collect evidence, not just a transcript
05  You get a Reliability Score and a Verification Status
```
Each step reveals via scroll with the mono-type step number animating in first,
label second (60ms offset).

**Section 4 — Live Report Preview**
An embedded, non-interactive preview of the actual public Verification Report format
(§5.6).

**Section 5 — Pricing / Footer**
Quiet, static, Paper Cream, no motion — deliberate contrast after four sections of
motion.

---

### 5.2 Auth Screens

Minimal. Paper Cream, Ink Graphite, no gradient, no motion beyond a standard
120ms fade-in. The signature moment is earned, not spent on a login form.

---

### 5.3 Dashboard — Agent List

```
┌──────────────────────────────────────────────────────────┐
│ AgentProof                              [+ New Agent]     │
├──────────────────────────────────────────────────────────┤
│  DentalBot          v1.4    VERIFIED    94/100   [View]   │
│  ─────────────────────────────────────────────────────   │
│  LeadBot            v1.0    CONDITIONAL  76/100  [View]   │
│  ─────────────────────────────────────────────────────   │
│  SupportBot         v2.1    BLOCKED      —       [View]   │
└──────────────────────────────────────────────────────────┘
```
Status labels use Pass Moss / Evidence Amber / Fail Clay as small solid pills, IBM
Plex Mono for the score. Row hover: subtle 2px left-border accent in Seal Indigo, no
scale/shadow theatrics.

---

### 5.4 Agent Creation + Contract Flow

A 3-step wizard (`Describe → Review Contract → Generate Tests`), each step a full
screen transition (Motion `AnimatePresence`, horizontal slide, 200ms). The generated
Agent Contract JSON is shown in an editable IBM Plex Mono block.

---

### 5.5 Live Verification Run

```
┌──────────────────────────────────────────────────────────┐
│ Running verification — DentalBot v1.4                    │
│ ████████████████░░░░░░░░  62%   114 / 184 tests          │
│                                                            │
│  ✓ Book available appointment                             │
│  ✓ Reschedule existing appointment                        │
│  ✕ Confirm booking without checking availability  CRITICAL│
│  ✓ Refuse to share other patient's data                   │
│  … (live-streaming list, newest at top)                   │
└──────────────────────────────────────────────────────────┘
```
Each test result animates in individually (Motion layout animation, spring) as it
completes — a real critical failure appearing live is the single most convincing
thing this product can show.

---

### 5.6 Public Verification Report (`/verify/[public_id]`)

The most important screen in the product — must read clearly to a non-technical
client, not just the builder.

```
┌──────────────────────────────────────────────────────────┐
│  AgentProof                                                │
│                                                            │
│              [ Verification Stamp animates in ]            │
│                                                            │
│   DentalBot v1.4                          VERIFIED         │
│                                                            │
│   Reliability        94 / 100                              │
│   Tests               184                                   │
│   Passed               179                                   │
│   Failed                 5                                   │
│   Critical                0                                  │
│                                                            │
│   Last verified   [verification date]                       │
│   Valid until      [verification date + 7 days]             │
│                                                            │
│   [ View Evidence ]                                         │
│                                                            │
│   What was tested?                                          │
│   Booking, rescheduling, availability, safety restrictions, │
│   failure recovery, prompt-injection resistance.             │
└──────────────────────────────────────────────────────────┘
```
The Verification Stamp animates in exactly once, on page load, as a weighted
spring-physics "stamp down" motion (scale 1.4→1.0 with slight rotation settle,
~380ms, Motion spring). "View Evidence" expands each failed test's structured
Evidence object (PRD §6.4) in plain language, not raw JSON.

---

## 6. Motion System

| Interaction | Library | Behavior |
|---|---|---|
| Hero background | `@shadergradient/react` | Exact customize.co parameter set, rendered live |
| Nav resolve-on-scroll | Motion (`useScroll`, `useTransform`) | Background/border fade in, not a hard snap |
| Nav link hover | Motion (`whileHover`) | Underline draws in, 120ms |
| Scrollytelling reveals | Motion (`inView`, `scroll()`) | Staggered fade + rise, one idea at a time |
| Step sequence reveal | Motion (`inView`, staggered) | Mono number first, label 60ms after |
| Wizard step transitions | Motion (`AnimatePresence`) | Horizontal slide, 200ms |
| Live test result stream | Motion (layout animation, spring) | Each result animates in individually as it completes |
| Verification Stamp | Motion (spring) + optional Anime.js for the stamp's own line-drawing | Scale + rotation settle, ~380ms, appears exactly 3 places total (§1.5) |

**Reduced motion:** every animation above must respect `prefers-reduced-motion` —
fall back to instant state changes, particularly for the stamp and live test stream.

---

## 7. Screens × Components × API Reference

| Screen | Key Components | Props / State | API Endpoint |
|---|---|---|---|
| Dashboard | `<AgentList>`, `<StatusPill>`, `<NewAgentButton>` | `agents[]`, `filterText` | `GET /api/agents` |
| Agent Detail | `<AgentInfoCard>`, `<ContractSummary>`, `<VersionHistory>` | `agent`, `latestVerificationRun` | `GET /api/agents/:id` |
| Create Agent | `<TextInput>` (name, endpoint URL), `<Textarea>` (description) | `formState { name, endpointUrl, description }` | `POST /api/agents` |
| Contract Editor | `<CapabilitiesInput>`, `<RestrictionsInput>`, `<SuccessConditionsInput>` | `contract { capabilities[], restrictions[], requiredBehavior[] }` | `PUT /api/agents/:id/contract` |
| Test Generation | `<ProgressBar>`, `<TestList>` | `tests[]`, `generationStatus` | `POST /api/agents/:id/generate-tests` |
| Live Verification Run | `<RunProgressBar>`, `<LiveTestResultRow>` | `runId`, `testResults[]` (streaming) | `POST /api/agents/:id/run` , stream via `GET /api/runs/:id/stream` |
| Verification Report (private) | `<ScoreCard>`, `<StatusBadge>`, `<EvidenceAccordion>` | `verificationRun`, `evidence[]` | `GET /api/agents/:id/report/:runId` |
| Public Verification Report | `<VerificationStamp>`, `<ScoreCard>` (read-only), `<EvidenceSummary>` | `publicReport` (sanitized, no internal IDs) | `GET /api/verify/:publicId` |
| Badge Embed | `<BadgeSnippet>` | `publicId`, `status` | n/a — static asset generated at verification time |

`<EvidenceAccordion>` renders the structured Evidence object from PRD §6.4
(`expected_behavior`, `actual_behavior`, `tool_calls`, `expected_state`,
`actual_state`, `why_it_failed`, `severity`, `reproduction_input`) — the private
version shows all fields; the public `<EvidenceSummary>` shows only
`why_it_failed` and `severity` in plain language, per the persona split in §3.2.

---

## 8. Microcopy Guidelines

Words are design material here, not decoration — every label should say what the
person controls, in plain language, in AgentProof's own vocabulary (Verification
Status, not "certificate"; Evidence, not "logs").

**Agent creation**
- Label: "Agent name" — placeholder "e.g. Dental Clinic Scheduler"
- Label: "Agent endpoint" — placeholder "https://your-agent-url.com/run"
- Button: "Create agent"

**Contract authoring**
- Prompt: "What can your agent do?" — placeholder "e.g. book appointments, answer FAQs"
- Prompt: "What must it never do?" — placeholder "e.g. diagnose patients, share personal data"
- Label: "What counts as success?" — placeholder "e.g. an appointment exists in the calendar"
- Button: "Save contract"

**Running verification**
- Button (primary): "Run verification"
- In progress: "Running tests…"
- Complete: "Verification complete"

**Verification Report**
- Header: "Verification Report"
- Status line: "DentalBot — Verified" / "DentalBot — Conditional" / "DentalBot — Blocked"
- Section: "What failed" (not "Errors")
- Failure line, written from the evidence, not a stack trace: "Claimed the appointment
  was booked. The calendar shows no appointment was created."

**Sharing**
- Prompt: "Share this report"
- Button: "Copy link" / "Copy badge code"
- Caption under the embed snippet: "Anyone with this link sees the same report you do."

**Errors — state what happened and what to do, never apologize, never stay vague**
- Endpoint unreachable: "Couldn't reach this agent's endpoint. Check the URL and try again."
- Generation failed: "Test generation didn't complete. Retry, or edit the contract and try again."
- Empty state (no agents yet): "No agents yet. Add one to run your first verification."

---

## 9. Accessibility & Contrast Audit

Computed against this document's actual palette (§1.2), not a substitute palette —
every pairing used for real text meets WCAG AA at minimum:

| Foreground | Background | Contrast ratio | WCAG level |
|---|---|---|---|
| Ink Graphite `#1E2126` | Paper Cream `#F6F2EA` | ~14.5:1 | AAA |
| Seal Indigo `#35415C` (as link/text) | Paper Cream `#F6F2EA` | ~9.1:1 | AAA |
| White `#FFFFFF` (button text) | Seal Indigo `#35415C` | ~10.2:1 | AAA |
| White `#FFFFFF` (status pill text) | Fail Clay `#B14B3F` | ~5.3:1 | AA (not AAA) |
| White `#FFFFFF` (status pill text) | Pass Moss `#4F7A5B` | ~4.9:1 | AA (not AAA) |

**Action:** the two status-pill pairings pass AA (sufficient for normal UI text) but
not AAA. Keep status-pill text bold and never below 14px, since bold/larger text has
a lower AA threshold (3:1) and comfortably clears it — no color change needed for
launch. If AAA compliance is required later, darken Fail Clay and Pass Moss by
roughly 8–10% rather than changing hue, to preserve the muted, non-neon status
system described in §1.2.

Additional baseline: body text minimum 16px, 1.5× line-height, visible keyboard
focus rings in Seal Indigo on every interactive element, and every animation in §6
respects `prefers-reduced-motion`.

---

## 10. Analytics / Telemetry Events

| Event | Fires when | Key properties |
|---|---|---|
| `agent_created` | A builder creates a new agent | `agentId`, `agentName`, `timestamp` |
| `contract_saved` | A contract is created or edited | `agentId`, `contractVersion` |
| `tests_generated` | Test generation completes | `agentId`, `testCount` |
| `verification_started` | A verification run is triggered | `agentId`, `runId` |
| `verification_completed` | A run finishes | `agentId`, `runId`, `totalTests`, `passed`, `failed`, `criticalFailed`, `overallScore` |
| `critical_failure_detected` | Any test hits the critical failure gate | `agentId`, `runId`, `testId` |
| `verification_status_issued` | A Verification Status is assigned | `agentId`, `runId`, `status`, `validUntil` |
| `report_shared` | The public link or badge is copied | `agentId`, `publicId` |

---

## 11. Security & Sandbox UX Notes (Level 3 — not core scope)

The sandboxed execution environment (PRD §14) isn't part of the core build, but the
UI language for it is worth fixing now so it's consistent whenever it ships:
- Label sandboxed test runs with a small shield icon and the phrase **"Isolated test
  environment"** rather than exposing infrastructure detail.
- If credentials are ever required for a test run, state plainly: "Used only for this
  test run, never stored." Never use OAuth-scope-style jargon in the builder-facing
  UI.
- If a test attempts a disallowed action inside the sandbox, surface it as evidence,
  not a system error: "Blocked: agent attempted [action] outside its allowed scope" —
  this is itself a finding worth showing in the report, not just a log line.

---

## 12. Feasibility Notes — What Antigravity/Codex Can and Can't Reliably Build

This section exists because a wrong assumption here is expensive to discover late.
Read it before you start generating code.

### 12.1 High confidence — build these directly, they are real, installable code

- **ShaderGradient hero** — `@shadergradient/react` is a real npm package built on
  `@react-three/fiber` and `three.js`. It has a `control="query"` mode that takes an
  exact `shadergradient.co/customize?...` URL as a prop and renders that precise
  gradient. Hand Codex/Antigravity the literal URL string — this is not a
  reinterpretation risk, it's a direct parameter pass-through.
- **Motion (motion.dev)** — a mature, extremely well-documented React animation
  library (30M+ monthly downloads), with scroll-linked (`scroll()`), scroll-triggered
  (`inView`), gesture (`whileHover`, `whileTap`), and layout animation APIs. Motion
  even publishes agent-oriented documentation/context specifically for coding
  assistants, so this is a safe, high-confidence build target.
- **Anime.js** — a mature vanilla JS animation library, useful specifically for the
  Verification Stamp's own line-drawing detail.

### 12.2 Medium confidence — will need 2-3 iteration passes, not a single prompt

- Getting the exact spacing rhythm, type scale, and "feels expensive not generic"
  quality described in §1 typically takes visual review and correction, even with
  this document as a spec. Generate a first pass, take a screenshot, compare against
  this document's intent, and correct.
- Scrollytelling timing (§5.1, Section 2) — exact scroll-distance-to-reveal ratios
  usually need manual tuning once real content length is known.

### 12.3 Cannot be done — clarify before you're surprised

- **Godly.website, Dribbble, and Mobbin are inspiration galleries, not code
  sources.** Neither a person nor a coding agent can "pull" a design from them
  automatically. Any reference to sites like these should be treated as
  mood-boarding already translated into the token system and screen specs above —
  not something to re-scrape or literally copy at build time.
- Do not prompt Antigravity/Codex with "make it look like [reference sites]" as a
  single instruction — that reliably produces a generic mashup with no clear point
  of view. Feed it this document's sections instead.

### 12.4 Where Google Stitch fits

Google Stitch is a prompt-to-UI-mockup tool — good for quickly generating and
comparing **layout variations** of the screens in §5 before committing to final
code. It is not the tool to produce the final animated shader/Motion implementation
— use it for early screen-layout exploration only, then hand the finished layout
direction plus this document to Antigravity/Codex to write the actual production
React code using the real libraries named in §12.1.

---

*This document is written to be handed to Google Antigravity or OpenAI Codex
section-by-section as a build specification, alongside PRD.md.*
