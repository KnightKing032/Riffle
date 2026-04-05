// src/pages/SubmitPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { submitVideo, extractYouTubeId, getYouTubeThumbnail } from '../services/videoService';
import { POINTS } from '../services/pointsService';
import styles from './SubmitPage.module.css';

export default function SubmitPage() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleUrlChange(e) {
    const val = e.target.value;
    setUrl(val);
    setError('');
    const id = extractYouTubeId(val);
    if (id) {
      setPreview({ id, thumbnail: getYouTubeThumbnail(id) });
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await submitVideo(
        currentUser.uid,
        userProfile?.nickname || 'Anonymous',
        url,
        title,
        description
      );
      setSuccess(true);
      await refreshProfile();
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.successTitle}>Video submitted!</h2>
          <p className={styles.successSub}>
            You earned <strong>+{POINTS.SUBMIT_VIDEO} points</strong> for submitting.
            Redirecting to the feed…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Submit a video</h1>
          <p className={styles.sub}>
            Share your YouTube video with the Riffle community.
            You'll earn <strong className={styles.pts}>+{POINTS.SUBMIT_VIDEO} pts</strong> for submitting.
          </p>
        </div>

        <div className={styles.layout}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>YouTube URL <span className={styles.required}>*</span></label>
              <input
                className={`${styles.input} ${preview ? styles.inputValid : ''}`}
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={handleUrlChange}
                required
              />
              {url && !preview && (
                <p className={styles.hint}>⚠ Please enter a valid YouTube URL</p>
              )}
              {preview && (
                <p className={styles.hintGood}>✓ Valid YouTube video detected</p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Title</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Give your video a catchy title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description <span className={styles.optional}>(optional)</span></label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Tell others what your video is about…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                rows={4}
              />
              <p className={styles.charCount}>{description.length}/300</p>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => navigate('/')}
              >Cancel</button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !preview}
              >
                {loading ? 'Submitting…' : `Submit video (+${POINTS.SUBMIT_VIDEO} pts)`}
              </button>
            </div>
          </form>

          {/* Preview */}
          <div className={styles.previewPanel}>
            <p className={styles.previewLabel}>Preview</p>
            {preview ? (
              <div className={styles.previewCard}>
                <div className={styles.previewThumb}>
                  <img src={preview.thumbnail} alt="Video thumbnail" />
                  <div className={styles.previewPlay}>▶</div>
                </div>
                <div className={styles.previewInfo}>
                  <p className={styles.previewTitle}>{title || 'Your video title'}</p>
                  <p className={styles.previewMeta}>by {userProfile?.nickname || 'You'}</p>
                  {description && <p className={styles.previewDesc}>{description}</p>}
                </div>
              </div>
            ) : (
              <div className={styles.previewEmpty}>
                <div className={styles.previewEmptyIcon}>🎬</div>
                <p>Paste a YouTube URL to see a preview</p>
              </div>
            )}

            {/* How points work */}
            <div className={styles.pointsInfo}>
              <p className={styles.pointsInfoTitle}>How points work</p>
              <div className={styles.pointsList}>
                <div className={styles.pointsRow}>
                  <span>Submit this video</span>
                  <span className={styles.pts}>+{POINTS.SUBMIT_VIDEO}</span>
                </div>
                <div className={styles.pointsRow}>
                  <span>Someone watches 30s+</span>
                  <span className={styles.pts}>they earn +{POINTS.WATCH_VIDEO}</span>
                </div>
                <div className={styles.pointsRow}>
                  <span>Promote your video</span>
                  <span className={styles.ptsCost}>−{POINTS.PROMOTE_COST}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
