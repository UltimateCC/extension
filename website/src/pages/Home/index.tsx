import AboutHeader from '../../components/AboutHeader';
import AboutDescription from '../../components/AboutDescription';

import TranslationDescImg from '../../assets/translation.png';
import AccessibilityDescImg from '../../assets/accessibility.png';
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
                <h4>Ready to use it&nbsp;?</h4>
                <NavLink to="/dashboard">
                    <button className='theme-btn'><span>CLICK HERE to START!</span></button>
                </NavLink>
            </div>
            <div className='about-header-container'>
                <AboutHeader emoji="💪" title="Accessibility" id="accessibility" />
                <AboutHeader emoji="⚡" title="Instant translation" id="translation" />
                <AboutHeader emoji="🤝" title="User-friendly interface" id="interface" />
            </div>
            <div className='about-extension-container'>
                <AboutDescription src={AccessibilityDescImg} title="Accessibility" isRight={false} id="accessibility">
                    Add closed captions to your streams generated in real-time, making your streams more accessible to viewers unable to hear correctly.
                </AboutDescription>
                <AboutDescription src={TranslationDescImg} title="Instant translation" isRight={true} id="translation">
                    Add real-time translation to your live streams.
                    Your speech can be translated to any language selected by viewers,
                    allowing them to understand your content without additional effort.
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
