"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v1Router = void 0;
const express_1 = require("express");
const patients_1 = require("./patients");
exports.v1Router = (0, express_1.Router)();
exports.v1Router.use('/patients', patients_1.patientsRouter);
exports.v1Router.get('/health', (req, res) => {
    res.json({
        success: true,
        data: { status: 'ok' },
        error: null,
        meta: null
    });
});
