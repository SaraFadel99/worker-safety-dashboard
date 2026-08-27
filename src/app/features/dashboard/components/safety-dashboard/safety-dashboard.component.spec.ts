import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SafetyDashboardComponent } from './safety-dashboard.component';

describe('SafetyDashboardComponent', () => {
  let component: SafetyDashboardComponent;
  let fixture: ComponentFixture<SafetyDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SafetyDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SafetyDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
