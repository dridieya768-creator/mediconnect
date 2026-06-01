import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-patient-dossier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-dossier.component.html',
  styleUrls: ['./patient-dossier.component.scss'],
})
export class PatientDossierComponent implements OnInit {
  private http = inject(HttpClient);

  loading   = signal(true);
  saving    = signal(false);
  uploading = signal(false);
  editing   = signal(false);
  patient   = signal<any>(null);
  successMsg = signal<string|null>(null);
  errorMsg   = signal<string|null>(null);

  allergies    = signal<string[]>([]);
  maladies     = signal<string[]>([]);
  medicaments  = signal<string[]>([]);
  documents    = signal<any[]>([]);
  observations = signal<any[]>([]);
  historique   = signal<any[]>([]);

  accesList     = signal<any[]>([]);
  medecinsList  = signal<any[]>([]);
  showAccesForm = signal(false);
  editingAcces  = signal<any>(null);
  savingAcces   = signal(false);
  newAcces: any = { medecinId: '', niveauAcces: 'LECTURE', dateExpiration: '', permissions: { allergies: false, documents: false, observations: false } };

  showLienForm   = signal(false);
  generatingLien = signal(false);
  lienGenere     = signal<{ lien: string; expiresAt: string } | null>(null);
  copie          = signal(false);
  lienDureeHeures = 48;
  lienPerms = { allergies: true, maladiesChroniques: true, medicamentsActuels: true, documents: false, observations: false };

  newAllergie = ''; newMaladie = ''; newMedicament = '';
  form: any = {};
  groupes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any>('/api/v1/patients/me').subscribe({
      next: res => {
  const outer = res?.data ?? res;
  const p = outer?.data ?? outer;
  console.log('PATIENT object:', p);
  console.log('allergies field:', p?.allergies);
  console.log('groupeSanguin:', p?.groupeSanguin);
  this.patient.set(p);
        this.allergies.set(this.parseList(p?.allergies));
        this.maladies.set(this.parseList(p?.maladiesChroniques));
        this.medicaments.set(this.parseList(p?.medicamentsActuels));
        this.documents.set(this.parseJson(p?.documents) ?? []);
        this.loading.set(false);

        if (p?.id) {
          console.log('Patient ID:', p.id);
          this.http.get<any>(`/api/v1/patients/${p.id}/observations-history`).subscribe({
            next: obsRes => {
              const list = Array.isArray(obsRes) ? obsRes : Array.isArray(obsRes?.data) ? obsRes.data : [];
              this.observations.set(list);
            },
            error: () => this.observations.set([])
          });

          this.http.get<any>(`/api/v1/dossier-medical/${p.id}/historique?roleAuteur=PHARMACIEN`).subscribe({
            next: histRes => {
              console.log('Historique API response:', histRes);
              const histList = Array.isArray(histRes) ? histRes : Array.isArray(histRes?.data) ? histRes.data : [];
              console.log('Historique list:', histList);
              const formattedHistory = histList.map((h: any) => this.formatDeliveryHistory(h));
              console.log('Formatted history:', formattedHistory);
              this.historique.set(formattedHistory);
            },
            error: (err) => {
              console.error('Erreur lors du chargement de l\'historique:', err);
              this.historique.set([]);
            }
          });

          this.http.get<any>(`/api/v1/dossier-medical/${p.id}/acces`).subscribe({
            next: r => this.accesList.set(Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : []),
            error: () => {}
          });

          this.http.get<any>('/api/v1/appointments/my-doctors').subscribe({
            next: r => this.medecinsList.set(Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : []),
            error: () => {}
          });
        }
      },
      error: () => this.loading.set(false)
    });
  }

  startEdit() {
    const p = this.patient();
    this.form = {
      groupeSanguin: p?.groupeSanguin ?? '',
      dateNaissance: p?.dateNaissance ? p.dateNaissance.substring(0,10) : '',
      sexe: p?.sexe ?? '',
      ville: p?.ville ?? '',
      telephone: p?.telephone ?? '',
      nss: p?.nss ?? '',
      allergies: [...this.allergies()],
      maladiesChroniques: [...this.maladies()],
      medicamentsActuels: [...this.medicaments()],
    };
    this.editing.set(true);
  }

  cancelEdit() { this.editing.set(false); }

  save() {
    this.saving.set(true);
    this.errorMsg.set(null);
    const payload: any = { ...this.form };
    if (!payload.groupeSanguin) delete payload.groupeSanguin;
    if (!payload.sexe) delete payload.sexe;
    payload.allergies = Array.isArray(payload.allergies) ? payload.allergies : [];
    payload.maladiesChroniques = Array.isArray(payload.maladiesChroniques) ? payload.maladiesChroniques : [];
    payload.medicamentsActuels = Array.isArray(payload.medicamentsActuels) ? payload.medicamentsActuels : [];
    payload.documents = JSON.stringify(this.documents());

    this.http.patch<any>(`/api/v1/patients/${this.patient()?.id}`, payload).subscribe({
      next: () => {
        this.saving.set(false); this.editing.set(false);
        this.successMsg.set('Dossier mis à jour');
        setTimeout(() => this.successMsg.set(null), 3000);
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message || 'Erreur lors de la sauvegarde');
        setTimeout(() => this.errorMsg.set(null), 4000);
      }
    });
  }

  add(arr: string[], field: string) {
    const val = (this as any)[field]?.trim();
    if (val && !arr.includes(val)) { arr.push(val); (this as any)[field] = ''; }
  }
  rm(arr: string[], i: number) { arr.splice(i, 1); }

  removeDoc(i: number) {
    const docs = [...this.documents()];
    docs.splice(i, 1);
    this.documents.set(docs);
    this.http.patch<any>(`/api/v1/patients/${this.patient()?.id}`, { documents: JSON.stringify(docs) }).subscribe();
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.uploadFiles(Array.from(input.files));
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files ?? []).filter(f => f.type === 'application/pdf');
    if (files.length) this.uploadFiles(files);
  }

  uploadFiles(files: File[]) {
    this.uploading.set(true);
    let done = 0;
    const newDocs: any[] = [];
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        this.errorMsg.set(`${file.name} dépasse 10MB`);
        done++;
        if (done === files.length) this.uploading.set(false);
        return;
      }
      const fd = new FormData();
      fd.append('file', file);
      this.http.post<any>('/api/v1/upload/document', fd).subscribe({
        next: res => {
          const url = res?.data?.url || res?.url;
          if (url) newDocs.push({ name: file.name, url, uploadedAt: new Date().toISOString() });
          done++;
          if (done === files.length) {
            const all = [...this.documents(), ...newDocs];
            this.documents.set(all);
            this.uploading.set(false);
            this.http.patch<any>(`/api/v1/patients/${this.patient()?.id}`, { documents: JSON.stringify(all) }).subscribe({
              next: () => { this.successMsg.set('Document(s) ajouté(s)'); setTimeout(() => this.successMsg.set(null), 3000); }
            });
          }
        },
        error: () => { done++; if (done === files.length) this.uploading.set(false); }
      });
    });
  }

  niveauLabel(n: string): string {
    return ({ LECTURE: 'Lecture', LECTURE_ECRITURE: 'Lecture + Écriture', ACCES_COMPLET: 'Accès complet' } as any)[n] || n;
  }

  openNewAcces() {
    this.editingAcces.set(null);
    this.newAcces = { medecinId: '', niveauAcces: 'LECTURE', dateExpiration: '', permissions: { allergies: false, documents: false, observations: false } };
    this.showAccesForm.set(true);
  }

  openEditAcces(a: any) {
    this.editingAcces.set(a);
    this.newAcces = {
      medecinId: a.medecinId,
      niveauAcces: a.niveauAcces,
      dateExpiration: a.dateExpiration ? a.dateExpiration.substring(0, 10) : '',
      permissions: { ...({ allergies: false, documents: false, observations: false }), ...(a.permissions ?? {}) },
    };
    this.showAccesForm.set(true);
  }

  saveAcces() {
    const patientId = this.patient()?.id;
    if (!patientId) return;
    this.savingAcces.set(true);
    const editing = this.editingAcces();
    const payload = {
      niveauAcces: this.newAcces.niveauAcces,
      dateExpiration: this.newAcces.dateExpiration || null,
      permissions: this.newAcces.permissions,
    };
    const req = editing
      ? this.http.patch<any>(`/api/v1/dossier-medical/${patientId}/acces/${editing.id}`, payload)
      : this.http.post<any>(`/api/v1/dossier-medical/${patientId}/acces`, { ...payload, medecinId: this.newAcces.medecinId });

    req.subscribe({
      next: () => {
        this.savingAcces.set(false);
        this.showAccesForm.set(false);
        this.editingAcces.set(null);
        this.http.get<any>(`/api/v1/dossier-medical/${patientId}/acces`).subscribe({
          next: r => this.accesList.set(Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : []),
          error: () => {}
        });
      },
      error: (err) => {
        this.savingAcces.set(false);
        this.errorMsg.set(err?.error?.message || 'Erreur lors de la sauvegarde');
        setTimeout(() => this.errorMsg.set(null), 3000);
      }
    });
  }

  revoquerAcces(a: any) {
    const patientId = this.patient()?.id;
    if (!patientId) return;
    this.http.delete<any>(`/api/v1/dossier-medical/${patientId}/acces/${a.id}`).subscribe({
      next: () => this.accesList.update(list => list.map(x => x.id === a.id ? { ...x, actif: false } : x)),
      error: () => {}
    });
  }

  restaurerAcces(a: any) {
    const patientId = this.patient()?.id;
    if (!patientId) return;
    this.http.patch<any>(`/api/v1/dossier-medical/${patientId}/acces/${a.id}`, { actif: true }).subscribe({
      next: () => this.accesList.update(list => list.map(x => x.id === a.id ? { ...x, actif: true } : x)),
      error: () => {}
    });
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  genererLien() {
    const patientId = this.patient()?.id;
    if (!patientId) return;
    this.generatingLien.set(true);
    this.http.post<any>('/api/v1/dossier-medical/partage/generer', {
      permissions: this.lienPerms,
      dureeHeures: Number(this.lienDureeHeures),
    }).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        this.lienGenere.set({ lien: data.lien, expiresAt: data.expiresAt });
        this.generatingLien.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Erreur lors de la génération du lien');
        this.generatingLien.set(false);
        setTimeout(() => this.errorMsg.set(null), 3000);
      }
    });
  }

  copierLien() {
    const lien = this.lienGenere()?.lien;
    if (!lien) return;
    navigator.clipboard.writeText(lien).then(() => {
      this.copie.set(true);
      setTimeout(() => this.copie.set(false), 2500);
    });
  }

  formatDeliveryHistory(historique: any): any {
    // Check if this is a pharmacy delivery entry
    if (historique.roleAuteur !== 'PHARMACIEN') return historique;
    
    // Extract delivery information from champsModifies or snapshotApres
    let delivranceData = null;
    
    // Try to get from champsModifies first (old format)
    if (historique.champsModifies?.delivrance_pharmacie?.apres) {
      delivranceData = historique.champsModifies.delivrance_pharmacie.apres;
    }
    // Try to get from snapshotApres (new format)
    else if (historique.snapshotApres?.delivrance_pharmacie) {
      delivranceData = historique.snapshotApres.delivrance_pharmacie;
    }
    
    if (!delivranceData) return historique;

    return {
      ...historique,
      pharmacieNom: delivranceData.pharmacieNom || 'Pharmacie',
      ordonnanceId: delivranceData.qrOrdCode || historique.commentaire,
      details: `Délivrance de ${delivranceData.medicaments?.length || 0} médicament(s)`,
      medicaments: delivranceData.medicaments?.map((m: any) => 
        `${m.nom} (${m.quantiteDelivree}/${m.quantitePrescrite || m.quantiteDelivree})`
      ) || [],
      dateCreation: historique.createdAt
    };
  }

  private parseList(val: any): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  private parseJson(val: any): any[] | null {
    if (!val) return null;
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return null; }
  }
}
