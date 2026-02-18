import { render, screen } from "@testing-library/react";
import TestimonialCard from "../components/TestimonialCard";

describe("TestimonialCard", () => {
  it("renders the review text", () => {
    render(<TestimonialCard rating={5} text="Son muy tesas 👏" name="Alejandra Chalarca" />);
    expect(screen.getByText("Son muy tesas 👏")).toBeInTheDocument();
  });

  it("renders the reviewer name", () => {
    render(<TestimonialCard rating={5} text="Son muy tesas 👏" name="Alejandra Chalarca" />);
    expect(screen.getByText("Alejandra Chalarca")).toBeInTheDocument();
  });

  it("shows correct aria-label for 5-star rating", () => {
    render(<TestimonialCard rating={5} text="Excelente" name="Laura Villa" />);
    expect(screen.getByLabelText("5 de 5 estrellas")).toBeInTheDocument();
  });

  it("shows correct aria-label for partial rating", () => {
    render(<TestimonialCard rating={3} text="Bueno" name="Ana García" />);
    expect(screen.getByLabelText("3 de 5 estrellas")).toBeInTheDocument();
  });

  it("renders exactly 5 star icons", () => {
    render(<TestimonialCard rating={5} text="Perfecto" name="María López" />);
    // lucide Star renders as SVG elements
    const starsContainer = screen.getByLabelText("5 de 5 estrellas");
    const stars = starsContainer.querySelectorAll("svg");
    expect(stars).toHaveLength(5);
  });
});
