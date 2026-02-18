import { render, screen, fireEvent } from "@testing-library/react";
import ProductAccordion from "../components/ProductAccordion";

describe("ProductAccordion", () => {
  it("renderiza los tres acordeones", () => {
    render(<ProductAccordion openKey={null} onToggle={jest.fn()} />);
    expect(screen.getByText("ENVÍO")).toBeInTheDocument();
    expect(screen.getByText("MÉTODOS DE PAGO")).toBeInTheDocument();
    expect(screen.getByText("CUIDADOS DE LA PRENDA")).toBeInTheDocument();
  });

  it("llama onToggle con la key correcta al hacer click", () => {
    const onToggle = jest.fn();
    render(<ProductAccordion openKey={null} onToggle={onToggle} />);
    fireEvent.click(screen.getByText("ENVÍO").closest("button")!);
    expect(onToggle).toHaveBeenCalledWith("envio");
  });

  it("muestra el contenido del acordeón abierto", () => {
    render(<ProductAccordion openKey="envio" onToggle={jest.fn()} />);
    expect(screen.getByText(/días hábiles/)).toBeInTheDocument();
  });

  it("oculta el contenido del acordeón cerrado (max-h-0)", () => {
    const { container } = render(
      <ProductAccordion openKey={null} onToggle={jest.fn()} />
    );
    const hiddenContents = container.querySelectorAll(".max-h-0");
    expect(hiddenContents.length).toBe(3);
  });
});
