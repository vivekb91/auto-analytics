import { AnalyticsEvent, AnalyticsPlatform } from './types';

export class AnalyticsRouter {
  private platforms: AnalyticsPlatform[] = [];
  private eventQueue: AnalyticsEvent[] = [];
  private isProcessing = false;

  addPlatform(platform: AnalyticsPlatform): void {
    this.platforms.push(platform);
  }

  removePlatform(platformName: string): void {
    this.platforms = this.platforms.filter(p => p.name !== platformName);
  }

  async routeEvent(event: AnalyticsEvent): Promise<void> {
    this.eventQueue.push(event);
    
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      await this.sendEventToPlatforms(event);
    }

    this.isProcessing = false;
  }

  private async sendEventToPlatforms(event: AnalyticsEvent): Promise<void> {
    const promises = this.platforms.map(platform => 
      this.sendEventToPlatform(platform, event)
    );

    await Promise.allSettled(promises);
  }

  private async sendEventToPlatform(platform: AnalyticsPlatform, event: AnalyticsEvent): Promise<void> {
    try {
      await platform.track(event);
    } catch (error) {
      console.error(`Failed to send event to ${platform.name}:`, error);
    }
  }
}

export const createFirebasePlatform = (config: any): AnalyticsPlatform => ({
  name: 'firebase',
  initialize: (config) => {
    // Firebase initialization would go here
  },
  track: async (event: AnalyticsEvent) => {
    // Firebase tracking implementation
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, {
        event_category: 'auto_analytics',
        event_label: event.properties.component,
        custom_parameters: event.properties
      });
    }
  }
});

export const createAmplitudePlatform = (apiKey: string): AnalyticsPlatform => ({
  name: 'amplitude',
  initialize: (config) => {
    // Amplitude initialization would go here
  },
  track: async (event: AnalyticsEvent) => {
    // Amplitude tracking implementation
    if (typeof window !== 'undefined' && (window as any).amplitude) {
      (window as any).amplitude.track(event.name, event.properties);
    }
  }
});

export const createCustomPlatform = (
  name: string,
  trackFunction: (event: AnalyticsEvent) => void | Promise<void>
): AnalyticsPlatform => ({
  name,
  initialize: () => {},
  track: trackFunction
});