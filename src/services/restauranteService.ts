// src/services/restauranteService.ts
import api from './api';

export interface Restaurante {
  id?: number;
  nombre: string;
  direccion: string;
  contacto: string;
  fechaCreacion?: string;
  activo?: boolean;
  usuarioCreadorId?: number;
}

const restauranteService = {
  // Crear restaurante
  crear: async (restaurante: Restaurante, usuarioCreadorId: number) => {
    const response = await api.post(`/api/restaurantes?usuarioCreadorId=${usuarioCreadorId}`, restaurante);
    return response.data;
  },

  // Listar todos los restaurantes
  listar: async () => {
    const response = await api.get('/api/restaurantes');
    return response.data;
  },

  // Buscar restaurantes por nombre
  buscar: async (query: string) => {
    const response = await api.get(`/api/restaurantes/search?q=${query}`);
    return response.data;
  },

  // Obtener restaurante por ID
  obtenerPorId: async (id: number) => {
    const response = await api.get(`/api/restaurantes/${id}`);
    return response.data;
  },

  // Obtener restaurantes de un usuario
  obtenerPorUsuario: async (userId: number) => {
    const response = await api.get(`/api/restaurantes/usuario/${userId}`);
    return response.data;
  },

  // Actualizar restaurante
  actualizar: async (id: number, restaurante: Restaurante) => {
    const response = await api.put(`/api/restaurantes/${id}`, restaurante);
    return response.data;
  },

  // Desactivar restaurante
  desactivar: async (id: number) => {
    await api.delete(`/api/restaurantes/${id}`);
  }
};

export default restauranteService;
