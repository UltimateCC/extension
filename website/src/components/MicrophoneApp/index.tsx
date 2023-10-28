

interface MicrophoneAppProps {

}

function MicrophoneApp({}: MicrophoneAppProps) {

    const isListening = false;

    const stopListening = () => {

    };

    const startListening = () => {
        
    };

    const toggleListening = () => {
        isListening ? stopListening() : startListening();
    };

    return (
        <div>
            <div className="setting-options">
                <button className={`theme-btn listening ${isListening ? 'start' : ''}`} onClick={toggleListening}>
                    <span>{isListening ? 'Stop listening' : 'Start listening'}</span>
                </button>
            </div>
            <div>Detected text</div>
        </div>
    );
}

export default MicrophoneApp;
