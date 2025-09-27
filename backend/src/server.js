import express from 'express';
import cors from 'cors';
import droneRoutes from './routes/drones.js';
import deliveryRoutes from './routes/deliveries.js';
import simulationRoutes from './routes/simulation.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/drones', droneRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/simulation', simulationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Drone Delivery API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});