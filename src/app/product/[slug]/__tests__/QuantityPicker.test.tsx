import { render, screen, fireEvent } from "@testing-library/react";
import QuantityPicker from "../components/QuantityPicker";

describe("QuantityPicker", () => {
  it("muestra la cantidad actual", () => {
    render(
      <QuantityPicker quantity={3} onDecrease={jest.fn()} onIncrease={jest.fn()} />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("llama onIncrease al hacer click en +", () => {
    const onIncrease = jest.fn();
    render(
      <QuantityPicker quantity={1} onDecrease={jest.fn()} onIncrease={onIncrease} />
    );
    fireEvent.click(screen.getByRole("button", { name: /plus|increase|\+/i }));
    expect(onIncrease).toHaveBeenCalledTimes(1);
  });

  it("llama onDecrease al hacer click en -", () => {
    const onDecrease = jest.fn();
    render(
      <QuantityPicker quantity={2} onDecrease={onDecrease} onIncrease={jest.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /minus|decrease|-/i }));
    expect(onDecrease).toHaveBeenCalledTimes(1);
  });
});
