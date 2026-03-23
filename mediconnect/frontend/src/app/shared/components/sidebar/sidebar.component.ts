import { Component, Input, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "@core/services/auth.service";

export interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
  badgeColor?: string;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent {
  @Input() portalName = "Portail";
  @Input() portalIcon = "🏥";
  @Input() brandColor = "#0d9488";
  @Input() navSections: NavSection[] = [];
  @Input() establishmentName?: string;

  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}
