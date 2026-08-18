import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject
} from '@angular/core';
import * as L from 'leaflet';
import { LocationService } from '../../services/location.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-leaflet-map',
  imports: [CommonModule],
  templateUrl: './leaflet-map.component.html',
  styleUrl: './leaflet-map.component.scss',
})
export class LeafletMapComponent implements AfterViewInit, OnDestroy {
@ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private marker: L.Marker | null = null;
  private locationService = inject(LocationService);

  constructor() {
    // React to location changes coming from the search component
    effect(() => {
      const loc = this.locationService.selectedLocation();
      if (loc && this.map) {
        this.showLocation(loc.lat, loc.lng, loc.label);
      }
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }
 //center: [ 39.8282, -98.5795 ],
  private initMap() {
    this.map = L.map(this.mapContainer.nativeElement).setView([39.8282, -98.5795], 4); // default USA

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 3,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Allow user to click on the map to pick a location
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.showLocation(lat, lng, `Selected: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      this.locationService.setLocation({ lat, lng, label: `Map pick (${lat.toFixed(5)}, ${lng.toFixed(5)})` });
    });

    // If a location was already selected before navigating here
    const existing = this.locationService.selectedLocation();
    if (existing) {
      this.showLocation(existing.lat, existing.lng, existing.label);
    }
  }

  private showLocation(lat: number, lng: number, label: string) {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.marker.bindPopup(label).openPopup();
    this.map.setView([lat, lng], 16);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
