// ELIMINADO: import { Product } from '../../App'; 
import { Card } from './ui/card';
import { Package, DollarSign, TrendingDown, Layers } from 'lucide-react';

// AGREGADO: Definimos el tipo aquí mismo para arreglar el error
interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  description: string;
  createdAt?: string | Date;
}

interface ProductStatsProps {
  products: Product[];
}

export function ProductStats({ products }: ProductStatsProps) {
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalValue = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  const lowStock = products.filter((product) => product.quantity < 5).length;

  const stats = [
    {
      title: 'Total de Productos',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Cantidad Total',
      value: totalQuantity,
      icon: Layers,
      color: 'bg-green-500',
    },
    {
      title: 'Valor Total',
      value: `$${totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Stock Bajo',
      value: lowStock,
      icon: TrendingDown,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              {/* Le agregué font-bold y text-2xl para que el número se vea grande y bonito */}
              <p className="text-gray-900 mt-2 text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg shadow-md`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}