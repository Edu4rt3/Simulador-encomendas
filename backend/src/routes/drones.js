import express from 'express';
import { SimulationService } from '../services/SimulationService.js';

const router = express.Router();
const simulationService = new SimulationService();

// Criar alguns drones iniciais
simulationService.addDrone('Drone Alpha', 5, 10, 100);
simulationService.addDrone('Drone Beta', 3, 8, 100);
simulationService.addDrone('Drone Gamma', 7, 12, 100);

// Listar todos os drones
router.get('/', (req, res) => {
    const drones = Array.from(simulationService.drones.values());
    res.json(drones);
});

// Criar novo drone
router.post('/', (req, res) => {
    try {
        const { name, maxWeight, maxDistance, batteryCapacity } = req.body;
        const drone = simulationService.addDrone(name, maxWeight, maxDistance, batteryCapacity);
        res.json(drone);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Atualizar status do drone
router.put('/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const drone = simulationService.drones.get(req.params.id);
        if (drone) {
            drone.status = status;
            res.json(drone);
        } else {
            res.status(404).json({ error: 'Drone não encontrado' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;