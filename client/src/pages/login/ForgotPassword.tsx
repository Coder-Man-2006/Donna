import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './Auth.css';
import LogoBlack from '../../../public/logo/black_logo.png';
import ErrorAlert from '../../components/ErrorAlert';
import SuccessAlert from '../../components/SuccessAlert';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<boolean>(false);
  const [cooldownTime, setCooldownTime] = useState<number>(60); // 60 seconds cooldown

  useEffect(() => {
    const savedCooldownEnd = localStorage.getItem('cooldownEnd');
    if (savedCooldownEnd) {
      const cooldownEnd = new Date(savedCooldownEnd).getTime();
      const now = new Date().getTime();
      if (cooldownEnd > now) {
        setCooldown(true);
        setCooldownTime(Math.ceil((cooldownEnd - now) / 1000));
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown) {
      timer = setInterval(() => {
        setCooldownTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setCooldown(false);
            localStorage.removeItem('cooldownEnd');
            return 60;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendVerification = async () => {
    try {
      if (method === 'email') {
        if (!validateEmail(email)) {
          setErrorMessage('Invalid email address');
          return;
        }
        const userExists = await checkUserExists('email', email);
        if (!userExists) {
          setErrorMessage('User does not exist');
          return;
        }
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage('Verification email sent');
      } else {
        if (!validatePhone(phone)) {
          setErrorMessage('Invalid phone number');
          return;
        }
        const userExists = await checkUserExists('phoneNumber', phone);
        if (!userExists) {
          setErrorMessage('User does not exist');
          return;
        }
        // Implement phone verification logic here
        // For now, we'll just simulate success
        setSuccessMessage('Verification code sent to phone');
      }
      setCooldown(true);
      const cooldownEnd = new Date(new Date().getTime() + 60000); // 1-minute cooldown
      localStorage.setItem('cooldownEnd', cooldownEnd.toISOString());
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  const checkUserExists = async (field: string, value: string) => {
    const q = query(collection(db, 'users'), where(field, '==', value));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^\+1 \d{3}-\d{3}-\d{4}$/;
    return re.test(phone);
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '').slice(0, 15); // Limit to 15 digits
    if (cleaned.length > 10) {
      const country = cleaned.slice(0, cleaned.length - 10);
      const number = cleaned.slice(cleaned.length - 10);
      const match = number.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `+${country} ${match[1]}-${match[2]}-${match[3]}`;
      }
    } else {
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
    }
    return phone;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    setPhone(formattedPhone);
  };

  return (
    <div className="auth-page" id="main-auth-forgot">
      <div className="auth-container">
        <div className="top-section">
          <div className="logo-container">
            <img src={LogoBlack} alt="Logo" className="logo" />
          </div>
          <div className="auth-links">
            <a href="/login">login</a>
            <a href="/signup">signup</a>
          </div>
        </div>
        <h2>Forgot Password</h2>
        <div className="method-selector">
          <label>
            <input
              type="radio"
              value="email"
              checked={method === 'email'}
              onChange={() => setMethod('email')}
            />
            Email
          </label>
          <label>
            <input
              type="radio"
              value="phone"
              checked={method === 'phone'}
              onChange={() => setMethod('phone')}
            />
            Phone
          </label>
        </div>
        {method === 'email' ? (
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        ) : (
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={15} // Set maximum length to 15 digits
            required
          />
        )}
        <button onClick={handleSendVerification} disabled={cooldown}>
          Send Verification Code
        </button>
        <p className="cooldown-message">
          Didn't get the verification message? <a onClick={handleSendVerification}>Resend</a>
          {cooldown && <span> ({cooldownTime}s)</span>}
        </p>
      </div>
      {errorMessage && <ErrorAlert message={errorMessage} onClose={() => setErrorMessage(null)} />}
      {successMessage && <SuccessAlert message={successMessage} onClose={() => setSuccessMessage(null)} />}
    </div>
  );
};

export default ForgotPassword;