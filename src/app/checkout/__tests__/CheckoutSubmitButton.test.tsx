import { render, screen } from "@testing-library/react";
import CheckoutSubmitButton from "../components/CheckoutSubmitButton";

describe("CheckoutSubmitButton", () => {
  it("renders the button", () => {
    render(<CheckoutSubmitButton />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows pay label", () => {
    render(<CheckoutSubmitButton />);
    expect(screen.getByText("Pagar Pedido")).toBeInTheDocument();
  });
});
