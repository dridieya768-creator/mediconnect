import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "@core/services/auth.service";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  form = this.fb.group({ email: ["", [Validators.required, Validators.email]] });
  isLoading = false;
  error = "";
  success = "";
  devResetUrl = "";

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.error = "";
    this.authService.forgotPassword(this.form.value.email!).subscribe({
      next: (res: any) => {
        this.success = res.message;
        this.devResetUrl = res.devResetUrl || "";
        this.isLoading = false;
      },
      error: (err: string) => { this.error = err; this.isLoading = false; },
    });
  }
}
