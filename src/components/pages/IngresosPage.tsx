import { Card } from '../ui/card';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

export function IngresosPage() {
  const stats = [
    { title: 'Ingresos Hoy', value: '$2,450', color: 'bg-blue-500' },
    { title: 'Ingresos del Mes', value: '$45,890', color: 'bg-green-500' },
    { title: 'Promedio Diario', value: '$1,520', color: 'bg-purple-500' },
  ];

  const ingresosPorDia = [
    { fecha: '2025-11-05', ingresos: 2450, ordenes: 32 },
    { fecha: '2025-11-04', ingresos: 1890, ordenes: 28 },
    { fecha: '2025-11-03', ingresos: 2100, ordenes: 30 },
    { fecha: '2025-11-02', ingresos: 1750, ordenes: 25 },
    { fecha: '2025-11-01', ingresos: 2300, ordenes: 31 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900">Ingresos</h2>
        <p className="text-gray-600">Visualiza y analiza los ingresos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Ingresos por Día</h3>
        <div className="space-y-3">
          {ingresosPorDia.map((dia, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-gray-900">{dia.fecha}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-600">{dia.ordenes} órdenes</span>
                <span className="text-gray-900">${dia.ingresos}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
