import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { behaviorTracker } from '@/services/behaviorTrackingService';

export const useBehaviorTracking = () => {
  const location = useLocation();

  // Track page views automatically
  useEffect(() => {
    const pageTitle = document.title || 'Unknown Page';
    behaviorTracker.trackEvent('page_view', pageTitle, {
      path: location.pathname,
      search: location.search,
    });
  }, [location]);

  const trackClick = useCallback((target: string, metadata?: Record<string, any>) => {
    behaviorTracker.trackEvent('click', target, metadata);
  }, []);

  const trackFormSubmit = useCallback((formName: string, metadata?: Record<string, any>) => {
    behaviorTracker.trackEvent('form_submit', formName, metadata);
  }, []);

  const trackInteraction = useCallback((target: string, metadata?: Record<string, any>) => {
    behaviorTracker.trackEvent('interaction', target, metadata);
  }, []);

  return {
    trackClick,
    trackFormSubmit,
    trackInteraction,
  };
};
