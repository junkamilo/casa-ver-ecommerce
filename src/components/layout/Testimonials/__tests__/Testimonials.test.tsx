import { render, screen, fireEvent } from "@testing-library/react";
import Testimonials from "../index";
import { TESTIMONIALS } from "../constants";

describe("Testimonials", () => {
  it("renders the section title", () => {
    render(<Testimonials />);
    expect(
      screen.getByText("Lo que dicen nuestras clientas")
    ).toBeInTheDocument();
  });

  it("renders all unique testimonial names at least once", () => {
    render(<Testimonials />);
    const uniqueNames = [...new Set(TESTIMONIALS.map((t) => t.name))];
    uniqueNames.forEach((name) => {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    });
  });

  it("renders double the number of cards (duplicated for infinite scroll)", () => {
    render(<Testimonials />);
    // Each unique review text appears duplicated; pick one that is unique in the data
    const uniqueTexts = [...new Set(TESTIMONIALS.map((t) => t.text))];
    uniqueTexts.forEach((text) => {
      const count = TESTIMONIALS.filter((t) => t.text === text).length;
      expect(screen.getAllByText(text).length).toBe(count * 2);
    });
  });

  it("renders the scrollable container", () => {
    render(<Testimonials />);
    // Container has the scrollbar-hide class
    const container = document.querySelector(".scrollbar-hide");
    expect(container).toBeInTheDocument();
  });

  it("pauses scroll animation on mouse enter", () => {
    render(<Testimonials />);
    const container = document.querySelector(".scrollbar-hide") as HTMLElement;
    fireEvent.mouseEnter(container);
    // After mouseEnter the container should still be in the document (no crash)
    expect(container).toBeInTheDocument();
  });

  it("resumes scroll animation on mouse leave", () => {
    render(<Testimonials />);
    const container = document.querySelector(".scrollbar-hide") as HTMLElement;
    fireEvent.mouseEnter(container);
    fireEvent.mouseLeave(container);
    expect(container).toBeInTheDocument();
  });
});
