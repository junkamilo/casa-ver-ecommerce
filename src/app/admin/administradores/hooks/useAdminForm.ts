"use client";

import { useState, useEffect, useCallback } from "react";
import { generatePassword } from "../constants/constants";
import type { LookupResult } from "../types/types";
import {
  AdminUsersApiError,
  createAdminUser,
  lookupAdminUserByEmail,
} from "@/modules/adminCatalog/users/presentation/api-client";
import { mapLookupDtoToUi } from "@/modules/adminCatalog/users/presentation/mappers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOOKUP_DEBOUNCE_MS = 600;

interface UseAdminFormOptions {
  showToast: (type: "success" | "error", message: string) => void;
  onSuccess: () => void;
}

export function useAdminForm({ showToast, onSuccess }: UseAdminFormOptions) {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Campos del formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estado del lookup de email
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);

  const isExistingUser = lookupResult?.exists === true && !lookupResult?.isAdmin;
  const isAlreadyAdmin = lookupResult?.exists === true && lookupResult?.isAdmin === true;

  // ── Email lookup ──────────────────────────────────────────────────────────

  const onLookupEmail = useCallback(async (emailToCheck: string) => {
    setLookingUp(true);
    setLookupDone(false);
    try {
      const data = await lookupAdminUserByEmail(emailToCheck);
      setLookupResult(mapLookupDtoToUi(data));
    } catch {
      setLookupResult({ exists: false });
    } finally {
      setLookingUp(false);
      setLookupDone(true);
    }
  }, []);

  useEffect(() => {
    setLookupResult(null);
    setLookupDone(false);
    setLookingUp(false);

    if (!email || !EMAIL_REGEX.test(email)) return;

    const timer = setTimeout(() => onLookupEmail(email), LOOKUP_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [email, onLookupEmail]);

  // ── Acciones del formulario ───────────────────────────────────────────────

  const onGeneratePassword = useCallback(() => {
    setPassword(generatePassword());
    setShowPassword(true);
  }, []);

  const onCopyPassword = useCallback(() => {
    navigator.clipboard.writeText(password);
    showToast("success", "Contraseña copiada al portapapeles");
  }, [password, showToast]);

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setLookupResult(null);
    setLookupDone(false);
    setLookingUp(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: { preventDefault(): void }) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const body = isExistingUser ? { email } : { name, email, password };
        const data = await createAdminUser(body);

        if (data.promoted) {
          showToast("success", `${data.name || data.email} fue promovido a administrador`);
        } else {
          showToast("success", `Admin "${data.name}" creado exitosamente`);
        }

        setShowModal(false);
        resetForm();
        onSuccess();
      } catch (error: unknown) {
        if (error instanceof AdminUsersApiError) {
          showToast("error", error.message);
          return;
        }
        showToast("error", "Error de conexión");
      } finally {
        setSubmitting(false);
      }
    },
    [isExistingUser, email, name, password, showToast, resetForm, onSuccess]
  );

  return {
    showModal,
    setShowModal,
    submitting,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    lookupResult,
    lookingUp,
    lookupDone,
    isExistingUser,
    isAlreadyAdmin,
    onGeneratePassword,
    onCopyPassword,
    handleSubmit,
    resetForm,
  };
}
