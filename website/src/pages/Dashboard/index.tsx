import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import TransferList from '../../components/TransferList';
import MicrophoneApp from '../../components/MicrophoneApp';
import TranslationService from '../../components/TranslationService';
// import BannedCaptions from '../../components/BannedCaptions';

import Footer from '../../components/Footer';

import '../../webroot/style/dashboard.css';

import LogoutImg from '../../assets/logout.svg';
import LoadingImg from '../../assets/loading.svg';

import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import useCaptions from '../../hooks/UseCaptions';

// interface banCaptionsProps {
//     lang: string;
//     text: string;
//     id: string;
// }

function Dashboard() {
    const { user } = useContext(AuthContext);
    const { handleText, recognized } = useCaptions();

    // Request to get the user's config
    // const [allBanCaptions, setAllBanCaptions] = useState<banCaptionsProps[]>([]);
    const [translationLangs, setTranslationLangs] = useState<string[]>([]);
    const [spokenLang, setSpokenLang] = useState<string>();
    const [languageCodeLoaded, setLanguageCodeLoaded] = useState<boolean>(false);
    const [apiKeyIsWorking, setApiKeyIsWorking] = useState<boolean>(false);
    const [apiLoader, setApiLoader] = useState<string | undefined>(LoadingImg);
    const [profilePicture, setProfilePicture] = useState<string>(LoadingImg);

    useEffect(() => {
        if(!user?.connected && user?.url) {
            window.location.replace(user.url);
        }
        setProfilePicture('TODO');
    }, [ user ]);

    useEffect(() => {
        // Fetch user infos
        if(!user?.connected) return;
        api('config')
            .then(response => {
                setSpokenLang(response.spokenLang);

                // setAllBanCaptions(response.banWords);
                setApiKeyIsWorking(response.api_token && response.api_token.trim().length !== 0);
                setApiLoader(undefined);
                setTranslationLangs(response.translateLangs);
                setLanguageCodeLoaded(true);
                return;
            })
            .catch(err => {
                console.error('Loading error', err);
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
                    <TranslationService
                        apiKeyIsWorking={apiKeyIsWorking}
                        apiLoader={apiLoader}
                        onApiKeyChange={handleApiKeyChange}
                    />
                </div>
                <div className="languages theme-box">
                    <span className="step-indication">2</span>
                    <h3>Languages</h3>
                    <TransferList
                        selectedLanguageCode={translationLangs}
                        onLanguageCodeChange={handleSelectedLanguageCodeChange}
                        languageCodeLoaded={languageCodeLoaded}
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
                    <MicrophoneApp handleText={handleText} recognized={recognized} spokenLang={spokenLang} setSpokenLang={setSpokenLang} />
                </div>
                <Footer />
            </div>
        </section>
    );
}

export default Dashboard;
