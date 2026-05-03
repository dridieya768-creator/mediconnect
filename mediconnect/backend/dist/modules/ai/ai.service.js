"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = exports.SPECIALITES_VALIDES = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
exports.SPECIALITES_VALIDES = [
    'CARDIOLOGUE', 'DERMATOLOGUE', 'GYNECOLOGUE', 'NEUROLOGUE',
    'OPHTALMOLOGUE', 'ORL', 'PEDIATRE', 'PSYCHIATRE', 'RHUMATOLOGUE',
    'UROLOGUE', 'CHIRURGIEN', 'ENDOCRINOLOGUE', 'GASTROLOGUE',
    'NEPHROLOGUE', 'ONCOLOGUE', 'PNEUMOLOGUE', 'MEDECIN_FAMILLE',
    'URGENTISTE', 'ANESTHESISTE', 'RADIOLOGUE_SPEC',
];
const DISCLAIMER = '⚠️ Ceci est une aide à l\'orientation uniquement. Consultez toujours un médecin pour un diagnostic.';
const GEMINI_MODELS = [
    'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
];
let AiService = AiService_1 = class AiService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AiService_1.name);
    }
    async analyzeSymptoms(messages) {
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY non configurée');
            throw new common_1.InternalServerErrorException('Service IA non configuré');
        }
        const payload = this.buildGeminiPrompt(messages);
        for (const modelUrl of GEMINI_MODELS) {
            try {
                this.logger.log(`Tentative avec: ${modelUrl}`);
                const response = await axios_1.default.post(`${modelUrl}?key=${apiKey}`, payload, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000,
                });
                const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                this.logger.log(`Succès avec: ${modelUrl}`);
                return this.parseGeminiResponse(rawText);
            }
            catch (err) {
                const status = err.response?.status;
                this.logger.warn(`Échec ${modelUrl} — status: ${status} — ${err.message}`);
                if (status === 400 || status === 401 || status === 403) {
                    this.logger.error('Erreur clé API: ' + JSON.stringify(err.response?.data));
                    throw new common_1.InternalServerErrorException('Erreur de configuration du service IA');
                }
                continue;
            }
        }
        this.logger.warn('Tous les modèles Gemini indisponibles — utilisation du fallback local');
        return this.localFallback(messages);
    }
    buildGeminiPrompt(messages) {
        const specialitesList = exports.SPECIALITES_VALIDES.join(', ');
        const systemPrompt = `Assistant médical MediConnect. Analyse les symptômes et réponds en JSON: {"reply":"<réponse courte empathique>","specialite":"<ENUM ou null>"}
Spécialités: ${specialitesList}
Règles: réponds dans la langue du patient, ne donne pas de diagnostic, recommande de consulter un médecin.`;
        const contents = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: '{"reply":"Bonjour! Décrivez vos symptômes.","specialite":null}' }] },
        ];
        for (const msg of messages) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            });
        }
        return {
            contents,
            generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
        };
    }
    parseGeminiResponse(rawText) {
        try {
            const parsed = JSON.parse(rawText);
            const reply = typeof parsed.reply === 'string' && parsed.reply.trim()
                ? parsed.reply.trim()
                : 'Je n\'ai pas pu analyser vos symptômes. Veuillez réessayer.';
            const specialite = typeof parsed.specialite === 'string' &&
                exports.SPECIALITES_VALIDES.includes(parsed.specialite)
                ? parsed.specialite
                : null;
            return { reply, specialite };
        }
        catch {
            return {
                reply: rawText.substring(0, 500) || 'Je n\'ai pas pu analyser vos symptômes. Veuillez réessayer.',
                specialite: null,
            };
        }
    }
    getDisclaimer() {
        return DISCLAIMER;
    }
    localFallback(messages) {
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content?.toLowerCase() ?? '';
        const rules = [
            { keywords: ['coeur', 'cardiaque', 'palpitation', 'essoufflement', 'poitrine', 'tension'], specialite: 'CARDIOLOGUE', hint: 'des symptômes cardiaques' },
            { keywords: ['peau', 'bouton', 'éruption', 'démangeaison', 'acné', 'eczéma'], specialite: 'DERMATOLOGUE', hint: 'des problèmes cutanés' },
            { keywords: ['enfant', 'bébé', 'nourrisson', 'fièvre enfant', 'pédiatrie'], specialite: 'PEDIATRE', hint: 'des symptômes pédiatriques' },
            { keywords: ['tête', 'migraine', 'maux de tête', 'vertige', 'neurologique', 'convulsion'], specialite: 'NEUROLOGUE', hint: 'des symptômes neurologiques' },
            { keywords: ['oeil', 'vue', 'vision', 'ophtalmologie', 'lunettes'], specialite: 'OPHTALMOLOGUE', hint: 'des problèmes oculaires' },
            { keywords: ['oreille', 'nez', 'gorge', 'sinusite', 'otite', 'rhume'], specialite: 'ORL', hint: 'des symptômes ORL' },
            { keywords: ['ventre', 'estomac', 'digestion', 'diarrhée', 'nausée', 'vomissement', 'foie'], specialite: 'GASTROLOGUE', hint: 'des troubles digestifs' },
            { keywords: ['poumon', 'toux', 'respiration', 'asthme', 'bronchite'], specialite: 'PNEUMOLOGUE', hint: 'des problèmes respiratoires' },
            { keywords: ['articulation', 'dos', 'genou', 'rhumatisme', 'douleur musculaire'], specialite: 'RHUMATOLOGUE', hint: 'des douleurs articulaires' },
            { keywords: ['diabète', 'thyroïde', 'hormone', 'glycémie'], specialite: 'ENDOCRINOLOGUE', hint: 'des troubles endocriniens' },
            { keywords: ['anxiété', 'dépression', 'stress', 'insomnie', 'psychiatrie', 'mental'], specialite: 'PSYCHIATRE', hint: 'des troubles psychologiques' },
            { keywords: ['urine', 'rein', 'prostate', 'urologie'], specialite: 'UROLOGUE', hint: 'des troubles urologiques' },
        ];
        for (const rule of rules) {
            if (rule.keywords.some(kw => lastUserMsg.includes(kw))) {
                return {
                    reply: `Je détecte ${rule.hint}. Je vous recommande de consulter un ${rule.specialite.toLowerCase().replace('_', ' ')}. ${DISCLAIMER}`,
                    specialite: rule.specialite,
                };
            }
        }
        return {
            reply: `Je n'ai pas pu analyser précisément vos symptômes. Pour une orientation fiable, je vous recommande de consulter un médecin généraliste. ${DISCLAIMER}`,
            specialite: 'MEDECIN_FAMILLE',
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map