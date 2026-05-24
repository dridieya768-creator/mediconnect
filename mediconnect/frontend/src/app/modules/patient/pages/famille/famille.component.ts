import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FamilyMembersService } from '@core/services/family-members.service';
import { FamilyMember, CreateFamilyMemberPayload, Relation, RELATIONS_AVEC_DOCUMENTS } from '@core/models/family-member.model';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const RELATION_LABELS: Record<Relation, string> = {
  ENFANT:   'Enfant',
  CONJOINT: 'Conjoint(e)',
  PARENT:   'Parent',
  AUTRE:    'Autre',
};

@Component({
  selector: 'app-famille',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './famille.component.html',
  styleUrls: ['./famille.component.scss'],
})
export class FamilleComponent implements OnInit {
  private svc = inject(FamilyMembersService);

  members        = signal<FamilyMember[]>([]);
  isLoading      = signal(true);
  isSaving       = signal(false);
  showModal      = signal(false);
  editingMember  = signal<FamilyMember | null>(null);
  deletingMember = signal<FamilyMember | null>(null);
  docsModal      = signal<FamilyMember | null>(null);
  successMsg     = signal<string | null>(null);
  errorMsg       = signal<string | null>(null);

  form: CreateFamilyMemberPayload = this.emptyForm();
  allergiesInput = '';

  docMembreFile:  File | null = null;
  docPatientFile: File | null = null;

  readonly bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  ngOnInit() { this.load(); }

  load() {
    this.isLoading.set(true);
    this.svc.getAll().pipe(catchError(() => of([]))).subscribe(list => {
      this.members.set(list);
      this.isLoading.set(false);
    });
  }

  needsDocs(relation: Relation): boolean {
    return RELATIONS_AVEC_DOCUMENTS.includes(relation);
  }

  openAdd() {
    this.form = this.emptyForm();
    this.allergiesInput = '';
    this.docMembreFile  = null;
    this.docPatientFile = null;
    this.editingMember.set(null);
    this.showModal.set(true);
  }

  openEdit(m: FamilyMember) {
    this.form = {
      prenom: m.prenom, nom: m.nom, dateNaissance: m.dateNaissance,
      relation: m.relation, sexe: m.sexe,
      nss: m.nss ?? '', groupeSanguin: m.groupeSanguin ?? '',
    };
    this.allergiesInput = (m.allergies ?? []).join(', ');
    this.docMembreFile  = null;
    this.docPatientFile = null;
    this.editingMember.set(m);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingMember.set(null);
  }

  openDocs(m: FamilyMember) {
    this.docsModal.set(m);
    this.docMembreFile  = null;
    this.docPatientFile = null;
  }

  closeDocsModal() {
    this.docsModal.set(null);
    this.docMembreFile  = null;
    this.docPatientFile = null;
  }

  onDocMembreChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.docMembreFile = input.files?.[0] ?? null;
  }

  onDocPatientChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.docPatientFile = input.files?.[0] ?? null;
  }

  getDocUrl(filePath: string): string {
    if (!filePath) return '';
    const normalized = filePath.replace(/\\/g, '/');
    const parts = normalized.split('/');
    const idx = parts.indexOf('family-docs');
    if (idx >= 0) return '/uploads/' + parts.slice(idx).join('/');
    return '/uploads/family-docs/' + parts[parts.length - 1];
  }

  saveDocuments() {
    const m = this.docsModal();
    if (!m || (!this.docMembreFile && !this.docPatientFile)) return;
    this.isSaving.set(true);
    this.svc.uploadDocuments(m.id, this.docMembreFile ?? undefined, this.docPatientFile ?? undefined)
      .pipe(catchError(err => {
        this.showError(err?.error?.message || 'Erreur lors de l\'envoi des documents');
        this.isSaving.set(false);
        return of(null);
      }))
      .subscribe(updated => {
        if (!updated) return;
        this.isSaving.set(false);
        this.members.update(list => list.map(item => item.id === updated.id ? updated : item));
        this.docsModal.set(updated);
        this.docMembreFile  = null;
        this.docPatientFile = null;
        this.showSuccess('Documents enregistrés avec succès');
      });
  }

  save() {
    if (!this.form.prenom || !this.form.nom || !this.form.dateNaissance || !this.form.relation || !this.form.sexe) {
      this.showError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    this.isSaving.set(true);
    const payload: CreateFamilyMemberPayload = {
      ...this.form,
      allergies: this.allergiesInput ? this.allergiesInput.split(',').map(a => a.trim()).filter(Boolean) : [],
      nss: this.form.nss || undefined,
      groupeSanguin: this.form.groupeSanguin || undefined,
    };

    const editing = this.editingMember();
    const obs = editing ? this.svc.update(editing.id, payload) : this.svc.create(payload);

    obs.pipe(catchError(err => {
      this.showError(err?.error?.message || 'Erreur lors de l\'enregistrement');
      this.isSaving.set(false);
      return of(null);
    })).subscribe(result => {
      if (!result) return;
      if ((this.docMembreFile || this.docPatientFile) && this.needsDocs(result.relation)) {
        this.svc.uploadDocuments(result.id, this.docMembreFile ?? undefined, this.docPatientFile ?? undefined)
          .pipe(catchError(() => of(result)))
          .subscribe(() => {
            this.isSaving.set(false);
            this.docMembreFile  = null;
            this.docPatientFile = null;
            this.closeModal();
            this.load();
            this.showSuccess(editing ? 'Proche modifié avec succès' : 'Proche ajouté avec succès');
          });
      } else {
        this.isSaving.set(false);
        this.closeModal();
        this.load();
        this.showSuccess(editing ? 'Proche modifié avec succès' : 'Proche ajouté avec succès');
      }
    });
  }

  confirmDelete(m: FamilyMember) { this.deletingMember.set(m); }

  doDelete() {
    const m = this.deletingMember();
    if (!m) return;
    this.isSaving.set(true);
    this.svc.remove(m.id).pipe(catchError(() => {
      this.showError('Erreur lors de la suppression');
      this.isSaving.set(false);
      return of(null);
    })).subscribe(() => {
      this.isSaving.set(false);
      this.deletingMember.set(null);
      this.load();
      this.showSuccess('Proche supprimé');
    });
  }

  getInitials(m: FamilyMember): string {
    return `${m.prenom[0] ?? ''}${m.nom[0] ?? ''}`.toUpperCase();
  }

  getRelationLabel(r: Relation): string {
    return RELATION_LABELS[r] ?? r;
  }

  getAge(dateNaissance: string): number {
    const diff = Date.now() - new Date(dateNaissance).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  private emptyForm(): CreateFamilyMemberPayload {
    return { prenom: '', nom: '', dateNaissance: '', relation: 'ENFANT', sexe: 'M' };
  }

  private showSuccess(msg: string) {
    this.successMsg.set(msg);
    this.errorMsg.set(null);
    setTimeout(() => this.successMsg.set(null), 4000);
  }

  private showError(msg: string) {
    this.errorMsg.set(msg);
    setTimeout(() => this.errorMsg.set(null), 5000);
  }
}
