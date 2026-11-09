/* Zaynyg World: Comics & Games, web-side settings.
   In the Android app, product ids, the privacy-policy URL and every AdMob id come from
   android/monetization.properties (the ONE file to edit) and override the values below.
   This file only matters for the web version and as a fallback. No secrets here. */
window.ZW_CONFIG = {
  appName: 'Zaynyg World: Comics & Games',
  storeUrl: 'https://zsbzba-dy.myshopify.com',
  playUrl: 'https://play.google.com/store/apps/details?id=com.zaynygworld.app',
  // PLACEHOLDER until the page exists (see SETUP.md). Must be a live public URL before Play review.
  privacyUrl: 'https://zsbzba-dy.myshopify.com/pages/app-privacy-policy',
  supportEmail: 'zaynyg9090@gmail.com',
  products: {
    pass: 'zaynyg_pass_monthly',
    comics: { daniel: 'comic_daniel_full' }
  },
  // Shown until Google Play returns the real localized price.
  fallbackPrices: { zaynyg_pass_monthly: '$1.99/month', comic_daniel_full: '$0.99' },
  free: { danielPanels: 8, glitchKidsChapters: 2, apocalypseWaves: 3, northParkMissions: 2 }
};
