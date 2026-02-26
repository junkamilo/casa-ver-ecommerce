import { render, screen } from "@testing-library/react";
import { CategoryChart } from "../components/CategoryChart";
import { CATEGORY_SALES } from "../constants";

describe("CategoryChart", () => {
  it("muestra el título 'Categorías Top'", () => {
    render(<CategoryChart />);
    expect(screen.getByText("Categorías Top")).toBeInTheDocument();
  });

  it("renderiza todas las categorías", () => {
    render(<CategoryChart />);
    CATEGORY_SALES.forEach((cat) => {
      expect(screen.getByText(cat.name)).toBeInTheDocument();
    });
  });

  it("muestra el porcentaje de cada categoría", () => {
    render(<CategoryChart />);
    CATEGORY_SALES.forEach((cat) => {
      expect(screen.getByText(`${cat.percentage}%`)).toBeInTheDocument();
    });
  });

  it("muestra la categoría 'Enterizos' con 35%", () => {
    render(<CategoryChart />);
    expect(screen.getByText("Enterizos")).toBeInTheDocument();
    expect(screen.getByText("35%")).toBeInTheDocument();
  });

  it("muestra la categoría 'Accesorios' con 7%", () => {
    render(<CategoryChart />);
    expect(screen.getByText("Accesorios")).toBeInTheDocument();
    expect(screen.getByText("7%")).toBeInTheDocument();
  });

  it("renderiza exactamente 5 categorías", () => {
    render(<CategoryChart />);
    const percentages = screen.getAllByText(/%$/);
    expect(percentages).toHaveLength(CATEGORY_SALES.length);
  });
});
