import GodImg from '../../assets/gegg.webp';

import '../../webroot/style/error.css';

function play() {
    const audio = document.getElementById("audio") as HTMLAudioElement;
    audio.src = "/gegg.mp3";
    audio.volume = 0.05;
    audio.play();
}

function Error() {
    return (
        <section id="error" className="theme-box">
            <img src={GodImg} alt="Gegg is love, gegg is life" onClick={play} />
            <audio id="audio" loop></audio>
            <h2>Error 404</h2>
            <h4>Oops, page not found :/</h4>
        </section>
    );
}

export default Error;
