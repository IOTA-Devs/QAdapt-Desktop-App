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

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

const processQueue = (error: any = null) => {
    for (let request of requestQueue) {
        if (error) {
            return request.reject(error);   
        }
        return request.resolve(request.config);
    }
};

API.interceptors.request.use(async (config) => {
    if (!authData) return config;
    
    const now = Date.now();
    if (authData.tokenSetAt + authData.tokenExpiresIn <= now) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                requestQueue.push({ resolve, reject, config });
            });           
        }

        try {
            const refreshToken = localStorage.getItem('r_t');
            const sessionId = localStorage.getItem('s_id');
            if (!refreshToken || ! sessionId) return config;

            const response = await axios.post('/auth/token', {
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
            processQueue();
            return config;
        } catch (err) {
            processQueue(err);
            window.location.href = "/login";
            return Promise.reject(err);
        }
    }

    return config;
}, (err) => {
    return Promise.reject(err);
});

export default API;