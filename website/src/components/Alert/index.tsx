import { useMemo } from "react";

import Icons from "../Icons";

interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    onClose?: () => void;
    onReload?: () => void;
}

function Alert({ type, message, onClose, onReload }: AlertProps) {
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

    return (
        <div className={`form-response ${type}`}>
            <p><strong>{title}</strong>{message}</p>
            { onClose && (  
                <button className='close' onClick={onClose}>&times;</button>
            )}
            { onReload && (  
                <button className='reset-btn' onClick={onReload}><Icons name='refresh' /></button>
            )}
        </div>
    )
}

export default Alert;