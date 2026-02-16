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
            if (response.data.userId) {
                localStorage.setItem('user_id', String(response.data.userId));
            }

            localStorage.setItem('user_role', response.data.role);
            localStorage.setItem('user_email', email);

            // Guardar restaurantes del usuario
            if (response.data.restaurantes && response.data.restaurantes.length > 0) {
                localStorage.setItem('user_restaurantes', JSON.stringify(response.data.restaurantes));
                // Auto-seleccionar el primer restaurante por defecto
                localStorage.setItem('restaurante', JSON.stringify(response.data.restaurantes[0]));
            }
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
        const datosParaJava: any = {
            user: {
                login: userData.email,
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName,
                lastName: userData.firstLastName,
                authorities: [userData.role] // ["ROLE_CLIENT"] etc
            },
            person: {
                firstName: userData.firstName,
                secondName: userData.secondName || null,
                firstLastName: userData.firstLastName,
                secondLastName: userData.secondLastName || null,
                phoneNumber: parseInt(userData.phoneNumber),
                documentType: userData.documentTypeId,
                documentNumber: parseInt(userData.documentNumber),
                bornDate: userData.bornDate
            }
        };

        // Si es admin y tiene datos de restaurante, incluirlos
        if (userData.restaurante) {
            datosParaJava.tipoAsociacion = "CREAR_RESTAURANTE";
            datosParaJava.nuevoRestaurante = {
                nombre: userData.restaurante.nombre,
                direccion: userData.restaurante.direccion,
                contacto: userData.restaurante.contacto
            };
        }

        // Si es empleado y seleccionó un restaurante, enviar solicitud de asociación
        if (userData.restauranteIdAsociar) {
            datosParaJava.tipoAsociacion = "ASOCIAR_RESTAURANTE";
            datosParaJava.restauranteIdAsociar = userData.restauranteIdAsociar;
        }

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