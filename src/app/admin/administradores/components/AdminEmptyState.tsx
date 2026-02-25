import { Shield } from "lucide-react";

const AdminEmptyState = () => (
  <div className="py-16 text-center text-gray-500 flex flex-col items-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Shield className="w-8 h-8 text-gray-300" />
    </div>
    <h3 className="text-lg font-medium text-gray-900">No se encontraron administradores</h3>
    <p className="text-sm">Intenta con otro término de búsqueda</p>
  </div>
);

export default AdminEmptyState;
