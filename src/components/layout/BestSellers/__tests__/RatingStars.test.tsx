import { render, screen } from "@testing-library/react";
import RatingStars from "../components/RatingStars";

describe("RatingStars", () => {
  it("renders 5 stars total", () => {
    const { container } = render(<RatingStars rating={3} />);
    const stars = container.querySelectorAll("svg");
    expect(stars).toHaveLength(5);
  });

  it("has accessible aria-label with the rating", () => {
    render(<RatingStars rating={4} />);
    expect(screen.getByLabelText("4 de 5 estrellas")).toBeInTheDocument();
  });

  it("applies filled class to stars up to rating value", () => {
    const { container } = render(<RatingStars rating={3} />);
    const stars = container.querySelectorAll("svg");
    stars.forEach((star, i) => {
      if (i < 3) {
        expect(star.getAttribute("class")).toContain("fill-accent");
      } else {
        expect(star.getAttribute("class")).not.toContain("fill-accent");
      }
    });
  });

  it("renders all stars unfilled for rating 0", () => {
    const { container } = render(<RatingStars rating={0} />);
    const stars = container.querySelectorAll("svg");
    stars.forEach((star) => {
      expect(star.getAttribute("class")).not.toContain("fill-accent");
    });
  });

  it("renders all stars filled for rating 5", () => {
    const { container } = render(<RatingStars rating={5} />);
    const stars = container.querySelectorAll("svg");
    stars.forEach((star) => {
      expect(star.getAttribute("class")).toContain("fill-accent");
    });
  });
});
