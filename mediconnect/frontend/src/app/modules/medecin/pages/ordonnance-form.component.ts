import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-ordonnance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title"> Nouvelle Ordonnance</h1>
      <p class="page-subtitle">Rédigez une prescription médicale pour votre patient</p>
    </div>
    <div class="alert-success" *ngIf="successMsg()"> {{ successMsg() }}</div>
    <div class="alert-error" *ngIf="errorMsg()">❌ {{ errorMsg() }}</div>
    <form [formGroup]="form" (ngSubmit)="submit()" class="rx-form">
      <div class="rx-card">
        <h3 class="card-title"> Patient</h3>
        <div class="fg">
          <label class="fl">Sélectionner un patient *</label>
          <select class="fi" formControlName="patientId">
            <option value="">— Choisir un patient —</option>
            <option *ngFor="let p of patients()" [value]="p.patientId || p.id">
              {{ p.firstName }} {{ p.lastName }} ({{ p.email }})
            </option>
          </select>
          <span class="hint" *ngIf="loadingPatients()"> Chargement des patients...</span>
          <span class="hint" *ngIf="!loadingPatients() && patients().length === 0">
            Aucun patient trouvé — les patients apparaissent après un RDV confirmé
          </span>
        </div>
        <div class="fg"><label class="fl">Notes</label>
          <textarea class="fi" rows="2" formControlName="notes"></textarea></div>
      </div>
      <div class="rx-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 class="card-title" style="margin:0"> Médicaments</h3>
          <button type="button" class="btn-add" (click)="addMed()">+ Ajouter</button>
        </div>
        <div formArrayName="medications">
          <div class="med-row" *ngFor="let m of meds.controls; let i=index" [formGroupName]="i">
            <div class="med-grid">
              <div class="fg"><label class="fl">Nom *</label><input class="fi" type="text" formControlName="name" placeholder="Amoxicilline"/></div>
              <div class="fg"><label class="fl">Dosage *</label><input class="fi" type="text" formControlName="dosage" placeholder="500mg"/></div>
              <div class="fg"><label class="fl">Posologie *</label><input class="fi" type="text" formControlName="posology" placeholder="1 cp matin et soir"/></div>
              <div class="fg"><label class="fl">Durée (j)</label><input class="fi" type="number" formControlName="durationDays" min="1"/></div>
              <div class="fg"><label class="fl">Quantité</label><input class="fi" type="number" formControlName="quantity" min="1"/></div>
            </div>
            <button type="button" class="btn-rm" (click)="rmMed(i)" *ngIf="meds.length>1">✕</button>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:12px;justify-content:flex-end">
        <button type="button" class="btn-cancel" (click)="router.navigate(['/medecin/dashboard'])">Annuler</button>
        <button type="submit" class="btn-submit" [disabled]="form.invalid||saving()">
          {{ saving() ? '...' : " Créer l'ordonnance" }}</button>
      </div>
    </form>
  `,
  styles: [`
    .page-header{margin-bottom:24px} .page-title{font-size:26px;font-weight:700;color:#0f172a;margin:0 0 4px} .page-subtitle{color:#64748b;font-size:14px;margin:0}
    .alert-success{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:10px;padding:12px 16px;margin-bottom:16px}
    .alert-error{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:10px;padding:12px 16px;margin-bottom:16px}
    .rx-form{display:flex;flex-direction:column;gap:20px}
    .rx-card{background:white;border-radius:16px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid #e5e7eb}
    .card-title{font-size:15px;font-weight:700;color:#0f172a;margin:0 0 16px}
    .fg{display:flex;flex-direction:column;gap:4px;margin-bottom:14px}
    .fl{font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em}
    .fi{padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;color:#0f172a;outline:none;font-family:inherit;width:100%;box-sizing:border-box}
    .fi:focus{border-color:#1a56db}
    .hint{font-size:12px;color:#94a3b8}
    .med-row{background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:12px;position:relative;border:1px solid #e2e8f0}
    .med-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
    .btn-rm{position:absolute;top:12px;right:12px;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px}
    .btn-add{padding:8px 16px;background:#1a56db;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
    .btn-cancel{padding:10px 20px;background:white;color:#64748b;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
    .btn-submit{padding:10px 24px;background:#1a56db;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
    .btn-submit:disabled{opacity:.6;cursor:not-allowed}
  `]
})
export class OrdonnanceFormComponent implements OnInit {
  private fb   = inject(FormBuilder);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  router       = inject(Router);

  saving          = signal(false);
  successMsg      = signal('');
  errorMsg        = signal('');
  patients        = signal<any[]>([]);
  loadingPatients = signal(false);
  form!: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({ patientId: ['', Validators.required], notes: [''], medications: this.fb.array([this.mg()]) });
    this.loadPatients();
  }

  loadPatients() {
    this.loadingPatients.set(true);
    this.http.get<any>('/api/v1/medecins/my-patients').subscribe({
      next: res => {
        const outer = res?.data ?? res;
        const list = outer?.data ?? outer;
        this.patients.set(Array.isArray(list) ? list : []);
        this.loadingPatients.set(false);
      },
      error: () => this.loadingPatients.set(false)
    });
  }

  get meds(): FormArray { return this.form.get('medications') as FormArray; }
  mg(): FormGroup { return this.fb.group({ cip:[''], name:['',Validators.required], dosage:['',Validators.required], posology:['',Validators.required], durationDays:[7,[Validators.required,Validators.min(1)]], quantity:[1,[Validators.required,Validators.min(1)]], isSubstitutable:[true] }); }
  addMed() { this.meds.push(this.mg()); }
  rmMed(i: number) { this.meds.removeAt(i); }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true); this.errorMsg.set('');
    const user = this.auth.currentUser();
    this.http.post<any>('/api/v1/prescriptions', { ...this.form.value, doctorId: user?.id }).subscribe({
      next: () => { this.saving.set(false); this.successMsg.set('Ordonnance créée avec succès'); setTimeout(() => this.router.navigate(['/medecin/dashboard']), 2000); },
      error: err => { this.saving.set(false); const m = err?.error?.message; this.errorMsg.set(Array.isArray(m) ? m.join(', ') : m || 'Erreur'); }
    });
  }
}
