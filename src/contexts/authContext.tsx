import { APIError, ErrorCodes, UserData } from "@/types/types";
import { deleteFromLocalStorage } from "@/util/util.helper";
import { createContext, useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

interface AuthContextType {
    loggedIn: boolean
    userData: UserData | null
    login: (username: string, password: string) => Promise<{ userData: UserData | null, error: APIError | null }>
    signup: (username: string, email: string, password: string) => Promise<{ userData: UserData | null, error: APIError | null }>
    logout: () => void
    updateUserData: () => Promise<{ userData: UserData | null, error: APIError | null }>
	APIProtected: AxiosInstance
	APIUnprotected: AxiosInstance
}

interface RequestQueueObj {
    resolve: (value: InternalAxiosRequestConfig<any> | PromiseLike<InternalAxiosRequestConfig<any>>) => void
    reject: (reason?: any) => void
    config: InternalAxiosRequestConfig<any>
}

interface AuthData {
    accessToken: string
    tokenExpiresIn: number
    tokenSetAt: number
}

const AuthContext = createContext<AuthContextType>({
    loggedIn: false,
    userData: null,
    login: async () => ({ userData: null, error: null }),
    signup: async () => ({ userData: null, error: null }),
    logout: () => {},
    updateUserData: async () => ({ userData: null, error: null }),
	APIProtected: axios.create(),
	APIUnprotected: axios.create()
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(true);
    const firstRender = useRef<boolean>(true);
    const authData = useRef<AuthData | null>(null);
    
    const requestQueue: RequestQueueObj[] = [];
    let isRefreshing: boolean = false;

    const APIProtected = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const APIUnprotected = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL
    });

    APIProtected.interceptors.request.use(async (config) => {
        const now = Date.now();
        

        if (!authData.current || authData.current.tokenSetAt * 1000 + authData.current.tokenExpiresIn <= now) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    requestQueue.push({ resolve, reject, config });
                });           
            }
    
            try {
                isRefreshing = true;
                const refreshToken = localStorage.getItem('r_t');
                const sessionId = localStorage.getItem('s_id');
                if (!refreshToken || !sessionId) {
                    isRefreshing = false;
                    return config;
                };
    
                const response = await APIUnprotected.post('/auth/token', {
                    refresh_token: refreshToken,
                    session_id: sessionId
                }, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
    
                authData.current = {
                    accessToken: response.data.access_token,
                    tokenExpiresIn: response.data.expires_in,
                    tokenSetAt: Date.now()
                };
    
                localStorage.setItem('r_t', response.data.refresh_token);
                isRefreshing = false;
                processQueue();
            } catch (err) {
                isRefreshing = false;
                processQueue(err);
                window.location.href = "/login";
                return Promise.reject(err);
            }
        }
    
        config.headers.Authorization = `Bearer ${authData.current.accessToken}`;
        return config;
    }, (err) => {
        return Promise.reject(err);
    });

    const processQueue = (error: any = null) => {
        for (let request of requestQueue) {
            if (error) {
                return request.reject(error);   
            }
    
            if (authData.current) request.config.headers.Authorization = `Bearer ${authData.current.accessToken}`;
            return request.resolve(request.config);
        }
    }

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
                username: response.data.username,
                fullName: response.data.full_name,
                email: response.data.email
            };
            localStorage.setItem('userData', JSON.stringify(userData));
            setUserData(userData);
            setLoggedIn(true);
        }).catch(() => {
            deleteFromLocalStorage('userData', 'r_t', 's_id');
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
                username: response.data.user.username,
                fullName: response.data.user.full_name,
                email: response.data.user.email
            };
            setUserData(userData);
            setLoggedIn(true);

            authData.current = {
                accessToken: response.data.access_token,
                tokenExpiresIn: response.data.expires_in,
                tokenSetAt: Date.now()
            };
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('r_t', response.data.refresh_token);
            localStorage.setItem('s_id', response.data.session_id);

            return { userData, error: null };
        } catch (err) {
            if (axios.isAxiosError(err)) {
                return { 
                    userData: null, 
                    error: { 
                        message: err.response ? err.response.data.detail.message :  "Failed to login. Please try again", 
                        code: err.response ? err.response.data.detail.code : ErrorCodes.AUTHENTICATION_ERROR 
                    } as APIError 
                };
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
                username: response.data.user.username,
                fullName: response.data.user.full_name,
                email: response.data.user.email
            };
            authData.current = {
                accessToken: response.data.access_token,
                tokenExpiresIn: response.data.expires_in,
                tokenSetAt: Date.now()
            };
            setUserData(userData);
            setLoggedIn(true);

            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('r_t', response.data.refresh_token);
            localStorage.setItem('s_id', response.data.session_id);

            return { userData, error: null };
        } catch (err) {
            if (axios.isAxiosError(err)) {
                return { 
                    userData: null, 
                    error: { 
                        message: err.response ? err.response.data.detail.message : "Failed account creation. Please try again later.", 
                        code: err.response ? err.response.data.detail.code : ErrorCodes.AUTHENTICATION_ERROR 
                    } as APIError 
                };
            }
            return { userData: null, error: { message: "Failed account creation. Please try again later.", code: ErrorCodes.AUTHENTICATION_ERROR } as APIError };
        }
    }

    const logout = () => {
        APIProtected.post('/auth/logout').then(() => {
            setUserData(null);
            setLoggedIn(false);
            authData.current = null;
            deleteFromLocalStorage('userData', 'r_t', 's_id');
        });   
    }

    const updateUserData = async () => {
        try {
            const response = await APIProtected.get('api/users/me');
            const userData: UserData = {
                userId: response.data.user_id,
                username: response.data.username,
                fullName: response.data.full_name,
                email: response.data.email
            };

            localStorage.setItem('userData', JSON.stringify(userData));
            setUserData(userData);

            return { userData: userData, error: null };
        } catch (err) {
            deleteFromLocalStorage('userData', 'r_t', 's_id');
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
        updateUserData,
		APIProtected,
		APIUnprotected
    }), [userData, loggedIn]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext };