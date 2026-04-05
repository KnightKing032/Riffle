// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const isActive = (path) => location.pathname === path ? styles.active : '';

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>R</span>
          <span className={styles.logoText}>riffle</span>
        </Link>

        <div className={styles.links}>
          <Link to="/" className={`${styles.link} ${isActive('/')}`}>Feed</Link>
          {currentUser && (
            <>
              <Link to="/submit" className={`${styles.link} ${isActive('/submit')}`}>+ Submit</Link>
              <Link to="/dashboard" className={`${styles.link} ${isActive('/dashboard')}`}>Dashboard</Link>
            </>
          )}
        </div>

        <div className={styles.right}>
          {currentUser ? (
            <>
              <div className={styles.points}>
                <span className={styles.pointsIcon}>◆</span>
                <span className={styles.pointsValue}>{userProfile?.points ?? '—'}</span>
              </div>
              <div className={styles.userMenu}>
                <span className={styles.userName}>{userProfile?.nickname || currentUser.email}</span>
                <button className={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
              </div>
            </>
          ) : (
            <Link to="/auth" className={styles.authBtn}>Join Riffle</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
