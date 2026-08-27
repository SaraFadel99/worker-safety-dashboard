import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {  SafetyCardState } from '../../../../core/models/safety-card.model';
import { SafetyCardResponse } from '../../../../core/models/SafetyCardResponse';

@Component({
  selector: 'app-site-card',
  imports: [CommonModule],
  templateUrl: './site-card.component.html',
  styleUrl: './site-card.component.scss',
})
export class SiteCardComponent {
    /** idle: nothing picked yet. loading: chain is running. success: data ready. error: chain failed. */
  @Input() state: SafetyCardState = 'idle';
  @Input() data: SafetyCardResponse | null = null;
  @Input() errorMessage = 'We couldn\'t get a reading for this site. Try again.';

  @Output() retry = new EventEmitter<void>();


badgeClass(badge: string): 'high' | 'moderate' | 'low' {
  const b = badge.toLowerCase();
  if (b.includes('high')) return 'high';
  if (b.includes('moderate') || b.includes('medium')) return 'moderate';
  return 'low';
}

riskIcon(badge: string): 'warning' | 'info' | 'check' {
  const cls = this.badgeClass(badge);
  return cls === 'high' ? 'warning' : cls === 'moderate' ? 'info' : 'check';
}

  onRetry(): void {
    this.retry.emit();
  }
}
