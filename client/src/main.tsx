import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App';
import Affiliate from './pages/affiliate/affiliate';
import About from './pages/about/about';
import Contact from './pages/contact/contact';
import Pricing from './pages/pricing/pricing';
import Login from './pages/login/login';
import Signup from './pages/login/signup';
import ForgotPassword from './pages/login/ForgotPassword';
import CompleteProfile from './pages/completeProfile/completeProfile';
import Dashboard from './pages/dashboard/dashboard';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/affiliate', element: <Affiliate /> },
  { path: '/about', element: <About /> },
  { path: '/pricing', element: <Pricing /> },
  { path: '/contact', element: <Contact /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/complete-profile', element: <CompleteProfile /> },
  { path: '/dashboard', element: <Dashboard /> }, // Assuming you have a Dashboard component
]);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <RouterProvider router={router} />
);