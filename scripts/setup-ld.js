#!/usr/bin/env node
/**
 * scripts/setup-ld.js
 *
 * Provisions all LaunchDarkly resources for the analytics-dashboard demo.
 * Idempotent: safe to run multiple times — checks before creating.
 *
 * Usage: npm run setup-ld
 * Requires: LD_API_TOKEN and LD_PROJECT_KEY in .env
 */

require('dotenv').config({ path: '.env.local' });

const API_TOKEN   = process.env.LD_API_TOKEN;
const PROJECT_KEY = process.env.LD_PROJECT_KEY;
const ENV_KEY     = 'test';
const BASE        = 'https://app.launchdarkly.com/api/v2';

// ─── Preflight ───────────────────────────────────────────────────────────────

if (!API_TOKEN) {
  console.error('\n❌  LD_API_TOKEN is not set.');
  console.error('   Add it to .env — see .env.example for instructions.\n');
  process.exit(1);
}

if (!PROJECT_KEY) {
  console.error('\n❌  LD_PROJECT_KEY is not set.');
  console.error('   Add it to .env — it\'s visible in your LD dashboard URL.\n');
  process.exit(1);
}

// ─── HTTP helpers ────────────────────────────────────────────────────────────

async function request(method, path, body, extraHeaders = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Authorization': API_TOKEN,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  // 404 → resource does not exist yet (expected during idempotency checks)
  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`${method} ${path}\n  Status: ${res.status}\n  Body: ${text}`);
  }

  return text ? JSON.parse(text) : {};
}

// Semantic patch — LD's instruction-based update format for flags
async function semanticPatch(path, instructions) {
  return request('PATCH', path, instructions, {
    'Content-Type': 'application/json; domain-model=launchdarkly.semanticpatch',
  });
}

// ─── Flag helpers ─────────────────────────────────────────────────────────────

async function getFlag(flagKey) {
  return request('GET', `/flags/${PROJECT_KEY}/${flagKey}`);
}

// ─── Resource provisioning ────────────────────────────────────────────────────

async function setupFunnelFlag() {
  console.log('\n📌  show-funnel-chart (boolean)');
  const existing = await getFlag('show-funnel-chart');

  if (existing) {
    console.log('    ⏭   Already exists — skipping');
    return;
  }

  await request('POST', `/flags/${PROJECT_KEY}`, {
    name: 'Show Funnel Chart',
    key:  'show-funnel-chart',
    variations: [
      { value: true,  name: 'On'  },
      { value: false, name: 'Off' },
    ],
    defaults: {
      onVariation:  0, // On
      offVariation: 1, // Off
    },
    temporary: false,
    clientSideAvailability: {
      usingMobileKey:    false,
      usingEnvironmentId: true,  // required for useFlags()
    },
    tags: ['demo'],
  });

  console.log('    ✅  Created');
  console.log('    ⚠️   Remember to turn this OFF in the Test env before your demo');
}

async function setupHeatmapFlag() {
    console.log('\n📌  retention-heatmap-variant (string)');
    let flag = await getFlag('retention-heatmap-variant');
  
    if (flag) {
      console.log('    ⏭   Already exists — skipping');
      return;
    }
  
    flag = await request('POST', `/flags/${PROJECT_KEY}`, {
      name: 'Retention Heatmap Variant',
      key:  'retention-heatmap-variant',
      variations: [
        { value: 'control',    name: 'Control'    },
        { value: 'heatmap',    name: 'Heatmap'    },
        { value: 'sparklines', name: 'Sparklines' },
      ],
      defaults: {
        onVariation:  0,
        offVariation: 0,
      },
      temporary: false,
      clientSideAvailability: {
        usingMobileKey:     false,
        usingEnvironmentId: true,
      },
      tags: ['demo'],
    });
  
    console.log('    ✅  Created');
  
    const varById = Object.fromEntries(
      flag.variations.map(v => [v.value, v._id])
    );
  
    await semanticPatch(`/flags/${PROJECT_KEY}/retention-heatmap-variant`, {
      environmentKey: ENV_KEY,
      instructions: [
        { kind: 'turnFlagOn' },
        { kind: 'addTargets', variationId: varById['control'],  values: ['user-matt-pierson'] },
        { kind: 'addTargets', variationId: varById['heatmap'],  values: ['user-brad-bunce']   },
        {
          kind: 'addRule',
          clauses: [{ attribute: 'monthlyActiveUsers', op: 'greaterThan', values: [40000], negate: false }],
          variationId: varById['heatmap'],
          description: 'MAU > 40k',
        },
        {
          kind: 'addRule',
          clauses: [{ attribute: 'plan', op: 'in', values: ['enterprise'], negate: false }],
          variationId: varById['heatmap'],
          description: 'Enterprise plan',
        },
      ],
    });
  
    console.log('    ✅  Targeting rules applied');
    console.log('       Individual: user-matt-pierson → control');
    console.log('       Individual: user-brad-bunce → heatmap');
    console.log('       Rule: monthlyActiveUsers > 40000 → heatmap');
    console.log('       Rule: plan is enterprise → heatmap');
  }

async function setupMetric() {
  console.log('\n📊  retention-viewed-detail (custom metric)');

  // Metrics API uses projectKey in path, no separate env scoping
  const existing = await request('GET', `/metrics/${PROJECT_KEY}/retention-viewed-detail`);

  if (existing) {
    console.log('    ⏭   Already exists — skipping');
    return;
  }

  await request('POST', `/metrics/${PROJECT_KEY}`, {
    key:         'retention-viewed-detail',
    name:        'Retention Deep Dive Clicks',
    kind:        'custom',
    eventKey:    'retention-viewed-detail',
    description: 'Tracks cohort row clicks in the Retention panel. Used in the Retention Heatmap vs Table experiment.',
    isNumeric:   false,
    successCriteria: 'HigherThanBaseline',
    tags: ['demo', 'experiment'],
  });

  console.log('    ✅  Created');
}

async function setupAiConfig() {
  console.log('\n🤖  analytics-assistant (AI Config)');

  const existing = await request('GET', `/projects/${PROJECT_KEY}/ai-configs/analytics-assistant`);

  if (existing) {
    console.log('    ⏭   Already exists — skipping');
    console.log('    💡  Verify targeting rule manually: plan = enterprise → Premium');
    return;
  }

  await request('POST', `/projects/${PROJECT_KEY}/ai-configs`, {
    key:  'analytics-assistant',
    name: 'Analytics Assistant',
    type: 'completion',
    variations: [
      {
        key:  'standard',
        name: 'Standard',
        model: {
          name: 'gemini-2.5-flash-lite',
          id:   'gemini-2.5-flash-lite',
        },
        messages: [{
          role:    'system',
          content: 'You are a helpful product analytics assistant. Help users understand their metrics, cohorts, and retention data. Keep answers concise and data-focused.',
        }],
      },
      {
        key:  'premium',
        name: 'Premium',
        model: {
          name: 'gemini-2.5-flash',
          id:   'gemini-2.5-flash',
        },
        messages: [{
          role:    'system',
          content: 'You are an expert enterprise analytics advisor. Provide detailed, strategic analysis of product metrics, retention trends, and growth opportunities. Include actionable recommendations tailored to high-scale products.',
        }],
      },
    ],
    defaultVariation: 'standard',
  });

  console.log('    ✅  Created');
  console.log('    ⚠️   Add targeting rule manually in LD UI:');
  console.log('         plan = enterprise → Premium');
  console.log('         (AI Config targeting rules are not yet in the REST API)');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀  LaunchDarkly Setup — analytics-dashboard');
  console.log(`    Project : ${PROJECT_KEY}`);
  console.log(`    Env     : ${ENV_KEY}`);

  try {
    await setupFunnelFlag();
    await setupHeatmapFlag();
    await setupMetric();
    await setupAiConfig();

    console.log('\n✅  Setup complete.\n');
    console.log('Next steps:');
    console.log('  1. Verify all flags at app.launchdarkly.com');
    console.log('  2. Add AI Config targeting rule: plan = enterprise → Premium (manual)');
    console.log('  3. Create the experiment in the LD UI and start recording');
    console.log('  4. Confirm show-funnel-chart is OFF in Test env before your demo\n');

  } catch (err) {
    console.error('\n❌  Setup failed:\n');
    console.error(err.message);
    console.error('\nCommon causes:');
    console.error('  • LD_API_TOKEN role is not Writer or above');
    console.error('  • LD_PROJECT_KEY does not match your LD project');
    console.error('  • Network issue — try again\n');
    process.exit(1);
  }
}

main();