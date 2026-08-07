"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientsRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
exports.patientsRouter = (0, express_1.Router)();
// In a real app, this would be protected. For hackathon, we might leave it open or protected depending on flow.
// Adding requireAuth to demonstrate architectural compliance.
exports.patientsRouter.use(authMiddleware_1.requireAuth);
exports.patientsRouter.get('/', async (req, res, next) => {
    try {
        // Controller logic mocked here for speed. In full 3-tier, call PatientController -> PatientService
        res.json({
            success: true,
            data: [
                { id: '1', name: 'Patient A', risk: 'High' }
            ],
            error: null,
            meta: { total: 1, page: 1 }
        });
    }
    catch (err) {
        next(err);
    }
});
