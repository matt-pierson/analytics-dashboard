# 📊 Analytics Dashboard — LaunchDarkly Feature Management Demo

Instantly release, remediate, experiment, and control AI behavior with LaunchDarkly-powered feature flags.

---

## ✅ Feature Checklist

| Requirement | Description | Status |
|---|---|---|
| Part 1: Release & Remediate | Toggle `show-funnel-chart` to reveal/hide funnel chart — streaming UI updates, instant rollback with no deployment | ✅ |
| Part 1: Flag Trigger | Instant toggle via LaunchDarkly dashboard — no deployment required | ✅ |
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
<<<<<<< Updated upstream

### 2. Install dependencies
```bash
npm install
```
=======

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_LD_CLIENT_KEY` | LD dashboard → Test environment → **Client-side ID** |
| `LD_SERVER_KEY` | LD dashboard → Test environment → **SDK key** (starts with `sdk-`) |
| `GOOGLE_AI_API_KEY` | aistudio.google.com → Get API key |

### 4. Create Feature Flags in LaunchDarkly (Test environment)

| Flag Key | Type | Client-side SDK |
|---|---|---|
| `show-funnel-chart` | Boolean | ✅ Must enable |
| `retention-heatmap-variant` | String — variations: `control`, `heatmap`, `sparklines` | ✅ Must enable |

### 5. Create the Analytics Assistant AI Config

1. LD Dashboard → **Create → AI Config → Completion**
2. Name: `Analytics Assistant`
3. Add variation **Standard**: model `gemini-2.5-flash-lite`, system prompt for general analytics assistance
4. Add variation **Premium**: model `gemini-2.5-flash`, system prompt for enterprise-level analysis
5. Set targeting rule: if `plan` is one of `enterprise` → serve **Premium**
6. Default rule → serve **Standard**

### 6. Add targeting rules to `retention-heatmap-variant`

| Rule | Attribute | Condition | Serves |
|---|---|---|---|
| Individual target | `key` | equals `user-brad-bunce` | `heatmap` |
| MAU Rule | `monthlyActiveUsers` | greater than `40000` | `heatmap` |
| Plan Rule | `plan` | is one of `enterprise` | `heatmap` |
| Default | — | all others | `control` |
>>>>>>> Stashed changes

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env`:

<<<<<<< Updated upstream
| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_LD_CLIENT_KEY` | LD dashboard → Test environment → **Client-side ID** |
| `LD_SERVER_KEY` | LD dashboard → Test environment → **SDK key** (starts with `sdk-`) |
| `GOOGLE_AI_API_KEY` | aistudio.google.com → Get API key |

### 4. Create Feature Flags in LaunchDarkly (Test environment)

| Flag Key | Type | Client-side SDK |
|---|---|---|
| `show-funnel-chart` | Boolean | ✅ Must enable |
| `retention-heatmap-variant` | String — variations: `control`, `heatmap`, `sparklines` | ✅ Must enable |

### 5. Create the Analytics Assistant AI Config

1. LD Dashboard → **Create → AI Config → Completion**
2. Name: `Analytics Assistant`
3. Add variation **Standard**: model `gemini-2.5-flash-lite`, system prompt for general analytics assistance
4. Add variation **Premium**: model `gemini-2.5-flash`, system prompt for enterprise-level analysis
5. Set targeting rule: if `plan` is one of `enterprise` → serve **Premium**
6. Default rule → serve **Standard**

### 6. Add targeting rules to `retention-heatmap-variant`

| Rule | Attribute | Condition | Serves |
|---|---|---|---|
| Individual target | `key` | equals `user-brad-bunce` | `heatmap` |
| MAU Rule | `monthlyActiveUsers` | greater than `40000` | `heatmap` |
| Plan Rule | `plan` | is one of `enterprise` | `heatmap` |
| Default | — | all others | `control` |
=======
### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)
>>>>>>> Stashed changes

### Docker

<<<<<<< Updated upstream
## ▶️ Run the App
=======
> ⚠️ `NEXT_PUBLIC_` variables are baked into the JS bundle at **build time**. Pass them as `--build-arg` during `docker build` — not as `-e` at `docker run`.
>>>>>>> Stashed changes

### Development
```bash
<<<<<<< Updated upstream
npm run dev
=======
docker build \
  --build-arg NEXT_PUBLIC_LD_CLIENT_KEY=your_client_side_id \
  -t analytics-dashboard .
```

**Run:**
```bash
docker run -p 3000:3000 \
  -e LD_SERVER_KEY=your_server_sdk_key \
  -e GOOGLE_AI_API_KEY=your_google_ai_key \
  analytics-dashboard
>>>>>>> Stashed changes
```
Open [http://localhost:3000](http://localhost:3000)

<<<<<<< Updated upstream
### Docker

Spin up the entire environment with a single command. Docker Compose will automatically pull your LaunchDarkly and Google AI SDK keys from your `.env` file and pass them securely to the build and runtime environments.

**Build and Run:**
\`\`\`bash
docker compose up --build
\`\`\`

=======
>>>>>>> Stashed changes
Open [http://localhost:3000](http://localhost:3000)

---

## 🧑‍💻 Demo Walkthrough

### Part 1: Release & Remediate
1. Dashboard loads with the Funnel Chart disabled (`show-funnel-chart` is OFF)
2. In LaunchDarkly, toggle `show-funnel-chart` **ON**
3. Chart appears instantly — no page reload (streaming listener fires, timestamp updates)
4. Toggle **OFF** — chart disappears instantly, zero deployment required

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


### Experimentation
1. Open the Experiments tab in LaunchDarkly to view the running **Retention Heatmap vs Table** experiment
2. Click any cohort row in the Retention panel to fire a `retention-viewed-detail` event
3. Metric data accumulates in the experiment results in real time

### AI Configs
1. Chat with the Analytics Assistant — note the **gemini-2.5-flash-lite** model badge (Matt's context)
2. Switch Demo Console to **Brad Bunce**
3. Send another message — badge updates to **gemini-2.5-flash**
4. Model and system prompt changed with zero deployment — controlled entirely by the AI Config targeting rule

---

## 💡 Business Value

- **MTTR Reduction:** Replace 30–45 minute redeploys with instant flag toggles for rollback and remediation
- **Safe Progressive Delivery:** Release features to targeted segments — limit blast radius, protect all other users
- **Evidence-Based Shipping:** Instrument experiments and measure cohort engagement before shipping to everyone
<<<<<<< Updated upstream
- **AI Governance:** Control AI model and prompt selection per user segment without engineering sprints or code deploys
=======
- **AI Governance:** Control AI model and prompt selection per user segment without engineering sprints or code deploys
>>>>>>> Stashed changes
