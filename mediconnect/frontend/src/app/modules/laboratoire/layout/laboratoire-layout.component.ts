import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent, NavSection } from "@shared/components/sidebar/sidebar.component";

@Component({
  selector: "app-laboratoire-layout",
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <app-sidebar
      portalName="Portail Laboratoire"
      portalIcon="🧪"
      brandColor="#7c3aed"
      [navSections]="navSections"
    />
    <div class="page-container">
      <router-outlet />
    </div>
  `,
})
export class LaboratoireLayoutComponent {
  navSections: NavSection[] = [
    {
      label: "Principal",
      items: [
        { icon: "🏠", label: "Tableau de bord", route: "/laboratoire/dashboard" },
        { icon: "🔄", label: "File d attente", route: "/laboratoire/queue" },
        { icon: "📊", label: "Resultats", route: "/laboratoire/resultats" },
      ],
    },
  ];
}
