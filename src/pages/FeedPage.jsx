// src/pages/FeedPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchFeed } from '../services/videoService';
import VideoCard from '../components/VideoCard';
import AdBanner from '../components/AdBanner';
import { AD_SLOTS } from '../services/adService';
import styles from './FeedPage.module.css';

const AD_FREQUENCY = 4; // Show an ad after every 4 videos

export default function FeedPage() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const vids = await fetchFeed(50);
      setVideos(vids);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  function handlePointsEarned(pts) {
    setToast(`+${pts} points earned!`);
    setTimeout(() => setToast(''), 3000);
  }

  // Build feed items: insert ads after every AD_FREQUENCY videos
  const feedItems = [];
  videos.forEach((video, i) => {
    feedItems.push({ type: 'video', data: video, key: video.id });
    if ((i + 1) % AD_FREQUENCY === 0) {
      feedItems.push({ type: 'ad', key: `ad-${i}`, slot: AD_SLOTS.FEED_INLINE });
    }
  });

  return (
    <div className={styles.page}>
      {/* Top Banner Ad */}
      <div className={styles.topAd}>
        <AdBanner slot={AD_SLOTS.FEED_BANNER_TOP} variant="horizontal" />
      </div>

      <div className={styles.layout}>
        <div className={styles.feed}>
          {/* Hero CTA for non-logged in users */}
          {!currentUser && (
            <div className={styles.hero}>
              <div className={styles.heroBadge}>Beta</div>
              <h1 className={styles.heroTitle}>Watch. Earn. Grow.</h1>
              <p className={styles.heroSub}>
                Riffle is the platform where small creators get real exposure.
                Watch videos, earn points, promote your own content.
              </p>
              <div className={styles.heroActions}>
                <Link to="/auth" className={styles.heroBtn}>Join for free →</Link>
                <span className={styles.heroBonusNote}>+ 50 bonus points on signup</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className={styles.loadingGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`${styles.skeletonCard} skeleton`} />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📼</div>
              <h2>No videos yet</h2>
              <p>Be the first to submit a video to Riffle!</p>
              {currentUser && <Link to="/submit" className={styles.submitCta}>Submit your first video →</Link>}
            </div>
          ) : (
            <div className={styles.grid}>
              {feedItems.map((item) =>
                item.type === 'video' ? (
                  <VideoCard
                    key={item.key}
                    video={item.data}
                    onPointsEarned={handlePointsEarned}
                    onRefreshPoints={refreshProfile}
                  />
                ) : (
                  <div key={item.key} className={styles.adRow}>
                    <AdBanner slot={item.slot} />
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {currentUser ? (
            <div className={styles.sidebarWidget}>
              <p className={styles.widgetLabel}>Your points</p>
              <div className={styles.bigPoints}>
                <span className={styles.bigPointsIcon}>◆</span>
                <span className={styles.bigPointsValue}>{userProfile?.points ?? 0}</span>
              </div>
              <Link to="/dashboard" className={styles.widgetLink}>View dashboard →</Link>
              <Link to="/submit" className={styles.submitBtn}>+ Submit a video</Link>
            </div>
          ) : (
            <div className={styles.sidebarWidget}>
              <p className={styles.widgetLabel}>How it works</p>
              <div className={styles.howList}>
                <div className={styles.howItem}>
                  <span className={styles.howNum}>1</span>
                  <span>Submit your YouTube video</span>
                </div>
                <div className={styles.howItem}>
                  <span className={styles.howNum}>2</span>
                  <span>Watch others' videos to earn points</span>
                </div>
                <div className={styles.howItem}>
                  <span className={styles.howNum}>3</span>
                  <span>Spend points to promote your video</span>
                </div>
              </div>
              <Link to="/auth" className={styles.submitBtn}>Get started →</Link>
            </div>
          )}

          {/* Sidebar Ad */}
          <AdBanner slot={AD_SLOTS.SIDEBAR} variant="horizontal" />

          {/* Future leaderboard teaser */}
          {/* FUTURE: Leaderboard widget showing top 3 creators of the week */}
          <div className={styles.comingSoon}>
            <p className={styles.comingSoonLabel}>Coming soon</p>
            <p className={styles.comingSoonTitle}>🏆 Leaderboard</p>
            <p className={styles.comingSoonText}>
              Weekly top creators will win promotion boosts, Shorts bundles,
              and a monthly cash prize.
            </p>
          </div>
        </aside>
      </div>

      {/* Toast */}
      {toast && (
        <div className={styles.toast}>
          <span>◆</span> {toast}
        </div>
      )}
    </div>
  );
}
