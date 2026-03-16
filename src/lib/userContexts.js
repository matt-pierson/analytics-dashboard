// Two demo personas for the Demo Console. Attributes are used by LD targeting rules:
// - monthlyActiveUsers > 40,000 → heatmap variant
// - plan = enterprise → heatmap variant + Premium AI Config
// - user-brad-bunce is individually targeted by key
export const users = {
  standard: {
    key: "user-matt-pierson",
    name: "Matt Pierson",
    email: "matt.pierson@gmail.com",
    plan: "free",
    company: "Startup Inc",
    monthlyActiveUsers: 500,
    kind: "user"
  },
  enterprise: {
    key: "user-brad-bunce",
    name: "Brad Bunce",
    email: "bbunce@launchdarkly.com",
    plan: "enterprise",
    company: "LaunchDarkly",
    monthlyActiveUsers: 42000,
    kind: "user"
  }
};