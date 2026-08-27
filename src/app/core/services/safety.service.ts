import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SafetyCardRequest } from '../models/SafetyCardRequest';
import { SafetyCardResponse } from '../models/SafetyCardResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SafetyService {

  private readonly http = inject(HttpClient);
 
  private API_URL :string = "https://localhost:7008/api/Safety"
  
  locationSafety(reqData: SafetyCardRequest ):Observable<SafetyCardResponse>
  { 
    return this.http.post<SafetyCardResponse>(this.API_URL+"/locationSafety", reqData);
  }


}
