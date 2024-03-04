import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";

/** Ensure user is connected, redirect to auth if not */
export function useAuthCheck() {
	const { user, refreshAuth, error, loading } = useContext(AuthContext);

	const authRefreshed = useRef<boolean>(false);
    useEffect(() => {
        // Refresh auth when loading page (only once to avoid loop)
        if(!loading && !authRefreshed.current) {
            authRefreshed.current = true;
            refreshAuth();
        }

        // If not connected, and url loaded, redirect to it
        if(!loading && !user?.connected && user?.url) {
            window.location.replace(user.url);
        }
    }, [error, user, loading, refreshAuth]);
}
