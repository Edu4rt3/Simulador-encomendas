import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Aumentado para 60 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para logging de erros
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 Fazendo request para: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erro no request:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response recebido de: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Erro na response:', error);
    if (error.code === 'ECONNREFUSED') {
      alert('❌ Backend não está rodando! Execute: cd backend && npm run dev');
    }
    return Promise.reject(error);
  }
);

export default api;