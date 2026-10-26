# Security Policy & Hardening Specification — EventCraft AI

## 1. Security Overview

EventCraft AI is engineered with defense-in-depth principles tailored specifically for client-side generative AI applications. Because celebration planning handles sensitive financial allocations, personal guest counts, and API credentials, our architectural security guarantees zero server-side credential leakage, strong browser-level isolation, and deterministic sanitization.

---

## 2. Threat Model & Safeguards

| Threat Vector                  | Mitigation Strategy                  | Implementation Details                                                                                                                                                                                                                                  |
| :----------------------------- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **API Key Theft / Leakage**    | Client-Isolated Storage              | API keys are held strictly in browser `localStorage`/`sessionStorage` and passed exclusively to `https://generativelanguage.googleapis.com` via encrypted HTTPS. No telemetry server or reverse proxy ever receives the key.                            |
| **Cross-Site Scripting (XSS)** | Input Sanitization & Entity Encoding | All user-supplied strings (event titles, vendor names, notes, custom constraints) pass through `sanitizeString()` which strips executable tags (`<script>`, `<iframe>`, `javascript:`, `on*` event handlers) and HTML entity encodes unsafe characters. |
| **Content Injection / CSP**    | Strict HTTP-Equiv CSP Meta Tags      | Enforced via `<meta http-equiv="Content-Security-Policy">` restricting script execution to self, style sheets to trusted CDNs (Google Fonts), and network calls strictly to self and Gemini endpoints.                                                  |
| **Prototype Pollution**        | Safe Object Deserialization          | Custom `safeJSONParse()` strips `__proto__`, `constructor`, and `prototype` keys from untrusted inputs before schema validation.                                                                                                                        |
| **Buffer Overflow / DoS**      | Enforced Field Boundaries            | Numeric constraints restrict budgets (₹5,000 to ₹1,000,000,000), guest counts (1 to 50,000), and string lengths (max 500 chars).                                                                                                                        |
| **Runtime Crash Cascades**     | React Error Boundaries               | Critical component trees are wrapped with `<ErrorBoundary>` to isolate runtime failures and offer state recovery without exposing stack traces to end users.                                                                                            |

---

## 3. Client-Side Cryptographic and Network Safety

### 3.1 Content Security Policy (CSP)

```http
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: https: blob:;
connect-src 'self' https://generativelanguage.googleapis.com;
```

### 3.2 Defensive Headers

- `X-Content-Type-Options: nosniff` — Prevents MIME-type sniffing attacks.
- `Referrer-Policy: strict-origin-when-cross-origin` — Protects internal URI query parameters from leaking when navigating to external documentation.

---

## 4. Supported Versions

| Version         | Supported          | Security Maintenance          |
| :-------------- | :----------------- | :---------------------------- |
| 1.0.x (Current) | :white_check_mark: | Active vulnerability response |

---

## 5. Reporting a Security Vulnerability

If you discover a security vulnerability within EventCraft AI:

1. Open a confidential GitHub Security Advisory on the repository: `https://github.com/asmita-ai/eventcraft-ai/security/advisories`.
2. Provide a clear reproduction script or test payload.
3. Our triage team will acknowledge receipt within **24 hours** and supply a patched release within **72 hours**.
