import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DroneManager = () => {
  const [drones, setDrones] = useState([]);
  const [newDrone, setNewDrone] = useState({
    name: '',
    maxWeight: '',
    maxDistance: '',
    batteryCapacity: '100'
  });

  useEffect(() => {
    fetchDrones();
  }, []);

  const fetchDrones = async () => {
    try {
      const response = await api.get('/drones');
      setDrones(response.data);
    } catch (error) {
      console.error('Erro ao buscar drones:', error);
    }
  };

  const handleCreateDrone = async (e) => {
    e.preventDefault();
    try {
      await api.post('/drones', {
        name: newDrone.name,
        maxWeight: parseFloat(newDrone.maxWeight),
        maxDistance: parseFloat(newDrone.maxDistance),
        batteryCapacity: parseInt(newDrone.batteryCapacity)
      });
      setNewDrone({ name: '', maxWeight: '', maxDistance: '', batteryCapacity: '100' });
      fetchDrones();
      alert('🚁 Drone criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar drone: ' + error.message);
    }
  };

  return (
    <div>
      <div className="card">
        <h3>➕ Adicionar Novo Drone</h3>
        <form onSubmit={handleCreateDrone} className="drone-form">
          <div className="form-group">
            <label>Nome do Drone:</label>
            <input
              type="text"
              value={newDrone.name}
              onChange={(e) => setNewDrone({...newDrone, name: e.target.value})}
              placeholder="Drone Alpha"
              required
            />
          </div>

          <div className="form-group">
            <label>Capacidade Máxima (kg):</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="20"
              value={newDrone.maxWeight}
              onChange={(e) => setNewDrone({...newDrone, maxWeight: e.target.value})}
              placeholder="5.0"
              required
            />
          </div>

          <div className="form-group">
            <label>Alcance Máximo (km):</label>
            <input
              type="number"
              step="1"
              min="1"
              max="50"
              value={newDrone.maxDistance}
              onChange={(e) => setNewDrone({...newDrone, maxDistance: e.target.value})}
              placeholder="10"
              required
            />
          </div>

          <div className="form-group">
            <label>Capacidade da Bateria (%):</label>
            <input
              type="number"
              min="1"
              max="100"
              value={newDrone.batteryCapacity}
              onChange={(e) => setNewDrone({...newDrone, batteryCapacity: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            🚁 Adicionar Drone
          </button>
        </form>
      </div>

      <div className="card">
        <h3>📋 Frota de Drones ({drones.length})</h3>
        <div className="drones-grid">
          {drones.map(drone => (
            <div key={drone.id} className="drone-card">
              <h4>{drone.name}</h4>
              <div className="drone-specs">
                <p>🔄 Status: <strong>{drone.status}</strong></p>
                <p>🔋 Bateria: <strong>{drone.currentBattery}%</strong></p>
                <p>📦 Capacidade: <strong>{drone.maxWeight}kg</strong></p>
                <p>🎯 Alcance: <strong>{drone.maxDistance}km</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .drone-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .drone-form .form-group:last-child {
          grid-column: 1 / -1;
        }

        .drones-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .drone-card {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .drone-card h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
        }

        .drone-specs p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .drone-form {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DroneManager;