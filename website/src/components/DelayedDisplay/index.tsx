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
    apiRequest?: () => Promise<void>;
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
    apiRequest = undefined,
    needResponseApi = false,
}: DelayedDisplayProps) {
    const delayExecution = async (isSuccess: boolean, errorAditionalMessage: string | null, sucessContent: unknown | null) => {
        const startTime = Date.now();
        await new Promise((resolve) =>
            setTimeout(resolve, Math.max(0, MIN_DELAY - (Date.now() - startTime)))
        );

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
            if (apiRequest !== undefined) await apiRequest();
            const sucessContent = (needResponseApi) ? response : null;
            return delayExecution(true, null, sucessContent);
        })
        .catch((error) => {
            let errorAditionalMessage = "";
            
            if(error) {
                if(error.message) {
                    errorAditionalMessage = " : " + error.message;
                } else if(error.error && error.error.message) {
                    errorAditionalMessage = " : " + error.error.message;
                }
            }

            return delayExecution(false, errorAditionalMessage, null);
        });
    }

export default DelayedDisplay;
