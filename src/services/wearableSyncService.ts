export interface WearableDataPoint {
  date: string; // ISO date
  steps: number;
  calories: number;
  sleepHours: number;
  restingHeartRate?: number;
}

class WearableSyncService {
  async syncAppleWatch(): Promise<WearableDataPoint[]> {
    // Simulated data; replace with HealthKit API integration
    return this.generateMockData();
  }

  async syncFitbit(): Promise<WearableDataPoint[]> {
    // Simulated data; replace with Fitbit Web API integration
    return this.generateMockData();
  }

  private generateMockData(): WearableDataPoint[] {
    const today = new Date();
    const points: WearableDataPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      points.push({
        date: d.toISOString().slice(0, 10),
        steps: Math.floor(Math.random() * 6000) + 4000,
        calories: Math.floor(Math.random() * 600) + 1600,
        sleepHours: Number((Math.random() * 3 + 5.5).toFixed(1)),
        restingHeartRate: Math.floor(Math.random() * 15) + 55,
      });
    }
    return points;
  }
}

export const wearableSyncService = new WearableSyncService();

