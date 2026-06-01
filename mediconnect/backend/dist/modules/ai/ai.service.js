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
    'CARDIOLOGUE', 'DERMATOLOGUE', 'GYNECOLOGUE', 'NEUROLOGUE', 'OPHTALMOLOGUE',
    'ORL', 'PEDIATRE', 'PSYCHIATRE', 'RHUMATOLOGUE', 'UROLOGUE', 'CHIRURGIEN',
    'ENDOCRINOLOGUE', 'GASTROLOGUE', 'NEPHROLOGUE', 'ONCOLOGUE', 'PNEUMOLOGUE',
    'MEDECIN_FAMILLE', 'URGENTISTE', 'ANESTHESISTE', 'RADIOLOGUE_SPEC',
];
const DISCLAIMER = "Ceci est une aide a l'orientation uniquement. Consultez toujours un medecin.";
const INFERMEDICA_MAP = {
    cardiologist: 'CARDIOLOGUE', dermatologist: 'DERMATOLOGUE', gynecologist: 'GYNECOLOGUE',
    neurologist: 'NEUROLOGUE', ophthalmologist: 'OPHTALMOLOGUE', otolaryngologist: 'ORL',
    pediatrician: 'PEDIATRE', psychiatrist: 'PSYCHIATRE', rheumatologist: 'RHUMATOLOGUE',
    urologist: 'UROLOGUE', surgeon: 'CHIRURGIEN', endocrinologist: 'ENDOCRINOLOGUE',
    gastroenterologist: 'GASTROLOGUE', nephrologist: 'NEPHROLOGUE', oncologist: 'ONCOLOGUE',
    pulmonologist: 'PNEUMOLOGUE', family_doctor: 'MEDECIN_FAMILLE', general_practitioner: 'MEDECIN_FAMILLE',
    internist: 'MEDECIN_FAMILLE', emergency_medicine: 'URGENTISTE', anesthesiologist: 'ANESTHESISTE',
    radiologist: 'RADIOLOGUE_SPEC',
};
const GEMINI_MODELS = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
];
let AiService = AiService_1 = class AiService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(AiService_1.name);
    }
    async analyzeSymptoms(messages) {
        const appId = this.config.get('INFERMEDICA_APP_ID');
        const appKey = this.config.get('INFERMEDICA_APP_KEY');
        if (appId && appKey && appId !== 'your_app_id_here') {
            try {
                return await this.infermedica(messages, appId, appKey);
            }
            catch (e) {
                this.logger.warn(`Infermedica echec: ${e.response?.status} ${e.message}`);
            }
        }
        const geminiKey = this.config.get('GEMINI_API_KEY');
        if (geminiKey) {
            try {
                return await this.gemini(messages, geminiKey);
            }
            catch (e) {
                this.logger.warn(`Gemini echec: ${e.message}`);
            }
        }
        return this.localFallback(messages);
    }
    async infermedica(messages, appId, appKey) {
        const headers = {
            'App-Id': appId, 'App-Key': appKey,
            'Content-Type': 'application/json',
            'Interview-Id': `mc-${Date.now()}`,
            'Language': 'fr',
        };
        const lastMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
        const msgCount = messages.filter(m => m.role === 'user').length;
        const nlpRes = await axios_1.default.post('https://api.infermedica.com/v3/parse', { text: lastMsg, age: { value: 30 }, sex: 'male', include_tokens: false }, { headers, timeout: 10000 });
        const mentions = nlpRes.data?.mentions ?? [];
        this.logger.log(`Infermedica NLP: ${mentions.length} mentions pour "${lastMsg.substring(0, 60)}"`);
        if (mentions.length === 0) {
            const geminiKey = this.config.get('GEMINI_API_KEY');
            if (geminiKey) {
                try {
                    return await this.gemini(messages, geminiKey);
                }
                catch (e) {
                    this.logger.warn(`Gemini fallback echec: ${e.message}`);
                }
            }
            return this.localFallback(messages);
        }
        const evidence = mentions.map((m) => ({ id: m.id, choice_id: m.choice_id ?? 'present' }));
        const diagRes = await axios_1.default.post('https://api.infermedica.com/v3/diagnosis', { sex: 'male', age: { value: 30 }, evidence }, { headers, timeout: 10000 });
        const conditions = diagRes.data?.conditions ?? [];
        const shouldStop = diagRes.data?.should_stop ?? true;
        const triageLevel = diagRes.data?.triage?.triage_level ?? '';
        this.logger.log(`Infermedica diagnosis: ${conditions.length} conditions, triage: ${triageLevel}`);
        let specialite = null;
        for (const c of conditions.slice(0, 5)) {
            const key = (c.specialist ?? '').toLowerCase().replace(/ /g, '_');
            if (INFERMEDICA_MAP[key]) {
                specialite = INFERMEDICA_MAP[key];
                break;
            }
        }
        let reply = '';
        if (triageLevel === 'emergency' || triageLevel === 'emergency_ambulance') {
            reply = `Vos symptomes semblent urgents. Appelez le 190 ou rendez-vous aux urgences immediatement.`;
            specialite = 'URGENTISTE';
        }
        else if (conditions.length > 0) {
            const top = conditions.slice(0, 3).map((c) => `- ${c.name} (${Math.round((c.probability ?? 0) * 100)}%)`).join('\n');
            reply = `D'apres vos symptomes, voici les conditions possibles :\n${top}\n\n`;
            if (specialite)
                reply += `Je vous recommande de consulter un ${specialite.toLowerCase().replace(/_/g, ' ')}.\n\n`;
        }
        else {
            reply = `Je n'ai pas trouve de conditions correspondantes. `;
        }
        reply += !shouldStop && msgCount < 4
            ? `Avez-vous d'autres symptomes associes ?`
            : `${DISCLAIMER}`;
        return { reply, specialite, conditions };
    }
    async gemini(messages, apiKey) {
        const specialitesList = exports.SPECIALITES_VALIDES.join(', ');
        const systemPrompt = `Tu es MediBot, assistant medical de MediConnect. Reponds en JSON strict sans markdown:
{"reply":"<reponse empathique en langue du patient>","specialite":"<ENUM ou null>"}
Specialites: ${specialitesList}
- Pose des questions de suivi si besoin (duree, intensite, localisation)
- Donne la specialite apres 2-3 echanges
- Ne donne jamais de diagnostic
- Si question generale sur quel medecin consulter, demande les symptomes`;
        const contents = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: '{"reply":"Bonjour ! Decrivez vos symptomes.","specialite":null}' }] },
            ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
        ];
        for (const url of GEMINI_MODELS) {
            try {
                const res = await axios_1.default.post(`${url}?key=${apiKey}`, { contents, generationConfig: { temperature: 0.4, maxOutputTokens: 512 } }, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 });
                const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                this.logger.log(`Gemini succes avec ${url}`);
                return this.parseGemini(raw);
            }
            catch (e) {
                this.logger.warn(`Gemini ${url} echec: ${e.response?.status}`);
                if ([400, 401, 403].includes(e.response?.status))
                    throw e;
            }
        }
        throw new Error('Gemini indisponible');
    }
    parseGemini(raw) {
        try {
            const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const p = JSON.parse(cleaned);
            return {
                reply: typeof p.reply === 'string' ? p.reply.trim() : "Je n'ai pas pu analyser.",
                specialite: exports.SPECIALITES_VALIDES.includes(p.specialite) ? p.specialite : null,
            };
        }
        catch {
            return { reply: raw.substring(0, 500) || "Je n'ai pas pu analyser.", specialite: null };
        }
    }
    localFallback(messages) {
        const last = [...messages].reverse().find(m => m.role === 'user')?.content?.toLowerCase() ?? '';
        const count = messages.filter(m => m.role === 'user').length;
        if (last.includes('quel medecin') || last.includes('quelle medecin') || last.includes('qui consulter') || last.includes('quel specialiste')) {
            return { reply: `Pour vous orienter, decrivez-moi vos symptomes. Par exemple : "j'ai des douleurs a la poitrine", "j'ai de la fievre", "j'ai mal au ventre"...`, specialite: null };
        }
        if (last.includes('bonjour') || last.includes('salut') || last.includes('hello')) {
            return { reply: `Bonjour ! Je suis MediBot. Decrivez-moi vos symptomes et je vous orienterai vers le bon specialiste.`, specialite: null };
        }
        const rules = [
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
        for (const [keywords, specialite] of rules) {
            if (keywords.some(kw => last.includes(kw))) {
                if (count < 2)
                    return { reply: `Je comprends. Depuis combien de temps ressentez-vous ces symptomes ? Avez-vous d'autres symptomes associes ?`, specialite: null };
                return { reply: `D'apres vos symptomes, je vous recommande de consulter un ${specialite.toLowerCase().replace(/_/g, ' ')}. ${DISCLAIMER}`, specialite };
            }
        }
        if (count < 2)
            return { reply: `Pouvez-vous preciser vos symptomes ? Ou avez-vous mal, depuis combien de temps ?`, specialite: null };
        return { reply: `Je vous recommande de consulter un medecin generaliste. ${DISCLAIMER}`, specialite: 'MEDECIN_FAMILLE' };
    }
    buildGeminiPrompt(messages) { return {}; }
    parseGeminiResponse(raw) { return this.parseGemini(raw); }
    getDisclaimer() { return DISCLAIMER; }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map