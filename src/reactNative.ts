import React, { useEffect, useRef } from 'react';
import { AutoAnalytics } from './autoAnalytics';
import { AutoAnalyticsOptions } from './types';

let autoAnalyticsInstance: AutoAnalytics | null = null;

export const useAutoAnalyticsRN = (options: AutoAnalyticsOptions) => {
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
  useAutoAnalyticsRN(options);
  return React.createElement(React.Fragment, null, children);
};