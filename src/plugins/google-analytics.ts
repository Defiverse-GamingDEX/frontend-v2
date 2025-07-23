/**
 * Google Analytics 4 implementation
 * Tracking ID: G-Y6LDFXS7HJ
 */

export default function initGoogleAnalytics() {
  // Create script element for the gtag.js library
  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-Y6LDFXS7HJ';
  document.head.appendChild(gtagScript);

  // Initialize the dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', 'G-Y6LDFXS7HJ');

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
