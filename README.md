# 📊 Analytics Dashboard with Feature Flags & AI Assistant

Instantly release, remediate, experiment, and control AI behavior with LaunchDarkly-powered feature flags.

---

## ✅ Feature Checklist

| Requirement                                  | Description                                                                                                  | Status |
|-----------------------------------------------|--------------------------------------------------------------------------------------------------------------|--------|
| Part 1: Release & Remediate                  | Toggle `show-funnel-chart` to reveal/hide funnel chart, streaming UI updates, instant rollback (no deploy)   |   ✅   |
| Part 1: Flag Trigger                         | Instant toggle via dashboard; no deployment required                                                         |   ✅   |
| Part 2: Targeting                            | Target Brad by key, MAU users, and by plan                                                                  |   ✅   |
| Extra Credit: Experimentation                | Track `retention-viewed-detail` cohort metric for experimentation                                            |   ✅   |
| Extra Credit: AI Configs                     | Native Analytics Assistant AI Config, swaps Gemini models based on LD flag                                   |   ✅   |

---

## 🛠️ Tech Stack

- Next.js, React, TypeScript
- LaunchDarkly (Client & Server SDKs)
- Gemini AI via Google Vertex API

---

## 📋 Prerequisites

- Node.js ≥ 18
- LaunchDarkly account (Client & Server keys)
- Google Gemini API key

---

## 🚀 Setup

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd analytics-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   - Edit `.env.local`:
     - `NEXT_PUBLIC_LD_CLIENT_KEY` = your LaunchDarkly *client-side* key
     - `LD_SERVER_KEY` = your LaunchDarkly *server* key
     - `GOOGLE_AI_API_KEY` = your Gemini API key

4. **Create Feature Flags**

   | Flag Name                | Type     | Description                                       | Client-side SDK Enabled? |
   |-------------------------|----------|---------------------------------------------------|-------------------------|
   | `show-funnel-chart`     | Boolean  | Show/hide funnel chart for release/remediation     | ✅                      |
   | `retention-heatmap-variant` | String | Targeting for retention heatmap (see rules below)  | ✅                      |

5. **Create Gemini AI Config in LaunchDarkly**
   - In LD dashboard: **Feature Flags → New Flag → AI Config**
   - Name: `Analytics Assistant`
   - Type: **Completion**
   - Add variations:
     - `Standard`: `{ "model": "gemini-2.5-flash-lite" }`
     - `Premium`: `{ "model": "gemini-2.5-flash" }`
   - Set targeting as required (e.g. premium users to "Premium", others "Standard")


---

## ▶️ Run the App

### Dev Mode

```bash
npm run dev
```
App runs at [http://localhost:3000](http://localhost:3000)

---

### 🐳 Docker

**Build:**
```bash
docker build --build-arg NEXT_PUBLIC_LD_CLIENT_KEY=your_ld_client_key -t analytics-dashboard .
```
**Run:**
```bash
docker run \
  -p 3000:3000 \
  -e LD_SERVER_KEY=your_ld_server_sdk_key \
  -e GOOGLE_AI_API_KEY=your_google_gemini_api_key \
  analytics-dashboard
```

---

## 🎯 Feature Flag Targeting: `retention-heatmap-variant`

| Rule                | Description                                  |
|---------------------|----------------------------------------------|
| Brad by Key         | If `user.key` == `brad` -> `"beta-variant"`  |
| MAU Rule            | If `user.isMAU` == true -> `"mau-variant"`   |
| Plan Rule           | If `user.plan` == `"pro"` -> `"pro-variant"` |
| Default             | All others -> `"control"`                    |

---

## 🧑‍💻 Demo Walkthrough

### Part 1: Release & Remediate
- In LaunchDarkly, toggle `show-funnel-chart` **ON** to instantly reveal the funnel chart—appears live, no page reload.
- Toggle **OFF** to instantly roll back—chart disappears, no redeploy needed.

### Part 2: Targeting
- In Demo Console, switch user between `"matt"` and `"brad"` to see targeting and variant changes live.

### Experimentation
- Click on cohort rows in the retention heatmap to fire `retention-viewed-detail` metric events.

### AI Configs
- Edit the "Analytics Assistant" AI Config (`ai-model-config` JSON flag) in LaunchDarkly to swap between `gemini-2.5-flash-lite` (Standard) and `gemini-2.5-flash` (Premium) models. Chatbot instantly reflects config changes.

---

## 💡 Business Value

- **MTTR Reduction:** Replace 30–45 minute redeploys with <5s instant flag toggles for rollback and remediation.
- **Safe Progressive Delivery:** Gradually release features to targeted subgroups rather than all users.
- **Evidence-based Shipping:** Instrument, experiment, and measure with cohort and event data—minimize risk.
- **AI Governance:** Control AI prompt/model selection with Feature Flags, enabling rapid iteration and compliance **without new code deploys**.

---