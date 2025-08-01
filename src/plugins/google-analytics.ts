/**
 * Google Analytics 4 implementation
 * Tracking ID:
 */
import { IS_PROD } from '@/constants/env';
const trackingId = IS_PROD ? 'G-Y6LDFXS7HJ' : 'G-P01DGL40LM';
export default function initGoogleAnalytics() {
  // Create script element for the gtag.js library
  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  document.head.appendChild(gtagScript);

  // Initialize the dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', trackingId);

  // Add gtag to window for potential future use
  window.gtag = gtag;
}

// Add type definitions for global window object
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
