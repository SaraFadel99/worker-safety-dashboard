import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { SelectedLocation } from '../../services/location.service';
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
pendingLocation = signal<SelectedLocation | null>(null);

  private provider = new OpenStreetMapProvider({
      params: {
    countrycodes: 'us',          // only return US results
    // optional: limit the search area
    // viewbox: '-125,49.5,-66.5,24.3',
    // bounded: 1
  }
  });

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
    this.isLoading.set(false);
    this.results.set([]);
    this.pendingLocation.set({
      lat,
      lng,
      label: result.label
    });
  //   const loc: SelectedLocation = {
  //     lat: result.y,
  //     lng: result.x,
  //     label: result.label
  //   };
    
  // const confirmed = window.confirm(
  //   `Use this location?\n\n${loc.label}`
  // );

  // if (confirmed) {
  //   this.locationPicked.emit(loc);
  //   this.results.set([]);
  // }
  }

confirmLocation() {
  const location = this.pendingLocation();

  if (!location) {
    return;
  }

  this.locationPicked.emit(location);
  this.pendingLocation.set(null);
}

cancelLocation() {
  this.pendingLocation.set(null);
}
}
