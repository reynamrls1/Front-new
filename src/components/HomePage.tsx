import { useState, useEffect } from 'react';
import { Button } from './ui/button'; // Asegúrate de que estas rutas sean correctas
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from './ui/dialog';
import {
  Package, ArrowRight, Sparkles, UserCog, User, Briefcase, UserPlus, CheckCircle2, Zap, ShieldCheck
} from 'lucide-react';

// IMPORTAMOS EL SERVICIO
import authService from '../services/authService';

export function HomePage() {
  // --- ESTADOS PARA LOGIN ---
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- ESTADOS PARA REGISTRO ---
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regFirstName, setRegFirstName] = useState('');
  const [regSecondName, setRegSecondName] = useState('');
  const [regFirstLastName, setRegFirstLastName] = useState('');
  const [regSecondLastName, setRegSecondLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [regDocTypeId, setRegDocTypeId] = useState('');
  const [regDocNumber, setRegDocNumber] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBornDate, setRegBornDate] = useState('');
  const [regRole, setRegRole] = useState('client'); // Default role

  const [docTypes, setDocTypes] = useState<any[]>([]);

  useEffect(() => {
    // Cargar tipos de documento al montar
    const fetchDocTypes = async () => {
      try {
        const types = await authService.getDocumentTypes();
        setDocTypes(types);
        if (types.length > 0) setRegDocTypeId(types[0].id);
      } catch (error) {
        console.error("Error cargando tipos de documento", error);
      }
    };
    fetchDocTypes();
  }, []);

  const roles = [
    { id: 'admin', icon: UserCog, title: 'Administrador', description: 'Control total del sistema.', gradient: 'from-blue-600 to-indigo-600', modules: 16 },
    { id: 'client', icon: User, title: 'Cliente', description: 'Gestiona tus pedidos y compras.', gradient: 'from-emerald-600 to-teal-600', modules: 5 },
    { id: 'employee', icon: Briefcase, title: 'Empleado', description: 'Herramientas de venta.', gradient: 'from-purple-600 to-pink-600', modules: 12 },
  ];

  // --- LÓGICA DE LOGIN REAL ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("Intentando Login...");
      await authService.login(email, password);

      // Si pasa, redirigimos al Dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas o error de servidor');
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE REGISTRO REAL ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const datosUsuario = {
        firstName: regFirstName,
        secondName: regSecondName,
        firstLastName: regFirstLastName,
        secondLastName: regSecondLastName,
        email: regEmail,
        password: regPassword,
        documentTypeId: regDocTypeId,
        documentNumber: regDocNumber,
        phoneNumber: regPhone,
        bornDate: regBornDate,
        role: regRole === 'client' ? 'ROLE_CLIENT' : regRole === 'employee' ? 'ROLE_EMPLOYEE' : 'ROLE_ADMIN'
      };

      console.log("Enviando registro...", datosUsuario);
      await authService.register(datosUsuario);

      alert("¡Registro exitoso! Ahora inicia sesión.");

      // Cerramos registro y abrimos login para que entre
      setIsRegisterOpen(false);
      setEmail(regEmail); // Autocompletamos el email
      setIsLoginOpen(true);

    } catch (err) {
      console.error(err);
      setError('Error al registrar. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para abrir login desde las tarjetas
  const openLoginForRole = () => {
    setEmail('');
    setPassword('');
    setError('');
    setIsLoginOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">

      {/* Header */}
      <header className="border-b border-white/50 bg-white/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-gray-900 font-bold block leading-none">Inventoring and Counting</span>
                <span className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">v1.0</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setIsRegisterOpen(true)} className="text-slate-600 hover:text-blue-600">
                <UserPlus className="w-4 h-4 mr-2" /> Registrarse
              </Button>
              <Button onClick={() => setIsLoginOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="pt-20 pb-12 px-4 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
            Controla tu Negocio <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">en un Solo Lugar</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Plataforma integral para administrar productos, inventarios y facturación.
          </p>
        </section>

        {/* Roles */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {roles.map((role) => (
              <Card key={role.id} onClick={openLoginForRole} className="group relative overflow-hidden p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                  <div className="text-white"><role.icon /></div> {/* Icono corregido */}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{role.title}</h3>
                <p className="text-slate-600 text-sm mb-6">{role.description}</p>
                <span className="text-blue-600 text-sm font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ingresar <ArrowRight className="w-4 h-4" />
                </span>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* --- MODAL LOGIN --- */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Bienvenido</DialogTitle>
            <DialogDescription className="text-center">Ingresa tus credenciales</DialogDescription>
          </DialogHeader>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

          <form onSubmit={handleLoginSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Correo</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
              {loading ? 'Entrando...' : 'Ingresar'}
            </Button>
          </form>

          {/* Enlace para registrarse desde el Login */}
          <div className="text-center text-sm text-slate-500 mt-2">
            ¿No tienes cuenta?{' '}
            <button onClick={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }} className="text-blue-600 font-semibold hover:underline">
              Regístrate aquí
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL REGISTRO --- */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Crear Cuenta</DialogTitle>
          </DialogHeader>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

          <form onSubmit={handleRegisterSubmit} className="space-y-3 py-2">

            {/* Roles */}
            <div className="space-y-1">
              <Label>Rol</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
              >
                <option value="client">Cliente</option>
                <option value="employee">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {/* Nombres */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Primer Nombre</Label>
                <Input value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Segundo Nombre</Label>
                <Input value={regSecondName} onChange={(e) => setRegSecondName(e.target.value)} />
              </div>
            </div>

            {/* Apellidos */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Primer Apellido</Label>
                <Input value={regFirstLastName} onChange={(e) => setRegFirstLastName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Segundo Apellido</Label>
                <Input value={regSecondLastName} onChange={(e) => setRegSecondLastName(e.target.value)} />
              </div>
            </div>

            {/* Documento */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Tipo Doc</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={regDocTypeId}
                  onChange={(e) => setRegDocTypeId(e.target.value)}
                  required
                >
                  <option value="">Seleccione</option>
                  {docTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.initials} - {t.documentName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Número</Label>
                <Input type="number" value={regDocNumber} onChange={(e) => setRegDocNumber(e.target.value)} required />
              </div>
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Fecha Nac.</Label>
                <Input type="date" value={regBornDate} onChange={(e) => setRegBornDate(e.target.value)} required />
              </div>
            </div>

            {/* Credenciales */}
            <div className="space-y-1">
              <Label>Correo</Label>
              <Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Contraseña</Label>
              <Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse Gratis'}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500 mt-2">
            ¿Ya tienes cuenta?{' '}
            <button onClick={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }} className="text-blue-600 font-semibold hover:underline">
              Inicia sesión
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}