import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import LanguageOutSelector from '../../components/LanguageOutSelector';
import MicrophoneApp from '../../components/MicrophoneApp';
import TranslationService from '../../components/TranslationService';
import FormResponse from '../../components/FormResponse';

// import BannedCaptions from '../../components/BannedCaptions';

import Footer from '../../components/Footer';

import '../../webroot/style/dashboard.css';

import LogoutImg from '../../assets/logout.svg';
import LoadingImg from '../../assets/loading.svg';

import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { SocketProvider } from '../../context/SocketContext';

// interface banCaptionsProps {
//     lang: string;
//     text: string;
//     id: string;
// }

function Dashboard() {
    const { user } = useContext(AuthContext);

    // Request to get the user's config
    // const [allBanCaptions, setAllBanCaptions] = useState<banCaptionsProps[]>([]);
    const [translationLangs, setTranslationLangs] = useState<string[]>([]);
    const [spokenLang, setSpokenLang] = useState<string>();
    const [apiKeyIsWorking, setApiKeyIsWorking] = useState<boolean>(false);
    const [configLoaded, setConfigLoaded] = useState<boolean>(false);
    const [profilePicture, setProfilePicture] = useState<string>(LoadingImg);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string } | null>(null);

    useEffect(() => {
        if(!user?.connected && user?.url) {
            window.location.replace(user.url);
        }
        if(user?.img) {
            setProfilePicture(user.img);
        }
        
    }, [ user ]);

    useEffect(() => {
        // Fetch user infos
        if(!user?.connected) return; // TODO : Show error message no ?
        api('config')
            .then(response => {
                setApiKeyIsWorking(response.api_token && response.api_token.trim().length !== 0);
                // setAllBanCaptions(response.banWords);
                setSpokenLang(response.spokenLang);
                setTranslationLangs(response.translateLangs);
                setConfigLoaded(true);
                return;
            })
            .catch(err => {
                console.error(err);
                setResponse({ isSuccess: false, message: "An error occurred while loading your configuration, please reload" });
            })
    }, [user]);

    const handleSelectedLanguageCodeChange = (newLanguageCode: (string)[]) => {
        setTranslationLangs(newLanguageCode);
    };

    const handleApiKeyChange = (isWorking: boolean) => {
        setApiKeyIsWorking(isWorking);
    };

    // const handleAllBanCaptionsChange = (newBanCaptions: banCaptionsProps[]) => {
    //     setAllBanCaptions(newBanCaptions);
    // };

    const closeResponse = () => {
        setResponse(null);
    };

    return (
        <SocketProvider>
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
                        <h3>Transaltion API Connection</h3>
                        <TranslationService
                            apiKeyIsWorking={apiKeyIsWorking}
                            onApiKeyChange={handleApiKeyChange}
                            configLoaded={configLoaded}
                            LoadingImg={LoadingImg}
                        />
                    </div>
                    <div className="languages theme-box">
                        <span className="step-indication">2</span>
                        <h3>Languages</h3>
                        <LanguageOutSelector
                            selectedLanguageCode={translationLangs}
                            onLanguageCodeChange={handleSelectedLanguageCodeChange}
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
                            setSpokenLang={setSpokenLang}
                            configLoaded={configLoaded}
                            LoadingImg={LoadingImg}
                        />
                    </div>
                    <Footer />
                </div>
            </section>
        </SocketProvider>
    );
}

export default Dashboard;
