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
            localStorage.setItem('user_email', email);
            return response.data;
        }
        return response.data;
    },

    getPerson: async (id: number) => {
        const response = await api.get(`/api/persons/${id}`);
        return response.data;
    },

    getCurrentUser: () => {
        const storedRole = localStorage.getItem('user_role');
        const role = (storedRole === 'admin' || storedRole === 'employee' || storedRole === 'client')
            ? storedRole
            : 'client';

        return {
            token: localStorage.getItem('jwt_token'),
            personId: localStorage.getItem('person_id'),
            role: role as 'admin' | 'client' | 'employee'
        };
    },

    // Obtener Tipos de Documento
    getDocumentTypes: async () => {
        // Retornamos lista estática
        return [
            { id: 'CC', initial: 'CC', name: 'Cédula de Ciudadanía' },
            { id: 'TI', initial: 'TI', name: 'Tarjeta de Identidad' },
            { id: 'CE', initial: 'CE', name: 'Cédula de Extranjería' },
            { id: 'RC', initial: 'RC', name: 'Registro Civil' },
            { id: 'PA', initial: 'PA', name: 'Pasaporte' },
            { id: 'DIE', initial: 'DIE', name: 'Documento de Identificación Extranjero' },
            { id: 'PEP', initial: 'PEP', name: 'Permiso Especial de Permanencia' },
            { id: 'PPT', initial: 'PPT', name: 'Permiso por Protección Temporal' },
        ];
    },

    // REGISTRO
    register: async (userData: any) => {
        // Estructura requerida por RegisterRequestDTO:
        // {
        //   user: { login, email, password, firstName, lastName, authorities: [ROLE] },
        //   person: { firstName, firstLastName, phoneNumber, documentType, documentNumber, bornDate }
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
                documentType: userData.documentTypeId, // Ahora se envía el String (e.g. "CC")
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