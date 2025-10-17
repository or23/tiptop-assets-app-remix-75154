import { supabase } from '@/integrations/supabase/client';

interface EventQueue {
  user_id: string | null;
  session_id: string;
  event_type: 'page_view' | 'click' | 'form_submit' | 'interaction';
  event_target: string;
  page_url: string;
  metadata: Record<string, any>;
}

class BehaviorTrackingService {
  private queue: EventQueue[] = [];
  private sessionId: string;
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 3000; // 3 seconds

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.startFlushInterval();
    this.setupOfflineHandler();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('tiptop_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('tiptop_session_id', sessionId);
    }
    return sessionId;
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  private setupOfflineHandler() {
    window.addEventListener('online', () => {
      console.log('🌐 Back online, flushing queued events');
      this.flush();
    });

    window.addEventListener('beforeunload', () => {
      if (this.queue.length > 0) {
        this.saveToLocalStorage();
      }
    });

    // Restore events from localStorage on init
    this.restoreFromLocalStorage();
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('tiptop_event_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save events to localStorage:', error);
    }
  }

  private restoreFromLocalStorage() {
    try {
      const savedQueue = localStorage.getItem('tiptop_event_queue');
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
        localStorage.removeItem('tiptop_event_queue');
        this.flush();
      }
    } catch (error) {
      console.error('Failed to restore events from localStorage:', error);
    }
  }

  async trackEvent(
    event_type: EventQueue['event_type'],
    event_target: string,
    metadata: Record<string, any> = {}
  ) {
    const { data: { user } } = await supabase.auth.getUser();

    // Sanitize metadata - remove sensitive info
    const sanitizedMetadata = this.sanitizeMetadata(metadata);

    const event: EventQueue = {
      user_id: user?.id || null,
      session_id: this.sessionId,
      event_type,
      event_target,
      page_url: window.location.pathname,
      metadata: sanitizedMetadata,
    };

    this.queue.push(event);

    // Flush if queue is full
    if (this.queue.length >= this.BATCH_SIZE) {
      await this.flush();
    }
  }

  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized = { ...metadata };
    
    // Remove sensitive fields
    const sensitiveKeys = ['password', 'email', 'phone', 'ssn', 'credit_card'];
    sensitiveKeys.forEach(key => {
      if (key in sanitized) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  async flush() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      const { error } = await supabase
        .from('user_events')
        .insert(eventsToSend);

      if (error) {
        console.error('Failed to send events:', error);
        // Re-add to queue on failure
        this.queue.unshift(...eventsToSend);
      } else {
        console.log(`✅ Sent ${eventsToSend.length} events to database`);
      }
    } catch (error) {
      console.error('Network error while sending events:', error);
      // Re-add to queue on network error
      this.queue.unshift(...eventsToSend);
      this.saveToLocalStorage();
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Singleton instance
export const behaviorTracker = new BehaviorTrackingService();
