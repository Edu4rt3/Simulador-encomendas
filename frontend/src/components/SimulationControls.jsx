import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SimulationControls = ({ onSimulationUpdate }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [drones, setDrones] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState({});
  const [simulationLog, setSimulationLog] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deliveriesRes, dronesRes] = await Promise.all([
        api.get('/deliveries'),
        api.get('/drones')
      ]);
      setDeliveries(deliveriesRes.data);
      setDrones(dronesRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const addLog = (message) => {
    setSimulationLog(prev => [...prev, { timestamp: new Date(), message }]);
  };

  const handleOptimize = async () => {
    try {
      addLog('🔄 Iniciando otimização de rotas...');
      const response = await api.post('/simulation/optimize');
      addLog('✅ Rotas otimizadas com sucesso!');
      
      await fetchData();
      onSimulationUpdate();
    } catch (error) {
      addLog('❌ Erro na otimização: ' + error.message);
      console.error('❌ Erro na otimização:', error);
    }
  };

  const simulateSingleDelivery = async (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    try {
      setSimulationProgress(prev => ({ ...prev, [deliveryId]: 'iniciando' }));
      addLog(`🚀 Iniciando simulação: ${delivery.customerName}`);
      
      // 1. Primeiro otimiza (atribui a um drone se necessário)
      if (!delivery.assignedDroneId) {
        addLog(`🧠 Atribuindo drone para: ${delivery.customerName}`);
        await api.post('/simulation/optimize');
        await fetchData();
      }
      
      // 2. Aguarda um pouco para visualização
      setSimulationProgress(prev => ({ ...prev, [deliveryId]: 'atribuindo' }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 3. Inicia a simulação com timeout maior
      setSimulationProgress(prev => ({ ...prev, [deliveryId]: 'voando' }));
      addLog(`✈️ Drone em voo: ${delivery.customerName}`);
      
      await api.post(`/deliveries/${deliveryId}/simulate`);
      
      // 4. Atualiza os dados
      await fetchData();
      onSimulationUpdate();
      setSimulationProgress(prev => ({ ...prev, [deliveryId]: 'concluido' }));
      addLog(`✅ Entrega concluída: ${delivery.customerName}`);
      
      // 5. Limpa o progresso após 2 segundos
      setTimeout(() => {
        setSimulationProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[deliveryId];
          return newProgress;
        });
      }, 2000);
      
    } catch (error) {
      addLog(`❌ Erro na simulação de ${delivery.customerName}: ${error.message}`);
      setSimulationProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[deliveryId];
        return newProgress;
      });
    }
  };

  const handleSimulateAll = async () => {
    setIsSimulating(true);
    setSimulationLog([]);
    addLog('🚀 Iniciando simulação em lote...');
    
    try {
      // Otimiza primeiro
      await api.post('/simulation/optimize');
      await fetchData();
      
      const deliverableDeliveries = deliveries.filter(d => 
        d.status === 'assigned' || d.status === 'in_progress'
      );

      addLog(`📦 ${deliverableDeliveries.length} entregas para simular`);

      for (const delivery of deliverableDeliveries) {
        await simulateSingleDelivery(delivery.id);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Intervalo entre simulações
      }

      addLog('🎉 Todas as simulações concluídas!');
    } catch (error) {
      addLog('💥 Erro na simulação em lote: ' + error.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Tem certeza que deseja resetar todas as entregas? Isso irá limpar todo o histórico.')) {
      try {
        await api.post('/simulation/reset');
        setSimulationLog([]);
        fetchData();
        onSimulationUpdate();
        addLog('🔄 Simulação resetada');
      } catch (error) {
        addLog('❌ Erro ao resetar: ' + error.message);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#6b7280',
      assigned: '#f59e0b',
      in_progress: '#3b82f6',
      delivered: '#10b981',
      failed: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getProgressText = (status) => {
    const texts = {
      iniciando: '🔄 Iniciando...',
      atribuindo: '🚁 Atribuindo drone...',
      voando: '✈️ Em voo...',
      concluido: '✅ Concluído!'
    };
    return texts[status] || '';
  };

  const calculateDistance = (delivery) => {
    if (delivery.distance) {
      return delivery.distance.toFixed(1);
    }
    const dx = delivery.customerLocation.x;
    const dy = delivery.customerLocation.y;
    return Math.sqrt(dx * dx + dy * dy).toFixed(1);
  };

  const availableDrones = drones.filter(d => d.status === 'idle' && d.currentBattery > 20);
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending');

  return (
    <div>
      <div className="card">
        <h3>🎮 Controles de Simulação</h3>
        
        <div className="card">
          <h4>🔍 Diagnóstico do Sistema</h4>
          <div className="diagnostic-info">
            <div className="diagnostic-item">
              <span>🚁 Drones Disponíveis:</span>
              <strong>{availableDrones.length}</strong>
            </div>
            <div className="diagnostic-item">
              <span>📦 Entregas Pendentes:</span>
              <strong>{pendingDeliveries.length}</strong>
            </div>
            <div className="diagnostic-item">
              <span>⚡ Velocidade de Simulação:</span>
              <strong>Acelerada 2x</strong>
            </div>
            <div className="diagnostic-item">
              <span>⏱️ Timeout:</span>
              <strong>60 segundos</strong>
            </div>
          </div>
        </div>
        
        <div className="controls-grid">
          <button onClick={handleOptimize} className="btn-primary">
            🧠 Otimizar Rotas
          </button>
          <button 
            onClick={handleSimulateAll} 
            className="btn-success"
            disabled={isSimulating || deliveries.filter(d => d.status === 'assigned' || d.status === 'in_progress').length === 0}
          >
            {isSimulating ? '⏳ Simulando...' : '🚀 Simular Todas'}
          </button>
          <button onClick={handleReset} className="btn-danger">
            🔄 Resetar Tudo
          </button>
        </div>

        <div className="simulation-tips">
          <h4>💡 Simulação Acelerada</h4>
          <ul>
            <li>• <strong>Tempo de voo reduzido pela metade</strong> para simulações mais rápidas</li>
            <li>• <strong>Timeout aumentado para 60 segundos</strong> para entregas longas</li>
            <li>• <strong>Log em tempo real</strong> do progresso das simulações</li>
            <li>• Drones pesados adicionados para entregas maiores</li>
          </ul>
        </div>
      </div>

      {/* Log de Simulação */}
      <div className="card">
        <h3>📋 Log de Simulação</h3>
        <div className="simulation-log">
          {simulationLog.slice(-10).map((log, index) => (
            <div key={index} className="log-entry">
              <span className="log-time">
                {log.timestamp.toLocaleTimeString()}
              </span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
          {simulationLog.length === 0 && (
            <div className="log-empty">Nenhuma atividade de simulação ainda...</div>
          )}
        </div>
      </div>

      <div className="card">
        <h3>📦 Fila de Entregas ({deliveries.length} total)</h3>
        
        <div className="delivery-stats">
          <div className="stat-item">
            <span className="stat-pending">⏳ Pendentes: {deliveries.filter(d => d.status === 'pending').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-assigned">🚁 Atribuídas: {deliveries.filter(d => d.status === 'assigned').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-progress">✈️ Em Andamento: {deliveries.filter(d => d.status === 'in_progress').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-delivered">✅ Entregues: {deliveries.filter(d => d.status === 'delivered').length}</span>
          </div>
        </div>

        <div className="deliveries-list">
          {deliveries
            .filter(d => d.status !== 'delivered')
            .sort((a, b) => {
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              return priorityOrder[b.priority] - priorityOrder[a.priority] || 
                     new Date(a.createdAt) - new Date(b.createdAt);
            })
            .map(delivery => {
              const assignedDrone = drones.find(d => d.id === delivery.assignedDroneId);
              const progress = simulationProgress[delivery.id];
              const distance = calculateDistance(delivery);
              
              return (
                <div key={delivery.id} className="delivery-sim-item" 
                  style={{ borderLeft: `4px solid ${getStatusColor(delivery.status)}` }}>
                  
                  <div className="delivery-info">
                    <div className="delivery-header">
                      <h4>📦 {delivery.customerName}</h4>
                      <div className="delivery-meta">
                        <span className="priority-badge" style={{ 
                          background: delivery.priority === 'high' ? '#ef4444' : 
                                     delivery.priority === 'medium' ? '#f59e0b' : '#10b981'
                        }}>
                          {delivery.priority}
                        </span>
                        <span className="status-badge" style={{ 
                          background: getStatusColor(delivery.status) 
                        }}>
                          {delivery.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="delivery-details">
                      <div className="detail-group">
                        <p>⚖️ <strong>Peso:</strong> {delivery.weight}kg</p>
                        <p>📍 <strong>Distância:</strong> {distance}km</p>
                      </div>
                      <div className="detail-group">
                        <p>🚁 <strong>Drone:</strong> {assignedDrone ? assignedDrone.name : 'Aguardando...'}</p>
                        <p>⏱️ <strong>Tempo Estimado:</strong> {delivery.estimatedTime ? delivery.estimatedTime.toFixed(1) + 'min' : '?'}</p>
                      </div>
                      
                      {progress && (
                        <div className="simulation-progress">
                          <span>{getProgressText(progress)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="delivery-actions">
                    <button 
                      onClick={() => simulateSingleDelivery(delivery.id)}
                      className="btn-primary"
                      disabled={delivery.status === 'in_progress' || progress}
                    >
                      {progress ? '⏳' : '🚀'} Simular
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <style jsx>{`
        .diagnostic-info {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .diagnostic-item {
          display: flex;
          justify-content: space-between;
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }

        .simulation-tips {
          background: #e0f2fe;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .simulation-tips h4 {
          margin: 0 0 0.5rem 0;
          color: #0369a1;
        }

        .simulation-tips ul {
          margin: 0;
          padding-left: 1.2rem;
        }

        .simulation-tips li {
          margin: 0.25rem 0;
          font-size: 0.9rem;
        }

        .simulation-log {
          max-height: 200px;
          overflow-y: auto;
          background: #1f2937;
          color: white;
          padding: 1rem;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
        }

        .log-entry {
          display: flex;
          margin-bottom: 0.5rem;
        }

        .log-time {
          color: #60a5fa;
          margin-right: 1rem;
          min-width: 80px;
        }

        .log-empty {
          color: #9ca3af;
          font-style: italic;
        }

        .delivery-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-item {
          padding: 0.5rem;
          border-radius: 6px;
          text-align: center;
          font-weight: 600;
        }

        .stat-pending { color: #6b7280; }
        .stat-assigned { color: #f59e0b; }
        .stat-progress { color: #3b82f6; }
        .stat-delivered { color: #10b981; }

        .controls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .deliveries-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .delivery-sim-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .delivery-sim-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .delivery-info {
          flex: 1;
        }

        .delivery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .delivery-header h4 {
          margin: 0;
        }

        .delivery-meta {
          display: flex;
          gap: 0.5rem;
        }

        .priority-badge, .status-badge {
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .delivery-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .detail-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .delivery-details p {
          margin: 0;
          color: #6b7280;
        }

        .simulation-progress {
          grid-column: 1 / -1;
          padding: 0.5rem;
          background: #e0f2fe;
          border-radius: 4px;
          margin-top: 0.5rem;
          text-align: center;
          font-weight: 600;
        }

        .delivery-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 100px;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .delivery-sim-item {
            flex-direction: column;
            align-items: stretch;
          }
          
          .delivery-details {
            grid-template-columns: 1fr;
          }
          
          .delivery-actions {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default SimulationControls;