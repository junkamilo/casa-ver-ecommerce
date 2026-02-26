import { render, screen } from "@testing-library/react";
import { SalesChart } from "../components/SalesChart";
import { DAILY_SALES } from "../constants";

describe("SalesChart", () => {
  it("muestra el título 'Resumen de Ventas'", () => {
    render(<SalesChart />);
    expect(screen.getByText("Resumen de Ventas")).toBeInTheDocument();
  });

  it("renderiza una columna por cada día de la semana", () => {
    render(<SalesChart />);
    DAILY_SALES.forEach((d) => {
      expect(screen.getByText(d.day)).toBeInTheDocument();
    });
  });

  it("renderiza exactamente 7 etiquetas de días", () => {
    render(<SalesChart />);
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    days.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it("el primer día es 'Lun'", () => {
    render(<SalesChart />);
    expect(screen.getByText("Lun")).toBeInTheDocument();
  });

  it("el último día es 'Dom'", () => {
    render(<SalesChart />);
    expect(screen.getByText("Dom")).toBeInTheDocument();
  });

  it("el día de mayor venta es 'Sáb' (2200000)", () => {
    render(<SalesChart />);
    expect(screen.getByText("Sáb")).toBeInTheDocument();
  });
});
