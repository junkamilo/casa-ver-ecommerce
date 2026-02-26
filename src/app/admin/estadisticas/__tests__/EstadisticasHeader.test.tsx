import { render, screen, fireEvent } from "@testing-library/react";
import { EstadisticasHeader } from "../components/EstadisticasHeader";

describe("EstadisticasHeader", () => {
  it("muestra el título 'Estadísticas'", () => {
    render(<EstadisticasHeader period="week" onPeriodChange={jest.fn()} />);
    expect(screen.getByText("Estadísticas")).toBeInTheDocument();
  });

  it("muestra el subtítulo con descripción de la tienda", () => {
    render(<EstadisticasHeader period="week" onPeriodChange={jest.fn()} />);
    expect(
      screen.getByText(/Visión general del rendimiento de la tienda/)
    ).toBeInTheDocument();
  });

  it("renderiza los tres botones de periodo", () => {
    render(<EstadisticasHeader period="week" onPeriodChange={jest.fn()} />);
    expect(screen.getByText("Hoy")).toBeInTheDocument();
    expect(screen.getByText("Esta Semana")).toBeInTheDocument();
    expect(screen.getByText("Este Mes")).toBeInTheDocument();
  });

  it("el botón activo corresponde al periodo recibido por prop", () => {
    render(<EstadisticasHeader period="day" onPeriodChange={jest.fn()} />);
    const btn = screen.getByText("Hoy");
    expect(btn.className).toContain("bg-[#154734]");
    expect(btn.className).toContain("text-white");
  });

  it("los botones inactivos no tienen clase activa", () => {
    render(<EstadisticasHeader period="day" onPeriodChange={jest.fn()} />);
    const inactiveBtn = screen.getByText("Esta Semana");
    expect(inactiveBtn.className).not.toContain("bg-[#154734]");
  });

  it("llama a onPeriodChange con 'day' al hacer click en 'Hoy'", () => {
    const onPeriodChange = jest.fn();
    render(<EstadisticasHeader period="week" onPeriodChange={onPeriodChange} />);
    fireEvent.click(screen.getByText("Hoy"));
    expect(onPeriodChange).toHaveBeenCalledWith("day");
  });

  it("llama a onPeriodChange con 'month' al hacer click en 'Este Mes'", () => {
    const onPeriodChange = jest.fn();
    render(<EstadisticasHeader period="week" onPeriodChange={onPeriodChange} />);
    fireEvent.click(screen.getByText("Este Mes"));
    expect(onPeriodChange).toHaveBeenCalledWith("month");
  });

  it("llama a onPeriodChange exactamente una vez por click", () => {
    const onPeriodChange = jest.fn();
    render(<EstadisticasHeader period="week" onPeriodChange={onPeriodChange} />);
    fireEvent.click(screen.getByText("Hoy"));
    expect(onPeriodChange).toHaveBeenCalledTimes(1);
  });
});
