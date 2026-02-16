import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import axios from 'axios';

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(searchParams.get('key') || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (password: string): string | null => {
        if (password.length > 12) {
            return 'La contraseña no puede tener más de 12 caracteres';
        }
        if (!/[A-Z]/.test(password)) {
            return 'La contraseña debe contener al menos una mayúscula';
        }
        if (!/\d/.test(password)) {
            return 'La contraseña debe contener al menos un número';
        }
        if (!/[\W_]/.test(password)) {
            return 'La contraseña debe contener al menos un carácter especial';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // Validar formato de contraseña
        const validationError = validatePassword(newPassword);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/auth/reset-password', {
                key: token,
                newPassword: newPassword
            });

            setMessage(response.data.message);

            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err: any) {
            console.error('Error al restablecer contraseña:', err);
            setError(err.response?.data?.message || 'Error al restablecer la contraseña. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Card className="w-full max-w-md p-8 shadow-xl">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Restablecer Contraseña</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Ingresa tu nueva contraseña
                    </p>
                </div>

                {message && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg border border-green-400 text-sm">
                        {message}
                        <p className="mt-2 text-xs">Redirigiendo al inicio de sesión...</p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="token">Token de Recuperación</Label>
                        <Input
                            id="token"
                            type="text"
                            placeholder="Ingresa el token recibido"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            placeholder="Nueva contraseña"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500">
                            Máx. 12 caracteres, debe incluir: mayúscula, número y carácter especial
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirma tu contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        Volver al inicio de sesión
                    </Link>
                </div>
            </Card>
        </div>
    );
}
