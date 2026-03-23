import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent, NavSection } from "@shared/components/sidebar/sidebar.component";

@Component({
  selector: "app-radiologie-layout",
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <app-sidebar
      portalName="Portail Radiologie"
      portalIcon="🔬"
      brandColor="#0891b2"
      [navSections]="navSections"
    />
    <div class="page-container">
      <router-outlet />
    </div>
  `,
})
export class RadiologieLayoutComponent {
  navSections: NavSection[] = [
    {
      label: "Principal",
      items: [
        { icon: "🏠", label: "Tableau de bord", route: "/radiologie/dashboard" },
        { icon: "🩻", label: "PACS Viewer", route: "/radiologie/pacs" },
        { icon: "📋", label: "Comptes-rendus", route: "/radiologie/rapports" },
      ],
    },
  ];
}
