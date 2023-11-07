import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home/';
import Dashboard from './pages/Dashboard/';
import Thanks from './pages/Thanks';
import Verify from './components/Verify';
import Error from './pages/Error';

import PageTitle from './components/PageTitle';
import Logout from './components/Logout';
import AppFooter from './components/AppFooter';
import Navigation from './components/Navigation';

import './webroot/style/colors.css';
import './webroot/style/main.css';
import './webroot/style/font.css';

import LogoImg from './assets/logo.png';
import { AuthProvider } from './context/AuthContext';
import Privacy from './pages/Privacy';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Router>
            <AuthProvider>
                <PageTitle />
                <div className='mainContainer'>
                    <div className='contentContainer'>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/verify" element={<Verify />} />
                            <Route path="/logout" element={<Logout />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            {/* thank-you */}
                            <Route path="/thank-you" element={<Thanks />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="*" element={<Error />} />
                        </Routes>
                        <AppFooter />
                    </div>
                    <Navigation logo={LogoImg}/>
                </div>
            </AuthProvider>
        </Router>
    </React.StrictMode>
);
