import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageneWithFallback';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShoppingCart,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import facturaService, { FacturaDTO } from '../../services/facturaService';
import productoService from '../../services/productoService';
import reservationService from '../../services/reservationService';

export function DashboardHome() {
  const [ingresosMes, setIngresosMes] = useState(0);
  const [productosCount, setProductosCount] = useState(0);
  const [ordenesHoy, setOrdenesHoy] = useState(0);
  const [reservacionesCount, setReservacionesCount] = useState(0);
  const [restauranteId, setRestauranteId] = useState<number | null>(null);

  useEffect(() => {
    const str = localStorage.getItem('restaurante');
    if (str) {
      try {
        const parsed = JSON.parse(str);
        const id = parsed.restauranteId || parsed.id;
        setRestauranteId(Number(id));
      } catch (e) {
        console.error("Error parsing restaurante from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (restauranteId) {
      loadData();
    }
  }, [restauranteId]);

  const loadData = async () => {
    try {
      const [facturas, productos, reservaciones] = await Promise.all([
        facturaService.getAll(restauranteId!),
        productoService.getAll(restauranteId!),
        reservationService.getReservationsByRestaurante(restauranteId!)
      ]);

      setProductosCount(productos.length);
      setReservacionesCount(reservaciones.length);

      // Calculos de hoy / mes actual
      const dateStrHoy = new Date().toLocaleDateString('es-CO'); 
      const monthPrefix = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

      const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
          return new Date(dateStr).toLocaleDateString('es-CO');
        } catch {
          return dateStr;
        }
      };

      let hoyOrdenesCount = 0;
      let mesTotal = 0;

      facturas.forEach((f: FacturaDTO) => {
        // Ordenes Hoy
        if (formatDate(f.date) === dateStrHoy) {
          hoyOrdenesCount++;
        }
        // Ingresos del Mes (facturas cuyo date comience con YYYY-MM)
        if (f.date && f.date.startsWith(monthPrefix)) {
          mesTotal += (f.total || 0);
        }
      });

      setOrdenesHoy(hoyOrdenesCount);
      setIngresosMes(mesTotal);
    } catch (e) {
      console.error("Error cargando dashboard estats", e);
    }
  };

  const stats = [
    {
      title: 'Ingresos del Mes',
      value: `$${ingresosMes.toLocaleString()}`,
      change: '+12.5%', // Opcional: Calcular este delta si hay data historica
      icon: DollarSign,
      gradient: 'from-blue-500 to-cyan-500',
      isPositive: true,
    },
    {
      title: 'Productos',
      value: productosCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      change: '+8.2%',
      icon: Package,
      gradient: 'from-emerald-500 to-teal-500',
      isPositive: true,
    },
    {
      title: 'Órdenes Hoy',
      value: ordenesHoy.toString(),
      change: '+23.1%',
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-pink-500',
      isPositive: true,
    },
    {
      title: 'Reservaciones',
      value: reservacionesCount.toString(),
      change: '+5.4%',
      icon: Calendar,
      gradient: 'from-orange-500 to-red-500',
      isPositive: true,
    },
  ];

  const recentActivity = [
    { action: 'Nueva orden #1234', time: 'Hace 5 minutos', type: 'order' },
    { action: 'Reservación confirmada', time: 'Hace 15 minutos', type: 'reservation' },
    { action: 'Producto agregado', time: 'Hace 1 hora', type: 'product' },
    { action: 'Factura generada #567', time: 'Hace 2 horas', type: 'invoice' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gray-900 mb-2">Bienvenido al Dashboard</h2>
        <p className="text-gray-600 text-lg">
          Aquí tienes un resumen de las actividades de tu negocio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="group relative p-6 border-0 bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500" style={{
              backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`
            }}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className={`bg-gradient-to-br ${stat.gradient} p-3.5 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                  stat.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">{stat.title}</p>
              <p className="text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="p-8 border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-gray-900 mb-6">Actividad Reciente</h3>
          <div className="space-y-5">
            {recentActivity.map((activity, index) => (
              <div key={index} className="group flex items-start gap-4 pb-5 border-b border-gray-100 last:border-0 hover:bg-blue-50/50 -mx-4 px-4 py-3 rounded-xl transition-all">
                <div className="mt-1">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full group-hover:scale-125 transition-transform shadow-lg shadow-blue-500/30"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-8 border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-gray-900 mb-6">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="group p-5 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl text-left transition-all hover:scale-105 hover:shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                <Package className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-900">Agregar Producto</p>
            </button>
            <button className="group p-5 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl text-left transition-all hover:scale-105 hover:shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-900">Nueva Orden</p>
            </button>
            <button className="group p-5 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-2xl text-left transition-all hover:scale-105 hover:shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-900">Nueva Reservación</p>
            </button>
            <button className="group p-5 bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-2xl text-left transition-all hover:scale-105 hover:shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/30">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-900">Ver Reportes</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Featured Banner with Image */}
      <Card className="relative p-0 border-0 bg-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden h-64">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1630283017802-785b7aff9aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYyNDExNzUwfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Business workspace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-indigo-900/80 to-purple-900/70"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-between px-12">
          <div className="text-white space-y-3">
            <h3 className="text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Optimiza tu Gestión Empresarial
            </h3>
            <p className="text-blue-100 text-lg max-w-2xl">
              Descubre nuevas funcionalidades para llevar tu negocio al siguiente nivel
            </p>
          </div>
          <Button 
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
          >
            Explorar
            <ArrowUpRight className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

import { Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
