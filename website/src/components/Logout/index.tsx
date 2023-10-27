import { useContext, useEffect, useRef } from 'react';

import { AuthContext } from '../../context/AuthContext';

function Logout() {
    const { logout } = useContext(AuthContext);
    const ran = useRef<boolean>(false);

    useEffect(() => {
        if(!ran.current) {
            ran.current = true;
            logout();
        }
    }, []);

    return null; 
}

export default Logout;