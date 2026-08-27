//export type RiskLevel = 'high' | 'moderate' | 'low';

// export interface SafetyCardResponse {
//   siteName: string;
//   lat: number;
//   lon: number;
//   riskLevel: RiskLevel;
//   tempC: number;
//   heatIndexC: number;
//   wetBulbC: number;
//   recommendation: string;
// }

export type SafetyCardState = 'idle' | 'loading' | 'success' | 'error';
