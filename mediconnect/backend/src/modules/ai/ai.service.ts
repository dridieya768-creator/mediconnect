import {
  Injectable,
  ServiceUnavailableException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ChatMessageDto } from './dto/analyze-symptoms.dto';

export const SPECIALITES_VALIDES = [
  'CARDIOLOGUE', 'DERMATOLOGUE', 'GYNECOLOGUE', 'NEUROLOGUE',
  'OPHTALMOLOGUE', 'ORL', 'PEDIATRE', 'PSYCHIATRE', 'RHUMATOLOGUE',
  'UROLOGUE', 'CHIRURGIEN', 'ENDOCRINOLOGUE', 'GASTROLOGUE',
  'NEPHROLOGUE', 'ONCOLOGUE', 'PNEUMOLOGUE', 'MEDECIN_FAMILLE',
  'URGENTISTE', 'ANESTHESISTE', 'RADIOLOGUE_SPEC',
] as const;

export type Specialite = typeof SPECIALITES_VALIDES[number];

const DISCLAIMER = '⚠️ Ceci est une aide à l\'orientation uniquement. Consultez toujours un médecin pour un diagnostic.';

// Essayer plusieurs modèles en fallback
const GEMINI_MODELS = [
  'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
];

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {}

  async analyzeSymptoms(messages: ChatMessageDto[]): Promise<{
    reply: string;
    specialite: string | null;
  }> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY non configurée');
      throw new InternalServerErrorException('Service IA non configuré');
    }

    const payload = this.buildGeminiPrompt(messages);

    // Essayer chaque modèle en cascade
    for (const modelUrl of GEMINI_MODELS) {
      try {
        this.logger.log(`Tentative avec: ${modelUrl}`);
        const response = await axios.post(
          `${modelUrl}?key=${apiKey}`,
          payload,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000,
          },
        );
        const rawText: string =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        this.logger.log(`Succès avec: ${modelUrl}`);
        return this.parseGeminiResponse(rawText);
      } catch (err: any) {
        const status = err.response?.status;
        this.logger.warn(`Échec ${modelUrl} — status: ${status} — ${err.message}`);
        if (status === 400 || status === 401 || status === 403) {
          this.logger.error('Erreur clé API: ' + JSON.stringify(err.response?.data));
          // Pas la peine d'essayer les autres modèles si la clé est invalide
          throw new InternalServerErrorException('Erreur de configuration du service IA');
        }
        // 429, 404, timeout → essayer le modèle suivant
        continue;
      }
    }

    // Tous les modèles ont échoué → fallback local
    this.logger.warn('Tous les modèles Gemini indisponibles — utilisation du fallback local');
    return this.localFallback(messages);
  }

  buildGeminiPrompt(messages: ChatMessageDto[]): object {
    const specialitesList = SPECIALITES_VALIDES.join(', ');

    const systemPrompt = `Assistant médical MediConnect. Analyse les symptômes et réponds en JSON: {"reply":"<réponse courte empathique>","specialite":"<ENUM ou null>"}
Spécialités: ${specialitesList}
Règles: réponds dans la langue du patient, ne donne pas de diagnostic, recommande de consulter un médecin.`;

    const contents: any[] = [
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

  parseGeminiResponse(rawText: string): { reply: string; specialite: string | null } {
    try {
      const parsed = JSON.parse(rawText);

      const reply =
        typeof parsed.reply === 'string' && parsed.reply.trim()
          ? parsed.reply.trim()
          : 'Je n\'ai pas pu analyser vos symptômes. Veuillez réessayer.';

      const specialite =
        typeof parsed.specialite === 'string' &&
        (SPECIALITES_VALIDES as readonly string[]).includes(parsed.specialite)
          ? parsed.specialite
          : null;

      return { reply, specialite };
    } catch {
      // Gemini a retourné du texte non-JSON
      return {
        reply: rawText.substring(0, 500) || 'Je n\'ai pas pu analyser vos symptômes. Veuillez réessayer.',
        specialite: null,
      };
    }
  }

  getDisclaimer(): string {
    return DISCLAIMER;
  }

  /**
   * Fallback local quand Gemini est indisponible.
   * Analyse basique par mots-clés pour orienter le patient.
   */
  localFallback(messages: ChatMessageDto[]): { reply: string; specialite: string | null } {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content?.toLowerCase() ?? '';

    const rules: Array<{ keywords: string[]; specialite: Specialite; hint: string }> = [
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
}
