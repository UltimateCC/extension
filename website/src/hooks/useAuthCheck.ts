import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";

/** Ensure user is connected, redirect to auth if not */
export function useAuthCheck() {
	const { user, refreshAuth, error, loading } = useContext(AuthContext);

	const authRefreshed = useRef<boolean>(false);
    useEffect(() => {
        if(!user?.connected) {
            // If not connected, redirect to auth url
            if(user?.url) {
                window.location.replace(user.url);

            // If url, try refreshing auth (only once to avoid loop)
            }else if(!loading && !authRefreshed.current) {
                authRefreshed.current = true;
                refreshAuth();
            }
        }
    }, [error, user, loading, refreshAuth]);
}
