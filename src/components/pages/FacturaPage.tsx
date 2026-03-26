import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Plus, Eye, Trash2, ShoppingCart, X, DollarSign, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import facturaService, { FacturaDTO } from '../../services/facturaService';
import productoFacturaService, { ProductoFacturaDTO } from '../../services/productoFacturaService';
import productoService, { ProductDTO } from '../../services/productoService';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export function FacturasPage() {
  const [facturas, setFacturas] = useState<FacturaDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentFactura, setCurrentFactura] = useState<FacturaDTO | null>(null);
  const [facturaProducts, setFacturaProducts] = useState<ProductoFacturaDTO[]>([]);
  const [restauranteId, setRestauranteId] = useState<number | null>(null);

  // Form state for creating new factura
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

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
      if (!restauranteId) return;
      setLoading(true);
      const [facturasData, productsData] = await Promise.all([
        facturaService.getAll(restauranteId),
        productoService.getAll(restauranteId)
      ]);
      setFacturas(facturasData);
      setProducts(productsData);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (factura: FacturaDTO) => {
    setCurrentFactura(factura);
    try {
      // Load products for this factura
      const prods = await productoFacturaService.getByFactura(factura.id!);
      setFacturaProducts(prods);
    } catch (error) {
      console.error(error);
      setFacturaProducts([]);
    }
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "¿Deseas eliminar esta factura?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await facturaService.delete(id);
        Swal.fire('Eliminado', 'La factura ha sido eliminada.', 'success');
        loadData();
      } catch (error) {
        Swal.fire('Error', 'Error al eliminar la factura', 'error');
      }
    }
  };

  const handleOpenCreate = () => {
    setCart([]);
    setSelectedProductId('');
    setQuantity(1);
    setIsDialogOpen(true);
  };

  const addToCart = () => {
    if (!selectedProductId) {
      toast.error("Selecciona un producto");
      return;
    }
    const product = products.find(p => p.id?.toString() === selectedProductId);
    if (!product) return;

    // Check if already in cart
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id!,
        productName: product.name,
        price: product.price,
        quantity: quantity
      }]);
    }
    setSelectedProductId('');
    setQuantity(1);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    try {
      // 1. Get personId from logged in user
      const personId = parseInt(localStorage.getItem('person_id') || '0');
      if (!personId) {
        toast.error("No se encontró el usuario. Inicia sesión.");
        return;
      }

      // 2. Create the factura first
      const facturaData: FacturaDTO = {
        personId: personId,
        date: new Date().toISOString().split('T')[0],
        total: calculateTotal(),
        restauranteId: restauranteId!
      };

      const createdFactura = await facturaService.create(facturaData);

      // 3. Create ProductoFactura for each cart item (this will deduct insumos)
      for (const item of cart) {
        const productoFacturaData: ProductoFacturaDTO = {
          productId: item.productId,
          billId: createdFactura.id!,
          amount: item.quantity,
          price: item.price * item.quantity
        };
        await productoFacturaService.create(productoFacturaData);
      }

      toast.success("Factura creada y stock de insumos actualizado");
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear factura");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('es-CO');
    } catch {
      return dateStr;
    }
  };

  if (loading) return <div className="p-8">Cargando facturas...</div>;

  // Calculo de estadísticas - usando comparación de strings para evitar problemas de timezone
  const todayISO = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const monthPrefix = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  // Facturas de hoy (comparación por string del date ISO)
  const facturasHoy = facturas.filter(f => f.date && f.date.startsWith(todayISO));
  const totalHoy = facturasHoy.reduce((acc, f) => acc + (f.total || 0), 0);
  const numFacturasHoy = facturasHoy.length;

  // Facturas del mes
  const facturasMes = facturas.filter(f => f.date && f.date.startsWith(monthPrefix));
  const totalMes = facturasMes.reduce((acc, f) => acc + (f.total || 0), 0);
  const numFacturasMes = facturasMes.length;

  // Total general (todas las facturas)
  const totalGeneral = facturas.reduce((acc, f) => acc + (f.total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold">Facturas</h2>
          <p className="text-gray-600">Gestiona y consulta facturas de ventas</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/30">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                ${totalMes.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg shadow-green-500/30">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Ingresos Hoy</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                ${totalHoy.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-500/30">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Facturas del Mes</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {numFacturasMes}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-2xl shadow-lg shadow-orange-500/30">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Total Facturas</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {facturas.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facturas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No hay facturas registradas.
                </TableCell>
              </TableRow>
            ) : (
              facturas.map((factura) => (
                <TableRow key={factura.id} className="hover:bg-blue-50/50 transition-colors">
                  <TableCell className="text-gray-900 font-medium">#{factura.id}</TableCell>
                  <TableCell>{factura.personNombre || `Persona #${factura.personId}`}</TableCell>
                  <TableCell>{formatDate(factura.date)}</TableCell>
                  <TableCell className="font-semibold text-green-600">${factura.total?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{factura.cantidadProductos || 0} items</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(factura)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(factura.id!)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* CREATE FACTURA DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Nueva Factura
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Product Selection */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-gray-700">Agregar Productos</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona producto" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      {products.map(p => {
                        const stock = p.calculatedStock !== undefined ? p.calculatedStock : 0;
                        const hasStock = stock > 0;
                        return (
                          <SelectItem
                            key={p.id}
                            value={p.id?.toString() || ''}
                            disabled={!hasStock}
                            className={!hasStock ? "opacity-50" : ""}
                          >
                            {p.name} - ${p.price?.toLocaleString()}
                            {hasStock ? ` (Disp: ${stock})` : ' (Sin Stock)'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    placeholder="Cant."
                  />
                </div>
                <Button type="button" onClick={addToCart} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Cart */}
            {cart.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price?.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${(item.price * item.quantity).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.productId)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <span className="text-lg font-medium text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-purple-600">
                ${calculateTotal().toLocaleString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                disabled={cart.length === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Crear Factura
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIEW FACTURA DIALOG */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Factura #{currentFactura?.id}</DialogTitle>
          </DialogHeader>
          {currentFactura && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Cliente</Label>
                  <p className="font-medium">{currentFactura.personNombre || `ID: ${currentFactura.personId}`}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Fecha</Label>
                  <p className="font-medium">{formatDate(currentFactura.date)}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-500 mb-2 block">Productos</Label>
                {facturaProducts.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-center">Cant.</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {facturaProducts.map((pf) => (
                          <TableRow key={pf.id}>
                            <TableCell>{pf.productName || `Producto #${pf.productId}`}</TableCell>
                            <TableCell className="text-center">{pf.amount}</TableCell>
                            <TableCell className="text-right">${pf.price?.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Sin productos registrados</p>
                )}
              </div>

              <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                <span className="text-lg font-medium text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${currentFactura.total?.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
