import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../login/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './CompleteProfile.css';
import ErrorAlert from '../../components/ErrorAlert';
import SuccessAlert from '../../components/SuccessAlert';

const CompleteProfile: React.FC = () => {
  interface UserData {
    displayName: string;
    dateOfBirth: string;
    phoneNumber: string;
    address: string;
  }

  const [userData, setUserData] = useState<UserData>({
    displayName: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: ''
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), userData);
        setSuccessMessage('Profile updated successfully');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  return (
    <div className="complete-profile-page">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="displayName"
          placeholder="Display Name"
          value={userData.displayName || ''}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="dateOfBirth"
          placeholder="Date of Birth"
          value={userData.dateOfBirth || ''}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phoneNumber"
          placeholder="Phone Number"
          value={userData.phoneNumber || ''}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={userData.address || ''}
          onChange={handleChange}
          required
        />
        <button type="submit">Complete Profile</button>
      </form>
      {errorMessage && <ErrorAlert message={errorMessage} onClose={() => setErrorMessage(null)} />}
      {successMessage && <SuccessAlert message={successMessage} onClose={() => setSuccessMessage(null)} />}
    </div>
  );
};

export default CompleteProfile;