import { ContextAnalyzer } from './contextAnalyzer';
import { EventGenerator } from './eventGenerator';
import { AnalyticsRouter } from './analyticsRouter';
import { ConfigManager } from './configManager';
import { AutoAnalyticsOptions, AnalyticsEvent, ContextData } from './types';

export class AutoAnalytics {
  private contextAnalyzer: ContextAnalyzer;
  private eventGenerator: EventGenerator;
  private analyticsRouter: AnalyticsRouter;
  private configManager: ConfigManager;
  private isStarted = false;

  constructor(options: AutoAnalyticsOptions) {
    this.configManager = new ConfigManager(options.config);
    this.eventGenerator = new EventGenerator();
    this.analyticsRouter = new AnalyticsRouter();
    
    this.contextAnalyzer = new ContextAnalyzer(
      (context: ContextData, rule) => this.handleInteraction(context, rule, options)
    );

    this.initializePlatforms();
  }

  start(): void {
    if (this.isStarted) return;

    const config = this.configManager.getConfig();
    if (!config.enableAutoTracking) return;

    if (!this.configManager.validateConfig()) {
      throw new Error('Invalid configuration');
    }

    this.contextAnalyzer.start(config.rules);
    this.isStarted = true;
  }

  stop(): void {
    if (!this.isStarted) return;

    this.contextAnalyzer.stop();
    this.isStarted = false;
  }

  setUserId(userId: string): void {
    this.eventGenerator.setUserId(userId);
  }

  track(eventName: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionId: this.eventGenerator['sessionId'],
      userId: this.eventGenerator['userId']
    };

    this.analyticsRouter.routeEvent(event);
  }

  private initializePlatforms(): void {
    const platforms = this.configManager.getConfig().platforms;
    platforms.forEach(platform => {
      this.analyticsRouter.addPlatform(platform);
    });
  }

  private async handleInteraction(
    context: ContextData, 
    rule: any, 
    options: AutoAnalyticsOptions
  ): Promise<void> {
    try {
      const event = this.eventGenerator.generateEvent(context, rule);
      
      if (options.onEvent) {
        options.onEvent(event);
      }

      if (this.configManager.getConfig().debugMode) {
        console.log('Auto Analytics Event:', event);
      }

      await this.analyticsRouter.routeEvent(event);
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      } else {
        console.error('Auto Analytics Error:', error);
      }
    }
  }
}