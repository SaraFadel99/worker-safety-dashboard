import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {  SafetyCardState } from '../../../../core/models/safety-card.model';
import { SafetyCardResponse } from '../../../../core/models/SafetyCardResponse';


  type RiskLevel = 'normal' | 'caution' | 'extreme-caution' | 'danger' | 'extreme-danger';

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



  onRetry(): void {
    this.retry.emit();
  }


  badgeClass(heatIndexF: number | string): RiskLevel {
    const value = typeof heatIndexF === 'number' ? heatIndexF : Number(heatIndexF);

    if (!Number.isFinite(value)) {
      const badge = String(heatIndexF ?? '').toLowerCase().replace(/[^a-z]/g, '');

      if (badge.includes('normal')) return 'normal';
      if (badge.includes('caution')) return 'caution';
      if (badge.includes('extremecaution')) return 'extreme-caution';
      if (badge.includes('danger')) return 'danger';
      if (badge.includes('extremedanger')) return 'extreme-danger';

      return 'normal';
    }

    if (value < 80) return 'normal';
    if (value < 90) return 'caution';
    if (value < 103) return 'extreme-caution';
    if (value < 125) return 'danger';
    return 'extreme-danger';
  }

  riskIcon(heatIndexF: number | string): 'warning' | 'info' | 'check' {
    const level = this.badgeClass(heatIndexF);

    if (level === 'normal') return 'check';
    if (level === 'caution') return 'info';
    return 'warning';
  }
}
