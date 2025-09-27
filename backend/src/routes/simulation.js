import express from 'express';
import { SimulationService } from '../services/SimulationService.js';

const router = express.Router();
const simulationService = new SimulationService();

// Dashboard data
router.get('/dashboard', (req, res) => {
    const data = simulationService.getDashboardData();
    res.json(data);
});

// Otimizar fila
router.post('/optimize', (req, res) => {
    simulationService.autoAssignDeliveries();
    res.json({ success: true });
});

// Reset simulation
router.post('/reset', (req, res) => {
    simulationService.deliveries.clear();
    res.json({ success: true });
});

export default router;