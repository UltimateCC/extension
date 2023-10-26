import AboutHeader from '../../components/AboutHeader';
import AboutDescription from '../../components/AboutDescription';

import TranslationDescImg from '../../assets/translation.png';
import FlexibilityDescImg from '../../assets/flexibility.jpg';
import InterfaceDescImg from '../../assets/interface.png';

import '../../webroot/style/home.css';

function Home() {
    return (
        <section id='home'>
            <div className='header-title'>
                <h2>A tool designed to integrate <strong>real-time translation</strong> directly into live video streams</h2>
            </div>
            <div className='start-extension'>
                <h4>Ready to use it ? </h4>
                <button className='theme-btn'><span>CLICK HERE to START!</span></button>
            </div>
            <div className='about-header-container'>
                <AboutHeader emoji="⚡" title="Instant translation" id="translation" />
                <AboutHeader emoji="💪" title="Linguistic flexibility" id="flexibility" />
                <AboutHeader emoji="🤝" title="User-friendly interface" id="interface" />
            </div>
            <div className='about-extension-container'>
                <AboutDescription src={TranslationDescImg} title="Instant translation" isRight={false} id="translation">
                    The plugin offers instant translation of audio content in real time. When a content creator speaks in a specific language, the plugin can automatically translate his or her speech into the language selected by the viewer, enabling the latter to understand the content without additional effort.
                </AboutDescription>
                <AboutDescription src={FlexibilityDescImg} title="Linguistic flexibility" isRight={true} id="flexibility">
                    The plugin supports a wide range of languages, offering viewers the possibility of choosing from several translation options. This makes it possible to reach audiences in different countries and regions of the world, increasing content accessibility and engagement.
                </AboutDescription>
                <AboutDescription src={InterfaceDescImg} title="User-friendly interface" isRight={false} id="interface">
                    The plugin is easy to use, both for the content creator and the viewer. Creators can easily integrate this feature into their live broadcasts, while viewers can choose their preferred language from an intuitive interface.
                </AboutDescription>
            </div>
        </section>
    );
}

export default Home;
