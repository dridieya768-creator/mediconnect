import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent, NavSection } from "@shared/components/sidebar/sidebar.component";

@Component({
  selector: "app-pharmacie-layout",
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <app-sidebar
      portalName="Portail Pharmacie"
      portalIcon="💊"
      brandColor="#059669"
      [navSections]="navSections"
    />
    <div class="page-container">
      <router-outlet />
    </div>
  `,
})
export class PharmacieLayoutComponent {
  navSections: NavSection[] = [
    {
      label: "Principal",
      items: [
        { icon: "🏠", label: "Tableau de bord", route: "/pharmacie/dashboard" },
        { icon: "📲", label: "Scanner Ordonnance", route: "/pharmacie/scan" },
        { icon: "📦", label: "Stock", route: "/pharmacie/stock" },
      ],
    },
  ];
}
