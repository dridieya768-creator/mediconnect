import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { AdminUserService, AdminUser, AdminStats, UserRole, UserStatus, DoctorDocument } from './admin-user.service';
import { catchError, of } from 'rxjs';

export const ROLES = [
  'PATIENT',
  'MEDECIN_GENERALISTE', 'MEDECIN_SPECIALISTE', 'MEDECIN_CHEF_SERVICE',
  'PHARMACIEN_TITULAIRE',
  'BIOLOGISTE_RESPONSABLE', 'BIOLOGISTE_MEDICAL',
  'TECHNICIEN_LABO', 'PRELEVEUR',
  'RADIOLOGUE', 'MANIPULATEUR_RADIO', 'TECHNICIEN_IMAGERIE',
  'ASSISTANT_MEDICAL', 'SECRETAIRE_MEDICAL',
] as const;

export const STATUTS = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'] as const;

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:               'Actif',
  INACTIVE:             'Inactif',
  SUSPENDED:            'Suspendu',
  PENDING_VERIFICATION: 'En attente',
  PENDING:              'En attente validation',
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  private auth         = inject(AuthService);
  private adminService = inject(AdminUserService);
  private http         = inject(HttpClient);
  private fb           = inject(FormBuilder);

  currentUser  = this.auth.currentUser;
  isLoading    = signal(true);
  users        = signal<AdminUser[]>([]);
  stats        = signal<AdminStats>({ total: 0, actifs: 0, medecins: 0, patients: 0 });

  search        = signal('');
  filterRole    = signal('TOUS');
  filterStatut  = signal('TOUS');

  modal         = signal<'add' | 'edit' | 'delete' | 'doctor' | null>(null);
  selectedUser  = signal<AdminUser | null>(null);
  isSubmitting  = signal(false);
  toast         = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  doctorModal   = signal<AdminUser | null>(null);
  doctorDocs    = signal<DoctorDocument[]>([]);
  isLoadingDocs = signal(false);
  rejectReason  = '';

  // ── Audit logs ─────────────────────────────────────────────────────────────
  activeTab     = signal<'users' | 'audit'>('users');
  auditLogs     = signal<any[]>([]);
  auditLoading  = signal(false);
  auditTotal    = signal(0);
  auditPage     = signal(1);
  auditSearch   = signal('');
  auditRoleFilter = signal('');

  readonly ROLES   = ROLES;
  readonly STATUTS = STATUTS;

  userForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  [''],
    role:      ['PATIENT' as UserRole, Validators.required],
    status:    ['ACTIVE' as UserStatus],
    phone:     [''],
  });

  filteredUsers = computed(() => {
    const list   = this.users();
    if (!Array.isArray(list)) return [];
    const q      = this.search().toLowerCase();
    const role   = this.filterRole();
    const statut = this.filterStatut();
    return list.filter(u => {
      const fullName    = `${u.firstName} ${u.lastName}`.toLowerCase();
      const matchSearch = !q      || fullName.includes(q) || u.email.toLowerCase().includes(q);
      const matchRole   = role   === 'TOUS' || u.role   === role;
      const matchStatut = statut === 'TOUS' || u.status === statut;
      return matchSearch && matchRole && matchStatut;
    });
  });

  pendingDoctors = computed(() =>
    this.users().filter(u =>
      (u.role as string).startsWith('MEDECIN') &&
      ((u.status as string) === 'PENDING' || (u.status as string) === 'PENDING_VERIFICATION')
    )
  );

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.isLoading.set(true);
    this.adminService.getAll().pipe(
      catchError(err => {
        console.error('Erreur getAll:', err);
        this.showToast('Erreur chargement utilisateurs', 'error');
        return of({ data: [], total: 0, page: 1, limit: 20 } as any);
      })
    ).subscribe((res: any) => {
      const raw  = res?.data?.data ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      this.users.set(list);
      this.isLoading.set(false);
      this.loadStats();
    });
  }

  loadStats() {
    this.adminService.getStats().pipe(
      catchError(() => {
        const list = this.users();
        return of({
          total:    list.length,
          actifs:   list.filter(u => u.status === 'ACTIVE').length,
          medecins: list.filter(u => (u.role as string).startsWith('MEDECIN')).length,
          patients: list.filter(u => u.role === 'PATIENT').length,
        });
      })
    ).subscribe((res: any) => {
      const s = res?.data ?? res;
      this.stats.set({
        total:    s?.total    ?? 0,
        actifs:   s?.actifs   ?? 0,
        medecins: s?.medecins ?? 0,
        patients: s?.patients ?? 0,
      });
    });
  }

  openAdd() {
    this.userForm.reset({ role: 'PATIENT' as UserRole, status: 'ACTIVE' as UserStatus });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.selectedUser.set(null);
    this.modal.set('add');
  }

  openEdit(user: AdminUser) {
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role:      user.role,
      status:    user.status,
      phone:     user.phone ?? '',
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.selectedUser.set(user);
    this.modal.set('edit');
  }

  openDelete(user: AdminUser) {
    this.selectedUser.set(user);
    this.modal.set('delete');
  }

  closeModal() {
    this.modal.set(null);
    this.selectedUser.set(null);
    this.doctorModal.set(null);
    this.doctorDocs.set([]);
    this.isSubmitting.set(false);
    this.rejectReason = '';
  }

  saveUser() {
    if (this.userForm.invalid) { this.userForm.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    const value = this.userForm.value as any;

    if (this.modal() === 'add') {
      this.adminService.create(value).pipe(
        catchError(err => {
          this.showToast(err?.error?.message ?? 'Erreur création', 'error');
          this.isSubmitting.set(false);
          return of(null);
        })
      ).subscribe((res: any) => {
        if (!res) return;
        const user: AdminUser = res?.data ?? res;
        this.users.update(list => [...list, user]);
        this.showToast(`Utilisateur "${user.firstName} ${user.lastName}" créé`);
        this.closeModal();
        this.loadStats();
      });
    } else {
      const id = this.selectedUser()!.id;
      const { password, ...dto } = value;
      this.adminService.update(id, dto).pipe(
        catchError(err => {
          this.showToast(err?.error?.message ?? 'Erreur modification', 'error');
          this.isSubmitting.set(false);
          return of(null);
        })
      ).subscribe((res: any) => {
        if (!res) return;
        const user: AdminUser = res?.data ?? res;
        this.users.update(list => list.map(u => u.id === id ? user : u));
        this.showToast('Utilisateur modifié');
        this.closeModal();
      });
    }
  }

  confirmDelete() {
    const user = this.selectedUser();
    if (!user) return;
    this.isSubmitting.set(true);
    this.adminService.delete(user.id).pipe(
      catchError(err => {
        this.showToast(err?.error?.message ?? 'Erreur suppression', 'error');
        this.isSubmitting.set(false);
        return of(null);
      })
    ).subscribe(() => {
      this.users.update(list => list.filter(u => u.id !== user.id));
      this.showToast('Utilisateur supprimé', 'error');
      this.closeModal();
      this.loadStats();
    });
  }

  toggleStatus(user: AdminUser) {
    const newStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.adminService.toggleStatus(user.id, newStatus).pipe(
      catchError(() => { this.showToast('Erreur statut', 'error'); return of(null); })
    ).subscribe((res: any) => {
      if (!res) return;
      const updated: AdminUser = res?.data ?? res;
      this.users.update(list => list.map(u => u.id === user.id ? updated : u));
      this.showToast(`Statut → ${newStatus}`);
    });
  }

  // ── Validation médecins ────────────────────────────────
  openDoctorModal(user: AdminUser) {
    this.doctorModal.set(user);
    this.rejectReason = '';
    this.doctorDocs.set([]);
    this.modal.set('doctor');
    this.loadDoctorDocs(user.id);
  }

  loadDoctorDocs(userId: string) {
    this.isLoadingDocs.set(true);
    this.adminService.getDoctorDocs(userId).pipe(
      catchError(() => of([]))
    ).subscribe((res: any) => {
      const list: DoctorDocument[] =
        Array.isArray(res)       ? res :
        Array.isArray(res?.data) ? res.data : [];
      this.doctorDocs.set(list);
      this.isLoadingDocs.set(false);
    });
  }

  openDoc(doc: DoctorDocument) {
    if (doc.base64) {
      try {
        const binary = atob(doc.base64);
        const bytes  = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url  = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch {
        this.showToast('Erreur ouverture document', 'error');
      }
    } else {
      this.showToast('Document non disponible', 'error');
    }
  }

  getDocLabel(type: string): string {
    const labels: Record<string, string> = {
      DIPLOME:           '🎓 Diplôme de Médecine',
      CASIER_JUDICIAIRE: '📜 Casier judiciaire',
      CARTE_ORDRE:       "🪪 Carte d'inscription à l'Ordre",
      CIN:               '🪪 CIN',
      ATTESTATION_SPEC:  '🏅 Attestation de spécialité',
    };
    return labels[type] || `📄 ${type}`;
  }

  approveDoctor() {
    const user = this.doctorModal();
    if (!user) return;
    this.isSubmitting.set(true);
    this.adminService.update(user.id, { status: 'ACTIVE' as UserStatus }).pipe(
      catchError(() => { this.showToast('Erreur approbation', 'error'); this.isSubmitting.set(false); return of(null); })
    ).subscribe((res: any) => {
      if (!res) return;
      this.users.update(list => list.map(u =>
        u.id === user.id ? { ...u, status: 'ACTIVE' as UserStatus } : u
      ));
      this.showToast(`✅ Dr. ${user.firstName} ${user.lastName} approuvé !`);
      this.closeModal();
      this.isSubmitting.set(false);
    });
  }

  rejectDoctor() {
    const user = this.doctorModal();
    if (!user) return;
    this.isSubmitting.set(true);
    this.adminService.update(user.id, { status: 'SUSPENDED' as UserStatus }).pipe(
      catchError(() => { this.showToast('Erreur refus', 'error'); this.isSubmitting.set(false); return of(null); })
    ).subscribe((res: any) => {
      if (!res) return;
      this.users.update(list => list.map(u =>
        u.id === user.id ? { ...u, status: 'SUSPENDED' as UserStatus } : u
      ));
      this.showToast(`❌ Dr. ${user.firstName} ${user.lastName} refusé.`, 'error');
      this.closeModal();
      this.isSubmitting.set(false);
    });
  }

  getInitials(u: AdminUser): string {
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
  }

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  loadAuditLogs() {
    this.auditLoading.set(true);
    const params = new URLSearchParams({
      page:  String(this.auditPage()),
      limit: '50',
    });
    if (this.auditRoleFilter()) params.set('role', this.auditRoleFilter());
    if (this.auditSearch())     params.set('search', this.auditSearch());

    this.http.get<any>(`/api/v1/admin/audit-logs?${params}`).pipe(
      catchError(() => of({ data: [], total: 0 }))
    ).subscribe((res: any) => {
      const d = res?.data ?? res;
      this.auditLogs.set(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []);
      this.auditTotal.set(d?.total ?? 0);
      this.auditLoading.set(false);
    });
  }

  getAuditAction(log: any): string {
    const champs = log.champsModifies ?? {};
    const keys = Object.keys(champs);
    if (keys.includes('delivrance_pharmacie')) return '💊 Délivrance pharmacie';
    if (keys.includes('allergies'))            return '🔴 Allergies modifiées';
    if (keys.includes('maladies_chroniques'))  return '🏥 Maladies chroniques';
    if (keys.includes('medicaments_actuels'))  return '💊 Médicaments actuels';
    if (keys.includes('documents'))            return '📄 Document ajouté';
    if (keys.includes('observations'))         return '📝 Observations';
    if (keys.length > 0)                       return `✏️ ${keys[0]}`;
    return '📋 Modification dossier';
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3200);
  }

  trackById(_: number, u: AdminUser): string { return u.id; }
}