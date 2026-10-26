# EventCraft AI — System Architecture & Engineering Dossier

## 1. Architectural Philosophy: Intent-Driven Modular Design

EventCraft AI is engineered using modern clean architecture principles tailored for client-side generative AI orchestration. Rather than a monolithic single-script prototype, the codebase separates concerns into pure mathematical utilities, decoupled state orchestration hooks, isolated presentation components, and resilient service bridges.

```mermaid
flowchart TD
    subgraph UI Layer [Presentation Components]
        App[App.tsx (Root Orchestrator)]
        Wizard[ScopingWizard & Steps 1-4]
        BudgetView[BudgetDashboard & TradeOffs]
        TimelineView[TimelineManager & Cascades]
        VendorView[VendorComparator & RFPs]
        IdeasView[PersonalizedStudio]
        RevisionView[PlanRevisionSimulator]
        Modals[ApiKeyModal, JudgeGuideModal]
    end

    subgraph State Orchestration Layer [Custom React Hooks]
        HookEvent[useEventPlan]
        HookModal[useModalState]
    end

    subgraph Business Logic & Math Layer [Pure Utils]
        CalcEngine[calculations.ts (Budget & Cascade Delays)]
        SecEngine[security.ts (Sanitization & Pollution Defense)]
        CurrEngine[currency.ts (ISO Formatter)]
    end

    subgraph Resilience & Service Layer [Dual Strategy Bridge]
        ServiceBridge[gemini.ts (REST Gateway)]
        HeuristicFallback[heuristicGenerator.ts (Zero-Quota Engine)]
    end

    App --> HookEvent
    App --> HookModal
    App --> Wizard
    App --> BudgetView
    App --> TimelineView
    App --> VendorView
    App --> IdeasView
    App --> RevisionView

    HookEvent --> CalcEngine
    HookEvent --> ServiceBridge
    HookEvent --> HeuristicFallback

    ServiceBridge -.->|Primary Route| CloudGemini[Google Gemini 2.5 Flash]
    ServiceBridge -.->|Quota Fallback| HeuristicFallback
```

---

## 2. SOLID Principles & Software Design Patterns

| Pattern / Principle                  | Application in EventCraft AI                                                                                                                                   | Concrete File Reference                                                                                  |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **Single Responsibility (SRP)**      | UI presentation is strictly separated from stateful business logic. Components only render JSX; state transitions and calculations live in custom hooks.       | [`useEventPlan.ts`](./src/hooks/useEventPlan.ts), [`App.tsx`](./src/App.tsx)                             |
| **Separation of Concerns (SoC)**     | The 600-line Scoping Wizard was factored into 4 independent, focused step components with explicit props interfaces.                                           | [`src/components/scoping/steps/`](./src/components/scoping/steps/)                                       |
| **Strategy Pattern**                 | Plan generation switches seamlessly between live Google Gemini Cloud API and deterministic local heuristic generation without breaking the component consumer. | [`gemini.ts`](./src/services/gemini.ts), [`heuristicGenerator.ts`](./src/services/heuristicGenerator.ts) |
| **Immutability & Pure Functions**    | All budget recalculations, timeline delays, and trade-off toggles return fresh object references without mutating state in-place.                              | [`calculations.ts`](./src/utils/calculations.ts)                                                         |
| **Fault Isolation (Error Boundary)** | Uncaught runtime rendering errors are intercepted by React ErrorBoundary with diagnostic logging and accessible reset paths.                                   | [`ErrorBoundary.tsx`](./src/components/common/ErrorBoundary.tsx)                                         |

---

## 3. Directory Layout & Module Responsibilities

```text
src/
├── components/           # Modular React Presentational Components
│   ├── budget/          # Interconnected budget dashboard & 20% trade-offs
│   ├── common/          # ErrorBoundary, Header, API modal, Toasts
│   ├── documentation/   # In-app architecture evaluator dossier
│   ├── ideas/           # Demographic adaptation & personalized ideas
│   ├── revision/        # Mid-flight plan revision simulator
│   ├── scoping/         # Multi-step intake wizard & archetypes
│   │   └── steps/       # Decomposed Step 1 to Step 4 subcomponents
│   ├── timeline/        # Dependency-aware milestone sequence & cascades
│   └── vendor/          # RFP prompt generator & multi-quote auditor
├── constants/           # Single source of truth for bounds, categories, defaults
│   ├── categories.ts    # Category metadata, icons, and baseline percentages
│   └── eventDefaults.ts # Threshold limits (budget, guests, string bounds)
├── hooks/               # Decoupled custom hooks for state orchestration
│   ├── useEventPlan.ts  # Master plan state, trade-offs, and ripple effects
│   └── useModalState.ts # Modal dialog focus and visibility management
├── services/            # API integration & resilient data engines
│   ├── gemini.ts        # Gemini 2.5 Flash REST client with schema validation
│   └── heuristicGenerator.ts # Deterministic zero-quota offline generation
├── tests/               # 6 comprehensive Vitest automated test suites
│   ├── a11y.test.tsx    # WCAG 2.1 AA keyboard navigation & ARIA semantics
│   ├── calculations.test.ts # Remainder math, cascade dates, overage logic
│   ├── components.test.tsx  # Interactive UI component rendering
│   ├── hooks.test.ts    # Custom hook state immutability & actions
│   ├── security.test.ts # XSS stripping, entity encoding, prototype pollution
│   └── workflows.test.tsx   # 3 Archetypes, stress scenario, ErrorBoundary
├── types/               # Strict TypeScript domain type definitions
│   └── index.ts         # EventProfile, BudgetItem, TimelineTask, etc.
└── utils/               # Pure algorithmic and mathematical utilities
    ├── calculations.ts  # Budget allocations, cascade delay propagation
    ├── currency.ts      # Multi-currency international formatting
    └── security.ts      # Input sanitization, safe JSON parsing, validation
```

---

## 4. Code Quality & Verification Pipeline

EventCraft AI implements an automated zero-warning quality gate:

1. **Strict TypeScript Compilation:** Enforced via `tsc -b` and `tsc --noEmit` with `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, and `noImplicitOverride`.
2. **ESLint 9 Modern Flat Config:** Configured with `typescript-eslint` recommended rules and `eslint-plugin-react-hooks`. Strict exit code 0 (zero errors, zero warnings).
3. **Prettier Standard Formatting:** Enforced via `.prettierrc` (2-space indentation, single quotes, semi, trailing commas) with automated verification via `npm run format:check`.
4. **40+ Automated Vitest Tests:** Complete unit, integration, security, and accessibility coverage running on every GitHub commit via automated GitHub Actions CI/CD.
