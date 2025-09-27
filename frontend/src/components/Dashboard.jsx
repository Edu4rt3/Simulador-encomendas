import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [deliveries, setDeliveries] = useState([]);
  const [drones, setDrones] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [deliveriesRes, dronesRes, dashboardRes] = await Promise.all([
        api.get('/deliveries'),
        api.get('/drones'),
        api.get('/simulation/dashboard')
      ]);
      setDeliveries(deliveriesRes.data);
      setDrones(dronesRes.data);
      setDashboardData(dashboardRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      idle: '#10b981',
      loading: '#f59e0b',
      flying: '#3b82f6',
      delivering: '#8b5cf6',
      returning: '#f97316',
      pending: '#6b7280',
      assigned: '#f59e0b',
      in_progress: '#3b82f6',
      delivered: '#10b981',
      failed: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getBatteryColor = (battery) => {
    if (battery > 70) return '#10b981';
    if (battery > 30) return '#f59e0b';
    return '#ef4444';
  };

  const calculateRemainingDeliveries = (drone) => {
    // Calcula quantas entregas de 10km o drone ainda pode fazer
    const kmPerDelivery = 10; // Distância média por entrega
    const batteryPerKm = 1; // 1% por km
    const batteryNeededPerDelivery = kmPerDelivery * 2 * batteryPerKm; // Ida e volta
    
    return Math.floor(drone.currentBattery / batteryNeededPerDelivery);
  };

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total de Entregas</h3>
          <p className="stat-number">{dashboardData.totalDeliveries || 0}</p>
        </div>
        
        <div className="stat-card">
          <h3>Entregues</h3>
          <p className="stat-number">{dashboardData.delivered || 0}</p>
        </div>
        
        <div className="stat-card">
          <h3>Tempo Médio (min)</h3>
          <p className="stat-number">{dashboardData.averageTime || 0}</p>
        </div>
        
        <div className="stat-card">
          <h3>Drones Disponíveis</h3>
          <p className="stat-number">{dashboardData.availableDrones || 0}</p>
        </div>
      </div>

      <div className="sections-grid">
        <div className="card">
          <h3>🚁 Frota de Drones ({drones.length})</h3>
          <div className="drones-list">
            {drones.map(drone => (
              <div key={drone.id} className="drone-item" style={{borderLeft: `4px solid ${getStatusColor(drone.status)}`}}>
                <div className="drone-header">
                  <h4>{drone.name}</h4>
                  <span className="status-badge" style={{background: getStatusColor(drone.status)}}>
                    {drone.status}
                  </span>
                </div>
                <div className="drone-info">
                  <div className="battery-section">
                    <span>🔋 Bateria: </span>
                    <strong style={{color: getBatteryColor(drone.currentBattery)}}>
                      {drone.currentBattery}%
                    </strong>
                    <div className="battery-bar">
                      <div 
                        className="battery-level" 
                        style={{
                          width: `${drone.currentBattery}%`,
                          background: getBatteryColor(drone.currentBattery)
                        }}
                      />
                    </div>
                    <small>Consumo: 1% por km</small>
                  </div>
                  
                  <div className="drone-specs">
                    <p>📦 Capacidade: <strong>{drone.maxWeight}kg</strong></p>
                    <p>🎯 Alcance: <strong>{drone.maxDistance}km</strong></p>
                    <p>📊 Entregas: <strong>{drone.deliveriesCompleted || 0}</strong></p>
                    <p>📏 Distância total: <strong>{drone.totalDistanceFlown || 0}km</strong></p>
                    {drone.currentBattery > 0 && (
                      <p>📈 Entregas restantes: <strong>~{calculateRemainingDeliveries(drone)}</strong></p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>📦 Entregas Recentes</h3>
          <div className="deliveries-list">
            {deliveries.slice(-10).map(delivery => (
              <div key={delivery.id} className="delivery-item" style={{borderLeft: `4px solid ${getStatusColor(delivery.status)}`}}>
                <div className="delivery-header">
                  <h4>{delivery.customerName}</h4>
                  <span className="status-badge" style={{background: getStatusColor(delivery.status)}}>
                    {delivery.status}
                  </span>
                </div>
                <div className="delivery-info">
                  <p>⚖️ Peso: {delivery.weight}kg</p>
                  <p>📍 Distância: {delivery.distance ? delivery.distance.toFixed(1) + 'km' : 'Calculando...'}</p>
                  <p>🎯 Prioridade: {delivery.priority}</p>
                  {delivery.estimatedTime > 0 && (
                    <p>⏱️ Tempo: {delivery.estimatedTime}min</p>
                  )}
                  {delivery.distance && (
                    <p>🔋 Consumo: {delivery.distance * 2}% (ida e volta)</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .sections-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .drones-list, .deliveries-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 500px;
          overflow-y: auto;
        }

        .drone-item, .delivery-item {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
        }

        .drone-header, .delivery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .drone-header h4, .delivery-header h4 {
          margin: 0;
        }

        .status-badge {
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .battery-section {
          margin-bottom: 0.5rem;
        }

        .battery-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin: 0.25rem 0;
        }

        .battery-level {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .drone-specs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.25rem;
          font-size: 0.8rem;
        }

        .drone-specs p {
          margin: 0;
        }

        .delivery-info {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.25rem;
          font-size: 0.9rem;
        }

        .drone-info p, .delivery-info p {
          margin: 0;
          color: #6b7280;
        }

        small {
          font-size: 0.7rem;
          color: #9ca3af;
        }

        @media (max-width: 768px) {
          .sections-grid {
            grid-template-columns: 1fr;
          }
          
          .drone-specs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;