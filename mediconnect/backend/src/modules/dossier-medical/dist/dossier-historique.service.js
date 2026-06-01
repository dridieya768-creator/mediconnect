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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.DossierHistoriqueService = exports.CHAMPS_SURVEILLES = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var dossier_historique_entity_1 = require("./entities/dossier-historique.entity");
exports.CHAMPS_SURVEILLES = [
    'allergies', 'maladiesChroniques', 'medicamentsActuels',
    'groupeSanguin', 'dateNaissance', 'sexe', 'ville',
    'telephone', 'nss', 'nom', 'prenom',
];
var CHAMPS_SENSIBLES = ['password', 'mfaSecret', 'refreshToken'];
var DossierHistoriqueService = /** @class */ (function () {
    function DossierHistoriqueService(historiqueRepo) {
        this.historiqueRepo = historiqueRepo;
    }
    ////////compare l'état avant et après modification
    DossierHistoriqueService.prototype.computeDiff = function (avant, apres) {
        var diff = {};
        for (var _i = 0, CHAMPS_SURVEILLES_1 = exports.CHAMPS_SURVEILLES; _i < CHAMPS_SURVEILLES_1.length; _i++) {
            var champ = CHAMPS_SURVEILLES_1[_i];
            if (JSON.stringify(avant[champ]) !== JSON.stringify(apres[champ])) {
                diff[champ] = { avant: avant[champ], apres: apres[champ] };
            }
        }
        return diff;
    };
    /////netoyer
    DossierHistoriqueService.prototype.sanitizeSnapshot = function (snapshot) {
        var clean = __assign({}, snapshot);
        for (var _i = 0, CHAMPS_SENSIBLES_1 = CHAMPS_SENSIBLES; _i < CHAMPS_SENSIBLES_1.length; _i++) {
            var champ = CHAMPS_SENSIBLES_1[_i];
            delete clean[champ];
        }
        return clean;
    };
    DossierHistoriqueService.prototype.createHistorique = function (patientId, modifieParId, roleAuteur, snapshotAvant, snapshotApres, commentaire) {
        return __awaiter(this, void 0, Promise, function () {
            var diff, entry;
            return __generator(this, function (_a) {
                diff = this.computeDiff(snapshotAvant, snapshotApres);
                if (Object.keys(diff).length === 0)
                    return [2 /*return*/, null];
                entry = this.historiqueRepo.create({
                    patientId: patientId,
                    modifieParId: modifieParId,
                    roleAuteur: roleAuteur,
                    champsModifies: diff,
                    snapshotAvant: this.sanitizeSnapshot(snapshotAvant),
                    commentaire: commentaire
                });
                return [2 /*return*/, this.historiqueRepo.save(entry)];
            });
        });
    };
    DossierHistoriqueService.prototype.getHistorique = function (patientId, query) {
        return __awaiter(this, void 0, Promise, function () {
            var _a, page, _b, limit, champ, modifieParId, qb, _c, data, total;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = query.page, page = _a === void 0 ? 1 : _a, _b = query.limit, limit = _b === void 0 ? 20 : _b, champ = query.champ, modifieParId = query.modifieParId;
                        qb = this.historiqueRepo
                            .createQueryBuilder('h')
                            .where('h.patientId = :patientId', { patientId: patientId })
                            .orderBy('h.createdAt', 'DESC')
                            .skip((page - 1) * limit)
                            .take(limit);
                        if (champ) {
                            qb.andWhere('h.champsModifies ? :champ', { champ: champ });
                        }
                        if (modifieParId) {
                            qb.andWhere('h.modifieParId = :modifieParId', { modifieParId: modifieParId });
                        }
                        return [4 /*yield*/, qb.getManyAndCount()];
                    case 1:
                        _c = _d.sent(), data = _c[0], total = _c[1];
                        return [2 /*return*/, { data: data, total: total, page: page }];
                }
            });
        });
    };
    DossierHistoriqueService = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(dossier_historique_entity_1.DossierHistorique))
    ], DossierHistoriqueService);
    return DossierHistoriqueService;
}());
exports.DossierHistoriqueService = DossierHistoriqueService;
