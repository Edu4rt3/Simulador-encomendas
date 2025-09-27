import React, { useState } from 'react';
import api from '../services/api';

const DeliveryForm = ({ onDeliveryCreated }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    weight: '',
    priority: 'medium',
    x: '',
    y: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('📦 Tentando criar entrega:', formData);

    try {
      const deliveryData = {
        customerName: formData.customerName || `Cliente ${Date.now()}`,
        weight: parseFloat(formData.weight),
        priority: formData.priority,
        customerLocation: {
          x: parseInt(formData.x),
          y: parseInt(formData.y)
        }
      };

      console.log('📤 Enviando dados para API...');
      const response = await api.post('/deliveries', deliveryData);
      console.log('✅ Resposta da API:', response.data);

      setFormData({
        customerName: '',
        weight: '',
        priority: 'medium',
        x: '',
        y: ''
      });
      
      onDeliveryCreated();
      alert('✅ Entrega criada com sucesso!');
    } catch (error) {
      console.error('❌ Erro detalhado:', error);
      let errorMessage = 'Erro desconhecido';
      
      if (error.response) {
        // O servidor respondeu com status de erro
        errorMessage = error.response.data.error || `Erro ${error.response.status}`;
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        errorMessage = 'Sem resposta do servidor. Verifique se o backend está rodando.';
      } else {
        // Outro tipo de erro
        errorMessage = error.message;
      }
      
      alert(`❌ Erro ao criar entrega: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3>➕ Nova Entrega</h3>
      
      <form onSubmit={handleSubmit} className="delivery-form">
        <div className="form-group">
          <label>Nome do Cliente:</label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            placeholder="João Silva"
          />
        </div>

        <div className="form-group">
          <label>Peso (kg):</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            value={formData.weight}
            onChange={(e) => setFormData({...formData, weight: e.target.value})}
            placeholder="2.5"
            required
          />
        </div>

        <div className="form-group">
          <label>Prioridade:</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
          >
            <option value="low">🟢 Baixa</option>
            <option value="medium">🟡 Média</option>
            <option value="high">🔴 Alta</option>
          </select>
        </div>

        <div className="form-group">
          <label>Coordenada X (km):</label>
          <input
            type="number"
            min="0"
            max="20"
            value={formData.x}
            onChange={(e) => setFormData({...formData, x: e.target.value})}
            placeholder="5"
            required
          />
        </div>

        <div className="form-group">
          <label>Coordenada Y (km):</label>
          <input
            type="number"
            min="0"
            max="20"
            value={formData.y}
            onChange={(e) => setFormData({...formData, y: e.target.value})}
            placeholder="3"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Criando...' : '📦 Criar Entrega'}
        </button>
      </form>

      <div style={{marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px'}}>
        <h4>🔍 Debug Info:</h4>
        <p>Backend URL: http://localhost:3001</p>
        <p>Form Data: {JSON.stringify(formData)}</p>
      </div>
    </div>
  );
};

export default DeliveryForm;