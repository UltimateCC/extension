import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";

/** Ensure user is connected, redirect to auth if not */
export function useAuthCheck() {
	const { user, refreshAuth, authWithTwitch, error, loading } = useContext(AuthContext);
	const authRefreshed = useRef<boolean>(false);

    useEffect(() => {
        // Refresh auth status when loaded (only once to avoid loop)
        if(!loading && !authRefreshed.current) {
            authRefreshed.current = true;
            refreshAuth();
        }

        // If not connected, redirect to twitch auth
        if(!loading && !user?.connected) {
            authWithTwitch();
        }

    }, [error, user, loading, refreshAuth, authWithTwitch]);
}
