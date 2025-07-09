import { ContextData, EventRule } from './types';

export class ContextAnalyzerRN {
  private isStarted: boolean = false;
  private rules: EventRule[] = [];
  private sessionId?: string;

  constructor(private onInteraction: (context: ContextData, rule?: EventRule) => void) {}

  start(rules: EventRule[]): void {
    if (this.isStarted) return;
    
    this.rules = rules || [];
    this.isStarted = true;
    
    // In React Native, we rely on manual tracking through the hook
    // Auto-tracking would need to be implemented differently using React Native's touch system
    console.log('ContextAnalyzerRN started with rules:', rules);
  }

  stop(): void {
    if (!this.isStarted) return;
    
    this.isStarted = false;
    this.rules = [];
    console.log('ContextAnalyzerRN stopped');
  }

  /**
   * Analyze context for React Native components
   * Since we don't have DOM access, we provide basic context
   */
  analyzeContext(componentName?: string, eventType?: string): ContextData {
    return {
      screen: this.getCurrentScreen(),
      component: componentName || 'unknown_component',
      userState: this.getUserState(),
      appState: this.getAppState(eventType)
    };
  }

  /**
   * Manual tracking method for React Native interactions
   */
  trackInteraction(componentName: string, eventType: string, properties?: Record<string, any>): void {
    if (!this.isStarted) return;

    const context = this.analyzeContext(componentName, eventType);
    const matchingRule = this.findMatchingRule(componentName, eventType);
    
    // Add properties to context if provided
    if (properties) {
      context.appState = { ...context.appState, ...properties };
    }
    
    this.onInteraction(context, matchingRule);
  }

  private findMatchingRule(componentName: string, eventType: string): EventRule | undefined {
    return this.rules.find(rule => {
      if (rule.eventType !== eventType) return false;
      if (rule.selector && !componentName.includes(rule.selector)) return false;
      if (rule.condition) {
        // For React Native, we pass simplified element info
        const mockElement = { componentName, eventType };
        return rule.condition(mockElement as any, this.analyzeContext(componentName, eventType));
      }
      return true;
    });
  }

  private getCurrentScreen(): string {
    // In React Native, screen detection would typically be done through navigation
    // This could be enhanced to integrate with React Navigation
    return 'unknown_screen';
  }

  private getUserState(): Record<string, any> {
    return {};
  }

  private getAppState(eventType?: string): Record<string, any> {
    return {
      platform: 'react_native',
      eventType: eventType || 'interaction',
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    };
  }

  private getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = `rn_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  /**
   * Create event context specifically for React Native touch events
   */
  createTouchEventContext(eventName: string, componentName: string, properties: Record<string, any> = {}): ContextData {
    const context = this.analyzeContext(componentName, 'touch');
    return {
      ...context,
      appState: {
        ...context.appState,
        eventName,
        properties: {
          ...properties,
          auto_tracked: true,
          platform: 'react_native'
        }
      }
    };
  }
}