import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { ROLE_PORTAL_MAP } from '../../models/user-role.enum';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login({ email, password }).pipe(
          map((res) =>
            AuthActions.loginSuccess({
              user: res.data.user,
              accessToken: res.data.accessToken,
              refreshToken: res.data.refreshToken,
            }),
          ),
          catchError((err) =>
            of(AuthActions.loginFailure({
              error: err.error?.message || 'Erreur de connexion',
            })),
          ),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user }) => {
          const redirectUrl = ROLE_PORTAL_MAP[user.role] || '/auth/login';
          this.router.navigateByUrl(redirectUrl);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.clear();
          this.router.navigate(['/auth/login']);
        }),
      ),
    { dispatch: false },
  );
}
