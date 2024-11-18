import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../login/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { FaBars, FaChevronDown } from 'react-icons/fa';
import './Dashboard.css';
import 'boxicons/css/boxicons.min.css';
import WelcomeContent from './WelcomeContent';
import TodoSection from './Todo';

const Dashboard: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('welcome');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {        
        setUserEmail(user.email || '');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const subscriptionPlan = userData.subscriptionPlan || 'free';
          setActivePage(subscriptionPlan === 'free' ? 'welcome' : 'dashboard');
        }
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img 
              src="/logo/black_logo.png" 
              alt="Logo" 
              className={`logo ${isCollapsed ? 'collapsed' : 'expanded'}`}
              onClick={() => setActivePage('welcome')}
            />
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="nav-button-secondary"
          >
            <FaBars />
          </button>
        </div>

        <nav>
          <button 
            onClick={() => setActivePage('todo')}
            className="nav-button"
          >
            <i className='bx bx-task' />
            <span>Todo List</span>
          </button>

          <button 
            onClick={() => setActivePage('email')}
            className="nav-button"
          >
            <i className='bx bx-envelope'></i>
            <span>Email</span>
          </button>

          <button 
            onClick={() => setActivePage('calendar')}
            className="nav-button"
          >
            <i className='bx bx-calendar' />
            <span>Calendar</span>
          </button>

          <button 
            onClick={() => setActivePage('phone')}
            className="nav-button"
          >
            <i className='bx bxs-phone-call' />
            <span>Phone</span>
          </button>

          <button 
            onClick={() => setActivePage('donna-ai')}
            className="nav-button"
          >
            <i className='bx bx-bot' />
            <span>Donna AI</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Page Content */}
        <div className="page-content fade-in">
          {activePage === 'welcome' && <WelcomeContent setActivePage={setActivePage} />}
          {activePage === 'email' && <Email />}
          {activePage === 'calendar' && <Calendar />}
          {activePage === 'phone' && <Phone />}
          {activePage === 'donna-ai' && <DonnaAI />}
          {activePage === 'todo' && <TodoSection setActivePage={setActivePage} />}
        </div>
      </div>
    </div>
  );
};

const Welcome: React.FC = () => (
  <div>
    <h1>Welcome Back!</h1>
    <p>Quick functions and shortcuts go here.</p>
  </div>
);

const Email: React.FC = () => (
  <div>
    <h1>Email Management</h1>
    <p>Manage your emails here.</p>
  </div>
);

const Calendar: React.FC = () => (
  <div>
    <h1>Calendar Tool</h1>
    <p>Manage your calendar here.</p>
  </div>
);

const DonnaAI: React.FC = () => (
  <div>
    <h1>Donna AI</h1>
    <p>Access Donna AI here.</p>
  </div>
);

const Phone: React.FC = () => (
  <div>
    <h1>Phone Management</h1>
    <p>Manage your phone calls here.</p>
  </div>
);

const TodoList: React.FC = () => (
  <div>
    <h1>Todo List</h1>
    <p>Manage your tasks here.</p>
  </div>
);

export default Dashboard;