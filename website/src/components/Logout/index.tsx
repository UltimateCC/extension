import { useContext, useEffect, useRef } from 'react';

import { AuthContext } from '../../context/AuthContext';

function Logout() {
    const { logout } = useContext(AuthContext);
    const alreadyRan = useRef<boolean>(false);

    useEffect(() => {
        if(!alreadyRan.current) {
            alreadyRan.current = true;
            logout();
        }
    }, [ logout ]);

    return null; 
}

export default Logout;