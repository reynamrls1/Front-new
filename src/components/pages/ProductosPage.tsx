import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog';

// Importamos los componentes que ya arreglamos antes
// NOTA: Si te salen en rojo las rutas, ajusta los '../' según tu carpeta
import { ProductTable, Product } from '../ProductTable';
import { ProductStats } from '../ProductStatus';
import { ProductForm } from '../ProductForm';

export function ProductosPage() {
  // Datos de ejemplo para que no salga vacío
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: 'Laptop HP Pavilion',
      category: 'Electrónica',
      quantity: 12,
      price: 2500000,
      description: 'Laptop para trabajo pesado',
    },
    {
      id: 2,
      name: 'Silla Ergonómica',
      category: 'Muebles',
      quantity: 3,
      price: 450000,
      description: 'Silla de oficina con soporte lumbar',
    },
    {
      id: 3,
      name: 'Mouse Inalámbrico',
      category: 'Electrónica',
      quantity: 0,
      price: 50000,
      description: 'Mouse óptico',
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Función para crear producto
  const handleCreate = (newProductData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: Math.max(...products.map(p => p.id), 0) + 1, // Generar ID simple
      createdAt: new Date().toISOString()
    };
    setProducts([...products, newProduct]);
    setIsDialogOpen(false);
  };

  // Función para actualizar producto
  const handleUpdate = (id: number, updatedData: Partial<Product>) => {
    setProducts(products.map(p => (p.id === id ? { ...p, ...updatedData } : p)));
  };

  // Función para eliminar producto
  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">Gestiona el inventario y precios de tu negocio.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Producto</DialogTitle>
            </DialogHeader>
            <ProductForm 
              onSubmit={handleCreate} 
              onCancel={() => setIsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tarjetas de Estadísticas (ProductStatus) */}
      <ProductStats products={products} />

      {/* Tabla de Productos (ProductTable) */}
      <ProductTable 
        products={products} 
        onUpdate={handleUpdate} 
        onDelete={handleDelete} 
      />
    </div>
  );
}