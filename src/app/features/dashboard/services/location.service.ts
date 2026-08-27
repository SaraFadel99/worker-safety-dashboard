import { Injectable, signal } from '@angular/core';

export interface SelectedLocation {
  lat: number;
  lng: number;
  label: string;
  timezone?: string;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  readonly selectedLocation = signal<SelectedLocation | null>(null);

  setLocation(loc: SelectedLocation) {
    this.selectedLocation.set(loc);
  }

  clear() {
    this.selectedLocation.set(null);
  }
}