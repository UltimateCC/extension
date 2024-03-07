import '../../webroot/style/kofi.css';
import { config } from '../../config';

function Kofi() {
    return (
        <div className="btn-container">
            <a title="Support us on ko-fi.com" className="kofi-button" href={config.kofi} target="_blank">
                <span className="kofitext">
                    <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Ko-fi donations" className="kofiimg" /> Support us !
                </span>
            </a>
        </div>
    );
}

export default Kofi;