import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db';

export const legalRecordsRouter = Router();

// In-memory fallback mock records for offline/demo resilience
// In-memory fallback mock records for offline/demo resilience
let fallbackLegalRecords = [
  {
    id: "legal_1",
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
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    patient: { id: "patient_a", name: "Patient A: Highly Monitored (Privileged)" },
  },
  {
    id: "legal_2",
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
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    patient: { id: "patient_b", name: "Patient B: Marginalized/Untested" },
  },
  {
    id: "legal_3",
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
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    patient: { id: "patient_c", name: "Patient C: Invisible High Risk" },
  },
  {
    id: "legal_4",
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
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    patient: { id: "patient_d", name: "Patient D: Standard Tested Profile" },
  },
  {
    id: "legal_5",
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
    detectedIssues: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    patient: { id: "patient_a", name: "Patient A: Highly Monitored (Privileged)" },
  },
];

// Zod schema for update validation
const updateLegalRecordSchema = z.object({
  status: z.enum(['DRAFT', 'NEEDS_REVIEW', 'VERIFIED', 'REJECTED']).optional(),
  reviewerNotes: z.string().nullable().optional(),
});

// GET /api/v1/legal-records
legalRecordsRouter.get('/', async (req, res, next) => {
  try {
    const { q, documentType, jurisdiction, status, riskLevel } = req.query;

    const whereClause: any = { deletedAt: null };

    if (status && typeof status === 'string') {
      whereClause.status = status;
    }
    if (riskLevel && typeof riskLevel === 'string') {
      whereClause.riskLevel = riskLevel;
    }
    if (documentType && typeof documentType === 'string') {
      whereClause.documentType = documentType;
    }
    if (jurisdiction && typeof jurisdiction === 'string') {
      whereClause.jurisdiction = jurisdiction;
    }
    if (q && typeof q === 'string') {
      const search = q.toLowerCase();
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { reviewerNotes: { contains: search, mode: 'insensitive' } },
        { patient: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const records = await prisma.legalRecord.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: records,
      error: null,
      meta: { total: records.length, page: 1 },
    });
  } catch (err: any) {
    req.log?.warn(`Database error (${err.message}). Serving fallback legal records.`);
    
    // Apply filters to fallback memory cache
    const { q, documentType, jurisdiction, status, riskLevel } = req.query;
    let filtered = [...fallbackLegalRecords];

    if (status && typeof status === 'string') {
      filtered = filtered.filter(r => r.status === status);
    }
    if (riskLevel && typeof riskLevel === 'string') {
      filtered = filtered.filter(r => r.riskLevel === riskLevel);
    }
    if (documentType && typeof documentType === 'string') {
      filtered = filtered.filter(r => r.documentType === documentType);
    }
    if (jurisdiction && typeof jurisdiction === 'string') {
      filtered = filtered.filter(r => r.jurisdiction === jurisdiction);
    }
    if (q && typeof q === 'string') {
      const queryStr = q.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(queryStr) ||
        (r.description && r.description.toLowerCase().includes(queryStr)) ||
        (r.reviewerNotes && r.reviewerNotes.toLowerCase().includes(queryStr)) ||
        (r.patient && r.patient.name.toLowerCase().includes(queryStr))
      );
    }

    res.json({
      success: true,
      data: filtered,
      error: null,
      meta: { total: filtered.length, page: 1, fallback: true },
    });
  }
});

// PATCH /api/v1/legal-records/:id
legalRecordsRouter.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateLegalRecordSchema.parse(req.body);

    try {
      const existing = await prisma.legalRecord.findUnique({
        where: { id },
      });

      if (!existing || existing.deletedAt) {
        // Check in fallback if not in DB
        const fallbackIdx = fallbackLegalRecords.findIndex((r) => r.id === id);
        if (fallbackIdx === -1) {
          res.status(404).json({
            success: false,
            data: null,
            error: { message: 'Legal record not found', details: null },
            meta: null,
          });
          return;
        }

        if (validatedData.status) fallbackLegalRecords[fallbackIdx].status = validatedData.status;
        if (validatedData.reviewerNotes !== undefined) {
          fallbackLegalRecords[fallbackIdx].reviewerNotes = validatedData.reviewerNotes;
        }
        fallbackLegalRecords[fallbackIdx].updatedAt = new Date().toISOString();

        res.json({
          success: true,
          data: fallbackLegalRecords[fallbackIdx],
          error: null,
          meta: { fallback: true },
        });
        return;
      }

      const updated = await prisma.legalRecord.update({
        where: { id },
        data: {
          ...(validatedData.status && { status: validatedData.status as any }),
          ...(validatedData.reviewerNotes !== undefined && { reviewerNotes: validatedData.reviewerNotes }),
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: updated,
        error: null,
        meta: null,
      });
    } catch (dbErr: any) {
      req.log?.warn(`Database error on update (${dbErr.message}). Updating fallback cache.`);
      const fallbackIdx = fallbackLegalRecords.findIndex((r) => r.id === id);
      if (fallbackIdx === -1) {
        res.status(404).json({
          success: false,
          data: null,
          error: { message: 'Legal record not found', details: null },
          meta: null,
        });
        return;
      }

      if (validatedData.status) fallbackLegalRecords[fallbackIdx].status = validatedData.status;
      if (validatedData.reviewerNotes !== undefined) {
        fallbackLegalRecords[fallbackIdx].reviewerNotes = validatedData.reviewerNotes;
      }
      fallbackLegalRecords[fallbackIdx].updatedAt = new Date().toISOString();

      res.json({
        success: true,
        data: fallbackLegalRecords[fallbackIdx],
        error: null,
        meta: { fallback: true },
      });
    }
  } catch (err) {
    next(err);
  }
});

