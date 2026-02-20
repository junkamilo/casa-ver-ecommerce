import { render, screen } from "@testing-library/react";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { ORDER_STATUS_CONFIG } from "../constants";
import { OrderStatus } from "../types";

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

describe("OrderStatusBadge", () => {
  it.each(ALL_STATUSES)("muestra la etiqueta correcta para %s", (status) => {
    render(<OrderStatusBadge status={status} />);
    expect(screen.getByText(ORDER_STATUS_CONFIG[status].label)).toBeInTheDocument();
  });

  it("renderiza el punto indicador de color", () => {
    const { container } = render(<OrderStatusBadge status="DELIVERED" />);
    const dot = container.querySelector("span span");
    expect(dot).toBeInTheDocument();
    expect(dot?.className).toContain("rounded-full");
  });

  it("aplica clases de color verde para DELIVERED", () => {
    const { container } = render(<OrderStatusBadge status="DELIVERED" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("emerald");
  });

  it("aplica clases de color rojo para CANCELLED", () => {
    const { container } = render(<OrderStatusBadge status="CANCELLED" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("red");
  });

  it("aplica clases de color amarillo para PENDING", () => {
    const { container } = render(<OrderStatusBadge status="PENDING" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("yellow");
  });

  it("renderiza como span con rounded-full", () => {
    const { container } = render(<OrderStatusBadge status="SHIPPED" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.tagName).toBe("SPAN");
    expect(badge.className).toContain("rounded-full");
  });
});
