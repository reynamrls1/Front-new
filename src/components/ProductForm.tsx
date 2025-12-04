import { useState } from 'react';
// ELIMINADO: import { Product } from '../../App'; -> Ya no lo necesitamos importar
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea'; // Ahora funcionará gracias al Paso 1
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { toast } from 'sonner';

// DEFINICIÓN LOCAL DEL TIPO PRODUCT (Para arreglar el error de importación)
export interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  description: string;
  createdAt?: string | Date;
}

interface ProductFormProps {
  // Ajustamos el tipo para que sea compatible
  onSubmit: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  initialData?: Product;
  onCancel?: () => void;
}

const categories = [
  'Electrónica',
  'Muebles',
  'Ropa',
  'Alimentos',
  'Herramientas',
  'Deportes',
  'Libros',
  'Otros',
];

export function ProductForm({ onSubmit, initialData, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    quantity: initialData?.quantity?.toString() || '',
    price: initialData?.price?.toString() || '',
    description: initialData?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.quantity || !formData.price) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const quantity = parseInt(formData.quantity);
    const price = parseFloat(formData.price);

    if (isNaN(quantity) || quantity < 0) {
      toast.error('La cantidad debe ser un número válido');
      return;
    }

    if (isNaN(price) || price < 0) {
      toast.error('El precio debe ser un número válido');
      return;
    }

    onSubmit({
      name: formData.name,
      category: formData.category,
      quantity,
      price,
      description: formData.description,
    });

    toast.success(initialData ? 'Producto actualizado' : 'Producto agregado correctamente');

    if (!initialData) {
      setFormData({
        name: '',
        category: '',
        quantity: '',
        price: '',
        description: '',
      });
    }

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="p-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Laptop Dell XPS 15"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad *</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del producto..."
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">
            {initialData ? 'Actualizar Producto' : 'Agregar Producto'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}