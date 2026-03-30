import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent, NavSection } from "@shared/components/sidebar/sidebar.component";

@Component({
  selector: "app-patient-layout",
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <app-sidebar
      portalName="Portail Patient"
      portalIcon="👤"
      brandColor="#1a56db"
      profileRoute="/patient/profil"
      [navSections]="navSections"
    />
    <div class="page-container">
      <router-outlet />
    </div>
  `,
})
export class PatientLayoutComponent {
  navSections: NavSection[] = [
    {
      label: "Principal",
      items: [
        { icon: "🏠", label: "Tableau de bord", route: "/patient/dashboard" },
        { icon: "📅", label: "Mes Rendez-vous", route: "/patient/appointments", badge: 2 },
        { icon: "📋", label: "Mon Dossier", route: "/patient/dossier" },
        { icon: "💊", label: "Mes Ordonnances", route: "/patient/prescriptions" },
      ],
    },
    {
      label: "Résultats",
      items: [
        { icon: "🧪", label: "Analyses", route: "/patient/analyses" },
        { icon: "🔬", label: "Imagerie", route: "/patient/imagerie" },
        { icon: "📄", label: "Documents", route: "/patient/documents" },
      ],
    },
    {
      label: "Services",
      items: [
        { icon: "🔍", label: "Trouver un Médecin", route: "/patient/recherche" },
        { icon: "🤝", label: "Partager Dossier", route: "/patient/partage" },
        { icon: "👨‍👩‍👧", label: "Compte Famille", route: "/patient/famille" },
        { icon: "🔔", label: "Notifications", route: "/patient/notifications", badge: 3 },
      ],
    },
  ];
}
