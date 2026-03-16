#!/bin/bash
# Remediation trigger: disable show-funnel-chart via LaunchDarkly flag trigger
# This fires the generic trigger webhook — no API token required.
#
# Usage: ./scripts/trigger-funnel-off.sh

TRIGGER_URL="https://app.launchdarkly.com/webhook/triggers/69b7fe502ce17d0a0782bbfa/a52a95ac-40c3-4ae8-af3a-7dd21378c80d"

curl -s -X POST "$TRIGGER_URL"

echo ""
echo "✅ Trigger fired — show-funnel-chart is now OFF."
echo "   The streaming listener updates the UI instantly."