import { SimulationService } from '../services/SimulationService.js';
import { describe, it, expect } from '@jest/globals';

describe('SimulationService', () => {
  it('should create drone with correct properties', () => {
    const simulation = new SimulationService();
    const drone = simulation.addDrone('Test Drone', 5, 10, 100);
    
    expect(drone.name).toBe('Test Drone');
    expect(drone.maxWeight).toBe(5);
    expect(drone.currentBattery).toBe(100);
  });

  it('should calculate battery usage correctly', () => {
    const simulation = new SimulationService();
    const drone = simulation.addDrone('Test Drone', 5, 10, 100);
    
    expect(drone.calculateBatteryUsage(5)).toBe(5); // 1% per km
  });
});