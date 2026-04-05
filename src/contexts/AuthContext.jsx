// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, nickname, inviteCode) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: nickname });

    const userData = {
      uid: cred.user.uid,
      email,
      nickname,
      points: 50, // starter points bonus
      videosSubmitted: 0,
      inviteCode: cred.user.uid.slice(0, 8).toUpperCase(),
      invitedBy: inviteCode || null,
      totalWatchTime: 0,
      createdAt: serverTimestamp(),
      // FUTURE: leaderboardScore, monthlyPoints, etc.
    };

    await setDoc(doc(db, 'users', cred.user.uid), userData);

    // If invited by someone, reward referrer
    if (inviteCode) {
      await rewardReferrer(inviteCode, cred.user.uid);
    }

    setUserProfile(userData);
    return cred;
  }

  async function rewardReferrer(inviteCode, newUserId) {
    // Find user by inviteCode field
    const { query, collection, where, getDocs, updateDoc, increment } = await import('firebase/firestore');
    const q = query(collection(db, 'users'), where('inviteCode', '==', inviteCode));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const referrerDoc = snap.docs[0];
      await updateDoc(referrerDoc.ref, { points: referrerDoc.data().points + 100 });
      // Log invite event
      await setDoc(doc(db, 'inviteEvents', `${inviteCode}_${newUserId}`), {
        referrerId: referrerDoc.id,
        newUserId,
        pointsAwarded: 100,
        createdAt: serverTimestamp(),
      });
    }
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  async function refreshProfile() {
    if (currentUser) {
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists()) setUserProfile(snap.data());
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setUserProfile(snap.data());
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = { currentUser, userProfile, signup, login, logout, refreshProfile };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
