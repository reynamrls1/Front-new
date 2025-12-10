import axios from 'axios';

// Creamos la instancia de Axios
const api = axios.create({
    baseURL: 'http://localhost:8080', // Puerto de tu Spring Boot
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para agregar el Token automáticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;