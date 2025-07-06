import { ContextData, EventRule } from './types';

export class ContextAnalyzer {
  private observers: MutationObserver[] = [];
  private eventListeners: Array<{ element: Element; type: string; listener: EventListener }> = [];

  constructor(private onInteraction: (context: ContextData, rule?: EventRule) => void) {}

  start(rules: EventRule[]): void {
    this.setupDOMObserver();
    this.setupEventListeners(rules);
  }

  stop(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
    this.observers = [];
    this.eventListeners = [];
  }

  private setupDOMObserver(): void {
    if (typeof window === 'undefined' || !window.MutationObserver) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.analyzeNewElement(node as Element);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.push(observer);
  }

  private setupEventListeners(rules: EventRule[]): void {
    const eventTypes = ['click', 'submit', 'change', 'focus', 'blur'];
    
    eventTypes.forEach(eventType => {
      const listener = (event: Event) => {
        const target = event.target as Element;
        const matchingRule = this.findMatchingRule(target, eventType, rules);
        const context = this.extractContext(target);
        this.onInteraction(context, matchingRule);
      };

      document.addEventListener(eventType, listener, true);
      this.eventListeners.push({ element: document as any, type: eventType, listener });
    });
  }

  private analyzeNewElement(element: Element): void {
    const context = this.extractContext(element);
    this.onInteraction(context);
  }

  private findMatchingRule(element: Element, eventType: string, rules: EventRule[]): EventRule | undefined {
    return rules.find(rule => {
      if (rule.eventType !== eventType) return false;
      if (rule.selector && !element.matches(rule.selector)) return false;
      if (rule.condition && !rule.condition(element, this.extractContext(element))) return false;
      return true;
    });
  }

  private extractContext(element: Element): ContextData {
    return {
      screen: this.getCurrentScreen(),
      component: this.getComponentName(element),
      userState: this.getUserState(),
      appState: this.getAppState()
    };
  }

  private getCurrentScreen(): string {
    if (typeof window !== 'undefined') {
      return window.location.pathname || 'unknown';
    }
    return 'unknown';
  }

  private getComponentName(element: Element): string {
    return element.tagName.toLowerCase() + 
           (element.id ? `#${element.id}` : '') +
           (element.className ? `.${element.className.split(' ').join('.')}` : '');
  }

  private getUserState(): Record<string, any> {
    return {};
  }

  private getAppState(): Record<string, any> {
    return {};
  }
}