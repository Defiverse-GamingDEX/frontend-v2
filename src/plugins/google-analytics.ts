/**
 * Google Analytics 4 implementation
 * Tracking ID
 */
import { IS_PROD } from '@/constants/env';
const trackingId = IS_PROD ? 'G-Y6LDFXS7HJ' : 'G-SQ3V8W9FS5';
export default function initGoogleAnalytics() {
  const script = document.createElement('script');
  script.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${trackingId}');
  `;
  document.head.appendChild(script);

  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  document.head.appendChild(gtagScript);
}
