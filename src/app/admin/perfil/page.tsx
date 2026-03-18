"use client";

import { Loader2 } from "lucide-react";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { useProfileManager } from "./hooks/useProfileManager";
import ProfileToast from "./components/ProfileToast";
import ProfileCard from "./components/ProfileCard";
import PersonalInfoSection from "./components/PersonalInfoSection";
import SecuritySection from "./components/SecuritySection";

export default function AdminPerfil() {
  const {
    profile,
    loading,
    toast,
    setToast,
    editingName,
    setEditingName,
    name,
    setName,
    savingName,
    handleSaveName,
    cancelEditName,
    showPasswordSection,
    setShowPasswordSection,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrentPw,
    setShowCurrentPw,
    showNewPw,
    setShowNewPw,
    savingPassword,
    handleChangePassword,
    cancelPasswordSection,
  } = useProfileManager();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
        <p className="text-sm text-gray-500 font-medium">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <ProfileToast toast={toast} onClose={() => setToast(null)} />

      <AdminPageHeader title="Mi Perfil" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {profile && <ProfileCard profile={profile} />}

        <div className="lg:col-span-2 space-y-6">
          {profile && (
            <PersonalInfoSection
              profile={profile}
              editingName={editingName}
              name={name}
              savingName={savingName}
              onStartEdit={() => setEditingName(true)}
              onNameChange={setName}
              onSave={handleSaveName}
              onCancel={cancelEditName}
            />
          )}

          <SecuritySection
            showPasswordSection={showPasswordSection}
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            showCurrentPw={showCurrentPw}
            showNewPw={showNewPw}
            savingPassword={savingPassword}
            onOpen={() => setShowPasswordSection(true)}
            onCancel={cancelPasswordSection}
            onSubmit={handleChangePassword}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onToggleCurrentPw={() => setShowCurrentPw((v) => !v)}
            onToggleNewPw={() => setShowNewPw((v) => !v)}
          />
        </div>
      </div>
    </div>
  );
}
