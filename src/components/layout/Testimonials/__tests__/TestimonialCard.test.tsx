import { render, screen } from "@testing-library/react";
import TestimonialCard from "../components/TestimonialCard";

describe("TestimonialCard", () => {
  it("renders the review comment", () => {
    render(<TestimonialCard rating={5} comment="Son muy tesas 👏" name="Alejandra Chalarca" />);
    expect(screen.getByText(/"Son muy tesas 👏"/)).toBeInTheDocument();
  });

  it("renders the reviewer name", () => {
    render(<TestimonialCard rating={5} comment="Son muy tesas 👏" name="Alejandra Chalarca" />);
    expect(screen.getByText("Alejandra Chalarca")).toBeInTheDocument();
  });

  it("renders 5 star SVG icons for a 5-star rating", () => {
    const { container } = render(<TestimonialCard rating={5} comment="Excelente" name="Laura Villa" />);
    const stars = container.querySelectorAll("svg");
    // Stars container + quote icon = more than 5 svgs, but stars are inside the rating div
    expect(stars.length).toBeGreaterThanOrEqual(5);
  });

  it("renders a different rating correctly", () => {
    const { container } = render(<TestimonialCard rating={3} comment="Bueno" name="Ana García" />);
    // Component renders 5 star icons total
    const starsContainer = container.querySelector(".flex.items-center.gap-0\\.5");
    expect(starsContainer).toBeInTheDocument();
    const svgs = starsContainer?.querySelectorAll("svg");
    expect(svgs?.length).toBe(5);
  });

  it("renders with an optional date", () => {
    render(<TestimonialCard rating={5} comment="Perfecto" name="María López" date="Enero 2025" />);
    expect(screen.getByText("Enero 2025")).toBeInTheDocument();
  });

  it("renders without crashing when no date is provided", () => {
    render(<TestimonialCard rating={4} comment="Muy bueno" name="Sofía Ruiz" />);
    expect(screen.getByText("Sofía Ruiz")).toBeInTheDocument();
  });
});
