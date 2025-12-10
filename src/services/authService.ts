import api from './api';

const authService = {
    login: async (email: string, password: string) => {
        // --- AQUÍ ESTÁ EL TRUCO ---
        const datosParaJava = {
            login: email,       // <--- ¡OJO! A la izquierda debe decir 'login'
            password: password
        };
        // ---------------------------

        console.log("Enviando esto al back:", datosParaJava); // Míralo en la consola

        const response = await api.post('/auth/login', datosParaJava);
        
        if (response.data.token) {
            localStorage.setItem('jwt_token', response.data.token);
        }
        return response.data;
    },

    // ... (el resto de funciones register/logout déjalas igual)
};

export default authService;