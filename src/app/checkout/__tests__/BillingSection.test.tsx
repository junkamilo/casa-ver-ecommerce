import { render, screen, fireEvent } from "@testing-library/react";
import BillingSection from "../components/BillingSection";

describe("BillingSection", () => {
  it("renders billing heading", () => {
    render(<BillingSection billingSameAsShipping={true} onChange={jest.fn()} />);
    expect(screen.getByText("Facturación")).toBeInTheDocument();
  });

  it("first radio is checked when billingSameAsShipping=true", () => {
    render(<BillingSection billingSameAsShipping={true} onChange={jest.fn()} />);
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();
  });

  it("second radio is checked when billingSameAsShipping=false", () => {
    render(<BillingSection billingSameAsShipping={false} onChange={jest.fn()} />);
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
  });

  it("calls onChange(true) when first radio clicked", () => {
    const onChange = jest.fn();
    render(<BillingSection billingSameAsShipping={false} onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[0]);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange(false) when second radio clicked", () => {
    const onChange = jest.fn();
    render(<BillingSection billingSameAsShipping={true} onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[1]);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
