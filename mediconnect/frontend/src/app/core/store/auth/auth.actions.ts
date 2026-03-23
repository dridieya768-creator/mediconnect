// ══════════════════════════════════════════════════════════════
// auth.actions.ts
// ══════════════════════════════════════════════════════════════
import { createAction, props } from '@ngrx/store';
import { User } from '../../models/user.model';

export const login = createAction('[Auth] Login', props<{ email: string; password: string }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ user: User; accessToken: string; refreshToken: string }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());
export const logout = createAction('[Auth] Logout');
export const refreshToken = createAction('[Auth] Refresh Token');
export const refreshTokenSuccess = createAction('[Auth] Refresh Token Success', props<{ accessToken: string }>());
export const loadUser = createAction('[Auth] Load User', props<{ user: User }>());
