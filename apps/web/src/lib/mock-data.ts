import type {
  Patient,
  PatientDetail,
  VitalPoint,
  TrajectoryPoint,
  EVSIRecommendation,
  ShiftAlert,
  RootCause,
  FairnessMetric,
  GovernanceData,
  EmbeddingPoint,
  SlcdPatientPoint,
  CausalDebuggerData,
  FHIREvent,
  ServiceHealth,
  FeatureStoreMetrics,
  InfrastructureData,
} from "./types";

// ─── Helpers ────────────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ─── Patient Generator ─────────────────────────────────────────────
const firstNames = [
  "Sarah", "James", "Maria", "David", "Aisha", "Chen", "Robert", "Priya",
  "Thomas", "Fatima", "Michael", "Yuki", "Daniel", "Luz", "William",
  "Amara", "Joseph", "Min", "Richard", "Elena", "Ahmed", "Sofia",
  "John", "Mei", "Carlos", "Naomi", "Andre", "Hana", "Omar", "Ling",
  "Alex", "Nia", "Hassan", "Isla", "Leo", "Zara", "Raj", "Eva",
  "Felix", "Rosa", "Marcus", "Jade", "Kenji", "Vera", "Ivan", "Nala",
  "Hugo", "Aria", "Sven", "Luna",
];

const lastNames = [
  "Johnson", "Chen", "Williams", "Patel", "Brown", "Kim", "Garcia",
  "Okafor", "Martinez", "Tanaka", "Anderson", "Singh", "Taylor",
  "Nguyen", "Thomas", "Ali", "Jackson", "Lee", "White", "Hernandez",
  "Lopez", "Robinson", "Clark", "Lewis", "Walker", "Hall", "Young",
  "King", "Wright", "Scott", "Adams", "Baker", "Nelson", "Hill",
  "Ramirez", "Campbell", "Mitchell", "Roberts", "Carter", "Phillips",
  "Evans", "Turner", "Torres", "Parker", "Collins", "Edwards",
  "Stewart", "Flores", "Morris", "Murphy",
];

const ethnicities = [
  "White", "Black", "Hispanic", "Asian", "South Asian",
  "Middle Eastern", "Pacific Islander", "Indigenous",
];

const units = ["MICU", "SICU", "CCU", "Neuro ICU", "Burn ICU"];

const actionSets: string[][] = [
  ["monitor"],
  ["monitor", "wait"],
  ["monitor", "treat"],
  ["monitor", "wait", "escalate"],
  ["treat", "escalate"],
  ["monitor", "wait", "treat", "escalate"],
];

export function generatePatients(count: number = 50): Patient[] {
  return Array.from({ length: count }, (_, i) => {
    const riskScore = clamp(Math.round(rand() * 100), 5, 98);
    const status: Patient["status"] =
      riskScore > 75 ? "critical" : riskScore > 45 ? "deteriorating" : "stable";

    return {
      id: `P-${String(i + 1).padStart(4, "0")}`,
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      age: Math.round(25 + rand() * 60),
      sex: rand() > 0.5 ? "M" : "F",
      ethnicity: pick(ethnicities),
      admissionDate: new Date(
        Date.now() - Math.round(rand() * 14 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      unit: pick(units),
      riskScore,
      conformalSet: pick(actionSets),
      irlAlignment: clamp(Math.round(55 + rand() * 45), 50, 99),
      status,
    };
  });
}

export function generatePatientDetail(patient: Patient): PatientDetail {
  const vitals: VitalPoint[] = Array.from({ length: 48 }, (_, i) => ({
    timestamp: new Date(Date.now() - (48 - i) * 3600000).toISOString(),
    hr: clamp(Math.round(70 + rand() * 40 + (patient.riskScore > 60 ? 15 : 0)), 50, 160),
    map: clamp(Math.round(70 + rand() * 30 - (patient.riskScore > 70 ? 10 : 0)), 45, 120),
    spo2: clamp(Math.round(97 - rand() * 6 - (patient.riskScore > 70 ? 3 : 0)), 82, 100),
    temp: clamp(Number((36.5 + rand() * 2.5 + (patient.riskScore > 60 ? 0.8 : 0)).toFixed(1)), 35.5, 41),
  }));

  const trajectory: TrajectoryPoint[] = Array.from({ length: 24 }, (_, i) => {
    const base = patient.riskScore * 0.3 + (i / 24) * patient.riskScore * 0.7;
    const spread = Math.max(5, 35 - i * 1.2);
    return {
      hour: i,
      riskMean: clamp(Math.round(base + rand() * 8 - 4), 0, 100),
      riskLower: clamp(Math.round(base - spread + rand() * 3), 0, 100),
      riskUpper: clamp(Math.round(base + spread + rand() * 3), 0, 100),
    };
  });

  const evsiRecommendations: EVSIRecommendation[] = [
    {
      testName: "Serum Lactate",
      evsi: 0.87,
      resolutionProbability: 0.92,
      currentSetSize: patient.conformalSet.length,
      projectedSetSize: 1,
    },
    {
      testName: "Procalcitonin",
      evsi: 0.64,
      resolutionProbability: 0.71,
      currentSetSize: patient.conformalSet.length,
      projectedSetSize: 2,
    },
    {
      testName: "Blood Culture",
      evsi: 0.52,
      resolutionProbability: 0.58,
      currentSetSize: patient.conformalSet.length,
      projectedSetSize: 2,
    },
    {
      testName: "CT Angiography",
      evsi: 0.41,
      resolutionProbability: 0.45,
      currentSetSize: patient.conformalSet.length,
      projectedSetSize: 3,
    },
  ];

  const actionHistory = [
    { time: "-6h", action: "IV Fluids Bolus 500mL", source: "Dr. Chen" },
    { time: "-4h", action: "CBC + BMP Ordered", source: "Dr. Chen" },
    { time: "-2h", action: "Vasopressor Started", source: "Dr. Patel" },
    { time: "-1h", action: "Lactate Ordered", source: "TrueState AIA" },
    { time: "Now", action: "Awaiting Results", source: "System" },
  ];

  return { ...patient, vitals, trajectory, evsiRecommendations, actionHistory };
}

// ─── Governance Data ────────────────────────────────────────────────
export function generateGovernanceData(): GovernanceData {
  const shiftAlerts: ShiftAlert[] = Array.from({ length: 30 }, (_, i) => {
    const day = new Date(Date.now() - (30 - i) * 86400000)
      .toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const klBase = 0.02 + rand() * 0.06;
    const spike = i === 22 || i === 27 ? 0.15 + rand() * 0.1 : 0;
    return {
      day,
      klDivergence: Number((klBase + spike).toFixed(4)),
      threshold: 0.15,
      opilDrift: Number((klBase * 0.6 + spike * 0.7).toFixed(4)),
      slcdDrift: Number((klBase * 0.4 + spike * 0.3).toFixed(4)),
    };
  });

  const rootCauses: RootCause[] = [
    {
      label: "OPIL Shift",
      type: "opil",
      percentage: 42,
      description: "Nursing shift pattern change detected in MICU (night shift understaffed since Jul 28)",
    },
    {
      label: "SLCD Shift",
      type: "slcd",
      percentage: 35,
      description: "Testing rate drop for Hispanic patients in ER (Lactate ordering ↓ 28%)",
    },
    {
      label: "Irreducible",
      type: "stochastic",
      percentage: 23,
      description: "Seasonal respiratory illness surge — base-rate change in population acuity",
    },
  ];

  const fairnessMetrics: FairnessMetric[] = [
    { group: "White", tprBefore: 0.89, tprAfter: 0.91, fpr: 0.08, coverage: 0.94 },
    { group: "Black", tprBefore: 0.61, tprAfter: 0.88, fpr: 0.09, coverage: 0.93 },
    { group: "Hispanic", tprBefore: 0.58, tprAfter: 0.86, fpr: 0.10, coverage: 0.92 },
    { group: "Asian", tprBefore: 0.72, tprAfter: 0.89, fpr: 0.07, coverage: 0.95 },
    { group: "South Asian", tprBefore: 0.65, tprAfter: 0.87, fpr: 0.08, coverage: 0.93 },
    { group: "Indigenous", tprBefore: 0.52, tprAfter: 0.84, fpr: 0.11, coverage: 0.91 },
  ];

  const maxKl = Math.max(...shiftAlerts.map((s) => s.klDivergence));
  const overallHealth: GovernanceData["overallHealth"] =
    maxKl > 0.2 ? "critical" : maxKl > 0.12 ? "warning" : "healthy";

  return { shiftAlerts, rootCauses, fairnessMetrics, overallHealth };
}

// ─── Causal Debugger Data ───────────────────────────────────────────
export function generateCausalDebuggerData(): CausalDebuggerData {
  const hospitals = ["Beth Israel", "MGH", "UCSF", "Mayo Clinic"];
  const shifts = ["Day Shift", "Night Shift", "Weekend"];

  const embeddings: EmbeddingPoint[] = Array.from({ length: 200 }, (_, i) => {
    const hospital = pick(hospitals);
    const shiftGroup = pick(shifts);
    const hospitalOffset =
      hospital === "Beth Israel" ? 0 : hospital === "MGH" ? 2 : hospital === "UCSF" ? -1.5 : 1;
    const shiftOffset =
      shiftGroup === "Night Shift" ? 1.5 : shiftGroup === "Weekend" ? -1 : 0;

    return {
      id: i,
      biasedX: Number((rand() * 8 - 4 + hospitalOffset + shiftOffset).toFixed(2)),
      biasedY: Number((rand() * 8 - 4 + hospitalOffset * 0.5).toFixed(2)),
      x: Number((rand() * 6 - 3).toFixed(2)),
      y: Number((rand() * 6 - 3).toFixed(2)),
      shiftGroup,
      hospital,
    };
  });

  const slcdPatients: SlcdPatientPoint[] = Array.from({ length: 150 }, (_, i) => {
    const tested = i < 80;
    const ethnicity = pick(ethnicities);
    const highRisk = rand() > (tested ? 0.5 : 0.35);
    return {
      id: i,
      x: Number((rand() * 100).toFixed(1)),
      y: Number((rand() * 100).toFixed(1)),
      tested,
      highRisk,
      ethnicity,
      truePositive: highRisk && rand() > 0.2,
    };
  });

  return {
    embeddings,
    slcdPatients,
    miEstimate: 0.12,
    recoveryRate: 0.34,
  };
}

// ─── Infrastructure Data ────────────────────────────────────────────
export function generateInfrastructureData(): InfrastructureData {
  const resourceTypes = [
    "Patient", "Observation", "MedicationRequest", "Encounter",
    "DiagnosticReport", "Condition", "Procedure",
  ];

  const fhirEvents: FHIREvent[] = Array.from({ length: 30 }, (_, i) => ({
    id: `evt-${String(i + 1).padStart(4, "0")}`,
    timestamp: new Date(Date.now() - i * 4000).toISOString(),
    source: rand() > 0.4 ? "Epic" : "Oracle",
    resourceType: pick(resourceTypes),
    status: rand() > 0.08 ? "success" : rand() > 0.5 ? "warning" : "error",
    latencyMs: Math.round(15 + rand() * 85),
  }));

  const services: ServiceHealth[] = [
    {
      name: "ML Inference (FastAPI)",
      status: "healthy",
      uptime: 99.97,
      latencyMs: 42,
      lastCheck: new Date().toISOString(),
    },
    {
      name: "PostgreSQL",
      status: "healthy",
      uptime: 99.99,
      latencyMs: 3,
      lastCheck: new Date().toISOString(),
    },
    {
      name: "Redis Cache",
      status: "healthy",
      uptime: 99.98,
      latencyMs: 1,
      lastCheck: new Date().toISOString(),
    },
    {
      name: "FHIR Gateway",
      status: rand() > 0.8 ? "degraded" : "healthy",
      uptime: 99.82,
      latencyMs: 28,
      lastCheck: new Date().toISOString(),
    },
    {
      name: "Ray Cluster (IRL)",
      status: "healthy",
      uptime: 99.91,
      latencyMs: 156,
      lastCheck: new Date().toISOString(),
    },
    {
      name: "Feast Feature Store",
      status: "healthy",
      uptime: 99.95,
      latencyMs: 8,
      lastCheck: new Date().toISOString(),
    },
  ];

  const featureStore: FeatureStoreMetrics = {
    cacheHitRate: 0.946,
    avgLatencyMs: 8.2,
    latencyHistogram: [
      { bucket: "0-5ms", count: 3420 },
      { bucket: "5-10ms", count: 5180 },
      { bucket: "10-20ms", count: 1240 },
      { bucket: "20-50ms", count: 380 },
      { bucket: "50ms+", count: 80 },
    ],
    activeFeatures: 847,
  };

  const throughput = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    eventsPerSec: Math.round(120 + rand() * 80 + (i > 7 && i < 19 ? 60 : 0)),
  }));

  return { fhirEvents, services, featureStore, throughput };
}

// ─── Pre-generated singletons ───────────────────────────────────────
export const PATIENTS = generatePatients(50);
export const GOVERNANCE = generateGovernanceData();
export const CAUSAL_DEBUGGER = generateCausalDebuggerData();
export const INFRASTRUCTURE = generateInfrastructureData();
