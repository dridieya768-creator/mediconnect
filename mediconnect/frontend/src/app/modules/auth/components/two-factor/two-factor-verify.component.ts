import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, ActivatedRoute, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "@core/services/auth.service";

@Component({
  selector: "app-two-factor-verify",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./two-factor-verify.component.html",
  styleUrls: ["./two-factor-verify.component.scss"],
})
export class TwoFactorVerifyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    code: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });
  isLoading = false;
  error = "";
  userId = "";

  ngOnInit(): void {
    this.userId = this.route.snapshot.queryParams["userId"] || "";
    if (!this.userId) this.router.navigate(["/auth/login"]);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.userId) return;
    this.isLoading = true;
    this.error = "";
    this.authService.verify2fa(this.userId, this.form.value.code!).subscribe({
      next: (res: any) => {
        const role = res?.user?.role ?? res?.data?.user?.role ?? "";
        this.router.navigate([this.authService.getRedirectPath(role)]);
      },
      error: (err: string) => { this.error = err; this.isLoading = false; },
    });
  }
}
