import { useEffect, useState } from 'react';

import '../../webroot/style/thanks.css';
import api from '../../services/api';

// {"id":"26184492","name":"lege","displayName":"Lege","gameName":"Sid Meier's Civilization VI","title":"FFA ROAD TO DEITY - 19 CIVINTERNETPOINTS NEEDED","viewers":536,"thumbnailUrl":"https://static-cdn.jtvnw.net/previews-ttv/live_user_lege-640x360.jpg"}

interface LiveChannel {
    id: string
    name: string
    displayName: string
    viewers: number
    title: string
    gameName: string
    thumbnailUrl: string
    
    viewersText?: string
}

function FormatNumber(number: number, general: string, one: string, none: string) {
    if (number > 999999) {
        return `${(number / 1000000).toFixed(1)}M` + " " + general;
    } else if (number > 999) {
        return `${(number / 1000).toFixed(1)}K` + " " + general;
    } else if (number == 1) {
        return "One " + one;
    } else if (number == 0) {
        return "No one " + none;
    } else {
        return number.toString() + " " + general;
    }
}

function Channels() {

    const [liveChannels, setLiveChannels] = useState<LiveChannel[]>();
    const [streamerCount, setStreamerCount] = useState<string>("0");
    const [viewerCount, setViewerCount] = useState<string>("0");

    const apiContent = '{"id":"29020626","name":"ljoga","displayName":"LJoga","gameName":"I\'m Only Sleeping","title":"[NOITE 08] Acordo às 11h | !minecraft | Subathon do LJoga | !subathon !kabum !pix","viewers":30,"thumbnailUrl":"https://static-cdn.jtvnw.net/previews-ttv/live_user_ljoga-640x360.jpg"},{"id":"105713838","name":"kazmila","displayName":"Kazmila","gameName":"I\'m Only Sleeping","title":"[Dia 3] !Subathon marota de 10k - a mimir 💤 💤 💤  - !comandos","viewers":12,"thumbnailUrl":"https://static-cdn.jtvnw.net/previews-ttv/live_user_kazmila-640x360.jpg"},{"id":"448633424","name":"zaramoth1232","displayName":"ZaraMoth1232","gameName":"Just Chatting","title":"Poranna kawka? | !dc","viewers":7,"thumbnailUrl":"https://static-cdn.jtvnw.net/previews-ttv/live_user_zaramoth1232-640x360.jpg"},{"id":"86841499","name":"byegeek","displayName":"ByeGeek","gameName":"Minecraft","title":"Ouverture into 3h30h du matin |  Hourglass XI | !discord !hug !vote !bar","viewers":1,"thumbnailUrl":"https://static-cdn.jtvnw.net/previews-ttv/live_user_byegeek-640x360.jpg"},{"id":"129747833","name":"iciwali","displayName":"IciWali","gameName":"The Binding of Isaac: Afterbirth+","title":"Le meilleur jeu de tous les temps je ne veux rien entendre (Isaac AB+ 1001%) - !youtube","viewers":0,"thumbnailUrl":"https://static-cdn.jtvnw.net/previews-ttv/live_user_iciwali-640x360.jpg"}';

    useEffect(()=>{
        api('twitch/live')
            .then((res) => {
                setLiveChannels(res);
            }).catch(e=>console.error('Error fetching contributors', e));
    }, []);

    // Set live channels with apiContent because i'm in dev mode and i don't want to spam the api
    useEffect(()=>{
        setLiveChannels(JSON.parse(`[${apiContent}]`));
    }, []);

    // Edit viewers number to show K or M
    useEffect(()=>{
        if (liveChannels) {
            const newLiveChannels = liveChannels.map((channel) => {
                channel.viewersText = FormatNumber(channel.viewers, "people watching", "person watching", "watching :/");
                return channel;
            });
            setLiveChannels(newLiveChannels);
            setStreamerCount(newLiveChannels.length.toString() + " streamer" + (newLiveChannels.length > 1 ? "s" : ""));
            setViewerCount(FormatNumber(newLiveChannels.reduce((acc, channel) => acc + channel.viewers, 0), "viewers", "viewer", "viewer"));
        }
    }, [liveChannels]);

    return (
        <section id="channels">
            <div className="theme-box top">
                <h2>Live Channels</h2>
            </div>

            <div className="channels-container">
                <div className="live-info theme-box">
                    <div>
                        <h3>Live</h3>
                        <p>{streamerCount} currently using it</p>
                    </div>
                    <div>
                        <h3>Extension</h3>
                        <p>{viewerCount} currently using it</p>
                    </div>
                </div>
                <div className="live-channels">
                    {liveChannels?.map((channel) => (
                        <div className="card-container" key={ channel.id } style={{ backgroundImage: `url(${channel.thumbnailUrl})` }}>
                            <a href={`https://twitch.tv/${channel.name}`} target="_blank" rel="noreferrer">
                                <div className="card-top">
                                    <h4>{channel.displayName}</h4>
                                    <p>{channel.gameName}</p>
                                    <p className='stream-title'>{channel.title}</p>
                                </div>
                                <div className="card-bottom">
                                    <p>{channel.viewersText}</p>
                                    <p>French</p>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Channels;
