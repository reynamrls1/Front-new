export interface MedidaDTO {
    id: string; // Using String as ID
    nombre: string;
    name?: string; // Support legacy property if needed
    acronym?: string;
}

const MEASURES = [
    { id: 'KILOGRAMO', nombre: 'KILOGRAMO', name: 'KILOGRAMO', acronym: 'KG' },
    { id: 'GRAMO', nombre: 'GRAMO', name: 'GRAMO', acronym: 'G' },
    { id: 'LITRO', nombre: 'LITRO', name: 'LITRO', acronym: 'L' },
    { id: 'MILILITRO', nombre: 'MILILITRO', name: 'MILILITRO', acronym: 'ML' },
    { id: 'UNIDAD', nombre: 'UNIDAD', name: 'UNIDAD', acronym: 'UND' },
    { id: 'ONZA', nombre: 'ONZA', name: 'ONZA', acronym: 'OZ' }
];

export const medidasService = {
    getAll: async (): Promise<MedidaDTO[]> => {
        return Promise.resolve(MEASURES);
    },

    getOne: async (id: string): Promise<MedidaDTO | undefined> => {
        return Promise.resolve(MEASURES.find(m => m.id === id));
    }
};
