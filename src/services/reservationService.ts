import api from './api';

export interface ReservationDTO {
    id?: number;
    personId: number;
    barTableId: number;
    reservationDate: string; // ISO 8601 UTC
    attendat: number;
    condition?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    aplicationDate?: string;
}

const reservationService = {
    // Create
    createReservation: async (data: ReservationDTO) => {
        const response = await api.post('/api/reservaciones', data);
        return response.data;
    },

    // Get by Person
    getReservationsByPerson: async (personId: number) => {
        const response = await api.get(`/api/reservaciones/person/${personId}`);
        return response.data;
    },

    // Update
    updateReservation: async (id: number, data: ReservationDTO) => {
        const response = await api.put(`/api/reservaciones/${id}`, data);
        return response.data;
    },

    // Cancel
    cancelReservation: async (id: number) => {
        const response = await api.put(`/api/reservaciones/${id}`, {
            id: id,
            condition: 'CANCELLED'
        });
        return response.data;
    }
};

export default reservationService;
