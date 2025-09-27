import express from 'express';
import { SimulationService } from '../services/SimulationService.js';

const router = express.Router();
const simulationService = new SimulationService();

// Criar nova entrega
router.post('/', (req, res) => {
    try {
        const { customerLocation, weight, priority, customerName } = req.body;
        
        // Validações básicas
        if (!customerLocation || !weight || !priority) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }
        
        if (weight <= 0) {
            return res.status(400).json({ error: 'Peso deve ser maior que zero' });
        }

        const delivery = simulationService.createDelivery(
            customerLocation, 
            weight, 
            priority, 
            customerName
        );
        
        // Tentar alocação automática
        simulationService.autoAssignDeliveries();
        
        res.json(delivery);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar todas as entregas
router.get('/', (req, res) => {
    const deliveries = Array.from(simulationService.deliveries.values());
    res.json(deliveries);
});

// Atribuir entrega a drone
router.post('/:id/assign', (req, res) => {
    try {
        const { droneId } = req.body;
        simulationService.assignDeliveryToDrone(req.params.id, droneId);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Simular entrega
router.post('/:id/simulate', async (req, res) => {
    try {
        await simulationService.simulateDelivery(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;