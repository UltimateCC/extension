import { Link } from 'react-router-dom'

import '../../webroot/style/footer.css'

function Footer() {
    return (
        <footer>
            <h6>Made with ❤️ by the <Link to="/thank-you">aypierre community</Link></h6>
        </footer>
    )
}

export default Footer