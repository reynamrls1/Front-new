import api from './api';

const authService = {
    // LOGIN (Este ya funcionaba bien)
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', {
            login: email, 
            password: password 
        });
        if (response.data.token) {
            localStorage.setItem('jwt_token', response.data.token);
        }
        return response.data;
    },

    // REGISTRO (CORREGIDO)
    register: async (userData: any) => {
        // Ajustamos los datos para que Java reciba exactamente lo que pide
        const datosParaJava = {
            nombre: userData.nombre,
            apellido: userData.apellido,
            email: userData.email,
            
            // 👇 ESTA ES LA LÍNEA QUE FALTABA PARA ARREGLAR EL ERROR 👇
            login: userData.email, 
            // ---------------------------------------------------------

            username: userData.email, // Lo dejamos por seguridad
            password: userData.password
        };
        
        console.log("Enviando registro al backend:", datosParaJava);

        const response = await api.post('/auth/register', datosParaJava);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
    }
};

export default authService;