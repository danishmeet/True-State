import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing old data...');
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
