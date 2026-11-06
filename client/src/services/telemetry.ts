// Client-side Telemetry for iziCV (Section 6)

export type EventName =
  | 'inscription'
  | 'connexion'
  | 'cv_cree'
  | 'cv_modifie'
  | 'modele_change'
  | 'couleur_change'
  | 'pdf_telecharge'
  | 'pdf_partage'
  | 'pwa_installee'
  | 'erreur_export';

// In-memory throttle tracker for cv_modifie (max 1 every 5 minutes per CV)
const cvModifiedThrottles = new Map<string, number>();
const FIVE_MINUTES_MS = 5 * 60 * 1000;

function detectDevice(): 'android' | 'ios' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  return 'desktop';
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'anonymous_session';
  let sId = sessionStorage.getItem('izicv_telemetry_session_id');
  if (!sId) {
    sId = 's_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    sessionStorage.setItem('izicv_telemetry_session_id', sId);
  }
  return sId;
}

export function trackEvent(
  eventName: EventName,
  properties: Record<string, any> = {},
  userId?: string
): void {
  try {
    // 1. Throttling for cv_modifie (Section 6: limité à un enregistrement toutes les 5 minutes par CV)
    if (eventName === 'cv_modifie') {
      const cvId = properties.cvId || 'default';
      const lastTracked = cvModifiedThrottles.get(cvId) || 0;
      const now = Date.now();
      if (now - lastTracked < FIVE_MINUTES_MS) {
        return; // Throttled
      }
      cvModifiedThrottles.set(cvId, now);
    }

    // 2. Sanitize properties: never send resume content, personal names or sensitive data (Section 6)
    const sanitized: Record<string, any> = {};
    const allowedKeys = [
      'cvId',
      'templateId',
      'themeColor',
      'exportDurationMs',
      'errorCode',
      'errorMessage',
      'method',
      'platform',
    ];
    Object.keys(properties).forEach((k) => {
      if (allowedKeys.includes(k) && typeof properties[k] !== 'object') {
        sanitized[k] = properties[k];
      }
    });

    const payload = {
      event_name: eventName,
      user_id: userId,
      session_id: getSessionId(),
      device_type: detectDevice(),
      properties: sanitized,
    };

    // 3. Fire-and-forget beacon or fetch
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/events', blob);
    } else {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Silently ignore telemetry transmission errors
      });
    }
  } catch {
    // Fail-safe
  }
}

// Global listener for PWA appinstalled event
if (typeof window !== 'undefined') {
  window.addEventListener('appinstalled', () => {
    trackEvent('pwa_installee', { platform: detectDevice() });
  });
}
