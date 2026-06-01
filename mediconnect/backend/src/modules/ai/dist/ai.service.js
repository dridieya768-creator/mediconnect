"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.AiService = exports.SPECIALITES_VALIDES = void 0;
var common_1 = require("@nestjs/common");
var axios_1 = require("axios");
exports.SPECIALITES_VALIDES = [
    'CARDIOLOGUE', 'DERMATOLOGUE', 'GYNECOLOGUE', 'NEUROLOGUE', 'OPHTALMOLOGUE',
    'ORL', 'PEDIATRE', 'PSYCHIATRE', 'RHUMATOLOGUE', 'UROLOGUE', 'CHIRURGIEN',
    'ENDOCRINOLOGUE', 'GASTROLOGUE', 'NEPHROLOGUE', 'ONCOLOGUE', 'PNEUMOLOGUE',
    'MEDECIN_FAMILLE', 'URGENTISTE', 'ANESTHESISTE', 'RADIOLOGUE_SPEC',
];
var DISCLAIMER = "Ceci est une aide a l'orientation uniquement. Consultez toujours un medecin.";
///// map bach namil conversion
var INFERMEDICA_MAP = {
    cardiologist: 'CARDIOLOGUE', dermatologist: 'DERMATOLOGUE', gynecologist: 'GYNECOLOGUE',
    neurologist: 'NEUROLOGUE', ophthalmologist: 'OPHTALMOLOGUE', otolaryngologist: 'ORL',
    pediatrician: 'PEDIATRE', psychiatrist: 'PSYCHIATRE', rheumatologist: 'RHUMATOLOGUE',
    urologist: 'UROLOGUE', surgeon: 'CHIRURGIEN', endocrinologist: 'ENDOCRINOLOGUE',
    gastroenterologist: 'GASTROLOGUE', nephrologist: 'NEPHROLOGUE', oncologist: 'ONCOLOGUE',
    pulmonologist: 'PNEUMOLOGUE', family_doctor: 'MEDECIN_FAMILLE', general_practitioner: 'MEDECIN_FAMILLE',
    internist: 'MEDECIN_FAMILLE', emergency_medicine: 'URGENTISTE', anesthesiologist: 'ANESTHESISTE',
    radiologist: 'RADIOLOGUE_SPEC'
};
var GEMINI_MODELS = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
];
var AiService = /** @class */ (function () {
    function AiService(config) {
        this.config = config;
        this.logger = new common_1.Logger(AiService_1.name);
    }
    AiService_1 = AiService;
    ////Méthode principale
    AiService.prototype.analyzeSymptoms = function (messages) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var appId, appKey, e_1, geminiKey, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        appId = this.config.get('INFERMEDICA_APP_ID');
                        appKey = this.config.get('INFERMEDICA_APP_KEY');
                        if (!(appId && appKey && appId !== 'your_app_id_here')) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.infermedica(messages, appId, appKey)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        e_1 = _b.sent();
                        this.logger.warn("Infermedica echec: " + ((_a = e_1.response) === null || _a === void 0 ? void 0 : _a.status) + " " + e_1.message);
                        return [3 /*break*/, 4];
                    case 4:
                        geminiKey = this.config.get('GEMINI_API_KEY');
                        if (!geminiKey) return [3 /*break*/, 8];
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.gemini(messages, geminiKey)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7:
                        e_2 = _b.sent();
                        this.logger.warn("Gemini echec: " + e_2.message);
                        return [3 /*break*/, 8];
                    case 8: 
                    //// sinon fallback local
                    return [2 /*return*/, this.localFallback(messages)];
                }
            });
        });
    };
    //// Analyse bi Infer
    AiService.prototype.infermedica = function (messages, appId, appKey) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __awaiter(this, void 0, void 0, function () {
            var headers, lastMsg, msgCount, nlpRes, mentions, geminiKey, e_3, evidence, diagRes, conditions, shouldStop, triageLevel, specialite, _i, _o, c, key, reply, top;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        headers = {
                            'App-Id': appId, 'App-Key': appKey,
                            'Content-Type': 'application/json',
                            'Interview-Id': "mc-" + Date.now(),
                            'Language': 'fr'
                        };
                        lastMsg = (_b = (_a = __spreadArrays(messages).reverse().find(function (m) { return m.role === 'user'; })) === null || _a === void 0 ? void 0 : _a.content) !== null && _b !== void 0 ? _b : '';
                        msgCount = messages.filter(function (m) { return m.role === 'user'; }).length;
                        return [4 /*yield*/, axios_1["default"].post('https://api.infermedica.com/v3/parse', { text: lastMsg, age: { value: 30 }, sex: 'male', include_tokens: false }, { headers: headers, timeout: 10000 })];
                    case 1:
                        nlpRes = _p.sent();
                        mentions = (_d = (_c = nlpRes.data) === null || _c === void 0 ? void 0 : _c.mentions) !== null && _d !== void 0 ? _d : [];
                        this.logger.log("Infermedica NLP: " + mentions.length + " mentions pour \"" + lastMsg.substring(0, 60) + "\"");
                        if (!(mentions.length === 0)) return [3 /*break*/, 6];
                        geminiKey = this.config.get('GEMINI_API_KEY');
                        if (!geminiKey) return [3 /*break*/, 5];
                        _p.label = 2;
                    case 2:
                        _p.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.gemini(messages, geminiKey)];
                    case 3: return [2 /*return*/, _p.sent()];
                    case 4:
                        e_3 = _p.sent();
                        this.logger.warn("Gemini fallback echec: " + e_3.message);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, this.localFallback(messages)];
                    case 6:
                        evidence = mentions.map(function (m) { var _a; return ({ id: m.id, choice_id: (_a = m.choice_id) !== null && _a !== void 0 ? _a : 'present' }); });
                        return [4 /*yield*/, axios_1["default"].post('https://api.infermedica.com/v3/diagnosis', { sex: 'male', age: { value: 30 }, evidence: evidence }, { headers: headers, timeout: 10000 })];
                    case 7:
                        diagRes = _p.sent();
                        conditions = (_f = (_e = diagRes.data) === null || _e === void 0 ? void 0 : _e.conditions) !== null && _f !== void 0 ? _f : [];
                        shouldStop = (_h = (_g = diagRes.data) === null || _g === void 0 ? void 0 : _g.should_stop) !== null && _h !== void 0 ? _h : true;
                        triageLevel = (_l = (_k = (_j = diagRes.data) === null || _j === void 0 ? void 0 : _j.triage) === null || _k === void 0 ? void 0 : _k.triage_level) !== null && _l !== void 0 ? _l : '';
                        this.logger.log("Infermedica diagnosis: " + conditions.length + " conditions, triage: " + triageLevel);
                        specialite = null;
                        for (_i = 0, _o = conditions.slice(0, 5); _i < _o.length; _i++) {
                            c = _o[_i];
                            key = ((_m = c.specialist) !== null && _m !== void 0 ? _m : '').toLowerCase().replace(/ /g, '_');
                            if (INFERMEDICA_MAP[key]) {
                                specialite = INFERMEDICA_MAP[key];
                                break;
                            }
                        }
                        reply = '';
                        ///Détection urgence
                        if (triageLevel === 'emergency' || triageLevel === 'emergency_ambulance') {
                            reply = "Vos symptomes semblent urgents. Appelez le 190 ou rendez-vous aux urgences immediatement.";
                            specialite = 'URGENTISTE';
                        }
                        else if (conditions.length > 0) {
                            top = conditions.slice(0, 3).map(function (c) { var _a; return "- " + c.name + " (" + Math.round(((_a = c.probability) !== null && _a !== void 0 ? _a : 0) * 100) + "%)"; }).join('\n');
                            reply = "D'apres vos symptomes, voici les conditions possibles :\n" + top + "\n\n";
                            if (specialite)
                                reply += "Je vous recommande de consulter un " + specialite.toLowerCase().replace(/_/g, ' ') + ".\n\n";
                        }
                        else {
                            reply = "Je n'ai pas trouve de conditions correspondantes. ";
                        }
                        reply += !shouldStop && msgCount < 4
                            ? "Avez-vous d'autres symptomes associes ?"
                            : "" + DISCLAIMER;
                        /////Réponse possible hiya : json avec reply, specialite, et liste de conditions possibles (avec probas)
                        return [2 /*return*/, { reply: reply, specialite: specialite, conditions: conditions }];
                }
            });
        });
    };
    AiService.prototype.gemini = function (messages, apiKey) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function () {
            var specialitesList, systemPrompt, contents, _i, GEMINI_MODELS_1, url, res, raw, e_4;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        specialitesList = exports.SPECIALITES_VALIDES.join(', ');
                        systemPrompt = "Tu es MediBot, assistant medical de MediConnect. Reponds en JSON strict sans markdown:\n{\"reply\":\"<reponse empathique en langue du patient>\",\"specialite\":\"<ENUM ou null>\"}\nSpecialites: " + specialitesList + "\n- Pose des questions de suivi si besoin (duree, intensite, localisation)\n- Donne la specialite apres 2-3 echanges\n- Ne donne jamais de diagnostic\n- Si question generale sur quel medecin consulter, demande les symptomes";
                        contents = __spreadArrays([
                            { role: 'user', parts: [{ text: systemPrompt }] },
                            { role: 'model', parts: [{ text: '{"reply":"Bonjour ! Decrivez vos symptomes.","specialite":null}' }] }
                        ], messages.map(function (m) { return ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }); }));
                        _i = 0, GEMINI_MODELS_1 = GEMINI_MODELS;
                        _k.label = 1;
                    case 1:
                        if (!(_i < GEMINI_MODELS_1.length)) return [3 /*break*/, 6];
                        url = GEMINI_MODELS_1[_i];
                        _k.label = 2;
                    case 2:
                        _k.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1["default"].post(url + "?key=" + apiKey, { contents: contents, generationConfig: { temperature: 0.4, maxOutputTokens: 512 } }, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 })];
                    case 3:
                        res = _k.sent();
                        raw = (_g = (_f = (_e = (_d = (_c = (_b = (_a = res.data) === null || _a === void 0 ? void 0 : _a.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.text) !== null && _g !== void 0 ? _g : '';
                        this.logger.log("Gemini succes avec " + url);
                        return [2 /*return*/, this.parseGemini(raw)];
                    case 4:
                        e_4 = _k.sent();
                        this.logger.warn("Gemini " + url + " echec: " + ((_h = e_4.response) === null || _h === void 0 ? void 0 : _h.status));
                        if ([400, 401, 403].includes((_j = e_4.response) === null || _j === void 0 ? void 0 : _j.status))
                            throw e_4;
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: throw new Error('Gemini indisponible');
                }
            });
        });
    };
    AiService.prototype.parseGemini = function (raw) {
        try {
            var cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            var p = JSON.parse(cleaned);
            return {
                reply: typeof p.reply === 'string' ? p.reply.trim() : "Je n'ai pas pu analyser.",
                specialite: exports.SPECIALITES_VALIDES.includes(p.specialite) ? p.specialite : null
            };
        }
        catch (_a) {
            return { reply: raw.substring(0, 500) || "Je n'ai pas pu analyser.", specialite: null };
        }
    };
    AiService.prototype.localFallback = function (messages) {
        var _a, _b, _c;
        var last = (_c = (_b = (_a = __spreadArrays(messages).reverse().find(function (m) { return m.role === 'user'; })) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : '';
        var count = messages.filter(function (m) { return m.role === 'user'; }).length;
        if (last.includes('quel medecin') || last.includes('quelle medecin') || last.includes('qui consulter') || last.includes('quel specialiste')) {
            return { reply: "Pour vous orienter, decrivez-moi vos symptomes. Par exemple : \"j'ai des douleurs a la poitrine\", \"j'ai de la fievre\", \"j'ai mal au ventre\"...", specialite: null };
        }
        if (last.includes('bonjour') || last.includes('salut') || last.includes('hello')) {
            return { reply: "Bonjour ! Je suis MediBot. Decrivez-moi vos symptomes et je vous orienterai vers le bon specialiste.", specialite: null };
        }
        var rules = [
            [['coeur', 'cardiaque', 'palpitation', 'essoufflement', 'poitrine', 'tension', 'thoracique'], 'CARDIOLOGUE'],
            [['peau', 'bouton', 'eruption', 'demangeaison', 'acne', 'eczema'], 'DERMATOLOGUE'],
            [['enfant', 'bebe', 'nourrisson'], 'PEDIATRE'],
            [['tete', 'migraine', 'maux de tete', 'vertige', 'convulsion'], 'NEUROLOGUE'],
            [['oeil', 'vue', 'vision', 'yeux'], 'OPHTALMOLOGUE'],
            [['oreille', 'nez', 'gorge', 'sinusite', 'otite', 'rhume', 'mal a gorge', 'fievre', 'chaud'], 'ORL'],
            [['ventre', 'estomac', 'digestion', 'diarrhee', 'nausee', 'vomissement'], 'GASTROLOGUE'],
            [['poumon', 'toux', 'respiration', 'asthme', 'bronchite'], 'PNEUMOLOGUE'],
            [['articulation', 'dos', 'genou', 'rhumatisme', 'douleur musculaire', 'muscle'], 'RHUMATOLOGUE'],
            [['diabete', 'thyroide', 'hormone', 'glycemie'], 'ENDOCRINOLOGUE'],
            [['anxiete', 'depression', 'stress', 'insomnie', 'mental'], 'PSYCHIATRE'],
            [['urine', 'rein', 'prostate'], 'UROLOGUE'],
            [['femme', 'gyneco', 'regles', 'grossesse'], 'GYNECOLOGUE'],
        ];
        for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
            var _d = rules_1[_i], keywords = _d[0], specialite = _d[1];
            if (keywords.some(function (kw) { return last.includes(kw); })) {
                if (count < 2)
                    return { reply: "Je comprends. Depuis combien de temps ressentez-vous ces symptomes ? Avez-vous d'autres symptomes associes ?", specialite: null };
                return { reply: "D'apres vos symptomes, je vous recommande de consulter un " + specialite.toLowerCase().replace(/_/g, ' ') + ". " + DISCLAIMER, specialite: specialite };
            }
        }
        if (count < 2)
            return { reply: "Pouvez-vous preciser vos symptomes ? Ou avez-vous mal, depuis combien de temps ?", specialite: null };
        return { reply: "Je vous recommande de consulter un medecin generaliste. " + DISCLAIMER, specialite: 'MEDECIN_FAMILLE' };
    };
    AiService.prototype.buildGeminiPrompt = function (messages) { return {}; };
    AiService.prototype.parseGeminiResponse = function (raw) { return this.parseGemini(raw); };
    AiService.prototype.getDisclaimer = function () { return DISCLAIMER; };
    var AiService_1;
    AiService = AiService_1 = __decorate([
        common_1.Injectable()
    ], AiService);
    return AiService;
}());
exports.AiService = AiService;
