// src/components/admin/RestaurantesPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import restauranteService, { Restaurante } from '../../services/restauranteService';

export const RestaurantesPage: React.FC = () => {
    const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
    const [editando, setEditando] = useState<Restaurante | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cargarRestaurantes();
    }, []);

    const cargarRestaurantes = async () => {
        setLoading(true);
        try {
            const personIdStr = localStorage.getItem('person_id');
            if (personIdStr) {
                const rests = await restauranteService.obtenerPorUsuario(parseInt(personIdStr));
                setRestaurantes(rests);
            }
        } catch (err) {
            console.error('Error cargando restaurantes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async () => {
        if (!editando || !editando.id) return;

        try {
            await restauranteService.actualizar(editando.id, editando);
            alert('Restaurante actualizado');
            setEditando(null);
            cargarRestaurantes();
        } catch (err: any) {
            alert('Error al actualizar: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Mis Restaurantes</h1>

            {loading ? (
                <div className="text-center py-8">Cargando...</div>
            ) : restaurantes.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                        No tienes restaurantes asociados
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {restaurantes.map((restaurante) => (
                        <Card key={restaurante.id}>
                            <CardHeader>
                                <CardTitle>{restaurante.nombre}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {editando?.id === restaurante.id ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Nombre</Label>
                                            <Input
                                                value={editando.nombre}
                                                onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Dirección</Label>
                                            <Input
                                                value={editando.direccion}
                                                onChange={(e) => setEditando({ ...editando, direccion: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Contacto</Label>
                                            <Input
                                                value={editando.contacto}
                                                onChange={(e) => setEditando({ ...editando, contacto: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleGuardar} className="flex-1">
                                                Guardar
                                            </Button>
                                            <Button onClick={() => setEditando(null)} variant="outline" className="flex-1">
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p><strong>Dirección:</strong> {restaurante.direccion}</p>
                                        <p><strong>Contacto:</strong> {restaurante.contacto}</p>
                                        <p className="text-sm text-gray-500">
                                            <strong>Creado:</strong>{' '}
                                            {restaurante.fechaCreacion ? new Date(restaurante.fechaCreacion).toLocaleDateString() : 'N/A'}
                                        </p>
                                        <Button
                                            onClick={() => setEditando(restaurante)}
                                            className="w-full mt-4"
                                        >
                                            Editar
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
