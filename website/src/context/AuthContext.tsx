
import React, {
    createContext,
    ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface SessionData {
    connected?: boolean
    /** Twitch user id */
    userid?: string
    /** Twitch login */
    login?: string
    /** Image */
    img?: string
    /** Auth url */
    url?: string
}

interface AuthContextType {
    user?: SessionData
    loading: boolean
    error?: boolean
    login: (code: string) => void
    refreshAuth: () => void
    logout: () => void
}

export const AuthContext = createContext<AuthContextType>(
    {} as AuthContextType
);

export function AuthProvider({ children }: { children: ReactNode; }): React.JSX.Element {
    const [user, setUser] = useState<SessionData>({});
    const [error, setError] = useState<boolean>();
    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();

    const memoedValue = useMemo( () => {
        function refreshAuth() {
            setLoading(true);
            api('auth')
                .then((data) => setUser(data))
                .catch(() => setError(true))
                .finally(() => setLoading(false));
        }

        return {
                user,
                loading,
                error,
                refreshAuth,
                login: function login(code: string) {
                    setLoading(true);
                    api('auth', {method: 'POST', body: {code}})
                        .then((data) => {
                            setUser(data);
                            setError(false);
                            navigate('/dashboard', { replace: true } );
                        })
                        .catch(() => setError(true))
                        .finally(() => setLoading(false));
                }, 
                logout: function logout() {
                    api('auth', { method: 'DELETE' })
                        .then(() => {
                            refreshAuth();
                            setError(false);
                            navigate('/', { replace: true } );
                        })
                        .catch(() => setError(true));
                },
            }
        },
        [user, loading, error, navigate]
    );

    // Check if there is a currently active session when mounted
    useEffect(() => {
        memoedValue.refreshAuth();
    }, [memoedValue]);


    return (
        <AuthContext.Provider value={memoedValue}>
            { children }
        </AuthContext.Provider>
    );
}
