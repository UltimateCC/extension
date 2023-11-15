import { useEffect, useRef } from 'react';
import GodImg from '../../assets/gegg.webp';

import '../../webroot/style/error.css';


function Error() {

    const audio = useRef<HTMLAudioElement>();

    useEffect(()=>{
        audio.current = new Audio();
        audio.current.src = "/gegg.mp3";
        audio.current.loop = true;
        audio.current.volume = 0.05;
        audio.current.load();
        
        return ()=>{
            if(audio.current) {
                audio.current.pause();
                audio.current.src = '';
            }
        }
    }, []);

    function playPause() {
        if(audio.current) {
            if(audio.current.paused) {
                audio.current.play();
            }else{
                audio.current.pause();
            }
        }
    }

    return (
        <section id="error" className="theme-box">
            <img src={GodImg} alt="Gegg is love, gegg is life" onClick={playPause} />
            <h2>Error 404</h2>
            <h4>Oops, page not found :/</h4>
        </section>
    );
}

export default Error;
