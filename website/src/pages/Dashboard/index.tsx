import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import TransferList from '../../components/TransferList';
import MicrophoneApp from '../../components/MicrophoneApp';
import Api from '../../components/Api';
import BannedCaptions from '../../components/BannedCaptions';

import Footer from '../../components/Footer';

import '../../webroot/style/dashboard.css';

import LogoutImg from '../../assets/logout.svg';
import LoadingImg from '../../assets/loading.svg';

import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

interface banCaptionsProps {
    lang: string;
    text: string;
    id: string;
}

function Dashboard() {
    const { user } = useContext(AuthContext);

    // Request to get the user's config
    const [allBanCaptions, setAllBanCaptions] = useState<banCaptionsProps[]>([]);
    const [selectedLanguageCode, setSelectedLanguageCode] = useState<string[]>([]);
    const [languageCodeLoaded, setLanguageCodeLoaded] = useState<boolean>(false);
    const [apiKeyIsWorking, setApiKeyIsWorking] = useState<boolean>(false);
    const [apiLoader, setApiLoader] = useState<string | undefined>(LoadingImg);
    const [profilePicture, setProfilePicture] = useState<string>(LoadingImg);
    const [defaultSelectedMic, setDefaultSelectedMic] = useState<string | undefined>(undefined);
    const [micLoaded, setMicLoaded] = useState<boolean>(false);

    useEffect(() => {
        if(!user?.connected && user?.url) {
            window.location.replace(user.url);
        }
    }, [ user ]);

    useEffect(() => {
        // Fetch user infos
        if(!user?.connected) return;
        api('config')
            .then(response => {
                return;
                setAllBanCaptions(response.ban_captions);
                setApiKeyIsWorking(response.api_token && response.api_token.trim().length !== 0);
                setApiLoader(undefined);
                setSelectedLanguageCode(response.selected_languages);
                setLanguageCodeLoaded(true);
                setProfilePicture(response.profile_picture_url);
                setDefaultSelectedMic(response.mic_settings);
                setMicLoaded(true);
                
            })
            .catch(err => {
                console.error('Loading error', err);
            })
    }, [user]);

    const handleSelectedLanguageCodeChange = (newLanguageCode: (string)[]) => {
        setSelectedLanguageCode(newLanguageCode);
    };

    const handleApiKeyChange = (isWorking: boolean) => {
        setApiKeyIsWorking(isWorking);
    };

    const handleAllBanCaptionsChange = (newBanCaptions: banCaptionsProps[]) => {
        setAllBanCaptions(newBanCaptions);
    };

    return (
        <section id="dashboard">
            <div className="welcome theme-box">
                <h2>Welcome, <strong>{user?.login ?? ''}</strong></h2>
                <Link to="/logout" className="profile-container">
                    {profilePicture !== LoadingImg && (
                        <div className='logout-box'>
                            <img src={LogoutImg} alt="logout" />
                        </div>
                    )}
                    <img src={profilePicture} alt="profile picture" className="profile-image"/>
                </Link>
            </div>
            <div>
                <div className="api theme-box">
                    <span className="step-indication">1</span>
                    <h3>API Connection</h3>
                    <Api
                        apiKeyIsWorking={apiKeyIsWorking}
                        apiLoader={apiLoader}
                        onApiKeyChange={handleApiKeyChange}
                    />
                </div>
                <div className="languages theme-box">
                    <span className="step-indication">2</span>
                    <h3>Languages</h3>
                    <TransferList
                        selectedLanguageCode={selectedLanguageCode}
                        onLanguageCodeChange={handleSelectedLanguageCodeChange}
                        languageCodeLoaded={languageCodeLoaded}
                    />
                </div>
            </div>
            <div>
                <div className="banned theme-box">
                    <span className="step-indication">3</span>
                    <h3>Banned captions</h3>
                    <BannedCaptions
                        allBanCaptions={allBanCaptions}
                        onAllBanCaptionsChange={handleAllBanCaptionsChange}
                        selectedLanguageCode={selectedLanguageCode}
                        languageCodeLoaded={languageCodeLoaded}
                        LoadingImg={LoadingImg}
                    />
                </div>
                <div className="setting theme-box">
                    <span className="step-indication">4</span>
                    <h3>Mic setting</h3>
                    <MicrophoneApp 
                        defaultSelectedMic={defaultSelectedMic}
                        micLoaded={micLoaded}
                    />
                </div>
                <Footer />
            </div>
        </section>
    );
}

export default Dashboard;
