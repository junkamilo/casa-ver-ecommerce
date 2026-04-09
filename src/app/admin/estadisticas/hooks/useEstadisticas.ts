"use client";

import { useState } from "react";
import { SALES_DATA } from "../constants/constants";
import type { Period, SalesPeriodData } from "../types/types";

interface UseEstadisticasReturn {
  period: Period;
  setPeriod: (p: Period) => void;
  data: SalesPeriodData;
}

export function useEstadisticas(): UseEstadisticasReturn {
  const [period, setPeriod] = useState<Period>("week");
  const data = SALES_DATA[period];
  return { period, setPeriod, data };
}
