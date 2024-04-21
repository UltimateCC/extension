import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from "../../context/AuthContext";

// Redirect url from twitch
function Verify() {
    const { login, authWithTwitch, error } = useContext(AuthContext);
    const ran = useRef<boolean>(false);

    useEffect(()=>{
        // Avoid running twice
        if(!ran.current) {
            ran.current = true;
            login();
        }
    }, [login]);
    
    return (
        <section id="error" className={`theme-box${error ?'':' padtop'}`}>
            <h2>{ error ? 'Error' : 'Redirecting' }</h2>
            { error && (
                <>
                    <p>
                        Error connecting with Twitch
                    </p>
                    <button className='theme-btn' onClick={authWithTwitch}>
                        <span>Try again</span>
                    </button>
                </>
            ) }
        </section>
    );
}

export default Verify;