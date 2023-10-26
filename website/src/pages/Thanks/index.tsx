import ThanksCard from '../../components/ThanksCard';

import '../../webroot/style/thanks.css';

const thanksMain =  [
    ["207935292995403777", "For the original idea", "Aypierre", "https://cdn.discordapp.com/avatars/207935292995403777/c0a365f3ce2109b5f5b327b4ef182249?size=1024"],
    ["410774625820082176", "Front-end developer (site & extension)", "Sytorex", "https://cdn.discordapp.com/avatars/410774625820082176/8ea18d13ad66500c7348959e11287a7f?size=1024"],
    ["522390113536311328", "Front-end developer & design (site)", "Rem_x", "https://cdn.discordapp.com/avatars/522390113536311328/372618edece44c88de0027e909a1e12f?size=1024"],
    ["184375239843643394", "Back-end developer (site)", "Kranack", "https://cdn.discordapp.com/avatars/184375239843643394/861902e16660b0b0203142295ee74ef3?size=1024"],
    ["325353577281355798", "Designer (site & extension)", "Coco", "https://cdn.discordapp.com/avatars/325353577281355798/f833307ad0e2762e5b4a4f1a312074c0?size=1024"],
    ["110151716124520448", "Voice recording developer", "Theondrus", "https://cdn.discordapp.com/avatars/110151716124520448/427fafd2ee319fb2e6f732885ba50586?size=1024"],
    ["179672144131653642", "Voice recording developer", "Salutations Distinguées", "https://cdn.discordapp.com/avatars/179672144131653642/60baa9d4203c556e81a9d64ae5bc471b?size=1024"],
];

// Sort by username
thanksMain.sort((a, b) => {
    if (a[2] > b[2]) return 1;
    if (a[2] < b[2]) return -1;
    return 0;
});

const thanksOthers = [
    "Agape",
    "Maner",
    "Ouafax",
    "RacoonSama",
    "Random9",
    "Sirop_D_Or",
    "Xem"
];

function Thanks() {
    return (
        <section id="thanks">
            
            <h2 className="theme-box">Our thanks to :</h2>

            <div className="thanks-container theme-box">
                <ul className="main">
                    {thanksMain.map((member) => (
                        <li key={member[0]}>
                            <ThanksCard discordId={member[0]} role={member[1]} oldUsername={member[2]} oldAvatar={member[3]} />
                        </li>
                    ))}
                </ul>

                <h3>Others</h3>
                <p>
                    {thanksOthers.map((member) => (
                        <span key={member}>
                            {member}
                            {member !== thanksOthers[thanksOthers.length - 1] && ", "}
                        </span>
                    ))}
                </p>
                <p>And all the people who helped us</p>
            </div>

        </section>
    );
}

export default Thanks;
