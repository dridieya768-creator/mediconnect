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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.RegisterComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var common_1 = require("@angular/common");
var http_1 = require("@angular/common/http");
var auth_service_1 = require("@core/services/auth.service");
var user_model_1 = require("@core/models/user.model");
var RegisterComponent = /** @class */ (function () {
    function RegisterComponent() {
        this.fb = core_1.inject(forms_1.FormBuilder);
        this.auth = core_1.inject(auth_service_1.AuthService);
        this.http = core_1.inject(http_1.HttpClient);
        this.router = core_1.inject(router_1.Router);
        this.isLoading = false;
        this.error = "";
        // ✅ UNE SEULE déclaration avec le bon type
        this.uploadedFiles = {};
        this.requiredDocs = [
            { type: 'DIPLOME', label: 'Diplôme de Docteur en Médecine', icon: '🎓', required: true },
            { type: 'CASIER_JUDICIAIRE', label: 'Casier judiciaire', icon: '📜', required: true },
            { type: 'CARTE_ORDRE', label: "Carte d'inscription à l'Ordre", icon: '🪪', required: true },
            { type: 'CIN', label: "CIN (Carte d'Identité Nationale)", icon: '🪪', required: true },
            { type: 'ATTESTATION_SPEC', label: 'Attestation de spécialité', icon: '🏅', required: false },
        ];
        this.roles = [
            { value: 'PATIENT', label: '👤 Patient' },
            { value: 'MEDECIN_GENERALISTE', label: '🩺 Médecin Généraliste' },
            { value: 'MEDECIN_SPECIALISTE', label: '🩺 Médecin Spécialiste' },
            { value: 'MEDECIN_CHEF_SERVICE', label: '🩺 Médecin Chef de Service' },
            { value: 'PHARMACIEN', label: '💊 Pharmacien' },
            { value: 'BIOLOGISTE_RESPONSABLE', label: '🧪 Biologiste Responsable' },
            { value: 'BIOLOGISTE_MEDICAL', label: '🧪 Biologiste Médical' },
            { value: 'TECHNICIEN_LABO', label: '🧪 Technicien de Laboratoire' },
            { value: 'RADIOLOGUE', label: '🔬 Radiologue' },
            { value: 'MANIPULATEUR_RADIO', label: '🔬 Manipulateur Radio' },
            { value: 'SECRETAIRE_RADIO', label: '🔬 Secrétaire Radiologie' },
        ];
        this.specialites = [
            { value: 'CARDIOLOGUE', label: '❤️ Cardiologue' },
            { value: 'DERMATOLOGUE', label: '🧴 Dermatologue' },
            { value: 'URGENTISTE', label: '🚨 Urgentiste' },
            { value: 'MEDECIN_FAMILLE', label: '🏠 Médecin de famille' },
            { value: 'GYNECOLOGUE', label: '🌸 Gynécologue' },
            { value: 'NEUROLOGUE', label: '🧠 Neurologue' },
            { value: 'OPHTALMOLOGUE', label: '👁️ Ophtalmologue' },
            { value: 'ORL', label: '👂 ORL' },
            { value: 'PEDIATRE', label: '👶 Pédiatre' },
            { value: 'PSYCHIATRE', label: '🧘 Psychiatre' },
            { value: 'RADIOLOGUE_SPEC', label: '🔬 Radiologue' },
            { value: 'RHUMATOLOGUE', label: '🦴 Rhumatologue' },
            { value: 'UROLOGUE', label: '🫀 Urologue' },
            { value: 'CHIRURGIEN', label: '🔪 Chirurgien' },
            { value: 'ANESTHESISTE', label: '💉 Anesthésiste' },
            { value: 'ENDOCRINOLOGUE', label: '⚗️ Endocrinologue' },
            { value: 'GASTROLOGUE', label: '🫁 Gastro-entérologue' },
            { value: 'NEPHROLOGUE', label: '🩺 Néphrologue' },
            { value: 'ONCOLOGUE', label: '🎗️ Oncologue' },
            { value: 'PNEUMOLOGUE', label: '🫁 Pneumologue' },
        ];
        this.form = this.fb.group({
            firstName: ["", forms_1.Validators.required],
            lastName: ["", forms_1.Validators.required],
            email: ["", [forms_1.Validators.required, forms_1.Validators.email]],
            phone: [""],
            role: [user_model_1.UserRole.PATIENT, forms_1.Validators.required],
            specialite: [""],
            password: ["", [forms_1.Validators.required, forms_1.Validators.minLength(8)]],
            confirmPassword: ["", forms_1.Validators.required]
        });
    }
    Object.defineProperty(RegisterComponent.prototype, "isMedecinSpecialiste", {
        get: function () {
            var _a;
            return ((_a = this.form.get('role')) === null || _a === void 0 ? void 0 : _a.value) === 'MEDECIN_SPECIALISTE';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RegisterComponent.prototype, "isMedecin", {
        get: function () {
            var _a, _b;
            var role = (_b = (_a = this.form.get('role')) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
            return role.toString().startsWith('MEDECIN');
        },
        enumerable: false,
        configurable: true
    });
    RegisterComponent.prototype.ngOnInit = function () {
        var _this = this;
        var _a;
        (_a = this.form.get('role')) === null || _a === void 0 ? void 0 : _a.valueChanges.subscribe(function (role) {
            var specCtrl = _this.form.get('specialite');
            if (role === 'MEDECIN_SPECIALISTE') {
                specCtrl === null || specCtrl === void 0 ? void 0 : specCtrl.setValidators([forms_1.Validators.required]);
            }
            else {
                specCtrl === null || specCtrl === void 0 ? void 0 : specCtrl.clearValidators();
                specCtrl === null || specCtrl === void 0 ? void 0 : specCtrl.setValue('');
            }
            specCtrl === null || specCtrl === void 0 ? void 0 : specCtrl.updateValueAndValidity();
            _this.uploadedFiles = {};
        });
    };
    // ✅ Méthode DANS la classe (indentation correcte)
    RegisterComponent.prototype.onFileSelected = function (event, docType) {
        var _this = this;
        var _a;
        var input = event.target;
        var file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        if (file.type !== 'application/pdf') {
            this.error = 'Seuls les fichiers PDF sont acceptés.';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.error = 'Fichier trop volumineux (max 5MB).';
            return;
        }
        var reader = new FileReader();
        reader.onload = function () {
            _this.uploadedFiles[docType] = {
                file: file,
                base64: reader.result.split(',')[1],
                name: file.name
            };
        };
        reader.readAsDataURL(file);
        this.error = '';
    };
    // ✅ Méthode DANS la classe (indentation correcte)
    RegisterComponent.prototype.onSubmit = function () {
        var _this = this;
        if (this.form.invalid)
            return;
        if (this.isMedecin) {
            var missingDocs = this.requiredDocs
                .filter(function (d) { return d.required && !_this.uploadedFiles[d.type]; });
            if (missingDocs.length > 0) {
                this.error = "Documents manquants : " + missingDocs.map(function (d) { return d.label; }).join(', ');
                return;
            }
        }
        var _a = this.form.value, confirmPassword = _a.confirmPassword, dto = __rest(_a, ["confirmPassword"]);
        if (dto.password !== confirmPassword) {
            this.error = "Les mots de passe ne correspondent pas";
            return;
        }
        this.isLoading = true;
        this.error = "";
        if (this.isMedecin) {
            var payload = __assign(__assign({}, dto), { documents: Object.entries(this.uploadedFiles).map(function (_a) {
                    var type = _a[0], d = _a[1];
                    return ({
                        type: type,
                        filename: d.name,
                        base64: d.base64
                    });
                }) });
            this.auth.register(payload).subscribe({
                next: function (res) { return _this.handleRegisterSuccess(res); },
                error: function (err) {
                    _this.error = typeof err === 'string' ? err : "Erreur lors de l'inscription";
                    _this.isLoading = false;
                }
            });
        }
        else {
            this.auth.register(dto).subscribe({
                next: function (res) { return _this.handleRegisterSuccess(res); },
                error: function (err) {
                    _this.error = typeof err === 'string' ? err : "Erreur lors de l'inscription";
                    _this.isLoading = false;
                }
            });
        }
    };
    // ✅ Méthode DANS la classe (indentation correcte)
    RegisterComponent.prototype.handleRegisterSuccess = function (res) {
        var _a, _b, _c, _d;
        var payload = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res;
        if (payload === null || payload === void 0 ? void 0 : payload.pendingApproval) {
            this.router.navigate(['/auth/login'], { queryParams: { msg: 'pending' } });
            return;
        }
        var role = (_d = (_c = (_b = payload === null || payload === void 0 ? void 0 : payload.user) === null || _b === void 0 ? void 0 : _b.role) !== null && _c !== void 0 ? _c : payload === null || payload === void 0 ? void 0 : payload.role) !== null && _d !== void 0 ? _d : '';
        this.router.navigate([this.auth.getRedirectPath(role)]);
    };
    RegisterComponent = __decorate([
        core_1.Component({
            selector: "app-register",
            standalone: true,
            imports: [common_1.CommonModule, forms_1.ReactiveFormsModule, router_1.RouterLink],
            templateUrl: "./register.component.html",
            styleUrls: ["./register.component.scss"]
        })
    ], RegisterComponent);
    return RegisterComponent;
}());
exports.RegisterComponent = RegisterComponent;
