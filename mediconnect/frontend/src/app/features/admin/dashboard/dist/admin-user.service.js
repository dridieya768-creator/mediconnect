"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AdminUserService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var API = '/api/v1/admin/users';
var AdminUserService = /** @class */ (function () {
    function AdminUserService() {
        this.http = core_1.inject(http_1.HttpClient);
    }
    AdminUserService.prototype.getAll = function (params) {
        var httpParams = new http_1.HttpParams();
        if (params === null || params === void 0 ? void 0 : params.role)
            httpParams = httpParams.set('role', params.role);
        if (params === null || params === void 0 ? void 0 : params.status)
            httpParams = httpParams.set('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.search)
            httpParams = httpParams.set('search', params.search);
        if (params === null || params === void 0 ? void 0 : params.page)
            httpParams = httpParams.set('page', String(params.page));
        if (params === null || params === void 0 ? void 0 : params.limit)
            httpParams = httpParams.set('limit', String(params.limit));
        return this.http.get(API, { params: httpParams });
    };
    AdminUserService.prototype.getById = function (id) {
        return this.http.get(API + "/" + id);
    };
    AdminUserService.prototype.create = function (dto) {
        return this.http.post(API, dto);
    };
    AdminUserService.prototype.update = function (id, dto) {
        return this.http.patch(API + "/" + id, dto);
    };
    AdminUserService.prototype["delete"] = function (id) {
        return this.http["delete"](API + "/" + id);
    };
    AdminUserService.prototype.toggleStatus = function (id, status) {
        return this.http.patch(API + "/" + id, { status: status });
    };
    AdminUserService.prototype.resetPassword = function (id) {
        return this.http.post(API + "/" + id + "/reset-password", {});
    };
    AdminUserService.prototype.getStats = function () {
        return this.http.get('/api/v1/admin/stats');
    };
    // ✅ getDoctorDocs DANS la classe (accolade fermante après)
    AdminUserService.prototype.getDoctorDocs = function (userId) {
        return this.http.get(API + "/" + userId + "/documents");
    };
    AdminUserService = __decorate([
        core_1.Injectable({ providedIn: 'root' })
    ], AdminUserService);
    return AdminUserService;
}());
exports.AdminUserService = AdminUserService;
