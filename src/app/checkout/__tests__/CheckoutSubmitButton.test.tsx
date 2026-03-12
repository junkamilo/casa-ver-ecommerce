import { render, screen } from "@testing-library/react";
import CheckoutSubmitButton from "../components/CheckoutSubmitButton";

describe("CheckoutSubmitButton", () => {
  it("renders the button", () => {
    render(<CheckoutSubmitButton isPending={false} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows pay label when not pending", () => {
    render(<CheckoutSubmitButton isPending={false} />);
    expect(screen.getByText("Pagar Pedido")).toBeInTheDocument();
  });

  it("shows processing label when pending", () => {
    render(<CheckoutSubmitButton isPending={true} />);
    expect(screen.getByText("Procesando...")).toBeInTheDocument();
  });

  it("is disabled when isPending is true", () => {
    render(<CheckoutSubmitButton isPending={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is not disabled when isPending is false", () => {
    render(<CheckoutSubmitButton isPending={false} />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });
});
