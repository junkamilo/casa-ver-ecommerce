import { render, screen } from "@testing-library/react";
import { KpiCards } from "../components/KpiCards";
import { SALES_DATA } from "../constants";
import type { SalesPeriodData } from "../types";

const weekData: SalesPeriodData = SALES_DATA.week;
const dayData: SalesPeriodData = SALES_DATA.day;

describe("KpiCards", () => {
  it("renderiza las cuatro tarjetas KPI", () => {
    render(<KpiCards data={weekData} />);
    expect(screen.getByText("Ingresos Totales")).toBeInTheDocument();
    expect(screen.getByText("Pedidos Realizados")).toBeInTheDocument();
    expect(screen.getByText("Ticket Promedio")).toBeInTheDocument();
    expect(screen.getByText("Clientes Nuevos")).toBeInTheDocument();
  });

  it("muestra el total de ingresos correcto", () => {
    render(<KpiCards data={weekData} />);
    expect(screen.getByText(weekData.total)).toBeInTheDocument();
  });

  it("muestra la cantidad de pedidos correcta", () => {
    render(<KpiCards data={weekData} />);
    expect(screen.getByText(weekData.orders.toString())).toBeInTheDocument();
  });

  it("muestra el ticket promedio correcto", () => {
    render(<KpiCards data={weekData} />);
    expect(screen.getByText(weekData.avgTicket)).toBeInTheDocument();
  });

  it("muestra los clientes nuevos correctos", () => {
    render(<KpiCards data={weekData} />);
    expect(screen.getByText(weekData.newCustomers.toString())).toBeInTheDocument();
  });

  it("muestra el porcentaje de cambio", () => {
    render(<KpiCards data={weekData} />);
    expect(screen.getByText(weekData.change)).toBeInTheDocument();
  });

  it("actualiza los datos al cambiar el prop data", () => {
    const { rerender } = render(<KpiCards data={weekData} />);
    expect(screen.getByText(weekData.total)).toBeInTheDocument();

    rerender(<KpiCards data={dayData} />);
    expect(screen.getByText(dayData.total)).toBeInTheDocument();
    expect(screen.queryByText(weekData.total)).not.toBeInTheDocument();
  });

  it("muestra el total del periodo 'month' correctamente", () => {
    render(<KpiCards data={SALES_DATA.month} />);
    expect(screen.getByText(SALES_DATA.month.total)).toBeInTheDocument();
  });
});
