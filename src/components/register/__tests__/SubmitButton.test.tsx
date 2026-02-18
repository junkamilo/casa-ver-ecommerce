import { render, screen } from "@testing-library/react";
import SubmitButton from "../components/SubmitButton";

describe("SubmitButton (Register)", () => {
  it("muestra texto 'Crear Cuenta' cuando no está cargando", () => {
    render(<SubmitButton isLoading={false} />);
    expect(screen.getByText("Crear Cuenta")).toBeInTheDocument();
  });

  it("muestra spinner cuando isLoading es true", () => {
    const { container } = render(<SubmitButton isLoading={true} />);
    expect(screen.queryByText("Crear Cuenta")).toBeNull();
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
