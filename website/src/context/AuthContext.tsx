import {
    createContext,
    ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import SuperTokens from 'supertokens-web-js';
import Session from 'supertokens-web-js/recipe/session';
import ThirdParty, { getAuthorisationURLWithQueryParamsAndSetState, signInAndUp, signOut } from 'supertokens-web-js/recipe/thirdparty'
import api from "../services/api";

interface SessionData {
    connected?: boolean
    displayName?: string
    twitchId?: string
    img?: string
}

interface AuthContextType {
    user?: SessionData
    loading: boolean
    error?: boolean
    authWithTwitch: () => Promise<void>
    login: () => void
    refreshAuth: () => void
    logout: () => void
}

SuperTokens.init({
    appInfo: {
        appName: "UltimateCC",
        apiDomain: location.origin,
        apiBasePath: "/api/auth",
    },
    recipeList: [
        ThirdParty.init(),
        Session.init()
    ]
});

export const AuthContext = createContext<AuthContextType>(
    {} as AuthContextType
);

export function AuthProvider({ children }: { children: ReactNode; }) {
    const [user, setUser] = useState<SessionData>({});
    const [error, setError] = useState<boolean>();
    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();

    async function authWithTwitch() {
        try {
            const url = await getAuthorisationURLWithQueryParamsAndSetState({
                thirdPartyId: "twitch",
                frontendRedirectURI: `${location.origin}/verify`,
            });
            window.location.replace(url);            
        }catch(e) {
            console.error('Twitch auth error');
        }
    }

    function refreshAuth() {
        setLoading(true);
        setError(false);
        return new Promise<void>((res) => {
            api('me')
                .then((data) => {
                    setUser(data);
                })
                .catch(() => setError(true))
                .finally(() => {
                    setLoading(false);
                    res();
                });
        });
    }

    const memoedValue = useMemo(
        () => {
            return {
                user,
                loading,
                error,
                refreshAuth,
                authWithTwitch,
                login() {
                    setLoading(true);
                    signInAndUp()
                        .then((data)=>{
                            if(data.status === 'OK') {
                                return refreshAuth();
                            }else{
                                setError(true);
                                throw new Error('Error refreshing auth');
                            }
                        })
                        .then(()=> { navigate('/dashboard', { replace: true } ); })
                        .catch(() => setError(true))
                        .finally(() => setLoading(false));
                },
                logout() {
                    signOut()
                        .then(()=>{
                            return refreshAuth();
                        })
                        .then(() => {
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
        refreshAuth();
    }, []);

    return (
        <AuthContext.Provider value={memoedValue}>
            { children }
        </AuthContext.Provider>
    );
}
