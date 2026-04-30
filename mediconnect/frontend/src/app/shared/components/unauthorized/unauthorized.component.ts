import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-unauthorized",
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;">
      <div style="font-size:64px;margin-bottom:24px;"></div>
      <h1 style="font-family:var(--font-heading);font-size:32px;font-weight:300;margin:0 0 12px;">Accès refusé</h1>
      <p style="color:var(--mc-muted);margin-bottom:28px;">Vous n'êtes pas autorisé à accéder à cette page.</p>
      <a routerLink="/auth/login" style="color:var(--mc-primary);text-decoration:none;font-weight:500;">← Retour à la connexion</a>
    </div>
  `,
})
export class UnauthorizedComponent {}
