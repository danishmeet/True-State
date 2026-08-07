import { Router } from 'express';
// import { requireAuth } from '../../middlewares/authMiddleware';
import { prisma } from '../../db';

export const patientsRouter = Router();

// Temporarily disabling auth for Hackathon MVP offline access
// patientsRouter.use(requireAuth);

patientsRouter.get('/', async (req, res, next) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { name: 'asc' },
    });
    
    // Map to frontend expected profile structure
    const mappedPatients = patients.map(p => ({
      id: p.id,
      label: p.name,
      age: p.age,
      ses: p.ses,
      obs_freq: p.obsFreq,
      iv_weekend: p.ivWeekend,
    }));

    res.json({
      success: true,
      data: mappedPatients,
      error: null,
      meta: { total: mappedPatients.length, page: 1 }
    });
  } catch (err) {
    next(err);
  }
});
