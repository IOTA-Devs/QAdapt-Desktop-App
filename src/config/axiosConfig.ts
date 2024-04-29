import axios, { InternalAxiosRequestConfig } from 'axios';

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

let authData: AuthData | null;
let isRefreshing: boolean = false;
let requestQueue: RequestQueueObj[] = [];

const APIProtected = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

const APIUnprotected = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});

const processQueue = (error: any = null) => {
    for (let request of requestQueue) {
        if (error) {
            return request.reject(error);   
        }

        if (authData) request.config.headers.Authorization = `Bearer ${authData.accessToken}`;
        return request.resolve(request.config);
    }
};

APIProtected.interceptors.request.use(async (config) => {
    const now = Date.now();
    if (!authData || authData.tokenSetAt + authData.tokenExpiresIn <= now) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                requestQueue.push({ resolve, reject, config });
            });           
        }

        try {
            isRefreshing = true;
            const refreshToken = localStorage.getItem('r_t');
            const sessionId = localStorage.getItem('s_id');
            if (!refreshToken || ! sessionId) {
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

            authData = {
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

    config.headers.Authorization = `Bearer ${authData.accessToken}`;
    return config;
}, (err) => {
    return Promise.reject(err);
});

export {
    APIProtected,
    APIUnprotected
};