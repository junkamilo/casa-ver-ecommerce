import { render, screen } from "@testing-library/react";
import SubmitButton from "../components/SubmitButton";

describe("SubmitButton", () => {
  it("muestra texto 'Iniciar Sesión' cuando no está cargando", () => {
    render(<SubmitButton isLoading={false} />);
    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
  });

  it("muestra spinner cuando isLoading es true", () => {
    const { container } = render(<SubmitButton isLoading={true} />);
    expect(screen.queryByText("Iniciar Sesión")).toBeNull();
    // El spinner es el icono Loader2 (svg)
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("está deshabilitado cuando isLoading es true", () => {
    render(<SubmitButton isLoading={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("no está deshabilitado cuando isLoading es false", () => {
    render(<SubmitButton isLoading={false} />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("es de tipo submit", () => {
    render(<SubmitButton isLoading={false} />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
