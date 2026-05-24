import { inject } from "@angular/core";
import { CanActivateFn, Router, ActivatedRouteSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const notAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
   const router = inject(Router);
  if (auth.isAuthenticated())
   {
    const role=auth.getRole();
    const path=auth.getRedirectPath(role);
    router.navigate([path])
    return false;
   }
  return true;

  
};
