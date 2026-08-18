import { Routes } from '@angular/router';
import { LeafletMapComponent } from './features/dashboard/components/leaflet-map/leaflet-map.component';
import { MapSearchComponent } from './features/dashboard/components/map-search/map-search.component';

export const routes: Routes = [
      { path: '', component: MapSearchComponent },
      { path: 'mapView', component:  LeafletMapComponent},

];
