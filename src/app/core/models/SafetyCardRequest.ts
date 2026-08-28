export class SafetyCardRequest 
{
    siteName!:string;
    lat!:number;
    lon!:number;
    neededDate!:string;
    timeZone!:string;
    granularity:number=100;
}