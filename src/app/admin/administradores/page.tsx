"use client";

import { useSession } from "next-auth/react";
import { useAdminManager } from "./hooks/useAdminManager";
import AdminToast from "./components/AdminToast";

import AdminStatsBar from "./components/AdminStatsBar";
import AdminLoading from "./components/AdminLoading";
import AdminEmptyState from "./components/AdminEmptyState";
import AdminTable from "./components/AdminTable";
import AdminMobileList from "./components/AdminMobileList";
import AdminModal from "./components/AdminModal";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import AdminPagination from "@/components/ui/AdminPagination";
import { UserPlus } from "lucide-react";

export default function AdminAdministradores() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id;

  const {
    admins, filteredAdmins, pagedAdmins, page, setPage, totalPages, loading,
    searchTerm, setSearchTerm,
    showModal, setShowModal,
    submitting, name, setName, email, setEmail,
    password, setPassword, showPassword, setShowPassword,
    lookupResult, lookingUp, lookupDone,
    isExistingUser, isAlreadyAdmin,
    toast, setToast,
    confirmDelete, setConfirmDelete, deleting,
    onGeneratePassword, onCopyPassword,
    handleSubmit, handleDelete,
  } = useAdminManager();

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen font-sans">
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <AdminPageHeader
        title="Administradores"
        action={{ label: "Nuevo Admin", icon: UserPlus, onClick: () => setShowModal(true) }}
      />

      <AdminStatsBar
        total={admins.length}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {loading ? (
        <AdminLoading />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="hidden md:block">
            <AdminTable
              filteredAdmins={pagedAdmins}
              currentUserId={currentUserId}
              confirmDelete={confirmDelete}
              deleting={deleting}
              onConfirmDelete={setConfirmDelete}
              onCancelDelete={() => setConfirmDelete(null)}
              onDelete={handleDelete}
            />
          </div>
          <div className="md:hidden">
            <AdminMobileList
              filteredAdmins={pagedAdmins}
              currentUserId={currentUserId}
              confirmDelete={confirmDelete}
              deleting={deleting}
              onConfirmDelete={setConfirmDelete}
              onCancelDelete={() => setConfirmDelete(null)}
              onDelete={handleDelete}
            />
          </div>
          {filteredAdmins.length === 0 && <AdminEmptyState />}

          <div className="px-6 pb-5">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={filteredAdmins.length}
              pageSize={10}
              itemLabel="administradores"
            />
          </div>
        </div>
      )}

      <AdminModal
        isOpen={showModal}
        onClose={() => !submitting && setShowModal(false)}
        submitting={submitting}
        onSubmit={handleSubmit}
        name={name} setName={setName}
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        showPassword={showPassword} setShowPassword={setShowPassword}
        lookupResult={lookupResult}
        lookingUp={lookingUp}
        lookupDone={lookupDone}
        isExistingUser={isExistingUser}
        isAlreadyAdmin={isAlreadyAdmin}
        onGeneratePassword={onGeneratePassword}
        onCopyPassword={onCopyPassword}
      />
    </div>
  );
}
