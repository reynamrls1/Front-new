import { useState, useEffect } from 'react';
import api from '../services/api';
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

import { useNavigate } from 'react-router-dom';

// IMPORTAMOS EL SERVICIO
import authService from '../services/authService';

export function HomePage({ onLogin }: { onLogin?: (role: any) => void }) {
  const navigate = useNavigate();
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
  const [registerStep, setRegisterStep] = useState<'role' | 'form' | 'restaurant'>('role');

  // --- ESTADOS PARA RESTAURANTE (Paso 3 - Admin) ---
  const [regRestName, setRegRestName] = useState('');
  const [regRestAddress, setRegRestAddress] = useState('');
  const [regRestContact, setRegRestContact] = useState('');

  // --- ESTADOS PARA SELECCIÓN DE RESTAURANTE (Paso 3 - Empleado) ---
  const [availableRestaurants, setAvailableRestaurants] = useState<any[]>([]);
  const [selectedRestauranteId, setSelectedRestauranteId] = useState<number | null>(null);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  // Document Types from Enum
  const docTypes = [
    { id: 'CC', initial: 'CC', name: 'Cédula de Ciudadanía' },
    { id: 'TI', initial: 'TI', name: 'Tarjeta de Identidad' },
    { id: 'CE', initial: 'CE', name: 'Cédula de Extranjería' },
    { id: 'RC', initial: 'RC', name: 'Registro Civil' },
    { id: 'PA', initial: 'PA', name: 'Pasaporte' },
    { id: 'DIE', initial: 'DIE', name: 'Documento de Identificación Extranjero' },
    { id: 'PEP', initial: 'PEP', name: 'Permiso Especial de Permanencia' },
    { id: 'PPT', initial: 'PPT', name: 'Permiso por Protección Temporal' },
  ];

  useEffect(() => {
    if (docTypes.length > 0) setRegDocTypeId(docTypes[0].id);
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
      const data = await authService.login(email, password);

      // Actualizar estado global
      if (onLogin) onLogin(data.role);

      // Si pasa, redirigimos al Dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas o error de servidor');
    } finally {
      setLoading(false);
    }
  };

  // --- Cargar restaurantes disponibles para empleados ---
  const fetchRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const response = await api.get('/api/restaurantes');
      setAvailableRestaurants(response.data);
    } catch (err) {
      console.error('Error cargando restaurantes', err);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  // --- Paso 2 → Si es Admin o Empleado, ir al paso 3. Si es Cliente, registrar directamente ---
  const handlePersonalDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regRole === 'admin') {
      setRegisterStep('restaurant');
    } else if (regRole === 'employee') {
      fetchRestaurants();
      setRegisterStep('restaurant');
    } else {
      doRegister();
    }
  };

  // --- Paso 3 (Admin): Enviar registro con datos del restaurante ---
  const handleRestaurantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doRegister({
      nombre: regRestName,
      direccion: regRestAddress,
      contacto: regRestContact
    });
  };

  // --- Paso 3 (Empleado): Enviar solicitud al restaurante seleccionado ---
  const handleEmployeeRestaurantSelect = () => {
    if (!selectedRestauranteId) {
      setError('Selecciona un restaurante');
      return;
    }
    doRegister(undefined, selectedRestauranteId);
  };

  // --- LÓGICA DE REGISTRO REAL ---
  const doRegister = async (restaurante?: { nombre: string; direccion: string; contacto: string }, restauranteIdAsociar?: number) => {
    setLoading(true);
    setError('');

    try {
      // --- VALIDACIÓN DE CONTRASEÑA ---
      if (regPassword.length > 60) {
        setError("La contraseña no puede tener más de 60 caracteres.");
        setLoading(false);
        return;
      }
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/;
      if (!passwordRegex.test(regPassword)) {
        setError("La contraseña debe tener al menos una mayúscula, un número y un signo (caracter especial).");
        setLoading(false);
        return;
      }
      // --------------------------------

      const datosUsuario: any = {
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

      if (restaurante) {
        datosUsuario.restaurante = restaurante;
      }
      if (restauranteIdAsociar) {
        datosUsuario.restauranteIdAsociar = restauranteIdAsociar;
      }

      console.log("Enviando registro...", datosUsuario);
      await authService.register(datosUsuario);

      alert("¡Registro exitoso! Ahora inicia sesión.");

      // Cerramos registro y abrimos login para que entre
      setIsRegisterOpen(false);
      setRegisterStep('role');
      setEmail(regEmail);
      setIsLoginOpen(true);

    } catch (err: any) {
      console.error("Registration Error Details:", err);
      // Mostrar mensaje detallado del backend si existe
      if (err.response && err.response.data && (err.response.data.message || err.response.data.error)) {
        setError(`Error: ${err.response.data.message || err.response.data.error}`);
      } else {
        setError('Error al registrar. Verifica los datos.');
      }
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
              <Button variant="ghost" onClick={() => { setIsRegisterOpen(true); setRegisterStep('role'); }} className="text-slate-600 hover:text-blue-600">
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

            <div className="text-center mt-2">
              <a
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>

          {/* Enlace para registrarse desde el Login */}
          <div className="text-center text-sm text-slate-500 mt-2">
            ¿No tienes cuenta?{' '}
            <button onClick={() => { setIsLoginOpen(false); setIsRegisterOpen(true); setRegisterStep('role'); }} className="text-blue-600 font-semibold hover:underline">
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

          {registerStep === 'role' ? (
            <div className="grid gap-4 py-4">
              <p className="text-center text-slate-600 mb-2">Selecciona tu tipo de cuenta:</p>
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => {
                    setRegRole(role.id);
                    setRegisterStep('form');
                  }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white shadow-md`}>
                    <role.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-700">{role.title}</h4>
                    <p className="text-xs text-slate-500">{role.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          ) : registerStep === 'form' ? (
            <form onSubmit={handlePersonalDataSubmit} className="space-y-3 py-2">
              <button
                type="button"
                onClick={() => setRegisterStep('role')}
                className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2"
              >
                ← Volver a selección de rol
              </button>

              <div className="bg-blue-50 p-2 rounded-lg mb-4 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roles.find(r => r.id === regRole)?.gradient} flex items-center justify-center text-white text-xs`}>
                  {(() => {
                    const Icon = roles.find(r => r.id === regRole)?.icon;
                    return Icon ? <Icon className="w-4 h-4" /> : null;
                  })()}
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900">Registrando como: {roles.find(r => r.id === regRole)?.title}</p>
                  <p className="text-xs text-blue-700">Paso 2 de {regRole === 'admin' ? '3' : '2'} — Datos personales</p>
                </div>
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
                      <option key={t.id} value={t.id}>{t.initial} - {t.name}</option>
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
                {regRole === 'admin' ? 'Siguiente → Datos del Restaurante' : regRole === 'employee' ? 'Siguiente → Seleccionar Restaurante' : (loading ? 'Registrando...' : 'Registrarse Gratis')}
              </Button>
            </form>
          ) : regRole === 'admin' ? (
            /* ========== PASO 3 ADMIN: FORMULARIO DE RESTAURANTE ========== */
            <form onSubmit={handleRestaurantSubmit} className="space-y-3 py-2">
              <button
                type="button"
                onClick={() => setRegisterStep('form')}
                className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2"
              >
                ← Volver a datos personales
              </button>

              <div className="bg-amber-50 p-3 rounded-lg mb-4 flex items-center gap-2 border border-amber-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs">
                  🍽️
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-900">Paso 3 de 3 — Tu Restaurante</p>
                  <p className="text-xs text-amber-700">Ingresa los datos de tu restaurante</p>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Nombre del Restaurante</Label>
                <Input
                  value={regRestName}
                  onChange={(e) => setRegRestName(e.target.value)}
                  placeholder="Ej: La Casona Gourmet"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Dirección</Label>
                <Input
                  value={regRestAddress}
                  onChange={(e) => setRegRestAddress(e.target.value)}
                  placeholder="Ej: Calle 45 #12-34, Bogotá"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Teléfono de Contacto</Label>
                <Input
                  type="tel"
                  value={regRestContact}
                  onChange={(e) => setRegRestContact(e.target.value)}
                  placeholder="Ej: 3001234567"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2" disabled={loading}>
                {loading ? 'Registrando...' : '¡Crear Cuenta y Restaurante!'}
              </Button>
            </form>
          ) : (
            /* ========== PASO 3 EMPLEADO: SELECCIONAR RESTAURANTE ========== */
            <div className="space-y-3 py-2">
              <button
                type="button"
                onClick={() => setRegisterStep('form')}
                className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2"
              >
                ← Volver a datos personales
              </button>

              <div className="bg-indigo-50 p-3 rounded-lg mb-4 flex items-center gap-2 border border-indigo-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs">
                  🏢
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-900">Paso 3 de 3 — Selecciona Restaurante</p>
                  <p className="text-xs text-indigo-700">Elige el restaurante donde deseas trabajar</p>
                </div>
              </div>

              {loadingRestaurants ? (
                <p className="text-center text-slate-500 py-4">Cargando restaurantes...</p>
              ) : availableRestaurants.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-slate-500">No hay restaurantes registrados aún.</p>
                  <p className="text-xs text-slate-400 mt-1">Puedes registrarte sin restaurante y asociarte después.</p>
                  <Button onClick={() => doRegister()} className="mt-3 bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrarse sin restaurante'}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                    {availableRestaurants.map((rest: any) => (
                      <div
                        key={rest.id}
                        onClick={() => {
                          console.log("Seleccionando restaurante:", rest);
                          setSelectedRestauranteId(Number(rest.id));
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedRestauranteId === rest.id
                          ? 'border-green-500 bg-green-50 ring-2 ring-green-300'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                      >
                        <p className="font-semibold text-sm text-slate-900">{rest.nombre}</p>
                        <p className="text-xs text-slate-500">📍 {rest.direccion}</p>
                        <p className="text-xs text-slate-500">📞 {rest.contacto}</p>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleEmployeeRestaurantSelect}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2"
                    disabled={loading || !selectedRestauranteId}
                  >
                    {loading ? 'Registrando...' : '¡Enviar Solicitud y Registrarse!'}
                  </Button>
                </>
              )}
            </div>
          )}

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