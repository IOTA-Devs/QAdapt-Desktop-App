import { APIError, ErrorCodes, UserData } from "@/models/types";
import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { APIProtected, APIUnprotected } from "@/config/axiosConfig";
import axios from "axios";

interface SessionContextType {
    userData: UserData | null,
    loggedIn: boolean
    login: (username: string, password: string) => Promise<{ userData: UserData | null, error: APIError | null }>
    signup: (username: string, email: string, password: string) => Promise<{ userData: UserData | null, error: APIError | null }>
    logout: () => void
    updateUserData: () => Promise<{ userData: UserData | null, error: APIError | null }>
}

const SessionContext = createContext<SessionContextType>({
    userData: null,
    loggedIn: false,
    login: async () => ({ userData: null, error: null }),
    signup: async () => ({ userData: null, error: null }),
    logout: () => {},
    updateUserData: async () => ({ userData: null, error: null })
});

export default function SessionProvider({ children }: { children: React.ReactNode }) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(true);
    const firstRender = useRef<boolean>(true);

    useEffect(() => {
        let storedUserData = localStorage.getItem('userData') as UserData | null;

        if (storedUserData) {
            setUserData(storedUserData);
        } else {
            setLoggedIn(false);
        }
    }, []);

    useEffect(() => {
        if (!firstRender.current || !userData) return;
        firstRender.current = false;

        APIProtected.get('api/users/me').then((response) => {
            const userData = {
                userId: response.data.id,
                username: response.data.username
            };
            setUserData(userData);
            setLoggedIn(true);
        }).catch(() => {
            localStorage.clear();
        });
    }, [userData]);

    const login = async (username: string, password: string) => {
        try {
            const response = await APIUnprotected.post('auth/login', {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const userData = {
                userId: response.data.user.user_id,
                username: response.data.user.username
            };
            setUserData(userData);
            setLoggedIn(true);
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('r_t', response.data.refresh_token);
            localStorage.setItem('s_id', response.data.session_id);

            return { userData, error: null };
        } catch (err) {
            if (axios.isAxiosError(err)) {
                return { userData: null, error: { message: err.response?.data.detail.message, code: err.response?.data.detail.code } as APIError };
            }
            return { userData: null, error: { message: "Failed to login. Please try again", code: ErrorCodes.AUTHENTICATION_ERROR } as APIError };
        }
    }

    const signup = async (username: string, email: string, password: string) => {
        try {
            const response = await APIUnprotected.post('auth/signup', {
                username,
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const userData = {
                userId: response.data.user.user_id,
                username: response.data.user.username
            };
            setUserData(userData);
            setLoggedIn(true);
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('r_t', response.data.refresh_token);
            localStorage.setItem('s_id', response.data.session_id);

            return { userData, error: null };
        } catch (err) {
            if (axios.isAxiosError(err)) {
                return { userData: null, error: { message: err.response?.data.detail.message, code: err.response?.data.detail.code } as APIError };
            }
            return { userData: null, error: { message: "Failed account creation. Please try again later.", code: ErrorCodes.AUTHENTICATION_ERROR } as APIError };
        }
    }

    const logout = () => {
        setUserData(null);
        setLoggedIn(false);
        localStorage.clear();

        APIProtected.post('/auth/logout');
        window.location.href = "/login";
    }

    const updateUserData = async () => {
        try {
            const response = await APIProtected.get('api/users/me');
            const userData: UserData = {
                userId: response.data.user_id,
                username: response.data.susername
            };

            localStorage.setItem('userData', JSON.stringify(userData));
            setUserData(userData);

            return { userData: userData, error: null };
        } catch (err) {
            localStorage.clear();
            setUserData(null);
            setLoggedIn(false);

            window.location.href = "/login";
            if (axios.isAxiosError(err)) {
                return { userData: null, error: err.response ? err.response.data.detail : "Failed to update user data." };
            }
            return { userData: null, error: "Failed to update user data." };
        }
    }

    const contextValue = useMemo(() => ({
        userData,
        loggedIn,
        login,
        signup,
        logout,
        updateUserData
    }), [userData, loggedIn]);

    return (
        <SessionContext.Provider value={contextValue}>
            {children}
        </SessionContext.Provider>
    );
}

export {
    SessionContext
}