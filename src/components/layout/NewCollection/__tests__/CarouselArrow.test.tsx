import { render, screen, fireEvent } from "@testing-library/react";
import CarouselArrow from "../components/CarouselArrow";

describe("CarouselArrow (NewCollection)", () => {
  it("renders left arrow button with correct aria-label", () => {
    render(<CarouselArrow direction="left" onClick={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Anterior" })).toBeInTheDocument();
  });

  it("renders right arrow button with correct aria-label", () => {
    render(<CarouselArrow direction="right" onClick={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeInTheDocument();
  });

  it("calls onClick when left button is clicked", () => {
    const handleClick = jest.fn();
    render(<CarouselArrow direction="left" onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when right button is clicked", () => {
    const handleClick = jest.fn();
    render(<CarouselArrow direction="right" onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("left arrow has left positioning classes", () => {
    render(<CarouselArrow direction="left" onClick={jest.fn()} />);
    const btn = screen.getByRole("button", { name: "Anterior" });
    expect(btn.className).toContain("left-0");
  });

  it("right arrow has right positioning classes", () => {
    render(<CarouselArrow direction="right" onClick={jest.fn()} />);
    const btn = screen.getByRole("button", { name: "Siguiente" });
    expect(btn.className).toContain("right-0");
  });
});
