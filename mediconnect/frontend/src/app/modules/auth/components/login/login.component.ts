import { Component, inject, OnInit, AfterViewInit, NgZone } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink, ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { AuthService } from "@core/services/auth.service";
import { GoogleAuthService } from "@core/services/google-auth.service";
import { LangSwitcherComponent } from "../../../../shared/components/lang-switcher/lang-switcher.component";

declare const google: any;

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, LangSwitcherComponent],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, AfterViewInit {
  private ngZone            = inject(NgZone);
  private fb                = inject(FormBuilder);
  private authService       = inject(AuthService);
  private googleAuthService = inject(GoogleAuthService);
  private router            = inject(Router);
  private route             = inject(ActivatedRoute);

  loginForm = this.fb.group({
    email:    ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(4)]],
  });

  isLoading    = false;
  isSsoLoading = false;
  error        = "";
  infoMsg      = "";
  showPassword = false;

  testAccounts = [
    { icon: "", role: "Patient",    email: "patient@test.com" },
    { icon: "", role: "Médecin",    email: "medecin@test.com" },
    { icon: "", role: "Pharmacien", email: "pharmacien@test.com" },

    { icon: "", role: "Admin",      email: "admin@test.com" },
  ];

  ngOnInit(): void {
    const msg = this.route.snapshot.queryParams['msg'];
    if (msg === 'pending') {
      this.infoMsg = 'Un email vous sera envoyé après validation de votre compte.';
    }
  }

  ngAfterViewInit(): void {
    this.googleAuthService.initializeGoogleSignIn("google-signin-btn", (credential: string) => {
      this.ngZone.run(() => this.handleGoogleCredential(credential));
    });
  }

  private handleGoogleCredential(credential: string): void {
    this.isSsoLoading = true;
    this.error = "";
    this.authService.loginWithGoogle(credential).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          const unwrapped = res?.data?.data ?? res?.data ?? res;
          const role = unwrapped?.user?.role ?? unwrapped?.role ?? this.authService.currentUser()?.role ?? "";
          this.isSsoLoading = false;
          this.router.navigate([this.authService.getRedirectPath(role)]);
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          this.error = typeof err === "string" ? err : "Erreur connexion Google";
          this.isSsoLoading = false;
        });
      },
    });
  }

  loginWithGoogle(): void {
    this.isSsoLoading = true;
    this.error = '';
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      google.accounts.id.prompt();
      this.isSsoLoading = false;
    } else {
      this.error = 'Connexion Google non configurée.';
      this.isSsoLoading = false;
    }
  }

  loginWithFacebook(): void {
    this.isSsoLoading = true;
    this.error = '';
    const FB = (window as any).FB;
    if (!FB) {
      this.error = 'SDK Facebook non chargé. Réessayez dans quelques secondes.';
      this.isSsoLoading = false;
      return;
    }
    FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        this.authService.loginWithFacebook(accessToken).subscribe({
          next: (res: any) => {
            const unwrapped = res?.data?.data ?? res?.data ?? res;
            const role = unwrapped?.user?.role ?? unwrapped?.role ?? '';
            this.isSsoLoading = false;
            this.router.navigate([this.authService.getRedirectPath(role)]);
          },
          error: (err: any) => {
            this.error = typeof err === 'string' ? err : 'Erreur connexion Facebook';
            this.isSsoLoading = false;
          }
        });
      } else {
        this.error = 'Connexion Facebook annulée.';
        this.isSsoLoading = false;
      }
    }, { scope: 'email,public_profile' });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.error = "";
    const { email, password } = this.loginForm.value;
    this.authService.login(email!, password!).subscribe({
      next: (res: any) => {
        if (res?.requires2fa) {
          this.router.navigate(["/auth/2fa-verify"], { queryParams: { userId: res.userId } });
          return;
        }
        const unwrapped = res?.data?.data ?? res?.data ?? res;
        const role = unwrapped?.user?.role ?? unwrapped?.role ?? "";
        this.router.navigate([this.authService.getRedirectPath(role)]);
      },
      error: (err: string) => {
        this.error = err;
        this.isLoading = false;
      },
    });
  }

  fillTest(email: string): void {
    this.loginForm.patchValue({ email, password: "Test1234!" });
  }
}
