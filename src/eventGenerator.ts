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
    
    // Extract element text/label for better event naming
    const elementText = context.appState?.elementText || context.appState?.label || '';
    const buttonLabel = this.sanitizeName(elementText);
    
    if (component.includes('button') || context.appState?.elementType === 'button') {
      return buttonLabel ? `${screen}_${buttonLabel}_click` : `${screen}_button_click`;
    } else if (component.includes('input') || component.includes('textarea')) {
      return buttonLabel ? `${screen}_${buttonLabel}_input` : `${screen}_input_focus`;
    } else if (component.includes('form')) {
      return `${screen}_form_submit`;
    } else if (component.includes('link') || component.includes('a')) {
      return buttonLabel ? `${screen}_${buttonLabel}_link` : `${screen}_link_click`;
    } else {
      return buttonLabel ? `${screen}_${buttonLabel}_click` : `${screen}_element_click`;
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