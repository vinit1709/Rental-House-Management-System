import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API || "http://localhost:3000";

// Create an AxiosInstance object
const AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
};

// Request interceptor
AxiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken') || getCookie('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
AxiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        console.log("Response", error.response?.status, error.response?.data.errors[0].msg);

        if (error.response && [401, 403].includes(error.response.status) && !originalRequest._retry) {

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return AxiosInstance(originalRequest);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken') || getCookie('refreshToken');
                const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken }, { withCredentials: true });

                const newAccessToken = response.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);
                if (typeof document !== 'undefined') {
                    document.cookie = `accessToken=${encodeURIComponent(newAccessToken)}; path=/`;
                }

                processQueue(null, newAccessToken);
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return AxiosInstance(originalRequest);
            } catch (error) {
                processQueue(error, null);

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                if (typeof document !== 'undefined') {
                    document.cookie = 'accessToken=; Max-Age=0; path=/';
                    document.cookie = 'refreshToken=; Max-Age=0; path=/';
                }

                // window.location.replace('/login');
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);
export default AxiosInstance;