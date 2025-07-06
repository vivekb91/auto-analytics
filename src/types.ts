export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface AnalyticsConfig {
  platforms: AnalyticsPlatform[];
  rules: EventRule[];
  sessionTimeout: number;
  enableAutoTracking: boolean;
  debugMode: boolean;
}

export interface AnalyticsPlatform {
  name: string;
  initialize: (config: any) => void;
  track: (event: AnalyticsEvent) => void;
}

export interface EventRule {
  selector?: string;
  eventType: string;
  eventName: string;
  properties?: Record<string, any>;
  condition?: (element: Element, context: any) => boolean;
}

export interface ContextData {
  screen: string;
  component: string;
  userState: Record<string, any>;
  appState: Record<string, any>;
}

export interface AutoAnalyticsOptions {
  config: AnalyticsConfig;
  onEvent?: (event: AnalyticsEvent) => void;
  onError?: (error: Error) => void;
}