import { useEffect, useState } from 'react';
import ThanksCard from '../../components/ThanksCard';

import '../../webroot/style/thanks.css';
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
            
            <h2 className="theme-box">Our thanks to :</h2>

            <div className="thanks-container theme-box">
                <ul className="main">
                    {thanksData?.contributors.map((c) => (
                        <li key={ c.discordId }>
                            <ThanksCard role={c.role} username={c.name} img={c.img} />
                        </li>
                    ))}
                </ul>

                <h3>Others</h3>
                <p>
                    {thanksData?.others.map((member) => (
                        <span key={member}>
                            {member}
                            {member !== thanksData.others[thanksData.others.length - 1] && ", "}
                        </span>
                    ))}
                </p>
                <p>And all the people who helped us</p>
            </div>
        </section>
    );
}

export default Thanks;
