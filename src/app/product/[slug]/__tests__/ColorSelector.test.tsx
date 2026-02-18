import { render, screen, fireEvent } from "@testing-library/react";
import ColorSelector from "../components/ColorSelector";

const colors = [
  { name: "AZUL BEBÉ", hex: "#a8d4f0" },
  { name: "CAFÉ", hex: "#8b6f5e" },
  { name: "BEIGE", hex: "#d4c4a8" },
];

describe("ColorSelector", () => {
  it("muestra el nombre del color seleccionado", () => {
    render(
      <ColorSelector
        colors={colors}
        selected={colors[0]}
        onSelect={jest.fn()}
      />
    );
    expect(screen.getByText("AZUL BEBÉ")).toBeInTheDocument();
  });

  it("renderiza un botón por cada color", () => {
    render(
      <ColorSelector
        colors={colors}
        selected={colors[0]}
        onSelect={jest.fn()}
      />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(colors.length);
  });

  it("llama onSelect con el color correcto al hacer click", () => {
    const onSelect = jest.fn();
    render(
      <ColorSelector
        colors={colors}
        selected={colors[0]}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByLabelText("CAFÉ"));
    expect(onSelect).toHaveBeenCalledWith(colors[1]);
  });

  it("aplica ring al color seleccionado", () => {
    render(
      <ColorSelector
        colors={colors}
        selected={colors[0]}
        onSelect={jest.fn()}
      />
    );
    const selectedBtn = screen.getByLabelText("AZUL BEBÉ");
    expect(selectedBtn).toHaveClass("ring-2");
  });
});
