import React, { useEffect, useRef } from 'react';
import { AutoAnalytics } from './autoAnalytics';
import { AutoAnalyticsOptions } from './types';
import { AutoTrackerRN } from './autoTrackerRN';

let autoAnalyticsInstance: AutoAnalytics | null = null;
let autoTrackerInstance: AutoTrackerRN | null = null;

export const useAutoAnalyticsRN = (options: AutoAnalyticsOptions) => {
  const optionsRef = useRef(options);
  
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!autoAnalyticsInstance) {
      autoAnalyticsInstance = new AutoAnalytics(optionsRef.current);
      autoAnalyticsInstance.start();
      
      // Initialize automatic tracking for React Native components
      if (!autoTrackerInstance) {
        autoTrackerInstance = new AutoTrackerRN(autoAnalyticsInstance);
        autoTrackerInstance.initialize();
      }
    }

    return () => {
      if (autoTrackerInstance) {
        autoTrackerInstance.cleanup();
        autoTrackerInstance = null;
      }
      if (autoAnalyticsInstance) {
        autoAnalyticsInstance.stop();
        autoAnalyticsInstance = null;
      }
    };
  }, []);

  return {
    track: (eventName: string, properties?: Record<string, any>) => {
      if (autoAnalyticsInstance) {
        autoAnalyticsInstance.track(eventName, properties);
      }
    },
    trackInteraction: (componentName: string, eventType: string, properties?: Record<string, any>) => {
      if (autoAnalyticsInstance) {
        autoAnalyticsInstance.trackRNInteraction(componentName, eventType, properties);
      }
    },
    setUserId: (userId: string) => {
      if (autoAnalyticsInstance) {
        autoAnalyticsInstance.setUserId(userId);
      }
    }
  };
};

export const initAutoAnalyticsRN = (options: AutoAnalyticsOptions) => {
  if (!autoAnalyticsInstance) {
    autoAnalyticsInstance = new AutoAnalytics(options);
    autoAnalyticsInstance.start();
  }
  return autoAnalyticsInstance;
};

export const getAutoAnalyticsInstanceRN = () => {
  return autoAnalyticsInstance;
};

export const AutoAnalyticsProviderRN: React.FC<{
  children: React.ReactNode;
  options: AutoAnalyticsOptions;
}> = ({ children, options }) => {
  const analytics = useAutoAnalyticsRN(options);
  
  // Create a context with the analytics instance
  const AnalyticsContext = React.createContext(analytics);
  
  return React.createElement(AnalyticsContext.Provider, { value: analytics }, children);
};

// Hook to use analytics within the provider
export const useAnalyticsContext = () => {
  const context = React.useContext(React.createContext(null));
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AutoAnalyticsProviderRN');
  }
  return context;
};

// Higher-order component to automatically track TouchableOpacity presses
export const withAutoTrackingRN = (Component: any, eventName?: string) => {
  return React.forwardRef((props: any, ref) => {
    const analytics = useAutoAnalyticsRN({
      config: {
        platforms: [],
        rules: [],
        sessionTimeout: 30 * 60 * 1000,
        enableAutoTracking: true,
        debugMode: true
      }
    });

    const handlePress = (...args: any[]) => {
      // Track the interaction
      analytics.trackInteraction(
        Component.displayName || Component.name || 'TouchableComponent',
        'press',
        { eventName: eventName || 'component_pressed' }
      );
      
      // Call original onPress if it exists
      if (props.onPress) {
        props.onPress(...args);
      }
    };

    return React.createElement(Component, {
      ...props,
      onPress: handlePress,
      ref
    });
  });
};