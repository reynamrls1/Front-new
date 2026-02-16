import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- IMPORTACIONES ---
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import authService from '../services/authService';

export function LoginPage({ onLogin }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- PRUEBA DE CONEXIÓN (PING) ---
  useEffect(() => {
    console.log("Haciendo Ping al backend...");
    fetch('http://localhost:8080/api/test')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Backend no responde");
      })
      .then(data => console.log("¡CONEXIÓN EXITOSA!", data))
      .catch(err => console.log("Backend desconectado o cargando...", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Enviando credenciales...");

      // 1. LLAMADA AL LOGIN
      const data = await authService.login(email, password);

      console.log("Login correcto. Rol obtenido:", data.role);

      // 2. ACTUALIZAR ESTADO GLOVAL
      if (onLogin) onLogin(data.role);

      // 3. REDIRECCIÓN
      navigate('/dashboard');

    } catch (err: any) {
      console.error("Error al iniciar sesión:", err);

      if (err.response?.status === 400 || err.response?.status === 401) {
        setError('Correo o contraseña incorrectos.');
      } else if (err.response?.status === 403) {
        setError('Acceso denegado.');
      } else {
        setError('Error de conexión. Revisa que el Backend esté corriendo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>

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
              placeholder="prueba@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>

          <div className="text-center mt-4">
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
}