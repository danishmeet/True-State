import { Router } from 'express';
import { patientsRouter } from './patients';
import { inferenceRouter } from './inference';
import { legalRecordsRouter } from './legalRecords';

export const v1Router = Router();

v1Router.use('/patients', patientsRouter);
v1Router.use('/inference', inferenceRouter);
v1Router.use('/legal-records', legalRecordsRouter);

v1Router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'ok' },
    error: null,
    meta: null
  });
});
