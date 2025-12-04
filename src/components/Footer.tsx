import { Package, Heart, Github, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white border-t border-white/10">
      <div className="relative">
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        
        <div className="relative px-8 py-6">
          {/* Contenido principal del footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {/* Sección 1: Información de la empresa */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl shadow-lg shadow-blue-500/30">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white">Sistema de Gestión</h3>
              </div>
              <p className="text-blue-200 text-sm">
                Plataforma completa para la administración de inventarios, pedidos, facturación y más.
              </p>
            </div>

            {/* Sección 2: Enlaces rápidos */}
            <div className="space-y-3">
              <h3 className="text-white">Contacto</h3>
              <div className="space-y-2 text-sm text-blue-200">
                <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                  <Mail className="w-4 h-4" />
                  <span>info@sistemagestion.com</span>
                </div>
                <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                  <Phone className="w-4 h-4" />
                  <span>+57 300 123 4567</span>
                </div>
                <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                  <MapPin className="w-4 h-4" />
                  <span>Colombia</span>
                </div>
              </div>
            </div>

            {/* Sección 3: Información técnica */}
            <div className="space-y-3">
              <h3 className="text-white">Tecnología</h3>
              <div className="space-y-2 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>React + TypeScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Tailwind CSS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Sistema en tiempo real</span>
                </div>
              </div>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="border-t border-white/10 mb-4"></div>

          {/* Copyright y créditos */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <span>© {currentYear} Sistema de Gestión de Inventario.</span>
              <span className="hidden md:inline">Todos los derechos reservados.</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Hecho con</span>
              <Heart className="w-4 h-4 text-red-400 fill-red-400 animate-pulse" />
              <span>en Colombia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
