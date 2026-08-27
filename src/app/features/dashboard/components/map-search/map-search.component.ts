import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { LocationService, SelectedLocation } from '../../services/location.service';
import { CommonModule } from '@angular/common';
import { isInsideUSA } from '../../services/mapHelper';
import { EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-map-search',
 imports: [CommonModule, FormsModule],
  templateUrl: './map-search.component.html',
  styleUrl: './map-search.component.scss',
})
export class MapSearchComponent {

@Output() locationPicked = new EventEmitter<SelectedLocation>();

  private provider = new OpenStreetMapProvider({
      params: {
    countrycodes: 'us',          // only return US results
    // optional: limit the search area
    // viewbox: '-125,49.5,-66.5,24.3',
    // bounded: 1
  }
  });
  private locationService = inject(LocationService);
  private router = inject(Router);

  query = '';
  results = signal<any[]>([]);
  isLoading = signal(false);

  async onSearch() {
    if (!this.query.trim()) {
      this.results.set([]);
      return;
    }

    this.isLoading.set(true);
    try {
      const res = await this.provider.search({ query: this.query });
      this.results.set(res);
    } catch (e) {
      console.error(e);
      this.results.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectResult(result: any) 
  {
    const lat = result.y;
    const lng = result.x;
    if (!isInsideUSA(lat, lng)) 
    {
      alert('Please choose a location inside the United States.');
      return;
    }
    const loc: SelectedLocation = {
      lat: result.y,
      lng: result.x,
      label: result.label
    };
    
  const confirmed = window.confirm(
    `Use this location?\n\n${loc.label}`
  );

  if (confirmed) {
    this.locationPicked.emit(loc);
    this.results.set([]);
  }
   ////this.locationService.setLocation(loc);
    // Option A: navigate to map
   //// this.router.navigate(['/mapView']);
    // Option B: if you keep both components visible, just emit or let the service signal update the map
  }

  goToMapPicker() {
    this.locationService.clear();
    this.router.navigate(['/mapView']);
  }
}
