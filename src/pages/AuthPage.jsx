// src/pages/AuthPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill invite code from URL ?ref=CODE
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      setInviteCode(ref.toUpperCase());
      setMode('signup');
    }
  }, [location]);

  useEffect(() => {
    if (currentUser) navigate('/');
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!nickname.trim()) throw new Error('Please enter a nickname.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        await signup(email, password, nickname.trim(), inviteCode.trim() || null);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'That email is already registered. Try logging in.'
        : err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password.'
        : err.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>R</div>
          <span className={styles.logoText}>riffle</span>
        </div>

        <h1 className={styles.title}>
          {mode === 'signup' ? 'Join the community' : 'Welcome back'}
        </h1>
        <p className={styles.sub}>
          {mode === 'signup'
            ? 'Create your account and get 50 free points to start.'
            : 'Sign in to your Riffle account.'}
        </p>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'signup' ? styles.activeTab : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >Sign up</button>
          <button
            className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >Log in</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signup' && (
            <div className={styles.field}>
              <label className={styles.label}>Nickname</label>
              <input
                className={styles.input}
                type="text"
                placeholder="YourCreatorName"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                maxLength={32}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === 'signup' && (
            <div className={styles.field}>
              <label className={styles.label}>
                Invite code <span className={styles.optional}>(optional — earns your referrer 100 pts)</span>
              </label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. A1B2C3D4"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading
              ? 'Please wait…'
              : mode === 'signup' ? 'Create account →' : 'Sign in →'}
          </button>
        </form>

        {mode === 'signup' && (
          <p className={styles.bonus}>
            🎁 You'll receive <strong>50 bonus points</strong> just for joining
          </p>
        )}
      </div>
    </div>
  );
}
