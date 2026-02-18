import { render, screen, fireEvent } from "@testing-library/react";
import GoogleButton from "../components/GoogleButton";

describe("GoogleButton (Register)", () => {
  it("muestra el texto 'Google'", () => {
    render(<GoogleButton isLoading={false} onClick={jest.fn()} />);
    expect(screen.getByText("Google")).toBeInTheDocument();
  });

  it("llama a onClick al hacer click", () => {
    const handleClick = jest.fn();
    render(<GoogleButton isLoading={false} onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("está deshabilitado cuando isLoading es true", () => {
    render(<GoogleButton isLoading={true} onClick={jest.fn()} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("no llama onClick cuando está deshabilitado", () => {
    const handleClick = jest.fn();
    render(<GoogleButton isLoading={true} onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renderiza el SVG del logo de Google", () => {
    const { container } = render(<GoogleButton isLoading={false} onClick={jest.fn()} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
