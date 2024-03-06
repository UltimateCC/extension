import { useMemo } from "react";

interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    onClose?: () => void;
}

function Alert({ type, message, onClose }: AlertProps) {
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
        </div>
    )
}

export default Alert;