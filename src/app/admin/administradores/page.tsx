"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  UserPlus,
  Shield,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Mail,
  Lock,
  User,
  Users,
  Crown,
  Copy,
  Eye,
  EyeOff,
  ShieldCheck,
  Search
} from "lucide-react";
import Image from "next/image"; // Importar Image de next/image

interface Admin {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  image: string | null;
}

export default function AdminAdministradores() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email lookup
  const [lookupResult, setLookupResult] = useState<{
    exists: boolean;
    isAdmin?: boolean;
    user?: { id: string; name: string | null; email: string; image: string | null };
  } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Feedback
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
        setFilteredAdmins(data);
      }
    } catch {
      showToast("error", "Error al cargar administradores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Filtrado de búsqueda
  useEffect(() => {
    const results = admins.filter(admin =>
      (admin.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (admin.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(results);
  }, [searchTerm, admins]);


  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const lookupEmail = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes("@")) {
      setLookupResult(null);
      return;
    }
    setLookingUp(true);
    try {
      const res = await fetch(`/api/admin/users?lookup=${encodeURIComponent(emailToCheck)}`);
      if (res.ok) {
        const data = await res.json();
        setLookupResult(data);
      }
    } catch {
      setLookupResult(null);
    } finally {
      setLookingUp(false);
    }
  };

  // El usuario existente no necesita nombre ni contraseña
  const isExistingUser = lookupResult?.exists && !lookupResult?.isAdmin;
  const isAlreadyAdmin = lookupResult?.exists && lookupResult?.isAdmin;

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setShowPassword(true);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    showToast("success", "Contraseña copiada al portapapeles");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = isExistingUser
        ? { email }
        : { name, email, password };

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.message || "Error al crear admin");
        return;
      }

      if (data.promoted) {
        showToast("success", `${data.name || data.email} fue promovido a administrador`);
      } else {
        showToast("success", `Admin "${data.name}" creado exitosamente`);
      }

      setShowModal(false);
      setName("");
      setEmail("");
      setPassword("");
      setLookupResult(null);
      fetchAdmins();
    } catch {
      showToast("error", "Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.message || "Error al revocar admin");
        return;
      }

      showToast("success", "Acceso de administrador revocado");
      setConfirmDelete(null);
      fetchAdmins();
    } catch {
      showToast("error", "Error de conexión");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen font-sans">

      {/* --- TOAST --- */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top duration-300 ${
          toast.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-2 p-0.5 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#154734]" style={{ fontFamily: 'Georgia, serif' }}>
            Administradores
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            Gestión de accesos y permisos del panel
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#154734] hover:bg-[#0f3626] text-white px-6 py-3 rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95 font-medium"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Admin
        </button>
      </div>

      {/* --- STATS & FILTER --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Admins Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-[#154734]/10 rounded-xl text-[#154734]">
              <Users className="w-6 h-6" />
           </div>
           <div>
              <p className="text-sm text-gray-500 font-medium">Total Administradores</p>
              <h3 className="text-2xl font-bold text-gray-900">{loading ? "..." : admins.length}</h3>
           </div>
        </div>

        {/* Current Role Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-[#C19A6B]/10 rounded-xl text-[#C19A6B]">
              <ShieldCheck className="w-6 h-6" />
           </div>
           <div>
              <p className="text-sm text-gray-500 font-medium">Tu Nivel de Acceso</p>
              <h3 className="text-2xl font-bold text-gray-900">Super Admin</h3>
           </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-center">
             <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-[#C19A6B] rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-[#C19A6B]/10 transition-all"
                />
             </div>
        </div>
      </div>

      {/* --- ADMIN LIST --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
          <p className="text-sm text-gray-500 font-medium">Cargando equipo...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Administrador</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha de Alta</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                           {admin.image ? (
                               <Image src={admin.image} alt={admin.name || "Admin"} fill className="object-cover" />
                           ) : (
                               <span className="font-bold text-[#154734]">{admin.name?.charAt(0).toUpperCase() || "A"}</span>
                           )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            {admin.name || "Sin nombre"}
                            {admin.id === currentUserId && (
                              <span className="text-[10px] font-bold bg-[#C19A6B]/10 text-[#C19A6B] border border-[#C19A6B]/20 px-2 py-0.5 rounded-full">TÚ</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">ID: {admin.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                         <Mail className="w-3.5 h-3.5 text-gray-400" />
                         {admin.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                        {formatDate(admin.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {admin.id !== currentUserId ? (
                        confirmDelete === admin.id ? (
                          <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-2">
                            <span className="text-xs text-gray-500 font-medium mr-1">¿Seguro?</span>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleDelete(admin.id)}
                              disabled={deleting}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-1"
                            >
                              {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
                              Revocar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(admin.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                            title="Revocar acceso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-gray-400 italic pr-2">Sesión actual</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredAdmins.map((admin) => (
              <div key={admin.id} className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                           {admin.image ? (
                               <Image src={admin.image} alt={admin.name || "Admin"} fill className="object-cover" />
                           ) : (
                               <span className="font-bold text-[#154734] text-lg">{admin.name?.charAt(0).toUpperCase() || "A"}</span>
                           )}
                        </div>
                        <div>
                           <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                             {admin.name || "Sin nombre"}
                             {admin.id === currentUserId && (
                               <span className="text-[10px] font-bold bg-[#C19A6B]/10 text-[#C19A6B] border border-[#C19A6B]/20 px-2 py-0.5 rounded-full">TÚ</span>
                             )}
                           </h3>
                           <p className="text-xs text-gray-500">{admin.email}</p>
                        </div>
                   </div>
                   
                   {admin.id !== currentUserId && (
                      <button 
                         onClick={() => setConfirmDelete(admin.id)}
                         className="p-2 text-gray-400 hover:text-red-500"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                   )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="text-xs text-gray-400">Miembro desde {formatDate(admin.createdAt)}</span>
                    {confirmDelete === admin.id && (
                        <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleDelete(admin.id)}
                              disabled={deleting}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg"
                            >
                              {deleting ? "..." : "Confirmar Revocación"}
                            </button>
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>

          {filteredAdmins.length === 0 && (
            <div className="py-16 text-center text-gray-500 flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <Shield className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No se encontraron administradores</h3>
              <p className="text-sm">Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL CREAR ADMIN --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !submitting && setShowModal(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-[#154734]" style={{ fontFamily: "Georgia, serif" }}>
                  Nuevo Administrador
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Otorga permisos de acceso completo al panel</p>
              </div>
              <button
                onClick={() => !submitting && setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form id="create-admin-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <div className="p-2 bg-blue-100 rounded-lg h-fit">
                    <Crown className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-blue-800 mb-1">Acceso de Super Usuario</h4>
                   <p className="text-xs text-blue-700 leading-relaxed">
                     Ingresa el correo del usuario. Si ya está registrado, será <strong>ascendido automáticamente</strong>.
                     Si no existe, se creará una cuenta nueva.
                   </p>
                </div>
              </div>

              <div className="space-y-4">
                 {/* Email - siempre primero */}
                 <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Correo del Usuario</label>
                    <div className="relative">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (lookupResult) setLookupResult(null);
                        }}
                        onBlur={() => lookupEmail(email)}
                        placeholder="admin@casaverde.com"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-sm"
                       />
                       {lookingUp && (
                         <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                       )}
                    </div>
                 </div>

                 {/* Usuario encontrado */}
                 {isExistingUser && lookupResult.user && (
                   <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
                     <div className="relative w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 overflow-hidden flex items-center justify-center shrink-0">
                       {lookupResult.user.image ? (
                         <Image src={lookupResult.user.image} alt={lookupResult.user.name || ""} fill className="object-cover" />
                       ) : (
                         <span className="font-bold text-emerald-700">{lookupResult.user.name?.charAt(0).toUpperCase() || "U"}</span>
                       )}
                     </div>
                     <div className="flex-1">
                       <p className="text-sm font-bold text-emerald-800">{lookupResult.user.name || "Sin nombre"}</p>
                       <p className="text-xs text-emerald-600">Usuario registrado — solo se necesita confirmar la promoción</p>
                     </div>
                     <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                   </div>
                 )}

                 {/* Ya es admin */}
                 {isAlreadyAdmin && (
                   <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
                     <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                     <p className="text-sm font-medium text-amber-800">Este usuario ya es administrador</p>
                   </div>
                 )}

                 {/* Nombre - solo para usuarios nuevos */}
                 {!isExistingUser && !isAlreadyAdmin && (
                   <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Nombre Completo</label>
                      <div className="relative">
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                         <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ej: Ana María Pérez"
                          required={!isExistingUser}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-sm"
                         />
                      </div>
                   </div>
                 )}

                 {/* Password Section - solo para usuarios nuevos */}
                 {!isExistingUser && !isAlreadyAdmin && (
                   <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-semibold text-gray-700">Contraseña de Acceso</label>
                          <button
                            type="button"
                            onClick={generatePassword}
                            className="text-xs font-bold text-[#154734] hover:underline"
                          >
                            Generar Segura
                          </button>
                      </div>

                      <div className="relative flex gap-2">
                         <div className="relative flex-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••••••"
                              required={!isExistingUser}
                              minLength={6}
                              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-sm font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                         </div>
                      </div>

                      {password && (
                          <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={copyPassword}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#C19A6B] transition-colors"
                              >
                                <Copy className="w-3 h-3" /> Copiar al portapapeles
                              </button>
                          </div>
                      )}
                   </div>
                 )}
              </div>
            </form>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={() => !submitting && setShowModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="create-admin-form"
                disabled={
                  submitting ||
                  !email ||
                  isAlreadyAdmin ||
                  (!isExistingUser && (!name || !password))
                }
                className="px-6 py-2.5 text-sm font-bold text-white bg-[#154734] hover:bg-[#103a2a] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : isExistingUser ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Promover a Admin
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Crear Admin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
