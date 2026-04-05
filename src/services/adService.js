// src/services/adService.js
// Ad impression tracking — ready for Google AdSense or any ad network
// ─────────────────────────────────────────────────────────────────────────────
// FUTURE AD NETWORK INTEGRATION:
//   1. Google AdSense: Replace AdPlaceholder with <ins class="adsbygoogle"> tags
//      and call (window.adsbygoogle = window.adsbygoogle || []).push({})
//   2. Any network: Replace placeholder divs with their embed scripts
//   3. All impressions are already tracked in Firestore for revenue reporting
// ─────────────────────────────────────────────────────────────────────────────

import { addDoc, collection, serverTimestamp, increment, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const AD_SLOTS = {
  FEED_BANNER_TOP: 'feed_banner_top',
  FEED_INLINE: 'feed_inline',        // Between every 4 videos
  SIDEBAR: 'sidebar',
  // FUTURE: video_pre_roll, dashboard_banner
};

// Track an ad impression
export async function trackAdImpression(slotId, userId = 'anonymous') {
  try {
    await addDoc(collection(db, 'adImpressions'), {
      slotId,
      userId,
      timestamp: serverTimestamp(),
      // FUTURE: adNetworkId, revenue, clickTracked
    });

    // Aggregate daily stats
    const today = new Date().toISOString().split('T')[0];
    const statsRef = doc(db, 'adStats', `${today}_${slotId}`);
    await setDoc(statsRef, {
      date: today,
      slotId,
      impressions: increment(1),
    }, { merge: true });
  } catch (e) {
    // Non-critical — don't break the app for ad tracking failures
    console.warn('Ad impression tracking failed:', e);
  }
}
