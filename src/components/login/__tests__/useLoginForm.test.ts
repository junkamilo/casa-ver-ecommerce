import { renderHook, act } from "@testing-library/react";
import { useLoginForm } from "../hooks/useLoginForm";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockSignIn = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

describe("useLoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inicializa sin error y sin carga", () => {
    const { result } = renderHook(() => useLoginForm());
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("expone register, handleSubmit y errors de react-hook-form", () => {
    const { result } = renderHook(() => useLoginForm());
    expect(typeof result.current.register).toBe("function");
    expect(typeof result.current.handleSubmit).toBe("function");
    expect(result.current.errors).toBeDefined();
  });

  it("onSubmit llama a signIn con credentials", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.onSubmit({ email: "test@example.com", password: "123456" });
    });

    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "123456",
      redirect: false,
    });
  });

  it("onSubmit redirige a / cuando signIn es exitoso", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.onSubmit({ email: "test@example.com", password: "123456" });
    });

    expect(mockRefresh).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("onSubmit muestra error cuando signIn devuelve error", async () => {
    mockSignIn.mockResolvedValue({ error: "CredentialsSignin" });
    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.onSubmit({ email: "test@example.com", password: "123456" });
    });

    expect(result.current.error).toBe("Correo o contraseña incorrectos");
    expect(result.current.isLoading).toBe(false);
  });

  it("onSubmit muestra error inesperado cuando signIn lanza excepción", async () => {
    mockSignIn.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.onSubmit({ email: "test@example.com", password: "123456" });
    });

    expect(result.current.error).toBe("Ocurrió un error inesperado");
    expect(result.current.isLoading).toBe(false);
  });

  it("handleGoogleLogin llama a signIn con google", () => {
    mockSignIn.mockResolvedValue({});
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.handleGoogleLogin();
    });

    expect(mockSignIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
    expect(result.current.isLoading).toBe(true);
  });
});
