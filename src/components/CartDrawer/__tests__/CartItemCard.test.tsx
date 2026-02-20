import { render, screen, fireEvent } from "@testing-library/react";
import { CartItemCard } from "../components/CartItemCard";
import type { CartItem } from "@/context/CartContext";

// Mock de next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

describe("CartItemCard", () => {
  const mockItem: CartItem = {
    id: "test-1",
    name: "Producto Test",
    price: 50000,
    image: "/test-image.jpg",
    color: "Azul",
    size: "M",
    quantity: 2,
  };

  it("renderiza la imagen del producto", () => {
    render(
      <CartItemCard
        item={mockItem}
        onRemove={jest.fn()}
        onUpdateQuantity={jest.fn()}
      />
    );

    const image = screen.getByAltText("Producto Test");
    expect(image).toBeInTheDocument();
  });

  it("renderiza el nombre del producto", () => {
    render(
      <CartItemCard
        item={mockItem}
        onRemove={jest.fn()}
        onUpdateQuantity={jest.fn()}
      />
    );

    expect(screen.getByText("Producto Test")).toBeInTheDocument();
  });

  it("renderiza el color y tamaño", () => {
    render(
      <CartItemCard
        item={mockItem}
        onRemove={jest.fn()}
        onUpdateQuantity={jest.fn()}
      />
    );

    expect(screen.getByText(/Azul · M/)).toBeInTheDocument();
  });

  it("renderiza el precio unitario", () => {
    render(
      <CartItemCard
        item={mockItem}
        onRemove={jest.fn()}
        onUpdateQuantity={jest.fn()}
      />
    );

    expect(screen.getByText("$50,000")).toBeInTheDocument();
  });

  it("renderiza el precio total (precio * cantidad)", () => {
    render(
      <CartItemCard
        item={mockItem}
        onRemove={jest.fn()}
        onUpdateQuantity={jest.fn()}
      />
    );

    expect(screen.getByText("$100,000")).toBeInTheDocument();
  });

  it("llamará onRemove con el id correcto cuando se hace click en eliminar", () => {
    const onRemove = jest.fn();
    render(
      <CartItemCard
        item={mockItem}
        onRemove={onRemove}
        onUpdateQuantity={jest.fn()}
      />
    );

    const removeButton = screen.getByLabelText("Eliminar producto");
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith("test-1");
  });

  it("llama onUpdateQuantity al aumentar cantidad", () => {
    const onUpdateQuantity = jest.fn();
    render(
      <CartItemCard
        item={mockItem}
        onRemove={jest.fn()}
        onUpdateQuantity={onUpdateQuantity}
      />
    );

    const increaseButton = screen.getByLabelText("Aumentar cantidad");
    fireEvent.click(increaseButton);

    expect(onUpdateQuantity).toHaveBeenCalledWith("test-1", 1);
  });

  it("llama onUpdateQuantity al disminuir cantidad", () => {
    const onUpdateQuantity = jest.fn();
    render(
      <CartItemCard
        item={mockItem}
        onRemove={jest.fn()}
        onUpdateQuantity={onUpdateQuantity}
      />
    );

    const decreaseButton = screen.getByLabelText("Disminuir cantidad");
    fireEvent.click(decreaseButton);

    expect(onUpdateQuantity).toHaveBeenCalledWith("test-1", -1);
  });

  it("renderiza sin tamaño si está vacío", () => {
    const itemWithoutSize = { ...mockItem, size: "" };
    render(
      <CartItemCard
        item={itemWithoutSize}
        onRemove={jest.fn()}
        onUpdateQuantity={jest.fn()}
      />
    );

    expect(screen.getByText("Azul")).toBeInTheDocument();
  });
});
