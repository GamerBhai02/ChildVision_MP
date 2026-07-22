import { calculateAll, loadTable } from "@pedi-growth/core";
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";

export interface GrowthRecord {
  id?: string;
  dateOfMeasurement: string; // ISO string
  ageInDays: number;
  ageInMonths: number;
  weight: number;      // kg
  height: number;      // cm
  headCircumference?: number; // cm
  bmi: number;
  zScores: {
    wfa: number; // weight-for-age
    hfa: number; // height-for-age
    bfa: number; // bmi-for-age
  };
  percentiles: {
    wfa: number;
    hfa: number;
    bfa: number;
  };
  classifications: {
    wfa: { label: string; severity: string };
    hfa: { label: string; severity: string };
    bfa: { label: string; severity: string };
  };
}

// Calculates WHO Z-scores, percentiles, and classifications
export const calculateGrowthMetrics = async (
  sex: "male" | "female",
  dateOfBirth: Date,
  dateOfMeasurement: Date,
  weight: number,
  height: number,
  headCircumference?: number
) => {
  const result = await calculateAll({
    sex,
    dateOfBirth,
    dateOfMeasurement,
    weight,
    lengthHeight: height,
    headCircumference,
  });

  const wfaResult = result.results.find((r) => r.indicator === "weight-for-age");
  const hfaResult = result.results.find((r) => r.indicator === "length-height-for-age");
  const bfaResult = result.results.find((r) => r.indicator === "bmi-for-age");

  const wfaClass = result.classifications.find((c) => c.indicator === "weight-for-age");
  const hfaClass = result.classifications.find((c) => c.indicator === "length-height-for-age");
  const bfaClass = result.classifications.find((c) => c.indicator === "bmi-for-age");

  // Calculate age in months
  const diffYears = dateOfMeasurement.getFullYear() - dateOfBirth.getFullYear();
  const diffMonths = dateOfMeasurement.getMonth() - dateOfBirth.getMonth();
  const rawMonths = diffYears * 12 + diffMonths;
  const ageInMonths = rawMonths >= 0 ? rawMonths : 0;

  return {
    ageInDays: result.age.chronologicalDays,
    ageInMonths,
    formattedAge: result.age.formatted,
    wfa: {
      zScore: wfaResult?.zScore ?? 0,
      percentile: wfaResult?.percentile ?? 50,
      label: wfaClass?.label ?? "Normal",
      severity: wfaClass?.severity ?? "adequate",
    },
    hfa: {
      zScore: hfaResult?.zScore ?? 0,
      percentile: hfaResult?.percentile ?? 50,
      label: hfaClass?.label ?? "Normal",
      severity: hfaClass?.severity ?? "adequate",
    },
    bfa: {
      zScore: bfaResult?.zScore ?? 0,
      percentile: bfaResult?.percentile ?? 50,
      label: bfaClass?.label ?? "Normal",
      severity: bfaClass?.severity ?? "adequate",
    },
    bmi: weight / Math.pow(height / 100, 2),
  };
};

// Firestore CRUD operations for Growth Records
export const saveGrowthRecord = async (userId: string, record: Omit<GrowthRecord, "id">) => {
  if (!db) throw new Error("Database not initialized");
  const colRef = collection(db, "users", userId, "growth_records");
  const docRef = await addDoc(colRef, record);
  return docRef.id;
};

export const fetchGrowthRecords = async (userId: string): Promise<GrowthRecord[]> => {
  if (!db) throw new Error("Database not initialized");
  const colRef = collection(db, "users", userId, "growth_records");
  const q = query(colRef, orderBy("dateOfMeasurement", "asc"));
  const querySnapshot = await getDocs(q);
  
  const records: GrowthRecord[] = [];
  querySnapshot.forEach((doc) => {
    records.push({
      id: doc.id,
      ...doc.data()
    } as GrowthRecord);
  });
  
  return records;
};

export const deleteGrowthRecord = async (userId: string, recordId: string) => {
  if (!db) throw new Error("Database not initialized");
  const docRef = doc(db, "users", userId, "growth_records", recordId);
  await deleteDoc(docRef);
};
