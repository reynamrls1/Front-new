import api from './api';

export interface Usuario {
  id?: number;
  documentNumber: string;
  firstName: string;
  secondName: string;
  lastName: string;
  secondLastName: string;
  phone: string;
  birthDate: string;
  username: string;
  documentType: string;
  password?: string; 
  email?: string; 
}

const userService = {
  // 1. OBTENER TODOS
  getAll: async () => {
    const response = await api.get('/api/users');
    
    // TRADUCCIÓN BASADA EN TU FOTO:
    return response.data.map((u: any) => ({
        id: u.id,
        // Tu Java devuelve 'firstName', así que lo tomamos directo
        firstName: u.firstName || '', 
        lastName: u.lastName || '',
        email: u.email,
        username: u.login, // En la foto sale 'login', así que lo mapeamos a username
        
        // ⚠️ ADVERTENCIA: Estos campos NO vienen en tu foto del Backend.
        // Si Java no los manda, saldrán vacíos en la tabla por ahora.
        documentNumber: u.documentNumber || '', 
        phone: u.phone || '',
        documentType: u.documentType || '',
        birthDate: u.birthDate || '',
        secondName: u.secondName || '',
        secondLastName: u.secondLastName || ''
    }));
  },

  // 2. CREAR
  create: async (data: Usuario) => {
    // ENVIAMOS A JAVA EN INGLÉS (Porque tu GET devuelve inglés)
    const datosParaJava = {
        login: data.username, // Obligatorio
        email: data.email,
        password: data.password,
        
        // Usamos los nombres en inglés que vimos en la foto
        firstName: data.firstName,
        lastName: data.lastName,
        
        // Enviamos los extras (aunque Java los ignore por ahora)
        phone: data.phone,
        documentNumber: data.documentNumber,
        birthDate: data.birthDate,
        langKey: "es" // A veces JHipster/Spring pide esto
    };

    console.log("Enviando:", datosParaJava);
    const response = await api.post('/api/users', datosParaJava);
    return response.data;
  },

  // 3. ACTUALIZAR
  update: async (id: number, data: Usuario) => {
    const datosParaJava = {
        id: id,
        login: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        documentNumber: data.documentNumber
    };
    const response = await api.put(`/api/users/${id}`, datosParaJava);
    return response.data;
  },

  // 4. ELIMINAR
  delete: async (id: number) => {
    await api.delete(`/api/users/${id}`);
  }
};

export default userService;