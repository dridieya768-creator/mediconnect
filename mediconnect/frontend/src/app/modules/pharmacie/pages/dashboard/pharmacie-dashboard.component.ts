import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-pharmacie-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1 class="page-title">💊 Tableau de bord Pharmacie</h1>
      <p class="page-subtitle">Module en cours de développement</p>
    </div>
    <div class="mc-card">
      <div class="mc-card-body" style="text-align:center; padding:60px; color:var(--mc-muted);">
        <div style="font-size:56px; margin-bottom:16px;">🚧</div>
        <div style="font-size:16px; font-weight:500;">Ce module sera disponible prochainement</div>
        <div style="font-size:13px; margin-top:8px;">Retourner au <a routerLink="dashboard" style="color:var(--mc-primary)">tableau de bord</a></div>
      </div>
    </div>
  `,
})
export class PharmacieDashboardComponent {}
