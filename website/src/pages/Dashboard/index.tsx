import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import LanguageOutSelector from '../../components/LanguageOutSelector';
import MicrophoneApp from '../../components/MicrophoneApp';
import TranslationService from '../../components/TranslationService';
import FormResponse from '../../components/FormResponse';
import Twitch from '../../components/Twitch';

// import BannedCaptions from '../../components/BannedCaptions';

import Footer from '../../components/Footer';

import '../../webroot/style/dashboard.css';

import LogoutImg from '../../assets/logout.svg';
import loadingImg from '../../assets/loading.svg';

import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { SocketContext } from '../../context/SocketContext';

// interface banCaptionsProps {
//     lang: string;
//     text: string;
//     id: string;
// }

function Dashboard() {
    const { user, error } = useContext(AuthContext);
    const socketCtx = useSocket();

    // Request to get the user's config
    // const [allBanCaptions, setAllBanCaptions] = useState<banCaptionsProps[]>([]);
    const [configLoaded, setConfigLoaded] = useState<boolean>(false);
    const [profilePicture, setProfilePicture] = useState<string>(loadingImg);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string; hideRestOfPage?: boolean; } | null>(null);

    // Speech language
    const [lastSpokenLang, setLastSpokenLang] = useState<string>();
    const [spokenLang, setSpokenLang] = useState<string>();

    // Translation
    const [translateService, setTranslateService] = useState<string>();
    const [translationLangs, setTranslationLangs] = useState<string[]>([]);

    function loadConfig() {
        api('config')
        .then(response => {
            // setAllBanCaptions(response.banWords);
            setLastSpokenLang(response.lastSpokenLang);
            setSpokenLang(response.spokenLang);
            setTranslateService(response.translateService);
            setTranslationLangs(response.translateLangs);
            setConfigLoaded(true);
            return;
        })
        .catch(err => {
            console.error(err);
            setResponse({ isSuccess: false, message: "An error occurred while loading your configuration, please reload", hideRestOfPage: true });
        })
    }

    // Set spoken lang, and save it
    function setSpoken(lang: string | undefined) {
        setLastSpokenLang(spokenLang);
        setSpokenLang(lang ?? lastSpokenLang);

        api('config', {
            method: 'POST',
            body: {
                spokenLang: lang ?? lastSpokenLang,
                lastSpokenLang: spokenLang
            }
        })
        .then(socketCtx.reloadConfig)
        .catch((error) => {
            console.error('Error updating spoken language', error);
            setResponse({ isSuccess: false, message: 'An error occurred while saving your spoken language' });
        });
    }

    useEffect(() => {
        if(!user?.connected && user?.url) {
            window.location.replace(user.url);
        }
        if(user?.img) {
            setProfilePicture(user.img);
        }

        if(error) {
            setResponse({ isSuccess: false, message: "An error occurred while authenticating, please reload", hideRestOfPage: true });
        }

        if(socketCtx.captionsStatus?.twitch === false) {
            setResponse({ isSuccess: false, message: "The Twitch extension is not installed on your channel." });
        }

        if(user?.connected) {
            loadConfig();
        }
        
    }, [ user, socketCtx.captionsStatus, error ]);

    // const handleAllBanCaptionsChange = (newBanCaptions: banCaptionsProps[]) => {
    //     setAllBanCaptions(newBanCaptions);
    // };

    const closeResponse = () => {
        setResponse(null);
    };

    if(response?.hideRestOfPage) return (
        <div className="theme-box">
            <FormResponse
                isSucceed={response.isSuccess}
                message={response.message}
                onClose={closeResponse}
            />
            <Link to="/logout" className="profile-container">
                Log out
            </Link>
        </div>
    );

    return (
        <SocketContext.Provider value={socketCtx}>
            {response && (
                <FormResponse
                    isSucceed={response.isSuccess}
                    message={response.message}
                    onClose={closeResponse}
                />
            )}
            <section id="dashboard">
                <div className="welcome theme-box">
                    <h2>Welcome, <strong>{user?.login ?? ''}</strong></h2>
                    <Link to="/logout" className="profile-container">
                        {profilePicture !== loadingImg && (
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
                        <h3>Translation API Connection</h3>
                        <TranslationService
                            translateService={translateService}
                            configLoaded={configLoaded}
                            loadingImg={loadingImg}
                        />
                    </div>
                    <div className="languages theme-box">
                        <span className="step-indication">2</span>
                        <h3>Languages</h3>
                        <LanguageOutSelector
                            selectedLanguageCode={translationLangs}
                            setTranslationLangs={setTranslationLangs}
                            configLoaded={configLoaded}
                        />
                    </div>
                </div>
                <div>
                    {/* <div className="banned theme-box">
                        <span className="step-indication">3</span>
                        <h3>Banned captions</h3>
                        <BannedCaptions
                            allBanCaptions={allBanCaptions}
                            onAllBanCaptionsChange={handleAllBanCaptionsChange}
                            selectedLanguageCode={translationLangs}
                            languageCodeLoaded={languageCodeLoaded}
                            LoadingImg={LoadingImg}
                        />
                    </div> */}
                    <div className="setting theme-box">
                        <span className="step-indication">3</span>
                        <h3>Speech</h3>
                        <MicrophoneApp 
                            spokenLang={spokenLang}
                            setSpokenLang={setSpoken}
                            configLoaded={configLoaded}
                            loadingImg={loadingImg}
                        />
                    </div>
                    <div className="setting theme-box">
                        <h3>Twitch</h3>
                        <Twitch

                        />
                    </div>
                    <Footer />
                </div>
            </section>
        </SocketContext.Provider>
    );
}

export default Dashboard;
