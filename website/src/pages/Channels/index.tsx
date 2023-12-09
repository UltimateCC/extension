import { useEffect, useState } from 'react';

import '../../webroot/style/thanks.css';
import api from '../../services/api';

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

    useEffect(()=>{
        api('twitch/live')
            .then((res) => {
                setLiveChannels(res);
            }).catch(e=>console.error('Error fetching contributors', e));
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
                        <p>{streamerCount} channels currently live</p>
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
