import { AnalyticsEvent, ContextData, EventRule } from './types';

export class EventGenerator {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  generateEvent(context: ContextData, rule?: EventRule): AnalyticsEvent {
    const eventName = rule ? rule.eventName : this.generateStandardEventName(context);
    const properties = this.buildEventProperties(context, rule);

    return {
      name: eventName,
      properties,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    };
  }

  private generateStandardEventName(context: ContextData): string {
    const screen = this.sanitizeName(context.screen);
    const component = this.sanitizeName(context.component);
    
    if (component.includes('button')) {
      return `${screen}_button_clicked`;
    } else if (component.includes('input') || component.includes('textarea')) {
      return `${screen}_input_changed`;
    } else if (component.includes('form')) {
      return `${screen}_form_submitted`;
    } else if (component.includes('link') || component.includes('a')) {
      return `${screen}_link_clicked`;
    } else {
      return `${screen}_element_interacted`;
    }
  }

  private buildEventProperties(context: ContextData, rule?: EventRule): Record<string, any> {
    const baseProperties = {
      screen: context.screen,
      component: context.component,
      timestamp: new Date().toISOString(),
      platform: this.getPlatform()
    };

    const ruleProperties = rule?.properties || {};
    
    return {
      ...baseProperties,
      ...ruleProperties,
      ...this.extractDataAttributes(context),
      ...this.extractFormData(context)
    };
  }

  private sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  private extractDataAttributes(context: ContextData): Record<string, any> {
    return {};
  }

  private extractFormData(context: ContextData): Record<string, any> {
    return {};
  }

  private getPlatform(): string {
    if (typeof navigator !== 'undefined') {
      if (navigator.userAgent.includes('Mobile')) {
        return 'mobile_web';
      }
      return 'web';
    }
    return 'react_native';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}