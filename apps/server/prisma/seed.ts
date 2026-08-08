import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing old data...');
  await prisma.legalRecord.deleteMany();
  await prisma.modelPrediction.deleteMany();
  await prisma.clinicalEvent.deleteMany();
  await prisma.patient.deleteMany();

  console.log('Seeding synthetic patients (Observation Policy Bias - IV-OPIL)...');
  
  // Patient A: High Risk, High Observation (e.g. q1h - ICU)
  const patientA = await prisma.patient.create({
    data: {
      id: "patient_a",
      name: "Patient A: Highly Monitored (Privileged)",
      age: 65,
      gender: 'M',
      ethnicity: 'Caucasian',
      ses: 1,
      obsFreq: 12,
      ivWeekend: false,
      events: {
        create: Array.from({ length: 24 }).map((_, i) => ({
          eventType: 'vital_sign',
          value: 120 + Math.random() * 20, // High heart rate
          timestamp: new Date(new Date().getTime() - i * 60 * 60 * 1000) // Every hour
        }))
      },
      modelPredictions: {
        create: [
          { modelType: 'standard_ai', riskScore: 0.85, details: { description: 'Standard AI overestimates due to high freq' } },
          { modelType: 'iv_opil', riskScore: 0.65, details: { description: 'IV-OPIL debiased score' } }
        ]
      }
    }
  });

  // Patient B: High Risk, Low Observation (e.g. q4h - General Ward)
  const patientB = await prisma.patient.create({
    data: {
      id: "patient_b",
      name: "Patient B: Marginalized/Untested",
      age: 62,
      gender: 'M',
      ethnicity: 'Caucasian',
      ses: 0,
      obsFreq: 1,
      ivWeekend: true,
      events: {
        create: Array.from({ length: 6 }).map((_, i) => ({
          eventType: 'vital_sign',
          value: 120 + Math.random() * 20,
          timestamp: new Date(new Date().getTime() - i * 4 * 60 * 60 * 1000) // Every 4 hours
        }))
      },
      modelPredictions: {
        create: [
          { modelType: 'standard_ai', riskScore: 0.45, details: { description: 'Standard AI underestimates due to low freq' } },
          { modelType: 'iv_opil', riskScore: 0.65, details: { description: 'IV-OPIL debiased score' } }
        ]
      }
    }
  });

  console.log('Seeding synthetic patients (Selective Label Bias - Proxy-SLCD)...');
  
  // Patient C: Marginalized, High Risk, Untested
  const patientC = await prisma.patient.create({
    data: {
      id: "patient_c",
      name: "Patient C: Invisible High Risk",
      age: 45,
      gender: 'F',
      ethnicity: 'Minority',
      ses: 0,
      obsFreq: 2,
      ivWeekend: false,
      events: {
        create: [
          // Minimal baseline events, NO specific diagnostic test
          { eventType: 'vital_sign', value: 98.6, timestamp: new Date() }
        ]
      },
      modelPredictions: {
        create: [
          { modelType: 'standard_ai', riskScore: 0.20, details: { tested: false } },
          { modelType: 'proxy_slcd', riskScore: 0.75, details: { tested: false, proxy_adjusted: true } }
        ]
      }
    }
  });

  // Patient D: Majority, Tested
  const patientD = await prisma.patient.create({
    data: {
      id: "patient_d",
      name: "Patient D: Standard Tested Profile",
      age: 48,
      gender: 'M',
      ethnicity: 'Caucasian',
      ses: 1,
      obsFreq: 5,
      ivWeekend: false,
      events: {
        create: [
          { eventType: 'diagnostic_test', value: 1.0, timestamp: new Date() } // 1.0 = Tested positive/done
        ]
      },
      modelPredictions: {
        create: [
          { modelType: 'standard_ai', riskScore: 0.80, details: { tested: true } },
          { modelType: 'proxy_slcd', riskScore: 0.80, details: { tested: true, proxy_adjusted: false } }
        ]
      }
    }
  });

  console.log('Seeding legal records...');
  await prisma.legalRecord.createMany({
    data: [
      {
        title: "Consent & HIPAA Compliance Audit - Patient A",
        description: "Audit record for observation frequency consent and data privacy.",
        documentType: "HIPAA Consent",
        jurisdiction: "US Federal",
        riskLevel: "LOW",
        patientId: "patient_a",
        status: "VERIFIED",
        reviewerNotes: "All consent forms verified and compliant with EU AI Act & HIPAA standards.",
        clauses: [
          { section: "Sec. 4.1", title: "Patient Observation Rights", status: "COMPLIANT", snippet: "Patient reserves the right to unmonitored baseline evaluation cycles." },
          { section: "Sec. 9.3", title: "EHR Temporal Logging", status: "COMPLIANT", snippet: "Observation timestamps must align with physical nurse checks." }
        ],
        detectedIssues: [
          { id: "iss_101", issue: "Minor sampling variance", severity: "LOW", recommendation: "Re-verify shift handoff timestamp logs." }
        ]
      },
      {
        title: "Causal Debiasing Review - Patient B",
        description: "Review of IV-OPIL score disentanglement and patient safety clearance.",
        documentType: "Causal Debiasing",
        jurisdiction: "EU AI Act",
        riskLevel: "HIGH",
        patientId: "patient_b",
        status: "NEEDS_REVIEW",
        reviewerNotes: "Requires secondary clinical review due to low observation frequency.",
        clauses: [
          { section: "Sec. 2.4", title: "Instrumental Variable Validity", status: "REVIEW_REQUIRED", snippet: "Hospital shift change must serve as continuous exogenous instrument." },
          { section: "Sec. 7.1", title: "Disentanglement Bound", status: "COMPLIANT", snippet: "Mutual information between latent state and sampling policy bounded below 0.05." }
        ],
        detectedIssues: [
          { id: "iss_201", issue: "Observation Policy Bias Detected", severity: "HIGH", recommendation: "Enable IV-OPIL causal encoder to correct standard AI risk score mismatch." }
        ]
      },
      {
        title: "Selective Label Proxy Assessment - Patient C",
        description: "Evaluation of proxy-anchored risk model for untested minority patient.",
        documentType: "AI Policy Audit",
        jurisdiction: "FDA PCCP",
        riskLevel: "CRITICAL",
        patientId: "patient_c",
        status: "DRAFT",
        reviewerNotes: "Initial draft. Pending lab confirmation.",
        clauses: [
          { section: "Sec. 5.2", title: "Negative Control Proxy Selection", status: "NON_COMPLIANT", snippet: "Proxy lab data must be unconfounded by physician ordering propensity." },
          { section: "Sec. 8.0", title: "Demographic Fair Testing", status: "REVIEW_REQUIRED", snippet: "Testing rates must be audited across socio-economic strata." }
        ],
        detectedIssues: [
          { id: "iss_301", issue: "Selective Label Bias (Invisible High Risk)", severity: "CRITICAL", recommendation: "Apply Proxy-SLCD causal debiasing to populate un-tested high-risk quadrant." }
        ]
      },
      {
        title: "Standard Risk Model Compliance Certificate",
        description: "Annual algorithmic accountability and bias disclosure certificate.",
        documentType: "Model Certificate",
        jurisdiction: "State Medical Board",
        riskLevel: "HIGH",
        patientId: "patient_d",
        status: "REJECTED",
        reviewerNotes: "Rejected due to unmitigated selective label bias in underlying dataset.",
        clauses: [
          { section: "Sec. 1.1", title: "Unadjusted Standard AI Baseline", status: "NON_COMPLIANT", snippet: "Standard logistic regression model ignores observation frequency bias." }
        ],
        detectedIssues: [
          { id: "iss_401", issue: "Unmitigated Observation Frequency Bias", severity: "HIGH", recommendation: "Reject standard prediction model and enforce TrueState IV-OPIL middleware." }
        ]
      },
      {
        title: "EHR Streaming Data Protection & Encryption Protocol",
        description: "FHIR R4 pipeline data governance & transport security certificate.",
        documentType: "Data Governance",
        jurisdiction: "US Federal",
        riskLevel: "MEDIUM",
        patientId: "patient_a",
        status: "VERIFIED",
        reviewerNotes: "End-to-end TLS 1.3 and column-level encryption validated.",
        clauses: [
          { section: "Sec. 3.0", title: "Transport Layer Encryption", status: "COMPLIANT", snippet: "TLS 1.3 enforced across all Express-to-FastAPI streaming routes." }
        ],
        detectedIssues: []
      }
    ]
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
