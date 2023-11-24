import AboutHeader from '../../components/AboutHeader';
import AboutDescription from '../../components/AboutDescription';

import TranslationDescImg from '../../assets/translation.png';
import FlexibilityDescImg from '../../assets/flexibility.jpg';
import InterfaceDescImg from '../../assets/interface.png';

import '../../webroot/style/home.css';

import { NavLink } from 'react-router-dom';

function Home() {
    return (
        <section id='home'>
            <div className='header-title'>
                <h2>A tool designed to integrate <strong>real-time translation</strong> to your Twitch streams</h2>
            </div>
            <div className='start-extension'>
                <h4>Ready to use it ? </h4>
                <NavLink to="/dashboard">
                    <button className='theme-btn'><span>CLICK HERE to START!</span></button>
                </NavLink>
            </div>
            <div className='about-header-container'>
                <AboutHeader emoji="⚡" title="Instant translation" id="translation" />
                <AboutHeader emoji="💪" title="Linguistic flexibility" id="flexibility" />
                <AboutHeader emoji="🤝" title="User-friendly interface" id="interface" />
            </div>
            <div className='about-extension-container'>
                <AboutDescription src={TranslationDescImg} title="Instant translation" isRight={false} id="translation">
                    Add real-time translation to your live streams.
                    Your speech can be translated to any language selected by viewers,
                    allowing them to understand your content without additional effort.
                </AboutDescription>
                <AboutDescription src={FlexibilityDescImg} title="Linguistic flexibility" isRight={true} id="flexibility">
                    Your viewers will be able to view translation for any language you choose.
                    This makes it possible to reach audiences in different countries and regions of the world,
                    increasing content accessibility and engagement.
                </AboutDescription>
                <AboutDescription src={InterfaceDescImg} title="User-friendly interface" isRight={false} id="interface">
                    The plugin is easy to use, both for the content creator and the viewer.
                    Creators can easily integrate this feature into their live broadcasts,
                    while viewers can choose their preferred language from an intuitive interface.
                </AboutDescription>
            </div>
        </section>
    );
}

export default Home;
