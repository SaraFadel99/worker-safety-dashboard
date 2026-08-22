import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal
} from '@angular/core';
import * as L from 'leaflet';
import { LocationService } from '../../services/location.service';
import { CommonModule } from '@angular/common';
import { US_BOUNDS, isInsideUSA } from '../../services/mapHelper';

const iconRetinaUrl = 'assets/leaflet/images/marker-icon-2x.png';
const iconUrl = 'assets/leaflet/images/marker-icon.png';
const shadowUrl = 'assets/leaflet/images/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-leaflet-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaflet-map.component.html',
  styleUrl: './leaflet-map.component.scss',
})
export class LeafletMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private marker: L.Marker | null = null;
  private locationService = inject(LocationService);

  private defaultLat = 39.8282;
  private defaultLng = -98.5795;

  // Public signals for the template
  pendingLocation = signal<{ lat: number; lng: number; label: string } | null>(null);
  isLoading = signal(false);

  private clicksDisabled = false;

  constructor() {
    effect(() => {
      const loc = this.locationService.selectedLocation();
      if (loc && this.map) {
        this.showConfirmedLocation(loc.lat, loc.lng, loc.label);
      }
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {
    this.map = L.map(this.mapContainer.nativeElement, {
      maxBounds: [
        [US_BOUNDS.south, US_BOUNDS.west],
        [US_BOUNDS.north, US_BOUNDS.east]
      ],
      maxBoundsViscosity: 0.85
    }).setView([this.defaultLat, this.defaultLng], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 22,
      minZoom: 3,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', async (e: L.LeafletMouseEvent) => {
      if (this.clicksDisabled || this.isLoading() || this.pendingLocation()) {
        return;
      }

      const { lat, lng } = e.latlng;

      // Strict US check
      if (!isInsideUSA(lat, lng)) {
        L.popup()
          .setLatLng([lat, lng])
          .setContent('<b>Sorry</b><br>Please select a location inside the United States.')
          .openOn(this.map);

        setTimeout(() => this.map.closePopup(), 2500);
        return;
      }

      this.clicksDisabled = true;
      this.isLoading.set(true);
      this.pendingLocation.set(null);

      this.placeMarker(lat, lng, 'Getting address...');

      try {
        const label = await this.reverseGeocode(lat, lng);
        this.pendingLocation.set({ lat, lng, label });
        this.placeMarker(lat, lng, label);
      } catch (err) {
        console.error('Reverse geocode error:', err);
        // Still allow the user to confirm the coordinates if geocoding fails
        this.pendingLocation.set({
          lat,
          lng,
          label: `Selected location (${lat.toFixed(5)}, ${lng.toFixed(5)})`
        });
        this.placeMarker(lat, lng, this.pendingLocation()!.label);
      } finally {
        this.isLoading.set(false);
      }
    });

    // Show already selected location
    const existing = this.locationService.selectedLocation();
    if (existing) {
      this.showConfirmedLocation(existing.lat, existing.lng, existing.label);
    }
  }

  private placeMarker(lat: number, lng: number, label: string) {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.marker.bindPopup(`<b>${label}</b>`).openPopup();
    this.map.setView([lat, lng], 13);
  }

  private showConfirmedLocation(lat: number, lng: number, label: string) {
    this.pendingLocation.set(null);
    this.isLoading.set(false);
    this.clicksDisabled = false;
    this.placeMarker(lat, lng, label);
  }

  confirmLocation() {
    const pending = this.pendingLocation();
    if (!pending) return;

    this.locationService.setLocation(pending);
    this.showConfirmedLocation(pending.lat, pending.lng, pending.label);
  }

  cancelLocation() {
    this.pendingLocation.set(null);
    this.isLoading.set(false);
    this.clicksDisabled = false;

    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=json` +
      `&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1` +
      `&countrycodes=us`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MyAngularApp/1.0 (your-real-email@example.com)' // ← change this
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const data = await response.json();

    // Safety check
    if (data.address?.country_code && data.address.country_code.toLowerCase() !== 'us') {
      throw new Error('Location is outside the United States');
    }

    if (!data.display_name) {
      throw new Error('No display name returned');
    }

    return data.display_name;
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}