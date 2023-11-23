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
import Webhooks from '../../components/Webhooks';
import Tabs from '../../components/Tabs';

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

    // Select settings tab
    const [currentTab, setCurrentTab] = useState<string>('Translation');

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
            setResponse({ isSuccess: false, message: "An error occurred while loading your configuration, try refreshing page", hideRestOfPage: true });
        })
    }

    // Set spoken lang, and save it
    function setSpoken(lang: string | undefined) {
        const newLang = lang || lastSpokenLang;
        setLastSpokenLang(spokenLang);
        setSpokenLang(newLang);

        api('config', {
            method: 'POST',
            body: {
                spokenLang: newLang,
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
            setResponse({ isSuccess: false, message: "An error occurred while authenticating, try refreshing page", hideRestOfPage: true });
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
            <br/>
            <a onClick={()=>{ window.location.reload() }} href='#'>Refresh</a>
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
                    <h2>
                        Welcome, <strong>{user?.login ?? ''}</strong>
                        <Link to="/logout" className="profile-container">
                            {profilePicture !== loadingImg && (
                                <div className='logout-box'>
                                    <img src={LogoutImg} alt="logout" />
                                </div>
                            )}
                            <img src={profilePicture} alt="profile picture" className="profile-image"/>
                        </Link>
                    </h2>
                </div>
                <div className="setting theme-box">
                    <h3>Speech</h3>
                    <MicrophoneApp 
                        spokenLang={spokenLang}
                        setSpokenLang={setSpoken}
                        configLoaded={configLoaded}
                        loadingImg={loadingImg}
                    />
                </div>

                <div>
                    <Tabs tabs={['Translation', 'Twitch', 'Webhooks']} currentTab={currentTab} setCurrentTab={setCurrentTab}  />
                    
                    { currentTab==='Translation' && (
                        <div className="api theme-box">
                            <h3>Translation API Connection</h3>
                            <TranslationService
                                translateService={translateService}
                                configLoaded={configLoaded}
                                loadingImg={loadingImg}
                            />
                            <div className='languages'>
                                <h3>Languages</h3>
                                <LanguageOutSelector
                                    selectedLanguageCode={translationLangs}
                                    setTranslationLangs={setTranslationLangs}
                                    configLoaded={configLoaded}
                                />
                            </div>
                        </div>                        
                    )}

                    {/* <div className="banned theme-box">
                        <h3>Banned captions</h3>
                        <BannedCaptions
                            allBanCaptions={allBanCaptions}
                            onAllBanCaptionsChange={handleAllBanCaptionsChange}
                            selectedLanguageCode={translationLangs}
                            languageCodeLoaded={languageCodeLoaded}
                            LoadingImg={LoadingImg}
                        />
                    </div> */}

                    { currentTab === 'Twitch' && (
                        <div className="setting theme-box">
                            <h3>Twitch</h3>
                            <Twitch />
                        </div>                        
                    )}

                    { currentTab === 'Webhooks' && (
                        <div className="webhooks theme-box">
                            <h3>Webhooks</h3>
                            <Webhooks/>
                        </div>                        
                    ) }
                </div>
                <Footer />
            </section>
        </SocketContext.Provider>
    );
}

export default Dashboard;
