import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from "../../context/AuthContext";

// Redirect url from twitch
function Verify() {
    const { login, error, user } = useContext(AuthContext);
    const ran = useRef<boolean>(false);

    useEffect(()=>{
        // Avoid running twice
        if(!ran.current) {
            ran.current = true;
            // Get code from url
            const code = new URLSearchParams(location.search).get('code');
            if(code) {
                login(code);
            }
        }
    }, [login]);
    
    return (
        <section id="error" className="theme-box padtop">
            <h2>{ error ? 'Error' : 'Redirecting' }</h2>
            { error && (
                <>
                    <p>
                        Error connecting with Twitch
                    </p>
                    { user?.url && (
                        <p><a href={user?.url}>Try again</a></p>
                    ) }
                </>
            ) }
        </section>
    );
}

export default Verify;