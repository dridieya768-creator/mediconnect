import { createReducer, on } from '@ngrx/store';
import { User } from '../../models/user.model';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('mediconnect_token'),
  refreshToken: localStorage.getItem('mediconnect_refresh'),
  isAuthenticated: !!localStorage.getItem('mediconnect_token'),
  isLoading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({ ...state, isLoading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { user, accessToken, refreshToken }) => ({
    ...state, user, accessToken, refreshToken, isAuthenticated: true, isLoading: false, error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state, isLoading: false, error, isAuthenticated: false,
  })),
  on(AuthActions.logout, () => ({
    user: null, accessToken: null, refreshToken: null,
    isAuthenticated: false, isLoading: false, error: null,
  })),
  on(AuthActions.loadUser, (state, { user }) => ({ ...state, user })),
);
