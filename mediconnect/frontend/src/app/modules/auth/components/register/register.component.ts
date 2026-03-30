import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "@core/services/auth.service";
import { UserRole } from "@core/models/user.model";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private http   = inject(HttpClient);
  private router = inject(Router);

  isLoading = false;
  error     = "";

  // ✅ UNE SEULE déclaration avec le bon type
  uploadedFiles: Record<string, { file: File; base64: string; name: string }> = {};

  requiredDocs = [
    { type: 'DIPLOME',           label: 'Diplôme de Docteur en Médecine',   icon: '🎓', required: true  },
    { type: 'CASIER_JUDICIAIRE', label: 'Casier judiciaire',                icon: '📜', required: true  },
    { type: 'CARTE_ORDRE',       label: "Carte d'inscription à l'Ordre",    icon: '🪪', required: true  },
    { type: 'CIN',               label: "CIN (Carte d'Identité Nationale)", icon: '🪪', required: true  },
    { type: 'ATTESTATION_SPEC',  label: 'Attestation de spécialité',        icon: '🏅', required: false },
  ];

  roles = [
    { value: 'PATIENT',                label: '👤 Patient' },
    { value: 'MEDECIN_GENERALISTE',    label: '🩺 Médecin Généraliste' },
    { value: 'MEDECIN_SPECIALISTE',    label: '🩺 Médecin Spécialiste' },
    { value: 'MEDECIN_CHEF_SERVICE',   label: '🩺 Médecin Chef de Service' },
    { value: 'PHARMACIEN',             label: '💊 Pharmacien' },
    { value: 'BIOLOGISTE_RESPONSABLE', label: '🧪 Biologiste Responsable' },
    { value: 'BIOLOGISTE_MEDICAL',     label: '🧪 Biologiste Médical' },
    { value: 'TECHNICIEN_LABO',        label: '🧪 Technicien de Laboratoire' },
    { value: 'RADIOLOGUE',             label: '🔬 Radiologue' },
    { value: 'MANIPULATEUR_RADIO',     label: '🔬 Manipulateur Radio' },
    { value: 'SECRETAIRE_RADIO',       label: '🔬 Secrétaire Radiologie' },
  ];

  specialites = [
    { value: 'CARDIOLOGUE',     label: '❤️ Cardiologue' },
    { value: 'DERMATOLOGUE',    label: '🧴 Dermatologue' },
    { value: 'URGENTISTE',      label: '🚨 Urgentiste' },
    { value: 'MEDECIN_FAMILLE', label: '🏠 Médecin de famille' },
    { value: 'GYNECOLOGUE',     label: '🌸 Gynécologue' },
    { value: 'NEUROLOGUE',      label: '🧠 Neurologue' },
    { value: 'OPHTALMOLOGUE',   label: '👁️ Ophtalmologue' },
    { value: 'ORL',             label: '👂 ORL' },
    { value: 'PEDIATRE',        label: '👶 Pédiatre' },
    { value: 'PSYCHIATRE',      label: '🧘 Psychiatre' },
    { value: 'RADIOLOGUE_SPEC', label: '🔬 Radiologue' },
    { value: 'RHUMATOLOGUE',    label: '🦴 Rhumatologue' },
    { value: 'UROLOGUE',        label: '🫀 Urologue' },
    { value: 'CHIRURGIEN',      label: '🔪 Chirurgien' },
    { value: 'ANESTHESISTE',    label: '💉 Anesthésiste' },
    { value: 'ENDOCRINOLOGUE',  label: '⚗️ Endocrinologue' },
    { value: 'GASTROLOGUE',     label: '🫁 Gastro-entérologue' },
    { value: 'NEPHROLOGUE',     label: '🩺 Néphrologue' },
    { value: 'ONCOLOGUE',       label: '🎗️ Oncologue' },
    { value: 'PNEUMOLOGUE',     label: '🫁 Pneumologue' },
  ];

  form = this.fb.group({
    firstName:       ["", Validators.required],
    lastName:        ["", Validators.required],
    email:           ["", [Validators.required, Validators.email]],
    phone:           [""],
    gender:          [""],
    role:            [UserRole.PATIENT, Validators.required],
    specialite:      [""],
    password:        ["", [Validators.required, Validators.minLength(8)]],
    confirmPassword: ["", Validators.required],
    acceptCgu:       [false],
  });

  setProfessional(): void {
    this.form.patchValue({ role: UserRole.MEDECIN_GENERALISTE });
  }

  get isMedecinSpecialiste(): boolean {
    return this.form.get('role')?.value === 'MEDECIN_SPECIALISTE';
  }

  get isMedecin(): boolean {
    const role = this.form.get('role')?.value ?? '';
    return role.toString().startsWith('MEDECIN');
  }

  ngOnInit(): void {
    this.form.get('role')?.valueChanges.subscribe(role => {
      const specCtrl = this.form.get('specialite');
      if (role === 'MEDECIN_SPECIALISTE') {
        specCtrl?.setValidators([Validators.required]);
      } else {
        specCtrl?.clearValidators();
        specCtrl?.setValue('');
      }
      specCtrl?.updateValueAndValidity();
      this.uploadedFiles = {};
    });
  }

  // ✅ Méthode DANS la classe (indentation correcte)
  onFileSelected(event: Event, docType: string): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.error = 'Seuls les fichiers PDF sont acceptés.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'Fichier trop volumineux (max 5MB).';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.uploadedFiles[docType] = {
        file,
        base64: (reader.result as string).split(',')[1],
        name:   file.name,
      };
    };
    reader.readAsDataURL(file);
    this.error = '';
  }

  // ✅ Méthode DANS la classe (indentation correcte)
  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.isMedecin) {
      const missingDocs = this.requiredDocs
        .filter(d => d.required && !this.uploadedFiles[d.type]);
      if (missingDocs.length > 0) {
        this.error = `Documents manquants : ${missingDocs.map(d => d.label).join(', ')}`;
        return;
      }
    }

    const { confirmPassword, ...dto } = this.form.value;
    if (dto.password !== confirmPassword) {
      this.error = "Les mots de passe ne correspondent pas";
      return;
    }

    this.isLoading = true;
    this.error = "";

    if (this.isMedecin) {
      const payload = {
        ...dto,
        documents: Object.entries(this.uploadedFiles).map(([type, d]) => ({
          type,
          filename: d.name,
          base64:   d.base64,
        })),
      };
      this.auth.register(payload).subscribe({
        next: (res: any) => this.handleRegisterSuccess(res),
        error: (err: any) => {
          this.error = typeof err === 'string' ? err : "Erreur lors de l'inscription";
          this.isLoading = false;
        },
      });
    } else {
      this.auth.register(dto).subscribe({
        next: (res: any) => this.handleRegisterSuccess(res),
        error: (err: any) => {
          this.error = typeof err === 'string' ? err : "Erreur lors de l'inscription";
          this.isLoading = false;
        },
      });
    }
  }

  // ✅ Méthode DANS la classe (indentation correcte)
  private handleRegisterSuccess(res: any): void {
    const payload = res?.data ?? res;
    if (payload?.pendingApproval) {
      this.router.navigate(['/auth/login'], { queryParams: { msg: 'pending' } });
      return;
    }
    const role = payload?.user?.role ?? payload?.role ?? '';
    this.router.navigate([this.auth.getRedirectPath(role)]);
  }
}