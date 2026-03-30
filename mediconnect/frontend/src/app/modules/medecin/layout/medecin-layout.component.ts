import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";        
import { SidebarComponent, NavSection } from "@shared/components/sidebar/sidebar.component";

@Component({
  selector: "app-medecin-layout",
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <app-sidebar
      portalName="Portail Médecin"
      portalIcon="👨‍⚕️"
      brandColor="#1a56db"
      [navSections]="navSections"
    />
    <div class="page-container">
      <router-outlet />
    </div>
  `,
})
export class MedecinLayoutComponent {
  navSections: NavSection[] = [
    {
      label: "Principal",
      items: [
        { icon: "📊", label: "Tableau de bord", route: "/medecin/dashboard" },
        { icon: "📅", label: "Planning", route: "/medecin/planning" },
        { icon: "👥", label: "Patients", route: "/medecin/patients" },
        { icon: "💊", label: "Prescriptions", route: "/medecin/prescriptions" },
      ],
    },
    {
      label: "Mon Compte",
      items: [
        { icon: "👨‍⚕️", label: "Mon Profil", route: "/medecin/profil" },
      ],
    },
  ];
}