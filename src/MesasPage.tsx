"use client";

import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Users, Utensils } from 'lucide-react';
import Swal from 'sweetalert2';

// 1. Types
interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: string;
  zona: string;
}

type MesaFormData = Omit<Mesa, 'id'> & { numero: string; capacidad: string };

// 2. Button (Simplificado)
const buttonVariants = (variant: 'default' | 'outline' | 'ghost', size: 'sm' | 'default') => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-sm";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700",
    ghost: "hover:bg-slate-100",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
  };
  return `${base} ${variants[variant]} ${sizes[size]}`;
};

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost'; size?: 'sm' | 'default'; }> = ({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  ...props
}) => (
  <button className={`${buttonVariants(variant, size)} ${className}`} {...props}>
    {children}
  </button>
);

// 3. Input
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    className={`flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// 4. Label
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className = '', children, ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
    {children}
  </label>
);

// 5. Card
const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`rounded-xl border bg-white shadow-lg ${className}`} {...props}>
    {children}
  </div>
);

// 6. Badge
const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = '', children, ...props }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`} {...props}>
    {children}
  </span>
);

// 7. Dialog Components (Modal simplificado)
const Dialog: React.FC<{ open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => onOpenChange(false)} />
      {children}
    </div>
  );
};

const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div
    className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-6 shadow-2xl transition-all duration-200 sm:max-w-md sm:rounded-xl ${className}`}
    {...props}
  >
    {children}
    <button
      onClick={(e) => { e.stopPropagation(); (e.currentTarget.closest('.fixed.inset-0.z-50') as HTMLDivElement)?.click(); }}
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500"><path d="M18 6L6 18M6 6l12 12" /></svg>
    </button>
  </div>
);

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props} />
);

const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', ...props }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight text-slate-900 ${className}`} {...props} />
);

// 8. Select Components (Funcionalidad simplificada para un solo archivo)

interface SelectOption {
  value: string;
  label: React.ReactNode;
}

const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
} | undefined>(undefined);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('Select components must be used within <Select>');
  return context;
};

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const options: SelectOption[] = [];

  // Extrae opciones del SelectContent
  React.Children.forEach(children, (child) => {
    if (
      React.isValidElement(child) &&
      (child.type as any).displayName === "SelectContent"
    ) {
      const contentElement = child as React.ReactElement<{
        children: React.ReactNode;
      }>;

      React.Children.forEach(contentElement.props.children, (item) => {
        if (
          React.isValidElement(item) &&
          (item.type as any).displayName === "SelectItem"
        ) {
          const element = item as React.ReactElement<{
            value: string;
            children: React.ReactNode;
          }>;

          options.push({
            value: element.props.value,
            label: element.props.children,
          });
        }
      });
    }
  });

  return (
    <SelectContext.Provider value={{ value, onValueChange, options }}>
      {children}
    </SelectContext.Provider>
  );
};

(Select as any).displayName = "Select";


// SelectTrigger
const SelectTrigger: React.FC<React.HTMLAttributes<HTMLButtonElement>> = ({ className, children, ...props }) => {
  const { value, onValueChange, options } = useSelectContext();
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel = options.find(o => o.value === value)?.label || 'Selecciona...';

  return (
    <div className="relative">
      <button
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        <span className="truncate text-slate-700">{currentLabel}</span>

        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full rounded-lg border border-slate-200 bg-white shadow-lg mt-1 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`block w-full text-left px-3 py-2 text-sm ${option.value === value ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-blue-50/50 text-slate-700'}`}
              onClick={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
(SelectTrigger as any).displayName = 'SelectTrigger';
// SelectValue
const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const { value, options } = useSelectContext();
  const currentLabel = options.find(o => o.value === value)?.label;
  return <span>{currentLabel || placeholder}</span>;
};
(SelectValue as any).displayName = 'SelectValue';

// SelectContent
const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
(SelectContent as any).displayName = 'SelectContent';

// SelectItem
const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children
}) => {
  return <div data-value={value}>{children}</div>;
};
(SelectItem as any).displayName = 'SelectItem';

/* ---------------------------------------
    PÁGINA PRINCIPAL: MesasPage
---------------------------------------- */

export default function MesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>([
    { id: 1, numero: 1, capacidad: 4, estado: "Disponible", zona: "Interior" },
    { id: 2, numero: 2, capacidad: 2, estado: "Ocupada", zona: "Terraza" }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentMesa, setCurrentMesa] = useState<Mesa | null>(null);

  interface MesaFormData {
    numero: string;
    capacidad: string;
    estado: string;
    zona: string;
  }

  const [formData, setFormData] = useState<MesaFormData>({
    numero: "",
    capacidad: "",
    estado: "Disponible",
    zona: "Interior"
  });

  // 🟢 Abrir modal para agregar
  const handleAdd = () => {
    setCurrentMesa(null);
    setFormData({
      numero: "",
      capacidad: "",
      estado: "Disponible",
      zona: "Interior"
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  // 🟢 Abrir modal para editar
  const handleEdit = (mesa: Mesa) => {
    setCurrentMesa(mesa);
    setFormData({
      numero: mesa.numero.toString(),
      capacidad: mesa.capacidad.toString(),
      estado: mesa.estado,
      zona: mesa.zona,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  // 🟢 Modal en modo vista
  const handleView = (mesa: Mesa) => {
    setCurrentMesa(mesa);
    setFormData({
      numero: mesa.numero.toString(),
      capacidad: mesa.capacidad.toString(),
      estado: mesa.estado,
      zona: mesa.zona,
    });
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  // 🟢 Guardar mesa nueva o editada
  const handleSave = () => {
    if (!formData.numero.trim() || !formData.capacidad.trim()) {
      Swal.fire('Validación', 'Todos los campos son obligatorios', 'warning');
      return;
    }

    const parsedMesa: Mesa = {
      id: currentMesa ? currentMesa.id : mesas.length + 1,
      numero: Number(formData.numero),
      capacidad: Number(formData.capacidad),
      estado: formData.estado,
      zona: formData.zona,
    };

    if (currentMesa) {
      // Editar
      setMesas(mesas.map(m => (m.id === currentMesa.id ? parsedMesa : m)));
    } else {
      // Crear
      setMesas([...mesas, parsedMesa]);
    }

    setIsDialogOpen(false);
  };

  // 🟢 Borrar mesa
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "¿Deseas eliminar esta mesa?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setMesas(mesas.filter(m => m.id !== id));
      Swal.fire('Eliminado', 'La mesa ha sido eliminada.', 'success');
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-700">
          <Utensils className="h-7 w-7" />
          Gestión de Mesas
        </h1>

        <Button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Nueva Mesa
        </Button>
      </div>

      {/* Lista de Mesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mesas.map((mesa) => (
          <Card key={mesa.id} className="p-5 border rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-slate-800">Mesa #{mesa.numero}</h2>

            <div className="mt-3 flex flex-col gap-1 text-slate-600 text-sm">
              <p><strong>Capacidad:</strong> {mesa.capacidad} personas</p>
              <p><strong>Zona:</strong> {mesa.zona}</p>
              <p className="flex items-center gap-1">
                <strong>Estado:</strong>
                <Badge className={
                  mesa.estado === "Disponible" ? "bg-green-600" :
                    mesa.estado === "Ocupada" ? "bg-red-600" :
                      "bg-yellow-600"}>
                  {mesa.estado}
                </Badge>
              </p>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => handleView(mesa)}>
                <Eye size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleEdit(mesa)}>
                <Edit size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(mesa.id)}>
                <Trash2 size={16} className="text-red-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isViewMode
                ? "Detalles de Mesa"
                : currentMesa
                  ? "Editar Mesa"
                  : "Nueva Mesa"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Número */}
            <div>
              <Label>Número de Mesa</Label>
              <Input
                type="number"
                disabled={isViewMode}
                value={formData.numero}
                onChange={(e) =>
                  setFormData({ ...formData, numero: e.target.value })
                }
              />
            </div>

            {/* Capacidad */}
            <div>
              <Label>Capacidad</Label>
              <Input
                type="number"
                disabled={isViewMode}
                value={formData.capacidad}
                onChange={(e) =>
                  setFormData({ ...formData, capacidad: e.target.value })
                }
              />
            </div>

            {/* Estado */}
            <div>
              <Label>Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(v) => setFormData({ ...formData, estado: v })}
              >
                <SelectTrigger />
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Ocupada">Ocupada</SelectItem>
                  <SelectItem value="Reservada">Reservada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Zona */}
            <div>
              <Label>Zona</Label>
              <Select
                value={formData.zona}
                onValueChange={(v) => setFormData({ ...formData, zona: v })}
              >
                <SelectTrigger />
                <SelectContent>
                  <SelectItem value="Interior">Interior</SelectItem>
                  <SelectItem value="Terraza">Terraza</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          {!isViewMode && (
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Guardar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
