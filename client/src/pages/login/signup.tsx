import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, createUserWithEmailAndPassword, signInWithPopup, db } from './firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './Auth.css';
import LogoBlack from '../../../public/logo/black_logo.png';
import { User } from '../../types/User';
import ErrorAlert from '../../components/ErrorAlert';
import SuccessAlert from '../../components/SuccessAlert';

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userData: User = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        dateOfBirth: '',
        phoneNumber: user.phoneNumber || '',
        address: '',
        profilePicture: user.photoURL || '',
      };
      await setDoc(doc(db, 'users', user.uid), userData);
      setSuccessMessage('Signup successful');
      navigate('/complete-profile');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        console.log('User data:', userData);
        if (Object.values(userData).includes('')) {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard');
        }
      } else {
        const userData: User = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          dateOfBirth: '',
          phoneNumber: user.phoneNumber || '',
          address: '',
          profilePicture: user.photoURL || '',
        };
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('User document created');
        navigate('/complete-profile');
      }
      setSuccessMessage('Google signup successful');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="top-section">
          <div className="logo-container">
            <img src={LogoBlack} alt="Logo" className="logo" />
          </div>
          <div className="auth-links">
            <a href="/login">login</a>
            <a href="/signup" className="active">signup</a>
          </div>
        </div>
        <form onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Signup</button>
        </form>
        <div className="divider">or</div>
        <button className="google-login" onClick={handleGoogleSignup}>
          <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" />
          Continue with Google
        </button>
      </div>
      {errorMessage && <ErrorAlert message={errorMessage} onClose={() => setErrorMessage(null)} />}
      {successMessage && <SuccessAlert message={successMessage} onClose={() => setSuccessMessage(null)} />}
    </div>
  );
};

export default Signup;