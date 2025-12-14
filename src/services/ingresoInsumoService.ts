import api from './api';
import { MedidaDTO } from './medidasService';
import { InsumoDTO } from './insumoService';

export interface IngresoInsumoDTO {
    id?: number;
    amount: number;
    inputId: number;
    inputName?: string;
    measure: string; // Enum value
    incomeId?: number;
}

export const ingresoInsumoService = {
    getAll: async () => {
        const response = await api.get<IngresoInsumoDTO[]>('/api/ingreso-insumos');
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<IngresoInsumoDTO>(`/api/ingreso-insumos/${id}`);
        return response.data;
    },

    create: async (data: IngresoInsumoDTO) => {
        const response = await api.post<IngresoInsumoDTO>('/api/ingreso-insumos', data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/api/ingreso-insumos/${id}`);
    }
};
