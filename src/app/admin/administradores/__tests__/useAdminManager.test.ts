import { renderHook, act, waitFor } from "@testing-library/react";
import { useAdminManager } from "../hooks/useAdminManager";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockClipboard = { writeText: jest.fn() };
Object.defineProperty(navigator, "clipboard", { value: mockClipboard, writable: true });

const emptyFetch = () =>
  mockFetch.mockResolvedValue({ ok: true, json: async () => [] });

/** Espera a que el hook termine el fetch inicial */
async function mountAndWait() {
  emptyFetch();
  const hook = renderHook(() => useAdminManager());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe("useAdminManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inicializa con estado vacío y cargando", () => {
    emptyFetch();
    const { result } = renderHook(() => useAdminManager());
    expect(result.current.admins).toHaveLength(0);
    expect(result.current.loading).toBe(true);
    expect(result.current.showModal).toBe(false);
    expect(result.current.toast).toBeNull();
  });

  it("carga la lista de admins al montar", async () => {
    const mockAdmins = [
      { id: "1", name: "Juan", email: "juan@test.com", createdAt: "2024-01-01", image: null },
    ];
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockAdmins });

    const { result } = renderHook(() => useAdminManager());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.admins).toHaveLength(1);
  });

  it("filtra admins por searchTerm (nombre)", async () => {
    const mockAdmins = [
      { id: "1", name: "Juan García", email: "juan@test.com", createdAt: "2024-01-01", image: null },
      { id: "2", name: "Ana López", email: "ana@test.com", createdAt: "2024-01-01", image: null },
    ];
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockAdmins });

    const { result } = renderHook(() => useAdminManager());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.setSearchTerm("juan"); });

    expect(result.current.filteredAdmins).toHaveLength(1);
    expect(result.current.filteredAdmins[0].name).toBe("Juan García");
  });

  it("filtra admins por searchTerm (email)", async () => {
    const mockAdmins = [
      { id: "1", name: "Juan", email: "juan@casaverde.com", createdAt: "2024-01-01", image: null },
      { id: "2", name: "Ana", email: "ana@casaverde.com", createdAt: "2024-01-01", image: null },
    ];
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockAdmins });

    const { result } = renderHook(() => useAdminManager());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.setSearchTerm("ana@"); });

    expect(result.current.filteredAdmins).toHaveLength(1);
    expect(result.current.filteredAdmins[0].email).toBe("ana@casaverde.com");
  });

  it("onGeneratePassword establece una contraseña de 12 chars y showPassword = true", async () => {
    const { result } = await mountAndWait();

    act(() => { result.current.onGeneratePassword(); });

    expect(result.current.password).toHaveLength(12);
    expect(result.current.showPassword).toBe(true);
  });

  it("onCopyPassword copia la contraseña al portapapeles", async () => {
    const { result } = await mountAndWait();

    // Primero actualiza la contraseña, luego copia en un act separado
    act(() => { result.current.setPassword("MiPassword123"); });
    act(() => { result.current.onCopyPassword(); });

    expect(mockClipboard.writeText).toHaveBeenCalledWith("MiPassword123");
  });

  it("isExistingUser es true cuando el usuario existe y no es admin", async () => {
    const { result } = await mountAndWait();

    act(() => { result.current.setLookupResult({ exists: true, isAdmin: false }); });

    expect(result.current.isExistingUser).toBe(true);
    expect(result.current.isAlreadyAdmin).toBe(false);
  });

  it("isAlreadyAdmin es true cuando el usuario ya es admin", async () => {
    const { result } = await mountAndWait();

    act(() => { result.current.setLookupResult({ exists: true, isAdmin: true }); });

    expect(result.current.isAlreadyAdmin).toBe(true);
    expect(result.current.isExistingUser).toBe(false);
  });

  it("setToast establece el toast y setToast(null) lo limpia", async () => {
    const { result } = await mountAndWait();

    act(() => { result.current.setToast({ type: "success", message: "Prueba" }); });
    expect(result.current.toast).toEqual({ type: "success", message: "Prueba" });

    act(() => { result.current.setToast(null); });
    expect(result.current.toast).toBeNull();
  });
});
