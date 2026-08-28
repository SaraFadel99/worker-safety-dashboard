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
  isDarkTheme = signal(false);
    isLoading = signal(false);

    constructor() {
    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkTheme.set(prefersDark);
    this.applyTheme(prefersDark);
  }


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

  toggleTheme(): void {
    this.isDarkTheme.update(v => !v);
    this.applyTheme(this.isDarkTheme());
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  
  private fetchSafetyData(lat: number, lng: number): void {
    this.cardState.set('loading');
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Simulate API call
    setTimeout(() => {
      // Mock data - replace with actual API call
      const mockData: SafetyCardResponse = {
        siteName:'',
        latitude: lat,
        longitude: lng,
        timestamp: new Date(),
        heatIndexF: 75 + Math.random() * 20,
        wetBulbF: 60 + Math.random() * 15,
        humidityPercent: 40 + Math.random() * 40,
        aqi: 30 + Math.random() * 70,
        solarIrradianceGhi: 200 + Math.random() * 500,
        badge: Math.random() > 0.5 ? 'Heat Advisory' : 'Normal Conditions',
        suggestion: Math.random() > 0.5 
          ? 'Move heavy labor indoors until after 4pm. Mandatory water breaks every 30 min.'
          : 'Conditions are within normal range. Standard hydration practices apply.',
        keyConcern: Math.random() > 0.5 ? 'High temperature expected' : 'No immediate concerns'
      };

      this.cardData.set(mockData);
 //     this.cardState.set('has-data');
      this.isLoading.set(false);
    }, 1500);
  }
}
