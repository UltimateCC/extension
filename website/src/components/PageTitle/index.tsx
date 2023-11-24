import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function PageTitle() {
    const location = useLocation();

    useEffect(() => {
        document.title = `Ultimate Closed Captions - ${getPageTitle(location.pathname)}`;
    }, [location]);

    const getPageTitle = (path: string) => {
        switch (path) {
            case '/':
                return 'Home';
            case '/dashboard':
                return 'Dashboard';
            case '/verify':
                return 'Login';
            case '/logout':
                return 'Logout';
            case '/thanks':
                return 'Thanks';
            case '/privacy':
                return 'Privacy policy';
            default:
                return 'Error';
        }
    };

    return null;
}

export default PageTitle;