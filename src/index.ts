export { AutoAnalytics } from './autoAnalytics';
export { ContextAnalyzer } from './contextAnalyzer';
export { EventGenerator } from './eventGenerator';
export { AnalyticsRouter, createFirebasePlatform, createAmplitudePlatform, createCustomPlatform } from './analyticsRouter';
export { ConfigManager } from './configManager';

export { useAutoAnalytics, AutoAnalyticsProvider, withAutoAnalytics } from './react';
export { useAutoAnalyticsRN, initAutoAnalyticsRN, getAutoAnalyticsInstanceRN, AutoAnalyticsProviderRN, withAutoTrackingRN } from './reactNative';

export type {
  AnalyticsEvent,
  AnalyticsConfig,
  AnalyticsPlatform,
  EventRule,
  ContextData,
  AutoAnalyticsOptions
} from './types';