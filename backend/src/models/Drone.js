export class Drone {
  constructor(id, name, maxWeight, maxDistance, batteryCapacity) {
    this.id = id;
    this.name = name;
    this.maxWeight = maxWeight; // kg
    this.maxDistance = maxDistance; // km
    this.batteryCapacity = batteryCapacity; // porcentagem
    this.currentBattery = batteryCapacity;
    this.status = 'idle'; // idle, loading, flying, delivering, returning
    this.currentLocation = { x: 0, y: 0 }; // base
    this.currentLoad = 0;
    this.totalDistanceFlown = 0; // Adicionar para estatísticas
    this.deliveriesCompleted = 0;
  }

  canCarry(weight, distance) {
    const batteryNeeded = distance * 2; // 1% por km (ida e volta)
    return weight <= this.maxWeight && 
           distance <= this.maxDistance && 
           this.currentBattery >= batteryNeeded;
  }

  calculateBatteryUsage(distance) {
    // Consumo fixo de 1% por km percorrido
    return distance;
  }

  useBattery(distance) {
    const usage = this.calculateBatteryUsage(distance);
    this.currentBattery = Math.max(0, this.currentBattery - usage);
    this.totalDistanceFlown += distance;
    
    console.log(`🔋 ${this.name} consumiu ${usage}% de bateria (${distance}km)`);
    console.log(`   📊 Bateria restante: ${this.currentBattery}%`);
  }

  recharge() {
    console.log(`⚡ ${this.name} recarregando de ${this.currentBattery}% para 100%`);
    this.currentBattery = this.batteryCapacity;
  }

  getBatteryStatus() {
    if (this.currentBattery > 70) return 'high';
    if (this.currentBattery > 30) return 'medium';
    if (this.currentBattery > 10) return 'low';
    return 'critical';
  }

  canMakeDelivery(distance) {
    const batteryNeeded = distance * 2; // Ida e volta
    return this.currentBattery >= batteryNeeded;
  }

  getEfficiency() {
    if (this.totalDistanceFlown === 0) return 0;
    return (this.deliveriesCompleted / this.totalDistanceFlown) * 100;
  }
}