import { render } from "@testing-library/react";
import { CartPanel } from "../components/CartPanel";

describe("CartPanel", () => {
  it("no renderiza si no está abierto", () => {
    const { container } = render(
      <CartPanel isOpen={false}>
        <div>Content</div>
      </CartPanel>
    );
    expect(container.firstChild?.childNodes.length).toBe(0);
  });

  it("renderiza si está abierto", () => {
    const { container } = render(
      <CartPanel isOpen={true}>
        <div>Panel Content</div>
      </CartPanel>
    );
    expect(container.querySelector(".bg-background")).toBeInTheDocument();
  });

  it("renderiza los children cuando está abierto", () => {
    const { getByText } = render(
      <CartPanel isOpen={true}>
        <div>Test Content</div>
      </CartPanel>
    );
    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("tiene las clases de animación correctas", () => {
    const { container } = render(
      <CartPanel isOpen={true}>
        <div>Content</div>
      </CartPanel>
    );
    const panel = container.querySelector(".slide-in-from-right");
    expect(panel).toBeInTheDocument();
  });

  it("tiene max-width de 420px", () => {
    const { container } = render(
      <CartPanel isOpen={true}>
        <div>Content</div>
      </CartPanel>
    );
    const panel = container.querySelector(".max-w-\\[420px\\]");
    expect(panel).toBeInTheDocument();
  });
});
