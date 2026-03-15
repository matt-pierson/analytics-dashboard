// Matt (500 MAU) hits the default rule and gets 'control'.
// Brad (42k MAU) hits the MAU and plan rules and gets 'heatmap'.
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