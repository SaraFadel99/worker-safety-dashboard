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
  imports: [CommonModule],
  templateUrl: './leaflet-map.component.html',
  styleUrl: './leaflet-map.component.scss',
})
export class LeafletMapComponent implements AfterViewInit, OnDestroy {
@ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private marker: L.Marker | null = null;
  private locationService = inject(LocationService);
  private defaultLat = 39.8282; // Default latitude (center of the USA)
  private defaultLng = -98.5795; // Default longitude (center of the USA)
  
   pendingLocation = signal<{ lat: number; lng: number; label: string } | null>(null);
  // Public signals used in the template
  isLoading = signal(false);
// Flag to temporarily disable map clicks
  private clicksDisabled = false;

  constructor() {
    // React to location changes coming from the search component
    effect(() => {
      const loc = this.locationService.selectedLocation();
      if (loc && this.map) {
        this.showLocation(loc.lat, loc.lng, loc.label,true);
      }
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }
 //center: [ 39.8282, -98.5795 ],
  private initMap() {

    this.map = L.map(this.mapContainer.nativeElement).setView([this.defaultLat, this.defaultLng], 4); // default USA

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 3,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Allow user to click on the map to pick a location
    this.map.on('click', async(e: L.LeafletMouseEvent) => {

      // Prevent new clicks while loading or waiting for confirmation
      if (this.clicksDisabled || this.isLoading() || this.pendingLocation()) {
        return;
      }
      const { lat, lng } = e.latlng;

      this.clicksDisabled = true;
      this.isLoading.set(true);
      this.pendingLocation.set(null);
// Temporary marker while we fetch the address
      this.placeMarker(lat, lng, 'Getting address...');

      try {
        const label = await this.reverseGeocode(lat, lng);
        this.pendingLocation.set({ lat, lng, label });
        this.placeMarker(lat, lng, label); // update popup text
      } catch (err) {
        console.error(err);
        this.pendingLocation.set({
          lat,
          lng,
          label: `Selected location (${lat.toFixed(5)}, ${lng.toFixed(5)})`
        });
      } finally {
        this.isLoading.set(false);
        // Keep clicks disabled until user confirms or cancels
      }
    });
    // If a location was already selected before navigating here
    const existing = this.locationService.selectedLocation();
    if (existing) {
      this.showLocation(existing.lat, existing.lng, existing.label,true);
    }
  }


  /** Places / updates the marker (used for both temporary & confirmed) */
  private placeMarker(lat: number, lng: number, label: string) {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.marker.bindPopup(`<b>${label}</b>`).openPopup();

    // Lower zoom level (change 13 to your preference)
    this.map.setView([lat, lng], 13);
  }

/** Final confirmed location (no confirmation panel) */
  private showConfirmedLocation(lat: number, lng: number, label: string) {
    this.pendingLocation.set(null);
    this.isLoading.set(false);
    this.clicksDisabled = false;
    this.placeMarker(lat, lng, label);
  }

  private showLocation(lat: number, lng: number, label: string, confirmed: boolean) {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.marker.bindPopup(label).openPopup();
    this.map.setView([lat, lng], 12);

    if (confirmed) {
      // Final confirmed location – simple popup
      this.marker.bindPopup(`<b>${label}</b>`).openPopup();
    } else {
      // Temporary – popup with Confirm button
      const popupContent = `
        <div style="min-width:180px">
          <b>${label}</b><br><br>
          <button id="confirm-location-btn"
                  style="padding:6px 12px; background:#1976d2; color:white; border:none; border-radius:4px; cursor:pointer">
            Confirm this location
          </button>
        </div>
      `;

      this.marker.bindPopup(popupContent).openPopup();

      // Attach click handler after the popup is open
      setTimeout(() => {
        const btn = document.getElementById('confirm-location-btn');
        if (btn) {
          btn.onclick = () => this.confirmLocation();
        }
      }, 100);
    }
  }

/** User clicked Confirm */
  confirmLocation() {
    const pending = this.pendingLocation();
    if (!pending) return;

    this.locationService.setLocation(pending);
    this.showConfirmedLocation(pending.lat, pending.lng, pending.label);
  }


  /** User clicked Cancel */
  cancelLocation() {
    this.pendingLocation.set(null);
    this.isLoading.set(false);
    this.clicksDisabled = false;

    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }

    // Optional: go back to default view
    // this.map.setView([this.defaultLat, this.defaultLng], 4);
  }
/** Reverse geocoding with Nominatim (free, no API key) */
  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          // Nominatim requires a valid User-Agent
          'User-Agent': 'MyAngularApp/1.0 (contact@example.com)'
        }
      });

      if (!response.ok) throw new Error('Reverse geocoding failed');

      const data = await response.json();
      return data.display_name || `Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    } catch (err) {
      console.error(err);
      return `Selected location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
