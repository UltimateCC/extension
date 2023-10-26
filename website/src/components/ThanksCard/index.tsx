import { useState, useEffect } from 'react';

import api from '../../services/api';

import LoadingImg from '../../assets/loading.svg';

interface ThanksCardProps {
    discordId: string;
    role: string;
    oldUsername: string;
    oldAvatar: string;
}

function ThanksCard({ discordId, role, oldUsername, oldAvatar }: ThanksCardProps) {

    const [username, setUsername] = useState<string>('loading...');
    const [avatar, setAvatar] = useState<string>(LoadingImg);

    useEffect(() => {
        api('discord/infos/' + discordId)
            .then(response => {
                setUsername(response.data.global_name);
                setAvatar(response.data.avatar);
            })
            .catch(() => {
                setUsername(oldUsername);
                setAvatar(oldAvatar);
            })
    }, [discordId, oldUsername, oldAvatar]);

    return (
        <div className="thanks-card">
            <img src={avatar} alt={username + "'s avatar"} />
            <h4>{username}</h4>
            <p>{role}</p>
        </div>
    );
}

export default ThanksCard;