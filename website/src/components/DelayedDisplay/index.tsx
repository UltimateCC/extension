import React from "react";

interface DelayedDisplayProps {
    requestFn: () => Promise<void>;
    successMessage: string;
    errorMessage: string;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setResponse: React.Dispatch<
        React.SetStateAction<{ isSuccess: boolean; message: string } | null>
    >;
    setSuccessAction?: (responseApi: unknown | null) => void;
    needResponseApi?: boolean;
}

const MIN_DELAY = 150; // ms

function DelayedDisplay({
    requestFn,
    successMessage,
    errorMessage,
    setIsLoading,
    setResponse,
    setSuccessAction = () => { },
    needResponseApi = false,
}: DelayedDisplayProps) {
    const delayExecution = async (isSuccess: boolean, errorAditionalMessage: string | null, sucessContent: unknown | null) => {

        await new Promise((resolve) => setTimeout(resolve, MIN_DELAY));

        if (isSuccess) {
            setResponse({ isSuccess: true, message: successMessage });
            (needResponseApi) ? setSuccessAction(sucessContent) : setSuccessAction(null);
        } else {
            const newErrorMessage = errorMessage + errorAditionalMessage;
            setResponse({ isSuccess: false, message: newErrorMessage });
        }

        setIsLoading(false);

        return null;
    };

    requestFn()
        .then(async (response) => {
            const sucessContent = (needResponseApi) ? response : null;
            return delayExecution(true, null, sucessContent);
        })
        .catch((error) => {
            let errorAditionalMessage = "";
            
            if(error) {
                if(error.message && typeof error.message === 'string') {
                    errorAditionalMessage = " : " + error.message;
                } else if(error.error && error.error.message && typeof error.error.message === 'string') {
                    errorAditionalMessage = " : " + error.error.message;
                }
            }

            return delayExecution(false, errorAditionalMessage, null);
        });
    }

export default DelayedDisplay;
