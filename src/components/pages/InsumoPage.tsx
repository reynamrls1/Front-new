import React from "react";
import { BsSearch } from "react-icons/bs";

const InsumosPage: React.FC = () => {
  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Insumos</h1>
          <p className="text-gray-500">Gestiona los insumos del sistema</p>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Buscar insumo..."
            className="w-full border border-gray-300 rounded-lg py-2 px-3 pr-10"
          />
          <BsSearch className="absolute right-3 top-2.5 text-gray-500" />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="p-6 flex-1">
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Insumos</h2>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Nombre</th>
                  <th className="py-2 px-3">Categoría</th>
                  <th className="py-2 px-3">Stock</th>
                  <th className="py-2 px-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3">1</td>
                  <td className="py-2 px-3">Crema</td>
                  <td className="py-2 px-3">Cosmético</td>
                  <td className="py-2 px-3">40</td>
                  <td className="py-2 px-3">
                    <button className="text-blue-600 hover:underline">Editar</button>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="py-2 px-3">2</td>
                  <td className="py-2 px-3">Gel</td>
                  <td className="py-2 px-3">Peinado</td>
                  <td className="py-2 px-3">25</td>
                  <td className="py-2 px-3">
                    <button className="text-blue-600 hover:underline">Editar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
};

export default InsumosPage;
