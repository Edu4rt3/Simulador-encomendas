#🚁 Simulador de Encomendas em Drone
Sistema completo de simulação de entregas por drones com otimização inteligente de rotas.

🚀 Tecnologias
Backend: Node.js + Express

Frontend: React + Vite

Comunicação: REST API

##📦 Funcionalidades Implementadas
###✅ Obrigatórias
Alocação automática de drones

Gestão de capacidade e distância

Sistema de prioridades (baixa, média, alta)

Testes unitários (estrutura preparada)

###✅ Avançadas
Simulação de bateria do drone (1% por km)

Cálculo de tempo total de entrega

Fila de entrega por prioridade

Dashboard em tempo real

###✅ Diferenciais
Otimização inteligente de rotas

Sistema de estados do drone (Idle → Loading → Flying → Delivering → Returning)

APIs RESTful bem definidas

Interface moderna e responsiva

Consumo realista de bateria

Recarga automática quando bateria < 30%

##🏃‍♂️ Como Executar
Pré-requisitos
Node.js 16+

npm ou yarn

Backend (Porta 3001)
bash
cd backend
npm install
npm run dev
Frontend (Porta 3000)
bash
cd frontend
npm install
npm run dev
Acesse a aplicação
Frontend: http://localhost:3000

Backend API: http://localhost:3001/api/health

###📡 Endpoints da API
Drones
GET /api/drones - Listar todos os drones

POST /api/drones - Criar novo drone

PUT /api/drones/:id/status - Atualizar status

###Entregas
GET /api/deliveries - Listar todas as entregas

POST /api/deliveries - Criar nova entrega

POST /api/deliveries/:id/assign - Atribuir a drone

POST /api/deliveries/:id/simulate - Simular entrega

###Simulação
GET /api/simulation/dashboard - Dados do dashboard

POST /api/simulation/optimize - Otimizar rotas

POST /api/simulation/reset - Resetar simulação

##🎮 Como Usar o Sistema
###1. Configurar Drones
Acesse a aba "Gerenciar Drones"

Adicione drones com diferentes capacidades

Exemplo: Drone com 5kg capacidade e 15km alcance

###2. Criar Entregas
Na aba "Nova Entrega", preencha:

Nome do cliente

Peso (1-10kg)

Prioridade (Alta/Média/Baixa)

Coordenadas X e Y (0-20km)

###3. Otimizar Rotas
Clique em "Otimizar Rotas" para alocação automática

O sistema prioriza por: Prioridade → Distância

###4. Simular Entregas
Clique em "Simular" para executar a entrega

Acompanhe em tempo real no dashboard
##🔧 Funcionalidades Técnicas Detalhadas
Algoritmo de Otimização
Priorização: Entregas HIGH → MEDIUM → LOW

Alocação inteligente: Considera capacidade, bateria e distância

Score system: Atribui drones baseado em eficiência energética

Sistema de Bateria
Consumo: 1% por quilômetro percorrido

Recarga automática: Quando bateria < 30%

Prevenção: Impede voos com bateria insuficiente

Dashboard em Tempo Real
Atualização automática a cada 3 segundos

Métricas de eficiência em tempo real

Visualização do status de drones e entregas

##📊 Métricas e Monitoramento
O sistema fornece:

Tempo médio de entrega

Drone mais eficiente

Taxa de entregas concluídas

Consumo médio de bateria

Distância total percorrida

##🚀 Próximas Melhorias Possíveis
Persistência em banco de dados

Autenticação e autorização

Notificações em tempo real (WebSocket)

Mapa visual interativo

Relatórios detalhados em PDF

Deploy em cloud

##👨‍💻 Autor
Desenvolvido como parte do processo seletivo técnico.

Contato:(31) 982179044

LinkedIn: https://www.linkedin.com/in/eduardoduarte-dev/

GitHub: https://github.com/Edu4rt3

Email: eduardo.abduarte@gmail.com