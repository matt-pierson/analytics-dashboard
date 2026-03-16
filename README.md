# 📊 Analytics Dashboard — LaunchDarkly Feature Management Demo

Instantly release, remediate, experiment, and control AI behavior with LaunchDarkly-powered feature flags.

---

## ✅ Feature Checklist

| Requirement | Description | Status |
|---|---|---|
| Part 1: Release & Remediate | Toggle `show-funnel-chart` to reveal/hide funnel chart — streaming UI updates, instant rollback with no deployment | ✅ |
| Part 1: Flag Trigger | Generic trigger webhook fires curl to disable flag instantly — no deployment, no dashboard required | ✅ |
| Part 2: Targeting | Brad targeted by user key, MAU threshold, and plan attribute | ✅ |
| Extra Credit: Experimentation | `retention-viewed-detail` click metric tracks cohort engagement across control/heatmap variants | ✅ |
| Extra Credit: AI Configs | Native Analytics Assistant AI Config swaps Gemini models per user context with no code deploy | ✅ |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14, React, JavaScript
- **Feature Flags:** LaunchDarkly React Client SDK, Node Server SDK, AI SDK
- **AI:** Google Gemini via `@google/generative-ai` (free tier)
- **Charts:** Recharts
- **Demo Polish:** react-hot-toast — surfaces flag evaluations and context switches as real-time toast notifications
- **AI Development Governance:** `.cursorrules` + `.cursor/rules/launchdarkly.mdc` — architectural guardrails baked into Cursor AI so every generated component respects LaunchDarkly SDK boundaries, the hydration-safe provider pattern, and environment variable rules automatically
- **Event Delivery:** Custom metric events are delivered via direct POST to the LaunchDarkly Events API due to a known incompatibility between the React Client SDK's internal event processor and Next.js 16 + Turbopack in development. Flag evaluations and streaming work normally.
---

## 📋 Prerequisites

- Node.js ≥ 18 OR Docker
- LaunchDarkly account (client-side ID + server SDK key)
- Google AI Studio API key (free — aistudio.google.com)

---

## 🚀 Setup

### 1. Clone the repo
```bash
git clone https://github.com/matt-pierson/analytics-dashboard.git
cd analytics-dashboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env.local
```

Edit `.env`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_LD_CLIENT_KEY` | LD dashboard → Test environment → **Client-side ID** |
| `LD_SERVER_KEY` | LD dashboard → Test environment → **SDK key** (starts with `sdk-`) |
| `GOOGLE_AI_API_KEY` | aistudio.google.com → Get API key |
| `LD_API_TOKEN` | LD dashboard → Account Settings → Authorization → Personal tokens (Writer role) | 
| 'LD_PROJECT_KEY` | Your LD project key — visible in the dashboard URL |

### 4. Provision LaunchDarkly resources
Add `LD_API_TOKEN` (Writer role) and `LD_PROJECT_KEY` to your `.env`, then:
```bash
npm run setup-ld
```
This creates both feature flags with targeting rules, the custom metric, and the AI Config.  
**One manual step:** in the LD dashboard → **AI Configs → Analytics Assistant**, add a rule: if `plan` is one of `enterprise` → serve **Premium**.

### 5. Create the experiment

In the LD dashboard → **Experiments** → **Create experiment**:
- Name: `Retention Heatmap vs Table`
- Flag: `retention-heatmap-variant` — 50% `control` / 50% `heatmap`
- Metric: `retention-viewed-detail`
- Click **Start recording**

---

## ▶️ Run the App

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Docker

Spin up the entire environment with a single command. Docker Compose automatically pulls your keys from `.env` and passes them securely to the build and runtime environments.

```bash
cp .env.example .env   # fill in your three keys
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000)

> Note: `NEXT_PUBLIC_LD_CLIENT_KEY` is baked into the JS bundle at build time via the
> `docker-compose.yml` build args. `LD_SERVER_KEY` and `GOOGLE_AI_API_KEY` are injected
> at runtime. This is handled automatically — no manual `--build-arg` flags needed.

---

## 🧑‍💻 Demo Walkthrough

### Part 1: Release & Remediate
1. Dashboard loads with the Funnel Chart disabled (`show-funnel-chart` is OFF)
2. In LaunchDarkly, toggle `show-funnel-chart` **ON**
3. Chart appears instantly — no page reload (streaming listener fires, toast confirms the update with a timestamp)
4. Toggle **OFF** — chart disappears instantly, toast confirms the rollback — zero deployment required

### Flag Trigger (Remediation)
1. A generic trigger is configured on `show-funnel-chart` with a unique webhook URL
2. Run `curl -X POST "TRIGGER_URL"` — the flag turns OFF instantly, no dashboard or deployment required
3. The streaming listener fires and the chart disappears within seconds
4. A second trigger URL re-enables the flag the same way
5. In production, these URLs wire directly to PagerDuty or Datadog — when error rates spike, the feature is disabled automatically before a human opens a laptop

### Part 2: Targeting
1. Demo Console (bottom-right) shows **Matt Pierson** active — table view, `control` variant
2. An initial toast confirms the starting context and flag evaluation on page load
3. Click **Brad Bunce** in the Demo Console
4. `ldClient.identify()` sends Brad's context: 42,000 MAU, enterprise plan
5. Retention heatmap switches to visual heatmap variant instantly — toast confirms `retention-heatmap-variant → heatmap`
6. Click **Matt Pierson** — returns to table view, toast confirms `retention-heatmap-variant → control`

### Experimentation
1. Open the Experiments tab in LaunchDarkly — view the running **Retention Heatmap vs Table** experiment
2. Click any cohort row in the Retention panel to fire a `retention-viewed-detail` event
3. Metric data accumulates in the experiment results in real time

### AI Configs
1. Chat with the Analytics Assistant — note the **gemini-2.5-flash-lite** model badge (Matt's context) and the toast confirming the model served
2. Switch Demo Console to **Brad Bunce**
3. Send another message — badge and toast both update to **gemini-2.5-flash**
4. Model and system prompt changed with zero deployment — controlled entirely by the AI Config targeting rule

---

## 💡 Business Value

- **MTTR Reduction:** Replace 30–45 minute redeploys with instant flag toggles for rollback and remediation
- **Safe Progressive Delivery:** Release features to targeted segments — limit blast radius, protect all other users
- **Evidence-Based Shipping:** Instrument experiments and measure cohort engagement before shipping to everyone
- **AI Governance:** Control AI model and prompt selection per user segment without engineering sprints or code deploys
- **AI Development Governance:** `.cursorrules` and `.cursor/rules/` encode architectural standards directly into the IDE — every AI-generated component respects the LaunchDarkly SDK boundaries, hydration-safe provider pattern, and environment variable rules automatically
