import { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';

import LanguageOutSelector from '../../components/LanguageOutSelector';
import MicrophoneApp from '../../components/MicrophoneApp';
import TranslationService from '../../components/TranslationService';
import FormResponse from '../../components/FormResponse';
import Twitch from '../../components/Twitch';

// import BannedCaptions from '../../components/BannedCaptions';
import BrowserSource from '../../components/BrowserSource';

import Footer from '../../components/Footer';

import '../../webroot/style/dashboard.css';

import LogoutImg from '../../assets/logout.svg';
import loadingImg from '../../assets/loading.svg';

import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { Action, SocketContext } from '../../context/SocketContext';
import Webhooks from '../../components/Webhooks';
import DashboardTabs from '../../components/DashboardTabs';
import Guide from '../../components/Guide';
import BanWords from '../../components/BanWords';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSavedConfig } from '../../hooks/useSavedConfig';
import { useAuthCheck } from '../../hooks/useAuthCheck';
import { useObsWebsocket } from '../../hooks/useObsWebsocket';
import { useObsSendCaptions } from '../../hooks/useObsSendCaptions';
import OBS from '../../components/OBS';

interface UserConfig {
	spokenLang: string
	lastSpokenLang: string
	spokenLangs?: string[]
	translateService: '' | 'gcp'
	translateLangs?: string[]
    banWords?: string[]
    twitchAutoStop?: boolean
    customDelay?: number
    obsEnabled?: boolean
    obsPort?: number
    obsPassword?: string
    obsSendCaptions?: boolean
    obsAutoStop?: boolean
}

function Dashboard() {
    const { user, error } = useContext(AuthContext);
    const socketCtx = useSocket(user?.connected ?? false);
    
    // Redirect if not connected
    useAuthCheck();

    // User config
    const { config, loadConfig, updateConfig } = useSavedConfig<UserConfig>({apiPath: 'config'});

    // Current dashboard state
    const [configLoaded, setConfigLoaded] = useState<boolean>(false);
    const [profilePicture, setProfilePicture] = useState<string>(loadingImg);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string; hideRestOfPage?: boolean; } | null>(null);
    
    // Selected settings tab
    const [currentTab, setCurrentTab] = useState<string>('Guide');
    
    // Speech recognition
    const [listening, setListening] = useState<boolean>(false);
    // Additional delay added to captions
    const delay = 1000 + (config.customDelay??0);
    // Delay between each partial captions
    const splitDelay = Math.max(2700, delay);
    const { error: recognitionErrror, text } = useSpeechRecognition({handleText: socketCtx.handleText, lang: config.spokenLang, listening, splitDelay, delay});

    // OBS websocket
    const { obs } = useObsWebsocket({url:'ws://127.0.0.1:'+ (config.obsPort??4455), password: config.obsPassword, enabled: config.obsEnabled});
    useObsSendCaptions({obs, text, enabled: (config.obsSendCaptions??true)});

    // Function to set spoken lang, and save it
    const setSpoken = useCallback((lang: string | undefined) => {
        const newLang = lang || config.lastSpokenLang;

        updateConfig({
            spokenLang: newLang,
            lastSpokenLang: config.spokenLang
        })
        /*.then(socketCtx.reloadConfig)*/
        .catch((error) => {
            console.error('Error updating spoken language', error);
            setResponse({ isSuccess: false, message: 'An error occurred while saving your spoken language' });
        });
    }, [config.lastSpokenLang, config.spokenLang, updateConfig]);

    const handleAction = useCallback((action: Action) => {
        if(action.type === 'setlang') {
            setSpoken(action.lang);
        }else if(action.type === 'start') {
            setListening(true);
        }else if(action.type === 'stop') {
            setListening(false);
        }
    }, [setSpoken, setListening]);

    // Set error message if there is one to show
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
            loadConfig()
                .then(()=>setConfigLoaded(true))
                .catch((e)=>{
                    console.error('Error loading user config', e);
                    setResponse({ isSuccess: false, message: "An error occurred while loading your configuration, try refreshing page", hideRestOfPage: true });
                });
        }
    }, [ user, error, socketCtx.captionsStatus, loadConfig ]);

    // Handle actions triggered from server via socket
    useEffect(()=>{
        socketCtx.socket.on('action', handleAction);

        return ()=>{
            socketCtx.socket.off('action', handleAction);
        }
    }, [socketCtx.socket, socketCtx.reloadConfig, setSpoken, handleAction]);

    // Handle obs events
    useEffect(()=>{
        // Stop listening when stream ends on OBS
        function handleStreamStateChanged(event: {outputActive: boolean, outputState: string}) {
            if(
                (config.obsAutoStop ?? true) && listening
                && ['OBS_WEBSOCKET_OUTPUT_STOPPING', 'OBS_WEBSOCKET_OUTPUT_STOPPED'].includes(event.outputState)
            ) {
                setListening(false);
            }
        }
        obs.on('StreamStateChanged', handleStreamStateChanged);

        return ()=>{
            obs.off('StreamStateChanged', handleStreamStateChanged);
        }
    }, [obs, config.obsAutoStop, listening]);

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
            <a onClick={ ()=>{ window.location.reload() } } href='#'>Refresh</a>
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
                            listening={listening}
                            setListening={setListening}
                            text={text}
                            spokenLang={config.spokenLang}
                            setSpokenLang={setSpoken}
                            configLoaded={configLoaded}
                            loadingImg={loadingImg}
                            recognitionErrror={recognitionErrror}
                        />
                    </div>
                </div>

                <div>
                    <DashboardTabs
                        tabs={['Guide', 'Translation', 'Ban words', 'Twitch', /* 'OBS', */ 'HTTP', 'Browser source']}
                        currentTab={currentTab}
                        setCurrentTab={setCurrentTab}
                    />
                    <div className="theme-box">
                        <div className='theme-box-container'>
                            <h3>{ currentTab }</h3>
                            { currentTab === 'Guide' && (<Guide />) }
                            { currentTab === 'Translation' && (
                                <div>
                                    <TranslationService
                                        translateService={config.translateService}
                                        updateConfig={updateConfig}
                                        configLoaded={configLoaded}
                                        loadingImg={loadingImg}
                                    />
                                    { (socketCtx?.translateLangs?.length > 0) && (
                                        <div className='languages'>
                                            <h3>Translation languages</h3>
                                            <LanguageOutSelector
                                                selectedLanguageCode={config.translateLangs}
                                                updateConfig={updateConfig}
                                                configLoaded={configLoaded}
                                            />
                                        </div>
                                    ) }
                                </div>
                            )}
                            { currentTab === 'Ban words' && (
                                <BanWords
                                    banWords={config.banWords??[]}
                                    updateConfig={updateConfig}
                                    configLoaded={configLoaded}
                                />)}
                            { currentTab === 'Twitch' && (
                                <Twitch
                                    twitchAutoStop={config.twitchAutoStop ?? true}
                                    updateConfig={updateConfig}
                                />)}
                            { currentTab === 'OBS' && (
                                <OBS
                                    userConfig={config}
                                    updateConfig={updateConfig}
                                />)}
                            { currentTab === 'HTTP' && (<Webhooks/>) }
                            { currentTab === 'Browser source' && (
                                <BrowserSource
                                    selectedLanguageCode={config.translateLangs}
                                    spokenLang={config.spokenLang}
                                    configLoaded={configLoaded}
                                />
                            ) }
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
