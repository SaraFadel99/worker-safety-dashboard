  export interface SafetyCardResponse
  {
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
