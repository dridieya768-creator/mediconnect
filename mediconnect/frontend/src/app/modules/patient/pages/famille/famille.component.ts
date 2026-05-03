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
  template: `
    <div class="famille-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Ma famille</h1>
          <p class="page-subtitle">Gérez les profils de vos proches pour prendre des rendez-vous en leur nom</p>
        </div>
        <button class="btn-add" (click)="openAdd()">+ Ajouter un proche</button>
      </div>

      <div class="alert-success" *ngIf="successMsg()">{{ successMsg() }}</div>
      <div class="alert-error"   *ngIf="errorMsg()">{{ errorMsg() }}</div>

      <div class="loading" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <div class="members-grid" *ngIf="!isLoading()">
        <div class="empty-state" *ngIf="members().length === 0">
          <div style="font-size:56px;margin-bottom:12px"></div>
          <p>Aucun proche ajouté</p>
          <button class="btn-add" (click)="openAdd()">Ajouter un proche</button>
        </div>

        <div class="member-card" *ngFor="let m of members()">
          <div class="member-avatar">{{ getInitials(m) }}</div>
          <div class="member-info">
            <div class="member-name">{{ m.prenom }} {{ m.nom }}</div>
            <div class="member-relation">{{ getRelationLabel(m.relation) }}</div>
            <div class="member-meta">
              <span>{{ m.sexe === 'M' ? '♂ Masculin' : '♀ Féminin' }}</span>
              <span *ngIf="m.dateNaissance">· {{ getAge(m.dateNaissance) }} ans</span>
              <span *ngIf="m.groupeSanguin" class="blood-badge">{{ m.groupeSanguin }}</span>
            </div>
            <div class="member-allergies" *ngIf="m.allergies && m.allergies.length > 0">
              ⚠ Allergies : {{ m.allergies.join(', ') }}
            </div>

            <!-- Statut documents (seulement ENFANT/CONJOINT/PARENT) -->
            <div class="docs-status" *ngIf="needsDocs(m.relation)">
              <span class="doc-badge" [class.ok]="m.docMembrePath" [class.missing]="!m.docMembrePath">
                {{ m.docMembrePath ? '✓' : '✗' }} مضمون ولادة ({{ getRelationLabel(m.relation) }})
              </span>
              <span class="doc-badge" [class.ok]="m.docPatientPath" [class.missing]="!m.docPatientPath">
                {{ m.docPatientPath ? '✓' : '✗' }} مضمون ولادة (vous)
              </span>
            </div>
          </div>
          <div class="member-actions">
            <button class="btn-edit" (click)="openEdit(m)" title="Modifier">✏</button>
            <button class="btn-docs" (click)="openDocs(m)" title="Documents" *ngIf="needsDocs(m.relation)"></button>
            <button class="btn-delete" (click)="confirmDelete(m)" title="Supprimer">🗑</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL Ajout / Édition -->
    <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ editingMember() ? 'Modifier le proche' : 'Ajouter un proche' }}</h2>
          <button class="btn-close" (click)="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Prénom *</label>
              <input type="text" [(ngModel)]="form.prenom" placeholder="Prénom" />
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" [(ngModel)]="form.nom" placeholder="Nom" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date de naissance *</label>
              <input type="date" [(ngModel)]="form.dateNaissance" />
            </div>
            <div class="form-group">
              <label>Sexe *</label>
              <select [(ngModel)]="form.sexe">
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Relation *</label>
            <select [(ngModel)]="form.relation">
              <option value="ENFANT">Enfant</option>
              <option value="CONJOINT">Conjoint(e)</option>
              <option value="PARENT">Parent</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>NSS (optionnel)</label>
              <input type="text" [(ngModel)]="form.nss" placeholder="Numéro sécurité sociale" />
            </div>
            <div class="form-group">
              <label>Groupe sanguin (optionnel)</label>
              <select [(ngModel)]="form.groupeSanguin">
                <option value="">—</option>
                <option *ngFor="let g of bloodGroups" [value]="g">{{ g }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Allergies (optionnel, séparées par virgule)</label>
            <input type="text" [(ngModel)]="allergiesInput" placeholder="Ex: pénicilline, arachides" />
          </div>

          <!-- Documents justificatifs — uniquement pour ENFANT / CONJOINT / PARENT -->
          <div class="docs-section" *ngIf="needsDocs(form.relation)">
            <div class="docs-section-title"> Documents justificatifs (مضمون ولادة)</div>
            <p class="docs-section-hint">Ces documents permettent de vérifier le lien familial.</p>

            <div class="doc-upload-block">
              <div class="doc-upload-label">
                <span class="doc-num">1</span>
                <div>
                  <strong>مضمون ولادة</strong> de {{ form.prenom || getRelationLabel(form.relation) }}
                  <p class="doc-hint">Acte de naissance du {{ getRelationLabel(form.relation) | lowercase }}</p>
                </div>
                <span class="doc-status-icon" *ngIf="editingMember()?.docMembrePath && !docMembreFile"></span>
              </div>
              <div class="file-input-row">
                <label class="file-label" [class.has-file]="docMembreFile">
                  <input type="file" accept="application/pdf" (change)="onDocMembreChange($event)" hidden #docMembreInputInline />
                  <span (click)="docMembreInputInline.click()">
                    {{ docMembreFile ? docMembreFile.name : (editingMember()?.docMembrePath ? ' Remplacer' : '📎 Choisir un PDF') }}
                  </span>
                </label>
                <a *ngIf="editingMember()?.docMembrePath && !docMembreFile"
                   [href]="getDocUrl(editingMember()!.docMembrePath!)"
                   target="_blank" class="btn-view-doc">👁 Voir</a>
              </div>
            </div>

            <div class="doc-upload-block">
              <div class="doc-upload-label">
                <span class="doc-num">2</span>
                <div>
                  <strong>مضمون ولادة</strong> de vous-même
                  <p class="doc-hint">Votre acte de naissance pour prouver le lien familial</p>
                </div>
                <span class="doc-status-icon" *ngIf="editingMember()?.docPatientPath && !docPatientFile">✅</span>
              </div>
              <div class="file-input-row">
                <label class="file-label" [class.has-file]="docPatientFile">
                  <input type="file" accept="application/pdf" (change)="onDocPatientChange($event)" hidden #docPatientInputInline />
                  <span (click)="docPatientInputInline.click()">
                    {{ docPatientFile ? docPatientFile.name : (editingMember()?.docPatientPath ? ' Remplacer' : '📎 Choisir un PDF') }}
                  </span>
                </label>
                <a *ngIf="editingMember()?.docPatientPath && !docPatientFile"
                   [href]="getDocUrl(editingMember()!.docPatientPath!)"
                   target="_blank" class="btn-view-doc">👁 Voir</a>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" (click)="closeModal()">Annuler</button>
          <button class="btn-save" (click)="save()" [disabled]="isSaving()">
            {{ isSaving() ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL Documents justificatifs -->
    <div class="modal-overlay" *ngIf="docsModal()" (click)="closeDocsModal()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2> Documents justificatifs</h2>
          <button class="btn-close" (click)="closeDocsModal()">✕</button>
        </div>
        <div class="modal-body">
          <p class="docs-intro">
            Pour <strong>{{ docsModal()!.prenom }} {{ docsModal()!.nom }}</strong>
            ({{ getRelationLabel(docsModal()!.relation) }}), veuillez fournir :
          </p>

          <!-- Document 1 : مضمون ولادة du membre -->
          <div class="doc-upload-block">
            <div class="doc-upload-label">
              <span class="doc-num">1</span>
              <div>
                <strong>مضمون ولادة</strong> de {{ docsModal()!.prenom }}
                <p class="doc-hint">Acte de naissance ou document d'état civil du {{ getRelationLabel(docsModal()!.relation) | lowercase }}</p>
              </div>
              <span class="doc-status-icon" *ngIf="docsModal()!.docMembrePath">✅</span>
            </div>
            <div class="file-input-row">
              <label class="file-label" [class.has-file]="docMembreFile">
                <input type="file" accept="application/pdf" (change)="onDocMembreChange($event)" hidden #docMembreInput />
                <span (click)="docMembreInput.click()">
                  {{ docMembreFile ? docMembreFile.name : (docsModal()!.docMembrePath ? ' Remplacer le PDF' : '📎 Choisir un PDF') }}
                </span>
              </label>
              <a *ngIf="docsModal()!.docMembrePath && !docMembreFile"
                 [href]="getDocUrl(docsModal()!.docMembrePath!)"
                 target="_blank" class="btn-view-doc">👁 Voir</a>
            </div>
          </div>

          <!-- Document 2 : مضمون ولادة du patient -->
          <div class="doc-upload-block">
            <div class="doc-upload-label">
              <span class="doc-num">2</span>
              <div>
                <strong>مضمون ولادة</strong> de vous-même
                <p class="doc-hint">Votre propre acte de naissance pour prouver le lien familial</p>
              </div>
              <span class="doc-status-icon" *ngIf="docsModal()!.docPatientPath"></span>
            </div>
            <div class="file-input-row">
              <label class="file-label" [class.has-file]="docPatientFile">
                <input type="file" accept="application/pdf" (change)="onDocPatientChange($event)" hidden #docPatientInput />
                <span (click)="docPatientInput.click()">
                  {{ docPatientFile ? docPatientFile.name : (docsModal()!.docPatientPath ? ' Remplacer le PDF' : '📎 Choisir un PDF') }}
                </span>
              </label>
              <a *ngIf="docsModal()!.docPatientPath && !docPatientFile"
                 [href]="getDocUrl(docsModal()!.docPatientPath!)"
                 target="_blank" class="btn-view-doc">👁 Voir</a>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" (click)="closeDocsModal()">Annuler</button>
          <button class="btn-save" (click)="saveDocuments()"
                  [disabled]="isSaving() || (!docMembreFile && !docPatientFile)">
            {{ isSaving() ? 'Envoi...' : 'Enregistrer les documents' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL Confirmation suppression -->
    <div class="modal-overlay" *ngIf="deletingMember()" (click)="deletingMember.set(null)">
      <div class="modal-card modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Confirmer la suppression</h2>
          <button class="btn-close" (click)="deletingMember.set(null)">✕</button>
        </div>
        <div class="modal-body">
          <p>Supprimer <strong>{{ deletingMember()!.prenom }} {{ deletingMember()!.nom }}</strong> ?</p>
          <p class="warn-text"> Cette action est irréversible.</p>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" (click)="deletingMember.set(null)">Annuler</button>
          <button class="btn-delete-confirm" (click)="doDelete()" [disabled]="isSaving()">
            {{ isSaving() ? '...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .famille-page { padding: 0; font-family: system-ui, sans-serif; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .page-title { font-size:26px; font-weight:700; color:#0f172a; margin:0 0 4px; }
    .page-subtitle { color:#64748b; font-size:14px; margin:0; }

    .btn-add { padding:10px 20px; background:#1a56db; color:white; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-add:hover { background:#1447c0; }

    .alert-success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:16px; }
    .alert-error   { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; margin-bottom:16px; }

    .loading { display:flex; flex-direction:column; align-items:center; gap:12px; padding:48px; color:#64748b; }
    .spinner { width:36px; height:36px; border:3px solid #e2e8f0; border-top-color:#1a56db; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    .members-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:16px; }
    .empty-state { grid-column:1/-1; text-align:center; padding:60px; color:#94a3b8; background:white; border-radius:16px; border:1px solid #e5e7eb; }

    .member-card { background:white; border-radius:14px; border:1px solid #e5e7eb; padding:20px; display:flex; align-items:flex-start; gap:14px; transition:box-shadow .15s; }
    .member-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.08); }
    .member-avatar { width:48px; height:48px; background:#1a56db; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:700; flex-shrink:0; }
    .member-info { flex:1; min-width:0; }
    .member-name { font-size:16px; font-weight:700; color:#0f172a; margin-bottom:2px; }
    .member-relation { font-size:13px; color:#1a56db; font-weight:600; margin-bottom:4px; }
    .member-meta { display:flex; flex-wrap:wrap; gap:8px; font-size:12px; color:#64748b; margin-bottom:4px; }
    .blood-badge { background:#fef2f2; color:#dc2626; padding:1px 8px; border-radius:10px; font-weight:600; }
    .member-allergies { font-size:12px; color:#d97706; background:#fffbeb; padding:4px 8px; border-radius:6px; margin-bottom:6px; }

    .docs-status { display:flex; flex-direction:column; gap:4px; margin-top:6px; }
    .doc-badge { font-size:11px; padding:3px 8px; border-radius:6px; font-weight:600; }
    .doc-badge.ok      { background:#f0fdf4; color:#16a34a; }
    .doc-badge.missing { background:#fef2f2; color:#dc2626; }

    .member-actions { display:flex; flex-direction:column; gap:6px; flex-shrink:0; }
    .btn-edit  { padding:6px 10px; background:#eff6ff; color:#1a56db; border:1px solid #bfdbfe; border-radius:8px; cursor:pointer; font-size:14px; }
    .btn-docs  { padding:6px 10px; background:#fefce8; color:#ca8a04; border:1px solid #fde68a; border-radius:8px; cursor:pointer; font-size:14px; }
    .btn-delete{ padding:6px 10px; background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:8px; cursor:pointer; font-size:14px; }

    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:999; padding:20px; }
    .modal-card { background:white; border-radius:16px; padding:28px; width:100%; max-width:540px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.2); }
    .modal-card.modal-sm { max-width:400px; }
    .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
    .modal-header h2 { font-size:18px; font-weight:700; color:#0f172a; margin:0; }
    .btn-close { background:none; border:none; font-size:20px; cursor:pointer; color:#64748b; }
    .modal-body { margin-bottom:20px; }
    .modal-actions { display:flex; gap:10px; justify-content:flex-end; }

    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
    .form-group { display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
    .form-group label { font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.04em; }
    .form-group input, .form-group select { padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; font-family:inherit; }
    .form-group input:focus, .form-group select:focus { border-color:#1a56db; }

    .btn-cancel { padding:10px 20px; background:white; color:#64748b; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-save { padding:10px 20px; background:#1a56db; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-save:disabled { opacity:.6; cursor:not-allowed; }
    .btn-delete-confirm { padding:10px 20px; background:#dc2626; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .warn-text { color:#dc2626; font-size:13px; font-weight:600; }

    /* Section documents dans le formulaire */
    .docs-section { border:1.5px solid #fde68a; border-radius:12px; padding:16px; background:#fffbeb; margin-top:4px; }
    .docs-section-title { font-size:14px; font-weight:700; color:#92400e; margin-bottom:4px; }
    .docs-section-hint { font-size:12px; color:#a16207; margin:0 0 14px; }

    /* Documents modal */
    .docs-intro { font-size:14px; color:#374151; margin-bottom:20px; }
    .doc-upload-block { border:1.5px solid #e5e7eb; border-radius:12px; padding:16px; margin-bottom:14px; }
    .doc-upload-label { display:flex; align-items:flex-start; gap:12px; margin-bottom:12px; }
    .doc-num { width:28px; height:28px; background:#1a56db; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; }
    .doc-upload-label strong { font-size:14px; color:#0f172a; display:block; margin-bottom:2px; }
    .doc-hint { font-size:12px; color:#64748b; margin:0; }
    .doc-status-icon { margin-left:auto; font-size:18px; }
    .file-input-row { display:flex; align-items:center; gap:10px; }
    .file-label { flex:1; }
    .file-label span { display:block; padding:9px 14px; border:1.5px dashed #cbd5e1; border-radius:8px; font-size:13px; color:#64748b; cursor:pointer; text-align:center; transition:border-color .15s, background .15s; }
    .file-label span:hover { border-color:#1a56db; background:#eff6ff; color:#1a56db; }
    .file-label.has-file span { border-color:#16a34a; background:#f0fdf4; color:#16a34a; border-style:solid; }
    .btn-view-doc { padding:8px 14px; background:#f8fafc; color:#1a56db; border:1px solid #bfdbfe; border-radius:8px; font-size:13px; font-weight:600; text-decoration:none; white-space:nowrap; }
    .btn-view-doc:hover { background:#eff6ff; }
  `]
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
    if (!m) return;
    if (!this.docMembreFile && !this.docPatientFile) return;

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
        // Mettre à jour le membre dans la liste locale
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

      // Si des fichiers PDF ont été sélectionnés, les uploader
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
