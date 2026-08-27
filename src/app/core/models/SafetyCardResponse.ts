  export interface SafetyCardResponse
  {
    siteName: string;
    latitude:number;
    longitude:number;
    timestamp:Date;
    heatIndexF:number;
    wetBulbF:number;
    humidityPercent:number;
    aqi:number;
    solarIrradianceGhi:number;
    badge:string;
    suggestion:string;
    keyConcern:string;
  }     



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
  