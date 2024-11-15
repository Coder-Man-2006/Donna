import React, { useState, useEffect } from 'react';
import './Alert.css';

const ErrorAlert: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  const [show, setShow] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 500); // Call onClose after the animation is done
    }, 3000); // Hide after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`alert-wrapper ${show ? 'show' : 'hide'} error-alert`}>
      <p>{message}</p>
      <div className="progress-bar"></div>
    </div>
  );
};

export default ErrorAlert;