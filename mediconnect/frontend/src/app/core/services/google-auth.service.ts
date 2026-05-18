import { Injectable, NgZone, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";

declare const google: any;

export const GOOGLE_CLIENT_ID = "846115411738-f0ntmr833nvh8jp5bv5d958mb75g7sj3.apps.googleusercontent.com";

@Injectable({ providedIn: "root" })
export class GoogleAuthService {
  private ngZone = inject(NgZone);
  private authService = inject(AuthService);
  private router = inject(Router);

  initializeGoogleSignIn(buttonElementId: string, onSuccess: (credential: string) => void): void {
    const tryInit = () => {
      if (typeof google === "undefined") {
        setTimeout(tryInit, 300);
        return;
      }

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) {
            // NgZone.run() pour que Angular détecte les changements
            this.ngZone.run(() => onSuccess(response.credential));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const element = document.getElementById(buttonElementId);
      if (element) {
        element.innerHTML = "";
        google.accounts.id.renderButton(element, {
          theme: "outline",
          size: "large",
          width: "380",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
      }
    };
    tryInit();
  }

  promptOneTap(): void {
    if (typeof google !== "undefined") {
      google.accounts.id.prompt();
    }
  }

  signOut(): void {
    if (typeof google !== "undefined") {
      google.accounts.id.disableAutoSelect();
    }
  }
}