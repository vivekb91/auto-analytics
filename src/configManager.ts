import { AnalyticsConfig, EventRule, AnalyticsPlatform } from './types';

export class ConfigManager {
  private config: AnalyticsConfig;
  private defaultConfig: AnalyticsConfig = {
    platforms: [],
    rules: this.getDefaultRules(),
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    enableAutoTracking: true,
    debugMode: false
  };

  constructor(initialConfig?: Partial<AnalyticsConfig>) {
    this.config = { ...this.defaultConfig, ...initialConfig };
  }

  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  addRule(rule: EventRule): void {
    this.config.rules.push(rule);
  }

  removeRule(eventName: string): void {
    this.config.rules = this.config.rules.filter(rule => rule.eventName !== eventName);
  }

  addPlatform(platform: AnalyticsPlatform): void {
    this.config.platforms.push(platform);
  }

  removePlatform(platformName: string): void {
    this.config.platforms = this.config.platforms.filter(p => p.name !== platformName);
  }

  private getDefaultRules(): EventRule[] {
    return [
      {
        selector: 'button',
        eventType: 'click',
        eventName: 'button_clicked',
        properties: { element_type: 'button' }
      },
      {
        selector: 'a',
        eventType: 'click',
        eventName: 'link_clicked',
        properties: { element_type: 'link' }
      },
      {
        selector: 'form',
        eventType: 'submit',
        eventName: 'form_submitted',
        properties: { element_type: 'form' }
      },
      {
        selector: 'input[type="text"], input[type="email"], textarea',
        eventType: 'change',
        eventName: 'input_changed',
        properties: { element_type: 'input' }
      },
      {
        selector: 'select',
        eventType: 'change',
        eventName: 'dropdown_changed',
        properties: { element_type: 'select' }
      },
      {
        selector: 'input[type="checkbox"], input[type="radio"]',
        eventType: 'change',
        eventName: 'option_selected',
        properties: { element_type: 'option' }
      }
    ];
  }

  validateConfig(): boolean {
    if (!this.config.platforms || this.config.platforms.length === 0) {
      console.warn('No analytics platforms configured');
      return false;
    }

    if (!this.config.rules || this.config.rules.length === 0) {
      console.warn('No event rules configured');
      return false;
    }

    return true;
  }
}