import { useEffect, useState } from 'react';
import ThanksCard from '../../components/ThanksCard';

import '../../webroot/style/channels.css';
import api from '../../services/api';

type ThanksData = {
    contributors: {
        discordId: string
        role: string
        name: string
        img: string
    }[],
    others: string[]
} 

function Thanks() {

    const [thanksData, setThanksData] = useState<ThanksData>();

    useEffect(()=>{
        api('thanks')
            .then((res) => {
                setThanksData(res);

            }).catch(e=>console.error('Error fetching contributors', e));
    }, []);

    return (
        <section id="thanks">
            <div className="theme-box top">
                <h2>Main contributors</h2>
            </div>

            <div className="thanks-container theme-box">
                <ul className="main">
                    {thanksData?.contributors.map((c) => (
                        <li key={ c.discordId }>
                            <ThanksCard role={c.role} username={c.name} img={c.img} />
                        </li>
                    ))}
                </ul>

                <p className="others">
                    {thanksData?.others.map((member) => (
                        <span key={member}>
                            {member}
                            {member !== thanksData.others[thanksData.others.length - 1] && ", "}
                        </span>
                    ))}
                </p>
                <p>Thanks to everyone who helped us !</p>
                <p>Thanks to <b>aypierre</b> and <b>Vartac</b> for the first tests in real conditions !</p>
            </div>
        </section>
    );
}

export default Thanks;
