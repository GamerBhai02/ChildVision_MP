import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GrowthRecord } from "@/lib/growth";

export async function POST(request: Request) {
  try {
    const { name, sex, ageMonths, records } = await request.json() as {
      name: string;
      sex: string;
      ageMonths: number;
      records: GrowthRecord[];
    };

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: "No growth records provided for analysis." },
        { status: 400 }
      );
    }

    // Sort records by date ascending for timeline analysis
    const sorted = [...records].sort(
      (a, b) => new Date(a.dateOfMeasurement).getTime() - new Date(b.dateOfMeasurement).getTime()
    );
    const latest = sorted[sorted.length - 1];

    // Check for Gemini API key
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured. Utilizing simulated clinical fallback.");
      // Generate highly detailed simulated pediatric evaluation based on actual WHO Z-score limits
      const fallbackAnalysis = generateFallbackClinicalAnalysis(name, sex, ageMonths, sorted, latest);
      return NextResponse.json(fallbackAnalysis);
    }

    // Initialize Gemini Client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    // Format a context-rich prompt detailing the longitudinal tracking
    const historyText = sorted
      .map((r) => {
        const date = new Date(r.dateOfMeasurement).toLocaleDateString();
        const hcText = r.headCircumference ? `, Head Circumference: ${r.headCircumference}cm (Ratio: ${r.headToHeightRatio?.toFixed(2)})` : "";
        const wflText = r.zScores.wfl ? `, Weight-for-Height/Length Z: ${r.zScores.wfl.toFixed(2)} (${r.classifications.wfl?.label})` : "";
        return `- Date: ${date}, Age: ${r.ageInMonths} months, Height: ${r.height}cm (Z: ${r.zScores.hfa.toFixed(2)}, ${r.classifications.hfa.label}), Weight: ${r.weight}kg (Z: ${r.zScores.wfa.toFixed(2)}, ${r.classifications.wfa.label}), BMI: ${r.bmi.toFixed(1)} (Z: ${r.zScores.bfa.toFixed(2)}, ${r.classifications.bfa.label})${hcText}${wflText}`;
      })
      .join("\n");

    const prompt = `You are an expert AI Pediatrician and Growth Development Coach. Analyze the following child growth logs representing longitudinal tracking for a toddler:

Child Profile:
- Name: ${name}
- Biological Sex: ${sex}
- Current Age: ${ageMonths} months

Historical Growth Logs (sorted chronologically):
${historyText}

Latest Statistics:
- Height: ${latest.height} cm
- Weight: ${latest.weight} kg
- BMI: ${latest.bmi.toFixed(1)}
- Head Circumference: ${latest.headCircumference ? `${latest.headCircumference} cm` : "Not provided"}

Instructions:
1. Review the height, weight, BMI, and head circumference curves over time. Determine if the growth velocity is stable, accelerating, or decelerating.
2. Cross-reference the Z-scores against standard WHO thresholds:
   - Z < -2 SD is Stunted (Height-for-Age), Wasted (BMI-for-Age/Weight-for-Height), or Underweight (Weight-for-Age).
   - Z > +2 SD is Overweight/Obese.
   - Look at the Head Circumference-for-Age and Head-to-Body ratio.
3. Formulate a pediatrician-level conclusion in a warm, parent-friendly tone. Do not give direct medication advice but suggest actionable nutrition, physical activities, safety steps, or pediatrician consultations.
4. Output your response strictly as a JSON object matching this schema:
{
  "summary": "A concise paragraph (3-4 sentences) evaluating the child's growth speed, weight-to-height proportion, and overall wellness trajectory.",
  "status": "One of: 'Healthy Growth', 'Monitor Trends', 'Growth Warning' (Warning if Z-scores are outside -2 to +2)",
  "recommendations": [
    "A specific, actionable recommendation concerning nutrition/diet based on their weight status",
    "A recommendation concerning physical activities, milestone exercises, or sleep",
    "A recommendation concerning head circumference or developmental monitoring",
    "A general recommendation on when to seek a routine pediatrician check-up"
  ]
}

Ensure the response is valid JSON and contains only the requested fields.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const textResponse = result.response.text();
    const parsed = JSON.parse(textResponse);

    return NextResponse.json({
      summary: parsed.summary,
      status: parsed.status,
      recommendations: parsed.recommendations,
      timestamp: new Date().toISOString(),
      model: "gemini-2.5-flash"
    });

  } catch (error) {
    console.error("Gemini AI API execution error:", error);
    return NextResponse.json(
      { error: "AI Engine encountered an error parsing child measurements." },
      { status: 500 }
    );
  }
}

// Medical fallback generator if Gemini API key is missing
function generateFallbackClinicalAnalysis(
  name: string,
  sex: string,
  ageMonths: number,
  sorted: GrowthRecord[],
  latest: GrowthRecord
) {
  // Check latest Z scores
  const wfaZ = latest.zScores.wfa;
  const hfaZ = latest.zScores.hfa;
  const bfaZ = latest.zScores.bfa;

  let status = "Healthy Growth";
  let summary = "";
  const recommendations: string[] = [];

  // Determine stunting status
  const isStunted = hfaZ < -2;
  const isUnderweight = wfaZ < -2;
  const isWasted = bfaZ < -2;
  const isOverweight = bfaZ > 2;

  if (isStunted || isUnderweight || isWasted) {
    status = "Growth Warning";
    summary = `Based on longitudinal tracking, ${name}'s measurements fall below standard WHO percentiles. Specifically, the height-for-age (Z: ${hfaZ.toFixed(1)}) and weight-for-age (Z: ${wfaZ.toFixed(1)}) show signs of growth deceleration. Active nutritional support is recommended to promote catch-up growth.`;
  } else if (Math.abs(wfaZ) > 1.5 || Math.abs(hfaZ) > 1.5 || Math.abs(bfaZ) > 1.5) {
    status = "Monitor Trends";
    summary = `${name}'s growth velocity shows minor fluctuations but remains within an acceptable range. The height-to-weight proportions are adequate, though the BMI (Z: ${bfaZ.toFixed(1)}) should be monitored over the next few months to ensure they stay aligned with healthy WHO percentile lines.`;
  } else {
    status = "Healthy Growth";
    summary = `Excellent growth trajectory! ${name}'s measurements align closely with the WHO median (50th percentile) curves. The height (Z: ${hfaZ.toFixed(1)}) and weight (Z: ${wfaZ.toFixed(1)}) show stable, proportional development, indicating healthy nutrition and bone growth.`;
  }

  // Nutrition recommendations
  if (isUnderweight || isWasted) {
    recommendations.push("Increase energy-dense foods in diet, incorporating healthy fats like avocado, whole milk, or nut butters.");
  } else if (isOverweight) {
    recommendations.push("Ensure balanced, portion-controlled meals rich in whole grains and fresh vegetables. Limit sugary juices and processed snacks.");
  } else {
    recommendations.push("Continue with a balanced diet containing a variety of protein sources, dairy, and colorful vegetables to support bone density.");
  }

  // Milestone activity
  if (ageMonths < 12) {
    recommendations.push("Promote tummy time (at least 30 minutes daily) and floor play to build neck, core, and arm strength.");
  } else if (ageMonths < 24) {
    recommendations.push("Encourage walking, push-toys, and stacking blocks to refine gross and fine motor coordination.");
  } else {
    recommendations.push("Provide active play, running, jumping, and climbing options (at least 60 minutes daily) to develop cardiovascular stamina.");
  }

  // Head Circumference or body proportion recommendation
  if (latest.headCircumference) {
    const hcZ = latest.zScores.hcfa ?? 0;
    if (Math.abs(hcZ) > 2) {
      recommendations.push(`The head circumference Z-score (Z: ${hcZ.toFixed(1)}) shows a significant deviation from average. Discuss this trend with your pediatrician.`);
    } else {
      recommendations.push(`Head circumference (Z: ${hcZ.toFixed(1)}) is proportionate to height, indicating normal head-to-body skeletal ratio of ${((latest.headToHeightRatio ?? 0) * 100).toFixed(0)}%.`);
    }
  } else {
    recommendations.push("Log your child's head circumference in the form to track head-to-body proportions alongside height and weight.");
  }

  // Pediatric check-up recommendation
  recommendations.push("Schedule regular check-ups at 12, 15, 18, 24, 30, and 36 months as recommended by the American Academy of Pediatrics (AAP).");

  return {
    summary,
    status,
    recommendations,
    timestamp: new Date().toISOString(),
    model: "Simulated Pediatric Engine (Fallback)"
  };
}
