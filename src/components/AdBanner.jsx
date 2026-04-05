// src/components/AdBanner.jsx
// Non-intrusive ad placement component
// Ready for Google AdSense or any ad network
// ─────────────────────────────────────────
// TO ADD ADSENSE:
//   1. Add <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"> to index.html
//   2. Replace the placeholder div below with your <ins class="adsbygoogle"> tag
//   3. Remove the placeholder UI (keep the impression tracking)

import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { trackAdImpression, AD_SLOTS } from '../services/adService';
import styles from './AdBanner.module.css';

export default function AdBanner({ slot = AD_SLOTS.FEED_INLINE, variant = 'horizontal' }) {
  const { currentUser } = useAuth();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      trackAdImpression(slot, currentUser?.uid || 'anonymous');
    }
  }, [slot, currentUser]);

  return (
    <div className={`${styles.adBanner} ${styles[variant]}`} aria-label="Advertisement">
      <div className={styles.adLabel}>Ad</div>
      {/* ── PLACEHOLDER: Replace this block with your ad network code ── */}
      <div className={styles.adPlaceholder}>
        <div className={styles.adPlaceholderInner}>
          <div className={styles.adIcon}>📢</div>
          <div>
            <p className={styles.adTitle}>Your Ad Here</p>
            <p className={styles.adSub}>Reach creators on Riffle</p>
          </div>
        </div>
        {/* Google AdSense example (commented out):
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
        */}
      </div>
      {/* ── END PLACEHOLDER ── */}
    </div>
  );
}
