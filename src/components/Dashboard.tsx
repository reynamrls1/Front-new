import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import authService from '../services/authService';
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
import { CategoriasPage } from './pages/CategoriasPage';
import { EstadosPage } from './pages/EstadosPage';
import { FacturasPage } from './pages/FacturaPage';
import { IngresosInsumosPage } from './pages/IngresoInsumosPage';
import { IngresosPage } from './pages/IngresosPage';
import { ProductosPage } from './pages/ProductosPage';
import { InsumosProductosPage } from './pages/InsumosProductosPage';

import { MesasPage } from './pages/MesasPage';
import { OrdenPage } from './pages/OrdenPage';
import { OrdenProductoPage } from './pages/OrdenProductoPage';
import { ProductoFacturaPage } from './pages/ProductoFacturaPage';
import { ReservacionPage } from './pages/ReservacionPage';
import { DashboardHome } from './pages/DashboardHome';
import { DocumentTypePage } from './pages/DocumentTypePage';
import { UsuarioPage } from './pages/UsuarioPage';
import { CondicionPage } from './pages/CondicionPage';
import { InsumoPage as InsumosPage } from './pages/InsumoPage';

type UserRole = 'admin' | 'client' | 'employee';

interface DashboardProps {
  onNavigateHome: () => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

type PageKey =
  | 'dashboard'
  | 'document-type'
  | 'usuarios'
  | 'categorias'
  | 'condicion'
  | 'estados'
  | 'facturas'
  | 'ingresos-insumos'
  | 'ingresos'
  | 'insumos'
  | 'productos'
  | 'insumos-productos'

  | 'mesas'
  | 'orden'
  | 'orden-producto'
  | 'producto-factura'
  | 'reservacion';

export function Dashboard({ onNavigateHome, userRole, onChangeRole }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Estados del usuario
  const [personName, setPersonName] = useState('');
  const [personEmail, setPersonEmail] = useState('');
  const [personPhone, setPersonPhone] = useState('');

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
      } catch (error) {
        console.error("Error cargando perfil", error);
      }
    };
    fetchUserData();
  }, []);

  // Definir menús para cada rol
  const adminMenuItems = [
    { key: 'dashboard' as PageKey, label: 'Inicio', icon: Home },
    { key: 'document-type' as PageKey, label: 'Tipo de Documento', icon: FileType },
    { key: 'usuarios' as PageKey, label: 'Usuarios', icon: Users },
    { key: 'ingresos' as PageKey, label: 'Ingresos', icon: DollarSign },
    { key: 'ingresos-insumos' as PageKey, label: 'Ingreso/Insumo', icon: TrendingUp },
    { key: 'insumos' as PageKey, label: 'Insumos', icon: Package },

    { key: 'categorias' as PageKey, label: 'Categorías', icon: FolderTree },
    { key: 'insumos-productos' as PageKey, label: 'Productos/Insumos', icon: Link2 },
    { key: 'productos' as PageKey, label: 'Productos', icon: Box },
    { key: 'producto-factura' as PageKey, label: 'Producto Factura', icon: Receipt },
    { key: 'facturas' as PageKey, label: 'Facturas', icon: FileText },
    { key: 'orden-producto' as PageKey, label: 'Pedido/Producto', icon: ClipboardList },
    { key: 'orden' as PageKey, label: 'Pedido', icon: ShoppingCart },
    { key: 'condicion' as PageKey, label: 'Condición', icon: CheckCircle },
    { key: 'reservacion' as PageKey, label: 'Reservación', icon: Calendar },
    { key: 'mesas' as PageKey, label: 'Mesas', icon: Utensils },
  ];

  const clientMenuItems = [
    { key: 'dashboard' as PageKey, label: 'Inicio', icon: Home },
    { key: 'insumos-productos' as PageKey, label: 'Producto/Insumo', icon: Link2 },
    { key: 'productos' as PageKey, label: 'Productos', icon: Box },
    { key: 'orden' as PageKey, label: 'Pedido', icon: ShoppingCart },
    { key: 'reservacion' as PageKey, label: 'Reservación', icon: Calendar },
    { key: 'mesas' as PageKey, label: 'Mesas', icon: Utensils },
  ];

  const employeeMenuItems = adminMenuItems; // Empleado tiene los mismos módulos que admin

  // Seleccionar menú según rol
  const menuItems = userRole === 'admin'
    ? adminMenuItems
    : userRole === 'client'
      ? clientMenuItems
      : employeeMenuItems;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'document-type':
        return <DocumentTypePage />;
      case 'usuarios':
        return <UsuarioPage />;
      case 'categorias':
        return <CategoriasPage />;
      case 'condicion':
        return <CondicionPage />;
      case 'estados':
        return <EstadosPage />;
      case 'facturas':
        return <FacturasPage />;
      case 'ingresos-insumos':
        return <IngresosInsumosPage />;
      case 'ingresos':
        return <IngresosPage />;
      case 'insumos':
        return <InsumosPage />;
      case 'productos':
        return <ProductosPage />;
      case 'insumos-productos':
        return <InsumosProductosPage />;

      case 'mesas':
        return <MesasPage />;
      case 'orden':
        return <OrdenPage />;
      case 'orden-producto':
        return <OrdenProductoPage />;
      case 'producto-factura':
        return <ProductoFacturaPage />;
      case 'reservacion':
        return <ReservacionPage />;
      default:
        return <DashboardHome />;
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