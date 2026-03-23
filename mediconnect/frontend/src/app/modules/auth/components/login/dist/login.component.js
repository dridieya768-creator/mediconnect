"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.LoginComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var common_1 = require("@angular/common");
var auth_service_1 = require("@core/services/auth.service");
var google_auth_service_1 = require("@core/services/google-auth.service");
var LoginComponent = /** @class */ (function () {
    function LoginComponent() {
        this.ngZone = core_1.inject(core_1.NgZone);
        this.fb = core_1.inject(forms_1.FormBuilder);
        this.authService = core_1.inject(auth_service_1.AuthService);
        this.googleAuthService = core_1.inject(google_auth_service_1.GoogleAuthService);
        this.router = core_1.inject(router_1.Router);
        this.route = core_1.inject(router_1.ActivatedRoute);
        this.loginForm = this.fb.group({
            email: ["", [forms_1.Validators.required, forms_1.Validators.email]],
            password: ["", [forms_1.Validators.required, forms_1.Validators.minLength(4)]]
        });
        this.isLoading = false;
        this.isSsoLoading = false;
        this.error = "";
        this.infoMsg = ""; // ✅ UNE SEULE déclaration (suppression du doublon)
        this.showPassword = false;
        this.hasRealGoogleClientId = true;
        this.portals = [
            { icon: "👤", name: "Portail Patient", desc: "RDV, dossier médical, ordonnances" },
            { icon: "🩺", name: "Portail Médecin", desc: "Agenda, consultations, prescriptions" },
            { icon: "💊", name: "Portail Pharmacie", desc: "Délivrance, stock, conseil" },
            { icon: "🧪", name: "Portail Laboratoire", desc: "Analyses, résultats, validation" },
            { icon: "🔬", name: "Portail Radiologie", desc: "Imagerie, PACS, comptes-rendus" },
        ];
        this.testAccounts = [
            { icon: "👤", role: "Patient", email: "patient@test.com" },
            { icon: "🩺", role: "Médecin", email: "medecin@test.com" },
            { icon: "💊", role: "Pharmacien", email: "pharmacien@test.com" },
            { icon: "🧪", role: "Biologiste", email: "biologiste@test.com" },
            { icon: "🔬", role: "Radiologue", email: "radiologue@test.com" },
            { icon: "⚙️", role: "Admin", email: "admin@test.com" },
        ];
    }
    LoginComponent.prototype.ngOnInit = function () {
        var msg = this.route.snapshot.queryParams['msg'];
        if (msg === 'pending') {
            this.infoMsg = '⏳ Votre compte médecin est en attente de validation par un administrateur. Vous recevrez un email dès que votre compte sera approuvé.';
        }
    };
    LoginComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (this.hasRealGoogleClientId) {
            this.googleAuthService.initializeGoogleSignIn("google-signin-btn", function (credential) {
                _this.ngZone.run(function () { return _this.handleGoogleCredential(credential); });
            });
        }
    };
    LoginComponent.prototype.handleGoogleCredential = function (credential) {
        var _this = this;
        this.isSsoLoading = true;
        this.error = "";
        this.authService.loginWithGoogle(credential).subscribe({
            next: function (res) {
                _this.ngZone.run(function () {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    var unwrapped = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.data) !== null && _c !== void 0 ? _c : res;
                    var role = (_h = (_f = (_e = (_d = unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.user) === null || _d === void 0 ? void 0 : _d.role) !== null && _e !== void 0 ? _e : unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.role) !== null && _f !== void 0 ? _f : (_g = _this.authService.currentUser()) === null || _g === void 0 ? void 0 : _g.role) !== null && _h !== void 0 ? _h : "";
                    _this.isSsoLoading = false;
                    setTimeout(function () {
                        _this.router.navigate([_this.authService.getRedirectPath(role)]);
                    }, 50);
                });
            },
            error: function (err) {
                _this.ngZone.run(function () {
                    _this.error = typeof err === "string" ? err : "Erreur connexion Google";
                    _this.isSsoLoading = false;
                });
            }
        });
    };
    LoginComponent.prototype.loginWithFacebook = function () {
        var _this = this;
        this.isSsoLoading = true;
        this.error = "";
        var loadAndLogin = function () {
            window.FB.login(function (response) {
                _this.ngZone.run(function () {
                    var _a;
                    if ((_a = response.authResponse) === null || _a === void 0 ? void 0 : _a.accessToken) {
                        _this.authService.loginWithFacebook(response.authResponse.accessToken).subscribe({
                            next: function (res) {
                                _this.ngZone.run(function () {
                                    var _a, _b, _c, _d, _e, _f, _g, _h;
                                    var unwrapped = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.data) !== null && _c !== void 0 ? _c : res;
                                    var role = (_h = (_f = (_e = (_d = unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.user) === null || _d === void 0 ? void 0 : _d.role) !== null && _e !== void 0 ? _e : unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.role) !== null && _f !== void 0 ? _f : (_g = _this.authService.currentUser()) === null || _g === void 0 ? void 0 : _g.role) !== null && _h !== void 0 ? _h : "";
                                    _this.isSsoLoading = false;
                                    setTimeout(function () {
                                        _this.router.navigate([_this.authService.getRedirectPath(role)]);
                                    }, 50);
                                });
                            },
                            error: function (err) {
                                _this.ngZone.run(function () {
                                    _this.error = typeof err === "string" ? err : "Erreur connexion Facebook";
                                    _this.isSsoLoading = false;
                                });
                            }
                        });
                    }
                    else {
                        _this.error = "Connexion Facebook annulée";
                        _this.isSsoLoading = false;
                    }
                });
            }, { scope: "email,public_profile" });
        };
        if (!window.FB) {
            var script = document.createElement("script");
            script.src = "https://connect.facebook.net/fr_FR/sdk.js";
            script.onload = function () {
                window.FB.init({
                    appId: "912010708142758",
                    cookie: true, xfbml: true, version: "v18.0"
                });
                loadAndLogin();
            };
            document.body.appendChild(script);
        }
        else {
            loadAndLogin();
        }
    };
    LoginComponent.prototype.onSubmit = function () {
        var _this = this;
        if (this.loginForm.invalid)
            return;
        this.isLoading = true;
        this.error = "";
        var _a = this.loginForm.value, email = _a.email, password = _a.password;
        this.authService.login(email, password).subscribe({
            next: function (res) {
                var _a, _b, _c, _d, _e, _f;
                if (res === null || res === void 0 ? void 0 : res.requires2fa) {
                    _this.router.navigate(["/auth/2fa-verify"], { queryParams: { userId: res.userId } });
                    return;
                }
                var unwrapped = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.data) !== null && _c !== void 0 ? _c : res;
                var role = (_f = (_e = (_d = unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.user) === null || _d === void 0 ? void 0 : _d.role) !== null && _e !== void 0 ? _e : unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.role) !== null && _f !== void 0 ? _f : "";
                _this.router.navigate([_this.authService.getRedirectPath(role)]);
            },
            error: function (err) {
                _this.error = err;
                _this.isLoading = false;
            }
        });
    };
    LoginComponent.prototype.fillTest = function (email) {
        this.loginForm.patchValue({ email: email, password: "Test1234!" });
    };
    LoginComponent = __decorate([
        core_1.Component({
            selector: "app-login",
            standalone: true,
            imports: [common_1.CommonModule, forms_1.ReactiveFormsModule, router_1.RouterLink],
            templateUrl: "./login.component.html",
            styleUrls: ["./login.component.scss"]
        })
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;
