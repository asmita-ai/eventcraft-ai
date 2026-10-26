# EventCraft AI — Celebration & Adaptive Event Orchestrator

> **Prompt Wars Virtual — Challenge 5: Celebration & Event Planner**  
> **Powered by Google Gemini 2.5 Flash with Deterministic Quota-Resilience Safeguards**

[![Vitest Tests](https://img.shields.io/badge/Tests-34%20Passing%20(5%20Suites)-emerald?style=flat-square&logo=vitest)](https://vitest.dev)
[![ESLint 9](https://img.shields.io/badge/ESLint-Clean%20(0%20warnings)-success?style=flat-square&logo=eslint)](https://eslint.org)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Security Policy](https://img.shields.io/badge/Security-CSP%20%2B%20XSS%20Sanitized-purple?style=flat-square)](./SECURITY.md)
[![Accessibility](https://img.shields.io/badge/A11y-WCAG%202.1%20AA%20Compliant-brightgreen?style=flat-square)](https://www.w3.org/WAI/)
[![Bundle Size](https://img.shields.io/badge/Bundle-299%20kB%20(Gzip%2088kB)-purple?style=flat-square)](https://vitejs.dev)
[![Repo Size](https://img.shields.io/badge/Repo%20Size-%3C%201%20MB%20(Limit%20%3C10MB)-success?style=flat-square)](https://hack2skill.com)
[![Zero Quota Failure](https://img.shields.io/badge/Quota%20Resilience-100%25%20Guaranteed-amber?style=flat-square)](https://aistudio.google.com)

**🌐 Live Deployed Application:** [https://asmita-ai.github.io/eventcraft-ai/](https://asmita-ai.github.io/eventcraft-ai/)  
**📂 Public GitHub Repository:** [https://github.com/asmita-ai/eventcraft-ai](https://github.com/asmita-ai/eventcraft-ai)

---

## 🎯 The Vision: Moving From Inspiration to Execution

Most AI event planning tools act like simple search engines, generating generic checklists like *"Here are 10 wedding themes"*. 

In the real world, event planning is an interconnected system of living constraints: if the guest count changes, catering costs surge; if the venue slips, decor timelines freeze; if budgets get squeezed, hosts need intelligent trade-offs rather than blind cost-cutting.

**EventCraft AI** transforms event planning into an interconnected, adaptive orchestration system. It balances human priorities across budgets, milestones, vendor proposals, and demographics for weddings, milestone birthdays, and community festivals.

---

## 🌟 Core System Pillars

```mermaid
flowchart TD
    User([Event Host / Organizer]) --> Intake[Interactive Scoping Wizard]
    Intake --> CoreEngine[EventCraft Orchestration Engine]
    
    subgraph Core Pillars
        CoreEngine --> Budget[1. Interconnected Budget & Trade-Offs]
        CoreEngine --> Timeline[2. Dependency-Aware Cascade Timeline]
        CoreEngine --> Vendor[3. Vendor Multi-Quote Comparator]
        CoreEngine --> Ideas[4. Demographic Adaptation Studio]
        CoreEngine --> Revision[5. Mid-Flight Plan Revision Simulator]
    end
    
    subgraph Intelligence & Resilience
        Budget & Timeline & Vendor & Ideas & Revision <--> GeminiBridge[Gemini AI Bridge + Heuristic Guard]
        GeminiBridge <--> CloudAI[(Google Gemini 2.5 Flash / 1.5 Flash)]
        GeminiBridge <--> LocalAI[(Zero-Quota Heuristic Engine)]
    end
```

### 1. Interconnected Budget & Priority-Guided Trade-Offs
- **Proportional Categorization:** Automatically distributes budgets across Venue, Catering, Decor, Photography, Entertainment, Logistics, and Contingency based on user priority rankings.
- **Transparent Estimations vs. Confirmed Quotes:** Clearly distinguishes assumptions (**`[AI Estimate / Assumption]`**) from signed vendor agreements (**`[Confirmed Vendor Quote]`**).
- **20% Over-Budget Trade-Off Engine:** If expenses spike by 20%, it protects top-ranked priorities (e.g. food quality) while suggesting intelligent compromises (e.g. streamlining ceiling decor to preserve the 5-star catering menu for all 200 guests).

### 2. Dependency-Aware Timeline & Cascade Warning Engine
- **Milestone Sequencing:** Replaces static to-do lists with chronologically structured milestones with prerequisite dependencies (e.g., *Lock Venue & Date* is prerequisite to *Catering Tasting* and *Digital Invitations*).
- **Cascade Delay Detection:** Slipping a prerequisite milestone automatically recalculates downstream target dates and surfaces prominent **Cascade Delay Alerts**.

### 3. Vendor RFP & Multi-Quote Comparator
- **Tailored RFP Generator:** Generates copy-paste inquiry prompts with non-negotiable deliverables and high-leverage negotiation tactics.
- **Side-by-Side Quotation Audit:** Unmasks hidden fees (18% GST, overtime fees after 11 PM, generator diesel surcharges, cake-cutting fees) and produces a pre-contract clarification checklist.

### 4. Demographic Personalization & Age Adaptation Studio
- **Human-Centric Adaptation:** Adapts concepts to audience demographics:
  - **Seniors (25%+):** Generates dedicated low-decibel acoustic lounges (*Baithak*) with step-free seating away from high-bass speakers.
  - **Children (15%+):** Crafts supervised creative slime/origami stations to let parents celebrate freely.
  - **Cultural Nuances:** Supports multi-cultural fusion rituals, pure Jain kitchens, and gluten-free dietary needs.
- **Budget Alternatives:** Every creative idea provides a 1-click low-cost or DIY alternative.

### 5. Mid-Flight Plan Revision Simulator (Dynamic Stress Test)
Built specifically to answer the hardest real-world planning challenge:
*What if a user returns mid-flight with +50 guests, -15% budget, and date moved 2 weeks earlier?*
- Evaluates per-guest headroom drop.
- Audits venue occupancy and fire-safety limits.
- Highlights compressed vendor lead times.
- 1-click **"Apply Revised Plan to Event"** updates the live event without restarting from scratch.

---

## 🛡️ Architecture & Resilience Guarantee

To protect against evaluation failures when public API quotas expire, EventCraft AI employs a **Zero-Quota-Failure Architecture**:
1. **Primary Model:** Google Gemini 2.5 Flash via REST API
2. **Secondary Model:** Google Gemini 1.5 Flash
3. **Resilience Fallback:** High-fidelity deterministic heuristic engine that guarantees 100% functionality offline.

Judges and users can also provide their own Gemini API key anytime via the in-app **API Key Modal**.

---

## 🧪 Comprehensive Testing & Quality Verification

EventCraft AI achieves exceptional code reliability, rigorous security defenses, and complete WCAG 2.1 AA accessibility through an automated test suite featuring **34 verified tests across 5 specialized test suites**:

| Test Suite | Coverage Area | Key Assertions Verified |
| :--- | :--- | :--- |
| **`security.test.ts`** (15 tests) | Input Sanitization & Threat Vectors | XSS `<script>`/`<iframe>`/`onerror` stripping, URI injection blocking, HTML entity encoding, prototype pollution prevention, constraint bounds. |
| **`calculations.test.ts`** (6 tests) | Budget & Milestone Mathematics | Zero-penny remainder rounding, 20% overage triggers, dynamic contingency reallocation, cascade timeline date propagation. |
| **`workflows.test.tsx`** (5 tests) | End-to-End User Journeys | 3 Archetype plans (Wedding, Birthday, Community), mid-flight stress scenario (`+50G, -15%, -2W`) activation & reset, `<ErrorBoundary>` fault recovery. |
| **`a11y.test.tsx`** (5 tests) | Accessibility & Keyboard Navigation | Skip-to-content landmark, ARIA `tablist`/`tabpanel` states, modal dialog focus trapping & `Escape` key dismissal, range slider accessible semantics. |
| **`components.test.tsx`** (3 tests) | Core Component Renders | Real-time budget dashboard rendering, vendor comparator metrics, interactive trade-off sliders. |

### Development & Verification Commands

```bash
# Clone repository
git clone https://github.com/asmita-ai/eventcraft-ai.git
cd eventcraft-ai

# Install dependencies
npm install

# Run strict ESLint verification (0 errors, 0 warnings)
npm run lint

# Run all 34 automated tests across all 5 test suites
npm test

# Compile production bundle with TypeScript strict type checking
npm run build

# Launch local preview server
npm run dev
```

---

## 🔒 Security & Privacy Specification

- **Zero Credential Retention:** Gemini API keys are kept strictly in browser storage and directly transmitted only to Google's official Gemini endpoint. No intermediary telemetry server is used.
- **XSS & Injection Protection:** User inputs are sanitized using deterministic regex filters and entity encoded via `sanitizeString()`.
- **Content Security Policy (CSP):** Enforced via strict `<meta http-equiv="Content-Security-Policy">` headers.
- **Full Security Policy:** Documented in [SECURITY.md](./SECURITY.md).

---

## 📄 License
MIT License. Created for Prompt Wars Virtual 2026.
