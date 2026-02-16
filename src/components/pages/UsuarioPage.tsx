import { useState, useEffect } from 'react'; // <--- Importante: useEffect
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Eye, Edit, Trash2, Plus, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// IMPORTAMOS EL SERVICIO
import userService, { Usuario } from '../../services/userService';

export function UsuarioPage() {
  // 1. ESTADO INICIAL VACÍO (Datos reales)
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false); // Para mostrar carga

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null);

  const [formData, setFormData] = useState<Usuario>({
    documentNumber: '',
    firstName: '',
    secondName: '',
    lastName: '',
    secondLastName: '',
    phone: '',
    birthDate: '',
    username: '',
    documentType: 'CC',
    password: '', // Campo necesario para crear
    email: ''     // Campo útil para el backend
  });

  // 2. CARGAR USUARIOS AL INICIAR
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter(u =>
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.documentNumber?.includes(searchTerm) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (usuario: Usuario) => {
    setCurrentUsuario(usuario);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setCurrentUsuario(usuario);
    setFormData(usuario);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  // 3. ELIMINAR REAL
  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await userService.delete(id);
        // Actualizar tabla localmente
        setUsuarios(usuarios.filter(u => u.id !== id));
      } catch (error) {
        console.error(error);
        alert("Error al eliminar usuario");
      }
    }
  };

  const handleAdd = () => {
    setCurrentUsuario(null);
    setFormData({
      documentNumber: '',
      firstName: '',
      secondName: '',
      lastName: '',
      secondLastName: '',
      phone: '',
      birthDate: '',
      username: '',
      documentType: 'CC',
      password: '',
      email: ''
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  // 4. GUARDAR / ACTUALIZAR REAL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUsuario && currentUsuario.id) {
        // ACTUALIZAR (PUT)
        console.log("Actualizando...", formData);
        const updatedUser = await userService.update(currentUsuario.id, formData);

        setUsuarios(usuarios.map(u => u.id === currentUsuario.id ? updatedUser : u));
        alert("Usuario actualizado");
      } else {
        // CREAR (POST)

        // --- VALIDACIÓN DE CONTRASEÑA ---
        const pwd = formData.password || "";
        if (pwd.length > 12) {
          alert("La contraseña no puede tener más de 12 caracteres.");
          return;
        }
        // Regex: Al menos una mayúscula, un número, un caracter especial (o guion bajo)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/;
        if (!passwordRegex.test(pwd)) {
          alert("La contraseña debe tener al menos una mayúscula, un número y un signo (caracter especial).");
          return;
        }
        // --------------------------------

        // Asegúrate de enviar los datos que tu Back requiere (ej. password)
        console.log("Creando...", formData);
        const newUser = await userService.create(formData);

        setUsuarios([...usuarios, newUser]);
        alert("Usuario creado");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar. Revisa que todos los campos obligatorios estén llenos.");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Usuarios</h2>
          <p className="text-slate-600">Administra los usuarios del sistema</p>
        </div>
        <Button onClick={handleAdd} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar por nombre, documento o usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <TableHead>ID</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Tipo Doc</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Cargando datos...</TableCell>
                </TableRow>
              ) : filteredUsuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No hay usuarios registrados.</TableCell>
                </TableRow>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id} className="hover:bg-blue-50/50 transition-colors">
                    <TableCell>{usuario.id}</TableCell>
                    <TableCell>{usuario.documentNumber}</TableCell>
                    <TableCell>
                      {usuario.firstName} {usuario.secondName} {usuario.lastName} {usuario.secondLastName}
                    </TableCell>
                    <TableCell>{usuario.phone}</TableCell>
                    <TableCell>{usuario.username}</TableCell>
                    <TableCell>{usuario.documentType}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(usuario)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(usuario)}
                          className="hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => usuario.id && handleDelete(usuario.id)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'Ver' : currentUsuario ? 'Editar' : 'Nuevo'} Usuario
            </DialogTitle>
          </DialogHeader>
          {isViewMode && currentUsuario ? (
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Documento</Label><p className="font-medium">{currentUsuario.documentNumber}</p></div>
              <div><Label>Nombre</Label><p className="font-medium">{currentUsuario.firstName} {currentUsuario.lastName}</p></div>
              <div><Label>Usuario</Label><p className="font-medium">{currentUsuario.username}</p></div>
              {/* Agrega más campos de visualización si quieres */}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* TIPO DOCUMENTO */}
                <div>
                  <Label>Tipo de Documento *</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      <SelectItem value="PP">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* INPUTS NORMALES */}
                <div>
                  <Label>Número de Documento *</Label>
                  <Input value={formData.documentNumber} onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })} required />
                </div>
                <div>
                  <Label>Primer Nombre *</Label>
                  <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                </div>
                <div>
                  <Label>Segundo Nombre</Label>
                  <Input value={formData.secondName} onChange={(e) => setFormData({ ...formData, secondName: e.target.value })} />
                </div>
                <div>
                  <Label>Primer Apellido *</Label>
                  <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                </div>
                <div>
                  <Label>Segundo Apellido</Label>
                  <Input value={formData.secondLastName} onChange={(e) => setFormData({ ...formData, secondLastName: e.target.value })} />
                </div>
                <div>
                  <Label>Teléfono *</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
                <div>
                  <Label>Fecha Nacimiento *</Label>
                  <Input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} required />
                </div>

                {/* CAMPOS DE CUENTA */}
                <div>
                  <Label>Usuario (Login) *</Label>
                  <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                {/* Solo mostramos password al crear, no al editar (opcional) */}
                {!currentUsuario && (
                  <div>
                    <Label>Contraseña *</Label>
                    <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {currentUsuario ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}