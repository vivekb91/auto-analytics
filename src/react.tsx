import React, { useEffect, useRef } from 'react';
import { AutoAnalytics } from './autoAnalytics';
import { AutoAnalyticsOptions, AnalyticsEvent } from './types';
import { AutoTrackerRN } from './autoTrackerRN';

let autoAnalyticsInstance: AutoAnalytics | null = null;
let autoTrackerInstance: AutoTrackerRN | null = null;

export const useAutoAnalytics = (options: AutoAnalyticsOptions) => {
  const optionsRef = useRef(options);
  
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!autoAnalyticsInstance) {
      autoAnalyticsInstance = new AutoAnalytics(optionsRef.current);
      autoAnalyticsInstance.start();
      
      // If we're in React Native, also initialize the auto-tracker
      if (autoAnalyticsInstance['isReactNative'] && !autoTrackerInstance) {
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
    setUserId: (userId: string) => {
      if (autoAnalyticsInstance) {
        autoAnalyticsInstance.setUserId(userId);
      }
    }
  };
};

export const AutoAnalyticsProvider: React.FC<{
  children: React.ReactNode;
  options: AutoAnalyticsOptions;
}> = ({ children, options }) => {
  useAutoAnalytics(options);
  return <>{children}</>;
};

export const withAutoAnalytics = <P extends object>(
  Component: React.ComponentType<P>,
  options: AutoAnalyticsOptions
) => {
  return (props: P) => {
    return React.createElement(
      AutoAnalyticsProvider,
      { options, children: React.createElement(Component, props) }
    );
  };
};