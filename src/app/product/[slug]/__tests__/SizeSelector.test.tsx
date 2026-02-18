import { render, screen, fireEvent } from "@testing-library/react";
import SizeSelector from "../components/SizeSelector";

const availableSizes = ["S", "M", "L", "XL"];

describe("SizeSelector", () => {
  it("muestra todas las tallas del catálogo", () => {
    render(
      <SizeSelector
        availableSizes={availableSizes}
        selectedSize={null}
        onSelect={jest.fn()}
      />
    );
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("XS")).toBeInTheDocument();
  });

  it("deshabilita tallas no disponibles", () => {
    render(
      <SizeSelector
        availableSizes={availableSizes}
        selectedSize={null}
        onSelect={jest.fn()}
      />
    );
    const xsButton = screen.getByText("XS").closest("button");
    expect(xsButton).toBeDisabled();
  });

  it("llama onSelect con la talla seleccionada", () => {
    const onSelect = jest.fn();
    render(
      <SizeSelector
        availableSizes={availableSizes}
        selectedSize={null}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByText("M"));
    expect(onSelect).toHaveBeenCalledWith("M");
  });

  it("muestra la talla seleccionada en el label", () => {
    render(
      <SizeSelector
        availableSizes={availableSizes}
        selectedSize="L"
        onSelect={jest.fn()}
      />
    );
    expect(screen.getByText("L", { selector: "span" })).toBeInTheDocument();
  });

  it("no llama onSelect al hacer click en talla no disponible", () => {
    const onSelect = jest.fn();
    render(
      <SizeSelector
        availableSizes={availableSizes}
        selectedSize={null}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByText("XS"));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
