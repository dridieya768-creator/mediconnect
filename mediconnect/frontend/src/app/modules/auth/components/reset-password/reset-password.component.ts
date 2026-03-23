import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "@core/services/auth.service";

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"],
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = "";
  isLoading = false;
  error = "";
  success = "";
  show1 = false;
  show2 = false;

  form = this.fb.group({
    newPassword: ["", [Validators.required, Validators.minLength(8)]],
    confirmPassword: ["", Validators.required],
  }, { validators: (g: AbstractControl) => {
    const p = g.get("newPassword")?.value;
    const c = g.get("confirmPassword")?.value;
    return p === c ? null : { mismatch: true };
  }});

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams["token"] || "";
  }

  get pw(): string { return this.form.get("newPassword")?.value || ""; }
  get hasMin(): boolean { return this.pw.length >= 8; }
  get hasUpper(): boolean { return /[A-Z]/.test(this.pw); }
  get hasNum(): boolean { return /[0-9]/.test(this.pw); }
  get hasSpecial(): boolean { return /[^A-Za-z0-9]/.test(this.pw); }
  get strength(): number { return [this.hasMin, this.hasUpper, this.hasNum, this.hasSpecial].filter(Boolean).length * 25; }
  get strengthClass(): string { return this.strength <= 25 ? "weak" : this.strength <= 50 ? "medium" : "strong"; }
  get strengthLabel(): string { return this.strength <= 25 ? "Faible" : this.strength <= 50 ? "Moyen" : "Fort"; }

  onSubmit(): void {
    if (this.form.invalid || !this.token) return;
    this.isLoading = true;
    this.error = "";
    this.authService.resetPassword(this.token, this.form.value.newPassword!).subscribe({
      next: (res: any) => {
        this.success = res.message;
        this.isLoading = false;
        setTimeout(() => this.router.navigate(["/auth/login"]), 3000);
      },
      error: (err: string) => { this.error = err; this.isLoading = false; },
    });
  }
}
