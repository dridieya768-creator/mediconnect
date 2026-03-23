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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.AdminDashboardComponent = exports.STATUTS = exports.ROLES = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/common/http");
var auth_service_1 = require("@core/services/auth.service");
var admin_user_service_1 = require("./admin-user.service");
var rxjs_1 = require("rxjs");
exports.ROLES = [
    'PATIENT',
    'MEDECIN_GENERALISTE', 'MEDECIN_SPECIALISTE', 'MEDECIN_CHEF_SERVICE',
    'PHARMACIEN_TITULAIRE',
    'BIOLOGISTE_RESPONSABLE', 'BIOLOGISTE_MEDICAL',
    'TECHNICIEN_LABO', 'PRELEVEUR',
    'RADIOLOGUE', 'MANIPULATEUR_RADIO', 'TECHNICIEN_IMAGERIE',
    'ASSISTANT_MEDICAL', 'SECRETAIRE_MEDICAL',
];
exports.STATUTS = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'];
var STATUS_LABELS = {
    ACTIVE: 'Actif',
    INACTIVE: 'Inactif',
    SUSPENDED: 'Suspendu',
    PENDING_VERIFICATION: 'En attente',
    PENDING: 'En attente validation'
};
var AdminDashboardComponent = /** @class */ (function () {
    function AdminDashboardComponent() {
        var _this = this;
        this.auth = core_1.inject(auth_service_1.AuthService);
        this.adminService = core_1.inject(admin_user_service_1.AdminUserService);
        this.http = core_1.inject(http_1.HttpClient);
        this.fb = core_1.inject(forms_1.FormBuilder);
        this.currentUser = this.auth.currentUser;
        this.isLoading = core_1.signal(true);
        this.users = core_1.signal([]);
        this.stats = core_1.signal({ total: 0, actifs: 0, medecins: 0, patients: 0 });
        this.search = core_1.signal('');
        this.filterRole = core_1.signal('TOUS');
        this.filterStatut = core_1.signal('TOUS');
        this.modal = core_1.signal(null);
        this.selectedUser = core_1.signal(null);
        this.isSubmitting = core_1.signal(false);
        this.toast = core_1.signal(null);
        this.doctorModal = core_1.signal(null);
        this.doctorDocs = core_1.signal([]);
        this.isLoadingDocs = core_1.signal(false);
        this.rejectReason = '';
        this.ROLES = exports.ROLES;
        this.STATUTS = exports.STATUTS;
        this.userForm = this.fb.group({
            firstName: ['', [forms_1.Validators.required, forms_1.Validators.minLength(2)]],
            lastName: ['', [forms_1.Validators.required, forms_1.Validators.minLength(2)]],
            email: ['', [forms_1.Validators.required, forms_1.Validators.email]],
            password: [''],
            role: ['PATIENT', forms_1.Validators.required],
            status: ['ACTIVE'],
            phone: ['']
        });
        this.filteredUsers = core_1.computed(function () {
            var list = _this.users();
            if (!Array.isArray(list))
                return [];
            var q = _this.search().toLowerCase();
            var role = _this.filterRole();
            var statut = _this.filterStatut();
            return list.filter(function (u) {
                var fullName = (u.firstName + " " + u.lastName).toLowerCase();
                var matchSearch = !q || fullName.includes(q) || u.email.toLowerCase().includes(q);
                var matchRole = role === 'TOUS' || u.role === role;
                var matchStatut = statut === 'TOUS' || u.status === statut;
                return matchSearch && matchRole && matchStatut;
            });
        });
        this.pendingDoctors = core_1.computed(function () {
            return _this.users().filter(function (u) {
                return u.role.startsWith('MEDECIN') &&
                    (u.status === 'PENDING' || u.status === 'PENDING_VERIFICATION');
            });
        });
    }
    AdminDashboardComponent.prototype.ngOnInit = function () { this.loadUsers(); };
    AdminDashboardComponent.prototype.loadUsers = function () {
        var _this = this;
        this.isLoading.set(true);
        this.adminService.getAll().pipe(rxjs_1.catchError(function (err) {
            console.error('Erreur getAll:', err);
            _this.showToast('Erreur chargement utilisateurs', 'error');
            return rxjs_1.of({ data: [], total: 0, page: 1, limit: 20 });
        })).subscribe(function (res) {
            var _a, _b, _c;
            var raw = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.data) !== null && _c !== void 0 ? _c : res;
            var list = Array.isArray(raw) ? raw : [];
            _this.users.set(list);
            _this.isLoading.set(false);
            _this.loadStats();
        });
    };
    AdminDashboardComponent.prototype.loadStats = function () {
        var _this = this;
        this.adminService.getStats().pipe(rxjs_1.catchError(function () {
            var list = _this.users();
            return rxjs_1.of({
                total: list.length,
                actifs: list.filter(function (u) { return u.status === 'ACTIVE'; }).length,
                medecins: list.filter(function (u) { return u.role.startsWith('MEDECIN'); }).length,
                patients: list.filter(function (u) { return u.role === 'PATIENT'; }).length
            });
        })).subscribe(function (res) {
            var _a, _b, _c, _d, _e;
            var s = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res;
            _this.stats.set({
                total: (_b = s === null || s === void 0 ? void 0 : s.total) !== null && _b !== void 0 ? _b : 0,
                actifs: (_c = s === null || s === void 0 ? void 0 : s.actifs) !== null && _c !== void 0 ? _c : 0,
                medecins: (_d = s === null || s === void 0 ? void 0 : s.medecins) !== null && _d !== void 0 ? _d : 0,
                patients: (_e = s === null || s === void 0 ? void 0 : s.patients) !== null && _e !== void 0 ? _e : 0
            });
        });
    };
    AdminDashboardComponent.prototype.openAdd = function () {
        var _a, _b;
        this.userForm.reset({ role: 'PATIENT', status: 'ACTIVE' });
        (_a = this.userForm.get('password')) === null || _a === void 0 ? void 0 : _a.setValidators([forms_1.Validators.required, forms_1.Validators.minLength(8)]);
        (_b = this.userForm.get('password')) === null || _b === void 0 ? void 0 : _b.updateValueAndValidity();
        this.selectedUser.set(null);
        this.modal.set('add');
    };
    AdminDashboardComponent.prototype.openEdit = function (user) {
        var _a, _b, _c;
        this.userForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
            phone: (_a = user.phone) !== null && _a !== void 0 ? _a : ''
        });
        (_b = this.userForm.get('password')) === null || _b === void 0 ? void 0 : _b.clearValidators();
        (_c = this.userForm.get('password')) === null || _c === void 0 ? void 0 : _c.updateValueAndValidity();
        this.selectedUser.set(user);
        this.modal.set('edit');
    };
    AdminDashboardComponent.prototype.openDelete = function (user) {
        this.selectedUser.set(user);
        this.modal.set('delete');
    };
    AdminDashboardComponent.prototype.closeModal = function () {
        this.modal.set(null);
        this.selectedUser.set(null);
        this.doctorModal.set(null);
        this.doctorDocs.set([]);
        this.isSubmitting.set(false);
        this.rejectReason = '';
    };
    AdminDashboardComponent.prototype.saveUser = function () {
        var _this = this;
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }
        this.isSubmitting.set(true);
        var value = this.userForm.value;
        if (this.modal() === 'add') {
            this.adminService.create(value).pipe(rxjs_1.catchError(function (err) {
                var _a, _b;
                _this.showToast((_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Erreur création', 'error');
                _this.isSubmitting.set(false);
                return rxjs_1.of(null);
            })).subscribe(function (res) {
                var _a;
                if (!res)
                    return;
                var user = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res;
                _this.users.update(function (list) { return __spreadArrays(list, [user]); });
                _this.showToast("Utilisateur \"" + user.firstName + " " + user.lastName + "\" cr\u00E9\u00E9");
                _this.closeModal();
                _this.loadStats();
            });
        }
        else {
            var id_1 = this.selectedUser().id;
            var password = value.password, dto = __rest(value, ["password"]);
            this.adminService.update(id_1, dto).pipe(rxjs_1.catchError(function (err) {
                var _a, _b;
                _this.showToast((_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Erreur modification', 'error');
                _this.isSubmitting.set(false);
                return rxjs_1.of(null);
            })).subscribe(function (res) {
                var _a;
                if (!res)
                    return;
                var user = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res;
                _this.users.update(function (list) { return list.map(function (u) { return u.id === id_1 ? user : u; }); });
                _this.showToast('Utilisateur modifié');
                _this.closeModal();
            });
        }
    };
    AdminDashboardComponent.prototype.confirmDelete = function () {
        var _this = this;
        var user = this.selectedUser();
        if (!user)
            return;
        this.isSubmitting.set(true);
        this.adminService["delete"](user.id).pipe(rxjs_1.catchError(function (err) {
            var _a, _b;
            _this.showToast((_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Erreur suppression', 'error');
            _this.isSubmitting.set(false);
            return rxjs_1.of(null);
        })).subscribe(function () {
            _this.users.update(function (list) { return list.filter(function (u) { return u.id !== user.id; }); });
            _this.showToast('Utilisateur supprimé', 'error');
            _this.closeModal();
            _this.loadStats();
        });
    };
    AdminDashboardComponent.prototype.toggleStatus = function (user) {
        var _this = this;
        var newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        this.adminService.toggleStatus(user.id, newStatus).pipe(rxjs_1.catchError(function () { _this.showToast('Erreur statut', 'error'); return rxjs_1.of(null); })).subscribe(function (res) {
            var _a;
            if (!res)
                return;
            var updated = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res;
            _this.users.update(function (list) { return list.map(function (u) { return u.id === user.id ? updated : u; }); });
            _this.showToast("Statut \u2192 " + newStatus);
        });
    };
    // ── Validation médecins ────────────────────────────────
    AdminDashboardComponent.prototype.openDoctorModal = function (user) {
        this.doctorModal.set(user);
        this.rejectReason = '';
        this.doctorDocs.set([]);
        this.modal.set('doctor');
        this.loadDoctorDocs(user.id);
    };
    AdminDashboardComponent.prototype.loadDoctorDocs = function (userId) {
        var _this = this;
        this.isLoadingDocs.set(true);
        this.adminService.getDoctorDocs(userId).pipe(rxjs_1.catchError(function () { return rxjs_1.of([]); })).subscribe(function (res) {
            var list = Array.isArray(res) ? res :
                Array.isArray(res === null || res === void 0 ? void 0 : res.data) ? res.data : [];
            _this.doctorDocs.set(list);
            _this.isLoadingDocs.set(false);
        });
    };
    AdminDashboardComponent.prototype.openDoc = function (doc) {
        if (doc.base64) {
            try {
                var binary = atob(doc.base64);
                var bytes = new Uint8Array(binary.length);
                for (var i = 0; i < binary.length; i++)
                    bytes[i] = binary.charCodeAt(i);
                var blob = new Blob([bytes], { type: 'application/pdf' });
                var url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            }
            catch (_a) {
                this.showToast('Erreur ouverture document', 'error');
            }
        }
        else {
            this.showToast('Document non disponible', 'error');
        }
    };
    AdminDashboardComponent.prototype.getDocLabel = function (type) {
        var labels = {
            DIPLOME: '🎓 Diplôme de Médecine',
            CASIER_JUDICIAIRE: '📜 Casier judiciaire',
            CARTE_ORDRE: "🪪 Carte d'inscription à l'Ordre",
            CIN: '🪪 CIN',
            ATTESTATION_SPEC: '🏅 Attestation de spécialité'
        };
        return labels[type] || "\uD83D\uDCC4 " + type;
    };
    AdminDashboardComponent.prototype.approveDoctor = function () {
        var _this = this;
        var user = this.doctorModal();
        if (!user)
            return;
        this.isSubmitting.set(true);
        this.adminService.update(user.id, { status: 'ACTIVE' }).pipe(rxjs_1.catchError(function () { _this.showToast('Erreur approbation', 'error'); _this.isSubmitting.set(false); return rxjs_1.of(null); })).subscribe(function (res) {
            if (!res)
                return;
            _this.users.update(function (list) { return list.map(function (u) {
                return u.id === user.id ? __assign(__assign({}, u), { status: 'ACTIVE' }) : u;
            }); });
            _this.showToast("\u2705 Dr. " + user.firstName + " " + user.lastName + " approuv\u00E9 !");
            _this.closeModal();
            _this.isSubmitting.set(false);
        });
    };
    AdminDashboardComponent.prototype.rejectDoctor = function () {
        var _this = this;
        var user = this.doctorModal();
        if (!user)
            return;
        this.isSubmitting.set(true);
        this.adminService.update(user.id, { status: 'SUSPENDED' }).pipe(rxjs_1.catchError(function () { _this.showToast('Erreur refus', 'error'); _this.isSubmitting.set(false); return rxjs_1.of(null); })).subscribe(function (res) {
            if (!res)
                return;
            _this.users.update(function (list) { return list.map(function (u) {
                return u.id === user.id ? __assign(__assign({}, u), { status: 'SUSPENDED' }) : u;
            }); });
            _this.showToast("\u274C Dr. " + user.firstName + " " + user.lastName + " refus\u00E9.", 'error');
            _this.closeModal();
            _this.isSubmitting.set(false);
        });
    };
    AdminDashboardComponent.prototype.getInitials = function (u) {
        var _a, _b, _c, _d;
        return ("" + ((_b = (_a = u.firstName) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '') + ((_d = (_c = u.lastName) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : '')).toUpperCase();
    };
    AdminDashboardComponent.prototype.getStatusLabel = function (status) {
        var _a;
        return (_a = STATUS_LABELS[status]) !== null && _a !== void 0 ? _a : status;
    };
    AdminDashboardComponent.prototype.showToast = function (msg, type) {
        var _this = this;
        if (type === void 0) { type = 'success'; }
        this.toast.set({ msg: msg, type: type });
        setTimeout(function () { return _this.toast.set(null); }, 3200);
    };
    AdminDashboardComponent.prototype.trackById = function (_, u) { return u.id; };
    AdminDashboardComponent = __decorate([
        core_1.Component({
            selector: 'app-admin-dashboard',
            standalone: true,
            imports: [common_1.CommonModule, router_1.RouterLink, forms_1.FormsModule, forms_1.ReactiveFormsModule],
            templateUrl: './admin-dashboard.component.html',
            styleUrls: ['./admin-dashboard.component.scss']
        })
    ], AdminDashboardComponent);
    return AdminDashboardComponent;
}());
exports.AdminDashboardComponent = AdminDashboardComponent;
