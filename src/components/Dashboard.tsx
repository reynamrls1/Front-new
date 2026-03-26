import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import authService from '../services/authService';
import api from '../services/api';
import {
  Home,
  FolderTree,
  CircleDot,
  FileText,
  TrendingUp,
  DollarSign,
  Package,
  Box,
  Link2,
  Ruler,
  Utensils,
  ShoppingCart,
  AlertTriangle,
  ClipboardList,
  Receipt,
  Calendar,
  Menu,
  X,
  FileType,
  Users,
  CheckCircle,
  UserCog,
  User,
  Briefcase,
  ChevronDown,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Footer } from './Footer';

// Importar las páginas de contenido
import { FacturasPage } from './pages/FacturaPage';


import { ProductosPage } from './pages/ProductosPage';
import { InsumosProductosPage } from './pages/InsumosProductosPage';

import { MesasPage } from './pages/MesasPage';


import { ReservacionPage } from './pages/ReservacionPage';
import { DashboardHome } from './pages/DashboardHome';

import { UsuarioPage } from './pages/UsuarioPage';
import { InsumoPage as InsumosPage } from './pages/InsumoPage';
import { SolicitudesPage } from './pages/SolicitudesPage';
import { EmpleadosPage } from './pages/EmpleadosPage';

type UserRole = 'admin' | 'client' | 'employee';

interface DashboardProps {
  onNavigateHome: () => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

type PageKey =
  | 'dashboard'

  | 'usuarios'
  | 'empleados'
  | 'solicitudes'
  | 'facturas'


  | 'insumos'
  | 'productos'
  | 'insumos-productos'

  | 'mesas'

  | 'reservacion';

export function Dashboard({ onNavigateHome, userRole, onChangeRole }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Estados del usuario
  const [personName, setPersonName] = useState('');
  const [personEmail, setPersonEmail] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [employeeApproved, setEmployeeApproved] = useState<boolean | null>(null); // null = loading

  useEffect(() => {

    const fetchUserData = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser.personId) {
          const personData = await authService.getPerson(parseInt(currentUser.personId));
          setPersonName(`${personData.firstName} ${personData.firstLastName}`);
          setPersonPhone(personData.phoneNumber);
          const storedEmail = localStorage.getItem('user_email');
          if (storedEmail) setPersonEmail(storedEmail);
        }

        // AUTO-SELECT RESTAURANT IF MISSING
        if (!localStorage.getItem('restaurante')) {
          const storedRestaurantes = localStorage.getItem('user_restaurantes');
          if (storedRestaurantes) {
            try {
              const parsed = JSON.parse(storedRestaurantes);
              if (Array.isArray(parsed) && parsed.length > 0) {
                console.log("Auto-seleccionando restaurante:", parsed[0]);
                localStorage.setItem('restaurante', JSON.stringify(parsed[0]));
                // Force reload to apply changes if needed, or just let components read it?
                // Components read it on mount usually. Since dashboard mounts components dynamically, it might be fine.
                // But if ProductosPage is already mounted (default), it might need a trigger.
                // However, setCurrentPage('dashboard') is default.
              }
            } catch (e) {
              console.error("Error parsing user_restaurantes", e);
            }
          }
        }

      } catch (error) {
        console.error("Error cargando perfil", error);
      }
    };
    fetchUserData();

    // Para empleados: verificar si tienen solicitud aprobada
    if (userRole === 'employee') {
      const checkEmployeeApproval = async () => {
        try {
          const storedUserId = localStorage.getItem('user_id');
          if (!storedUserId) {
            setEmployeeApproved(false);
            return;
          }
          const response = await api.get(`/api/solicitudes/usuario/${storedUserId}`);
          const solicitudes = response.data;
          const approvedSolicitud = solicitudes.find((s: any) => s.estado === 'APROBADA');
          const hasApproved = !!approvedSolicitud;
          setEmployeeApproved(hasApproved);

          if (hasApproved) {
            // Restaurar datos del restaurante en localStorage desde la solicitud aprobada
            const restId = approvedSolicitud.restauranteId;
            const restName = approvedSolicitud.nombreRestaurante;
            const restData = { restauranteId: restId, id: restId, nombre: restName };
            localStorage.setItem('restaurante', JSON.stringify(restData));
            localStorage.setItem('user_restaurantes', JSON.stringify([restData]));
          } else {
            // Si no está aprobado, limpiar localStorage del restaurante para que no cargue datos
            localStorage.removeItem('restaurante');
            localStorage.removeItem('user_restaurantes');
          }
        } catch (error) {
          console.error('Error verificando aprobación de empleado', error);
          setEmployeeApproved(false);
        }
      };
      checkEmployeeApproval();
    } else {
      setEmployeeApproved(true); // Admin y cliente no requieren verificación
    }
  }, [userRole]);

  // Definir menús para cada rol
  const adminMenuItems = [
    { key: 'dashboard' as PageKey, label: 'Inicio', icon: Home },
    { key: 'solicitudes' as PageKey, label: 'Solicitudes', icon: CircleDot },
    { key: 'empleados' as PageKey, label: 'Empleados', icon: Users },
    // Eliminado: Document Type


    { key: 'insumos' as PageKey, label: 'Insumos', icon: Package },

    { key: 'insumos-productos' as PageKey, label: 'Recetas', icon: Link2 }, // Renamed to clarify
    { key: 'productos' as PageKey, label: 'Productos', icon: Box },
    // Eliminado: Producto Factura
    { key: 'facturas' as PageKey, label: 'Facturas', icon: FileText },

    { key: 'reservacion' as PageKey, label: 'Reservación', icon: Calendar },
    { key: 'mesas' as PageKey, label: 'Mesas', icon: Utensils },
  ];

  const clientMenuItems = [
    { key: 'dashboard' as PageKey, label: 'Inicio', icon: Home },
    { key: 'reservacion' as PageKey, label: 'Reservar Restaurante', icon: Calendar },
    // { key: 'mesas' as PageKey, label: 'Mesas', icon: Utensils }, // Maybe keep or remove? Keep for now.
  ];

  const employeeMenuItems = [
    { key: 'dashboard' as PageKey, label: 'Inicio', icon: Home },
    { key: 'solicitudes' as PageKey, label: 'Mis Solicitudes', icon: CircleDot },

    { key: 'insumos' as PageKey, label: 'Insumos', icon: Package },
    { key: 'insumos-productos' as PageKey, label: 'Recetas', icon: Link2 },
    { key: 'productos' as PageKey, label: 'Productos', icon: Box },


    { key: 'facturas' as PageKey, label: 'Facturas', icon: FileText },
    { key: 'reservacion' as PageKey, label: 'Reservación', icon: Calendar },
    { key: 'mesas' as PageKey, label: 'Mesas', icon: Utensils },
  ];

  // Menú reducido para empleados sin aprobación (solo Inicio y Solicitudes)
  const employeeUnapprovedMenuItems = [
    { key: 'dashboard' as PageKey, label: 'Inicio', icon: Home },
    { key: 'solicitudes' as PageKey, label: 'Mis Solicitudes', icon: CircleDot },
  ];

  // Seleccionar menú según rol y estado de aprobación
  const menuItems = userRole === 'admin'
    ? adminMenuItems
    : userRole === 'client'
      ? clientMenuItems
      : (employeeApproved === true ? employeeMenuItems : employeeUnapprovedMenuItems);

  // Componente de advertencia para empleados no aprobados
  const EmployeeNotApprovedWarning = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">No estás vinculado a un restaurante</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Tu solicitud de asociación aún no ha sido aprobada por el administrador del restaurante. 
            Mientras tanto, solo puedes acceder a <strong>Mis Solicitudes</strong> para verificar el estado.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 font-medium">¿Qué puedes hacer?</p>
          <ul className="text-xs text-amber-700 mt-2 space-y-1 text-left list-disc list-inside">
            <li>Ve a <strong>Mis Solicitudes</strong> para ver el estado de tu solicitud</li>
            <li>Si no has enviado una solicitud, búscala desde esa sección</li>
            <li>Espera a que el administrador apruebe tu solicitud</li>
          </ul>
        </div>
        <Button
          onClick={() => setCurrentPage('solicitudes')}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
        >
          <CircleDot className="w-4 h-4 mr-2" />
          Ir a Mis Solicitudes
        </Button>
      </div>
    </div>
  );

  const renderPage = () => {
    // Si es empleado no aprobado, solo mostrar solicitudes y dashboard (con warning)
    if (userRole === 'employee' && employeeApproved !== true) {
      if (currentPage === 'solicitudes') {
        return <SolicitudesPage />;
      }
      return <EmployeeNotApprovedWarning />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome onNavigate={(page) => setCurrentPage(page as PageKey)} />;

      case 'usuarios':
        return <UsuarioPage />;
      case 'empleados':
        return <EmpleadosPage />;
      case 'solicitudes':
        return <SolicitudesPage />;
      case 'facturas':
        return <FacturasPage />;


      case 'insumos':
        return <InsumosPage />;
      case 'productos':
        return <ProductosPage />;
      case 'insumos-productos':
        return <InsumosProductosPage />;

      case 'mesas':
        return <MesasPage />;


      case 'reservacion':
        return <ReservacionPage />;
      default:
        return <DashboardHome onNavigate={(page) => setCurrentPage(page as PageKey)} />;
    }
  };

  const currentMenuItem = menuItems.find(item => item.key === currentPage);

  const getRoleName = () => {
    switch (userRole) {
      case 'admin': return 'Administrador';
      case 'client': return 'Cliente';
      case 'employee': return 'Empleado';
    }
  };

  const getRoleInitial = () => {
    switch (userRole) {
      case 'admin': return 'A';
      case 'client': return 'C';
      case 'employee': return 'E';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin': return UserCog;
      case 'client': return User;
      case 'employee': return Briefcase;
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    onChangeRole(newRole);
    setCurrentPage('dashboard'); // Volver al inicio al cambiar de rol
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-0'
          } transition-all duration-300 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white flex flex-col overflow-hidden shadow-2xl relative`}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

        <div className="relative p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-2xl shadow-xl shadow-blue-500/30">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white">Dashboard</h2>
              <p className="text-blue-200 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Sistema de Gestión
              </p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 relative min-h-0 [&_[data-slot=scroll-area-thumb]]:bg-white/20 hover:[&_[data-slot=scroll-area-thumb]]:bg-white/40">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                className={`group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${currentPage === item.key
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-500/30'
                  : 'text-blue-100/80 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                  }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${currentPage === item.key ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                <span className="text-sm">{item.label}</span>
                {currentPage === item.key && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>
        </ScrollArea>

        <div className="relative p-4 border-t border-white/10 backdrop-blur-sm">
          <Button
            onClick={onNavigateHome}
            variant="outline"
            className="w-full border-white/20 text-blue-100 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all relative group/home"
          >
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover/home:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Home className="w-4 h-4 group-hover/home:scale-110 transition-transform" />
              Volver al Inicio
            </span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div>
                <h1 className="text-gray-900 flex items-center gap-2">
                  {currentMenuItem?.label || 'Dashboard'}
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
                    Activo
                  </span>
                </h1>
                <p className="text-sm text-gray-500">
                  Gestiona {currentMenuItem?.label.toLowerCase() || 'tu sistema'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:bg-blue-50 p-2 rounded-xl transition-all group">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-900 font-semibold">{personName || 'Usuario'}</p>
                      <p className="text-xs text-gray-500">{getRoleName()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                        {getRoleInitial()}
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold text-gray-900">{personName || 'Cargando...'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{personEmail}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      {getRoleName()}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="my-2" />

                  {/* Información extra si se desea */}
                  {personPhone && (
                    <DropdownMenuItem className="text-xs text-gray-500 cursor-default">
                      📞 {personPhone}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-2" />

                  <DropdownMenuItem
                    onClick={onNavigateHome}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {renderPage()}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}