const appJson = require("./app.json")

export default {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo?.extra || {}),
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  },
  ios: {
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
}
