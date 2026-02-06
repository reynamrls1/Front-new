// src/components/admin/SolicitudesPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import solicitudService, { SolicitudAsociacion } from '../../services/solicitudService';

export const SolicitudesPage: React.FC = () => {
    const [solicitudes, setSolicitudes] = useState<SolicitudAsociacion[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRestaurante, setSelectedRestaurante] = useState<number | null>(null);
    const [restaurantes, setRestaurantes] = useState<any[]>([]);

    useEffect(() => {
        // Obtener restaurantes del usuario del localStorage
        const restaurantesStr = localStorage.getItem('user_restaurants');
        if (restaurantesStr) {
            const rests = JSON.parse(restaurantesStr);
            setRestaurantes(rests);
            if (rests.length > 0 && rests[0].esAdministrador) {
                setSelectedRestaurante(rests[0].restauranteId);
            }
        }
    }, []);

    useEffect(() => {
        if (selectedRestaurante) {
            cargarSolicitudes();
        }
    }, [selectedRestaurante]);

    const cargarSolicitudes = async () => {
        if (!selectedRestaurante) return;

        setLoading(true);
        try {
            const pendientes = await solicitudService.listarPendientes(selectedRestaurante);
            setSolicitudes(pendientes);
        } catch (err) {
            console.error('Error cargando solicitudes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (solicitudId: number) => {
        if (!selectedRestaurante) return;

        try {
            const personIdStr = localStorage.getItem('person_id');
            if (!personIdStr) {
                alert('Error: usuario no identificado');
                return;
            }

            await solicitudService.aprobar(solicitudId, parseInt(personIdStr));
            alert('Solicitud aprobada');
            cargarSolicitudes();
        } catch (err: any) {
            alert('Error al aprobar solicitud: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleRechazar = async (solicitudId: number) => {
        if (!selectedRestaurante) return;

        try {
            const personIdStr = localStorage.getItem('person_id');
            if (!personIdStr) {
                alert('Error: usuario no identificado');
                return;
            }

            await solicitudService.rechazar(solicitudId, parseInt(personIdStr));
            alert('Solicitud rechazada');
            cargarSolicitudes();
        } catch (err: any) {
            alert('Error al rechazar solicitud: ' + (err.response?.data?.message || err.message));
        }
    };

    const restaurantesAdmin = restaurantes.filter(r => r.esAdministrador);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Solicitudes de Asociación</h1>

            {restaurantesAdmin.length > 0 && (
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Restaurante:</label>
                    <select
                        value={selectedRestaurante || ''}
                        onChange={(e) => setSelectedRestaurante(parseInt(e.target.value))}
                        className="px-4 py-2 border rounded-md"
                    >
                        {restaurantesAdmin.map((rest) => (
                            <option key={rest.restauranteId} value={rest.restauranteId}>
                                {rest.nombreRestaurante}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {loading ? (
                <div className="text-center py-8">Cargando solicitudes...</div>
            ) : solicitudes.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                        No hay solicitudes pendientes
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {solicitudes.map((solicitud) => (
                        <Card key={solicitud.id}>
                            <CardHeader>
                                <CardTitle>{solicitud.nombreSolicitante}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p>
                                        <strong>Rol solicitado:</strong>{' '}
                                        {solicitud.esParaAdministrador ? 'Administrador' : 'Empleado'}
                                    </p>
                                    <p>
                                        <strong>Fecha:</strong>{' '}
                                        {solicitud.fechaSolicitud ? new Date(solicitud.fechaSolicitud).toLocaleDateString() : 'N/A'}
                                    </p>
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            onClick={() => handleAprobar(solicitud.id!)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            Aprobar
                                        </Button>
                                        <Button
                                            onClick={() => handleRechazar(solicitud.id!)}
                                            variant="destructive"
                                        >
                                            Rechazar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
