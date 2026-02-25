import { render, screen, fireEvent } from "@testing-library/react";
import { CartContent } from "../components/CartContent";
import type { CartItem } from "@/context/CartContext";

// Mock de next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

describe("CartContent", () => {
  const mockItems: CartItem[] = [
    {
      id: "item-1",
      name: "Producto 1",
      price: 50000,
      image: "/img1.jpg",
      color: "Azul",
      size: "M",
      quantity: 1,
    },
    {
      id: "item-2",
      name: "Producto 2",
      price: 75000,
      image: "/img2.jpg",
      color: "Rojo",
      size: "L",
      quantity: 2,
    },
  ];

  it("renderiza CartEmptyState cuando no hay items", () => {
    render(
      <CartContent
        items={[]}
        onItemRemove={jest.fn()}
        onQuantityChange={jest.fn()}
      />
    );

    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });

  it("renderiza todos los items cuando hay productos", () => {
    render(
      <CartContent
        items={mockItems}
        onItemRemove={jest.fn()}
        onQuantityChange={jest.fn()}
      />
    );

    expect(screen.getByText("Producto 1")).toBeInTheDocument();
    expect(screen.getByText("Producto 2")).toBeInTheDocument();
  });

  it("llama onItemRemove cuando se elimina un item", () => {
    const onItemRemove = jest.fn();
    render(
      <CartContent
        items={mockItems}
        onItemRemove={onItemRemove}
        onQuantityChange={jest.fn()}
      />
    );

    const removeButtons = screen.getAllByLabelText("Eliminar producto");
    fireEvent.click(removeButtons[0]);

    expect(onItemRemove).toHaveBeenCalledWith("item-1");
  });

  it("llama onQuantityChange cuando se cambia cantidad", () => {
    const onQuantityChange = jest.fn();
    render(
      <CartContent
        items={mockItems}
        onItemRemove={jest.fn()}
        onQuantityChange={onQuantityChange}
      />
    );

    const increaseButtons = screen.getAllByLabelText("Aumentar cantidad");
    fireEvent.click(increaseButtons[0]);

    expect(onQuantityChange).toHaveBeenCalledWith("item-1", 1);
  });

  it("tiene scroll overflow cuando hay muchos items", () => {
    const { container } = render(
      <CartContent
        items={mockItems}
        onItemRemove={jest.fn()}
        onQuantityChange={jest.fn()}
      />
    );

    const content = container.firstChild;
    expect(content).toHaveClass("overflow-y-auto");
  });

  it("todos los items tienen gap entre ellos", () => {
    const { container } = render(
      <CartContent
        items={mockItems}
        onItemRemove={jest.fn()}
        onQuantityChange={jest.fn()}
      />
    );

    const content = container.firstChild;
    expect(content).toHaveClass("space-y-6");
  });
});
