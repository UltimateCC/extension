import { useState, useEffect, useContext, useRef } from 'react';
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
import DashboardTabs from '../../components/DashboardTabs';

// interface banCaptionsProps {
//     lang: string;
//     text: string;
//     id: string;
// }

function Dashboard() {
    const { user, refreshAuth, error, loading } = useContext(AuthContext);
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

    // Check if authenticated
    // Move to separate hook ?
    const authRefreshed = useRef<boolean>(false);
    useEffect(() => {
        if(!user?.connected) {
            // If not connected, redirect to auth url
            if(user?.url) {
                window.location.replace(user.url);

            // If url, try refreshing auth once
            }else if(!loading && !authRefreshed.current) {
                authRefreshed.current = true;
                refreshAuth();
            }
        }
    }, [error, user, loading, refreshAuth]);


    useEffect(() => {
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
    }, [ user, error, socketCtx.captionsStatus ]);

    // const handleAllBanCaptionsChange = (newBanCaptions: banCaptionsProps[]) => {
    //     setAllBanCaptions(newBanCaptions);
    // };

    const closeResponse = () => {
        setResponse(null);
    };

    if(response?.hideRestOfPage) return (
        <div className="theme-box padtop">
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
                    <div className='theme-box-container'>
                        <h3>Dashboard</h3>
                        <MicrophoneApp 
                            spokenLang={spokenLang}
                            setSpokenLang={setSpoken}
                            configLoaded={configLoaded}
                            loadingImg={loadingImg}
                        />
                    </div>
                </div>

                <div>
                    <DashboardTabs
                        tabs={['Translation', /*'Banned words',*/ 'Twitch', /*'OBS',*/ 'Webhooks']}
                        currentTab={currentTab}
                        setCurrentTab={setCurrentTab}
                    />
                    <div className="theme-box">
                        <div className='theme-box-container'>
                            <h3>{ currentTab }</h3>
                            { currentTab==='Translation' && (
                                <div>
                                    <TranslationService
                                        translateService={translateService}
                                        configLoaded={configLoaded}
                                        loadingImg={loadingImg}
                                    />
                                    { (translationLangs?.length > 0) && (
                                        <div className='languages'>
                                            <h3>Translation languages</h3>
                                            <LanguageOutSelector
                                                selectedLanguageCode={translationLangs}
                                                setTranslationLangs={setTranslationLangs}
                                                configLoaded={configLoaded}
                                            />
                                        </div>
                                    ) }
                                </div>
                            )}
                            { currentTab === 'Twitch' && (<Twitch />) }
                            { currentTab === 'Webhooks' && (<Webhooks/>) }
                        </div>
                    </div>

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
                </div>
                <Footer />
            </section>
        </SocketContext.Provider>
    );
}

export default Dashboard;
