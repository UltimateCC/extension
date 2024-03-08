import { useMemo, useState, useEffect } from "react";

import Icons from "../Icons";

interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    onClose?: () => void;
    reload?: {runReload: () => void, stopReloading: boolean};
}

function Alert({ type, message, onClose, reload }: AlertProps) {
    const [reloading, setReloading] = useState(false);
    
    const title = useMemo(() => {
        switch (type) {
            case 'success':
                return 'Success !';
            case 'error':
                return 'Error !';
            case 'warning':
                return 'Warning :';
            case 'info':
                return 'Info :';
        }
    }, [type]);

    const launchReload = () => {
        setReloading(true);
        reload?.runReload();
    }

    useEffect(() => {
        if(reload?.stopReloading) setReloading(false);
    }, [reload?.stopReloading]);

    return (
        <div className={`form-response ${type}`}>
            <p><strong>{title}</strong>{message}</p>
            { onClose && (  
                <button className='close' onClick={onClose}>&times;</button>
            )}
            { reload && (  
                <button className='reset-btn' onClick={launchReload}><Icons name={reloading ? 'loading' : 'refresh'} /></button>
            )}
        </div>
    )
}

export default Alert;