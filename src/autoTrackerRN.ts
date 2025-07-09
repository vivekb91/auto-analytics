import React from 'react';
import { AutoAnalytics } from './autoAnalytics';

// Store original React Native components
const originalComponents: { [key: string]: any } = {};

export class AutoTrackerRN {
  private analytics: AutoAnalytics;
  private isInitialized = false;

  constructor(analytics: AutoAnalytics) {
    this.analytics = analytics;
  }

  initialize() {
    if (this.isInitialized) return;
    
    this.interceptReactNativeComponents();
    this.isInitialized = true;
  }

  private interceptReactNativeComponents() {
    // Try to get React Native components
    try {
      const ReactNative = require('react-native');
      
      // List of touchable components to intercept
      const touchableComponents = [
        'TouchableOpacity',
        'TouchableHighlight', 
        'TouchableWithoutFeedback',
        'Pressable',
        'Button'
      ];

      touchableComponents.forEach(componentName => {
        if (ReactNative[componentName]) {
          // Store original component
          originalComponents[componentName] = ReactNative[componentName];
          
          // Create wrapped version
          ReactNative[componentName] = this.createAutoTrackedComponent(
            originalComponents[componentName],
            componentName
          );
        }
      });
    } catch (error) {
      console.warn('Could not intercept React Native components:', error);
    }
  }

  private createAutoTrackedComponent(OriginalComponent: any, componentName: string) {
    const analytics = this.analytics;
    
    return React.forwardRef((props: any, ref: any) => {
      // Extract context from props
      const context = this.extractContext(props, componentName);
      
      // Wrap the onPress handler
      const wrappedOnPress = (...args: any[]) => {
        // Track the interaction automatically
        analytics.trackRNInteraction(componentName, 'press', {
          ...context,
          component_type: componentName,
          timestamp: Date.now()
        });
        
        // Call original onPress if it exists
        if (props.onPress) {
          return props.onPress(...args);
        }
      };

      // Return original component with wrapped onPress
      return React.createElement(OriginalComponent, {
        ...props,
        onPress: wrappedOnPress,
        ref
      });
    });
  }

  private extractContext(props: any, componentName: string): Record<string, any> {
    const context: Record<string, any> = {
      component_name: componentName,
      component_type: componentName
    };

    // Extract useful props for context
    if (props.testID) {
      context.test_id = props.testID;
    }
    
    if (props.accessibilityLabel) {
      context.accessibility_label = props.accessibilityLabel;
    }
    
    if (props.accessibilityHint) {
      context.accessibility_hint = props.accessibilityHint;
    }

    // Try to extract text content from children
    const textContent = this.extractTextFromChildren(props.children);
    if (textContent) {
      context.text_content = textContent;
      context.button_text = textContent;
    }

    // Generate a meaningful event name
    context.event_name = this.generateEventName(context);

    return context;
  }

  private extractTextFromChildren(children: any): string {
    if (!children) return '';
    
    if (typeof children === 'string') {
      return children;
    }
    
    if (Array.isArray(children)) {
      return children.map(child => this.extractTextFromChildren(child)).join(' ');
    }
    
    if (React.isValidElement(children)) {
      // If it's a Text component, try to extract props.children
      if (children.type && typeof children.type === 'function' && (children.type as any).displayName === 'Text') {
        return this.extractTextFromChildren((children.props as any).children);
      }
      
      // For other components, recursively check children
      return this.extractTextFromChildren((children.props as any)?.children);
    }
    
    return '';
  }

  private generateEventName(context: Record<string, any>): string {
    // Generate meaningful event names based on context
    const parts = [];
    
    if (context.test_id) {
      parts.push(context.test_id);
    } else if (context.button_text) {
      // Convert button text to snake_case
      const cleanText = context.button_text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 30);
      parts.push(cleanText);
    } else if (context.accessibility_label) {
      const cleanLabel = context.accessibility_label
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 30);
      parts.push(cleanLabel);
    } else {
      parts.push('unknown');
    }
    
    parts.push('button_pressed');
    
    return parts.join('_');
  }

  cleanup() {
    if (!this.isInitialized) return;
    
    // Restore original components
    try {
      const ReactNative = require('react-native');
      Object.keys(originalComponents).forEach(componentName => {
        ReactNative[componentName] = originalComponents[componentName];
      });
    } catch (error) {
      console.warn('Could not restore original React Native components:', error);
    }
    
    this.isInitialized = false;
  }
}