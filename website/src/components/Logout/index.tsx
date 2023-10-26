import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        api('auth/logout', { method: 'POST' })
            .then(() => navigate('/')) // Redirect to home page
            .catch(error => {
                console.error('Logout error:', error);
                navigate('/');
            });
    }, [navigate]);

    return null; 
}

export default Logout;