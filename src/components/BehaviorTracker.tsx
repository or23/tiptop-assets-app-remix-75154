import { useEffect } from 'react';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';

const BehaviorTracker = () => {
  const { trackClick, trackFormSubmit } = useBehaviorTracking();

  useEffect(() => {
    // Track clicks on elements with data-track-id attribute
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const trackId = target.closest('[data-track-id]')?.getAttribute('data-track-id');
      
      if (trackId) {
        trackClick(trackId, {
          element: target.tagName,
          text: target.textContent?.slice(0, 50),
        });
      }
    };

    // Track form submissions
    const handleFormSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formName = form.getAttribute('name') || form.id || 'unnamed-form';
      
      trackFormSubmit(formName, {
        action: form.action,
        method: form.method,
      });
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('submit', handleFormSubmit, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', handleFormSubmit, true);
    };
  }, [trackClick, trackFormSubmit]);

  return null;
};

export default BehaviorTracker;
