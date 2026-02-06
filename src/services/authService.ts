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
            localStorage.setItem('person_id', response.data.personId);
            localStorage.setItem('user_role', response.data.role);
            localStorage.setItem('user_email', email); // Save email for display
        }
        return response.data;
    },

    getPerson: async (id: number) => {
        const response = await api.get(`/api/persons/${id}`);
        return response.data;
    },

    getCurrentUser: () => {
        return {
            token: localStorage.getItem('jwt_token'),
            personId: localStorage.getItem('person_id'),
            role: localStorage.getItem('user_role') as 'admin' | 'client' | 'employee' || 'client'
        };
    },

    // Obtener Tipos de Documento
    getDocumentTypes: async () => {
        const response = await api.get('/api/tipo-documentos');
        return response.data;
    },

    // REGISTRO
    register: async (userData: any) => {
        // Estructura requerida por RegisterRequestDTO:
        // {
        //   user: { login, email, password, firstName, lastName, authorities: [ROLE] },
        //   person: { firstName, firstLastName, phoneNumber, documentTypeId, documentNumber, bornDate }
        // }

        const datosParaJava = {
            user: {
                login: userData.email,
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName,
                lastName: userData.firstLastName, // Usamos primer apellido como last name genérico del user
                authorities: [userData.role] // ["ROLE_CLIENT"] etc
            },
            person: {
                firstName: userData.firstName,
                secondName: userData.secondName || null,
                firstLastName: userData.firstLastName,
                secondLastName: userData.secondLastName || null,
                phoneNumber: parseInt(userData.phoneNumber),
                documentTypeId: parseInt(userData.documentTypeId),
                documentNumber: parseInt(userData.documentNumber),
                bornDate: userData.bornDate // "YYYY-MM-DD"
            }
        };

        console.log("Enviando registro estructurado al backend:", datosParaJava);

        const response = await api.post('/auth/register', datosParaJava);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
    }
};

export default authService;