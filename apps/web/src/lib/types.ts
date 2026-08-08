// ─── API Response Wrapper ───────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
  meta?: { page?: number; pageSize?: number; total?: number };
}

// ─── Patient Types ──────────────────────────────────────────────────
export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F";
  ethnicity: string;
  admissionDate: string;
  unit: string;
  riskScore: number;
  conformalSet: string[];
  irlAlignment: number;
  status: "stable" | "deteriorating" | "critical";
}

export interface VitalPoint {
  timestamp: string;
  hr: number;
  map: number;
  spo2: number;
  temp: number;
}

export interface TrajectoryPoint {
  hour: number;
  riskMean: number;
  riskLower: number;
  riskUpper: number;
}

export interface EVSIRecommendation {
  testName: string;
  evsi: number;
  resolutionProbability: number;
  currentSetSize: number;
  projectedSetSize: number;
}

export interface PatientDetail extends Patient {
  vitals: VitalPoint[];
  trajectory: TrajectoryPoint[];
  evsiRecommendations: EVSIRecommendation[];
  actionHistory: { time: string; action: string; source: string }[];
}

// ─── Governance Types ───────────────────────────────────────────────
export interface ShiftAlert {
  day: string;
  klDivergence: number;
  threshold: number;
  opilDrift: number;
  slcdDrift: number;
}

export interface RootCause {
  label: string;
  type: "opil" | "slcd" | "stochastic";
  percentage: number;
  description: string;
}

export interface FairnessMetric {
  group: string;
  tprBefore: number;
  tprAfter: number;
  fpr: number;
  coverage: number;
}

export interface GovernanceData {
  shiftAlerts: ShiftAlert[];
  rootCauses: RootCause[];
  fairnessMetrics: FairnessMetric[];
  overallHealth: "healthy" | "warning" | "critical";
}

// ─── Causal Debugger Types ──────────────────────────────────────────
export interface EmbeddingPoint {
  id: number;
  x: number;
  y: number;
  biasedX: number;
  biasedY: number;
  shiftGroup: string;
  hospital: string;
}

export interface SlcdPatientPoint {
  id: number;
  x: number;
  y: number;
  tested: boolean;
  highRisk: boolean;
  ethnicity: string;
  truePositive: boolean;
}

export interface CausalDebuggerData {
  embeddings: EmbeddingPoint[];
  slcdPatients: SlcdPatientPoint[];
  miEstimate: number;
  recoveryRate: number;
}

// ─── Infrastructure Types ───────────────────────────────────────────
export interface FHIREvent {
  id: string;
  timestamp: string;
  source: "Epic" | "Oracle";
  resourceType: string;
  status: "success" | "error" | "warning";
  latencyMs: number;
}

export interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: number;
  latencyMs: number;
  lastCheck: string;
}

export interface FeatureStoreMetrics {
  cacheHitRate: number;
  avgLatencyMs: number;
  latencyHistogram: { bucket: string; count: number }[];
  activeFeatures: number;
}

export interface InfrastructureData {
  fhirEvents: FHIREvent[];
  services: ServiceHealth[];
  featureStore: FeatureStoreMetrics;
  throughput: { time: string; eventsPerSec: number }[];
}
