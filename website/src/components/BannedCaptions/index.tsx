import { useState, useEffect, useRef } from 'react';

import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

import languageNames from '../../services/languageNames.ts'; // Import language names
import api from '../../services/api.ts';

import FormResponse from '../../components/FormResponse';
import DelayedDisplay from '../../components/DelayedDisplay';

interface banCaptionsProps {
    lang: string;
    text: string;
    id: string;
}

interface BannedCaptionsProps {
    allBanCaptions: banCaptionsProps[];
    onAllBanCaptionsChange: (newBanCaptions: banCaptionsProps[]) => void;
    selectedLanguageCode: string[]; // List of selected languages from the languages selection
    languageCodeLoaded: boolean;
    LoadingImg: string | undefined;
}

const MAX_LANGUAGES_DISPLAYED = 3; // Maximum number of languages to display

// Styled component for the tooltip style (from MUI)
const ThemedTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#D9D9D9E0',
      color: '#37373E',
      boxShadow: theme.shadows[1],
      fontSize: 16,
      fontFamily: 'Baloo',
    },
    [`& .${tooltipClasses.arrow}`]: {
        color: '#D9D9D9E0',
    },
  }));

function BannedCaptions({ allBanCaptions, onAllBanCaptionsChange, selectedLanguageCode, languageCodeLoaded, LoadingImg }: BannedCaptionsProps) {
    const bannedCaptionInputRef = useRef<HTMLInputElement>(null);
    const [activeLanguage, setActiveLanguage] = useState<string>("");
    const [showAllLanguages, setShowAllLanguages] = useState(false);
    const [activeBanCaptions, setActiveBanCaptions] = useState<banCaptionsProps[]>([]);
    const [isLoadingAdd, setIsLoadingAdd] = useState<boolean>(false);
    const [isLoadingRemove, setIsLoadingRemove] = useState<boolean>(false);
    const [removingLi, setRemovingLi] = useState<HTMLElement | null>(null);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string } | null>(null);

    // Set the active language when selectedLanguageCode changes
    useEffect(() => {
        if (selectedLanguageCode.length > 0) setActiveLanguage(selectedLanguageCode[0]);
    }, [selectedLanguageCode]);

    // Set active ban captions when activeLanguage or allBanCaptions changes
    useEffect(() => {
        if (activeLanguage?.length > 0) {
            setActiveBanCaptions(allBanCaptions.filter(caption => caption.lang === activeLanguage));
        }
    }, [activeLanguage, allBanCaptions]);

    const handleLanguageClick = (languageCode: string) => {
        setActiveLanguage(languageCode);
        setResponse(null);
    };

    // Determine the languages to display based on showAllLanguages
    const languagesToDisplay = showAllLanguages
        ? selectedLanguageCode
        : selectedLanguageCode.slice(0, MAX_LANGUAGES_DISPLAYED);

    // Set active language to the first displayed language if not in the list
    useEffect(() => {
        if (!showAllLanguages && !languagesToDisplay.includes(activeLanguage)) {
            setActiveLanguage(languagesToDisplay[0]);
        }
    }, [showAllLanguages, languagesToDisplay, activeLanguage]);

    // Handle the "Show More/Less" button click
    const handleToggleLanguages = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setShowAllLanguages(!showAllLanguages);
        event.currentTarget.textContent = showAllLanguages ? '+' : '-';
    };

    const closeResponse = () => {
        setResponse(null);
    };

    const sendBannedCaption = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        
        const newBannedCaption = bannedCaptionInputRef.current?.value;

        if (isLoadingAdd || !newBannedCaption) return;

        setIsLoadingAdd(true);

        DelayedDisplay({
            requestFn: async () => {
                return await api('user/word', {
                    method: 'PUT',
                    body: { text: newBannedCaption, lang: activeLanguage }
                });
            },
            successMessage: "The banned caption has been added",
            errorMessage: "An error occurred",
            setIsLoading: setIsLoadingAdd,
            setResponse: setResponse,
            needResponseApi: true,
            setSuccessAction: (responseApi) => {
                bannedCaptionInputRef.current!.value = "";
                const newBanCaption = responseApi as banCaptionsProps;
                onAllBanCaptionsChange([...allBanCaptions, newBanCaption]);
            }
        });
    };

    const removeBannedCaption = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
        if (isLoadingRemove) return;

        setIsLoadingRemove(true);
        
        const li = event.currentTarget.parentElement;
        if (li) setRemovingLi(li);

        DelayedDisplay({
            requestFn: async () => {
                return await api(`user/word/${id}`, {
                    method: 'DELETE',
                });
            },
            successMessage: "The banned caption has been removed",
            errorMessage: "An error occurred",
            setIsLoading: setIsLoadingRemove,
            setResponse: setResponse,
            setSuccessAction: () => {
                onAllBanCaptionsChange(allBanCaptions.filter(caption => caption.id !== id));
                setRemovingLi(null);
            }
        });
    };

    useEffect(() => {
        if (removingLi) {
            const p = removingLi.querySelector('p');
            if (p) {
                p.innerHTML = "Removing...";
                p.classList.add('removing');
            }
        }
    }, [removingLi]);

    useEffect(() => {
        if(!isLoadingRemove && removingLi) {
            const p = removingLi.querySelector('p');
            if (p) {
                const id = removingLi.getAttribute('key');
                if (id) {
                    const caption = allBanCaptions.find(caption => caption.id === id);
                    p.innerHTML = (caption) ? caption.text : "Removed";
                }
                p.classList.remove('removing');
            }
        }
    }, [isLoadingRemove, removingLi, allBanCaptions]);


    // Display loading image if data is not yet loaded
    if (!languageCodeLoaded) return (
        <img src={LoadingImg} alt="loading" className="loading-img" />
    );

    // Display message if no language is selected
    if (selectedLanguageCode.length === 0) return (<h4>No selected languages, you must select one to set banned words</h4>);

    return (
        <>
            {/* Tooltip for the lightbulb icon */}
            <ThemedTooltip
                title="You can add more than one word at a time by separated them with a comma."
                placement="bottom-end"
                arrow
            >
                {/* Lighbulb from Font Awesome V*/}
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" className="tips-img">
                    <path fill="#D9D9D9" d="M297.2 248.9C311.6 228.3 320 203.2 320 176c0-70.7-57.3-128-128-128S64 105.3 64 176c0 27.2 8.4 52.3 22.8 
                    72.9c3.7 5.3 8.1 11.3 12.8 17.7l0 0c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5H109c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8l0 
                    0 0 0c-5.2-7.1-10.4-14.2-15.4-21.4C27.6 247.9 16 213.3 16 176C16 78.8 94.8 0 192 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 
                    7.2-10.2 14.3-15.4 21.4l0 0 0 0c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5H226.4c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 
                    26.9-42.1 39.8-59.8l0 0 0 0 0 0c4.7-6.4 9-12.4 12.7-17.7zM192 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 
                    80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80V416H272v16c0 44.2-35.8 80-80 80z"/>
                </svg>
            </ThemedTooltip>

            {/* Languages selection */}
            <div className="selectable-languages">
                <h4 className="responsive-text">Selected<p>languages :</p></h4>
                <ul className={`languages-list ${languagesToDisplay.length > MAX_LANGUAGES_DISPLAYED ? 'must-wrap' : ''}`}>
                    {languagesToDisplay.map(languageCode => (
                        <li key={languageCode}>
                            <button
                                type="button"
                                className={`language-btn ${languageCode === activeLanguage ? 'active' : ''}`}
                                disabled={languageCode === activeLanguage}
                                onClick={() => handleLanguageClick(languageCode)}
                            >
                                {languageNames[languageCode]}
                            </button>
                        </li>
                    ))}
                    <li className="more-btn-container">
                        {selectedLanguageCode.length > MAX_LANGUAGES_DISPLAYED && (
                            <button type="button" className="more-btn" onClick={handleToggleLanguages}>+</button>
                        )}
                    </li>
                </ul>
            </div>

            {response && (
                <FormResponse
                    isSucceed={response.isSuccess}
                    message={response.message}
                    onClose={closeResponse}
                />
            )}

            {/* Banned captions */}
            <div className='ban-captions'>
                {activeBanCaptions.length === 0 ? (
                    <p>
                        No banned captions for {languageNames[activeLanguage] ? languageNames[activeLanguage].toLowerCase() : 'loading...'}
                    </p>
                ) : (
                    <ul className="scroll-theme">
                        {activeBanCaptions.map(caption => (
                            <li key={caption.id}>
                                <button
                                    type="button"
                                    className="cross"
                                    onClick={(e) => removeBannedCaption(e, caption.id)}
                                    disabled={isLoadingRemove}
                                >X</button>
                                <p>{caption.text}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Form to add new banned captions */}
            <form>
                <input
                    ref={bannedCaptionInputRef}
                    className="theme-input"
                    type="text"
                    placeholder="Add your word(s) or sentence(s)..."
                />
                <button className="theme-btn" onClick={sendBannedCaption} type="submit">
                    <span>{isLoadingAdd ? 'Adding...' : 'Add'}</span>
                </button>
            </form>
        </>
    );
}

export default BannedCaptions;
