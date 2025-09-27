import { Drone } from '../models/Drone.js';
import { Delivery } from '../models/Delivery.js';

export class SimulationService {
  constructor() {
    this.drones = new Map();
    this.deliveries = new Map();
    this.obstacles = new Set();
    this.initializeSampleDrones();
  }

  initializeSampleDrones() {
    if (this.drones.size === 0) {
      this.addDrone('Drone Alpha', 5, 15, 100);
      this.addDrone('Drone Beta', 3, 12, 100);
      this.addDrone('Drone Gamma', 7, 18, 100);
      this.addDrone('Drone Heavy', 10, 20, 100);
    }
  }

  addDrone(name, maxWeight, maxDistance, batteryCapacity = 100) {
    const id = `drone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const drone = new Drone(id, name, maxWeight, maxDistance, batteryCapacity);
    this.drones.set(id, drone);
    return drone;
  }

  createDelivery(customerLocation, weight, priority, customerName) {
    const id = `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const delivery = new Delivery(id, customerLocation, weight, priority, customerName);
    this.deliveries.set(id, delivery);
    return delivery;
  }

  optimizeDeliveryQueue() {
    const pendingDeliveries = Array.from(this.deliveries.values())
      .filter(d => d.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 1;
        const bPriority = priorityOrder[b.priority] || 1;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        return a.calculateDistance() - b.calculateDistance();
      });

    return pendingDeliveries;
  }

  autoAssignDeliveries() {
    console.log('🧠 INICIANDO OTIMIZAÇÃO DE ROTAS...');
    
    const optimizedQueue = this.optimizeDeliveryQueue();
    const availableDrones = Array.from(this.drones.values())
      .filter(d => d.status === 'idle' && d.currentBattery > 10);

    console.log(`📊 ESTATÍSTICAS: ${optimizedQueue.length} entregas pendentes, ${availableDrones.length} drones disponíveis`);

    if (optimizedQueue.length === 0) {
      console.log('ℹ️  Nenhuma entrega pendente para otimizar');
      return 0;
    }

    if (availableDrones.length === 0) {
      console.log('⚠️  Nenhum drone disponível para atribuição');
      return 0;
    }

    console.log('📋 LISTA COMPLETA DE ENTREGAS PENDENTES:');
    optimizedQueue.forEach((delivery, index) => {
      const distance = delivery.calculateDistance();
      console.log(`   ${index + 1}. ${delivery.customerName} - PRIORIDADE: ${delivery.priority.toUpperCase()}, PESO: ${delivery.weight}kg, DISTÂNCIA: ${distance.toFixed(1)}km`);
    });

    console.log('🚁 FROTA DE DRONES DISPONÍVEIS:');
    availableDrones.forEach((drone, index) => {
      console.log(`   ${index + 1}. ${drone.name} - CAPACIDADE: ${drone.maxWeight}kg, ALCANCE: ${drone.maxDistance}km, BATERIA: ${drone.currentBattery}%`);
    });

    let assignments = 0;

    for (const delivery of optimizedQueue) {
      const distance = delivery.calculateDistance();
      console.log(`\n🔍 ANALISANDO ENTREGA: ${delivery.customerName} (${delivery.priority}, ${delivery.weight}kg, ${distance.toFixed(1)}km)`);

      let bestDrone = null;
      let bestScore = -1;
      let rejectionReasons = [];

      for (const drone of availableDrones) {
        const batteryNeeded = distance * 2; // 1% por km (ida e volta)
        let score = 0;
        let canCarry = true;
        let reason = '';

        if (delivery.weight > drone.maxWeight) {
          reason = `PESO: ${delivery.weight}kg > ${drone.maxWeight}kg`;
          canCarry = false;
        } else if (distance > drone.maxDistance) {
          reason = `DISTÂNCIA: ${distance.toFixed(1)}km > ${drone.maxDistance}km`;
          canCarry = false;
        } else if (drone.currentBattery < batteryNeeded) {
          reason = `BATERIA: ${drone.currentBattery}% < ${batteryNeeded}% (${distance}km × 2 = ${batteryNeeded}%)`;
          canCarry = false;
        }

        if (!canCarry) {
          rejectionReasons.push(`   ❌ ${drone.name}: ${reason}`);
          continue;
        }

        score += delivery.getPriorityValue() * 100;
        score += (drone.currentBattery - batteryNeeded) * 2;
        score += (drone.maxWeight - delivery.weight);
        score += (drone.maxDistance - distance);
        score += (drone.deliveriesCompleted || 0) * 0.5;

        console.log(`   ✅ ${drone.name} - SCORE: ${score} (Bat:${drone.currentBattery}% → ${drone.currentBattery - batteryNeeded}% após ${distance}km × 2)`);

        if (score > bestScore) {
          bestScore = score;
          bestDrone = drone;
        }
      }

      if (bestDrone) {
        this.assignDeliveryToDrone(delivery.id, bestDrone.id);
        assignments++;
        console.log(`🎯 ATRIBUIDO: ${delivery.customerName} → ${bestDrone.name} (Score: ${bestScore})`);
        availableDrones.splice(availableDrones.indexOf(bestDrone), 1);
      } else {
        console.log(`🚫 NÃO ATRIBUIDO: ${delivery.customerName} - Motivos:`);
        rejectionReasons.forEach(reason => console.log(reason));
      }
    }

    console.log(`\n🎉 RESULTADO FINAL: ${assignments} de ${optimizedQueue.length} entregas atribuídas`);
    
    const unassigned = optimizedQueue.filter(d => !d.assignedDroneId);
    if (unassigned.length > 0) {
      console.log(`📦 ENTREGAS NÃO ATRIBUIDAS (${unassigned.length}):`);
      unassigned.forEach(delivery => {
        console.log(`   • ${delivery.customerName} - ${delivery.priority}, ${delivery.weight}kg, ${delivery.calculateDistance().toFixed(1)}km`);
      });
    }

    return assignments;
  }

  assignDeliveryToDrone(deliveryId, droneId) {
    const delivery = this.deliveries.get(deliveryId);
    const drone = this.drones.get(droneId);

    if (delivery && drone) {
      delivery.status = 'assigned';
      delivery.assignedDroneId = droneId;
      drone.status = 'loading';
      
      const distance = delivery.calculateDistance();
      delivery.estimatedTime = Math.ceil(distance) * 0.5;
      delivery.distance = distance;
      
      console.log(`   📦 Atribuição confirmada: ${delivery.customerName} → ${drone.name}`);
      console.log(`   ⏱️  Tempo estimado: ${delivery.estimatedTime}min`);
      console.log(`   🔋 Consumo estimado: ${distance * 2}% (${distance}km × 2)`);
    }
  }

  async simulateDelivery(deliveryId) {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery || delivery.status === 'delivered') {
      console.log('❌ Entrega não encontrada ou já entregue');
      return;
    }

    if (!delivery.assignedDroneId || delivery.status === 'pending') {
      console.log('🔄 Tentando atribuir entrega antes da simulação...');
      this.autoAssignDeliveries();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const updatedDelivery = this.deliveries.get(deliveryId);
      if (!updatedDelivery.assignedDroneId) {
        console.log('❌ Não foi possível atribuir a entrega a um drone');
        return;
      }
      return this.simulateDelivery(deliveryId);
    }

    const drone = this.drones.get(delivery.assignedDroneId);
    if (!drone) {
      console.log('❌ Drone não encontrado');
      return;
    }

    console.log(`🚀 INICIANDO SIMULAÇÃO: ${delivery.customerName} com ${drone.name}`);
    console.log(`   🔋 Bateria inicial: ${drone.currentBattery}%`);
    console.log(`   📍 Distância: ${delivery.distance}km`);
    console.log(`   🔋 Consumo total estimado: ${delivery.distance * 2}% (ida e volta)`);

    // Fase 1: Voando para o destino
    drone.status = 'flying';
    delivery.status = 'in_progress';
    console.log(`   ✈️ Voando para o destino...`);

    const simulationSpeed = 100;
    await this.delay(delivery.estimatedTime * simulationSpeed);

    // Fase 2: Entregando (consumo de bateria na ida)
    console.log(`   📦 Chegou ao destino - realizando entrega...`);
    drone.useBattery(delivery.distance); // Consumo na ida (1% por km)
    delivery.status = 'delivered';
    delivery.completedAt = new Date();
    drone.deliveriesCompleted = (drone.deliveriesCompleted || 0) + 1;

    console.log(`   🔋 Bateria após ida: ${drone.currentBattery}%`);

    // Fase 3: Retornando à base
    drone.status = 'returning';
    console.log(`   🔙 Retornando à base...`);

    await this.delay(delivery.estimatedTime * simulationSpeed);
    
    // Fase 4: Volta à base (consumo de bateria na volta)
    drone.useBattery(delivery.distance); // Consumo na volta (1% por km)
    drone.status = 'idle';
    drone.currentLocation = { x: 0, y: 0 };
    
    console.log(`   🏠 Voltou à base`);
    console.log(`   🔋 Bateria final: ${drone.currentBattery}%`);
    console.log(`   📊 Total de entregas: ${drone.deliveriesCompleted}`);
    console.log(`   📏 Distância total percorrida: ${drone.totalDistanceFlown}km`);

    // Recarregar automaticamente se bateria baixa
    if (drone.currentBattery < 30) {
      console.log(`   ⚡ Bateria baixa (${drone.currentBattery}%) - iniciando recarga automática...`);
      drone.recharge();
      console.log(`   🔋 Bateria após recarga: ${drone.currentBattery}%`);
    }

    console.log(`✅ SIMULAÇÃO CONCLUÍDA: ${delivery.customerName}`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getDashboardData() {
    const totalDeliveries = this.deliveries.size;
    const deliveredDeliveries = Array.from(this.deliveries.values())
      .filter(d => d.status === 'delivered');
    const deliveredCount = deliveredDeliveries.length;
    
    const averageTime = deliveredDeliveries.length > 0 
      ? deliveredDeliveries.reduce((acc, d) => acc + (d.estimatedTime || 0), 0) / deliveredDeliveries.length 
      : 0;

    let efficientDrone = { name: 'Nenhum', deliveries: 0 };
    Array.from(this.drones.values()).forEach(drone => {
      const droneDeliveries = Array.from(this.deliveries.values())
        .filter(d => d.assignedDroneId === drone.id && d.status === 'delivered');
      const deliveriesCount = droneDeliveries.length;
      if (deliveriesCount > efficientDrone.deliveries) {
        efficientDrone = { name: drone.name, deliveries: deliveriesCount };
      }
    });

    return {
      totalDeliveries,
      delivered: deliveredCount,
      averageTime: Math.round(averageTime),
      efficientDrone: efficientDrone.name,
      efficientDroneDeliveries: efficientDrone.deliveries,
      activeDeliveries: Array.from(this.deliveries.values()).filter(d => 
        ['assigned', 'in_progress'].includes(d.status)
      ).length,
      availableDrones: Array.from(this.drones.values()).filter(d => d.status === 'idle').length,
      pendingDeliveries: Array.from(this.deliveries.values()).filter(d => d.status === 'pending').length
    };
  }
}