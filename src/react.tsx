import React, { useEffect, useRef } from 'react';
import { AutoAnalytics } from './autoAnalytics';
import { AutoAnalyticsOptions, AnalyticsEvent } from './types';

let autoAnalyticsInstance: AutoAnalytics | null = null;

export const useAutoAnalytics = (options: AutoAnalyticsOptions) => {
  const optionsRef = useRef(options);
  
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!autoAnalyticsInstance) {
      autoAnalyticsInstance = new AutoAnalytics(optionsRef.current);
      autoAnalyticsInstance.start();
    }

    return () => {
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