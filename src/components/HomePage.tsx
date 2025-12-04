import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from './ui/dialog';
import { 
  Package, 
  ArrowRight,
  Sparkles,
  UserCog,
  User,
  Briefcase,
  UserPlus,
  CheckCircle2,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (role: 'admin' | 'client' | 'employee') => void;
  onLogout?: () => void;
  currentRole?: 'admin' | 'client' | 'employee';
}

export function HomePage({ onNavigate, onLogout, currentRole }: any) {
  // --- ESTADOS PARA LOGIN ---
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'client' | 'employee' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- ESTADOS PARA REGISTRO ---
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  const roles = [
    {
      id: 'admin' as const,
      icon: UserCog,
      title: 'Administrador',
      description: 'Control total: usuarios, inventarios, reportes financieros y configuración global.',
      gradient: 'from-blue-600 to-indigo-600',
      modules: 16,
    },
    {
      id: 'client' as const,
      icon: User,
      title: 'Cliente',
      description: 'Realiza pedidos, gestiona tus reservaciones y consulta el estado de tus compras.',
      gradient: 'from-emerald-600 to-teal-600',
      modules: 5,
    },
    {
      id: 'employee' as const,
      icon: Briefcase,
      title: 'Empleado',
      description: 'Herramientas operativas: facturación, gestión de mesas y atención de pedidos.',
      gradient: 'from-purple-600 to-pink-600',
      modules: 12,
    },
  ];

  // --- MANEJADORES ---
  const handleRoleClick = (roleId: 'admin' | 'client' | 'employee') => {
    setSelectedRole(roleId);
    setEmail(''); 
    setPassword('');
    setIsLoginOpen(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) {
      onNavigate(selectedRole);
      setIsLoginOpen(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
    setIsRegisterOpen(false);
    handleRoleClick('client'); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Fondo Decorativo Suave */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-white/80 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/50 bg-white/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                {/* CAMBIO DE NOMBRE AQUÍ */}
                <span className="text-gray-900 font-bold block leading-none">Inventoring and Counting</span>
                <span className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">v1.0</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost"
                onClick={() => setIsRegisterOpen(true)}
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 hidden sm:flex"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Registrarse
              </Button>
              <Button 
                onClick={() => handleRoleClick('admin')}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        
        {/* --- NUEVA SECCIÓN: INTRODUCCIÓN (HERO) --- */}
        <section className="pt-20 pb-12 px-4 text-center max-w-4xl mx-auto">
          
          {/* Badge pequeña con el nombre */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 text-sm font-medium mb-6 animate-fade-in-up">
            <Sparkles className="w-4 h-4" />
            <span>Bienvenido a Inventoring and Counting</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Controla tu Negocio <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
               en un Solo Lugar
            </span>
          </h1>

          {/* Descripción */}
          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            La plataforma integral para administrar productos, inventarios, facturación y pedidos. 
            Simplifica la administración de tu empresa con herramientas potentes.
          </p>

          {/* Características rápidas */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
              <Zap className="w-4 h-4 text-amber-500" /> Rápido y Eficiente
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Seguro
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> Soporte 24/7
            </div>
          </div>
        </section>

        {/* --- SECCIÓN DE ROLES --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative">
            {/* Línea decorativa */}
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-50 px-4 text-sm text-slate-500 uppercase tracking-widest font-semibold">Acceso al Sistema</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {roles.map((role) => (
              <Card 
                key={role.id} 
                onClick={() => handleRoleClick(role.id)}
                className="group relative overflow-hidden p-8 hover:shadow-2xl transition-all duration-300 border-0 bg-white hover:-translate-y-1 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 from-blue-600 to-indigo-600"></div>
                
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <role.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3">{role.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {role.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {role.modules} módulos
                  </span>
                  <span className="text-blue-600 text-sm font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                    Ingresar <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200/60 bg-white/50">
        <p>© 2025 Inventoring and Counting. Todos los derechos reservados.</p>
      </footer>

      {/* --- MODAL LOGIN --- */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UserCog className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-slate-900">Bienvenido</DialogTitle>
            <DialogDescription className="text-center text-slate-500">
              Ingresa a <span className="font-semibold text-blue-600">Inventoring and Counting</span> como <span className="capitalize">{selectedRole}</span>
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLoginSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Correo Electrónico</Label>
              <Input 
                type="email" 
                placeholder="usuario@empresa.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Contraseña</Label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-12 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]">
              Ingresar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL REGISTRO --- */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-slate-900">Crear Cuenta</DialogTitle>
            <DialogDescription className="text-center text-slate-500">
              Únete a Inventoring and Counting hoy mismo
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRegisterSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input placeholder="Juan" required className="bg-slate-50"/>
                </div>
                <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input placeholder="Pérez" required className="bg-slate-50"/>
                </div>
            </div>
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input type="email" placeholder="juan@empresa.com" required className="bg-slate-50"/>
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input type="password" required className="bg-slate-50"/>
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg h-12 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02]">
              Registrarse Gratis
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}