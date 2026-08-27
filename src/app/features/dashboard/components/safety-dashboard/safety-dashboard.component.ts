import { Component, OnInit } from '@angular/core';
import { MapSearchComponent } from "../map-search/map-search.component";

@Component({
  selector: 'app-safety-dashboard',
  imports: [MapSearchComponent],
  templateUrl: './safety-dashboard.component.html',
  styleUrl: './safety-dashboard.component.scss',
})
export class SafetyDashboardComponent implements OnInit {

  
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }


}
