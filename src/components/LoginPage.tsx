import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
// Importamos el servicio que creamos antes (ajusta la ruta si está en otra carpeta)
import authService from '../services/authService'; 

export function LoginPage({ onLogin }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Para mostrar errores en rojo
  const [loading, setLoading] = useState(false); // Para deshabilitar el botón mientras carga

  // --- 1. PRUEBA DE CONEXIÓN AL CARGAR (EL PING) ---
  useEffect(() => {
    // Esto es solo para verificar que Java responde. Puedes borrarlo luego.
    console.log("Haciendo Ping al backend...");
    fetch('http://localhost:8080/api/test')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Backend no responde");
      })
      .then(data => {
        console.log("¡CONEXIÓN EXITOSA!", data);
        // Si quieres, descomenta la siguiente línea para ver una alerta visual
        // alert("Backend conectado: " + data.mensaje);
      })
      .catch(err => console.log("El Backend no responde aún (revisa que esté corriendo)", err));
  }, []);
  // --------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Bloqueamos el botón

    try {
      console.log("Enviando datos al Login...");
      
      // 2. LLAMADA REAL AL BACKEND
      // authService se encarga de cambiar 'email' por 'login' internamente
      const response = await authService.login(email, password);
      
      console.log("Login correcto:", response);

      // Aquí definimos el rol según la respuesta o temporalmente 'admin'
      // Ajusta esto según cómo quieras manejar los roles que vienen de Java
      onLogin('admin'); 

    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError('Credenciales incorrectas o error de conexión');
    } finally {
      setLoading(false); // Desbloqueamos el botón
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
        
        {/* Mensaje de error visible */}
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
              placeholder="admin@ejemplo.com"
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
            {loading ? 'Conectando...' : 'Ingresar'}
          </Button>
        </form>
      </Card>
    </div>
  );
}