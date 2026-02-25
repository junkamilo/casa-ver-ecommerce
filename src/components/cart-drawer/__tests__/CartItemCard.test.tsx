import { render, screen, fireEvent } from "@testing-library/react";
import CartItemCard from "../components/CartItemCard";
import type { CartDrawerItem } from "../types/types";

jest.mock("next/image", () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  );
  MockImage.displayName = "MockImage";
  return MockImage;
});

const mockItem: CartDrawerItem = {
  id: "item-1",
  name: "Enterizo Floral Verde",
  image: "/productos/enterizo.jpg",
  price: 89900,
  quantity: 2,
  color: "Verde",
  size: "M",
};

describe("CartItemCard", () => {
  it("muestra el nombre del producto", () => {
    render(<CartItemCard item={mockItem} onRemove={jest.fn()} onUpdateQty={jest.fn()} />);
    expect(screen.getByText("Enterizo Floral Verde")).toBeInTheDocument();
  });

  it("muestra el color y la talla", () => {
    render(<CartItemCard item={mockItem} onRemove={jest.fn()} onUpdateQty={jest.fn()} />);
    expect(screen.getByText("Verde · M")).toBeInTheDocument();
  });

  it("no muestra la talla si es undefined", () => {
    const itemSinTalla = { ...mockItem, size: undefined };
    render(<CartItemCard item={itemSinTalla} onRemove={jest.fn()} onUpdateQty={jest.fn()} />);
    expect(screen.queryByText("·")).not.toBeInTheDocument();
  });

  it("muestra el precio total (precio × cantidad)", () => {
    render(<CartItemCard item={mockItem} onRemove={jest.fn()} onUpdateQty={jest.fn()} />);
    expect(screen.getByText("$179.800")).toBeInTheDocument();
  });

  it("muestra la cantidad actual", () => {
    render(<CartItemCard item={mockItem} onRemove={jest.fn()} onUpdateQty={jest.fn()} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("llama a onUpdateQty con +1 al hacer click en el botón +", () => {
    const onUpdateQty = jest.fn();
    render(<CartItemCard item={mockItem} onRemove={jest.fn()} onUpdateQty={onUpdateQty} />);
    const buttons = screen.getAllByRole("button");
    // botones: -, +, eliminar → el "+" es el segundo
    fireEvent.click(buttons[1]);
    expect(onUpdateQty).toHaveBeenCalledWith("item-1", 1);
  });

  it("llama a onUpdateQty con -1 al hacer click en el botón -", () => {
    const onUpdateQty = jest.fn();
    render(<CartItemCard item={mockItem} onRemove={jest.fn()} onUpdateQty={onUpdateQty} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onUpdateQty).toHaveBeenCalledWith("item-1", -1);
  });

  it("llama a onRemove con el id del item al hacer click en eliminar", () => {
    const onRemove = jest.fn();
    render(<CartItemCard item={mockItem} onRemove={onRemove} onUpdateQty={jest.fn()} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]);
    expect(onRemove).toHaveBeenCalledWith("item-1");
  });
});
