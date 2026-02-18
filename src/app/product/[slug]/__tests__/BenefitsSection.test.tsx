import { render, screen } from "@testing-library/react";
import BenefitsSection from "../components/BenefitsSection";

describe("BenefitsSection", () => {
  it("muestra los tres beneficios", () => {
    render(<BenefitsSection />);
    expect(screen.getByText("Diseños Exclusivos")).toBeInTheDocument();
    expect(screen.getByText("Comodidad Absoluta")).toBeInTheDocument();
    expect(screen.getByText("Para toda ocasión")).toBeInTheDocument();
  });

  it("renderiza exactamente 3 ítems", () => {
    render(<BenefitsSection />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(3);
  });
});
