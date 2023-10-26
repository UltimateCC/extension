import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function PageTitle() {
    const location = useLocation();

    useEffect(() => {
        document.title = `Ultimate Closed Caption - ${getPageTitle(location.pathname)}`;
    }, [location]);

    const getPageTitle = (path: string) => {
        switch (path) {
            case '/':
                return 'Home';
            case '/dashboard':
                return 'Dashboard';
            default:
                return 'Error';
        }
    };

    return null;
}

export default PageTitle;