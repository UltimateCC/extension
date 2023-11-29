interface FormResponseProps {
    isSucceed: boolean;
    message: string;
    onClose: () => void;
}

function FormResponse({ isSucceed, message, onClose }: FormResponseProps) {
    
    return (
        <div className={`form-response ${isSucceed ? 'success' : 'error'}`}>
            <p><strong>{isSucceed ? 'Success !' : 'Error !'}</strong>{message}</p>
            { onClose && (  
                <button className='close' onClick={onClose}>&times;</button>
            )}
        </div>
    )
}

export default FormResponse;