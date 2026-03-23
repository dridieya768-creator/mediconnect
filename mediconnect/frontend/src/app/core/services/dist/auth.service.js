"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AuthService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var rxjs_1 = require("rxjs");
var AuthService = /** @class */ (function () {
    function AuthService(http, router) {
        var _this = this;
        this.http = http;
        this.router = router;
        this.API = "/api/v1/auth";
        this._currentUser = core_1.signal(this.loadUserFromStorage());
        this._token = core_1.signal(this.loadTokenFromStorage());
        this.currentUser = this._currentUser.asReadonly();
        this.token = this._token.asReadonly();
        this.isAuthenticated = core_1.computed(function () { return !!_this._currentUser(); });
        this.userRole = core_1.computed(function () { var _a; return (_a = _this._currentUser()) === null || _a === void 0 ? void 0 : _a.role; });
    }
    // US1: Register
    // Dans auth.service.ts frontend — modifie la méthode register()
    AuthService.prototype.register = function (data) {
        var _this = this;
        return this.http.post(this.API + "/register", data).pipe(rxjs_1.tap(function (res) {
            var _a;
            var payload = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res;
            // ✅ Si médecin en attente, ne pas connecter
            if (!(payload === null || payload === void 0 ? void 0 : payload.pendingApproval)) {
                _this.handleAuthSuccess(payload);
            }
        }), rxjs_1.catchError(function (err) { return rxjs_1.throwError(function () { var _a, _b, _c; return ((_b = (_a = err.error) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b[0]) || ((_c = err.error) === null || _c === void 0 ? void 0 : _c.message) || "Erreur inscription"; }); }));
    };
    // US2: Login
    AuthService.prototype.login = function (email, password) {
        var _this = this;
        return this.http.post(this.API + "/login", { email: email, password: password }).pipe(rxjs_1.tap(function (res) {
            var _a;
            if (!(res === null || res === void 0 ? void 0 : res.requires2fa)) {
                _this.handleAuthSuccess((_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res);
            }
        }), rxjs_1.catchError(function (err) { return rxjs_1.throwError(function () { var _a; return ((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || "Email ou mot de passe incorrect"; }); }));
    };
    AuthService.prototype.loginWithGoogle = function (googleToken) {
        var _this = this;
        return this.http.post(this.API + "/sso/google", { token: googleToken }).pipe(rxjs_1.tap(function (res) { return _this.handleAuthSuccess(res); }), // ← plus de ?. data
        rxjs_1.catchError(function (err) { return rxjs_1.throwError(function () { var _a; return ((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || "Erreur connexion Google"; }); }));
    };
    AuthService.prototype.loginWithFacebook = function (fbToken) {
        var _this = this;
        return this.http.post(this.API + "/sso/facebook", { token: fbToken }).pipe(rxjs_1.tap(function (res) { return _this.handleAuthSuccess(res); }), // ← plus de ?. data
        rxjs_1.catchError(function (err) { return rxjs_1.throwError(function () { var _a; return ((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || "Erreur connexion Facebook"; }); }));
    };
    // US4: Setup 2FA
    AuthService.prototype.setup2fa = function () {
        return this.http.post(this.API + "/2fa/setup", {}, { headers: this.authHeaders });
    };
    // US4: Enable 2FA
    AuthService.prototype.enable2fa = function (code) {
        var _this = this;
        return this.http.post(this.API + "/2fa/enable", { code: code }, { headers: this.authHeaders }).pipe(rxjs_1.tap(function () {
            var user = _this.loadUserFromStorage();
            if (user) {
                user.mfaEnabled = true;
                localStorage.setItem("current_user", JSON.stringify(user));
                _this._currentUser.set(user);
            }
        }));
    };
    // US4: Disable 2FA
    AuthService.prototype.disable2fa = function () {
        var _this = this;
        return this.http.post(this.API + "/2fa/disable", {}, { headers: this.authHeaders }).pipe(rxjs_1.tap(function () {
            var user = _this.loadUserFromStorage();
            if (user) {
                user.mfaEnabled = false;
                localStorage.setItem("current_user", JSON.stringify(user));
                _this._currentUser.set(user);
            }
        }));
    };
    // US4: Verify 2FA code
    AuthService.prototype.verify2fa = function (userId, code) {
        var _this = this;
        return this.http.post(this.API + "/2fa/verify", { userId: userId, code: code }).pipe(rxjs_1.tap(function (res) { var _a; return _this.handleAuthSuccess((_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res); }), rxjs_1.catchError(function (err) { return rxjs_1.throwError(function () { var _a; return ((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || "Code 2FA invalide"; }); }));
    };
    // US5: Forgot password
    AuthService.prototype.forgotPassword = function (email) {
        return this.http.post(this.API + "/forgot-password", { email: email }).pipe(rxjs_1.catchError(function (err) { return rxjs_1.throwError(function () { var _a; return ((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || "Erreur lors de l envoi"; }); }));
    };
    // US5: Reset password
    AuthService.prototype.resetPassword = function (token, newPassword) {
        return this.http.post(this.API + "/reset-password", { token: token, newPassword: newPassword }).pipe(rxjs_1.catchError(function (err) { return rxjs_1.throwError(function () { var _a; return ((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || "Token invalide ou expiré"; }); }));
    };
    AuthService.prototype.logout = function () {
        this.clearStorage();
        this._currentUser.set(null);
        this._token.set(null);
        this.router.navigate(["/auth/login"]);
    };
    AuthService.prototype.getRedirectPath = function (role) {
        var routes = {
            PATIENT: "/patient/dashboard",
            MEDECIN_GENERALISTE: "/medecin/dashboard",
            MEDECIN_SPECIALISTE: "/medecin/dashboard",
            MEDECIN_CHEF_SERVICE: "/medecin/dashboard",
            PHARMACIEN: "/pharmacie/dashboard",
            BIOLOGISTE_RESPONSABLE: "/laboratoire/dashboard",
            BIOLOGISTE_MEDICAL: "/laboratoire/dashboard",
            TECHNICIEN_LABO: "/laboratoire/dashboard",
            RADIOLOGUE: "/radiologie/dashboard",
            MANIPULATEUR_RADIO: "/radiologie/dashboard",
            ADMIN_SYSTEM: "/admin/dashboard"
        };
        return routes[role] || "/auth/login";
    };
    Object.defineProperty(AuthService.prototype, "authHeaders", {
        get: function () {
            return new http_1.HttpHeaders({ Authorization: "Bearer " + (this._token() || "") });
        },
        enumerable: false,
        configurable: true
    });
    AuthService.prototype.handleAuthSuccess = function (payload) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            var unwrapped = (_a = payload === null || payload === void 0 ? void 0 : payload.data) !== null && _a !== void 0 ? _a : payload;
            var rawUser = (_b = unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.user) !== null && _b !== void 0 ? _b : unwrapped;
            // Normaliser les noms de champs (snake_case → camelCase)
            var user = (rawUser === null || rawUser === void 0 ? void 0 : rawUser.id) ? __assign(__assign({}, rawUser), { firstName: (_d = (_c = rawUser.firstName) !== null && _c !== void 0 ? _c : rawUser.first_name) !== null && _d !== void 0 ? _d : '', lastName: (_f = (_e = rawUser.lastName) !== null && _e !== void 0 ? _e : rawUser.last_name) !== null && _f !== void 0 ? _f : '' }) : null;
            var access_token = (_g = unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.access_token) !== null && _g !== void 0 ? _g : payload === null || payload === void 0 ? void 0 : payload.access_token;
            var refresh_token = (_h = unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.refresh_token) !== null && _h !== void 0 ? _h : payload === null || payload === void 0 ? void 0 : payload.refresh_token;
            if (access_token)
                localStorage.setItem("access_token", access_token);
            if (refresh_token)
                localStorage.setItem("refresh_token", refresh_token);
            if (user === null || user === void 0 ? void 0 : user.id)
                localStorage.setItem("current_user", JSON.stringify(user));
            this._token.set(access_token !== null && access_token !== void 0 ? access_token : null);
            this._currentUser.set(user);
        }
        catch (_j) {
            this.clearStorage();
        }
    };
    AuthService.prototype.loadUserFromStorage = function () {
        try {
            var stored = localStorage.getItem("current_user");
            if (!stored || stored === "undefined" || stored === "null")
                return null;
            return JSON.parse(stored);
        }
        catch (_a) {
            localStorage.removeItem("current_user");
            return null;
        }
    };
    AuthService.prototype.loadTokenFromStorage = function () {
        try {
            var token = localStorage.getItem("access_token");
            if (!token || token === "undefined" || token === "null")
                return null;
            return token;
        }
        catch (_a) {
            return null;
        }
    };
    AuthService.prototype.clearStorage = function () {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("current_user");
    };
    AuthService = __decorate([
        core_1.Injectable({ providedIn: "root" })
    ], AuthService);
    return AuthService;
}());
exports.AuthService = AuthService;
