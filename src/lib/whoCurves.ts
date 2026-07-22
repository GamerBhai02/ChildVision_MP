import { loadTable } from "@pedi-growth/core";

export interface CurvePoint {
  month: number;
  sdMinus3: number;
  sdMinus2: number;
  sdMinus1: number;
  median: number;
  sdPlus1: number;
  sdPlus2: number;
  sdPlus3: number;
}

// Helper to calculate raw values from LMS coefficients at a specific Z-score
export const getLmsValue = (L: number, M: number, S: number, Z: number): number => {
  if (L === 0) {
    return M * Math.exp(S * Z);
  }
  // Standard Box-Cox inverse transformation
  return M * Math.pow(1 + L * S * Z, 1 / L);
};

// Generates the reference WHO curve points from month 0 to 60
export const getWhoReferenceCurve = async (
  indicator: "weight-for-age" | "length-height-for-age" | "bmi-for-age",
  sex: "male" | "female"
): Promise<CurvePoint[]> => {
  try {
    // Map internal indicators to pedi-growth table names
    let tableName: any;
    const isBoys = sex === "male";
    
    if (indicator === "weight-for-age") {
      tableName = isBoys ? "wfa-boys-0-5" : "wfa-girls-0-5";
    } else if (indicator === "length-height-for-age") {
      tableName = isBoys ? "lhfa-boys-0-5" : "lhfa-girls-0-5";
    } else {
      tableName = isBoys ? "bfa-boys-0-5" : "bfa-girls-0-5";
    }

    const table = await loadTable(tableName);
    const curvePoints: CurvePoint[] = [];

    // Sample the day-by-day table at monthly intervals (0 to 60 months)
    for (let month = 0; month <= 60; month++) {
      const targetDays = Math.round(month * 30.4375);
      
      // Find the closest row in the table
      let closestRow = table[0];
      let minDiff = Math.abs(table[0].age - targetDays);
      
      for (let i = 1; i < table.length; i++) {
        const diff = Math.abs(table[i].age - targetDays);
        if (diff < minDiff) {
          minDiff = diff;
          closestRow = table[i];
        }
      }

      const { L, M, S } = closestRow;

      curvePoints.push({
        month,
        sdMinus3: getLmsValue(L, M, S, -3),
        sdMinus2: getLmsValue(L, M, S, -2),
        sdMinus1: getLmsValue(L, M, S, -1),
        median: getLmsValue(L, M, S, 0),
        sdPlus1: getLmsValue(L, M, S, 1),
        sdPlus2: getLmsValue(L, M, S, 2),
        sdPlus3: getLmsValue(L, M, S, 3),
      });
    }

    return curvePoints;
  } catch (error) {
    console.error("Error loading WHO table, using mathematical approximations:", error);
    return getFallbackReferenceCurve(indicator, sex);
  }
};

// Generates smooth fallback curves based on standard pediatric averages if dynamic load fails
export const getFallbackReferenceCurve = (
  indicator: "weight-for-age" | "length-height-for-age" | "bmi-for-age",
  sex: "male" | "female"
): CurvePoint[] => {
  const curvePoints: CurvePoint[] = [];
  const isMale = sex === "male";

  for (let month = 0; month <= 60; month++) {
    let median = 0;
    let s = 0.1; // Coefficient of variation approximation
    let l = 1;   // Box-Cox power

    if (indicator === "length-height-for-age") {
      // Average birth height ~50cm, 1yr ~75cm, 2yr ~87cm, 5yr ~110cm
      median = 49.5 + 24.5 * Math.pow(month / 12, 0.65);
      if (!isMale) median -= 0.8; // Girls are slightly shorter on average
      s = 0.04; // height has low variation
      l = 1;
    } else if (indicator === "weight-for-age") {
      // Average birth weight ~3.3kg, 1yr ~9.6kg, 2yr ~12.2kg, 5yr ~18.3kg
      median = 3.3 + 6.3 * Math.pow(month / 12, 0.72);
      if (!isMale) median -= 0.4;
      s = 0.12; // weight has higher variation
      l = 0.5;  // slightly skewed
    } else {
      // BMI starts at ~13 at birth, rises to ~17 at 12m, then decreases to ~15.5 at 60m
      const t = month / 12;
      median = 13.0 + 4.2 * t * Math.exp(-0.8 * t);
      if (!isMale) median -= 0.2;
      s = 0.08;
      l = -0.5;
    }

    curvePoints.push({
      month,
      sdMinus3: getLmsValue(l, median, s, -3),
      sdMinus2: getLmsValue(l, median, s, -2),
      sdMinus1: getLmsValue(l, median, s, -1),
      median: median,
      sdPlus1: getLmsValue(l, median, s, 1),
      sdPlus2: getLmsValue(l, median, s, 2),
      sdPlus3: getLmsValue(l, median, s, 3),
    });
  }

  return curvePoints;
};
