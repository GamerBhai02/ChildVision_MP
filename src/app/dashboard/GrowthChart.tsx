"use client";

import { CurvePoint } from "@/lib/whoCurves";
import { GrowthRecord } from "@/lib/growth";

interface GrowthChartProps {
  records: GrowthRecord[];
  curve: CurvePoint[];
  indicator: "hfa" | "wfa" | "bfa";
  sex: "male" | "female";
}

export default function GrowthChart({ records, curve, indicator, sex }: GrowthChartProps) {
  // SVG Dimensions
  const width = 700;
  const height = 400;
  const paddingLeft = 50;
  const paddingRight = 100;
  const paddingTop = 30;
  const paddingBottom = 45;

  // Chart boundaries
  const minX = 0;
  const maxX = 60; // Max age 5 years (60 months)

  let minY = 0;
  let maxY = 100;
  let yLabel = "";
  let getVal = (r: GrowthRecord) => 0;

  if (indicator === "hfa") {
    minY = 40;
    maxY = 125;
    yLabel = "Height (cm)";
    getVal = (r) => r.height;
  } else if (indicator === "wfa") {
    minY = 2;
    maxY = 28;
    yLabel = "Weight (kg)";
    getVal = (r) => r.weight;
  } else {
    minY = 10;
    maxY = 23;
    yLabel = "BMI (kg/m²)";
    getVal = (r) => r.bmi;
  }

  // Scaling helpers to convert data coordinates to SVG pixel coordinates
  const getXPixel = (month: number) => {
    const chartWidth = width - paddingLeft - paddingRight;
    return paddingLeft + ((month - minX) / (maxX - minX)) * chartWidth;
  };

  const getYPixel = (value: number) => {
    const chartHeight = height - paddingTop - paddingBottom;
    // Invert Y because SVG coordinates start at top-left
    return height - paddingBottom - ((value - minY) / (maxY - minY)) * chartHeight;
  };

  // Generate SVG Path for a specific curve parameter
  const getCurvePath = (key: keyof CurvePoint) => {
    if (!curve || curve.length === 0) return "";
    return curve
      .map((pt, idx) => {
        const x = getXPixel(pt.month);
        const y = getYPixel(pt[key] as number);
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  // Generate Shaded Polygon Path between +2 SD and -2 SD (Healthy Corridor)
  const getCorridorPath = () => {
    if (!curve || curve.length === 0) return "";
    
    // Top line (+2 SD) going forward
    const topPoints = curve.map((pt) => `${getXPixel(pt.month).toFixed(1)},${getYPixel(pt.sdPlus2).toFixed(1)}`);
    // Bottom line (-2 SD) going backward
    const bottomPoints = [...curve]
      .reverse()
      .map((pt) => `${getXPixel(pt.month).toFixed(1)},${getYPixel(pt.sdMinus2).toFixed(1)}`);
      
    return `M ${topPoints.join(" L ")} L ${bottomPoints.join(" L ")} Z`;
  };

  // Generate SVG Path for Child's Growth Line
  const getChildPath = () => {
    if (records.length === 0) return "";
    // Filter records within 60 months and sort them
    const validRecords = records
      .filter((r) => r.ageInMonths <= 60)
      .sort((a, b) => a.ageInMonths - b.ageInMonths);

    return validRecords
      .map((r, idx) => {
        const x = getXPixel(r.ageInMonths);
        const y = getYPixel(getVal(r));
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  // Vertical Grid Lines (every 6 months)
  const xGridTicks = Array.from({ length: 11 }, (_, i) => i * 6);
  // Horizontal Grid Lines (5 subdivisions)
  const yGridTicks = Array.from({ length: 6 }, (_, i) => minY + (i * (maxY - minY)) / 5);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        style={{ width: "100%", minWidth: "600px", height: "auto", background: "rgba(0,0,0,0.15)", borderRadius: "12px", border: "1px solid var(--border-light)" }}
        id={`chart-${indicator}`}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="childLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <radialGradient id="dotGlow" r="50%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* X and Y Axes Gridlines */}
        <g stroke="rgba(255,255,255,0.04)" strokeWidth="1">
          {/* Vertical grid lines */}
          {xGridTicks.map((tick) => (
            <line 
              key={`x-${tick}`}
              x1={getXPixel(tick)} 
              y1={paddingTop} 
              x2={getXPixel(tick)} 
              y2={height - paddingBottom} 
            />
          ))}
          {/* Horizontal grid lines */}
          {yGridTicks.map((tick) => (
            <line 
              key={`y-${tick}`}
              x1={paddingLeft} 
              y1={getYPixel(tick)} 
              x2={width - paddingRight} 
              y2={getYPixel(tick)} 
            />
          ))}
        </g>

        {/* Healthy Corridor Background Fill (+2 SD to -2 SD) */}
        {curve && curve.length > 0 && (
          <path 
            d={getCorridorPath()} 
            fill="rgba(16, 185, 129, 0.05)" 
            stroke="none" 
          />
        )}

        {/* WHO Reference Curves */}
        {curve && curve.length > 0 && (
          <g fill="none" strokeWidth="1.2">
            {/* +3 SD (Obese / Tall Threshold) */}
            <path 
              d={getCurvePath("sdPlus3")} 
              stroke="rgba(239, 68, 68, 0.35)" 
              strokeDasharray="4 4" 
            />
            {/* +2 SD (Overweight / High Threshold) */}
            <path 
              d={getCurvePath("sdPlus2")} 
              stroke="rgba(16, 185, 129, 0.45)" 
            />
            {/* Median (50th percentile) */}
            <path 
              d={getCurvePath("median")} 
              stroke="rgba(139, 92, 246, 0.5)" 
              strokeDasharray="6 3" 
            />
            {/* -2 SD (Wasted / Stunted / Underweight Threshold) */}
            <path 
              d={getCurvePath("sdMinus2")} 
              stroke="rgba(245, 158, 11, 0.45)" 
            />
            {/* -3 SD (Severe Malnutrition Threshold) */}
            <path 
              d={getCurvePath("sdMinus3")} 
              stroke="rgba(239, 68, 68, 0.45)" 
              strokeDasharray="4 4" 
            />
          </g>
        )}

        {/* WHO Labels (At the right-side padding boundary) */}
        {curve && curve.length > 0 && (
          <g fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-display)" fontWeight="500">
            {(() => {
              const lastPt = curve[curve.length - 1];
              return (
                <>
                  <text x={width - paddingRight + 8} y={getYPixel(lastPt.sdPlus3) + 3} fill="rgba(239, 68, 68, 0.7)">+3 SD (Obese/Tall)</text>
                  <text x={width - paddingRight + 8} y={getYPixel(lastPt.sdPlus2) + 3} fill="rgba(16, 185, 129, 0.7)">+2 SD (Overweight)</text>
                  <text x={width - paddingRight + 8} y={getYPixel(lastPt.median) + 3} fill="rgba(139, 92, 246, 0.7)">Median (50th)</text>
                  <text x={width - paddingRight + 8} y={getYPixel(lastPt.sdMinus2) + 3} fill="rgba(245, 158, 11, 0.7)">-2 SD (Stunted/Wasted)</text>
                  <text x={width - paddingRight + 8} y={getYPixel(lastPt.sdMinus3) + 3} fill="rgba(239, 68, 68, 0.7)">-3 SD (Severe)</text>
                </>
              );
            })()}
          </g>
        )}

        {/* Child's Growth Line */}
        {records.length > 0 && (
          <path 
            d={getChildPath()} 
            fill="none" 
            stroke="url(#childLineGrad)" 
            strokeWidth="3.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="drop-shadow(0px 2px 8px rgba(139, 92, 246, 0.4))"
          />
        )}

        {/* Child's Growth Markers (Data Points) */}
        {records
          .filter((r) => r.ageInMonths <= 60)
          .map((r, idx) => {
            const cx = getXPixel(r.ageInMonths);
            const cy = getYPixel(getVal(r));
            return (
              <g key={`dot-${r.id || idx}`}>
                {/* Glow ring around dot */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r="9" 
                  fill="url(#dotGlow)" 
                />
                {/* Outer stroke dot */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r="5" 
                  fill="#ffffff" 
                  stroke="var(--primary)" 
                  strokeWidth="2.5" 
                />
                {/* Value text tag on hover or always */}
                <text
                  x={cx}
                  y={cy - 10}
                  fill="var(--text-main)"
                  fontSize="9"
                  fontFamily="var(--font-display)"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {getVal(r).toFixed(1)}
                </text>
              </g>
            );
          })}

        {/* Axes Labels and Ticks */}
        {/* X Axis Ticks */}
        <g fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-display)" textAnchor="middle">
          {xGridTicks.map((tick) => (
            <text 
              key={`label-x-${tick}`}
              x={getXPixel(tick)} 
              y={height - paddingBottom + 16}
            >
              {tick}m
            </text>
          ))}
          {/* Axis Label */}
          <text 
            x={paddingLeft + (width - paddingLeft - paddingRight) / 2} 
            y={height - 6} 
            fontSize="10" 
            fontWeight="bold" 
            fill="var(--text-dim)"
          >
            Age in Months
          </text>
        </g>

        {/* Y Axis Ticks */}
        <g fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-display)" textAnchor="end">
          {yGridTicks.map((tick) => (
            <text 
              key={`label-y-${tick}`}
              x={paddingLeft - 8} 
              y={getYPixel(tick) + 3}
            >
              {tick.toFixed(0)}
            </text>
          ))}
          {/* Axis Label */}
          <text 
            x={10} 
            y={paddingTop - 10} 
            fontSize="10" 
            fontWeight="bold" 
            fill="var(--text-dim)" 
            textAnchor="start"
          >
            {yLabel}
          </text>
        </g>
      </svg>
    </div>
  );
}
