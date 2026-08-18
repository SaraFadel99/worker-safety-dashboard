import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { LocationService, SelectedLocation } from '../../services/location.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-map-search',
 imports: [CommonModule, FormsModule],
  templateUrl: './map-search.component.html',
  styleUrl: './map-search.component.scss',
})
export class MapSearchComponent {


  private provider = new OpenStreetMapProvider();
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

  selectResult(result: any) {
    const loc: SelectedLocation = {
      lat: result.y,
      lng: result.x,
      label: result.label
    };
    this.locationService.setLocation(loc);
    // Option A: navigate to map
    this.router.navigate(['/map']);
    // Option B: if you keep both components visible, just emit or let the service signal update the map
  }

  goToMapPicker() {
    this.locationService.clear();
    this.router.navigate(['/map']);
  }
}
