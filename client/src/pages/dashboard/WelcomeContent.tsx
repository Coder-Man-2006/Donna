import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../login/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { FaChevronDown } from 'react-icons/fa';
import { FaSearch, FaArrowRight } from 'react-icons/fa';
import './WelcomeContent.css';

const WelcomeContent = ({ setActivePage }) => {
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || '');
  const [query, setQuery] = useState('');
  const [commands, setCommands] = useState([]);
  const [showCommands, setShowCommands] = useState(false);
  const [response, setResponse] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        const userDocRef = doc(db, 'users', uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User Data:", userData); // Log the user data to the console
            setUserEmail(userData.email);
            setDisplayName(userData.displayName);
            localStorage.setItem('userEmail', userData.email);
            localStorage.setItem('displayName', userData.displayName);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('userEmail');
    localStorage.removeItem('displayName');
    setUserEmail('');
    setDisplayName('');
    navigate('/login');
  };

  const handleBilling = () => {
    navigate('/billing');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.startsWith('/')) {
      setShowCommands(true);
      // Filter commands based on the input
      const filteredCommands = commands.filter(command => command.startsWith(value.slice(1)));
      setCommands(filteredCommands);
    } else {
      setShowCommands(false);
    }
  };

  const handleCommandClick = (command: string) => {
    setQuery(command);
    setShowCommands(false);
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    // Send the request to the Gemini API
    try {
      const response = await fetch('https://api.gemini.com/v1/your-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setResponse(data.response);
      setActivePage('donna-ai');
    } catch (error) {
      console.error('Error fetching response:', error);
    }
  };

  return (
    <div className="welcome-main">
      {/* contains the top content, welcome text, email/calendar shortcuts, and search */}
      <div className="welcome-dashboard-section-main">
        {/* contains instructional buttons and logout/billing email dropdown */}
        <div className="welcome-header-dashboard">
          <div className="instructional-buttons">
            <button className="instructional-button">How to use DonnaAI?</button>
            <button className="instructional-button">Give Feedback</button>
          </div>
  
          <div className="dropdown-dashboard-welcome">
            <button className="dropbtn">
              {userEmail} <FaChevronDown className="down-arrow" />
            </button>
            <div className="dropdown-content">
              <a onClick={handleDashboard}>Dashboard</a>
              <a onClick={handleBilling}>Billing</a>
              <a onClick={handleLogout} className="logout">Log Out</a>
            </div>
          </div>
        </div>
  
        {/* contains welcome text and subheading */}
        <div className="welcome-text-dashboard">
          <h1>Welcome back, {displayName}</h1>
          <p>Get started by importing your todo list and create a custom secretary with AI in seconds</p>
        </div>
  
        <div className="welcome-dashboard-shortcuts">
          <WelcomeShortcutButton icon={<i className='bx bx-calendar'></i>} title="Calendar Optimization Suite" description="Craft the perfect schedule based on your mission, values, and todo list" onClick={() => setActivePage('calendar')} />
          <WelcomeShortcutButton icon={<i className='bx bx-envelope'></i>} title="Email Management Suite" description="Save 25 days per year by not looking at your emails, so you can focus on what’s important" onClick={() => setActivePage('email')} />
        </div>
  
        <div className="search">
          <form onSubmit={handleQuerySubmit}>
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Ask Donna AI..."
                className="search-input"
              />
              <button type="submit" className="search-button">
                <FaArrowRight />
              </button>
            </div>
            {showCommands && (
              <div className="commands-list">
                {commands.map((command, index) => (
                  <div key={index} className="command-item" onClick={() => handleCommandClick(command)}>
                    {command}
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
  
      {/* contains priority tasks, mission statement, and personal values */}
      <div className="dashboard-highlights"></div>
    </div>
  );
}

const WelcomeShortcutButton: React.FC<{ icon: React.ReactNode, title: string, description: string, onClick: () => void }> = ({ icon, title, description, onClick }) => {
  return (
    <div className="shortcut-button" onClick={onClick}>
      <div className="icon">
        {icon}
      </div>
      <div className="title">
        {title}
      </div>
      <div className="description">
        {description}
      </div>
    </div>
  );
}

export default WelcomeContent;