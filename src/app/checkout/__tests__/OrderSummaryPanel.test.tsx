import { render, screen } from "@testing-library/react";
import OrderSummaryPanel from "../components/OrderSummaryPanel";
import type { CheckoutItem, CouponState } from "../types/types";

jest.mock("next/image", () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />;
  MockImage.displayName = "MockImage";
  return MockImage;
});

const mockItems: CheckoutItem[] = [
  {
    id: "1",
    variantId: "var-1",
    productId: "prod-1",
    sku: "SKU-001",
    name: "Silla Bambú",
    price: 120000,
    image: "/silla.jpg",
    color: "Natural",
    size: "Único",
    quantity: 2,
  },
  {
    id: "2",
    variantId: "var-2",
    productId: "prod-2",
    sku: "SKU-002",
    name: "Mesa Ratán",
    price: 80000,
    image: "/mesa.jpg",
    color: "Miel",
    size: "M",
    quantity: 1,
  },
];

const defaultCoupon: CouponState = {
  code: "",
  status: "idle",
  discountPercentage: 0,
};

describe("OrderSummaryPanel", () => {
  const defaultProps = {
    items: mockItems,
    subtotal: 320000,
    shippingCost: 18000,
    discount: 0,
    total: 338000,
    coupon: defaultCoupon,
    onApplyCoupon: jest.fn().mockResolvedValue(undefined),
    onRemoveCoupon: jest.fn(),
  };

  it("renders section heading", () => {
    render(<OrderSummaryPanel {...defaultProps} />);
    expect(screen.getByText("Tu Selección Casa Verde")).toBeInTheDocument();
  });

  it("renders all item names", () => {
    render(<OrderSummaryPanel {...defaultProps} />);
    expect(screen.getByText("Silla Bambú")).toBeInTheDocument();
    expect(screen.getByText("Mesa Ratán")).toBeInTheDocument();
  });

  it("renders item quantities", () => {
    render(<OrderSummaryPanel {...defaultProps} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders subtotal and shipping", () => {
    render(<OrderSummaryPanel {...defaultProps} />);
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
    expect(screen.getByText("Envío Nacional")).toBeInTheDocument();
  });

  it("renders total amount", () => {
    render(<OrderSummaryPanel {...defaultProps} />);
    expect(screen.getByText("Total a pagar")).toBeInTheDocument();
  });

  it("renders coupon input", () => {
    render(<OrderSummaryPanel {...defaultProps} />);
    expect(screen.getByPlaceholderText("Ingresa tu cupón")).toBeInTheDocument();
    expect(screen.getByText("Aplicar")).toBeInTheDocument();
  });
});
