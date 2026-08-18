import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Because Windows Firewall blocked Port 8081 (Expo), it also blocked Port 8080.
// We are mapping the backend through a secure localtunnel to bypass this lockdown.
const API_URL = 'https://breezy-symbols-smell.loca.lt/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true', // Required to bypass the localtunnel warning screen for programmatic API calls
    },
});

api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
