import { useState, useRef } from "react";
import loadingImg from '../../assets/loading.svg';

import FormResponse from "../FormResponse";

interface BanWordsProps {
    banWords: string[]
    updateConfig: (config: {banWords: string[]}) => Promise<void>
    configLoaded: boolean
}

function BanWords({ banWords, updateConfig, configLoaded }: BanWordsProps) {
    const addWordInputRef = useRef<HTMLInputElement>(null);
    const [addWordIsLoading, setAddWordIsLoading] = useState<boolean>(false);
    const [removeWordIsLoading, setRemoveWordIsLoading] = useState<boolean>(false);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string; } | null>(null);

    if(!configLoaded) {
		return (<img src={loadingImg} alt="loading" className="loading-img" />);
	}
    
    const addWord = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        const newWord = addWordInputRef.current?.value;
        if (!newWord) return;

        if(banWords.includes(newWord)) {
            return setResponse({ isSuccess: false, message: 'This word is already banned' });
        }

        setAddWordIsLoading(true);
        updateConfig({banWords: [newWord, ...banWords]});
        addWordInputRef.current!.value = '';
        setAddWordIsLoading(false);
    }

    const removeWord = (word: string) => {
        setRemoveWordIsLoading(true);
        const newBanWords = banWords.filter(w => w !== word);
        updateConfig({banWords: newBanWords});
        setRemoveWordIsLoading(false);
    }

    const closeResponse = () => {
        setResponse(null);
    };  

    return (
        <div className="ban-words">
             {response && (
                <FormResponse
                    isSucceed={response.isSuccess}
                    message={response.message}
                    onClose={closeResponse}
                />
            )}

            <form className="input-word">
                <input ref={addWordInputRef} className="theme-input" type="text" placeholder="Add your word..." />
                <button className="theme-btn" onClick={addWord} disabled={addWordIsLoading} type="submit"><span>{addWordIsLoading ? 'Adding...' : 'Add'}</span></button>
            </form>

            <div className='ban-words-container'>
                {banWords.length === 0 ? (
                    <p>No banned words</p>
                ) : (
                    <ul className="scroll-theme">
                        {banWords.map(word => (
                            <li key={word}>
                                <button type="button" className="cross" onClick={() => removeWord(word)} disabled={removeWordIsLoading}>X</button>
                                <p className={removeWordIsLoading ? 'removing' : ''}>{word}</p>
                            </li>
                        ))}
                    </ul>
                )} 
            </div>
        </div>
    );
}

export default BanWords;