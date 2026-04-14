import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-guide-medecin',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height:60vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;padding:60px 32px;text-align:center;">
      <div style="font-size:64px;">🏥</div>
      <h1 style="font-size:28px;font-weight:800;color:#0f172a;margin:0;">Guide pour trouver votre médecin</h1>
      <p style="font-size:16px;color:#64748b;max-width:500px;line-height:1.7;margin:0;">
        Cette page est en cours de construction. Elle vous guidera bientôt vers le médecin adapté à vos besoins.
      </p>
      <a routerLink="/patient/recherche" style="padding:12px 28px;background:#1a56db;color:white;border-radius:50px;text-decoration:none;font-size:14px;font-weight:700;margin-top:8px;">
        Rechercher un médecin maintenant →
      </a>
    </div>
  `
})
export class GuideMedecinComponent {}
