import { Routes } from '@angular/router';
import { LeafletMapComponent } from './features/dashboard/components/leaflet-map/leaflet-map.component';
import { MapSearchComponent } from './features/dashboard/components/map-search/map-search.component';
import { SiteCardComponent } from './features/dashboard/components/site-card/site-card.component';
import { SafetyDashboardComponent } from './features/dashboard/components/safety-dashboard/safety-dashboard.component';

export const routes: Routes = [
      {path:'', component:SafetyDashboardComponent},
      { path: 'search', component: MapSearchComponent },
      { path: 'mapView', component:  LeafletMapComponent},
       { path: 'test', component: SiteCardComponent },

];
