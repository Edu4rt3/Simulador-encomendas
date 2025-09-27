export class Delivery {
    constructor(id, customerLocation, weight, priority, customerName = 'Cliente') {
        this.id = id;
        this.customerLocation = customerLocation; // {x, y}
        this.weight = weight; // kg
        this.priority = priority; // 'low', 'medium', 'high'
        this.customerName = customerName;
        this.status = 'pending'; // pending, assigned, in_progress, delivered, failed
        this.assignedDroneId = null;
        this.estimatedTime = 0; // minutos
        this.distance = 0; // Adicionar esta propriedade
        this.createdAt = new Date();
    }

    calculateDistance(baseLocation = { x: 0, y: 0 }) {
        const dx = this.customerLocation.x - baseLocation.x;
        const dy = this.customerLocation.y - baseLocation.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.distance = distance; // Armazenar a distância calculada
        return distance;
    }

    getPriorityValue() {
        const priorities = { low: 1, medium: 2, high: 3 };
        return priorities[this.priority] || 1;
    }
}