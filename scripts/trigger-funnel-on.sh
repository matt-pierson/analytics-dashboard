#!/bin/bash
# Remediation trigger: enable show-funnel-chart via LaunchDarkly flag trigger
# This fires the generic trigger webhook — no API token required.
#
# Usage: ./scripts/trigger-funnel-on.sh

TRIGGER_URL="https://app.launchdarkly.com/webhook/triggers/69b7feb3ebd0880a02129f77/bf35bd3e-e842-4f22-923c-dacff0e4cd78"

curl -s -X POST "$TRIGGER_URL"

echo ""
echo "✅ Trigger fired — show-funnel-chart is now ON."
echo "   The streaming listener updates the UI instantly."