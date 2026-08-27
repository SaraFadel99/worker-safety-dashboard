import { Component, inject, signal } from '@angular/core';
import { MapSearchComponent } from "../map-search/map-search.component";
import { SafetyCardState } from '../../../../core/models/safety-card.model';
import { SafetyCardResponse } from '../../../../core/models/SafetyCardResponse';
import { SafetyService } from '../../../../core/services/safety.service';
import { SelectedLocation } from '../../services/location.service';
import { SafetyCardRequest } from '../../../../core/models/SafetyCardRequest';
import { getRealLocalHour } from '../../services/mapHelper';
import { SiteCardComponent } from "../site-card/site-card.component";
import tzlookup from 'tz-lookup';
import { LeafletMapComponent } from "../leaflet-map/leaflet-map.component";


@Component({
  selector: 'app-safety-dashboard',
  imports: [MapSearchComponent, SiteCardComponent, LeafletMapComponent],
  templateUrl: './safety-dashboard.component.html',
  styleUrl: './safety-dashboard.component.scss',
})
export class SafetyDashboardComponent   {

  
private safetyService = inject(SafetyService);

  cardState = signal<SafetyCardState>('idle');
  cardData = signal<SafetyCardResponse | null>(null);
  errorMessage = signal('');
  pendingLocation = signal<SelectedLocation | null>(null);
  showMap = signal(false);

  toggleMap() {
    this.showMap.update(showing => !showing);
  }

  onLocationPicked(location: SelectedLocation) {
    const timezone = tzlookup(location.lat, location.lng);

    const request: SafetyCardRequest = {
      lat: location.lat,
      lon: location.lng,
      neededDate: getRealLocalHour(timezone),
      timeZone: timezone,
      granularity: 60
    };

    this.cardState.set('loading');
    this.cardData.set(null);

    this.safetyService.locationSafety(request).subscribe({
      next: response => {
        this.cardData.set(response);
        this.cardState.set('success');
      },
      error: error => {
        console.error(error);
        this.errorMessage.set('Unable to load safety data.');
        this.cardState.set('error');
      }
    });
  }



onLocationConfirmed(location: SelectedLocation) {
  const timezone = tzlookup(location.lat, location.lng);

  const request: SafetyCardRequest = {
    lat: location.lat,
    lon: location.lng,
    neededDate: getRealLocalHour(timezone),
    timeZone: timezone,
    granularity: 60
  };

  this.cardState.set('loading');
  this.cardData.set(null);

  this.safetyService.locationSafety(request).subscribe({
    next: response => {
      this.cardData.set(response);
      this.cardState.set('success');
    },
    error: error => {
      console.error(error);
      this.errorMessage.set('Unable to load safety data.');
      this.cardState.set('error');
    }
  });
}
}
