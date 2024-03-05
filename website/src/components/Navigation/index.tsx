import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';

import '../../webroot/style/navigation.css';
import { config } from '../../config';
import Icons from '../Icons';

// Navigation with parameter logo of type string
function Navigation({ logo } : { logo: string }) {
    const [isSecretMode, setSecretMode] = useState<boolean>(false);
    const [isNavbarVisible, setNavbarVisibility] = useState<boolean>(false);
    const navbarRef = useRef<HTMLDivElement | null>(null); // Ref for the navigation container

    const toggleSecretMode = () => {
        setSecretMode(!isSecretMode);
    };

    const showNavbar = () => {
        setNavbarVisibility(true);
    };

    const hideNavbar = () => {
        setNavbarVisibility(false);
    };

    useEffect(() => {
        if (isSecretMode) {
            document.body.style.fontFamily = "'Press Start 2P'";
        } else {
            document.body.style.fontFamily = '';
        }
    }, [isSecretMode]);

    return (
        <section id="navbar">
            <div id="nonLaptopNavbar">
                <NavLink to="/" className="main-img">
                    <img src={logo} alt="Logo" />
                </NavLink>
                <button id='burger-menu' onClick={showNavbar}>
                    <div className='bar'></div>
                    <div className='bar'></div>
                    <div className='bar'></div>
                </button>
            </div>
            <div ref={navbarRef} className={`theme-box ${isNavbarVisible ? 'show' : ''}`} id="laptopNavbar">
                <button className='close' onClick={hideNavbar}>&times;</button>
                
                <div className='logo-container'>
                    <img src={logo} alt="Logo" />
                    <div className='secret' onClick={toggleSecretMode}></div>
                </div>
                <NavLink to="/" className="main-title" onClick={hideNavbar}><h1>Ultimate Closed Captions</h1></NavLink>
                <div className="spacer"></div>
                <nav className="main-links" onClick={hideNavbar}>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                    <NavLink to="/channels">Channels</NavLink>
                </nav>
                <div className="secondary-links" onClick={hideNavbar}>
                    {
                        //<NavLink to="/tos">Terms of Service</NavLink>
                    }
                    <NavLink to="/privacy">Privacy policy</NavLink>
                </div>
                <div className="socials">
                    <a href={config.twitch} target='_blank' rel='noreferrer'>
                        <Icons name='twitch' />
                    </a>
                    <a href={config.github} target='_blank' rel='noreferrer'>
                        <Icons name='github' />
                    </a>
                    <a href={config.discord} target='_blank' rel='noreferrer'>
                        <Icons name='discord' />
                    </a>
                </div>
            </div>
        </section>
    );
}

export default Navigation;
