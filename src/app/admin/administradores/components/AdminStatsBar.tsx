import { Users, ShieldCheck, Search } from "lucide-react";

interface AdminStatsBarProps {
  total: number;
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const AdminStatsBar = ({ total, loading, searchTerm, onSearchChange }: AdminStatsBarProps) => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-[#C19A6B]/10 rounded-xl text-[#C19A6B]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Tu Nivel de Acceso</p>
          <h3 className="text-2xl font-bold text-gray-900">Super Admin</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-[#154734]/10 rounded-xl text-[#154734]">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Total Administradores</p>
          <h3 className="text-2xl font-bold text-gray-900">{loading ? "..." : total}</h3>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#C19A6B]/10 transition-all"
        />
      </div>
    </div>
  </div>
);

export default AdminStatsBar;
