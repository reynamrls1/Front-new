import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import axios from 'axios';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/auth/request-password-reset', {
                email: email
            });

            setMessage(response.data.message);
            console.log('Revisa los logs del servidor para obtener el token de recuperación');

        } catch (err: any) {
            console.error('Error al solicitar recuperación:', err);
            setError('Error al procesar la solicitud. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Card className="w-full max-w-md p-8 shadow-xl">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">¿Olvidaste tu contraseña?</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
                    </p>
                </div>

                {message && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg border border-green-400 text-sm">
                        {message}
                        <p className="mt-2 text-xs">
                            <strong>Nota:</strong> Por ahora, revisa los logs del servidor para obtener el token de recuperación.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar instrucciones'}
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
