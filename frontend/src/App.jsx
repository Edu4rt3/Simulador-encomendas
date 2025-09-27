import React, { useState } from 'react'
import Dashboard from './components/Dashboard'  // Corrigido para singular
import DeliveryForm from './components/DeliveryForm'
import DroneManager from './components/DroneManager'  // Corrigido ortografia
import SimulationControls from './components/SimulationControls'
import './styles/App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshData = () => {
    setRefreshKey(prev => prev + 1)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key={refreshKey} />
      case 'new-delivery':
        return <DeliveryForm onDeliveryCreated={refreshData} />
      case 'drones':
        return <DroneManager key={refreshKey} />
      case 'simulation':
        return <SimulationControls onSimulationUpdate={refreshData} />
      default:
        return <Dashboard key={refreshKey} />
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚁 Simulador de Encomendas em Drone</h1>
        <nav className="nav-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'new-delivery' ? 'active' : ''}
            onClick={() => setActiveTab('new-delivery')}
          >
            📦 Nova Entrega
          </button>
          <button 
            className={activeTab === 'drones' ? 'active' : ''}
            onClick={() => setActiveTab('drones')}
          >
            🚁 Gerenciar Drones
          </button>
          <button 
            className={activeTab === 'simulation' ? 'active' : ''}
            onClick={() => setActiveTab('simulation')}
          >
            ⚙️ Controles
          </button>
        </nav>
      </header>

      <main className="app-main">
        {renderContent()}
      </main>
    </div>
  )
}

export default App