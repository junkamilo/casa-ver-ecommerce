import { render, screen, fireEvent } from "@testing-library/react";
import { QuantityControls } from "../components/QuantityControls";

describe("QuantityControls", () => {
  it("renderiza la cantidad actual", () => {
    render(
      <QuantityControls quantity={3} onIncrease={jest.fn()} onDecrease={jest.fn()} />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("llama onIncrease cuando se clickea el botón +", () => {
    const onIncrease = jest.fn();
    render(
      <QuantityControls quantity={1} onIncrease={onIncrease} onDecrease={jest.fn()} />
    );

    const increaseButton = screen.getByLabelText("Aumentar cantidad");
    fireEvent.click(increaseButton);

    expect(onIncrease).toHaveBeenCalled();
  });

  it("llama onDecrease cuando se clickea el botón -", () => {
    const onDecrease = jest.fn();
    render(
      <QuantityControls quantity={2} onIncrease={jest.fn()} onDecrease={onDecrease} />
    );

    const decreaseButton = screen.getByLabelText("Disminuir cantidad");
    fireEvent.click(decreaseButton);

    expect(onDecrease).toHaveBeenCalled();
  });

  it("deshabilita el botón - cuando la cantidad es igual a minQuantity", () => {
    render(
      <QuantityControls
        quantity={1}
        minQuantity={1}
        onIncrease={jest.fn()}
        onDecrease={jest.fn()}
      />
    );

    const decreaseButton = screen.getByLabelText("Disminuir cantidad") as HTMLButtonElement;
    expect(decreaseButton.disabled).toBe(true);
  });

  it("habilita el botón - cuando la cantidad es mayor a minQuantity", () => {
    render(
      <QuantityControls
        quantity={2}
        minQuantity={1}
        onIncrease={jest.fn()}
        onDecrease={jest.fn()}
      />
    );

    const decreaseButton = screen.getByLabelText("Disminuir cantidad") as HTMLButtonElement;
    expect(decreaseButton.disabled).toBe(false);
  });

  it("siempre habilita el botón +", () => {
    render(
      <QuantityControls quantity={1} onIncrease={jest.fn()} onDecrease={jest.fn()} />
    );

    const increaseButton = screen.getByLabelText("Aumentar cantidad") as HTMLButtonElement;
    expect(increaseButton.disabled).toBe(false);
  });
});
