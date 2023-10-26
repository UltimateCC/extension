import { useLocation } from 'react-router-dom';

import Footer from '../Footer';

function AppFooter() {
    const location = useLocation();
    if (location.pathname !== '/dashboard') return <Footer />;
    return null;
}

export default AppFooter;