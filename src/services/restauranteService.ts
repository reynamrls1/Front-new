import api from './api';

export interface RestauranteDTO {
    id?: number;
    nombre: string;
    direccion: string;
    contacto: string;
    activo: boolean;
    // Otros campos si son necesarios
}

const restauranteService = {
    getAll: async () => {
        const response = await api.get<RestauranteDTO[]>('/api/restaurantes');
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<RestauranteDTO>(`/api/restaurantes/${id}`);
        return response.data;
    }
};

export default restauranteService;
