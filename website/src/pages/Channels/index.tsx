import { useEffect, useState } from 'react';

import '../../webroot/style/thanks.css';
import api from '../../services/api';
import { langList } from '../../services/langs';

interface LiveChannel {
    id: string
    name: string
    displayName: string
    viewers: number
    title: string
    gameName: string
    thumbnailUrl: string
	spokenLang: string
	translation: boolean
    viewersText?: string
}

function formatNumber(number: number, general: string, one: string, none: string) {
    if (number > 999999) {
        return `${(number / 1000000).toFixed(3)}M ` + general;
    } else if (number > 999) {
        return `${(number / 1000).toFixed(1)}k ` + general;
    } else if (number == 1) {
        return "1 " + one;
    } else if (number == 0) {
        return "0 " + none;
    } else {
        return number.toString() + " " + general;
    }
}

function Channels() {

    const [liveChannels, setLiveChannels] = useState<LiveChannel[]>();
    const [streamerCount, setStreamerCount] = useState<string>("0");
    const [viewerCount, setViewerCount] = useState<string>("0");

    useEffect(()=>{
        api('twitch/live')
            .then((res: LiveChannel[]) => {
                if (res) {
                    // Edit viewers number to show K or M
                    const newLiveChannels = res.map((channel) => {
                        channel.viewersText = formatNumber(channel.viewers, "people watching", "person watching", "watching :/");
                        channel.spokenLang = langList[channel.spokenLang] ?? '';
                        return channel;
                    });
                    setLiveChannels(newLiveChannels);
                    setStreamerCount(newLiveChannels.length.toString() + " channel" + (newLiveChannels.length > 1 ? "s" : ""));
                    setViewerCount(formatNumber(newLiveChannels.reduce((acc, channel) => acc + channel.viewers, 0), "viewers", "viewer", "viewer"));
                }

                setLiveChannels(res);
            }).catch(e=>console.error('Error fetching live channels', e));
    }, []);

    return (
        <section id="channels">
            <div className="theme-box top">
                <h2>Live Channels</h2>
            </div>

            { Array.isArray(liveChannels) && (
                <div className="channels-container">
                    <div className="live-info theme-box">
                        <div>
                            { liveChannels.length ? (
                                <p>{streamerCount} currently live with a total of {viewerCount}</p>
                            ): (
                                <p>Nobody currently live :/</p>
                            ) }
                        </div>
                    </div>
                    <div className="live-channels">
                        {liveChannels?.map((channel) => (
                            <div className="card-container" key={ channel.id } style={{ backgroundImage: `url(${channel.thumbnailUrl})` }}>
                                <a href={`https://twitch.tv/${channel.name}`} target="_blank" rel="noreferrer">
                                    <div className="card-top">
                                        <div className="card-first-line">
                                            <h4>{channel.displayName}</h4>
                                            <div className="spoken-language">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -960 960 960">
                                                    <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/>
                                                </svg>
                                                <p>{channel.spokenLang}</p>
                                            </div>
                                        </div>
                                        <p>{channel.gameName}</p>
                                        <p className='stream-title'>{channel.title}</p>
                                    </div>
                                    <div className="card-bottom">
                                        <p>{channel.viewersText}</p>
                                        {channel.translation && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -960 960 960">
                                                    <path d="m476-80 182-480h84L924-80h-84l-43-122H603L560-80h-84ZM160-200l-56-56 202-202q-35-35-63.5-80T190-640h84q20 39 40 68t48 58q33-33 68.5-92.5T484-720H40v-80h280v-80h80v80h280v80H564q-21 72-63 148t-83 116l96 98-30 82-122-125-202 201Zm468-72h144l-72-204-72 204Z"/>
                                                </svg>
                                            )}
                                            
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>                
            ) }


        </section>
    );
}

export default Channels;
