import { renderHook, act } from "@testing-library/react";
import { useRegisterForm } from "../hooks/useRegisterForm";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockSignIn = jest.fn();
const mockFetch = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

global.fetch = mockFetch;

const validData = { name: "Juan García", email: "juan@example.com", password: "123456" };

describe("useRegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inicializa sin error, sin success y sin carga", () => {
    const { result } = renderHook(() => useRegisterForm());
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("expone register, handleSubmit y errors de react-hook-form", () => {
    const { result } = renderHook(() => useRegisterForm());
    expect(typeof result.current.register).toBe("function");
    expect(typeof result.current.handleSubmit).toBe("function");
    expect(result.current.errors).toBeDefined();
  });

  it("onSubmit llama a fetch con los datos correctos", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    mockSignIn.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validData),
    });
  });

  it("onSubmit muestra success y luego redirige a /", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    mockSignIn.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    expect(mockRefresh).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("onSubmit muestra error cuando la API responde con error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "El correo ya está registrado" }),
    });
    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    expect(result.current.error).toBe("El correo ya está registrado");
    expect(result.current.isLoading).toBe(false);
  });

  it("onSubmit muestra error cuando signIn falla después del registro", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    mockSignIn.mockResolvedValue({ error: "CredentialsSignin" });
    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.onSubmit(validData);
    });

    expect(result.current.error).toBe(
      "Cuenta creada, pero hubo un error al iniciar sesión."
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("onSubmit muestra mensaje de success antes de redirigir", async () => {
    let resolveSignIn: (v: unknown) => void;
    const signInPromise = new Promise((res) => { resolveSignIn = res; });
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    mockSignIn.mockReturnValue(signInPromise);

    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.onSubmit(validData);
    });

    // Después del fetch, antes de que signIn resuelva
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.success).toBe("¡Cuenta creada con éxito! Iniciando sesión...");

    resolveSignIn!({ error: null });
  });

  it("handleGoogleLogin llama a signIn con google", () => {
    mockSignIn.mockResolvedValue({});
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.handleGoogleLogin();
    });

    expect(mockSignIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
    expect(result.current.isLoading).toBe(true);
  });
});
