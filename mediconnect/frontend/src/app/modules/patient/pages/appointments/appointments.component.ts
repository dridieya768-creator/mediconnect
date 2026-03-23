import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-appointments",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Appointments</h1>
      <p class="page-subtitle">Module en cours de développement</p>
    </div>
    <div class="mc-card">
      <div class="mc-card-body" style="text-align: center; padding: 60px; color: var(--mc-muted);">
        <div style="font-size: 48px; margin-bottom: 16px;">🚧</div>
        <div style="font-size: 16px;">Ce module sera disponible prochainement</div>
      </div>
    </div>
  `,
})
export class PatientAppointmentsComponent {}
