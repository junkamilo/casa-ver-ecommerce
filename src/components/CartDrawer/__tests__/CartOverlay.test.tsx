import { render, screen, fireEvent } from "@testing-library/react";
import { CartOverlay } from "../components/CartOverlay";

describe("CartOverlay", () => {
  it("no renderiza si no está abierto", () => {
    const { container } = render(<CartOverlay isOpen={false} onClose={jest.fn()} />);
    expect(container.firstChild?.childNodes.length).toBe(0);
  });

  it("renderiza si está abierto", () => {
    const { container } = render(<CartOverlay isOpen={true} onClose={jest.fn()} />);
    expect(container.querySelector(".bg-black/40")).toBeInTheDocument();
  });

  it("llama onClose cuando se hace click", () => {
    const onClose = jest.fn();
    render(<CartOverlay isOpen={true} onClose={onClose} />);

    const overlay = screen.getByRole("button");
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalled();
  });

  it("tiene aria-label para accesibilidad", () => {
    render(<CartOverlay isOpen={true} onClose={jest.fn()} />);

    const overlay = screen.getByRole("button");
    expect(overlay).toHaveAttribute("aria-label", "Cerrar carrito");
  });
});
