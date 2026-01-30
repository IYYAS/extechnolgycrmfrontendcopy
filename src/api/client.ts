import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

client.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return client(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                // No refresh token, logout
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(`${API_URL}/token/refresh/`, {
                    refresh: refreshToken
                });

                if (response.status === 200) {
                    const { access } = response.data;
                    localStorage.setItem('token', access);
                    client.defaults.headers.common['Authorization'] = 'Bearer ' + access;
                    originalRequest.headers['Authorization'] = 'Bearer ' + access;

                    processQueue(null, access);
                    isRefreshing = false;

                    return client(originalRequest);
                }
            } catch (err) {
                processQueue(err, null);
                isRefreshing = false;

                // Refresh failed, logout
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('user');
                window.location.href = '/login';

                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default client;
