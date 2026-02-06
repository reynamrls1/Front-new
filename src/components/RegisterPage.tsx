// src/components/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import authService from '../services/authService';
import restauranteService, { Restaurante } from '../services/restauranteService';
import userService from '../services/userService';

export const RegisterPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [tipoUsuario, setTipoUsuario] = useState<'admin' | 'employee' | 'client'>('client');
    const [tipoAsociacion, setTipoAsociacion] = useState<'CREAR_RESTAURANTE' | 'ASOCIAR_RESTAURANTE' | 'NINGUNA'>('NINGUNA');

    // Datos del usuario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Datos personales
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [secondLastName, setSecondLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [documentTypeId, setDocumentTypeId] = useState('1');
    const [documentNumber, setDocumentNumber] = useState('');
    const [bornDate, setBornDate] = useState('');

    // Datos de restaurante
    const [nuevoRestaurante, setNuevoRestaurante] = useState<Restaurante>({
        nombre: '',
        direccion: '',
        contacto: ''
    });
    const [restauranteIdAsociar, setRestauranteIdAsociar] = useState<number | null>(null);
    const [solicitarComoAdmin, setSolicitarComoAdmin] = useState(false);
    const [restaurantesDisponibles, setRestaurantesDisponibles] = useState<Restaurante[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [documentTypes, setDocumentTypes] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDocumentTypes = async () => {
            try {
                const types = await userService.getDocumentTypes();
                setDocumentTypes(types);
            } catch (err) {
                console.error('Error cargando tipos de documento:', err);
            }
        };
        fetchDocumentTypes();
    }, []);

    useEffect(() => {
        if (tipoAsociacion === 'ASOCIAR_RESTAURANTE') {
            cargarRestaurantes();
        }
    }, [tipoAsociacion]);

    const cargarRestaurantes = async () => {
        try {
            const restaurantes = await restauranteService.listar();
            setRestaurantesDisponibles(restaurantes);
        } catch (err) {
            console.error('Error cargando restaurantes:', err);
        }
    };

    const buscarRestaurantes = async () => {
        if (!searchQuery.trim()) {
            cargarRestaurantes();
            return;
        }
        try {
            const resultados = await restauranteService.buscar(searchQuery);
            setRestaurantesDisponibles(resultados);
        } catch (err) {
            console.error('Error buscando restaurantes:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const authorities = tipoUsuario === 'admin' ? ['ROLE_ADMIN'] :
                tipoUsuario === 'employee' ? ['ROLE_EMPLOYEE'] :
                    ['ROLE_CLIENT'];

            const userData: any = {
                email,
                password,
                firstName,
                lastName,
                secondLastName,
                phoneNumber,
                documentTypeId,
                documentNumber,
                bornDate,
                authorities,
                tipoAsociacion
            };

            // Agregar datos de restaurante según tipo de asociación
            if (tipoAsociacion === 'CREAR_RESTAURANTE') {
                userData.nuevoRestaurante = nuevoRestaurante;
            } else if (tipoAsociacion === 'ASOCIAR_RESTAURANTE') {
                userData.restauranteIdAsociar = restauranteIdAsociar;
                userData.solicitarComoAdmin = solicitarComoAdmin;
            }

            await authService.register(userData);
            alert('Registro exitoso. Por favor inicia sesión.');
            window.location.href = '/login';
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error en el registro');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Tipo de Usuario</h2>
            <div className="grid grid-cols-1 gap-4">
                <Button
                    variant={tipoUsuario === 'client' ? 'default' : 'outline'}
                    onClick={() => {
                        setTipoUsuario('client');
                        setTipoAsociacion('NINGUNA');
                    }}
                    className="h-20"
                >
                    <div>
                        <div className="font-bold">Cliente</div>
                        <div className="text-sm">Para hacer reservaciones</div>
                    </div>
                </Button>
                <Button
                    variant={tipoUsuario === 'admin' ? 'default' : 'outline'}
                    onClick={() => setTipoUsuario('admin')}
                    className="h-20"
                >
                    <div>
                        <div className="font-bold">Administrador</div>
                        <div className="text-sm">Gestionar restaurantes</div>
                    </div>
                </Button>
                <Button
                    variant={tipoUsuario === 'employee' ? 'default' : 'outline'}
                    onClick={() => setTipoUsuario('employee')}
                    className="h-20"
                >
                    <div>
                        <div className="font-bold">Empleado</div>
                        <div className="text-sm">Trabajar en un restaurante</div>
                    </div>
                </Button>
            </div>

            {(tipoUsuario === 'admin' || tipoUsuario === 'employee') && (
                <div className="space-y-4 mt-6">
                    <h3 className="text-lg font-semibold">Opciones de Restaurant</h3>
                    {tipoUsuario === 'admin' && (
                        <Button
                            variant={tipoAsociacion === 'CREAR_RESTAURANTE' ? 'default' : 'outline'}
                            onClick={() => setTipoAsociacion('CREAR_RESTAURANTE')}
                            className="w-full"
                        >
                            Crear nuevo restaurante
                        </Button>
                    )}
                    <Button
                        variant={tipoAsociacion === 'ASOCIAR_RESTAURANTE' ? 'default' : 'outline'}
                        onClick={() => setTipoAsociacion('ASOCIAR_RESTAURANTE')}
                        className="w-full"
                    >
                        Asociarme a restaurante existente
                    </Button>
                </div>
            )}

            <Button onClick={() => setStep(2)} className="w-full mt-4">
                Continuar
            </Button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Datos de Cuenta</h2>

            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>

            <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="w-full">
                    Atrás
                </Button>
                <Button onClick={() => setStep(3)} className="w-full">
                    Continuar
                </Button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Datos Personales</h2>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="secondLastName">Segundo Apellido</Label>
                <Input
                    id="secondLastName"
                    value={secondLastName}
                    onChange={(e) => setSecondLastName(e.target.value)}
                />
            </div>

            <div>
                <Label htmlFor="phoneNumber">Teléfono</Label>
                <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="documentType">Tipo de Documento</Label>
                    <select
                        id="documentType"
                        value={documentTypeId}
                        onChange={(e) => setDocumentTypeId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    >
                        {documentTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label htmlFor="documentNumber">Número de Documento</Label>
                    <Input
                        id="documentNumber"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="bornDate">Fecha de Nacimiento</Label>
                <Input
                    id="bornDate"
                    type="date"
                    value={bornDate}
                    onChange={(e) => setBornDate(e.target.value)}
                    required
                />
            </div>

            <div className="flex gap-2">
                <Button onClick={() => setStep(2)} variant="outline" className="w-full">
                    Atrás
                </Button>
                <Button
                    onClick={() => {
                        if (tipoAsociacion === 'NINGUNA') {
                            handleSubmit(new Event('submit') as any);
                        } else {
                            setStep(4);
                        }
                    }}
                    className="w-full"
                >
                    {tipoAsociacion === 'NINGUNA' ? 'Registrar' : 'Continuar'}
                </Button>
            </div>
        </div>
    );

    const renderStep4 = () => {
        if (tipoAsociacion === 'CREAR_RESTAURANTE') {
            return (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-center">Datos del Restaurante</h2>

                    <div>
                        <Label htmlFor="restauranteNombre">Nombre del Restaurante</Label>
                        <Input
                            id="restauranteNombre"
                            value={nuevoRestaurante.nombre}
                            onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, nombre: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="restauranteDireccion">Dirección</Label>
                        <Input
                            id="restauranteDireccion"
                            value={nuevoRestaurante.direccion}
                            onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, direccion: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="restauranteContacto">Contacto</Label>
                        <Input
                            id="restauranteContacto"
                            value={nuevoRestaurante.contacto}
                            onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, contacto: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={() => setStep(3)} variant="outline" className="w-full">
                            Atrás
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading} className="w-full">
                            {loading ? 'Registrando...' : 'Registrar'}
                        </Button>
                    </div>
                </div>
            );
        }

        if (tipoAsociacion === 'ASOCIAR_RESTAURANTE') {
            return (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-center">Seleccionar Restaurante</h2>

                    <div className="flex gap-2">
                        <Input
                            placeholder="Buscar restaurante..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button onClick={buscarRestaurantes}>Buscar</Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {restaurantesDisponibles.map((rest) => (
                            <div
                                key={rest.id}
                                onClick={() => setRestauranteIdAsociar(rest.id!)}
                                className={`p-4 border rounded-lg cursor-pointer transition ${restauranteIdAsociar === rest.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="font-semibold">{rest.nombre}</div>
                                <div className="text-sm text-gray-600">{rest.direccion}</div>
                                <div className="text-sm text-gray-500">{rest.contacto}</div>
                            </div>
                        ))}
                    </div>

                    {tipoUsuario === 'admin' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="solicitarComoAdmin"
                                checked={solicitarComoAdmin}
                                onChange={(e) => setSolicitarComoAdmin(e.target.checked)}
                            />
                            <Label htmlFor="solicitarComoAdmin">
                                Solicitar como administrador
                            </Label>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={() => setStep(3)} variant="outline" className="w-full">
                            Atrás
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !restauranteIdAsociar}
                            className="w-full"
                        >
                            {loading ? 'Registrando...' : 'Registrar y Enviar Solicitud'}
                        </Button>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Registro - Paso {step}</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </CardContent>
            </Card>
        </div>
    );
};
