import { useState, useRef, useContext } from "react";
import loadingImg from '../../assets/loading.svg';

import Alert from "../Alert/index.tsx";

import { SocketContext } from '../../context/SocketContext.tsx';


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

    const { reloadConfig } = useContext(SocketContext);

    if(!configLoaded) {
        return (<img src={loadingImg} alt="loading" className="loading-img" />);
    }

    const closeResponse = () => {
        setResponse(null);
    };
    
    const addWord = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        closeResponse();
        
        const newWord = addWordInputRef.current?.value.toLowerCase();
        if (!newWord) return;

        if(banWords.length >= 100) {
            setResponse({ isSuccess: false, message: 'Max 100 words' });
            return;
        }

        const forbiddenCharacters = /[*+?^${}()|[\]\\]/;
        if(forbiddenCharacters.test(newWord)) {
            setResponse({ isSuccess: false, message: 'Forbidden characters' });
            return;
        }

        if(banWords.includes(newWord)) {
            setResponse({ isSuccess: false, message: 'This word is already banned' });
            return;
        }

        setAddWordIsLoading(true);
        updateConfig({banWords: [newWord, ...banWords]})
        .then(() => {
            reloadConfig();
        })
        .catch(err => {
            console.error('Error updating ban words', err);
            setResponse({ isSuccess: false, message: 'Error updating ban words' });
        })
        .finally(() => {
            setAddWordIsLoading(false);
        });
        addWordInputRef.current!.value = '';
    }

    const removeWord = (word: string) => {
        closeResponse();
        setRemoveWordIsLoading(true);
        const newBanWords = banWords.filter(w => w !== word.toLowerCase());
        updateConfig({banWords: newBanWords})
        .then(() => {
            reloadConfig();
        })
        .catch(err => {
            console.error('Error updating ban words', err);
            setResponse({ isSuccess: false, message: 'Error updating ban words' });
        })
        .finally(() => {
            setRemoveWordIsLoading(false);
        });
    }

    return (
        <div className="ban-words">
            <p className="ban-explication">Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero quam eveniet nihil ut numquam? Soluta et libero labore sequi nihil, quisquam, eaque officiis similique, tenetur eligendi doloremque nisi architecto itaque?</p>

            {response && (
                <Alert
                    type={(response.isSuccess) ? 'success' : 'error'}
                    message={response.message}
                    onClose={closeResponse}
                />
            )}

            <form className="input-word">
                <input ref={addWordInputRef} className="theme-input" type="text" placeholder="Add your word..." maxLength={50} />
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