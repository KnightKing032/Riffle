// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserVideos } from '../services/videoService';
import { promoteVideo, POINTS } from '../services/pointsService';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [copied, setCopied] = useState(false);
  const [promotingId, setPromotingId] = useState(null);
  const [promoteError, setPromoteError] = useState('');
  const [toast, setToast] = useState('');

  const inviteCode = userProfile?.inviteCode;
  const inviteUrl = inviteCode
    ? `${window.location.origin}/auth?ref=${inviteCode}`
    : '';

  useEffect(() => {
    if (currentUser) {
      fetchUserVideos(currentUser.uid)
        .then(setVideos)
        .finally(() => setLoadingVideos(false));
    }
  }, [currentUser]);

  function copyInvite() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  async function handlePromote(videoId) {
    setPromoteError('');
    setPromotingId(videoId);
    try {
      await promoteVideo(currentUser.uid, videoId, userProfile?.points || 0);
      await refreshProfile();
      showToast(`⚡ Video promoted for 24 hours!`);
    } catch (e) {
      setPromoteError(e.message);
    } finally {
      setPromotingId(null);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const pts = userProfile?.points ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.sub}>Welcome back, <strong>{userProfile?.nickname}</strong></p>
          </div>
          <Link to="/submit" className={styles.submitBtn}>+ Submit video</Link>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Your points</p>
            <div className={styles.statValue}>
              <span className={styles.statIcon}>◆</span>
              <span className={styles.statNum}>{pts}</span>
            </div>
            <p className={styles.statHint}>Watch videos to earn more</p>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>Videos submitted</p>
            <div className={styles.statValue}>
              <span className={styles.statNum}>{userProfile?.videosSubmitted ?? 0}</span>
            </div>
            <p className={styles.statHint}>Each submission earns {POINTS.SUBMIT_VIDEO} pts</p>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>Videos watched</p>
            <div className={styles.statValue}>
              <span className={styles.statNum}>{userProfile?.totalWatchTime ?? 0}</span>
            </div>
            <p className={styles.statHint}>{POINTS.WATCH_VIDEO} pts earned per watch</p>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>Promote cost</p>
            <div className={styles.statValue}>
              <span className={styles.statNum}>{POINTS.PROMOTE_COST}</span>
              <span className={styles.statUnit}>pts</span>
            </div>
            <p className={styles.statHint}>24h top-of-feed boost</p>
          </div>
        </div>

        {/* Invite Section */}
        <div className={styles.inviteSection}>
          <div className={styles.inviteHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Invite friends</h2>
              <p className={styles.inviteSub}>
                Share your invite link. You earn{' '}
                <strong className={styles.accent}>{POINTS.INVITE_BONUS} points</strong>{' '}
                every time someone joins with it.
              </p>
            </div>
            <div className={styles.inviteBadge}>+{POINTS.INVITE_BONUS} pts / referral</div>
          </div>

          <div className={styles.inviteLinkRow}>
            <div className={styles.inviteLinkBox}>
              <span className={styles.inviteLinkText}>{inviteUrl || 'Loading…'}</span>
            </div>
            <button className={styles.copyBtn} onClick={copyInvite} disabled={!inviteUrl}>
              {copied ? '✓ Copied!' : 'Copy link'}
            </button>
          </div>

          <p className={styles.inviteCode}>
            Your invite code: <strong className={styles.accent}>{inviteCode || '—'}</strong>
          </p>
        </div>

        {/* My Videos */}
        <div className={styles.videosSection}>
          <div className={styles.videosSectionHeader}>
            <h2 className={styles.sectionTitle}>My videos</h2>
            <span className={styles.videoCount}>{videos.length} submitted</span>
          </div>

          {promoteError && (
            <div className={styles.errorBanner}>{promoteError}</div>
          )}

          {loadingVideos ? (
            <div className={styles.videoList}>
              {[1,2,3].map(i => (
                <div key={i} className={`${styles.videoRowSkeleton} skeleton`} />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className={styles.emptyVideos}>
              <p>You haven't submitted any videos yet.</p>
              <Link to="/submit" className={styles.submitLink}>Submit your first video →</Link>
            </div>
          ) : (
            <div className={styles.videoList}>
              {videos.map(video => {
                const isPromoted = video.promoted && video.promotedUntil?.toDate?.() > new Date();
                return (
                  <div key={video.id} className={styles.videoRow}>
                    <div className={styles.videoThumb}>
                      <img src={video.thumbnail} alt={video.title} loading="lazy" />
                    </div>
                    <div className={styles.videoInfo}>
                      <p className={styles.videoTitle}>{video.title}</p>
                      <p className={styles.videoMeta}>
                        {video.views} view{video.views !== 1 ? 's' : ''}
                        {isPromoted && (
                          <span className={styles.promotedTag}>⚡ Active promotion</span>
                        )}
                      </p>
                    </div>
                    <div className={styles.videoActions}>
                      <button
                        className={styles.promoteBtn}
                        onClick={() => handlePromote(video.id)}
                        disabled={promotingId === video.id || pts < POINTS.PROMOTE_COST}
                        title={pts < POINTS.PROMOTE_COST ? `Need ${POINTS.PROMOTE_COST} points` : ''}
                      >
                        {promotingId === video.id ? 'Promoting…' : `⚡ Promote (${POINTS.PROMOTE_COST}pts)`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Future Leaderboard Note */}
        {/*
          FUTURE: Leaderboard section
          - Add a weekly/monthly leaderboard below this line
          - Track `monthlyPoints` and `weeklyPoints` fields on user document
          - Top 3 creators per week get automatic 72h promotion boosts
          - "Shorts Bundle" prize for weekly #1
          - "Creator of the Month" cash prize for monthly #1
          - Schema additions needed:
            - users: { weeklyPoints, monthlyPoints, leaderboardOptIn }
            - leaderboardSnapshots: { week, month, rankings[] }
        */}
        <div className={styles.leaderboardTeaser}>
          <div className={styles.teaserInner}>
            <span className={styles.teaserIcon}>🏆</span>
            <div>
              <p className={styles.teaserTitle}>Leaderboard — Coming Soon</p>
              <p className={styles.teaserText}>
                Weekly top creators will earn promotion boosts, Shorts bundles,
                and a monthly cash prize. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
