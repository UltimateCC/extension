import { useEffect, useState } from 'react';

import '../../webroot/style/thanks.css';
import api from '../../services/api';
import { langList } from '../../services/langs';
import Icons from '../../components/Icons';

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
                                            <div className="streamer-name">
                                                <h4>{channel.displayName}</h4>
                                            </div>
                                            <div className="spoken-language">
                                                <Icons name="mic" />
                                                <p>{channel.spokenLang}</p>
                                            </div>
                                        </div>
                                        <p>{channel.gameName}</p>
                                        <p className='stream-title'>{channel.title}</p>
                                    </div>
                                    <div className="card-bottom">
                                        <p>{channel.viewersText}</p>
                                        {channel.translation && <Icons name="translate" />}
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
