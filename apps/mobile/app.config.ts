import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Neurodivergent Flow',
  slug: 'neurodivergent-flow',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  scheme: 'neurodivergentflow',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.neurodivergentflow.app',
  },
  android: {
    package: 'com.neurodivergentflow.app',
    adaptiveIcon: {
      backgroundColor: '#0ea5e9',
    },
  },
  plugins: [
    'expo-router',
    [
      'expo-notifications',
      {
        color: '#0ea5e9',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
