import { Routes } from "@angular/router";
import { authGuard } from "@app/core/guards/auth.guard";
import { notAuthGuard } from "@app/core/guards/notAuth.guard";

export const AUTH_ROUTES: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  {
    path: "login",
    canActivate:[notAuthGuard],
    loadComponent: () =>
      import("./components/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "register",
    canActivate:[notAuthGuard],
    loadComponent: () =>
      import("./components/register/register.component").then((m) => m.RegisterComponent),
  },
  {
    path: "forgot-password",
    canActivate:[notAuthGuard],
    loadComponent: () =>
      import("./components/forgot-password/forgot-password.component").then((m) => m.ForgotPasswordComponent),
  },
  {
    path: "reset-password",
    canActivate:[authGuard],

    loadComponent: () =>
      import("./components/reset-password/reset-password.component").then((m) => m.ResetPasswordComponent),
  },
  {
    path: "2fa-verify",
    canActivate:[authGuard],

    loadComponent: () =>
      import("./components/two-factor/two-factor-verify.component").then((m) => m.TwoFactorVerifyComponent),
  },
];
